import { describe, it, expect } from 'vitest'
import {
  parseVideoUrl,
  generateEmbedUrl,
  generateDirectUrl,
  normalizeVideoId,
  getProviderName,
} from '~/utils/video-providers'

describe('Video Providers Utility', () => {
  describe('parseVideoUrl', () => {
    it('should parse Bilibili BV video URL', () => {
      const result = parseVideoUrl('https://www.bilibili.com/video/BV1GJ411x7h7')
      expect(result.provider).toBe('bilibili')
      expect(result.videoId).toBe('BV1GJ411x7h7')
    })

    it('should parse Bilibili av video URL', () => {
      const result = parseVideoUrl('https://www.bilibili.com/video/av170001')
      expect(result.provider).toBe('bilibili')
      expect(result.videoId).toBe('av170001')
    })

    it('should parse Bilibili URL with timestamp', () => {
      const result = parseVideoUrl('https://www.bilibili.com/video/BV1GJ411x7h7?t=120')
      expect(result.provider).toBe('bilibili')
      expect(result.videoId).toBe('BV1GJ411x7h7')
      expect(result.startTime).toBe(120)
    })

    it('should parse Tencent Video URL', () => {
      const result = parseVideoUrl('https://v.qq.com/x/page/a0123456789.html')
      expect(result.provider).toBe('tencent')
      expect(result.videoId).toBe('a0123456789')
    })

    it('should parse Tencent Video cover URL', () => {
      const result = parseVideoUrl('https://v.qq.com/x/cover/mzc00200xyz/abc123.html')
      expect(result.provider).toBe('tencent')
      expect(result.videoId).toBe('abc123')
    })

    it('should parse Youku video URL', () => {
      const result = parseVideoUrl('https://v.youku.com/v_show/id_XNDg1MjU2MTA0.html')
      expect(result.provider).toBe('youku')
      expect(result.videoId).toBe('XNDg1MjU2MTA0')
    })

    it('should parse Youku URL without .html extension', () => {
      const result = parseVideoUrl('https://v.youku.com/v_show/id_XNDg1MjU2MTA0')
      expect(result.provider).toBe('youku')
      expect(result.videoId).toBe('XNDg1MjU2MTA0')
    })

    it('should return null for unrecognized URL', () => {
      const result = parseVideoUrl('https://youtube.com/watch?v=abc123')
      expect(result.provider).toBeNull()
      expect(result.videoId).toBeNull()
    })

    it('should return null for empty URL', () => {
      const result = parseVideoUrl('')
      expect(result.provider).toBeNull()
      expect(result.videoId).toBeNull()
    })
  })

  describe('generateEmbedUrl', () => {
    it('should generate Bilibili embed URL', () => {
      const url = generateEmbedUrl('bilibili', 'BV1GJ411x7h7')
      expect(url).toBe('https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&high_quality=1&autoplay=0')
    })

    it('should generate Bilibili embed URL with start time', () => {
      const url = generateEmbedUrl('bilibili', 'BV1GJ411x7h7', 120)
      expect(url).toBe('https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&high_quality=1&autoplay=0&t=120')
    })

    it('should generate Tencent Video embed URL', () => {
      const url = generateEmbedUrl('tencent', 'a0123456789')
      expect(url).toBe('https://v.qq.com/txp/iframe/player.html?vid=a0123456789')
    })

    it('should generate Tencent Video embed URL with start time', () => {
      const url = generateEmbedUrl('tencent', 'a0123456789', 60)
      expect(url).toBe('https://v.qq.com/txp/iframe/player.html?vid=a0123456789&t=60')
    })

    it('should generate Youku embed URL', () => {
      const url = generateEmbedUrl('youku', 'XNDg1MjU2MTA0')
      expect(url).toBe('https://player.youku.com/embed/XNDg1MjU2MTA0')
    })

    it('should generate Youku embed URL with start time', () => {
      const url = generateEmbedUrl('youku', 'XNDg1MjU2MTA0', 30)
      expect(url).toBe('https://player.youku.com/embed/XNDg1MjU2MTA0?t=30')
    })

    it('should ignore start time of 0', () => {
      const url = generateEmbedUrl('bilibili', 'BV1GJ411x7h7', 0)
      expect(url).toBe('https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&high_quality=1&autoplay=0')
    })
  })

  describe('generateDirectUrl', () => {
    it('should generate Bilibili direct URL', () => {
      const url = generateDirectUrl('bilibili', 'BV1GJ411x7h7')
      expect(url).toBe('https://www.bilibili.com/video/BV1GJ411x7h7')
    })

    it('should generate Tencent Video direct URL', () => {
      const url = generateDirectUrl('tencent', 'a0123456789')
      expect(url).toBe('https://v.qq.com/x/page/a0123456789.html')
    })

    it('should generate Youku direct URL', () => {
      const url = generateDirectUrl('youku', 'XNDg1MjU2MTA0')
      expect(url).toBe('https://v.youku.com/v_show/id_XNDg1MjU2MTA0.html')
    })
  })

  describe('normalizeVideoId', () => {
    it('should return provided videoId when no URL given', () => {
      const id = normalizeVideoId('bilibili', 'BV123456789')
      expect(id).toBe('BV123456789')
    })

    it('should extract videoId from URL when available', () => {
      const id = normalizeVideoId(
        'bilibili',
        'BV123456789',
        'https://www.bilibili.com/video/BV1GJ411x7h7'
      )
      expect(id).toBe('BV1GJ411x7h7')
    })

    it('should return provided videoId when URL is for different provider', () => {
      const id = normalizeVideoId(
        'bilibili',
        'BV123456789',
        'https://v.youku.com/v_show/id_XNDg1MjU2MTA0.html'
      )
      expect(id).toBe('BV123456789')
    })

    it('should return provided videoId when URL is unparseable', () => {
      const id = normalizeVideoId(
        'bilibili',
        'BV123456789',
        'https://example.com/video'
      )
      expect(id).toBe('BV123456789')
    })
  })

  describe('getProviderName', () => {
    it('should return display name for Bilibili', () => {
      expect(getProviderName('bilibili')).toBe('Bilibili')
    })

    it('should return display name for Tencent Video', () => {
      expect(getProviderName('tencent')).toBe('Tencent Video')
    })

    it('should return display name for Youku', () => {
      expect(getProviderName('youku')).toBe('Youku')
    })
  })
})
