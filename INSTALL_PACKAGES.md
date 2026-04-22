# 패키지 설치 가이드

이미지 업로드 기능 개선을 위해 다음 패키지들을 설치해야 합니다:

```bash
npm install @vercel/blob sharp
```

## 설치된 패키지 설명

1. **@vercel/blob**: Vercel의 Blob Storage 서비스를 사용하기 위한 SDK
   - 이미지를 외부 스토리지에 저장
   - Base64 데이터베이스 저장 방식을 대체

2. **sharp**: 고성능 이미지 처리 라이브러리
   - 이미지 리사이징
   - 포맷 변환 (WebP 최적화)
   - 이미지 압축

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxx"
```

Vercel 대시보드에서 Blob Storage를 활성화하고 토큰을 발급받으세요.