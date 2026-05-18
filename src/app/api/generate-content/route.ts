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
import { searchUnsplashImage, getOptimizedImageUrl, extractImageKeywords } from '@/lib/unsplash';
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

    // 응답이 max_tokens 한도로 잘리면 JSON이 깨짐 → 깨진 글 저장 방지
    if (message.stop_reason === 'max_tokens') {
      throw new ApiError(502, 'AI 응답이 토큰 한도로 잘렸습니다. 다시 시도해 주세요.');
    }

    // Step 5: Parse the generated content
    // 파싱 실패 시 원본 JSON을 본문으로 저장하면 마크다운이 깨지므로, 에러로 중단
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonText);
    } catch {
      throw new ApiError(502, 'AI 응답을 JSON으로 파싱하지 못했습니다. 다시 시도해 주세요.');
    }
    if (!parsedContent || typeof parsedContent.content !== 'string' || !parsedContent.content.trim()) {
      throw new ApiError(502, 'AI 응답에 본문(content)이 없습니다. 다시 시도해 주세요.');
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

    // 커버 이미지: AI 제공 → Unsplash 검색 → 자동 생성(OG) 폴백
    const postTitle = parsedContent.title || prompt;
    let coverImageUrl: string = parsedContent.coverImage || '';
    let coverImageSource = parsedContent.coverImage ? 'ai' : 'none';

    if (!coverImageUrl) {
      try {
        const unsplashImage = await searchUnsplashImage(extractImageKeywords(postTitle), 'landscape');
        if (unsplashImage) {
          coverImageUrl = getOptimizedImageUrl(unsplashImage, 1200, 80);
          coverImageSource = 'unsplash';
        }
      } catch (e) {
        console.warn('Unsplash 썸네일 검색 실패:', e);
      }
    }
    if (!coverImageUrl) {
      // Unsplash 실패 시 OG 이미지 자동 생성으로 폴백
      coverImageUrl = autoGenerateThumbnailUrl(postTitle, request);
      coverImageSource = 'auto-generate';
    }

    logger.info('Thumbnail generation for new post', {
      title: postTitle,
      source: coverImageSource,
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
        author: '인톡보험전문가',
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