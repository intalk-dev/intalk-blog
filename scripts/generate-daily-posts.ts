import Anthropic from '@anthropic-ai/sdk';
import { MASTER_SYSTEM_PROMPT, generateContentPrompt } from '../src/lib/ai-prompts';
import { getWeightedRandomTopics, BlogTopic } from './blog-topics-pool';
import { searchUnsplashImage, getOptimizedImageUrl } from '../src/lib/unsplash';
import { prisma } from '../src/lib/prisma';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Environment variables for configuration
const DRY_RUN = process.env.DRY_RUN === 'true';
const POSTS_PER_DAY = parseInt(process.env.POSTS_PER_DAY || '5'); // Reduced from 10 to 5 to avoid Vercel timeout
const HOURS_BETWEEN_POSTS = parseInt(process.env.HOURS_BETWEEN_POSTS || '2');

// Embedding is not available with Claude API - RAG disabled
async function generateEmbedding(_text: string): Promise<number[]> {
  return [];
}

// Search for similar knowledge using vector similarity
async function searchSimilarKnowledge(queryEmbedding: number[], limit: number = 3) {
  if (queryEmbedding.length === 0) return [];

  try {
    const results = await prisma.$queryRaw`
      SELECT id, content, source,
             1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "Knowledge"
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;

    return results as Array<{
      id: string;
      content: string;
      source: string | null;
      similarity: number;
    }>;
  } catch (error) {
    console.warn('⚠️  Knowledge search failed, continuing without RAG:', error);
    return [];
  }
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

async function generateBlogPost(topic: BlogTopic, index: number) {
  try {
    console.log(`\n[${index + 1}/${POSTS_PER_DAY}] Generating post...`);
    console.log(`Topic: ${topic.prompt.substring(0, 70)}...`);
    console.log(`Category: ${topic.category}`);

    // Publish immediately (scheduledAt = now so publish-posts cron picks it up right away)
    const now = new Date();
    const publishDate = now;

    // Full prompt with topic and keywords
    const fullPrompt = generateContentPrompt(
      `"${topic.prompt}"에 대한 보험 전문 블로그 포스트를 작성해주세요.
카테고리: ${topic.category}`,
      topic.keywords,
      []
    );

    console.log('🤖 Calling Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.8,
      system: MASTER_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });

    let responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip markdown code block wrapper if present (```json ... ```)
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    // Step 5: Parse the generated content
    let parsedContent;
    try {
      parsedContent = JSON.parse(responseText);
    } catch {
      // If not JSON, wrap in content object
      parsedContent = {
        title: topic.prompt.substring(0, 60),
        content: responseText,
        excerpt: responseText.substring(0, 160),
        tags: topic.keywords
      };
    }

    // Step 5.5: Fetch cover image from Unsplash using keywords
    if (!parsedContent.coverImage) {
      const searchQuery = topic.keywords.slice(0, 2).join(' ') || topic.category;
      console.log(`🖼️  Unsplash 이미지 검색: "${searchQuery}"`);
      const image = await searchUnsplashImage(searchQuery);
      if (image) {
        parsedContent.coverImage = getOptimizedImageUrl(image, 1080, 75);
        parsedContent.coverImageAlt = image.alt_description || image.description || topic.prompt.substring(0, 100);
        console.log(`   ✅ 이미지 설정 완료 (by ${image.user.name})`);
      } else {
        console.log('   ⚠️ 이미지를 찾지 못했습니다.');
      }
    }

    // Step 6: Save to database as draft (or just log if DRY_RUN)
    if (DRY_RUN) {
      console.log(`\n✅ [DRY RUN] Would create post:`);
      console.log(`   Title: ${parsedContent.title || topic.prompt}`);
      console.log(`   Category: ${topic.category}`);
      console.log(`   Tags: ${(parsedContent.tags || topic.keywords).join(', ')}`);
      console.log(`   Scheduled for: ${publishDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
      console.log(`   Content length: ${(parsedContent.content || responseText).length} chars`);

      return {
        success: true,
        title: parsedContent.title || topic.prompt,
        category: topic.category,
        scheduledAt: publishDate,
        dryRun: true
      };
    }

    const slug = generateSlug(parsedContent.title || topic.prompt);

    const post = await prisma.post.create({
      data: {
        title: parsedContent.title || topic.prompt,
        slug: `${slug}-${Date.now()}`,
        content: parsedContent.content || responseText,
        excerpt: parsedContent.excerpt || responseText.substring(0, 160),
        tags: Array.isArray(parsedContent.tags) ? parsedContent.tags.join(',') : (parsedContent.tags || topic.keywords.join(',')),
        seoTitle: parsedContent.seoTitle || parsedContent.title,
        seoDescription: parsedContent.seoDescription || parsedContent.excerpt,
        coverImage: parsedContent.coverImage,
        status: 'DRAFT',
        scheduledAt: publishDate,
        author: '인톡 파트너스',
        originalLanguage: 'ko'
      }
    });

    console.log(`✅ Success: ${post.title}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Language: ${post.originalLanguage}`);
    console.log(`   Category: ${topic.category}`);
    console.log(`   Scheduled for: ${publishDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
    console.log(`   URL: https://blog.intalkpartners.com/ko/posts/${post.slug}`);

    return { success: true, ...post, category: topic.category };
  } catch (error) {
    console.error(`❌ Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      topic: topic.prompt
    };
  }
}

async function main() {
  console.log('📝 인톡 파트너스 일일 보험 블로그 포스트 자동 생성 시작...');
  console.log('👤 페르소나: 보험 전문 설계사');
  console.log(`📅 ${HOURS_BETWEEN_POSTS}시간 간격으로 ${POSTS_PER_DAY}개 예약 발행`);
  console.log('🇰🇷 한국어로 작성');
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE: 실제로 DB에 저장하지 않습니다\n');
  } else {
    console.log('💾 LIVE MODE: DB에 실제로 저장합니다\n');
  }

  // Get recently used topics to avoid duplicates (last 30 days)
  console.log('🔍 최근 30일간 생성된 주제 확인 중...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPosts = await prisma.post.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      youtubeVideoId: null
    },
    select: { title: true }
  });
  const excludePrompts = recentPosts.map(post => post.title);
  console.log(`   최근 ${recentPosts.length}개 주제 제외\n`);

  const selectedTopics = getWeightedRandomTopics(POSTS_PER_DAY, excludePrompts);

  // Show selected topics
  console.log('📋 선택된 주제:');
  selectedTopics.forEach((topic, i) => {
    console.log(`   ${i + 1}. [${topic.category}] ${topic.prompt.substring(0, 60)}...`);
  });
  console.log('\n');

  const results = {
    successful: [] as any[],
    failed: [] as any[]
  };

  for (let i = 0; i < selectedTopics.length; i++) {
    const result = await generateBlogPost(selectedTopics[i], i);

    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }

    // Wait between posts to avoid rate limiting
    if (i < selectedTopics.length - 1) {
      const waitTime = 5;
      console.log(`⏳ Waiting ${waitTime} seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
  }

  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.successful.length > 0) {
    console.log('\n✅ 성공적으로 생성된 포스트:');

    // Group by category
    const byCategory = results.successful.reduce((acc, post) => {
      const cat = post.category || 'Unknown';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(post);
      return acc;
    }, {} as Record<string, any[]>);

    (Object.entries(byCategory) as [string, any[]][]).forEach(([category, posts]) => {
      console.log(`\n  📂 ${category} (${posts.length}개):`);
      posts.forEach((post: any) => {
        console.log(`    - ${post.title || post.topic}`);
        if (post.scheduledAt && !DRY_RUN) {
          console.log(`      예약 발행: ${new Date(post.scheduledAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
        }
      });
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ 실패한 포스트:');
    results.failed.forEach((f: any) => {
      console.log(`  - ${f.topic?.substring(0, 60)}...`);
      console.log(`    Error: ${f.error}`);
    });
  }

  return {
    success: results.successful.length,
    failed: results.failed.length,
    dryRun: DRY_RUN,
    errors: results.failed.map((f: any) => f.error).filter(Boolean)
  };
}

// Execute if called directly
if (require.main === module) {
  main()
    .then((result) => {
      console.log(`\n🎉 작업 완료: ${result.success}개 성공, ${result.failed}개 실패`);
      if (result.dryRun) {
        console.log('🧪 DRY RUN 모드였습니다. 실제로는 저장되지 않았습니다.');
      }
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ 치명적 오류:', error);
      process.exit(1);
    })
    .finally(() => { /* shared prisma client handles its own lifecycle */ });
}

export { main as generateDailyPosts };
