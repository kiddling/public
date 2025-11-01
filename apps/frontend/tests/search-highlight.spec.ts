/**
 * Tests for search highlighting utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Search Highlight Utilities', () => {
  beforeEach(() => {
    global.document = {
      createElement: vi.fn((tag: string) => {
        if (tag === 'div') {
          const element: any = {
            textContent: '',
            innerHTML: '',
            innerText: '',
          }
          Object.defineProperty(element, 'textContent', {
            get() {
              return this._textContent || ''
            },
            set(value) {
              this._textContent = value
              this.innerHTML = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
            },
          })
          Object.defineProperty(element, 'innerHTML', {
            get() {
              return this._innerHTML || ''
            },
            set(value) {
              this._innerHTML = value
              this._textContent = value.replace(/<[^>]*>/g, '')
            },
          })
          Object.defineProperty(element, 'innerText', {
            get() {
              return this._textContent || ''
            },
          })
          return element
        }
        return {}
      }),
    } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('highlightSearchTerm', () => {
    it('should highlight matching terms', async () => {
      const { highlightSearchTerm } = await import('~/utils/search-highlight')
      const text = 'This is a test string'
      const result = highlightSearchTerm(text, 'test')
      
      expect(result).toContain('<mark')
      expect(result).toContain('test')
    })

    it('should be case insensitive', async () => {
      const { highlightSearchTerm } = await import('~/utils/search-highlight')
      const text = 'This is a TEST string'
      const result = highlightSearchTerm(text, 'test')
      
      expect(result).toContain('<mark')
    })

    it('should return original text if no search term', async () => {
      const { highlightSearchTerm } = await import('~/utils/search-highlight')
      const text = 'This is a test string'
      const result = highlightSearchTerm(text, '')
      
      expect(result).toBe(text)
    })

    it('should escape HTML in text', async () => {
      const { highlightSearchTerm } = await import('~/utils/search-highlight')
      const text = '<script>alert("xss")</script>'
      const result = highlightSearchTerm(text, 'alert')
      
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('should handle special regex characters', async () => {
      const { highlightSearchTerm } = await import('~/utils/search-highlight')
      const text = 'Cost is $50 (approx.)'
      const result = highlightSearchTerm(text, '$50')
      
      expect(result).toContain('$50')
    })
  })

  describe('stripHtml', () => {
    it('should remove HTML tags', async () => {
      const { stripHtml } = await import('~/utils/search-highlight')
      const html = '<p>This is <strong>bold</strong> text</p>'
      const result = stripHtml(html)
      
      expect(result).toBe('This is bold text')
    })

    it('should handle nested tags', async () => {
      const { stripHtml } = await import('~/utils/search-highlight')
      const html = '<div><p>Nested <span>content</span></p></div>'
      const result = stripHtml(html)
      
      expect(result).toBe('Nested content')
    })

    it('should return empty string for empty input', async () => {
      const { stripHtml } = await import('~/utils/search-highlight')
      const result = stripHtml('')
      
      expect(result).toBe('')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', async () => {
      const { truncateText } = await import('~/utils/search-highlight')
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      
      expect(result.length).toBeLessThanOrEqual(23)
      expect(result).toContain('...')
    })

    it('should not truncate short text', async () => {
      const { truncateText } = await import('~/utils/search-highlight')
      const text = 'Short text'
      const result = truncateText(text, 20)
      
      expect(result).toBe(text)
      expect(result).not.toContain('...')
    })

    it('should truncate at exact length', async () => {
      const { truncateText } = await import('~/utils/search-highlight')
      const text = 'Exactly twenty chars'
      const result = truncateText(text, 20)
      
      expect(result).toBe(text)
    })
  })

  describe('getSearchExcerpt', () => {
    it('should extract excerpt around search term', async () => {
      const { getSearchExcerpt } = await import('~/utils/search-highlight')
      const html = '<p>This is a very long paragraph with the word important in the middle of it</p>'
      const result = getSearchExcerpt(html, 'important', 50)
      
      expect(result).toContain('important')
      expect(result.length).toBeLessThanOrEqual(55)
    })

    it('should handle HTML tags', async () => {
      const { getSearchExcerpt } = await import('~/utils/search-highlight')
      const html = '<p>This is <strong>important</strong> text</p>'
      const result = getSearchExcerpt(html, 'important')
      
      expect(result).not.toContain('<strong>')
      expect(result).toContain('important')
    })

    it('should add ellipsis at start and end when needed', async () => {
      const { getSearchExcerpt } = await import('~/utils/search-highlight')
      const html = '<p>Start of text with important word in the middle and more text at the end</p>'
      const result = getSearchExcerpt(html, 'important', 30)
      
      expect(result).toMatch(/\.\.\..*important.*\.\.\./)
    })

    it('should return truncated text if no match', async () => {
      const { getSearchExcerpt } = await import('~/utils/search-highlight')
      const html = '<p>This text has no matching words</p>'
      const result = getSearchExcerpt(html, 'nonexistent', 20)
      
      expect(result.length).toBeLessThanOrEqual(23)
    })

    it('should handle empty search term', async () => {
      const { getSearchExcerpt } = await import('~/utils/search-highlight')
      const html = '<p>Some text here</p>'
      const result = getSearchExcerpt(html, '', 20)
      
      expect(result).toBe('Some text here')
    })
  })
})
