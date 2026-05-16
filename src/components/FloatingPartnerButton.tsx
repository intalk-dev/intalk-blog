'use client'

/**
 * FloatingPartnerButton - 플로팅 하단 버튼 컴포넌트
 *
 * 스크롤 300px 이후 나타나는 고정 하단 CTA 버튼.
 * 모바일/데스크톱 모두 지원.
 */
import { useEffect, useState } from 'react'
import { siteConfig } from '@/config/site.config'

export default function FloatingPartnerButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <a
        href={siteConfig.cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300 hover:shadow-xl sm:text-base"
      >
        <span aria-hidden="true">⚡</span>
        인톡 파트너스
      </a>
    </div>
  )
}
