'use client'

/**
 * StickyPartnerBanner - 화면 하단 고정 전체 너비 CTA 배너
 *
 * 스크롤 300px 이후 화면 하단에 풀폭으로 고정되는 CTA 배너.
 * 인톡 파트너스 가입 유도 목적. (기존 우하단 플로팅 버튼 대체)
 */
import { useEffect, useState } from 'react'
import { siteConfig } from '@/config/site.config'

export default function StickyPartnerBanner() {
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
    <div
      className="fixed inset-x-0 bottom-0 z-50 animate-fade-in bg-gray-900 px-4 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] sm:py-6"
      role="complementary"
      aria-label="인톡 파트너스 안내"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center sm:gap-4">
        <div>
          <p className="text-xs text-gray-400 sm:text-sm">
            인톡 파트너스로 보험 설계부터 수익까지
          </p>
          <p className="mt-1 text-base font-bold text-white sm:text-xl">
            내 보험, 내가 직접 가입하고 수익도 받자
          </p>
        </div>
        <a
          href={siteConfig.cta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-gray-900 transition hover:bg-yellow-300 sm:text-base"
        >
          <span aria-hidden="true">⚡</span>
          인톡 파트너스 알아보기
        </a>
      </div>
    </div>
  )
}
