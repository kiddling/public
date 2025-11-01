/**
 * Resource export utilities for CSV and PDF generation
 */

import type { Resource } from '~/types/cms'

/**
 * Escape CSV field value
 */
function escapeCSVField(value: string | null | undefined): string {
  if (!value) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

/**
 * Generate CSV content from resources
 */
export function generateResourceCSV(resources: Resource[]): string {
  const headers = [
    'ID',
    'Title',
    'Category',
    'Media Type',
    'Disciplines',
    'URL',
    'Accessibility',
    'Last Checked',
    'Description',
  ]

  const rows = resources.map((resource) => [
    String(resource.id),
    escapeCSVField(resource.title),
    escapeCSVField(resource.category || ''),
    escapeCSVField(resource.mediaType || ''),
    escapeCSVField(resource.disciplines?.join(', ') || ''),
    escapeCSVField(resource.url),
    resource.accessibilityFlag ? 'Yes' : 'No',
    resource.lastChecked ? new Date(resource.lastChecked).toLocaleDateString() : '',
    escapeCSVField(stripHtml(resource.description || '')),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Generate simple text-based PDF content from resources
 * Since we don't have pdfkit installed, we'll return a formatted text string
 */
export function generateResourcePDFText(resources: Resource[]): string {
  const lines: string[] = [
    '===================================',
    'Resource Library Export',
    '===================================',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total Resources: ${resources.length}`,
    '',
  ]

  resources.forEach((resource, index) => {
    lines.push(`${index + 1}. ${resource.title}`)
    lines.push(`   Category: ${resource.category || 'N/A'}`)
    lines.push(`   Media Type: ${resource.mediaType || 'N/A'}`)
    if (resource.disciplines && resource.disciplines.length > 0) {
      lines.push(`   Disciplines: ${resource.disciplines.join(', ')}`)
    }
    lines.push(`   URL: ${resource.url}`)
    lines.push(`   Accessibility: ${resource.accessibilityFlag ? 'Verified' : 'Needs Attention'}`)
    if (resource.lastChecked) {
      lines.push(`   Last Checked: ${new Date(resource.lastChecked).toLocaleDateString()}`)
    }
    if (resource.description) {
      const desc = stripHtml(resource.description)
      if (desc) {
        lines.push(`   Description: ${desc}`)
      }
    }
    lines.push('')
  })

  return lines.join('\n')
}
