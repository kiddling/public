/**
 * Resource data normalization utilities
 */

import type {
  Resource,
  ResourceAttributes,
  StrapiCollectionItem,
  StrapiResourceResponse,
  StrapiMedia,
} from '~/types/cms'

/**
 * Normalize Strapi media data
 */
function normalizeMedia(mediaData: any): StrapiMedia | null {
  if (!mediaData?.data) return null

  const media = mediaData.data
  if (Array.isArray(media)) {
    return media.length > 0 ? media[0].attributes : null
  }

  return media.attributes || null
}

/**
 * Calculate days since last check
 */
function getDaysSinceLastCheck(lastChecked: string | null): number | null {
  if (!lastChecked) return null
  const checkDate = new Date(lastChecked)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - checkDate.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get accessibility status based on flag and last checked date
 */
export function getAccessibilityStatus(
  accessibilityFlag: boolean,
  lastChecked: string | null,
  thresholdDays: number = 90
): {
  status: 'verified' | 'needs-attention' | 'unknown' | 'needs-revalidation'
  severity: 'success' | 'warning' | 'error' | 'info'
  message: string
  daysSinceCheck: number | null
} {
  const daysSinceCheck = getDaysSinceLastCheck(lastChecked)

  if (!accessibilityFlag) {
    return {
      status: 'needs-attention',
      severity: 'warning',
      message: 'This resource may be inaccessible or has issues',
      daysSinceCheck,
    }
  }

  if (!lastChecked) {
    return {
      status: 'unknown',
      severity: 'info',
      message: 'This resource has not been checked for accessibility',
      daysSinceCheck: null,
    }
  }

  if (daysSinceCheck !== null && daysSinceCheck > thresholdDays) {
    return {
      status: 'needs-revalidation',
      severity: 'warning',
      message: `Last checked ${daysSinceCheck} days ago. Revalidation recommended.`,
      daysSinceCheck,
    }
  }

  return {
    status: 'verified',
    severity: 'success',
    message: `Verified accessible ${daysSinceCheck !== null ? `${daysSinceCheck} days ago` : 'recently'}`,
    daysSinceCheck,
  }
}

/**
 * Normalize a single resource from Strapi response
 */
export function normalizeResource(item: StrapiCollectionItem<ResourceAttributes>): Resource {
  const attrs = item.attributes

  return {
    id: item.id,
    title: attrs.title,
    category: attrs.category || null,
    description: attrs.description || null,
    url: attrs.url,
    accessibilityFlag: attrs.accessibilityFlag ?? true,
    lastChecked: attrs.lastChecked || null,
    disciplines: attrs.disciplines || [],
    mediaType: attrs.mediaType || 'link',
    qrAsset: normalizeMedia(attrs.qrAsset),
    file: normalizeMedia(attrs.file),
    lessons: attrs.lessons?.data || [],
    createdAt: attrs.createdAt,
    updatedAt: attrs.updatedAt,
    publishedAt: attrs.publishedAt,
  }
}

/**
 * Normalize a collection of resources from Strapi response
 */
export function normalizeResources(response: StrapiResourceResponse): Resource[] {
  if (!response?.data || !Array.isArray(response.data)) {
    return []
  }

  return response.data.map(normalizeResource)
}

/**
 * Group resources by category
 */
export function groupResourcesByCategory(resources: Resource[]) {
  const grouped = new Map<string, Resource[]>()

  resources.forEach((resource) => {
    const category = resource.category || 'Uncategorized'
    const existing = grouped.get(category) || []
    existing.push(resource)
    grouped.set(category, existing)
  })

  return Array.from(grouped.entries()).map(([category, resources]) => ({
    category,
    resources,
    count: resources.length,
  }))
}

/**
 * Filter resources by search query
 */
export function filterResourcesBySearch(resources: Resource[], query: string): Resource[] {
  if (!query || query.trim().length === 0) {
    return resources
  }

  const lowerQuery = query.toLowerCase().trim()

  return resources.filter((resource) => {
    const titleMatch = resource.title.toLowerCase().includes(lowerQuery)
    const descMatch = resource.description?.toLowerCase().includes(lowerQuery)
    const categoryMatch = resource.category?.toLowerCase().includes(lowerQuery)
    const urlMatch = resource.url.toLowerCase().includes(lowerQuery)

    return titleMatch || descMatch || categoryMatch || urlMatch
  })
}

/**
 * Sort resources by various criteria
 */
export function sortResources(
  resources: Resource[],
  sortBy: 'title' | 'category' | 'lastChecked' | 'createdAt' = 'title',
  order: 'asc' | 'desc' = 'asc'
): Resource[] {
  const sorted = [...resources]

  sorted.sort((a, b) => {
    let compareA: any
    let compareB: any

    switch (sortBy) {
      case 'title':
        compareA = a.title.toLowerCase()
        compareB = b.title.toLowerCase()
        break
      case 'category':
        compareA = a.category?.toLowerCase() || ''
        compareB = b.category?.toLowerCase() || ''
        break
      case 'lastChecked':
        compareA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0
        compareB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0
        break
      case 'createdAt':
        compareA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        compareB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        break
      default:
        compareA = a.title.toLowerCase()
        compareB = b.title.toLowerCase()
    }

    if (compareA < compareB) return order === 'asc' ? -1 : 1
    if (compareA > compareB) return order === 'asc' ? 1 : -1
    return 0
  })

  return sorted
}

/**
 * Get resources that need attention
 */
export function getResourcesNeedingAttention(
  resources: Resource[],
  thresholdDays: number = 90
): Resource[] {
  return resources.filter((resource) => {
    const status = getAccessibilityStatus(
      resource.accessibilityFlag,
      resource.lastChecked,
      thresholdDays
    )
    return status.status === 'needs-attention' || status.status === 'needs-revalidation'
  })
}

/**
 * Calculate resource statistics
 */
export function calculateResourceStats(resources: Resource[]) {
  const total = resources.length
  const byCategory = new Map<string, number>()
  const byMediaType = new Map<string, number>()
  const byDiscipline = new Map<string, number>()
  let accessible = 0
  let needsAttention = 0
  let unchecked = 0

  resources.forEach((resource) => {
    const category = resource.category || 'Uncategorized'
    byCategory.set(category, (byCategory.get(category) || 0) + 1)

    const mediaType = resource.mediaType || 'link'
    byMediaType.set(mediaType, (byMediaType.get(mediaType) || 0) + 1)

    resource.disciplines?.forEach((discipline) => {
      byDiscipline.set(discipline, (byDiscipline.get(discipline) || 0) + 1)
    })

    const status = getAccessibilityStatus(resource.accessibilityFlag, resource.lastChecked)

    if (status.status === 'verified') accessible++
    else if (status.status === 'needs-attention' || status.status === 'needs-revalidation')
      needsAttention++
    else unchecked++
  })

  return {
    total,
    accessible,
    needsAttention,
    unchecked,
    byCategory: Object.fromEntries(byCategory),
    byMediaType: Object.fromEntries(byMediaType),
    byDiscipline: Object.fromEntries(byDiscipline),
  }
}
