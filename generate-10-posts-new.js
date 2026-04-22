const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 10 new blog topics
const blogTopics = [
  {
    title: "Claude 3.5 vs GPT-4: 실제 사용 후기와 최적 활용법",
    keywords: ["Claude", "GPT-4", "AI 비교", "생산성", "프롬프트 엔지니어링"],
    prompt: "Claude 3.5와 GPT-4를 6개월간 매일 사용하면서 느낀 실제 차이점과 각각의 최적 활용 시나리오. 코딩, 글쓰기, 분석 작업별 장단점 비교"
  },
  {
    title: "개발자가 알려주는 Cursor IDE 200% 활용법",
    keywords: ["Cursor IDE", "AI 코딩", "개발 도구", "생산성", "VSCode"],
    prompt: "Cursor IDE로 코딩 속도 3배 높이기. 실제 프로젝트에서 사용한 팁과 트릭, 그리고 AI와 함께 일하는 새로운 개발 패러다임"
  },
  {
    title: "월 5000만원 버는 1인 SaaS 창업자의 하루 루틴",
    keywords: ["SaaS", "창업", "루틴", "생산성", "1인 기업"],
    prompt: "아침 5시 기상부터 밤 10시 마감까지, 효율적인 시간 관리와 집중력 유지 비법. 도구, 습관, 그리고 번아웃 예방법"
  },
  {
    title: "AGI 시대 대비: 개발자가 준비해야 할 5가지",
    keywords: ["AGI", "미래 준비", "AI", "커리어", "스킬셋"],
    prompt: "인공일반지능(AGI) 시대가 오기 전에 개발자가 반드시 갖춰야 할 역량과 마인드셋. 기술적 스킬과 소프트 스킬의 균형"
  },
  {
    title: "Perplexity로 리서치 시간 90% 단축하기",
    keywords: ["Perplexity", "리서치", "AI 검색", "정보 수집", "효율성"],
    prompt: "기존 구글 검색의 한계를 넘어서는 Perplexity 활용법. 개발, 투자, 시장 조사에서의 실전 활용 사례"
  },
  {
    title: "개발자의 두뇌 최적화: 뉴로피드백과 바이오해킹",
    keywords: ["뉴로피드백", "바이오해킹", "뇌 최적화", "집중력", "생산성"],
    prompt: "EEG 디바이스부터 보충제까지, 과학적으로 검증된 인지 능력 향상법. 3개월 실험 결과와 데이터 공유"
  },
  {
    title: "Web3에서 Web5로: 탈중앙화의 진짜 미래",
    keywords: ["Web5", "Web3", "탈중앙화", "블록체인", "미래 기술"],
    prompt: "Web3의 한계와 Jack Dorsey가 제안하는 Web5의 비전. 개발자 관점에서 본 실현 가능성과 준비 방법"
  },
  {
    title: "AI 에이전트 시대의 소득 불평등과 해법",
    keywords: ["AI 에이전트", "소득 불평등", "UBI", "미래 경제", "사회 변화"],
    prompt: "AI가 대부분의 일을 대체하는 시대, 개인이 준비할 수 있는 현실적인 대안과 새로운 기회"
  },
  {
    title: "개발자를 위한 스토아 철학: 코드와 인생의 균형",
    keywords: ["스토아 철학", "개발자", "멘탈 관리", "철학", "삶의 균형"],
    prompt: "마르쿠스 아우렐리우스부터 라이언 홀리데이까지, 2000년 된 지혜를 현대 개발자의 삶에 적용하기"
  },
  {
    title: "Anthropic의 Constitutional AI가 바꿀 미래",
    keywords: ["Constitutional AI", "Anthropic", "AI 안전성", "AI 윤리", "기술 트렌드"],
    prompt: "Claude를 만든 Anthropic의 혁신적인 AI 훈련 방법론과 이것이 AI 산업에 미칠 영향. 개발자가 알아야 할 핵심 개념"
  }
];

// Generate slug from title
function generateSlug(title) {
  if (!title) {
    return `post-${Date.now()}`;
  }
  
  // Korean to English slug conversion
  const slugMap = {
    'vs': 'vs',
    '활용법': 'guide',
    '비교': 'comparison',
    '루틴': 'routine',
    '준비': 'preparation',
    '최적화': 'optimization',
    '미래': 'future',
    '시대': 'era',
    '해법': 'solution',
    '균형': 'balance'
  };

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim();

  // Try to create meaningful English slug
  for (const [korean, english] of Object.entries(slugMap)) {
    slug = slug.replace(new RegExp(korean, 'g'), english);
  }

  // If still has Korean, use transliteration or timestamp
  if (/[가-힣]/.test(slug)) {
    slug = `post-${Date.now()}`;
  } else {
    slug = slug
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
  }

  return slug;
}

async function generateBlogPost(topic, index) {
  try {
    console.log(`\n[${index + 1}/10] Generating: ${topic.title}`);
    
    // Calculate publish date (2 hours apart)
    const now = new Date();
    const publishDate = new Date(now.getTime() + (index + 1) * 2 * 60 * 60 * 1000);
    
    // Generate content
    const prompt = `
당신은 Colemearchy 블로그의 AI 콘텐츠 작성자입니다.

블로그 스타일:
- 톤: 날것의 솔직함, 지적이면서 약간 반항적, 분석적
- 개인적 경험과 전문적 통찰력의 조화
- 실용적이고 실행 가능한 조언 제공

주제: ${topic.title}
키워드: ${topic.keywords.join(', ')}

요청사항: ${topic.prompt}

다음 형식의 JSON으로 블로그 포스트를 작성해주세요:

{
  "title": "매력적이고 SEO 최적화된 제목",
  "content": "마크다운 형식의 본문 (최소 2000자 이상, 개인적 경험과 실전 팁 포함)",
  "excerpt": "포스트 요약 (150자 내외)",
  "seoTitle": "검색 엔진용 제목 (60자 이내)",
  "seoDescription": "검색 엔진용 설명 (160자 이내)",
  "tags": ["태그1", "태그2", ...],
  "coverImage": null
}

본문 작성 시 다음을 포함해주세요:
1. 개인적인 경험이나 일화로 시작
2. 문제 정의와 왜 중요한지
3. 구체적인 해결 방법이나 인사이트 (번호 리스트나 불릿 포인트 활용)
4. 실전에서 바로 적용할 수 있는 팁
5. 미래 전망이나 개인적인 의견으로 마무리

마크다운 형식을 적극 활용하여 가독성을 높여주세요.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });

    let generatedContent;
    try {
      generatedContent = JSON.parse(result.response.text());
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      console.error('Response:', result.response.text());
      throw new Error('Invalid JSON response from AI');
    }
    
    // Validate required fields
    if (!generatedContent.title || !generatedContent.content) {
      throw new Error('Missing required fields in generated content');
    }
    
    // Create unique slug
    const baseSlug = generateSlug(generatedContent.title);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;
    
    // Save to database
    const post = await prisma.post.create({
      data: {
        title: generatedContent.title,
        slug: uniqueSlug,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        tags: generatedContent.tags || topic.keywords,
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        coverImage: generatedContent.coverImage,
        status: 'DRAFT',
        scheduledAt: publishDate,
        author: 'Colemearchy',
        originalLanguage: 'ko',
        publishedAt: null
      }
    });

    console.log(`✅ Success: ${post.title}`);
    console.log(`   Scheduled for: ${publishDate.toLocaleString()}`);
    
    return { success: true, post };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('📝 Generating 10 Colemearchy blog posts...\n');
  
  const results = [];
  
  for (let i = 0; i < blogTopics.length; i++) {
    const result = await generateBlogPost(blogTopics[i], i);
    results.push(result);
    
    // Wait to avoid rate limiting
    if (i < blogTopics.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n🔗 View posts at:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   https://colemearchy.com/posts/${r.post.slug}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());