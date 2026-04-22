import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTodayPosts() {
  try {
    // 오늘 날짜 (한국 시간 기준)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    console.log('📅 오늘 날짜:', today.toLocaleDateString('ko-KR'))
    console.log('🔍 검색 범위:', startOfDay.toISOString(), '~', endOfDay.toISOString())
    console.log('')

    // 오늘 발행된 포스트 (publishedAt 기준)
    const publishedToday = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        scheduledAt: true,
        createdAt: true
      }
    })

    console.log(`✅ 오늘 발행된 포스트: ${publishedToday.length}개`)
    console.log('')

    if (publishedToday.length > 0) {
      publishedToday.forEach((post, idx) => {
        console.log(`${idx + 1}. ${post.title}`)
        console.log(`   - Slug: ${post.slug}`)
        console.log(`   - 발행 시간: ${post.publishedAt?.toLocaleString('ko-KR')}`)
        console.log(`   - 예약 시간: ${post.scheduledAt?.toLocaleString('ko-KR') || 'N/A'}`)
        console.log(`   - URL: https://colemearchy.com/posts/${post.slug}`)
        console.log('')
      })
    } else {
      console.log('⚠️  오늘 발행된 포스트가 없습니다.')
    }

    // 오늘 생성된 DRAFT 포스트 확인 (예약 발행 대기 중일 수 있음)
    const draftsToday = await prisma.post.findMany({
      where: {
        status: 'DRAFT',
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
        createdAt: true
      }
    })

    if (draftsToday.length > 0) {
      console.log(`📝 오늘 생성된 DRAFT 포스트 (예약 발행 대기): ${draftsToday.length}개`)
      console.log('')
      draftsToday.forEach((post, idx) => {
        console.log(`${idx + 1}. ${post.title}`)
        console.log(`   - 예약 시간: ${post.scheduledAt?.toLocaleString('ko-KR') || 'N/A'}`)
        console.log(`   - 생성 시간: ${post.createdAt.toLocaleString('ko-KR')}`)
        console.log('')
      })
    }

    // 최근 7일간 발행 통계
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentPosts = await prisma.post.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: sevenDaysAgo
        }
      }
    })

    console.log(`📊 최근 7일간 발행된 포스트: ${recentPosts}개`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTodayPosts()
