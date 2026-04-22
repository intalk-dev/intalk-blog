import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Raw transcript item from youtube-transcript library
 */
interface RawTranscriptItem {
  text: string;
  start?: number;
  offset?: number;
  duration?: number;
  dur?: number;
}

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface ProcessedTranscript {
  fullText: string;
  chunks: string[];
  duration: number;
  hasTimestamps: boolean;
}

export interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  thumbnailUrl: string;
}

export class YouTubeTranscriptService {
  /**
   * Fetch transcript for a YouTube video
   */
  async fetchTranscript(videoId: string): Promise<TranscriptItem[]> {
    try {
      // Try to fetch transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'ko', // Try Korean first
      }).catch(() => 
        // Fallback to English if Korean not available
        YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      ).catch(() => 
        // Fallback to any available language
        YoutubeTranscript.fetchTranscript(videoId)
      );

      // Map the response to our TranscriptItem interface
      return transcript.map((item: RawTranscriptItem): TranscriptItem => ({
        text: item.text,
        start: item.start ?? item.offset ?? 0,
        duration: item.duration ?? item.dur ?? 0
      }));
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
      throw new Error('Transcript not available for this video');
    }
  }

  /**
   * Process raw transcript into usable format
   */
  processTranscript(transcript: TranscriptItem[]): ProcessedTranscript {
    // Combine all text
    const fullText = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Calculate total duration
    const duration = transcript.length > 0 
      ? Math.max(...transcript.map(item => item.start + item.duration))
      : 0;

    // Chunk transcript for long videos (4000 characters per chunk)
    const chunks = this.chunkTranscript(fullText, 4000);

    return {
      fullText,
      chunks,
      duration,
      hasTimestamps: transcript.some(item => item.start > 0),
    };
  }

  /**
   * Intelligent chunking that tries to break at sentence boundaries
   */
  private chunkTranscript(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Extract key moments from transcript with timestamps
   */
  extractKeyMoments(transcript: TranscriptItem[], maxMoments: number = 5): Array<{
    text: string;
    timestamp: number;
    timeString: string;
  }> {
    // Simple implementation: extract evenly distributed moments
    const interval = Math.floor(transcript.length / maxMoments);
    const moments = [];

    for (let i = 0; i < maxMoments && i * interval < transcript.length; i++) {
      const item = transcript[i * interval];
      moments.push({
        text: item.text.slice(0, 100) + '...',
        timestamp: item.start,
        timeString: this.formatTimestamp(item.start),
      });
    }

    return moments;
  }

  /**
   * Format timestamp to YouTube format (e.g., 1:23:45)
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Generate prompt for Gemini to convert transcript to blog post
   */
  generateBlogPrompt(
    transcript: ProcessedTranscript,
    metadata: YouTubeVideoMetadata,
    chunkIndex?: number,
    isShort: boolean = false
  ): string {
    const chunk = chunkIndex !== undefined
      ? transcript.chunks[chunkIndex]
      : transcript.fullText;

    const durationMinutes = Math.floor(transcript.duration / 60);
    const durationSeconds = Math.floor(transcript.duration % 60);
    const durationText = durationMinutes > 0
      ? `${durationMinutes}분 ${durationSeconds}초`
      : `${durationSeconds}초`;

    // Shorts용 특별 프롬프트
    if (isShort) {
      return `
You are Colemearchy, transforming a YouTube Shorts video into a comprehensive blog post.

VIDEO INFORMATION:
- Title: ${metadata.title}
- Channel: ${metadata.channelTitle}
- Published: ${metadata.publishedAt}
- Duration: ${durationText} (Shorts 영상)
- Type: 짧은 핵심 메시지 콘텐츠

SHORTS TRANSCRIPT:
${chunk}

SPECIAL TASK FOR SHORTS:
이 쇼츠 영상의 핵심 메시지를 바탕으로 **1000자 이상의 완전한 블로그 포스트**를 작성하세요.

쇼츠는 짧지만, 블로그 독자들에게는 더 깊이 있는 내용을 제공해야 합니다:

1. **도입부 (150-200자)**:
   - 이 주제가 왜 중요한지 설명
   - 독자의 호기심을 자극하는 질문이나 사실 제시
   - 쇼츠 영상의 핵심 메시지 티저

2. **핵심 내용 확장 (600-800자)**:
   - 쇼츠에서 말한 핵심 포인트를 상세히 설명
   - 배경 지식과 맥락 추가 (예: "왜 이것이 중요한가?", "어떤 원리인가?")
   - 구체적인 예시나 사례 추가
   - 실전 적용 방법 (How-to)
   - 주의사항이나 팁

3. **추가 인사이트 (200-300자)**:
   - 쇼츠에서 미처 다루지 못한 관련 정보
   - Colemearchy 스타일의 개인적 견해나 경험
   - 바이오해킹/최적화 관점의 추가 조언

4. **마무리 및 실행 계획 (100-150자)**:
   - 핵심 요약 (3-5 bullet points)
   - 독자가 바로 실천할 수 있는 액션 아이템
   - 격려 메시지

WRITING STYLE:
- Colemearchy의 날것의 솔직함과 반항적 톤 유지
- 기술적 정확성 + 개인적 경험 결합
- 이모지 사용 자제 (필요시만 1-2개)
- 한국어로 작성
- 전문 용어는 설명과 함께 사용

IMPORTANT:
- 쇼츠가 짧다고 블로그도 짧아서는 안 됩니다
- 스크립트에 없는 내용도 주제와 관련되면 추가 (배경 지식, 원리, 사례 등)
- 최소 1000자 이상의 가치 있는 콘텐츠 생성
- "영상을 보세요"같은 말 대신 실질적인 정보 제공

Generate a comprehensive, well-structured blog post in Korean.
`;
    }

    // 일반 영상용 프롬프트
    return `
You are Colemearchy, writing a blog post based on a YouTube video.

VIDEO INFORMATION:
- Title: ${metadata.title}
- Channel: ${metadata.channelTitle}
- Published: ${metadata.publishedAt}
- Duration: ${durationText}

TRANSCRIPT TO CONVERT:
${chunk}

TASK:
1. Transform this video transcript into an engaging blog post
2. Remove filler words, repetitions, and verbal tics
3. Add proper structure with headings and paragraphs
4. Maintain the speaker's key insights and voice
5. Add context and explanations where needed
6. Include relevant quotes from the transcript
7. Make it SEO-friendly with good keyword usage
8. Add a compelling introduction that hooks readers
9. Include a conclusion with key takeaways

IMPORTANT:
- This is ${chunkIndex !== undefined ? `part ${chunkIndex + 1} of ${transcript.chunks.length}` : 'the complete transcript'}
- Maintain the Colemearchy voice and style
- Focus on biohacking, optimization, and practical insights
- Make it valuable for readers who haven't watched the video

Generate a well-structured blog post in Korean.
`;
  }
}