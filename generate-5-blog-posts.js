// Generate 5 blog posts with Colemearchy themes
const blogTopics = [
  {
    prompt: "프로그래머의 번아웃을 극복하는 과학적 방법. 개인적인 경험과 뇌과학 연구를 바탕으로 ADHD 개발자가 번아웃에서 회복한 이야기",
    keywords: ["번아웃", "프로그래머", "ADHD", "정신건강", "뇌과학"]
  },
  {
    prompt: "코딩으로 인한 목 통증과 거북목 완전 정복기. 6개월간 시도한 모든 방법과 최종적으로 효과를 본 3가지 솔루션",
    keywords: ["목통증", "거북목", "프로그래머 건강", "인체공학", "스트레칭"]
  },
  {
    prompt: "스타트업 CTO가 말하는 진짜 AI 도구 활용법. ChatGPT, Claude, Cursor로 개발 생산성 5배 높이기",
    keywords: ["AI 도구", "ChatGPT", "Claude", "Cursor", "개발 생산성"]
  },
  {
    prompt: "투자로 경제적 자유를 얻는 개발자의 로드맵. 월급의 50%를 투자하며 배운 현실적인 FIRE 전략",
    keywords: ["FIRE", "투자", "경제적 자유", "개발자 투자", "주식"]
  },
  {
    prompt: "아침형 인간이 되기 위한 과학적 접근법. 새벽 5시 기상을 6개월간 유지하며 얻은 인사이트",
    keywords: ["아침형 인간", "수면과학", "생산성", "루틴", "바이오해킹"]
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
        prompt: topic.prompt,
        keywords: topic.keywords,
        type: 'blog-post'
      })
    });

    const data = await response.json();
    
    if (data.id) {
      // Publish the post
      const publishResponse = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
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
  console.log('📝 Generating 5 blog posts...');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < blogTopics.length; i++) {
    const result = await generateBlogPost(blogTopics[i], i);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Wait between posts
    if (i < blogTopics.length - 1) {
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
}

main().catch(console.error);