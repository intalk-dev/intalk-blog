# Vercel 환경 변수 설정 가이드

## 🚨 중요: YouTube API가 작동하지 않는 이유

현재 프로덕션 환경에서 YouTube API가 500 에러를 반환하고 있습니다. 
이는 Vercel에 환경 변수가 설정되지 않았기 때문입니다.

## 설정 방법

### 1. Vercel Dashboard 접속
1. https://vercel.com 로그인
2. `colemearchy-blog` 프로젝트 선택

### 2. Settings → Environment Variables
1. 프로젝트 대시보드에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Environment Variables" 클릭

### 3. 환경 변수 추가

#### YOUTUBE_API_KEY
- **Key**: `YOUTUBE_API_KEY`
- **Value**: `AIzaSyCDeAse0cwYDMYGiG8cg6zkVZ4e1KChqt8`
- **Environment**: Production, Preview, Development (모두 체크)
- "Add" 버튼 클릭

#### YOUTUBE_CHANNEL_ID
- **Key**: `YOUTUBE_CHANNEL_ID`
- **Value**: `UCoAoO5cUnk_yG4lOUHKvfqg`
- **Environment**: Production, Preview, Development (모두 체크)
- "Add" 버튼 클릭

### 4. 재배포 필요
환경 변수를 추가한 후에는 반드시 재배포해야 합니다:

1. "Deployments" 탭으로 이동
2. 최신 배포의 "..." 메뉴 클릭
3. "Redeploy" 선택
4. "Use existing Build Cache" 체크 해제
5. "Redeploy" 버튼 클릭

### 5. 확인 방법

배포 완료 후 (약 1-2분 소요):

```bash
# API 테스트
curl https://www.colemearchy.com/api/youtube/test

# 비디오 목록 확인
curl "https://www.colemearchy.com/api/youtube/videos?limit=3"
```

### 현재 설정된 값들

```
YOUTUBE_API_KEY=AIzaSyCDeAse0cwYDMYGiG8cg6zkVZ4e1KChqt8
YOUTUBE_CHANNEL_ID=UCoAoO5cUnk_yG4lOUHKvfqg  # @coleitai 채널
```

## 문제 해결

### 여전히 500 에러가 나는 경우:
1. 환경 변수가 모든 환경(Production, Preview, Development)에 체크되어 있는지 확인
2. 재배포 시 캐시를 사용하지 않았는지 확인
3. Vercel 로그에서 구체적인 에러 메시지 확인

### Vercel 로그 확인:
1. Vercel Dashboard → Functions 탭
2. `/api/youtube/videos` 또는 `/api/youtube/test` 찾기
3. 로그 확인하여 상세 에러 메시지 확인