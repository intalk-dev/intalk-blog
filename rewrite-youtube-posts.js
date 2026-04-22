// Rewrite recent YouTube posts with new transcript feature
const youtubePosts = [
  // Recent AI/Tech videos that were created earlier today
  { videoId: 'kCc8FmEb1nY', oldSlug: '영상-요약-let-s-build-gpt-from-scratch-in-code-spelled-1759296590579-525' },
  { videoId: 'zjkBMFhNj_g', oldSlug: 'llms-for-biohackers-karpathy-s-intro-deconstructed-1759296622817-264' },
  { videoId: 'l8pRSuU81PU', oldSlug: 'deconstructing-gpt-2-karpathy-s-guide-to-llm-maste-1759296651379-890' },
  { videoId: 'MnrJzXM7a6o', oldSlug: 'iphone-launch-biohacking-visionary-thinking-steve--1759296687808-576' },
  { videoId: '0lJKucu6HJc', oldSlug: '영상-요약-sam-altman-how-to-succeed-with-a-startup-1759296719454-914' }
];

async function deleteOldPost(slug) {
  try {
    // First find the post
    const response = await fetch(`http://localhost:3001/api/posts?slug=${slug}`);
    const posts = await response.json();
    
    if (posts && posts.length > 0) {
      const post = posts[0];
      console.log(`Deleting old post: ${post.title} (ID: ${post.id})`);
      
      // Delete the post
      await fetch(`http://localhost:3001/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete post ${slug}:`, error);
  }
  return false;
}

async function rewriteYouTubePost(video) {
  try {
    console.log(`\nRewriting: ${video.videoId}`);
    console.log(`YouTube URL: https://www.youtube.com/watch?v=${video.videoId}`);
    
    // Delete old post first
    await deleteOldPost(video.oldSlug);
    
    // Create new post with transcript
    const response = await fetch('http://localhost:3001/api/youtube-to-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: video.videoId,
        autoPublish: true
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Success: ${data.post.title}`);
      console.log(`   New URL: http://localhost:3001/ko/posts/${data.post.slug}`);
      return { success: true, ...data.post };
    } else {
      console.error(`❌ Failed: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔄 Rewriting YouTube posts with transcript feature...\n');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (const video of youtubePosts) {
    const result = await rewriteYouTubePost(video);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push({ ...video, error: result.error });
    }
    
    // Wait between requests
    if (youtubePosts.indexOf(video) < youtubePosts.length - 1) {
      console.log('⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n📊 Rewrite Complete!');
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.successful.length > 0) {
    console.log('\nSuccessfully rewritten posts:');
    results.successful.forEach(s => {
      console.log(`- ${s.title}`);
    });
  }
}

// For deleting posts, we need to create a simple API endpoint
// But for now, we'll just create new versions

main().catch(console.error);