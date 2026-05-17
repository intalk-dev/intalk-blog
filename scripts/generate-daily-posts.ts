import Anthropic from '@anthropic-ai/sdk';
import { MASTER_SYSTEM_PROMPT, generateContentPrompt } from '../src/lib/ai-prompts';
import { getWeightedRandomTopics, BlogTopic } from './blog-topics-pool';
import { searchUnsplashImage, getOptimizedImageUrl } from '../src/lib/unsplash';
import { prisma } from '../src/lib/prisma';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Environment variables for configuration
const DRY_RUN = process.env.DRY_RUN === 'true';
const POSTS_PER_DAY = parseInt(process.env.POSTS_PER_DAY || '1'); // 매 크론 실행마다 1개 생성 (매시간 크론 실행)

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

// Map Korean insurance topics to relevant English Unsplash search queries
function getEnglishSearchQuery(category: string, prompt: string): string {
  // 글 제목의 핵심 주제를 영어 검색어로 매핑
  const topicMap: Record<string, string> = {
    // 건강/의료
    '암보험': 'doctor patient hospital consultation',
    '치아': 'dentist dental care smile',
    '실손': 'hospital medical bill healthcare',
    '건강검진': 'medical checkup health screening',
    '수술': 'surgery hospital operating room',
    '입원': 'hospital bed patient care',
    '정신건강': 'mental health therapy counseling',
    '백내장': 'eye care ophthalmology vision',
    '녹내장': 'eye care ophthalmology vision',
    '여성': 'woman healthcare medical',
    '간병': 'elderly care nursing senior',
    '치매': 'elderly care senior support',
    '통원': 'doctor office medical visit',
    // 자동차
    '자동차': 'car driving road safety',
    '전기차': 'electric car EV charging',
    '렌트카': 'rental car keys travel',
    '이륜차': 'motorcycle riding road',
    '오토바이': 'motorcycle helmet safety',
    '교통사고': 'car accident safety road',
    '운전': 'driving car steering wheel',
    '블랙박스': 'dashboard camera car technology',
    '자율주행': 'autonomous driving technology future',
    '침수': 'flood water damage car',
    // 가족/생활
    '신혼': 'newlywed couple happy wedding',
    '어린이': 'happy children family kids',
    '태아': 'pregnancy baby expecting mother',
    '출산': 'newborn baby family happiness',
    '부모님': 'elderly parents family love',
    '1인 가구': 'single living apartment modern',
    '맞벌이': 'professional couple working office',
    '다자녀': 'big family children happy home',
    // 재산/금융
    '화재': 'house home building exterior',
    '전세': 'apartment building real estate',
    '부동산': 'house key real estate property',
    '절세': 'tax documents calculator finance',
    '연금': 'retirement planning piggy bank savings',
    '저축': 'savings money piggy bank finance',
    '연말정산': 'tax return documents calculator',
    // 보험 일반
    '보험료': 'financial planning calculator money',
    '보험 해지': 'contract document signing pen',
    '보험 약관': 'reading document contract terms',
    '보험 분쟁': 'legal documents dispute resolution',
    '보험금 청구': 'paperwork documents filing claim',
    '보험 설계': 'financial advisor meeting consultation',
    '보장분석': 'data analysis charts financial review',
    '승환계약': 'contract signing agreement business',
    '고지의무': 'checklist form medical questionnaire',
    // 특수
    '여행': 'travel airplane passport luggage',
    '펫': 'pet dog veterinary care',
    '반려동물': 'pet dog cat veterinary',
    '골프': 'golf course green sport',
    '배달': 'delivery rider motorcycle scooter',
    '자영업': 'small business shop owner store',
    '프리랜서': 'freelancer laptop working cafe',
    '직장인': 'office worker professional business',
    // 트렌드
    '인슈어테크': 'fintech technology smartphone app',
    '디지털': 'digital technology smartphone modern',
    '빅데이터': 'data analytics technology dashboard',
    '블록체인': 'blockchain technology digital network',
    '웨어러블': 'smartwatch wearable health fitness',
    'MZ세대': 'young professional smartphone modern',
    'ESG': 'sustainability green environment business',
  };

  // 제목에서 매칭되는 키워드 찾기
  for (const [keyword, query] of Object.entries(topicMap)) {
    if (prompt.includes(keyword)) {
      return query;
    }
  }

  // 카테고리 기반 기본값
  const categoryDefaults: Record<string, string> = {
    '생명보험': 'family protection umbrella safety',
    '손해보험': 'home property protection insurance',
    '자동차보험': 'car driving road automobile',
    '건강보험': 'doctor healthcare medical stethoscope',
    '보험 상식': 'documents contract pen signing',
    '보험 트렌드': 'technology innovation digital future',
    '보험 설계': 'financial advisor consultation planning',
  };

  return categoryDefaults[category] || 'insurance financial protection family';
}

// H2 섹션 사이에 Unsplash 인라인 이미지 삽입 (최대 2~3개)
async function insertInlineImages(content: string, category: string, prompt: string): Promise<string> {
  // H2 기준으로 섹션 분리
  const sections = content.split(/(?=^## )/m);

  // H2 섹션이 3개 미만이면 삽입하지 않음 (짧은 글)
  const h2Sections = sections.filter(s => s.startsWith('## '));
  if (h2Sections.length < 3) {
    console.log('   ⏭️  H2 섹션이 3개 미만이라 인라인 이미지 삽입 건너뜀');
    return content;
  }

  // 2번째, 4번째 H2 뒤에 이미지 삽입 (0-indexed로 index 1, 3)
  const insertIndices = [1, 3].filter(i => i < h2Sections.length);
  // 최대 3개로 제한 (5번째 H2가 있으면 추가)
  if (h2Sections.length >= 6) {
    insertIndices.push(5);
  }

  let h2Count = 0;
  const resultSections: string[] = [];
  let imagesInserted = 0;

  for (const section of sections) {
    if (section.startsWith('## ')) {
      h2Count++;
      if (insertIndices.includes(h2Count - 1) && imagesInserted < 3) {
        // 섹션 제목에서 키워드 추출
        const sectionTitle = section.split('\n')[0].replace(/^## /, '').trim();
        const searchQuery = getEnglishSearchQuery(category, sectionTitle + ' ' + prompt);

        // 커버 이미지와 다른 키워드로 검색하기 위해 섹션 제목 우선 사용
        const sectionKeyword = getEnglishSearchQuery(category, sectionTitle);
        const finalQuery = sectionKeyword !== getEnglishSearchQuery(category, prompt)
          ? sectionKeyword
          : searchQuery + ' background';

        console.log(`   🖼️  인라인 이미지 검색 (H2 #${h2Count}): "${finalQuery}"`);

        try {
          const image = await searchUnsplashImage(finalQuery);
          if (image) {
            const imageUrl = getOptimizedImageUrl(image, 800, 75);
            const alt = image.alt_description || image.description || sectionTitle;
            const imageMarkdown = `\n\n![${alt}](${imageUrl})\n`;

            // 첫 번째 문단 뒤에 이미지 삽입
            const lines = section.split('\n');
            const titleLine = lines[0];
            const rest = lines.slice(1).join('\n');

            // 첫 번째 빈 줄(문단 구분) 뒤에 삽입
            const firstParaEnd = rest.indexOf('\n\n');
            if (firstParaEnd !== -1) {
              const beforeImage = rest.substring(0, firstParaEnd);
              const afterImage = rest.substring(firstParaEnd);
              resultSections.push(titleLine + '\n' + beforeImage + imageMarkdown + afterImage);
            } else {
              // 문단 구분이 없으면 섹션 끝에 삽입
              resultSections.push(section + imageMarkdown);
            }

            imagesInserted++;
            console.log(`   ✅ 인라인 이미지 #${imagesInserted} 삽입 (by ${image.user.name})`);
            continue;
          } else {
            console.log(`   ⚠️ 인라인 이미지를 찾지 못했습니다 (H2 #${h2Count})`);
          }
        } catch (error) {
          console.log(`   ⚠️ 인라인 이미지 검색 실패 (H2 #${h2Count}):`, error);
        }
      }
    }
    resultSections.push(section);
  }

  console.log(`   📸 총 ${imagesInserted}개 인라인 이미지 삽입 완료`);
  return resultSections.join('');
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
      model: 'claude-haiku-4-5',
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

    // Step 5.5: Fetch cover image from Unsplash using English keywords
    if (!parsedContent.coverImage) {
      const searchQuery = getEnglishSearchQuery(topic.category, topic.prompt);
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

    // Step 5.7: 본문에 인라인 이미지 삽입 (H2 섹션 사이)
    console.log('🖼️  인라인 이미지 삽입 중...');
    parsedContent.content = await insertInlineImages(
      parsedContent.content || responseText,
      topic.category,
      topic.prompt
    );

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
        author: '인톡보험전문가',
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
  console.log('📝 인톡 파트너스 보험 블로그 포스트 자동 생성 시작...');
  console.log('👤 페르소나: 보험 전문 설계사');
  console.log(`📅 ${POSTS_PER_DAY}개 포스트 생성 (매시간 크론 실행)`);
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
