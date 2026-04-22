import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import InfinitePostsList from '@/components/InfinitePostsList'
import { normalizePostsTags } from '@/lib/utils/tags'
import { siteConfig, brandConfig } from '@/config'

export const metadata: Metadata = {
  title: `All Posts | ${siteConfig.name}`,
  description: 'Explore all blog posts about biohacking, startups, and sovereign living',
  openGraph: {
    title: `All Posts | ${siteConfig.name}`,
    description: 'Explore all blog posts about biohacking, startups, and sovereign living',
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        not: null,
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: siteConfig.name,
    description: 'Thoughts on biohacking, startups, and sovereign living',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts`,
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt?.toISOString(),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`,
      author: {
        '@type': 'Person',
        name: post.author || siteConfig.author.name,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="text-3xl font-bold text-gray-900">
                {brandConfig.logo.text}
              </Link>
              <nav>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 ml-6">About</Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 ml-6">Contact</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Posts</h1>
            <p className="text-lg text-gray-600">
              Explore thoughts on biohacking, startups, and building a sovereign life.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-gray-600">No posts found.</p>
          ) : (
            <InfinitePostsList initialPosts={normalizePostsTags(posts)} />
          )}
        </main>

        <footer className="bg-gray-50 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} {brandConfig.copyright.holder}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}