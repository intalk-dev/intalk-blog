import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLanguageData() {
  console.log('=== LANGUAGE DATA ANALYSIS ===\n')

  // 1. Check originalLanguage distribution
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      originalLanguage: true,
      translations: {
        select: {
          locale: true
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: 20
  })

  console.log(`Total published posts: ${posts.length}\n`)

  // Group by language
  const byLanguage = {
    ko: 0,
    en: 0,
    null: 0,
    other: 0
  }

  const needsTranslation = []
  const hasWrongLanguage = []

  for (const post of posts) {
    // Count by language
    if (post.originalLanguage === 'ko') {
      byLanguage.ko++
    } else if (post.originalLanguage === 'en') {
      byLanguage.en++
    } else if (!post.originalLanguage) {
      byLanguage.null++
    } else {
      byLanguage.other++
    }

    // Check if title is in English but marked as Korean
    const hasEnglishTitle = /^[A-Za-z0-9\s\-:!?.,'"()]+$/.test(post.title)
    const hasKoreanTitle = /[가-힣]/.test(post.title)

    if (hasEnglishTitle && post.originalLanguage === 'ko') {
      hasWrongLanguage.push({
        title: post.title.substring(0, 50),
        originalLanguage: post.originalLanguage,
        shouldBe: 'en'
      })
    }

    if (hasKoreanTitle && post.originalLanguage === 'en') {
      hasWrongLanguage.push({
        title: post.title.substring(0, 50),
        originalLanguage: post.originalLanguage,
        shouldBe: 'ko'
      })
    }

    // Check translations
    const hasEnTranslation = post.translations.some(t => t.locale === 'en')
    const hasKoTranslation = post.translations.some(t => t.locale === 'ko')

    if (post.originalLanguage === 'ko' && !hasEnTranslation) {
      needsTranslation.push({
        title: post.title.substring(0, 50),
        lang: post.originalLanguage,
        missing: 'en'
      })
    }

    if (post.originalLanguage === 'en' && !hasKoTranslation) {
      needsTranslation.push({
        title: post.title.substring(0, 50),
        lang: post.originalLanguage,
        missing: 'ko'
      })
    }
  }

  console.log('Language Distribution:')
  console.log(`- Korean (ko): ${byLanguage.ko}`)
  console.log(`- English (en): ${byLanguage.en}`)
  console.log(`- NULL: ${byLanguage.null}`)
  console.log(`- Other: ${byLanguage.other}\n`)

  if (hasWrongLanguage.length > 0) {
    console.log(`\n⚠️  Posts with wrong language (${hasWrongLanguage.length}):`)
    hasWrongLanguage.forEach((p, i) => {
      console.log(`${i + 1}. "${p.title}"`)
      console.log(`   Current: ${p.originalLanguage} → Should be: ${p.shouldBe}`)
    })
  }

  if (needsTranslation.length > 0) {
    console.log(`\n📝 Posts missing translations (${needsTranslation.length}):`)
    needsTranslation.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. "${p.title}" (${p.lang}) - missing ${p.missing}`)
    })
  }

  await prisma.$disconnect()
}

checkLanguageData().catch(console.error)
