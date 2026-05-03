/**
 * Unsplash API 유틸리티
 *
 * 블로그 포스트용 고품질 이미지를 자동으로 가져옵니다.
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

interface UnsplashSearchResponse {
  results: UnsplashImage[]
  total: number
  total_pages: number
}

/**
 * Unsplash에서 키워드로 이미지 검색
 */
export async function searchUnsplashImage(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<UnsplashImage | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.')
    return null
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.append('query', query)
    url.searchParams.append('per_page', '1')
    url.searchParams.append('orientation', orientation)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data: UnsplashSearchResponse = await response.json()

    if (data.results.length === 0) {
      console.warn(`⚠️ "${query}"에 대한 이미지를 찾을 수 없습니다.`)
      return null
    }

    // 첫 번째 결과 반환
    return data.results[0]
  } catch (error) {
    console.error('❌ Unsplash 이미지 검색 실패:', error)
    return null
  }
}

/**
 * 블로그 포스트 제목에서 적절한 검색 키워드 추출 (보험 전문)
 */
export function extractImageKeywords(title: string): string {
  const insuranceKeywords: Record<string, string> = {
    '자동차': 'car insurance driving',
    '생명': 'life insurance family',
    '건강': 'health insurance medical',
    '암보험': 'medical health care',
    '실손': 'hospital medical care',
    '화재': 'home insurance house',
    '여행': 'travel insurance airport',
    '치아': 'dental health care',
    '연금': 'retirement planning senior',
    '절세': 'tax planning finance',
    '노후': 'retirement elderly senior',
    '가족': 'family protection home',
    '사고': 'accident safety protection',
    '병원': 'hospital medical doctor',
    '재테크': 'financial planning money',
    '보험료': 'insurance cost money',
    '보장': 'insurance protection shield',
    '설계': 'financial planning meeting',
    '청구': 'insurance claim document',
    '트렌드': 'technology innovation digital',
    '디지털': 'digital technology fintech',
    '반려동물': 'pet dog cat animal',
    '부부': 'couple family marriage',
    '신혼': 'newlywed couple wedding',
    '어린이': 'children family kids',
    '은퇴': 'retirement senior peaceful',
  }

  for (const [keyword, search] of Object.entries(insuranceKeywords)) {
    if (title.includes(keyword)) {
      return search
    }
  }

  // 기본값: 보험/금융 관련 이미지
  return 'insurance financial protection'
}

/**
 * 블로그 포스트에 최적화된 이미지 URL 생성
 */
export function getOptimizedImageUrl(
  image: UnsplashImage,
  width: number = 1080,
  quality: number = 75
): string {
  const url = new URL(image.urls.raw)
  url.searchParams.append('w', width.toString())
  url.searchParams.append('q', quality.toString())
  url.searchParams.append('auto', 'format')
  url.searchParams.append('fit', 'crop')
  return url.toString()
}

/**
 * 기존 Unsplash URL을 최적화된 형태로 변환
 * fm=jpg → auto=format (AVIF/WebP 자동 전환)
 * w=1200 → w=1080 (적정 크기)
 * q=80 → q=75 (파일 크기 절감)
 */
export function optimizeUnsplashUrl(url: string): string {
  if (!url.includes('images.unsplash.com')) return url
  try {
    const parsed = new URL(url)
    // Switch from fixed format to auto-format (browser-negotiated AVIF/WebP)
    if (parsed.searchParams.has('fm')) {
      parsed.searchParams.delete('fm')
      parsed.searchParams.set('auto', 'format')
    }
    // Reduce width if over 1080
    const w = parseInt(parsed.searchParams.get('w') || '0')
    if (w > 1080) {
      parsed.searchParams.set('w', '1080')
    }
    // Reduce quality if over 75
    const q = parseInt(parsed.searchParams.get('q') || '0')
    if (q > 75) {
      parsed.searchParams.set('q', '75')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * 이미지 attribution (저작권 표시)
 */
export function getImageAttribution(image: UnsplashImage): string {
  return `Photo by <a href="${image.links.html}?utm_source=intalk_blog&utm_medium=referral">${image.user.name}</a> on <a href="https://unsplash.com?utm_source=intalk_blog&utm_medium=referral">Unsplash</a>`
}

/**
 * Alt text 생성
 */
export function generateAltText(image: UnsplashImage, fallback: string): string {
  return image.alt_description || image.description || fallback
}
