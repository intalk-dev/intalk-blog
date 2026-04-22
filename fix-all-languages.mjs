import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Corrected detection logic matching translation.ts
function detectLanguage(text) {
  if (!text) return 'ko'

  // Match ALL Korean characters (not just the first one)
  const koreanRegex = /[가-힣]/g
  const koreanMatches = text.match(koreanRegex)
  const koreanChars = koreanMatches ? koreanMatches.length : 0
  const totalChars = text.replace(/\s/g, '').length

  if (totalChars === 0) return 'ko'

  // If more than 20% of characters are Korean, consider it Korean
  return koreanChars / totalChars > 0.2 ? 'ko' : 'en'
}

async function fixAllLanguages() {
  console.log('=== FIXING ALL POST LANGUAGES ===\n')

  // Get ALL posts (not just published)
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      originalLanguage: true,
      status: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Total posts to check: ${posts.length}\n`)

  const updates = []
  let koCount = 0
  let enCount = 0

  for (const post of posts) {
    // Detect from title + content snippet
    const textToAnalyze = post.title + ' ' + (post.content || '').substring(0, 500)
    const detectedLang = detectLanguage(textToAnalyze)

    if (detectedLang !== post.originalLanguage) {
      updates.push({
        id: post.id,
        title: post.title.substring(0, 60),
        slug: post.slug,
        from: post.originalLanguage || 'null',
        to: detectedLang,
        status: post.status
      })
    }

    if (detectedLang === 'ko') koCount++
    else enCount++
  }

  console.log(`Language Distribution After Fix:`)
  console.log(`- Korean: ${koCount}`)
  console.log(`- English: ${enCount}`)
  console.log(`\nPosts to update: ${updates.length}\n`)

  if (updates.length > 0) {
    console.log('Updating posts:\n')

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i]
      console.log(`${i + 1}. "${update.title}"`)
      console.log(`   Slug: ${update.slug}`)
      console.log(`   ${update.from} → ${update.to} [${update.status}]`)

      await prisma.post.update({
        where: { id: update.id },
        data: { originalLanguage: update.to }
      })
    }

    console.log(`\n✅ Updated ${updates.length} posts!`)
  } else {
    console.log('✅ All posts already have correct language tags!')
  }

  // Final verification - count by status and language
  console.log('\n=== FINAL VERIFICATION ===\n')

  const publishedKo = await prisma.post.count({
    where: { status: 'PUBLISHED', originalLanguage: 'ko' }
  })

  const publishedEn = await prisma.post.count({
    where: { status: 'PUBLISHED', originalLanguage: 'en' }
  })

  const draftKo = await prisma.post.count({
    where: { status: 'DRAFT', originalLanguage: 'ko' }
  })

  const draftEn = await prisma.post.count({
    where: { status: 'DRAFT', originalLanguage: 'en' }
  })

  console.log('Published Posts:')
  console.log(`- Korean: ${publishedKo}`)
  console.log(`- English: ${publishedEn}`)
  console.log('\nDraft Posts:')
  console.log(`- Korean: ${draftKo}`)
  console.log(`- English: ${draftEn}`)
  console.log(`\nTotal: ${publishedKo + publishedEn + draftKo + draftEn} posts`)

  await prisma.$disconnect()
}

fixAllLanguages().catch(console.error)
