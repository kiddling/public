import { describe, it, expect } from 'vitest'
import type { VideoEmbed as VideoEmbedType } from '~/utils/video-providers'

describe('VideoEmbed Component Integration', () => {
  const createMockEmbed = (overrides?: Partial<VideoEmbedType>): VideoEmbedType => ({
    id: 'test-video-1',
    provider: 'bilibili',
    videoId: 'BV1GJ411x7h7',
    title: 'Test Video',
    description: 'A test video description',
    ...overrides,
  })

  describe('Video Embed Data Structure', () => {
    it('should have valid embed structure for Bilibili', () => {
      const embed = createMockEmbed({ provider: 'bilibili', videoId: 'BV1GJ411x7h7' })
      
      expect(embed.provider).toBe('bilibili')
      expect(embed.videoId).toBe('BV1GJ411x7h7')
      expect(embed.title).toBe('Test Video')
      expect(embed.description).toBe('A test video description')
    })

    it('should have valid embed structure for Tencent', () => {
      const embed = createMockEmbed({ provider: 'tencent', videoId: 'a0123456789' })
      
      expect(embed.provider).toBe('tencent')
      expect(embed.videoId).toBe('a0123456789')
    })

    it('should have valid embed structure for Youku', () => {
      const embed = createMockEmbed({ provider: 'youku', videoId: 'XNDg1MjU2MTA0' })
      
      expect(embed.provider).toBe('youku')
      expect(embed.videoId).toBe('XNDg1MjU2MTA0')
    })

    it('should support optional cover image', () => {
      const embed = createMockEmbed({
        coverImage: {
          url: 'https://example.com/cover.jpg',
          alt: 'Test cover',
        },
      })
      
      expect(embed.coverImage).toBeDefined()
      expect(embed.coverImage?.url).toBe('https://example.com/cover.jpg')
      expect(embed.coverImage?.alt).toBe('Test cover')
    })

    it('should support optional start time', () => {
      const embed = createMockEmbed({ startTime: 60 })
      
      expect(embed.startTime).toBe(60)
    })

    it('should support optional fallback notes', () => {
      const embed = createMockEmbed({ 
        fallbackNotes: 'This video may not be available in your region' 
      })
      
      expect(embed.fallbackNotes).toBe('This video may not be available in your region')
    })
  })

  describe('Storage Key Format', () => {
    it('should generate correct storage key for Bilibili', () => {
      const embed = createMockEmbed({ provider: 'bilibili', videoId: 'BV1GJ411x7h7' })
      const storageKey = `video-progress:${embed.provider}:${embed.videoId}`
      
      expect(storageKey).toBe('video-progress:bilibili:BV1GJ411x7h7')
    })

    it('should generate correct storage key for Tencent', () => {
      const embed = createMockEmbed({ provider: 'tencent', videoId: 'a0123456789' })
      const storageKey = `video-progress:${embed.provider}:${embed.videoId}`
      
      expect(storageKey).toBe('video-progress:tencent:a0123456789')
    })

    it('should generate correct storage key for Youku', () => {
      const embed = createMockEmbed({ provider: 'youku', videoId: 'XNDg1MjU2MTA0' })
      const storageKey = `video-progress:${embed.provider}:${embed.videoId}`
      
      expect(storageKey).toBe('video-progress:youku:XNDg1MjU2MTA0')
    })
  })
})
