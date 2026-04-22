// Generate 5 simple blog posts
async function generateSimplePost(index) {
  const topics = [
    'AI 시대 개발자의 생존 전략과 차별화 방법',
    '리모트 워크 3년차가 말하는 진짜 장단점',
    '부트캠프 vs 대학 CS - 실무 개발자가 말하는 진실',
    'Web3와 블록체인 - 개발자가 알아야 할 미래 기술',
    '개발자 연봉 협상의 모든 것 - 실전 가이드'
  ];

  try {
    console.log(`[${index + 1}/5] Creating post about: ${topics[index]}`);
    
    // First generate content
    const genResponse = await fetch('http://localhost:3001/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `colemearchy 스타일로 ${topics[index]}에 대한 깊이 있는 블로그 포스트 작성`,
        type: 'blog-post'
      })
    });

    const generated = await genResponse.json();
    
    if (!generated.title) {
      console.error('Failed to generate content');
      return false;
    }

    // Add timestamp to ensure unique slug
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const uniqueSlug = generated.slug + '-' + timestamp;

    // Create post with unique slug
    const postResponse = await fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...generated,
        slug: uniqueSlug,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        originalLanguage: 'ko'
      })
    });

    const result = await postResponse.json();
    
    if (result.id) {
      console.log(`✅ Success: ${generated.title}`);
      console.log(`   URL: http://localhost:3001/ko/posts/${result.slug}`);
      return true;
    } else {
      console.error('Failed to create post:', result.error);
      return false;
    }
  } catch (error) {
    console.error(`Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('📝 Generating 5 simple blog posts...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < 5; i++) {
    const success = await generateSimplePost(i);
    if (success) successCount++;
    
    if (i < 4) {
      console.log('⏳ Waiting 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n✅ Successfully created ${successCount}/5 posts!`);
}

main().catch(console.error);