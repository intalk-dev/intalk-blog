/**
 * Threads to Blog conversion service
 * Converts Threads posts into full blog posts using Gemini AI
 * Follows the same pattern as youtube-to-blog-service.ts
 */

import { prisma } from '@/lib/prisma'
import { MASTER_SYSTEM_PROMPT } from '@/lib/ai-prompts'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'
import { logger, ApiError } from '@/lib/error-handler'
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug'
import { detectLanguage } from '@/lib/translation'
import { backupSinglePost } from '@/lib/auto-backup'
import { findMatchingProducts } from '@/lib/utils/affiliate-product-matcher'
import { injectAffiliateLinks } from '@/lib/utils/affiliate-link-injector'
import { extractHashtags, extractExcerpt } from '@/lib/threads'
import type { ThreadsPost } from '@/types/threads'

// Lazy-initialized Anthropic client
let _anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (_anthropic) return _anthropic
  if (!env.ANTHROPIC_API_KEY) throw new ApiError(500, 'ANTHROPIC_API_KEY not configured')
  _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  return _anthropic
}

export interface ConvertThreadToBlogOptions {
  threadPost: ThreadsPost
  accountName: string
  autoPublish?: boolean
}

export interface ConvertThreadToBlogResult {
  post: {
    id: string
    slug: string
    title: string
    status: string
  }
}

const MIN_TEXT_LENGTH = 50

/**
 * Convert a Threads post to a blog post using AI
 */
export async function convertThreadToBlog(
  options: ConvertThreadToBlogOptions
): Promise<ConvertThreadToBlogResult> {
  const { threadPost, accountName, autoPublish = false } = options

  if (!threadPost.text || threadPost.text.length < MIN_TEXT_LENGTH) {
    throw new ApiError(
      400,
      `Threads post text is too short (min ${MIN_TEXT_LENGTH} chars). Got ${threadPost.text?.length || 0} chars.`
    )
  }

  logger.info('Processing Threads post', {
    threadsPostId: threadPost.id,
    accountName,
    autoPublish,
    textLength: threadPost.text.length,
  })

  // Check if post already converted
  const existingPost = await prisma.post.findFirst({
    where: { threadsPostId: threadPost.id },
  })

  if (existingPost) {
    logger.warn('Threads post already converted', {
      threadsPostId: threadPost.id,
      postId: existingPost.id,
    })
    throw new ApiError(409, 'Threads post already converted to blog', {
      postId: existingPost.id,
      slug: existingPost.slug,
    })
  }

  // Extract metadata from the Threads post
  const hashtags = extractHashtags(threadPost.text)
  const excerpt = extractExcerpt(threadPost.text, 300)
  const hasMedia = threadPost.media_type !== 'TEXT_POST' && !!threadPost.media_url

  logger.info('Threads post metadata', {
    hashtags,
    mediaType: threadPost.media_type,
    hasMedia,
    username: threadPost.username,
  })

  // Generate blog content using Claude
  const anthropic = getAnthropic()

  const blogPrompt = `
${MASTER_SYSTEM_PROMPT}

SPECIAL TASK: Transform the following Threads (social media) post into a full, polished blog post.
The original post is a short-form insight/opinion. Your job is to expand it into a comprehensive blog article
while preserving the original voice and key message.

THREADS POST INFO:
- Author: ${threadPost.username}
- Posted: ${threadPost.timestamp}
- Media Type: ${threadPost.media_type}
- Original URL: ${threadPost.permalink}
${hashtags.length > 0 ? `- Hashtags: ${hashtags.map(t => '#' + t).join(' ')}` : ''}

ORIGINAL POST TEXT:
${threadPost.text}

REQUIREMENTS:
1. Create an engaging SEO-optimized title (max 100 chars) that captures the core message
2. Write a compelling excerpt (2-3 sentences)
3. Expand the short post into a full blog article (1000-2000 chars minimum)
   - Add context, examples, and deeper analysis
   - Structure with proper H2/H3 headings
   - Keep the original voice and perspective
4. Include the original Threads post link naturally at the end
5. Generate 3-5 relevant tags
6. Optimize for SEO

IMPORTANT:
- The blog should stand alone as valuable content without needing to read the original post
- Don't just pad the content - add genuine insights and value
- Maintain the author's perspective and tone
- Write in the same language as the original post

OUTPUT FORMAT (JSON only, no markdown code blocks):
{
  "title": "Engaging SEO title (max 100 chars)",
  "excerpt": "2-3 sentence compelling summary",
  "content": "Full markdown content",
  "tags": ["tag1", "tag2", "tag3"],
  "seoTitle": "SEO optimized title",
  "seoDescription": "SEO meta description (max 160 chars)"
}
  `.trim()

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 8192,
    messages: [{ role: 'user', content: blogPrompt }],
  })
  const firstBlock = message.content[0]
  const responseText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let generatedData
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      generatedData = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('No JSON found in AI response')
    }
  } catch (error) {
    logger.warn('Failed to parse AI response as JSON, using fallback', {
      threadsPostId: threadPost.id,
    })
    generatedData = {
      title: `${threadPost.text.substring(0, 60)}...`,
      excerpt: excerpt,
      content: `${threadPost.text}\n\n---\n\n*[원본 Threads 글 보기](${threadPost.permalink})*`,
      tags: hashtags.length > 0 ? hashtags.slice(0, 5) : ['Threads', '인사이트'],
      seoTitle: `${threadPost.text.substring(0, 60)}`,
      seoDescription: excerpt,
    }
  }

  // Ensure title is not too long
  let title = generatedData.title || threadPost.text.substring(0, 60)
  if (title.length > 100) {
    title = title.substring(0, 97) + '...'
  }

  // Append original Threads link to content if not already present
  let finalContent = generatedData.content || threadPost.text
  if (!finalContent.includes(threadPost.permalink)) {
    finalContent += `\n\n---\n\n*[원본 Threads 글 보기](${threadPost.permalink})*`
  }

  // Generate slug
  const baseSlug = generateSlug(title, 60)
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const existing = await prisma.post.findUnique({ where: { slug: s } })
    return !!existing
  })

  // Merge tags
  const baseTags = ['Threads']
  const tags = [
    ...new Set([
      ...baseTags,
      ...hashtags.slice(0, 3),
      ...(generatedData.tags || []),
    ]),
  ].slice(0, 7)

  // Auto-detect language
  const detectedLanguage = detectLanguage(
    title + ' ' + finalContent.substring(0, 500)
  )
  logger.info('Language detected', { language: detectedLanguage, title })

  // Affiliate product matching
  try {
    const matchedProducts = await findMatchingProducts(
      title,
      finalContent,
      tags,
      20,
      2
    )

    if (matchedProducts.length > 0) {
      logger.info('Affiliate products matched', {
        count: matchedProducts.length,
        products: matchedProducts.map(p => p.name),
      })
      finalContent = injectAffiliateLinks(finalContent, matchedProducts)
    }
  } catch (affiliateError) {
    logger.warn('Affiliate link injection failed', { error: affiliateError })
  }

  // Use media_url as cover image if available
  const coverImage = hasMedia ? threadPost.media_url : undefined

  // Create post in DB
  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content: finalContent,
      excerpt:
        generatedData.excerpt ||
        excerpt ||
        `${threadPost.username}의 Threads 글을 바탕으로 작성된 블로그 포스트입니다.`,
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      author: '인톡보험전문가',
      status: autoPublish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: autoPublish ? new Date() : null,
      threadsPostId: threadPost.id,
      coverImage: coverImage || null,
      seoTitle: generatedData.seoTitle || title,
      seoDescription: generatedData.seoDescription || generatedData.excerpt,
      originalLanguage: detectedLanguage,
    },
  })

  logger.info('Blog post created from Threads post', {
    postId: post.id,
    slug: post.slug,
    status: post.status,
    threadsPostId: threadPost.id,
  })

  // Auto-backup
  try {
    await backupSinglePost(post.id, 'post-create')
    logger.info('Auto-backup completed for new post', { postId: post.id })
  } catch (backupError) {
    logger.warn('Auto-backup failed but post creation succeeded', {
      postId: post.id,
      error: backupError,
    })
  }

  return {
    post: {
      id: post.id,
      slug: post.slug,
      title: post.title,
      status: post.status,
    },
  }
}
