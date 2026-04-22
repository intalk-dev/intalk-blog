// Test YouTube transcript functionality
const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up

async function testYouTubeTranscript() {
  try {
    console.log('Testing YouTube to Blog API...');
    console.log('Video ID:', testVideoId);
    
    const response = await fetch('http://localhost:3001/api/youtube-to-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: testVideoId,
        autoPublish: false // Create as draft
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Blog post created successfully!');
      console.log('Post ID:', data.post.id);
      console.log('Slug:', data.post.slug);
      console.log('View at: http://localhost:3001/ko/posts/' + data.post.slug);
    } else {
      console.error('❌ Failed:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run test
testYouTubeTranscript();