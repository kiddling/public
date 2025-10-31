/**
 * Composable for rendering Markdown to HTML
 * SSR-safe markdown rendering using markdown-it
 */

import MarkdownIt from 'markdown-it'

let md: MarkdownIt | null = null

function getMarkdownInstance(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true,
    })
  }
  return md
}

/**
 * Render markdown string to HTML
 * @param markdown - Markdown string to render
 * @returns Rendered HTML string
 */
export function useMarkdown(markdown: string | null | undefined): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  const instance = getMarkdownInstance()
  
  try {
    return instance.render(markdown)
  } catch (error) {
    console.error('Failed to render markdown:', error)
    return markdown
  }
}

/**
 * Render inline markdown to HTML (without wrapping in <p> tags)
 * @param markdown - Markdown string to render inline
 * @returns Rendered HTML string
 */
export function useMarkdownInline(markdown: string | null | undefined): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  const instance = getMarkdownInstance()
  
  try {
    return instance.renderInline(markdown)
  } catch (error) {
    console.error('Failed to render inline markdown:', error)
    return markdown
  }
}

/**
 * Check if content is markdown (simple heuristic check)
 * @param content - Content to check
 * @returns True if content appears to be markdown
 */
export function isMarkdown(content: unknown): boolean {
  if (typeof content !== 'string') {
    return false
  }

  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*.*\*\*/,           // Bold
    /\*.*\*/,               // Italic
    /\[.*\]\(.*\)/,         // Links
    /^[-*+]\s/m,            // Unordered lists
    /^\d+\.\s/m,            // Ordered lists
    /^>\s/m,                // Blockquotes
    /`[^`]+`/,              // Inline code
    /```[\s\S]*```/,        // Code blocks
  ]

  return markdownPatterns.some(pattern => pattern.test(content))
}
