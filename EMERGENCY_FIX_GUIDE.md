# 🚨 구글 애드센스 승인을 위한 긴급 수정 가이드

## 문제 상황
1. **폰트 404 에러**: 잘못된 Geist 폰트 URL로 인한 404 에러
2. **한글 slug 페이지 404**: URL 인코딩 문제로 인한 페이지 접근 불가

## 해결 단계

### 1단계: 폰트 에러 수정 (✅ 완료)
- `src/app/layout.tsx`에서 하드코딩된 폰트 preload 링크 제거
- Next.js의 자동 폰트 최적화 기능 활용

### 2단계: 한글 slug 수정
```bash
# 한글 slug를 가진 포스트 확인
pnpm tsx scripts/find-korean-slug-posts.ts

# 한글 slug를 영문으로 변환 (특히 '영상-요약' 포스트들)
pnpm tsx scripts/fix-korean-slugs.ts
```

### 3단계: 로컬 빌드 테스트
```bash
# 환경 변수 확인
cp .env.example .env
# .env 파일에 필요한 환경 변수 설정

# 빌드 테스트
pnpm build

# 로컬에서 production 빌드 실행
pnpm start
```

### 4단계: Vercel 배포
```bash
# Git 커밋
git add -A
git commit -m "fix: 구글 애드센스 승인을 위한 404 에러 수정

- 잘못된 Geist 폰트 preload 링크 제거
- 한글 slug 포스트를 영문으로 변환하는 스크립트 추가"

# 배포
git push origin main
```

### 5단계: 배포 후 확인사항
1. https://colemearchy.com 메인 페이지 접속 확인
2. 개발자 도구 > Network 탭에서 404 에러 없는지 확인
3. 기존 한글 URL 포스트들이 정상 접근되는지 확인

### 6단계: Google Search Console에서 재검토 요청
1. 모든 404 에러가 해결되었는지 확인
2. 구글 애드센스에서 재검토 요청

## 추가 권장사항

### SEO 개선을 위한 후속 작업
1. **URL 리다이렉트 설정**: 기존 한글 slug URL에서 새 영문 slug로 301 리다이렉트
2. **slug 생성 로직 개선**: 신규 포스트 생성 시 영문 slug만 생성하도록 수정
3. **사이트맵 업데이트**: 변경된 URL들이 사이트맵에 반영되도록 재생성

### 모니터링
- Vercel Analytics에서 404 에러 추이 확인
- Google Search Console에서 크롤링 에러 모니터링

## 연락처
문제 발생 시 즉시 대응 가능하도록 준비되어 있습니다.