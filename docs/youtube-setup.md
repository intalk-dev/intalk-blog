# YouTube API 설정 가이드

## 1. 로컬 환경 설정

`.env` 파일에 다음 환경 변수를 추가합니다:

```bash
YOUTUBE_API_KEY="AIzaSyCDeAse0cwYDMYGiG8cg6zkVZ4e1KChqt8"
YOUTUBE_CHANNEL_ID="YOUR_CHANNEL_ID_HERE"
```

## 2. YouTube Channel ID 찾기

### 방법 1: YouTube Studio
1. YouTube Studio에 로그인
2. 설정 → 채널 → 고급 설정
3. 채널 ID 복사

### 방법 2: 채널 URL에서
1. 자신의 YouTube 채널로 이동
2. URL 확인:
   - `youtube.com/channel/UCxxxxxx` → `UCxxxxxx`가 채널 ID
   - `youtube.com/@handle` → 채널명 클릭 후 channel URL 확인

### 방법 3: YouTube API로 검색
```bash
node find-channel-id.js
```

## 3. Vercel 환경 변수 설정

### Vercel Dashboard에서:
1. https://vercel.com 로그인
2. 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가:
   - `YOUTUBE_API_KEY`: AIzaSyCDeAse0cwYDMYGiG8cg6zkVZ4e1KChqt8
   - `YOUTUBE_CHANNEL_ID`: (찾은 채널 ID)
5. 모든 환경(Production, Preview, Development)에 적용
6. Save

### 재배포:
```bash
vercel --prod
```

또는 Vercel Dashboard에서 Redeploy 클릭

## 4. 테스트

### 로컬 테스트:
```bash
# API 설정 확인
node -r dotenv/config check-youtube-setup.js

# 개발 서버에서 테스트
npm run dev
# 브라우저에서 http://localhost:3000/api/youtube/test 접속
```

### 프로덕션 테스트:
```bash
# API 테스트 엔드포인트
curl https://colemearchy.com/api/youtube/test

# 비디오 목록 가져오기
curl https://colemearchy.com/api/youtube/videos?limit=5
```

## 5. 문제 해결

### 500 에러가 발생하는 경우:
1. 환경 변수가 Vercel에 제대로 설정되었는지 확인
2. YouTube Data API v3가 Google Cloud Console에서 활성화되어 있는지 확인
3. API 키에 올바른 권한이 있는지 확인

### 채널을 찾을 수 없는 경우:
1. 채널 ID가 정확한지 확인 (UC로 시작하는 24자)
2. 채널이 공개 상태인지 확인

## 6. Admin 페이지에서 사용

YouTube 비디오가 설정되면 Admin 페이지에서:
1. YouTube 섹션에서 "YouTube에서 최신 동영상 가져오기" 클릭
2. 가져온 비디오 목록에서 선택하여 게시물에 추가
3. 자동으로 임베드되고 SEO 최적화됨