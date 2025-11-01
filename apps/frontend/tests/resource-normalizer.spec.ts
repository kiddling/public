/**
 * Tests for resource normalizer utilities
 */

import { describe, it, expect } from 'vitest'
import {
  normalizeResource,
  normalizeResources,
  getAccessibilityStatus,
  groupResourcesByCategory,
  filterResourcesBySearch,
  sortResources,
  getResourcesNeedingAttention,
  calculateResourceStats,
} from '~/utils/resource-normalizer'
import type { Resource, StrapiCollectionItem, ResourceAttributes, StrapiResourceResponse } from '~/types/cms'

describe('Resource Normalizer', () => {
  const mockStrapiItem: StrapiCollectionItem<ResourceAttributes> = {
    id: 1,
    attributes: {
      title: 'Test Resource',
      category: 'Video Tutorials',
      description: '<p>Test description</p>',
      url: 'https://example.com',
      accessibilityFlag: true,
      lastChecked: '2024-01-15T00:00:00.000Z',
      disciplines: ['环艺', '产品'],
      mediaType: 'video',
      qrAsset: null,
      file: null,
      lessons: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      publishedAt: '2024-01-15T00:00:00.000Z',
    },
  }

  describe('normalizeResource', () => {
    it('should normalize a single resource', () => {
      const result = normalizeResource(mockStrapiItem)

      expect(result.id).toBe(1)
      expect(result.title).toBe('Test Resource')
      expect(result.category).toBe('Video Tutorials')
      expect(result.mediaType).toBe('video')
      expect(result.disciplines).toEqual(['环艺', '产品'])
    })

    it('should handle missing optional fields', () => {
      const minimalItem: StrapiCollectionItem<ResourceAttributes> = {
        id: 2,
        attributes: {
          title: 'Minimal Resource',
          url: 'https://example.com',
        },
      }

      const result = normalizeResource(minimalItem)

      expect(result.id).toBe(2)
      expect(result.title).toBe('Minimal Resource')
      expect(result.category).toBeNull()
      expect(result.disciplines).toEqual([])
      expect(result.mediaType).toBe('link')
    })

    it('should set default values correctly', () => {
      const item: StrapiCollectionItem<ResourceAttributes> = {
        id: 3,
        attributes: {
          title: 'Default Values',
          url: 'https://example.com',
        },
      }

      const result = normalizeResource(item)

      expect(result.accessibilityFlag).toBe(true)
      expect(result.mediaType).toBe('link')
      expect(result.disciplines).toEqual([])
    })
  })

  describe('normalizeResources', () => {
    it('should normalize multiple resources', () => {
      const response: StrapiResourceResponse = {
        data: [mockStrapiItem],
        meta: {},
      }

      const result = normalizeResources(response)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should handle empty response', () => {
      const response: StrapiResourceResponse = {
        data: [],
        meta: {},
      }

      const result = normalizeResources(response)

      expect(result).toEqual([])
    })

    it('should handle invalid response', () => {
      const result = normalizeResources(null as any)

      expect(result).toEqual([])
    })
  })

  describe('getAccessibilityStatus', () => {
    it('should return verified status for recent check', () => {
      const lastChecked = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const result = getAccessibilityStatus(true, lastChecked)

      expect(result.status).toBe('verified')
      expect(result.severity).toBe('success')
    })

    it('should return needs-revalidation for old check', () => {
      const lastChecked = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
      const result = getAccessibilityStatus(true, lastChecked, 90)

      expect(result.status).toBe('needs-revalidation')
      expect(result.severity).toBe('warning')
    })

    it('should return needs-attention for inaccessible resources', () => {
      const result = getAccessibilityStatus(false, null)

      expect(result.status).toBe('needs-attention')
      expect(result.severity).toBe('warning')
    })

    it('should return unknown for unchecked resources', () => {
      const result = getAccessibilityStatus(true, null)

      expect(result.status).toBe('unknown')
      expect(result.severity).toBe('info')
    })
  })

  describe('groupResourcesByCategory', () => {
    it('should group resources by category', () => {
      const resources: Resource[] = [
        { id: 1, title: 'Resource 1', category: 'Video Tutorials', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'video' },
        { id: 2, title: 'Resource 2', category: 'Video Tutorials', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'video' },
        { id: 3, title: 'Resource 3', category: 'Tool Links', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'link' },
      ]

      const result = groupResourcesByCategory(resources)

      expect(result).toHaveLength(2)
      expect(result[0].count).toBe(2)
      expect(result[1].count).toBe(1)
    })

    it('should handle uncategorized resources', () => {
      const resources: Resource[] = [
        { id: 1, title: 'Resource', category: null, url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'link' },
      ]

      const result = groupResourcesByCategory(resources)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Uncategorized')
    })
  })

  describe('filterResourcesBySearch', () => {
    const resources: Resource[] = [
      { id: 1, title: 'Video Tutorial', category: 'Video Tutorials', description: 'Learn video editing', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'video' },
      { id: 2, title: 'Tool Link', category: 'Tool Links', description: 'Design tool', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'link' },
    ]

    it('should filter by title', () => {
      const result = filterResourcesBySearch(resources, 'video')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Video Tutorial')
    })

    it('should filter by description', () => {
      const result = filterResourcesBySearch(resources, 'design')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Tool Link')
    })

    it('should be case insensitive', () => {
      const result = filterResourcesBySearch(resources, 'VIDEO')

      expect(result).toHaveLength(1)
    })

    it('should return all resources for empty query', () => {
      const result = filterResourcesBySearch(resources, '')

      expect(result).toHaveLength(2)
    })
  })

  describe('sortResources', () => {
    const resources: Resource[] = [
      { id: 1, title: 'B Resource', category: 'Tool Links', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'link', createdAt: '2024-01-02T00:00:00.000Z' },
      { id: 2, title: 'A Resource', category: 'Video Tutorials', url: 'https://example.com', accessibilityFlag: true, disciplines: [], mediaType: 'video', createdAt: '2024-01-01T00:00:00.000Z' },
    ]

    it('should sort by title ascending', () => {
      const result = sortResources(resources, 'title', 'asc')

      expect(result[0].title).toBe('A Resource')
      expect(result[1].title).toBe('B Resource')
    })

    it('should sort by title descending', () => {
      const result = sortResources(resources, 'title', 'desc')

      expect(result[0].title).toBe('B Resource')
      expect(result[1].title).toBe('A Resource')
    })

    it('should sort by category', () => {
      const result = sortResources(resources, 'category', 'asc')

      expect(result[0].category).toBe('Tool Links')
      expect(result[1].category).toBe('Video Tutorials')
    })

    it('should sort by createdAt', () => {
      const result = sortResources(resources, 'createdAt', 'asc')

      expect(result[0].createdAt).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('getResourcesNeedingAttention', () => {
    it('should return resources with accessibility issues', () => {
      const resources: Resource[] = [
        { id: 1, title: 'Good', url: 'https://example.com', accessibilityFlag: true, lastChecked: new Date().toISOString(), disciplines: [], mediaType: 'link' },
        { id: 2, title: 'Bad', url: 'https://example.com', accessibilityFlag: false, lastChecked: null, disciplines: [], mediaType: 'link' },
      ]

      const result = getResourcesNeedingAttention(resources)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(2)
    })

    it('should return resources needing revalidation', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
      const resources: Resource[] = [
        { id: 1, title: 'Old', url: 'https://example.com', accessibilityFlag: true, lastChecked: oldDate, disciplines: [], mediaType: 'link' },
      ]

      const result = getResourcesNeedingAttention(resources, 90)

      expect(result).toHaveLength(1)
    })
  })

  describe('calculateResourceStats', () => {
    it('should calculate comprehensive statistics', () => {
      const resources: Resource[] = [
        { id: 1, title: 'R1', category: 'Video Tutorials', url: 'https://example.com', accessibilityFlag: true, lastChecked: new Date().toISOString(), disciplines: ['环艺'], mediaType: 'video' },
        { id: 2, title: 'R2', category: 'Video Tutorials', url: 'https://example.com', accessibilityFlag: false, lastChecked: null, disciplines: ['产品'], mediaType: 'pdf' },
        { id: 3, title: 'R3', category: 'Tool Links', url: 'https://example.com', accessibilityFlag: true, lastChecked: null, disciplines: ['环艺'], mediaType: 'link' },
      ]

      const result = calculateResourceStats(resources)

      expect(result.total).toBe(3)
      expect(result.accessible).toBeGreaterThan(0)
      expect(result.byCategory['Video Tutorials']).toBe(2)
      expect(result.byCategory['Tool Links']).toBe(1)
      expect(result.byMediaType['video']).toBe(1)
      expect(result.byMediaType['pdf']).toBe(1)
      expect(result.byMediaType['link']).toBe(1)
      expect(result.byDiscipline['环艺']).toBe(2)
      expect(result.byDiscipline['产品']).toBe(1)
    })

    it('should handle empty resources', () => {
      const result = calculateResourceStats([])

      expect(result.total).toBe(0)
      expect(result.accessible).toBe(0)
      expect(result.needsAttention).toBe(0)
      expect(result.unchecked).toBe(0)
    })
  })
})
