export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { generateContentPrompt, getSystemInstruction, getRelevantKnowledgeContext } from '@/lib/ai-prompts';
import { env } from '@/lib/env';
import { withErrorHandler, logger, ApiError, createSuccessResponse, validateRequest } from '@/lib/error-handler';
import { generateContentSchema } from '@/lib/validations';
import { generateSlug, generateUniqueSlugWithTimestamp } from '@/lib/utils/slug';
import { detectLanguage } from '@/lib/translation';
import { autoGenerateThumbnailUrl } from '@/lib/utils/thumbnail';
import { tagsToArray, tagsToString } from '@/lib/utils/tags'
import { unwrapContent } from '@/lib/utils/content'
import { checkGeminiRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { verifyAdminAuth } from '@/lib/auth';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

async function generateContentHandler(request: NextRequest) {
  // Validate input data
  const validatedData = await validateRequest(request, generateContentSchema);
  const { prompt, keywords, affiliateProducts, publishDate } = validatedData;

  logger.info('Generating content', {
    promptLength: prompt.length,
    keywordsCount: keywords?.length || 0
  });

  // Step 1 & 2: 키워드 기반 RAG — Knowledge 테이블에서 관련 전문 지식을 가져옴
  // (pgvector 벡터 검색은 Turso 비호환이라 키워드 스코어링 방식 사용)
  const ragContext = await getRelevantKnowledgeContext(
    [prompt, keywords?.join(' ')].filter(Boolean).join('\n')
  );
  logger.info('Knowledge context loaded', { hasContext: ragContext.length > 0 });

  // Step 3a: Temporarily disabled - deduplication check causing issues
  logger.info('Deduplication check temporarily disabled');
    const existingPostsContext = '';

    // Step 4: Claude Haiku로 콘텐츠 생성 (시스템 지침은 프롬프트 캐싱 적용)
    logger.info('Starting Claude content generation');
    const systemInstruction = await getSystemInstruction();
    const userPrompt = `${existingPostsContext}${ragContext}**EXECUTE TASK:**\n\n${generateContentPrompt(prompt, keywords, affiliateProducts)}`;

    logger.info('Calling Claude API');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8192,
      temperature: 0.7,
      system: [
        { type: 'text', text: systemInstruction, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    logger.info('Claude API call successful');
    const firstBlock = message.content[0];
    const responseText = firstBlock?.type === 'text' ? firstBlock.text : '';
    logger.info('Response text length', { length: responseText.length });

    // Step 5: Parse the generated content
    let parsedContent;
    try {
      // Remove markdown code block wrapper if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      parsedContent = JSON.parse(jsonText);

      // IMPORTANT: If parsed content already has a 'content' field,
      // ensure we're using ONLY that content, not the entire JSON
      if (parsedContent.content && typeof parsedContent.content === 'string') {
        // Content is already extracted correctly
      } else if (typeof parsedContent === 'object' && !parsedContent.content) {
        // JSON doesn't have a content field, treat entire text as content
        parsedContent = {
          title: parsedContent.title || prompt.substring(0, 60),
          content: responseText,
          excerpt: parsedContent.excerpt || responseText.substring(0, 160),
          tags: parsedContent.tags || keywords || []
        };
      }
    } catch {
      // If not JSON, wrap in content object
      parsedContent = {
        title: prompt.substring(0, 60),
        content: responseText,
        excerpt: responseText.substring(0, 160),
        tags: keywords || []
      };
    }

    // Step 6: Save to database as draft
    const scheduledAt = publishDate ? new Date(publishDate) : null;

    // Generate unique slug with timestamp (Turso compatibility)
    const slug = generateUniqueSlugWithTimestamp(parsedContent.title || prompt);

    // Auto-detect language from generated content
    const detectedLanguage = detectLanguage(
      (parsedContent.title || prompt) + ' ' + (parsedContent.content || responseText).substring(0, 500)
    );
    logger.info('Language detected for AI-generated content', {
      language: detectedLanguage,
      title: parsedContent.title || prompt
    });

    // Auto-generate thumbnail URL if no coverImage provided
    const postTitle = parsedContent.title || prompt;
    const coverImageUrl = parsedContent.coverImage || autoGenerateThumbnailUrl(postTitle, request);

    logger.info('Thumbnail generation for new post', {
      title: postTitle,
      hasAICoverImage: !!parsedContent.coverImage,
      generatedThumbnailUrl: !parsedContent.coverImage ? coverImageUrl : null
    });

    // TEMPORARY DEBUG: Log tags type and value
    logger.info('DEBUG: tags before conversion', {
      tagsType: typeof parsedContent.tags,
      tagsValue: parsedContent.tags,
      isArray: Array.isArray(parsedContent.tags)
    });

    const post = await prisma.post.create({
      data: {
        title: postTitle,
        slug,
        content: unwrapContent(parsedContent.content || responseText),
        excerpt: parsedContent.excerpt || responseText.substring(0, 160),
        tags: tagsToString(parsedContent.tags || []),
        seoTitle: parsedContent.seoTitle || parsedContent.title,
        seoDescription: parsedContent.seoDescription || parsedContent.excerpt,
        coverImage: coverImageUrl,
        status: 'DRAFT',
        scheduledAt,
        author: 'Colemearchy AI',
        originalLanguage: detectedLanguage
      }
    });

  logger.info('Content generated and saved', {
    postId: post.id,
    slug: post.slug,
    status: post.status
  });

  return createSuccessResponse({
    ...parsedContent,
    id: post.id,
    slug: post.slug,
    status: post.status,
    scheduledAt: post.scheduledAt,
    ragContextUsed: ragContext.length > 0
  }, new URL(request.url).pathname);
}

export async function POST(request: NextRequest) {
  // 🔒 인증 체크 (Admin만 AI 콘텐츠 생성 가능)
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  // 💰 Rate Limiting 체크 (비용 폭탄 방지)
  const rateLimit = checkGeminiRateLimit()
  if (!rateLimit.success) {
    return NextResponse.json(
      createRateLimitResponse(rateLimit.resetTime),
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    )
  }

  return withErrorHandler(generateContentHandler)(request)
}