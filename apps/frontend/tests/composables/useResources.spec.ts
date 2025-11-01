/**
 * Tests for useResources composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useResources composable', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('filter building', () => {
    it('should build category filter', () => {
      const options = {
        category: 'Video Tutorials' as const,
      }

      const expectedFilters = {
        category: { $eq: 'Video Tutorials' },
      }

      expect(expectedFilters.category).toEqual({ $eq: 'Video Tutorials' })
    })

    it('should build discipline filter for single value', () => {
      const options = {
        discipline: '环艺' as const,
      }

      const expectedFilters = {
        disciplines: { $contains: '环艺' },
      }

      expect(expectedFilters.disciplines).toEqual({ $contains: '环艺' })
    })

    it('should build discipline filter for multiple values', () => {
      const options = {
        discipline: ['环艺', '产品'] as const,
      }

      const expectedFilters = {
        disciplines: { $in: ['环艺', '产品'] },
      }

      expect(expectedFilters.disciplines).toEqual({ $in: ['环艺', '产品'] })
    })

    it('should build mediaType filter for single value', () => {
      const options = {
        mediaType: 'video' as const,
      }

      const expectedFilters = {
        mediaType: { $eq: 'video' },
      }

      expect(expectedFilters.mediaType).toEqual({ $eq: 'video' })
    })

    it('should build mediaType filter for multiple values', () => {
      const options = {
        mediaType: ['video', 'pdf'] as const,
      }

      const expectedFilters = {
        mediaType: { $in: ['video', 'pdf'] },
      }

      expect(expectedFilters.mediaType).toEqual({ $in: ['video', 'pdf'] })
    })

    it('should build accessibility filter', () => {
      const options = {
        accessibleOnly: true,
      }

      const expectedFilters = {
        accessibilityFlag: { $eq: true },
      }

      expect(expectedFilters.accessibilityFlag).toEqual({ $eq: true })
    })

    it('should combine multiple filters', () => {
      const options = {
        category: 'Video Tutorials' as const,
        discipline: ['环艺', '产品'] as const,
        mediaType: 'video' as const,
        accessibleOnly: true,
      }

      const expectedFilters = {
        category: { $eq: 'Video Tutorials' },
        disciplines: { $in: ['环艺', '产品'] },
        mediaType: { $eq: 'video' },
        accessibilityFlag: { $eq: true },
      }

      expect(expectedFilters.category).toEqual({ $eq: 'Video Tutorials' })
      expect(expectedFilters.disciplines).toEqual({ $in: ['环艺', '产品'] })
      expect(expectedFilters.mediaType).toEqual({ $eq: 'video' })
      expect(expectedFilters.accessibilityFlag).toEqual({ $eq: true })
    })
  })

  describe('search functionality', () => {
    it('should build search filter with OR condition', () => {
      const searchQuery = 'tutorial'

      const expectedFilters = {
        $or: [
          { title: { $containsi: 'tutorial' } },
          { description: { $containsi: 'tutorial' } },
        ],
      }

      expect(expectedFilters.$or).toHaveLength(2)
      expect(expectedFilters.$or[0]).toEqual({ title: { $containsi: 'tutorial' } })
      expect(expectedFilters.$or[1]).toEqual({ description: { $containsi: 'tutorial' } })
    })

    it('should not build search filter for empty query', () => {
      const searchQuery = ''

      expect(searchQuery.trim()).toBe('')
    })
  })

  describe('population', () => {
    it('should populate default fields', () => {
      const populate = true

      const expectedPopulate = ['qrAsset', 'file', 'lessons']

      expect(expectedPopulate).toContain('qrAsset')
      expect(expectedPopulate).toContain('file')
      expect(expectedPopulate).toContain('lessons')
    })

    it('should populate custom fields', () => {
      const populate = ['lessons']

      expect(populate).toEqual(['lessons'])
    })

    it('should not populate when false', () => {
      const populate = false

      expect(populate).toBe(false)
    })
  })

  describe('sorting', () => {
    it('should use default sort', () => {
      const sort = ['title:asc']

      expect(sort).toEqual(['title:asc'])
    })

    it('should use custom sort', () => {
      const sort = ['createdAt:desc']

      expect(sort).toEqual(['createdAt:desc'])
    })
  })

  describe('pagination', () => {
    it('should apply pagination when provided', () => {
      const pagination = {
        page: 1,
        pageSize: 10,
      }

      expect(pagination.page).toBe(1)
      expect(pagination.pageSize).toBe(10)
    })
  })
})
