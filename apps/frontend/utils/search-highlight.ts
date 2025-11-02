/**
 * Search highlighting utility for text content
 */

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Highlight search terms in text
 * @param text - The text to highlight in
 * @param searchTerm - The term to search for
 * @returns HTML string with highlighted matches
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!text || !searchTerm || searchTerm.trim().length === 0) {
    return text
  }

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedTerm})`, 'gi')

  const escapedText = escapeHtml(text)
  return escapedText.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">$1</mark>'
  )
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Extract plain text excerpt from HTML with search term context
 */
export function getSearchExcerpt(
  html: string,
  searchTerm: string,
  maxLength: number = 150
): string {
  const plainText = stripHtml(html)

  if (!searchTerm || searchTerm.trim().length === 0) {
    return truncateText(plainText, maxLength)
  }

  const lowerText = plainText.toLowerCase()
  const lowerTerm = searchTerm.toLowerCase()
  const index = lowerText.indexOf(lowerTerm)

  if (index === -1) {
    return truncateText(plainText, maxLength)
  }

  const start = Math.max(0, index - Math.floor(maxLength / 2))
  const end = Math.min(plainText.length, start + maxLength)

  let excerpt = plainText.slice(start, end)

  if (start > 0) {
    excerpt = '...' + excerpt
  }
  if (end < plainText.length) {
    excerpt = excerpt + '...'
  }

  return excerpt
}
