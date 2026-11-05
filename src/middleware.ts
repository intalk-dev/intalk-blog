import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 사이트 폐쇄 (2026-11-05)
 *
 * 이 블로그는 운영을 종료했다. 글은 옮기지 않고 본 도메인 블로그(www.intalkpartners.com/blog)로 일원화했다.
 * blog.intalkpartners.com 도메인은 이미 intalk-partners_FE 프로젝트가 받아 같은 규칙으로 응답한다(FE-CHORE-075).
 * 이 프로젝트에 남아 있는 배포 주소(*.vercel.app)도 같은 응답을 내도록, 모든 요청을 여기서 끝낸다.
 *
 * - 첫 화면(/, /ko, /en)만 새 블로그로 301 — 사람이 들어왔을 때 갈 곳을 준다. 쿼리(UTM)는 보존.
 * - 나머지는 전부 410 Gone + noindex — 검색엔진이 다시 크롤할 때 색인에서 뺀다.
 *   관련 없는 글을 새 블로그로 한꺼번에 301 하면 소프트 404 로 처리되어 신호만 섞이므로 하지 않는다.
 * - matcher 를 두지 않는다. /api 와 정적 파일까지 전부 걸려야 콘텐츠 자동 생성·발행 API 가 호출돼
 *   외부 API 비용이 나가는 일이 없다(vercel.json 의 crons 도 같은 이유로 지웠다).
 */

const NEW_BLOG_URL = 'https://www.intalkpartners.com/blog'

/** 옛 블로그 첫 화면으로 들어온 경우만 새 블로그로 보낸다 */
const ROOT_PATHS: ReadonlySet<string> = new Set(['/', '/ko', '/ko/', '/en', '/en/'])

/** 410 응답 본문 — 검색엔진에는 상태 코드가, 사람에게는 새 블로그 링크가 필요하다 */
const GONE_HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>블로그 운영 종료 | 인톡 파트너스</title>
<style>
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; color: #171717; background: #fff; }
  main { max-width: 36rem; margin: 20vh auto 0; padding: 0 1.5rem; }
  h1 { font-size: 1.5rem; margin: 0 0 1rem; }
  p { line-height: 1.6; margin: 0 0 1.5rem; color: #525252; }
  a { display: inline-block; padding: 0.75rem 1.25rem; border-radius: 0.5rem; background: #171717; color: #fff; text-decoration: none; }
</style>
</head>
<body>
<main>
  <h1>이 블로그는 운영을 종료했습니다</h1>
  <p>보험설계사를 위한 글은 인톡 파트너스 블로그에서 이어서 보실 수 있습니다.</p>
  <a href="${NEW_BLOG_URL}">인톡 파트너스 블로그로 가기</a>
</main>
</body>
</html>
`

export function middleware(request: NextRequest): NextResponse {
  if (ROOT_PATHS.has(request.nextUrl.pathname)) {
    const newBlogUrl = new URL(NEW_BLOG_URL)
    newBlogUrl.search = request.nextUrl.search
    return NextResponse.redirect(newBlogUrl, 301)
  }

  return new NextResponse(GONE_HTML, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // 410 은 영구 상태라 CDN·브라우저가 하루쯤 들고 있어도 된다
      'cache-control': 'public, max-age=86400',
      'x-robots-tag': 'noindex',
    },
  })
}
