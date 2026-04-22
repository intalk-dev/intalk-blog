const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const blogTopics = [
  "개발자가 알아야 할 마이크로 SaaS 아이디어 10가지",
  "Supabase vs Firebase: 2025 최신 비교 분석",
  "AI 코드 리뷰어 활용법: PR 품질 200% 높이기",
  "개발자의 사이드 프로젝트를 수익화하는 7가지 전략",
  "Vercel의 숨겨진 기능들: 무료 티어 200% 활용하기",
  "개발자를 위한 투자 가이드: 테크 주식부터 크립토까지",
  "오픈소스 기여로 취업하기: 실전 가이드",
  "개발자의 멘탈 관리: 번아웃 예방과 회복법",
  "Rust가 시스템 프로그래밍의 미래인 이유",
  "개발자가 꼭 알아야 할 클라우드 비용 최적화 전략"
];

function generateSlug(title) {
  const timestamp = Date.now();
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 40);
  
  return `${cleanTitle || 'post'}-${timestamp}`;
}

async function generateBlogPost(title, index) {
  try {
    console.log(`\n[${index + 1}/10] Generating: ${title}`);
    
    // Schedule for tomorrow, starting at 9 AM KST
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM
    
    // Add 2 hours for each subsequent post
    const publishDate = new Date(tomorrow.getTime() + index * 2 * 60 * 60 * 1000);
    
    const prompt = `당신은 Colemearchy 블로그의 작가입니다.

제목: ${title}

이 주제로 블로그 글을 작성해주세요:

요구사항:
1. 마크다운 형식으로 작성
2. 최소 2000자 이상
3. 개인적인 경험과 실전 팁 포함
4. 실용적이고 구체적인 내용
5. 코드 예시나 실제 사례 포함
6. 데이터나 통계 인용 시 출처 명시

스타일:
- 솔직하고 직설적인 톤
- 전문적이면서도 친근한 어투
- 실제 경험을 바탕으로 한 조언
- 약간의 유머와 위트

구조:
1. 흥미로운 도입부 (개인적 경험이나 충격적인 통계)
2. 문제 정의와 왜 이게 중요한지
3. 구체적인 해결 방법 (단계별, 실전 예시 포함)
4. 함정과 주의사항
5. 미래 전망과 actionable 조언으로 마무리

특별 요청:
- 실제 툴이나 서비스 이름 언급
- 구체적인 숫자나 지표 제시
- 개인적인 실패 경험도 포함

마크다운 본문만 작성해주세요. JSON이나 다른 형식은 사용하지 마세요.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      }
    });
    
    const content = result.response.text();
    
    // Extract first paragraph as excerpt
    const excerptMatch = content.match(/[^#\n].*?[.!?]/);
    const excerpt = excerptMatch ? excerptMatch[0].substring(0, 160) : content.substring(0, 160);
    
    const slug = generateSlug(title);
    
    const post = await prisma.post.create({
      data: {
        title: title,
        slug: slug,
        content: content,
        excerpt: excerpt,
        tags: ["AI", "개발", "생산성", "기술", "스타트업"],
        seoTitle: title.substring(0, 60),
        seoDescription: excerpt.substring(0, 160),
        status: 'DRAFT',
        scheduledAt: publishDate,
        author: 'Colemearchy',
        originalLanguage: 'ko',
        publishedAt: null
      }
    });

    console.log(`✅ Success: ${post.title}`);
    console.log(`   Scheduled for: ${publishDate.toLocaleString()}`);
    console.log(`   URL: https://colemearchy.com/posts/${post.slug}`);
    
    return { success: true, post };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('📝 Generating 10 blog posts for tomorrow...\n');
  console.log('📅 Posts will be scheduled starting tomorrow at 9 AM KST, 2 hours apart\n');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < blogTopics.length; i++) {
    const result = await generateBlogPost(blogTopics[i], i);
    
    if (result.success) {
      results.successful.push(result.post);
    } else {
      results.failed.push({ title: blogTopics[i], error: result.error });
    }
    
    // Wait between requests to avoid rate limiting
    if (i < blogTopics.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.successful.length > 0) {
    console.log('\n🔗 Created posts (scheduled for tomorrow):');
    results.successful.forEach(p => {
      console.log(`   ${p.title}`);
      console.log(`     → ${new Date(p.scheduledAt).toLocaleString()}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed posts:');
    results.failed.forEach(f => {
      console.log(`   ${f.title}`);
      console.log(`     Error: ${f.error}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());