// Generate 10 blog posts with diverse Colemearchy themes
const blogTopics = [
  {
    prompt: "AI 시대에도 살아남는 개발자가 되는 법. 10년차 개발자가 말하는 AI와 공존하며 성장하는 전략. ChatGPT, Claude, Cursor를 활용한 실전 사례와 차별화 방법",
    keywords: ["AI 시대", "개발자 생존", "ChatGPT", "Claude", "Cursor", "개발자 차별화"]
  },
  {
    prompt: "ADHD 개발자의 극한 집중력 해킹법. 산만함을 슈퍼파워로 바꾼 개인적 경험과 과학적 근거. 포모도로, 노이즈 캔슬링, 약물치료까지",
    keywords: ["ADHD", "프로그래밍", "집중력", "생산성", "포모도로", "노이즈캔슬링"]
  },
  {
    prompt: "개발자를 위한 FIRE 운동 실전 가이드. 연봉 1억 개발자가 경제적 자유를 달성한 투자 전략. 주식, 부동산, 암호화폐 포트폴리오 공개",
    keywords: ["FIRE", "개발자 투자", "경제적 자유", "주식", "부동산", "암호화폐"]
  },
  {
    prompt: "개발자 생산성 200% 올리는 바이오해킹 전략. 수면 최적화, 영양제 스택, 간헐적 단식부터 콜드 샤워까지. 6개월 실험 결과 공개",
    keywords: ["바이오해킹", "개발자 생산성", "수면 최적화", "영양제", "간헐적 단식"]
  },
  {
    prompt: "스타트업 CTO가 되기까지의 여정과 리더십 철학. 실패한 3개의 스타트업에서 배운 교훈과 성공하는 기술 조직 만들기",
    keywords: ["스타트업 CTO", "리더십", "기술 조직", "스타트업 실패", "팀 빌딩"]
  },
  {
    prompt: "ChatGPT vs Claude vs Gemini 개발자를 위한 실전 비교. 코드 리뷰, 아키텍처 설계, 디버깅까지 6개월 사용 후기와 최적 활용법",
    keywords: ["ChatGPT", "Claude", "Gemini", "AI 도구", "개발 생산성"]
  },
  {
    prompt: "코딩으로 망가진 목과 허리 되살리기. 거북목과 허리 디스크에서 탈출한 개발자의 3개월 재활기. 스탠딩 데스크부터 요가까지",
    keywords: ["거북목", "허리 디스크", "개발자 건강", "스탠딩 데스크", "요가"]
  },
  {
    prompt: "위고비에서 케토까지, 개발자의 체중 감량 실험기. 3개월간 15kg 감량하며 배운 것들. 부작용과 리바운드 극복법",
    keywords: ["위고비", "케토", "체중 감량", "개발자 다이어트", "간헐적 단식"]
  },
  {
    prompt: "리모트 워크 3년, 낭만과 현실 사이. 디지털 노마드의 꿈과 실제 경험한 장단점. 생산성, 커뮤니케이션, 워라밸의 진실",
    keywords: ["리모트 워크", "재택근무", "디지털 노마드", "워라밸", "생산성"]
  },
  {
    prompt: "부트캠프 vs CS 학위, 10년차 개발자가 말하는 진실. 실무에서 정말 중요한 것과 학력의 한계. 채용 담당자의 속마음",
    keywords: ["부트캠프", "CS 학위", "개발자 교육", "채용", "실무 경험"]
  }
];

async function generateBlogPost(topic, index) {
  try {
    console.log(`\n[${index + 1}/${blogTopics.length}] Generating post...`);
    console.log(`Topic: ${topic.prompt.substring(0, 50)}...`);
    
    const response = await fetch('http://localhost:3001/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `colemearchy 스타일로 ${topic.prompt}에 대한 깊이 있는 블로그 포스트 작성`,
        keywords: topic.keywords,
        type: 'blog-post'
      })
    });

    const data = await response.json();
    
    if (data.id) {
      // Add timestamp to ensure unique slug
      const timestamp = Date.now() + Math.floor(Math.random() * 10000);
      const uniqueSlug = data.slug + '-' + timestamp;
      
      // Publish the post
      const publishResponse = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slug: uniqueSlug,
          status: 'PUBLISHED',
          originalLanguage: 'ko'
        })
      });
      
      const publishedPost = await publishResponse.json();
      
      if (publishedPost.id) {
        console.log(`✅ Success: ${data.title}`);
        console.log(`   URL: http://localhost:3001/ko/posts/${publishedPost.slug}`);
        return { success: true, ...publishedPost };
      }
    }
    
    console.error(`❌ Failed to generate post`);
    return { success: false, error: 'Generation failed' };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('📝 Generating 10 Colemearchy-style blog posts...');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < blogTopics.length; i++) {
    const result = await generateBlogPost(blogTopics[i], i);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push({ ...blogTopics[i], error: result.error });
    }
    
    // Wait between posts
    if (i < blogTopics.length - 1) {
      console.log('⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.successful.length > 0) {
    console.log('\nSuccessfully created posts:');
    results.successful.forEach(s => {
      console.log(`- ${s.title}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\nFailed posts:');
    results.failed.forEach(f => {
      console.log(`- ${f.prompt.substring(0, 50)}...`);
    });
  }
}

main().catch(console.error);