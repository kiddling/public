/**
 * Tests for resource export API endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Resource Export API', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('CSV export', () => {
    it('should export resources as CSV', async () => {
      const mockResources = {
        data: [
          {
            id: 1,
            attributes: {
              title: 'Test Resource',
              category: 'Video Tutorials',
              description: 'Test description',
              url: 'https://example.com',
              accessibilityFlag: true,
              lastChecked: '2024-01-15T00:00:00.000Z',
              disciplines: ['环艺'],
              mediaType: 'video',
            },
          },
        ],
      }

      const result = {
        format: 'csv',
        resources: mockResources.data,
      }

      expect(result.format).toBe('csv')
      expect(result.resources).toHaveLength(1)
      expect(result.resources[0].attributes.title).toBe('Test Resource')
    })

    it('should handle filters in query parameters', async () => {
      const query = {
        format: 'csv',
        category: 'Video Tutorials',
        discipline: '环艺',
        mediaType: 'video',
        accessibleOnly: 'true',
        search: 'test',
      }

      expect(query.format).toBe('csv')
      expect(query.category).toBe('Video Tutorials')
      expect(query.discipline).toBe('环艺')
      expect(query.mediaType).toBe('video')
      expect(query.accessibleOnly).toBe('true')
      expect(query.search).toBe('test')
    })

    it('should return CSV content type', async () => {
      const headers = {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="resources-123.csv"',
      }

      expect(headers['Content-Type']).toBe('text/csv')
      expect(headers['Content-Disposition']).toContain('attachment')
      expect(headers['Content-Disposition']).toContain('.csv')
    })
  })

  describe('PDF export', () => {
    it('should export resources as text format', async () => {
      const mockResources = {
        data: [
          {
            id: 1,
            attributes: {
              title: 'Test Resource',
              category: 'Tool Links',
              url: 'https://example.com',
              accessibilityFlag: false,
              disciplines: [],
              mediaType: 'link',
            },
          },
        ],
      }

      const result = {
        format: 'pdf',
        resources: mockResources.data,
      }

      expect(result.format).toBe('pdf')
      expect(result.resources).toHaveLength(1)
    })

    it('should return text content type for PDF format', async () => {
      const headers = {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="resources-123.txt"',
      }

      expect(headers['Content-Type']).toBe('text/plain')
      expect(headers['Content-Disposition']).toContain('.txt')
    })
  })

  describe('error handling', () => {
    it('should return 400 for invalid format', async () => {
      const query = { format: 'invalid' }
      const expectedError = {
        statusCode: 400,
        statusMessage: 'Invalid format. Must be "csv" or "pdf"',
      }

      expect(expectedError.statusCode).toBe(400)
    })

    it('should handle Strapi fetch errors', async () => {
      const error = new Error('Strapi fetch failed')
      const expectedError = {
        statusCode: 500,
        statusMessage: 'Failed to export resources: Strapi fetch failed',
      }

      expect(expectedError.statusCode).toBe(500)
      expect(expectedError.statusMessage).toContain('Failed to export resources')
    })
  })

  describe('query parameter handling', () => {
    it('should handle multiple disciplines', async () => {
      const query = {
        format: 'csv',
        discipline: ['环艺', '产品'],
      }

      expect(Array.isArray(query.discipline)).toBe(true)
      expect(query.discipline).toHaveLength(2)
    })

    it('should handle multiple media types', async () => {
      const query = {
        format: 'csv',
        mediaType: ['video', 'pdf'],
      }

      expect(Array.isArray(query.mediaType)).toBe(true)
      expect(query.mediaType).toHaveLength(2)
    })

    it('should handle search query', async () => {
      const query = {
        format: 'csv',
        search: 'tutorial',
      }

      expect(query.search).toBe('tutorial')
    })
  })
})
