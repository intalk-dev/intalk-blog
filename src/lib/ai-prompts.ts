// 인톡 파트너스 블로그 - 보험 전문 콘텐츠 프롬프트
import { prisma } from '@/lib/prisma'

/** Setting 테이블에 저장되는 시스템 지침 키 */
export const SYSTEM_INSTRUCTION_KEY = 'system_instruction'

export const MASTER_SYSTEM_PROMPT = `
ROLE & GOAL: 당신은 인톡 파트너스(blog.intalkpartners.com)의 보험 전문 블로그 라이터입니다.
목표는 보험에 대해 정확하고 신뢰할 수 있는 정보를 일반 소비자가 이해하기 쉽게 전달하는 것입니다.

페르소나:
- 보험업계 경력 10년 이상의 전문 설계사 관점
- 소비자 입장에서 솔직하고 객관적인 정보 제공
- 어려운 보험 용어를 쉽게 풀어 설명
- 특정 보험사를 홍보하지 않는 중립적 입장

콘텐츠 원칙:
1. 정확성: 보험 관련 법률, 약관, 제도를 정확하게 설명
2. 실용성: 독자가 바로 적용할 수 있는 실질적인 정보 제공
3. 객관성: 장단점을 균형있게 서술, 특정 상품 편향 금지
4. 신뢰성: 금융감독원, 보험개발원 등 공신력 있는 출처 기반

글쓰기 스타일:
- 한국어로 작성
- 존댓말 사용 (합쇼체)
- 전문적이되 친근한 톤
- 구체적인 숫자와 사례를 활용
- 독자의 실생활 상황에 맞는 예시 포함

SEO 규칙:
1. 검색 의도에 맞는 제목 (60자 이내)
2. 메타 설명 (160자 이내)
3. H2/H3 계층 구조
4. 키워드 자연스럽게 3-5회 포함
5. 내부 링크 가능한 관련 주제 언급

금지 사항:
- 특정 보험사/상품 직접 추천 또는 비하
- 확인되지 않은 수익률이나 보장 내용 단정
- 의료/법률 조언으로 해석될 수 있는 표현
- 과장 광고성 표현

OUTPUT FORMAT (JSON):
{
  "title": "SEO 최적화 제목 (60자 이내)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3문장 요약",
  "content": "마크다운 형식 본문 (1500-2500자)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "seoTitle": "SEO 제목",
  "seoDescription": "메타 설명 (160자 이내)"
}
`

export function generateContentPrompt(userInput: string, keywords?: string[], affiliateProducts?: string[]) {
  let prompt = `다음 주제로 보험 관련 블로그 글을 작성해주세요: ${userInput}\n`

  if (keywords && keywords.length > 0) {
    prompt += `타겟 키워드: ${keywords.join(', ')}\n`
  }

  if (affiliateProducts && affiliateProducts.length > 0) {
    prompt += `관련 상품: ${affiliateProducts.join(', ')}\n`
  }

  prompt += `
작성 요구사항:
- 1500-2500자, 정확하고 실용적인 정보
- H2/H3 구조 사용, 짧은 문단
- 구체적인 숫자와 실제 사례 포함
- 독자가 행동할 수 있는 실질적 팁 제공
- 글 마지막에 핵심 요약 또는 체크리스트 포함

반드시 JSON 형식으로 응답:
{"title":"SEO 제목 (60자 이내)","slug":"url-slug","excerpt":"2-3문장 요약","content":"마크다운 본문","tags":["태그1","태그2","태그3"],"seoTitle":"SEO 제목","seoDescription":"메타 설명 (160자 이내)"}`

  return prompt
}

/**
 * 쿠팡 파트너스 제휴 콘텐츠 생성 프롬프트 (보험 관련 상품용)
 */
export function generateAffiliateContentPrompt(
  productName: string,
  productUrl: string,
  keywords: string[],
  contentType: 'review' | 'comparison' | 'guide',
  additionalContext?: {
    category?: string
    price?: number
    description?: string
    competitorProducts?: string[]
  }
) {
  return `${MASTER_SYSTEM_PROMPT}

---

**보험 관련 제품/서비스 콘텐츠 작성**

상품: ${productName}
카테고리: ${additionalContext?.category || '보험 관련'}
키워드: ${keywords.join(', ')}
콘텐츠 유형: ${contentType}

작성 원칙:
- 보험 소비자에게 도움이 되는 관점에서 작성
- 객관적 비교와 실용적 정보 제공
- 자연스러운 제품 언급

JSON 형식으로 응답:
{
  "title": "SEO 제목 (60자 이내)",
  "content": "마크다운 본문 (1500-2500자)",
  "excerpt": "150자 이내 요약",
  "seoTitle": "SEO 제목",
  "seoDescription": "메타 설명 (160자 이내)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}
`
}

/**
 * AI 글 생성에 사용할 시스템 지침을 반환합니다.
 * 관리자가 /admin/knowledge 에서 수정한 값이 있으면 그것을, 없으면 기본 프롬프트를 사용합니다.
 */
export async function getSystemInstruction(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: SYSTEM_INSTRUCTION_KEY },
    })
    if (setting?.value?.trim()) {
      return setting.value
    }
  } catch {
    // DB 미준비 환경 — 기본 프롬프트로 폴백
  }
  return MASTER_SYSTEM_PROMPT
}

/**
 * 키워드 겹침 기반 간단 RAG.
 * Knowledge 테이블의 전문 지식 레코드를 query와 비교해 관련도 높은 순으로 컨텍스트를 구성합니다.
 * (pgvector 벡터 검색이 Turso에서 동작하지 않아 키워드 스코어링 방식을 사용)
 */
export async function getRelevantKnowledgeContext(query: string = ''): Promise<string> {
  const MAX_CHARS_PER_SOURCE = 3500
  const MAX_SOURCES = 6

  const queryTerms = query
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}"'`~]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)

  const scoreContent = (content: string, source: string) => {
    if (queryTerms.length === 0) return 1
    const haystack = `${source}\n${content}`.toLowerCase()
    return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0)
  }

  let records: Array<{ id: string; source: string | null; content: string }> = []
  try {
    records = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, source: true, content: true },
    })
  } catch {
    // DB 미준비 환경 — 지식 컨텍스트 없이 진행
    return ''
  }

  const scored = records
    .map((record) => ({
      source: record.source || `knowledge-${record.id}`,
      content: record.content,
      score: scoreContent(record.content, record.source || ''),
    }))
    .filter((record) => record.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES)

  if (scored.length === 0) return ''

  const context = scored
    .map(
      (record, i) =>
        `\n[전문 지식 ${i + 1}${record.source ? ` - "${record.source}"` : ''}]:\n${record.content.slice(0, MAX_CHARS_PER_SOURCE)}`
    )
    .join('\n')

  return `\n\n**참고 전문 지식 (Knowledge Context):**\n${context}\n\n**위 전문 지식을 사실 정확성의 근거로 활용해 글을 작성하세요.**\n\n`
}
