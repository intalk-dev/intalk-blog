'use client'

/**
 * StickyPartnerBanner - 화면 하단 고정 전체 너비 CTA 배너
 *
 * 스크롤 300px 이후 화면 하단에 풀폭으로 고정되는 CTA 배너.
 * 인톡 파트너스 가입 유도 목적. 문구는 siteConfig.cta에서 관리.
 */
import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/config/site.config'

const { cta } = siteConfig

/** 배너가 나타나기 시작하는 스크롤 임계값(px) */
const SCROLL_THRESHOLD = 300

export default function StickyPartnerBanner() {
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  // 스크롤 임계값을 넘나들 때만 상태를 갱신해 불필요한 렌더를 방지
  useEffect(() => {
    let shown = false
    const handleScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD
      if (next !== shown) {
        shown = next
        setVisible(next)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 고정 배너가 푸터를 가리지 않도록 body 하단에 배너 높이만큼 여백 확보
  useEffect(() => {
    if (!visible) return
    const el = bannerRef.current
    if (!el) return

    const applyPadding = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`
    }
    applyPadding()
    window.addEventListener('resize', applyPadding, { passive: true })

    return () => {
      window.removeEventListener('resize', applyPadding)
      document.body.style.paddingBottom = ''
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-50 animate-fade-in bg-gray-900 px-4 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] sm:py-6"
      aria-label="인톡 파트너스 안내"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center sm:gap-4">
        <div>
          <p className="text-xs text-gray-400 sm:text-sm">{cta.subheading}</p>
          <p className="mt-1 text-base font-bold text-white sm:text-xl">{cta.heading}</p>
        </div>
        <a
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-gray-900 transition hover:bg-yellow-300 sm:text-base"
        >
          <span aria-hidden="true">⚡</span>
          {cta.buttonLabel}
        </a>
      </div>
    </div>
  )
}
