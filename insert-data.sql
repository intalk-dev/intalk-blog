-- Insert sample posts from backup
INSERT INTO "Post" (
  "id", "title", "slug", "content", "excerpt", "coverImage",
  "publishedAt", "createdAt", "updatedAt", "author", "tags",
  "seoTitle", "seoDescription", "views", "status", "originalLanguage"
) VALUES
(
  'manual-1',
  '개발자가 알아야 할 마이크로 SaaS 아이디어 10가지',
  '개발자가-알아야-할-마이크로-saas-아이디어-10가지',
  '# 개발자가 알아야 할 마이크로 SaaS 아이디어 10가지

마이크로 SaaS는 개발자 혼자서도 만들 수 있는 작은 규모의 소프트웨어 서비스입니다.

## 추천 아이디어

1. **PDF 도구** - PDF 변환, 편집 서비스
2. **이미지 최적화** - 자동 이미지 압축
3. **URL 단축** - 커스텀 도메인 단축 서비스
4. **폼 빌더** - 간단한 폼 생성 도구
5. **스크린샷 API** - 웹페이지 스크린샷 서비스

작게 시작해서 점진적으로 확장하는 것이 마이크로 SaaS의 핵심입니다.',
  '개발자 혼자서도 만들 수 있는 수익성 있는 마이크로 SaaS 아이디어들을 소개합니다.',
  'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop',
  '2024-10-25 00:00:00',
  '2024-10-25 00:00:00',
  '2024-10-25 00:00:00',
  'Cole',
  'SaaS,창업,개발,부업',
  '개발자가 알아야 할 마이크로 SaaS 아이디어 10가지',
  '개발자 혼자서도 만들 수 있는 수익성 있는 마이크로 SaaS 아이디어들과 성공 전략을 소개합니다.',
  127,
  'PUBLISHED',
  'ko'
),
(
  'manual-2',
  'AI 도구로 블로그 운영하는 방법',
  'ai-도구로-블로그-운영하는-방법',
  '# AI 도구로 블로그 운영하는 방법

최근 AI 도구들이 블로그 운영을 혁신적으로 바꾸고 있습니다.

## 주요 AI 도구들

1. **Claude Code** - 개발 작업 자동화
2. **Gemini** - 콘텐츠 아이디어 생성
3. **ChatGPT** - 글쓰기 보조

효율적인 블로그 운영을 위해서는 이런 AI 도구들을 적극 활용하는 것이 중요합니다.',
  'AI 도구를 활용한 효율적인 블로그 운영 방법을 소개합니다.',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  '2024-10-26 00:00:00',
  '2024-10-26 00:00:00',
  '2024-10-26 00:00:00',
  'Cole',
  'AI,블로그,생산성,도구',
  'AI 도구로 블로그 운영하는 방법',
  'Claude Code, Gemini 등 AI 도구를 활용해 효율적으로 블로그를 운영하는 실전 방법을 소개합니다.',
  89,
  'PUBLISHED',
  'ko'
);