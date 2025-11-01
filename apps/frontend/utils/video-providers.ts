export type VideoProvider = 'bilibili' | 'tencent' | 'youku'

export interface VideoEmbed {
  id: string | number
  provider: VideoProvider
  videoId: string
  videoUrl?: string | null
  title?: string | null
  description?: string | null
  coverImage?: {
    url: string
    alt?: string | null
  } | null
  startTime?: number
  fallbackNotes?: string | null
}

export interface ParsedVideoInfo {
  provider: VideoProvider | null
  videoId: string | null
  startTime?: number
}

export function parseVideoUrl(url: string): ParsedVideoInfo {
  if (!url) {
    return { provider: null, videoId: null }
  }

  const bilibiliMatch = url.match(
    /(?:bilibili\.com\/video\/(BV[a-zA-Z0-9]+)|bilibili\.com\/video\/av(\d+))/i
  )
  if (bilibiliMatch) {
    return {
      provider: 'bilibili',
      videoId: bilibiliMatch[1] || `av${bilibiliMatch[2]}`,
      startTime: extractTimeParam(url, ['t']),
    }
  }

  const tencentMatch = url.match(
    /(?:v\.qq\.com\/x\/(?:page|cover)\/([a-zA-Z0-9]+)|qq\.com\/x\/cover\/[^/]+\/([a-zA-Z0-9]+)\.html)/i
  )
  if (tencentMatch) {
    return {
      provider: 'tencent',
      videoId: tencentMatch[1] || tencentMatch[2],
      startTime: extractTimeParam(url, ['t', 'start']),
    }
  }

  const youkuMatch = url.match(
    /youku\.com\/v_show\/id_([a-zA-Z0-9_-]+)(?:\.html)?/i
  )
  if (youkuMatch) {
    return {
      provider: 'youku',
      videoId: youkuMatch[1],
      startTime: extractTimeParam(url, ['t']),
    }
  }

  return { provider: null, videoId: null }
}

function extractTimeParam(url: string, paramNames: string[]): number | undefined {
  const urlObj = new URL(url, 'https://example.com')
  for (const param of paramNames) {
    const value = urlObj.searchParams.get(param)
    if (value) {
      const time = parseInt(value, 10)
      if (!isNaN(time)) {
        return time
      }
    }
  }
  return undefined
}

export function generateEmbedUrl(
  provider: VideoProvider,
  videoId: string,
  startTime?: number
): string {
  const time = startTime && startTime > 0 ? startTime : 0

  switch (provider) {
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${videoId}&high_quality=1&autoplay=0${time > 0 ? `&t=${time}` : ''}`
    case 'tencent':
      return `https://v.qq.com/txp/iframe/player.html?vid=${videoId}${time > 0 ? `&t=${time}` : ''}`
    case 'youku':
      return `https://player.youku.com/embed/${videoId}${time > 0 ? `?t=${time}` : ''}`
    default:
      return ''
  }
}

export function generateDirectUrl(
  provider: VideoProvider,
  videoId: string
): string {
  switch (provider) {
    case 'bilibili':
      return `https://www.bilibili.com/video/${videoId}`
    case 'tencent':
      return `https://v.qq.com/x/page/${videoId}.html`
    case 'youku':
      return `https://v.youku.com/v_show/id_${videoId}.html`
    default:
      return ''
  }
}

export function normalizeVideoId(
  provider: VideoProvider,
  videoId: string,
  videoUrl?: string | null
): string {
  if (videoUrl) {
    const parsed = parseVideoUrl(videoUrl)
    if (parsed.videoId && parsed.provider === provider) {
      return parsed.videoId
    }
  }
  return videoId
}

export function getProviderName(provider: VideoProvider): string {
  const names: Record<VideoProvider, string> = {
    bilibili: 'Bilibili',
    tencent: 'Tencent Video',
    youku: 'Youku',
  }
  return names[provider] || provider
}
