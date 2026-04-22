import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import InfinitePostsList from '@/components/InfinitePostsList'
import PageLayout from '@/components/PageLayout'
import { normalizePostsTags } from '@/lib/utils/tags'
import { siteConfig } from '@/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKorean = locale === 'ko'
  
  return {
    title: isKorean ? `모든 글 | ${siteConfig.shortName}` : `All Posts | ${siteConfig.shortName}`,
    description: siteConfig.description[isKorean ? 'ko' : 'en'],
    openGraph: {
      title: isKorean ? `모든 글 | ${siteConfig.shortName}` : `All Posts | ${siteConfig.shortName}`,
      description: siteConfig.description[isKorean ? 'ko' : 'en'],
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  try {
    const { locale } = await params
    const lang = locale === 'en' ? 'en' : 'ko'

    const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        not: null,
        lte: new Date(),
      },
      // 언어별 필터링: 정확한 언어 매칭
      ...(lang === 'ko' ? {
        // 한국어 페이지: originalLanguage가 'ko'인 경우만
        originalLanguage: 'ko'
      } : {
        // 영어 페이지: originalLanguage가 'en'이거나 영어 번역이 있는 경우만
        OR: [
          { originalLanguage: 'en' },
          {
            AND: [
              { originalLanguage: 'ko' },
              {
                translations: {
                  some: {
                    locale: 'en'
                  }
                }
              }
            ]
          }
        ]
      })
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      translations: {
        where: {
          locale: lang
        }
      }
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: siteConfig.name,
    description: siteConfig.description[lang as keyof typeof siteConfig.description] ?? siteConfig.description[siteConfig.defaultLocale],
    url: `${siteConfig.url}/${locale}/posts`,
    blogPost: posts.map(post => {
      const title = lang === 'en' && post.translations?.[0]?.title
        ? post.translations[0].title
        : post.title
      const excerpt = lang === 'en' && post.translations?.[0]?.excerpt
        ? post.translations[0].excerpt
        : post.excerpt
        
      return {
        '@type': 'BlogPosting',
        headline: title,
        description: excerpt,
        datePublished: post.publishedAt?.toISOString(),
        url: `${siteConfig.url}/${locale}/posts/${post.slug}`,
        author: {
          '@type': siteConfig.author.type,
          name: siteConfig.author.name,
        },
      }
    }),
  }

  return (
    <PageLayout locale={locale} currentPath="/archive">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {lang === 'ko' ? '모든 글' : 'All Posts'}
        </h1>
        <p className="text-lg text-gray-600">
          {lang === 'ko' 
            ? 'AI, 기술, 소프트웨어 개발에 관한 모든 글'
            : 'Explore all posts about AI, technology, and software development'}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-600">
          {lang === 'ko' ? '아직 게시물이 없습니다.' : 'No posts found.'}
        </p>
      ) : (
        <InfinitePostsList
          initialPosts={normalizePostsTags(posts)}
          locale={locale}
        />
      )}
    </PageLayout>
  )
  } catch (error) {
    console.error('Error loading posts page:', error)

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

    // For other errors, show empty posts list
    const { locale } = await params
    const lang = locale === 'en' ? 'en' : 'ko'

    return (
      <PageLayout locale={locale} currentPath="/posts">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {lang === 'ko' ? '모든 글' : 'All Posts'}
          </h1>
        </div>

        <p className="text-gray-600">
          {lang === 'ko' ? '게시물을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.' : 'Unable to load posts. Please try again later.'}
        </p>
      </PageLayout>
    )
  }
}