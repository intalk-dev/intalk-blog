/**
 * IntalkPartnersCTA - 글 하단 고정 배너 컴포넌트
 *
 * 포스트 본문과 관련 글 사이에 삽입되는 정적 CTA 배너.
 * 인톡 파트너스 가입 유도 목적.
 */
import { siteConfig } from '@/config/site.config'

export default function IntalkPartnersCTA() {
  return (
    <section
      className="my-12 rounded-2xl bg-gray-800 px-6 py-10 text-center sm:px-10"
      aria-label="인톡 파트너스 안내"
    >
      <h2 className="text-xl font-bold text-white sm:text-2xl">
        내 보험, 내가 직접 가입하고 수익도 받자
      </h2>
      <p className="mt-3 text-gray-300 text-sm sm:text-base">
        인톡 파트너스로 보험 설계부터 수익까지 한번에
      </p>
      <a
        href={siteConfig.cta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-yellow-400 px-8 py-3 text-sm font-bold text-gray-900 transition hover:bg-yellow-300 sm:text-base"
      >
        인톡 파트너스 알아보기
      </a>
    </section>
  )
}
