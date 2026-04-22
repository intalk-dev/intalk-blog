// Find all posts with YouTube videos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findYouTubePosts() {
  try {
    console.log('🔍 Finding all posts with YouTube videos...\n');
    
    // Find posts with youtubeVideoId
    const posts = await prisma.post.findMany({
      where: {
        youtubeVideoId: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        youtubeVideoId: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${posts.length} posts with YouTube videos:\n`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Video ID: ${post.youtubeVideoId}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   URL: https://www.youtube.com/watch?v=${post.youtubeVideoId}`);
      console.log('');
    });
    
    // Also check for posts with YouTube URLs in content
    const postsWithYouTubeInContent = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: 'youtube.com' } },
          { content: { contains: 'youtu.be' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      }
    });
    
    console.log(`\nFound ${postsWithYouTubeInContent.length} posts with YouTube URLs in content`);
    
    // Extract YouTube IDs from content
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
    
    postsWithYouTubeInContent.forEach(post => {
      const matches = [...post.content.matchAll(youtubeRegex)];
      if (matches.length > 0) {
        console.log(`\n- ${post.title}`);
        matches.forEach(match => {
          console.log(`  Video ID: ${match[1]}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findYouTubePosts();