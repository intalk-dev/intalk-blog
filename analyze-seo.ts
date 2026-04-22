import { prisma } from './src/lib/prisma'

async function analyzeSEO() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      publishedAt: { not: null }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      tags: true,
      coverImage: true,
      views: true
    },
    orderBy: { views: 'desc' },
    take: 15
  })

  console.log('=== TOP 15 POSTS BY VIEWS ===\n')
  
  let needsOptimization = 0
  
  for (const post of posts) {
    const issues = []
    
    if (!post.seoTitle || post.seoTitle === post.title) {
      issues.push('No SEO title')
    }
    if (!post.seoDescription || post.seoDescription === post.excerpt) {
      issues.push('No SEO desc')
    }
    if (post.tags.length < 3) {
      issues.push('Few tags')
    }
    
    if (issues.length > 0) {
      needsOptimization++
      console.log(`${post.title.substring(0, 60)}...`)
      console.log(`  Views: ${post.views} | Tags: ${post.tags.length}`)
      console.log(`  Issues: ${issues.join(', ')}`)
      console.log('')
    }
  }
  
  console.log(`Total posts needing optimization: ${needsOptimization}/${posts.length}`)
  
  await prisma.$disconnect()
}

analyzeSEO()
