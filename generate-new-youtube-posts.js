// Generate blog posts from new YouTube videos
const newYoutubeVideos = [
  // Tech & Programming
  'q8q3OFFfY6c', // The Future of Programming Languages
  'WG3pGmoo8nE', // How I Would Learn To Code (If I Could Start Over)
  'UC8butISFwT-Wl7EV0hUK0BQ', // FreeCodeCamp Channel
  
  // AI & Machine Learning
  '5eKiQ7eBZ8Q', // Google I/O 2024 Keynote
  'iDulhoQ2pro', // OpenAI DevDay 2024
  'aircAruvnKk', // But what is a neural network? | 3Blue1Brown
  
  // Productivity & Self-improvement
  '0SARbwvhupQ', // How to Take Smart Notes
  '5qap5aO4i9A', // lofi hip hop radio
  'IlU-zDU6aQ0', // Study With Me
  
  // Korean Content
  'H1GQFH0vPPY', // 코딩 독학하는 법
];

async function generateYouTubePost(videoId, index) {
  try {
    console.log(`\n[${index + 1}/${newYoutubeVideos.length}] Processing video: ${videoId}`);
    console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
    
    const response = await fetch('http://localhost:3001/api/youtube-to-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: videoId,
        autoPublish: true // Publish immediately
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Success: ${data.post.title}`);
      console.log(`   URL: http://localhost:3001/ko/posts/${data.post.slug}`);
      return { success: true, ...data.post };
    } else {
      console.error(`❌ Failed: ${data.error}`);
      return { success: false, error: data.error, videoId };
    }
  } catch (error) {
    console.error(`❌ Error processing ${videoId}:`, error.message);
    return { success: false, error: error.message, videoId };
  }
}

async function main() {
  console.log('📝 Generating blog posts from YouTube videos...');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < newYoutubeVideos.length; i++) {
    const result = await generateYouTubePost(newYoutubeVideos[i], i);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Wait between requests
    if (i < newYoutubeVideos.length - 1) {
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
    console.log('\nFailed videos:');
    results.failed.forEach(f => {
      console.log(`- Video ID: ${f.videoId} (${f.error})`);
    });
  }
}

main().catch(console.error);