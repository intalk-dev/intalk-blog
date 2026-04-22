import Link from 'next/link'
import { siteConfig, brandConfig, navigationConfig } from '@/config'

interface PageLayoutProps {
  locale: string
  currentPath: string
  children: React.ReactNode
}

export default function PageLayout({ locale, currentPath, children }: PageLayoutProps) {
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <Link href={`/${locale}`} className="text-3xl font-serif italic">
              {brandConfig.logo.text}
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/ko${currentPath}`}
                className={`px-3 py-1 rounded font-medium ${lang === 'ko' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                KOR
              </Link>
              <Link
                href={`/en${currentPath}`}
                className={`px-3 py-1 rounded font-medium ${lang === 'en' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ENG
              </Link>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex justify-center items-center gap-6 pb-4" aria-label="Main navigation">
            {(navigationConfig[lang as keyof typeof navigationConfig] ?? navigationConfig[siteConfig.defaultLocale]).map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href === '/' ? '' : item.href}`}
                className={`text-sm font-medium pb-2 ${
                  currentPath === item.href
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              &copy; {brandConfig.copyright.startYear} {brandConfig.copyright.holder}. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link
                href={`/${locale}/privacy`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {lang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {lang === 'ko' ? '이용약관' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}