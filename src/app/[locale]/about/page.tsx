import PageLayout from '@/components/PageLayout'
import { siteConfig } from '@/config'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <PageLayout locale={locale} currentPath="/about">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '소개' : 'About'}
      </h1>
      <p className="text-gray-600">
        {lang === 'ko'
          ? `${siteConfig.shortName}는 AI와 기술에 대한 인사이트를 공유하는 블로그입니다.`
          : `${siteConfig.shortName} is a blog sharing insights about AI and technology.`}
      </p>
    </PageLayout>
  )
}