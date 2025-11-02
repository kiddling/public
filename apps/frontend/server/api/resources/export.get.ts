/**
 * API endpoint for exporting resources to CSV or PDF
 * GET /api/resources/export?format=csv|pdf&category=...&discipline=...&mediaType=...
 */

import { defineEventHandler, getQuery, setResponseHeaders, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'
import type {
  Resource,
  StrapiResourceResponse,
  StrapiCollectionItem,
  ResourceAttributes,
} from '~/types/cms'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const format = (query.format as string) || 'csv'

  if (!['csv', 'pdf'].includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid format. Must be "csv" or "pdf"',
    })
  }

  const strapiQuery: Record<string, any> = {
    'pagination[pageSize]': '1000',
    populate: '*',
  }

  if (query.category) {
    strapiQuery['filters[category][$eq]'] = query.category
  }

  if (query.discipline) {
    const disciplines = Array.isArray(query.discipline) ? query.discipline : [query.discipline]
    disciplines.forEach((d, index) => {
      strapiQuery[`filters[disciplines][$in][${index}]`] = d
    })
  }

  if (query.mediaType) {
    const mediaTypes = Array.isArray(query.mediaType) ? query.mediaType : [query.mediaType]
    mediaTypes.forEach((m, index) => {
      strapiQuery[`filters[mediaType][$in][${index}]`] = m
    })
  }

  if (query.accessibleOnly === 'true') {
    strapiQuery['filters[accessibilityFlag][$eq]'] = 'true'
  }

  if (query.search) {
    strapiQuery['filters[$or][0][title][$containsi]'] = query.search
    strapiQuery['filters[$or][1][description][$containsi]'] = query.search
  }

  try {
    const response = (await fetchFromStrapi(
      '/api/resources',
      strapiQuery
    )) as StrapiResourceResponse

    const resources: Resource[] = response.data.map(
      (item: StrapiCollectionItem<ResourceAttributes>) => ({
        id: item.id,
        title: item.attributes.title,
        category: item.attributes.category || null,
        description: item.attributes.description || null,
        url: item.attributes.url,
        accessibilityFlag: item.attributes.accessibilityFlag ?? true,
        lastChecked: item.attributes.lastChecked || null,
        disciplines: item.attributes.disciplines || [],
        mediaType: item.attributes.mediaType || 'link',
        createdAt: item.attributes.createdAt,
        updatedAt: item.attributes.updatedAt,
        publishedAt: item.attributes.publishedAt,
      })
    )

    if (format === 'csv') {
      const csvContent = generateCSV(resources)

      setResponseHeaders(event, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="resources-${Date.now()}.csv"`,
      })

      return csvContent
    } else {
      const pdfContent = generatePDFText(resources)

      setResponseHeaders(event, {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="resources-${Date.now()}.txt"`,
      })

      return pdfContent
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to export resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})

function escapeCSVField(value: string | null | undefined): string {
  if (!value) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function generateCSV(resources: Resource[]): string {
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

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

function generatePDFText(resources: Resource[]): string {
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
