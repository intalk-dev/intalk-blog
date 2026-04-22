// Generate blog posts from YouTube videos
const youtubeVideos = [
  // AI and Tech videos
  'kCc8FmEb1nY', // Let's build GPT: from scratch, in code, spelled out by Andrej Karpathy
  'zjkBMFhNj_g', // [1hr Talk] Intro to Large Language Models by Andrej Karpathy
  'l8pRSuU81PU', // The moment we stopped understanding AI [AlexNet] by Welch Labs
  
  // Startup and Business
  'MnrJzXM7a6o', // Sam Altman - How to Succeed with a Startup
  '0lJKucu6HJc', // Paul Graham - How to Build the Future
  
  // Productivity and Life Optimization  
  'qS8AvocaZOw', // The Perfect Daily Routine - Andrew Huberman
  '6L2nSFxJrCg', // How to Study Effectively - Ali Abdaal
  
  // Korean Tech/Startup videos
  'M2xfHxARVeU', // 개발자가 반드시 알아야 할 컴퓨터 과학 by 포프TV
  '2zfRV4paH_A', // 스타트업 실패하지 않는 법 by EO
  'VZ_H0lUZ0-I', // AI 시대의 개발자 by 노마드코더
];

async function generateYouTubePost(videoId, index) {
  try {
    console.log(`\n[${index + 1}/${youtubeVideos.length}] Processing video: ${videoId}`);
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
  console.log('🎬 Starting YouTube blog post generation...');
  console.log(`Processing ${youtubeVideos.length} videos...`);
  
  const results = {
    successful: [],
    failed: []
  };
  
  // Process videos sequentially to avoid rate limiting
  for (let i = 0; i < youtubeVideos.length; i++) {
    const result = await generateYouTubePost(youtubeVideos[i], i);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Wait between requests to avoid rate limiting
    if (i < youtubeVideos.length - 1) {
      console.log('⏳ Waiting 5 seconds before next video...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Summary
  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed videos:');
    results.failed.forEach(f => {
      console.log(`- ${f.videoId}: ${f.error}`);
    });
  }
  
  if (results.successful.length > 0) {
    console.log('\nSuccessfully created posts:');
    results.successful.forEach(s => {
      console.log(`- ${s.title}`);
    });
  }
}

// Run the script
main().catch(console.error);