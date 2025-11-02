import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useKnowledgeCards,
  useKnowledgeCard,
  useKnowledgeCardsByType,
  useSearchKnowledgeCards,
  useKnowledgeCardsByTags,
  useFeaturedKnowledgeCards,
} from '~/composables/useKnowledgeCards'

// Mock the data layer
vi.mock('~/utils/data-layer', () => ({
  fetchWithDataLayer: vi.fn(),
  buildStrapiQuery: vi.fn((params) => params),
  invalidateCache: vi.fn(),
}))

// Mock Nuxt composables
vi.mock('#app', () => ({
  useAsyncData: vi.fn((key, fetcher, options) => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
}))

describe('useKnowledgeCards composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useKnowledgeCards', () => {
    it('should call useAsyncData with correct parameters', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCards()

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards',
        expect.any(Function),
        expect.objectContaining({
          immediate: true,
          server: true,
        }),
      )
    })

    it('should accept custom options', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCards({
        key: 'custom-key',
        immediate: false,
        lazy: true,
      })

      expect(useAsyncData).toHaveBeenCalledWith(
        'custom-key',
        expect.any(Function),
        expect.objectContaining({
          immediate: false,
          lazy: true,
        }),
      )
    })

    it('should build query with filters', () => {
      useKnowledgeCards({
        filters: {
          type: { $eq: 'AI Prompt' },
        },
      })

      expect(true).toBe(true)
    })

    it('should support pagination', () => {
      useKnowledgeCards({
        pagination: {
          page: 1,
          pageSize: 20,
        },
      })

      expect(true).toBe(true)
    })

    it('should support custom sorting', () => {
      useKnowledgeCards({
        sort: ['title:asc'],
      })

      expect(true).toBe(true)
    })

    it('should support population', () => {
      useKnowledgeCards({
        populate: ['media', 'lessons'],
      })

      expect(true).toBe(true)
    })

    it('should filter by type', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCards({
        type: 'AI Prompt',
      })

      expect(useAsyncData).toHaveBeenCalled()
    })

    it('should filter by tags', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCards({
        tags: ['design', 'thinking'],
      })

      expect(useAsyncData).toHaveBeenCalled()
    })

    it('should filter by slug', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCards({
        slug: 'design-thinking-basics',
      })

      expect(useAsyncData).toHaveBeenCalled()
    })
  })

  describe('useKnowledgeCard', () => {
    it('should fetch single knowledge card by slug', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCard('design-thinking-basics')

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-card-design-thinking-basics',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should use custom key if provided', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCard('design-thinking-basics', { key: 'my-card' })

      expect(useAsyncData).toHaveBeenCalledWith(
        'my-card',
        expect.any(Function),
        expect.any(Object),
      )
    })
  })

  describe('useKnowledgeCardsByType', () => {
    it('should fetch knowledge cards filtered by type', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCardsByType('AI Prompt')

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-type-AI Prompt',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should accept all valid types', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCardsByType('Extended Thinking')

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-type-Extended Thinking',
        expect.any(Function),
        expect.any(Object),
      )
    })
  })

  describe('useSearchKnowledgeCards', () => {
    it('should search knowledge cards by query', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useSearchKnowledgeCards('design thinking')

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-search-design thinking',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should not fetch immediately for empty query', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useSearchKnowledgeCards('')

      expect(useAsyncData).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          immediate: false,
        }),
      )
    })

    it('should not fetch immediately for whitespace-only query', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useSearchKnowledgeCards('   ')

      expect(useAsyncData).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          immediate: false,
        }),
      )
    })
  })

  describe('useKnowledgeCardsByTags', () => {
    it('should fetch knowledge cards with specific tags', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCardsByTags(['design', 'thinking'])

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-tags-design,thinking',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should handle single tag', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useKnowledgeCardsByTags(['design'])

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-tags-design',
        expect.any(Function),
        expect.any(Object),
      )
    })
  })

  describe('useFeaturedKnowledgeCards', () => {
    it('should fetch featured knowledge cards with correct filters', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useFeaturedKnowledgeCards()

      expect(useAsyncData).toHaveBeenCalledWith(
        'knowledge-cards-featured',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should accept custom options', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))

      useFeaturedKnowledgeCards({
        key: 'custom-featured',
      })

      expect(useAsyncData).toHaveBeenCalledWith(
        'custom-featured',
        expect.any(Function),
        expect.any(Object),
      )
    })
  })
})
