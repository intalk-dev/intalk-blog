/**
 * Navigation Configuration
 *
 * 헤더 네비게이션 아이템. 로케일별로 라벨을 지정한다.
 * href는 locale prefix 없이 작성 (자동으로 /{locale}{href} 형태로 렌더링됨).
 */
export const navigationConfig = {
  ko: [
    { href: '/', label: '홈' },
    { href: '/archive', label: '아카이브' },
    // 필요에 따라 추가:
    // { href: '/about', label: '소개' },
  ],
  en: [
    { href: '/', label: 'Home' },
    { href: '/archive', label: 'Archive' },
    // Add as needed:
    // { href: '/about', label: 'About' },
  ],
} as const satisfies Record<string, ReadonlyArray<{ href: string; label: string }>>
