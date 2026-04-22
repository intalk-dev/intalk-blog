# Vercel 배포 문제 해결 체크리스트

## 1. Vercel 대시보드에서 확인할 사항:

- [ ] Deployments 탭에서 최신 배포 상태 확인
- [ ] 빌드 로그에서 에러 메시지 확인
- [ ] Production Branch가 'main'으로 설정되어 있는지 확인
- [ ] 환경 변수가 모두 설정되어 있는지 확인

## 2. 배포 실패 시 확인할 사항:

### 빌드 에러인 경우:
- TypeScript 컴파일 에러
- 의존성 설치 실패
- 메모리 부족

### 런타임 에러인 경우:
- 환경 변수 누락
- 데이터베이스 연결 실패
- API 라우트 에러

## 3. 강제 재배포 방법:

### 방법 1: 빈 커밋
```bash
git commit --allow-empty -m "chore: Force redeploy"
git push origin main
```

### 방법 2: Vercel CLI
```bash
vercel --prod
```

### 방법 3: Vercel 대시보드
- Deployments → 이전 성공한 배포 선택 → "Redeploy" 버튼

## 4. 캐시 문제 해결:

### Vercel 캐시:
- Settings → Functions → "Clear Cache"

### 브라우저 캐시:
- 강제 새로고침: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- 시크릿/프라이빗 모드로 확인

### CDN 캐시 (Cloudflare 등):
- CDN 대시보드에서 캐시 초기화

## 5. 추가 디버깅:

### 배포된 코드 확인:
1. Vercel 대시보드 → Functions 탭
2. 소스 코드 뷰어로 실제 배포된 코드 확인

### 환경별 URL 테스트:
- Production: https://colemearchy.com/admin
- Preview: https://colemearchy-blog-git-main-xxx.vercel.app/admin
- 개별 배포: https://colemearchy-blog-xxx.vercel.app/admin