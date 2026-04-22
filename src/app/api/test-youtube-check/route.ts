export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getLatestVideos, isVideoAlreadyProcessed } from '../../../../scripts/auto-youtube-sync'

/**
 * YouTube 동기화 테스트 API (개발용)
 * 실제 변환은 하지 않고 새로운 영상들만 확인
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 YouTube 채널 최신 영상 확인 중...')

    // 최신 영상들 가져오기
    const videos = await getLatestVideos(10)

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No videos found',
        videos: [],
        newVideos: []
      })
    }

    // 새로운 영상들 필터링
    const videoResults = []
    for (const video of videos) {
      const isProcessed = await isVideoAlreadyProcessed(video.videoId)
      videoResults.push({
        videoId: video.videoId,
        title: video.title,
        publishedAt: video.publishedAt,
        isAlreadyProcessed: isProcessed,
        isNew: !isProcessed,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        viewCount: parseInt(video.viewCount).toLocaleString()
      })
    }

    const newVideos = videoResults.filter(v => v.isNew)

    return NextResponse.json({
      success: true,
      message: `Found ${videos.length} videos, ${newVideos.length} are new`,
      totalVideos: videos.length,
      newVideosCount: newVideos.length,
      videos: videoResults,
      newVideos: newVideos.map(v => ({
        videoId: v.videoId,
        title: v.title,
        publishedAt: v.publishedAt
      }))
    })

  } catch (error) {
    console.error('❌ YouTube 동기화 테스트 실패:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}