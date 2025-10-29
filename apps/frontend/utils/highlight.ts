/**
 * Highlight search terms in text
 */
export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) {
    return text
  }

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>')
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
