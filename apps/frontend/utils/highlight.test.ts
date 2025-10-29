import { describe, it, expect } from 'vitest'
import { highlightText } from './highlight'

describe('highlightText', () => {
  it('should highlight matching text with mark tags', () => {
    const text = 'This is a test string'
    const searchTerm = 'test'
    const result = highlightText(text, searchTerm)

    expect(result).toContain('<mark')
    expect(result).toContain('test')
    expect(result).toContain('</mark>')
  })

  it('should be case-insensitive', () => {
    const text = 'This is a TEST string'
    const searchTerm = 'test'
    const result = highlightText(text, searchTerm)

    expect(result).toContain('<mark')
    expect(result).toContain('TEST')
  })

  it('should highlight multiple occurrences', () => {
    const text = 'test this test again'
    const searchTerm = 'test'
    const result = highlightText(text, searchTerm)

    const matches = result.match(/<mark/g)
    expect(matches).toHaveLength(2)
  })

  it('should return original text if no search term', () => {
    const text = 'This is a test string'
    const result = highlightText(text, '')

    expect(result).toBe(text)
    expect(result).not.toContain('<mark')
  })

  it('should return original text if no match found', () => {
    const text = 'This is a test string'
    const searchTerm = 'xyz'
    const result = highlightText(text, searchTerm)

    expect(result).toBe(text)
    expect(result).not.toContain('<mark')
  })

  it('should escape special regex characters', () => {
    const text = 'Price: $100 (special)'
    const searchTerm = '$100'
    const result = highlightText(text, searchTerm)

    expect(result).toContain('<mark')
    expect(result).toContain('$100')
  })

  it('should handle empty text', () => {
    const text = ''
    const searchTerm = 'test'
    const result = highlightText(text, searchTerm)

    expect(result).toBe('')
  })

  it('should apply correct CSS classes to mark tag', () => {
    const text = 'highlight this'
    const searchTerm = 'this'
    const result = highlightText(text, searchTerm)

    expect(result).toContain('bg-yellow-200')
    expect(result).toContain('dark:bg-yellow-600')
  })
})
