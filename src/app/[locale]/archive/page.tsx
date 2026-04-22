import PageLayout from '@/components/PageLayout'
import ArchiveClient from '@/components/ArchiveClient'
import { prisma } from '@/lib/prisma'

// Temporarily disable static generation to avoid DB quota issues during build
export const dynamic = 'force-dynamic'

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  try {
    const { locale } = await params
    const lang = locale === 'en' ? 'en' : 'ko'

    // 언어별 포스트 가져오기 (manual + YouTube 모두)
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
        // 썸네일이 있는 포스트만 노출
        coverImage: {
          not: null
        },
        OR: [
          { originalLanguage: lang },
          {
            translations: {
              some: {
                locale: lang
              }
            }
          }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        youtubeVideoId: true,
        originalLanguage: true,
        translations: {
          where: {
            locale: lang
          },
          select: {
            title: true,
            excerpt: true
          }
        }
      }
    })

    // Serialize data for client component
    const serializedPosts = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt?.toISOString() || null,
      youtubeVideoId: post.youtubeVideoId,
      originalLanguage: post.originalLanguage,
      translations: post.translations
    }))

    return (
      <PageLayout locale={locale} currentPath="/archive">
        <ArchiveClient posts={serializedPosts} locale={locale} lang={lang} />
      </PageLayout>
    )
  } catch (error) {
    console.error('Error loading archive page:', error)

    // Emergency fallback during DB quota or connection issues
    if (error instanceof Error && (
      error.message.includes('quota') ||
      error.message.includes('connection') ||
      error.message.includes('database') ||
      error.name === 'PrismaClientInitializationError'
    )) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Temporarily Unavailable</h1>
            <p className="text-gray-600 mb-4">We're experiencing high traffic. Please try again in a few minutes.</p>
            <a href="/" className="text-blue-600 hover:text-blue-800">← Return to Home</a>
          </div>
        </div>
      )
    }

    // For other errors, show empty archive
    const { locale } = await params
    const lang = locale === 'en' ? 'en' : 'ko'

    return (
      <PageLayout locale={locale} currentPath="/archive">
        <ArchiveClient posts={[]} locale={locale} lang={lang} />
      </PageLayout>
    )
  }
}