import { describe, it, expect } from 'vitest'
import { useMarkdown, useMarkdownInline, isMarkdown } from '~/composables/useMarkdown'

describe('useMarkdown', () => {
  it('should render simple markdown to HTML', () => {
    const markdown = '# Hello World\n\nThis is a paragraph.'
    const result = useMarkdown(markdown)

    expect(result).toContain('<h1>Hello World</h1>')
    expect(result).toContain('<p>This is a paragraph.</p>')
  })

  it('should render markdown with bold text', () => {
    const markdown = 'This is **bold** text.'
    const result = useMarkdown(markdown)

    expect(result).toContain('<strong>bold</strong>')
  })

  it('should render markdown with italic text', () => {
    const markdown = 'This is *italic* text.'
    const result = useMarkdown(markdown)

    expect(result).toContain('<em>italic</em>')
  })

  it('should render markdown with links', () => {
    const markdown = '[Link text](https://example.com)'
    const result = useMarkdown(markdown)

    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('Link text')
  })

  it('should render markdown with lists', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3'
    const result = useMarkdown(markdown)

    expect(result).toContain('<ul>')
    expect(result).toContain('<li>Item 1')
    expect(result).toContain('<li>Item 2')
    expect(result).toContain('<li>Item 3')
  })

  it('should render markdown with code blocks', () => {
    const markdown = '```\nconst x = 1;\n```'
    const result = useMarkdown(markdown)

    expect(result).toContain('<code>')
    expect(result).toContain('const x = 1;')
  })

  it('should handle empty or null input', () => {
    expect(useMarkdown('')).toBe('')
    expect(useMarkdown(null)).toBe('')
    expect(useMarkdown(undefined)).toBe('')
  })

  it('should handle non-string input', () => {
    // @ts-expect-error Testing invalid input
    expect(useMarkdown(123)).toBe('')
    // @ts-expect-error Testing invalid input
    expect(useMarkdown({})).toBe('')
  })

  it('should enable line breaks', () => {
    const markdown = 'Line 1\nLine 2'
    const result = useMarkdown(markdown)

    expect(result).toContain('<br>')
  })
})

describe('useMarkdownInline', () => {
  it('should render inline markdown without wrapping in paragraph', () => {
    const markdown = 'This is **bold** and *italic*'
    const result = useMarkdownInline(markdown)

    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).not.toContain('<p>')
  })

  it('should handle empty or null input', () => {
    expect(useMarkdownInline('')).toBe('')
    expect(useMarkdownInline(null)).toBe('')
    expect(useMarkdownInline(undefined)).toBe('')
  })
})

describe('isMarkdown', () => {
  it('should detect markdown headers', () => {
    expect(isMarkdown('# Header')).toBe(true)
    expect(isMarkdown('## Header 2')).toBe(true)
    expect(isMarkdown('### Header 3')).toBe(true)
  })

  it('should detect markdown bold text', () => {
    expect(isMarkdown('**bold**')).toBe(true)
  })

  it('should detect markdown italic text', () => {
    expect(isMarkdown('*italic*')).toBe(true)
  })

  it('should detect markdown links', () => {
    expect(isMarkdown('[text](url)')).toBe(true)
  })

  it('should detect markdown lists', () => {
    expect(isMarkdown('- item')).toBe(true)
    expect(isMarkdown('* item')).toBe(true)
    expect(isMarkdown('+ item')).toBe(true)
    expect(isMarkdown('1. item')).toBe(true)
  })

  it('should detect markdown blockquotes', () => {
    expect(isMarkdown('> quote')).toBe(true)
  })

  it('should detect markdown inline code', () => {
    expect(isMarkdown('`code`')).toBe(true)
  })

  it('should detect markdown code blocks', () => {
    expect(isMarkdown('```code```')).toBe(true)
  })

  it('should return false for plain text', () => {
    expect(isMarkdown('Just plain text')).toBe(false)
  })

  it('should return false for non-string input', () => {
    expect(isMarkdown(null)).toBe(false)
    expect(isMarkdown(undefined)).toBe(false)
    // @ts-expect-error Testing invalid input
    expect(isMarkdown(123)).toBe(false)
    // @ts-expect-error Testing invalid input
    expect(isMarkdown({})).toBe(false)
  })
})
