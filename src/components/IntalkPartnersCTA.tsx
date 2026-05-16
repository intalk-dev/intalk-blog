/**
 * IntalkPartnersCTA - 글 하단 정적 CTA 배너
 *
 * 포스트 본문과 관련 글 사이에 삽입되는 정적 CTA 배너.
 * 인톡 파트너스 가입 유도 목적. 문구는 siteConfig.cta에서 관리.
 */
import { siteConfig } from '@/config/site.config'

const { cta } = siteConfig

export default function IntalkPartnersCTA() {
  return (
    <section
      className="my-12 rounded-2xl bg-gray-800 px-6 py-10 text-center sm:px-10"
      aria-label="인톡 파트너스 안내"
    >
      <h2 className="text-xl font-bold text-white sm:text-2xl">{cta.heading}</h2>
      <p className="mt-3 text-gray-300 text-sm sm:text-base">{cta.subheading}</p>
      <a
        href={cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-gray-900 transition hover:bg-yellow-300 sm:text-base"
      >
        {cta.buttonLabel}
      </a>
    </section>
  )
}
