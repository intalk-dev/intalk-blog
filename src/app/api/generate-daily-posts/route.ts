export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { MASTER_SYSTEM_PROMPT } from '@/lib/ai-prompts';
import { backupSinglePost } from '@/lib/auto-backup';
import { searchUnsplashImage, getOptimizedImageUrl } from '@/lib/unsplash';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// Parse structured text response from Claude
function parseStructuredResponse(responseText: string, fallbackTopic: string) {
  const lines = responseText.split('\n');
  let title = fallbackTopic;
  let excerpt = '';
  let tags = '';
  let seoTitle = '';
  let seoDesc = '';
  let coverKeyword = '';
  let contentStartIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i].trim();
    if (line.startsWith('TITLE:')) {
      title = line.replace('TITLE:', '').trim();
    } else if (line.startsWith('EXCERPT:')) {
      excerpt = line.replace('EXCERPT:', '').trim();
    } else if (line.startsWith('TAGS:')) {
      tags = line.replace('TAGS:', '').trim();
    } else if (line.startsWith('SEO_TITLE:')) {
      seoTitle = line.replace('SEO_TITLE:', '').trim();
    } else if (line.startsWith('SEO_DESC:')) {
      seoDesc = line.replace('SEO_DESC:', '').trim();
    } else if (line.startsWith('COVER_KEYWORD:')) {
      coverKeyword = line.replace('COVER_KEYWORD:', '').trim();
    } else if (line === '---') {
      contentStartIndex = i + 1;
      break;
    }
  }

  const content = lines.slice(contentStartIndex).join('\n').trim();

  return { title, excerpt, tags, seoTitle, seoDesc, coverKeyword, content };
}

// Fetch cover image from Unsplash
async function fetchCoverImage(keyword: string, fallbackTitle: string): Promise<string | null> {
  try {
    const query = keyword || fallbackTitle.replace(/[^a-zA-Z\s]/g, '').trim().split(' ').slice(0, 3).join(' ') || 'technology';
    const image = await searchUnsplashImage(query, 'landscape');
    if (image) {
      return getOptimizedImageUrl(image, 1200, 80);
    }
  } catch (e) {
    console.warn('Unsplash image fetch failed:', e);
  }
  return null;
}

// Generate topic ideas using Claude
async function generateTopicIdeas(anthropic: Anthropic): Promise<string[]> {
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `블로그 colemearchy.com의 콘텐츠 전략가로서, 10개의 매력적인 블로그 주제를 생성해주세요.

블로그 스타일 (The Golden Triangle):
1. 바이오해킹 & 최적화된 자아: Wegovy, 정신건강, 피트니스, 케토 등 건강 최적화
2. 스타트업 아키텍트: 성장, SEO, AI, 리더십에 대한 실행 가능한 인사이트 (PM/디자이너 관점)
3. 주권적 마음: 투자, 개인의 자유, 의미 있는 삶 구축

대상 독자: 25-40대 테크/금융/창의 산업 종사자, 삶의 최적화를 추구하는 야심찬 밀레니얼

요구사항:
- 한국어로 작성
- 각 주제는 10-20자 내외, 클릭을 유도하는 제목
- 개인 경험 기반 ("나의", "내가" 등 사용)
- SEO 키워드 포함

각 주제를 한 줄에 하나씩, 번호 없이 출력해주세요. 다른 설명 없이 주제만 10줄로.`
    }],
  });

  const text = result.content[0].type === 'text' ? result.content[0].text : '';
  const topics = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  return topics.slice(0, 10);
}

// Generate a single blog post
async function generateBlogPost(anthropic: Anthropic, topic: string) {
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: MASTER_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `다음 주제로 블로그 포스트를 작성해주세요: "${topic}"

요구사항:
- 한국어로 작성
- 최소 3000자 이상
- 마크다운 형식
- 개인 경험 기반 (PM/디자이너 관점, 개발자 아님)
- SEO 최적화
- "개발자로서", "코드를 짰어요" 같은 표현 절대 금지
- 대신 "PM으로서", "AI 도구를 활용해서", "디자이너 출신으로" 사용

응답 형식 (반드시 지켜주세요):
첫 줄: TITLE: [제목]
둘째 줄: EXCERPT: [요약 1-2문장]
셋째 줄: TAGS: [태그1, 태그2, 태그3]
넷째 줄: SEO_TITLE: [SEO 제목 60자 이내]
다섯째 줄: SEO_DESC: [메타설명 160자 이내]
여섯째 줄: COVER_KEYWORD: [썸네일 이미지 검색용 영어 키워드 2-3단어, 예: productivity workspace, biohacking supplements]
일곱째 줄: ---
나머지: 본문 (마크다운)`
    }],
  });

  return result.content[0].type === 'text' ? result.content[0].text : '';
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    console.log('Starting daily content generation...');

    // Step 1: Generate topic ideas
    console.log('Generating topic ideas...');
    const topics = await generateTopicIdeas(anthropic);
    console.log(`Generated ${topics.length} topics`);

    const generatedPosts = [];
    const failedTopics = [];

    // Step 2: Calculate publish times - 1 hour apart starting from KST 9AM tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow);
    startOfDay.setUTCHours(0, 0, 0, 0); // UTC 0AM = KST 9AM

    const publishTimes = [];
    for (let i = 0; i < 10; i++) {
      const publishTime = new Date(startOfDay);
      publishTime.setUTCHours(i, 0, 0, 0); // UTC 0AM~9AM = KST 9AM~6PM
      publishTimes.push(publishTime);
    }

    // Step 3: Generate content for each topic
    for (let i = 0; i < Math.min(topics.length, 10); i++) {
      const topic = topics[i];
      console.log(`Generating content (${i + 1}/${Math.min(topics.length, 10)}): "${topic}"`);

      try {
        const responseText = await generateBlogPost(anthropic, topic);
        const parsed = parseStructuredResponse(responseText, topic);

        if (parsed.content.length < 2500) {
          console.warn(`Content too short (${parsed.content.length} chars), skipping...`);
          failedTopics.push(topic);
          continue;
        }

        // Fetch cover image from Unsplash
        const coverImage = await fetchCoverImage(parsed.coverKeyword, parsed.title);

        const slug = generateSlug(parsed.title);
        const uniqueSlug = `${slug}-${Date.now()}`;

        const post = await prisma.post.create({
          data: {
            title: parsed.title,
            slug: uniqueSlug,
            content: parsed.content,
            excerpt: parsed.excerpt || parsed.content.substring(0, 160),
            tags: parsed.tags,
            coverImage,
            seoTitle: parsed.seoTitle || parsed.title,
            seoDescription: parsed.seoDesc || parsed.excerpt || parsed.content.substring(0, 160),
            status: 'PUBLISHED',
            author: 'Colemearchy',
            publishedAt: publishTimes[i],
            createdAt: new Date()
          }
        });

        try {
          await backupSinglePost(post.id, 'post-create');
        } catch (backupError) {
          console.warn(`Auto-backup failed for post ${post.id}:`, backupError);
        }

        generatedPosts.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          scheduledAt: publishTimes[i].toISOString(),
          contentLength: parsed.content.length
        });

        console.log(`Generated: "${post.title}" (${parsed.content.length} chars) - Scheduled: ${publishTimes[i].toISOString()}`);
      } catch (error) {
        console.error(`Failed: "${topic}"`, error);
        failedTopics.push(topic);
      }

      // Delay between generations
      if (i < topics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Done! Generated ${generatedPosts.length} posts, ${failedTopics.length} failed`);

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedPosts.length} draft posts`,
      generatedPosts,
      failedTopics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in daily content generation:', error);
    return NextResponse.json({
      error: 'Failed to generate daily content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Daily content generation endpoint is ready',
    timestamp: new Date().toISOString()
  });
}
