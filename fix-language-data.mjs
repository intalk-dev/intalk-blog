import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixLanguageData() {
  console.log('=== FIXING LANGUAGE DATA ===\n')

  // Get all published posts
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      originalLanguage: true
    }
  })

  console.log(`Total posts to check: ${posts.length}\n`)

  const toUpdate = []

  for (const post of posts) {
    // Check if title contains Korean characters
    const hasKorean = /[가-힣]/.test(post.title)
    // Check if title is purely English (no Korean)
    const isPureEnglish = /^[A-Za-z0-9\s\-:!?.,'"()\[\]&]+$/.test(post.title)

    let correctLanguage = null

    if (hasKorean && post.originalLanguage !== 'ko') {
      correctLanguage = 'ko'
    } else if (isPureEnglish && post.originalLanguage !== 'en') {
      correctLanguage = 'en'
    }

    if (correctLanguage) {
      toUpdate.push({
        id: post.id,
        title: post.title.substring(0, 50),
        from: post.originalLanguage,
        to: correctLanguage
      })
    }
  }

  console.log(`Posts to update: ${toUpdate.length}\n`)

  if (toUpdate.length > 0) {
    console.log('Will update:')
    toUpdate.forEach((p, i) => {
      console.log(`${i + 1}. "${p.title}"`)
      console.log(`   ${p.from} → ${p.to}`)
    })

    console.log('\nUpdating...')

    for (const update of toUpdate) {
      await prisma.post.update({
        where: { id: update.id },
        data: { originalLanguage: update.to }
      })
    }

    console.log(`\n✅ Updated ${toUpdate.length} posts successfully!`)
  } else {
    console.log('✅ All posts have correct language settings!')
  }

  // Verify
  const koCount = await prisma.post.count({
    where: {
      status: 'PUBLISHED',
      originalLanguage: 'ko'
    }
  })

  const enCount = await prisma.post.count({
    where: {
      status: 'PUBLISHED',
      originalLanguage: 'en'
    }
  })

  console.log('\nFinal Distribution:')
  console.log(`- Korean: ${koCount}`)
  console.log(`- English: ${enCount}`)

  await prisma.$disconnect()
}

fixLanguageData().catch(console.error)
