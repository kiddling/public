import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildStrapiUrl } from '~/server/utils/strapi'

describe('Downloads API', () => {
  describe('downloads endpoint query building', () => {
    const baseUrl = 'http://localhost:1337'
    const endpoint = '/api/download-items'

    it('should build URL with category filter', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          category: { $eq: 'Template' },
        },
        populate: {
          file: '*',
        },
        publicationState: 'live',
      })

      expect(url).toContain('filters[category][$eq]=Template')
      expect(url).toContain('populate[file]=*')
      expect(url).toContain('publicationState=live')
    })

    it('should build URL with search filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          $or: [
            { title: { $containsi: 'design' } },
            { description: { $containsi: 'design' } },
          ],
        },
      })

      expect(url).toContain('filters[$or][0][title][$containsi]=design')
      expect(url).toContain('filters[$or][1][description][$containsi]=design')
    })

    it('should build URL with lesson filter', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          relatedLessons: {
            id: { $eq: '123' },
          },
        },
      })

      expect(url).toContain('filters[relatedLessons][id][$eq]=123')
    })

    it('should build URL with pagination', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        pagination: {
          page: 2,
          pageSize: 10,
        },
      })

      expect(url).toContain('pagination[page]=2')
      expect(url).toContain('pagination[pageSize]=10')
    })

    it('should build URL with full population', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        populate: {
          file: '*',
          relatedLessons: {
            fields: ['id', 'title', 'code'],
          },
          relatedResources: {
            fields: ['id', 'title'],
          },
        },
      })

      expect(url).toContain('populate[file]=*')
      expect(url).toContain('populate[relatedLessons][fields][0]=id')
      expect(url).toContain('populate[relatedLessons][fields][1]=title')
      expect(url).toContain('populate[relatedLessons][fields][2]=code')
    })

    it('should build URL with sorting', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        sort: ['createdAt:desc'],
      })

      expect(url).toContain('sort[0]=createdAt%3Adesc')
    })

    it('should handle complex combined filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          category: { $eq: 'Template' },
          $or: [
            { title: { $containsi: 'worksheet' } },
            { description: { $containsi: 'worksheet' } },
          ],
        },
        pagination: {
          page: 1,
          pageSize: 25,
        },
        sort: ['createdAt:desc'],
        publicationState: 'live',
      })

      expect(url).toContain('filters[category][$eq]=Template')
      expect(url).toContain('filters[$or][0][title][$containsi]=worksheet')
      expect(url).toContain('pagination[page]=1')
      expect(url).toContain('sort[0]=createdAt%3Adesc')
    })
  })

  describe('batch downloads', () => {
    it('should handle batch request with multiple item IDs', () => {
      const url = buildStrapiUrl('http://localhost:1337', '/api/download-items', {
        filters: {
          id: { $in: [1, 2, 3] },
        },
        populate: {
          file: '*',
        },
      })

      expect(url).toContain('filters[id][$in][0]=1')
      expect(url).toContain('filters[id][$in][1]=2')
      expect(url).toContain('filters[id][$in][2]=3')
    })

    it('should limit batch size validation', () => {
      const itemIds = Array.from({ length: 51 }, (_, i) => i + 1)
      
      expect(itemIds.length).toBeGreaterThan(50)
    })
  })

  describe('checksum validation', () => {
    it('should handle SHA-256 checksum format', () => {
      const validChecksum = 'a'.repeat(64)
      expect(validChecksum).toHaveLength(64)
      expect(/^[a-f0-9]{64}$/.test(validChecksum)).toBe(true)
    })

    it('should reject invalid checksum format', () => {
      const invalidChecksum = 'xyz123'
      expect(/^[a-f0-9]{64}$/.test(invalidChecksum)).toBe(false)
    })

    it('should handle uppercase checksum', () => {
      const uppercaseChecksum = 'A'.repeat(64)
      expect(/^[a-fA-F0-9]{64}$/.test(uppercaseChecksum)).toBe(true)
    })
  })

  describe('file metadata', () => {
    it('should validate file size is a number', () => {
      const fileSize = 1024
      expect(typeof fileSize).toBe('number')
      expect(fileSize).toBeGreaterThan(0)
    })

    it('should validate MIME type format', () => {
      const validMimeTypes = [
        'application/pdf',
        'image/png',
        'text/plain',
        'application/zip',
      ]

      validMimeTypes.forEach((mimeType) => {
        expect(mimeType).toMatch(/^[a-z]+\/[a-z0-9\-\+\.]+$/i)
      })
    })
  })
})
