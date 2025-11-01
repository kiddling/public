/**
 * Tests for resource export utilities
 */

import { describe, it, expect } from 'vitest'
import { generateResourceCSV, generateResourcePDFText } from '~/utils/resource-export'
import type { Resource } from '~/types/cms'

describe('Resource Export Utilities', () => {
  const mockResources: Resource[] = [
    {
      id: 1,
      title: 'Test Resource 1',
      category: 'Video Tutorials',
      description: '<p>This is a <strong>test</strong> description</p>',
      url: 'https://example.com/resource1',
      accessibilityFlag: true,
      lastChecked: '2024-01-15T00:00:00.000Z',
      disciplines: ['环艺', '产品'],
      mediaType: 'video',
    },
    {
      id: 2,
      title: 'Test Resource 2',
      category: 'Tool Links',
      description: '<p>Another test description</p>',
      url: 'https://example.com/resource2',
      accessibilityFlag: false,
      lastChecked: null,
      disciplines: ['视传'],
      mediaType: 'link',
    },
  ]

  describe('generateResourceCSV', () => {
    it('should generate valid CSV with headers', () => {
      const csv = generateResourceCSV(mockResources)
      const lines = csv.split('\n')

      expect(lines[0]).toBe('ID,Title,Category,Media Type,Disciplines,URL,Accessibility,Last Checked,Description')
    })

    it('should include all resources as rows', () => {
      const csv = generateResourceCSV(mockResources)
      const lines = csv.split('\n')

      expect(lines.length).toBe(3)
    })

    it('should escape CSV fields correctly', () => {
      const resourceWithComma: Resource = {
        id: 3,
        title: 'Resource, with comma',
        url: 'https://example.com',
        accessibilityFlag: true,
        disciplines: [],
        mediaType: 'link',
      }

      const csv = generateResourceCSV([resourceWithComma])
      expect(csv).toContain('"Resource, with comma"')
    })

    it('should handle missing optional fields', () => {
      const minimalResource: Resource = {
        id: 4,
        title: 'Minimal',
        url: 'https://example.com',
        accessibilityFlag: true,
        disciplines: [],
        mediaType: 'link',
      }

      const csv = generateResourceCSV([minimalResource])
      expect(csv).toContain('Minimal')
    })

    it('should strip HTML from descriptions', () => {
      const csv = generateResourceCSV(mockResources)
      expect(csv).toContain('This is a test description')
      expect(csv).not.toContain('<strong>')
    })

    it('should format accessibility flag as Yes/No', () => {
      const csv = generateResourceCSV(mockResources)
      expect(csv).toContain(',Yes,')
      expect(csv).toContain(',No,')
    })

    it('should format disciplines as comma-separated list', () => {
      const csv = generateResourceCSV(mockResources)
      expect(csv).toContain('环艺, 产品')
    })
  })

  describe('generateResourcePDFText', () => {
    it('should generate text with header', () => {
      const text = generateResourcePDFText(mockResources)
      expect(text).toContain('Resource Library Export')
      expect(text).toContain('Total Resources: 2')
    })

    it('should include all resource details', () => {
      const text = generateResourcePDFText(mockResources)
      
      expect(text).toContain('Test Resource 1')
      expect(text).toContain('Category: Video Tutorials')
      expect(text).toContain('Media Type: video')
      expect(text).toContain('Disciplines: 环艺, 产品')
      expect(text).toContain('https://example.com/resource1')
      expect(text).toContain('Accessibility: Verified')
    })

    it('should handle resources with no accessibility flag', () => {
      const text = generateResourcePDFText(mockResources)
      expect(text).toContain('Accessibility: Needs Attention')
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalResource: Resource = {
        id: 5,
        title: 'Minimal PDF',
        url: 'https://example.com',
        accessibilityFlag: true,
        disciplines: [],
        mediaType: 'link',
      }

      const text = generateResourcePDFText([minimalResource])
      expect(text).toContain('Minimal PDF')
      expect(text).toContain('Category: N/A')
    })

    it('should number resources sequentially', () => {
      const text = generateResourcePDFText(mockResources)
      expect(text).toMatch(/1\. Test Resource 1/)
      expect(text).toMatch(/2\. Test Resource 2/)
    })
  })
})
