// Test YouTube transcript functionality with Korean video
// 조승연의 유튜브 영상 예시
const testVideoId = 'yOq3R8eKD-E'; // 실제 한국어 영상 ID로 교체 필요

async function testYouTubeKorean() {
  try {
    console.log('Testing YouTube to Blog API with Korean video...');
    console.log('Video ID:', testVideoId);
    console.log('Video URL: https://www.youtube.com/watch?v=' + testVideoId);
    
    const response = await fetch('http://localhost:3001/api/youtube-to-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: testVideoId,
        autoPublish: true // 바로 발행
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Blog post created successfully!');
      console.log('Post ID:', data.post.id);
      console.log('Title:', data.post.title);
      console.log('Slug:', data.post.slug);
      console.log('Status:', data.post.status);
      console.log('View at: http://localhost:3001/ko/posts/' + data.post.slug);
    } else {
      console.error('❌ Failed:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run test
testYouTubeKorean();