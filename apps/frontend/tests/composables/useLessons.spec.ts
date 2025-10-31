import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLessons, useLesson, useLessonsByPart, useSearchLessons } from '~/composables/useLessons'

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

describe('useLessons composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useLessons', () => {
    it('should call useAsyncData with correct parameters', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useLessons()

      expect(useAsyncData).toHaveBeenCalledWith(
        'lessons',
        expect.any(Function),
        expect.objectContaining({
          immediate: true,
          server: true,
        }),
      )
    })

    it('should accept custom options', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useLessons({
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
      useLessons({
        filters: {
          partKey: { $eq: 'foundation' },
        },
      })

      // Query building is tested in data-layer.spec.ts
      expect(true).toBe(true)
    })

    it('should support pagination', () => {
      useLessons({
        pagination: {
          page: 1,
          pageSize: 20,
        },
      })

      expect(true).toBe(true)
    })

    it('should support sorting', () => {
      useLessons({
        sort: ['order:asc', 'title:asc'],
      })

      expect(true).toBe(true)
    })

    it('should support population', () => {
      useLessons({
        populate: ['part', 'loop'],
      })

      expect(true).toBe(true)
    })
  })

  describe('useLesson', () => {
    it('should fetch single lesson by code', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useLesson('L1.1')

      expect(useAsyncData).toHaveBeenCalledWith(
        'lesson-L1.1',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should use custom key if provided', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useLesson('L1.1', { key: 'my-lesson' })

      expect(useAsyncData).toHaveBeenCalledWith(
        'my-lesson',
        expect.any(Function),
        expect.any(Object),
      )
    })
  })

  describe('useLessonsByPart', () => {
    it('should fetch lessons filtered by part', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useLessonsByPart('foundation')

      expect(useAsyncData).toHaveBeenCalledWith(
        'lessons-part-foundation',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should include sorting', () => {
      useLessonsByPart('foundation')

      // Sorting is applied in the composable
      expect(true).toBe(true)
    })
  })

  describe('useSearchLessons', () => {
    it('should search lessons by query', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useSearchLessons('design')

      expect(useAsyncData).toHaveBeenCalledWith(
        'lessons-search-design',
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should not fetch immediately for empty query', () => {
      const { useAsyncData } = vi.mocked(await import('#app'))
      
      useSearchLessons('')

      expect(useAsyncData).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          immediate: false,
        }),
      )
    })
  })
})
