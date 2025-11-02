/**
 * Composable for fetching resources from the CMS
 *
 * Supports filtering by category, accessibility, discipline, mediaType, and searching.
 */

import type {
  QueryParams,
  ResourceCategory,
  ResourceDiscipline,
  ResourceMediaType,
} from '~/types/cms'
import type { UseCmsDataOptions } from './useCmsData'
import { useCmsData } from './useCmsData'
import { buildStrapiQuery } from '~/utils/data-layer'

const RESOURCES_ENDPOINT = '/api/cms/resources'

export interface UseResourcesOptions extends UseCmsDataOptions {
  category?: ResourceCategory
  discipline?: ResourceDiscipline | ResourceDiscipline[]
  mediaType?: ResourceMediaType | ResourceMediaType[]
  accessibleOnly?: boolean
  populate?: boolean | string[]
  filters?: QueryParams['filters']
  sort?: string | string[]
  pagination?: QueryParams['pagination']
}

/**
 * Fetch a single resource by ID
 */
export function useResource(id: string | number, options: UseCmsDataOptions = {}) {
  const endpoint = `${RESOURCES_ENDPOINT}/${id}`
  const key = options.key ?? `resource-${id}`

  return useCmsData(endpoint, {}, { ...options, key })
}

/**
 * Fetch multiple resources with optional filtering, sorting, and pagination
 */
export function useResources(options: UseResourcesOptions = {}) {
  const {
    category,
    discipline,
    mediaType,
    accessibleOnly,
    populate = true,
    filters,
    sort = ['title:asc'],
    pagination,
    ...restOptions
  } = options

  // Build query parameters
  const queryParams: QueryParams = {}

  // Add filters
  if (filters) {
    queryParams.filters = filters
  }

  // Filter by category if provided
  if (category) {
    queryParams.filters = {
      ...queryParams.filters,
      category: { $eq: category },
    }
  }

  // Filter by discipline if provided
  if (discipline) {
    if (Array.isArray(discipline)) {
      queryParams.filters = {
        ...queryParams.filters,
        disciplines: { $in: discipline },
      }
    } else {
      queryParams.filters = {
        ...queryParams.filters,
        disciplines: { $contains: discipline },
      }
    }
  }

  // Filter by media type if provided
  if (mediaType) {
    if (Array.isArray(mediaType)) {
      queryParams.filters = {
        ...queryParams.filters,
        mediaType: { $in: mediaType },
      }
    } else {
      queryParams.filters = {
        ...queryParams.filters,
        mediaType: { $eq: mediaType },
      }
    }
  }

  // Filter by accessibility if requested
  if (accessibleOnly) {
    queryParams.filters = {
      ...queryParams.filters,
      accessibilityFlag: { $eq: true },
    }
  }

  // Add sorting
  if (sort) {
    queryParams.sort = sort
  }

  // Add pagination
  if (pagination) {
    queryParams.pagination = pagination
  }

  // Add population
  if (populate) {
    if (populate === true) {
      queryParams.populate = ['qrAsset', 'file', 'lessons']
    } else if (Array.isArray(populate)) {
      queryParams.populate = populate
    }
  }

  const params = buildStrapiQuery(queryParams)
  const key = restOptions.key ?? 'resources'

  return useCmsData(RESOURCES_ENDPOINT, params, { ...restOptions, key })
}

/**
 * Fetch resources by category
 */
export function useResourcesByCategory(
  category: ResourceCategory,
  options: UseCmsDataOptions = {}
) {
  return useResources({
    category,
    ...options,
    key: options.key ?? `resources-category-${category}`,
  })
}

/**
 * Fetch only accessible resources
 */
export function useAccessibleResources(options: UseCmsDataOptions = {}) {
  return useResources({
    accessibleOnly: true,
    ...options,
    key: options.key ?? 'resources-accessible',
  })
}

/**
 * Search resources by title or description
 */
export function useSearchResources(query: string, options: UseCmsDataOptions = {}) {
  if (!query.trim()) {
    return useResources({
      ...options,
      immediate: false,
    })
  }

  return useResources({
    filters: {
      $or: [
        { title: { $containsi: query } },
        { description: { $containsi: query } },
        { category: { $containsi: query } },
      ],
    },
    ...options,
    key: options.key ?? `resources-search-${query}`,
  })
}

/**
 * Fetch resources grouped by category
 */
export function useResourcesGroupedByCategory(options: UseCmsDataOptions = {}) {
  const categories: ResourceCategory[] = [
    'Video Tutorials',
    'Tool Links',
    'Case Databases',
    'Readings',
    'PBR Libraries',
  ]

  return categories.map((category) =>
    useResourcesByCategory(category, {
      ...options,
      accessibleOnly: true,
    })
  )
}

/**
 * Fetch video tutorial resources
 */
export function useVideoTutorials(options: UseCmsDataOptions = {}) {
  return useResourcesByCategory('Video Tutorials', {
    ...options,
    key: options.key ?? 'resources-video-tutorials',
  })
}

/**
 * Fetch tool link resources
 */
export function useToolLinks(options: UseCmsDataOptions = {}) {
  return useResourcesByCategory('Tool Links', {
    ...options,
    key: options.key ?? 'resources-tool-links',
  })
}

/**
 * Fetch case database resources
 */
export function useCaseDatabases(options: UseCmsDataOptions = {}) {
  return useResourcesByCategory('Case Databases', {
    ...options,
    key: options.key ?? 'resources-case-databases',
  })
}

/**
 * Fetch reading resources
 */
export function useReadings(options: UseCmsDataOptions = {}) {
  return useResourcesByCategory('Readings', {
    ...options,
    key: options.key ?? 'resources-readings',
  })
}

/**
 * Fetch PBR library resources
 */
export function usePBRLibraries(options: UseCmsDataOptions = {}) {
  return useResourcesByCategory('PBR Libraries', {
    ...options,
    key: options.key ?? 'resources-pbr-libraries',
  })
}
