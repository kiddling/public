/**
 * Composable for fetching knowledge cards from the CMS
 *
 * Supports filtering by type, tags, and searching.
 */

import type { QueryParams, KnowledgeCardType } from '~/types/cms'
import type { UseCmsDataOptions } from './useCmsData'
import { useCmsData } from './useCmsData'
import { buildStrapiQuery } from '~/utils/data-layer'

const KNOWLEDGE_CARDS_ENDPOINT = '/api/cms/knowledge-cards'

export interface UseKnowledgeCardsOptions extends UseCmsDataOptions {
  slug?: string
  type?: KnowledgeCardType
  tags?: string[]
  populate?: boolean | string[]
  filters?: QueryParams['filters']
  sort?: string | string[]
  pagination?: QueryParams['pagination']
}

/**
 * Fetch a single knowledge card by slug
 */
export function useKnowledgeCard(slug: string, options: UseCmsDataOptions = {}) {
  const endpoint = `${KNOWLEDGE_CARDS_ENDPOINT}/${slug}`
  const key = options.key ?? `knowledge-card-${slug}`

  return useCmsData(endpoint, {}, { ...options, key })
}

/**
 * Fetch multiple knowledge cards with optional filtering, sorting, and pagination
 */
export function useKnowledgeCards(options: UseKnowledgeCardsOptions = {}) {
  const {
    slug,
    type,
    tags,
    populate = true,
    filters,
    sort = ['createdAt:desc'],
    pagination,
    ...restOptions
  } = options

  // Build query parameters
  const queryParams: QueryParams = {}

  // Add filters
  if (filters) {
    queryParams.filters = filters
  }

  // Filter by slug if provided
  if (slug) {
    queryParams.filters = {
      ...queryParams.filters,
      slug: { $eq: slug },
    }
  }

  // Filter by type if provided
  if (type) {
    queryParams.filters = {
      ...queryParams.filters,
      type: { $eq: type },
    }
  }

  // Filter by tags if provided
  if (tags && tags.length > 0) {
    queryParams.filters = {
      ...queryParams.filters,
      tags: { $containsi: tags },
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
      queryParams.populate = ['media', 'lessons']
    } else if (Array.isArray(populate)) {
      queryParams.populate = populate
    }
  }

  const params = buildStrapiQuery(queryParams)
  const key = restOptions.key ?? 'knowledge-cards'

  return useCmsData(KNOWLEDGE_CARDS_ENDPOINT, params, { ...restOptions, key })
}

/**
 * Fetch knowledge cards by type
 */
export function useKnowledgeCardsByType(type: KnowledgeCardType, options: UseCmsDataOptions = {}) {
  return useKnowledgeCards({
    type,
    ...options,
    key: options.key ?? `knowledge-cards-type-${type}`,
  })
}

/**
 * Search knowledge cards by title or description
 */
export function useSearchKnowledgeCards(query: string, options: UseCmsDataOptions = {}) {
  if (!query.trim()) {
    return useKnowledgeCards({
      ...options,
      immediate: false,
    })
  }

  return useKnowledgeCards({
    filters: {
      $or: [
        { title: { $containsi: query } },
        { description: { $containsi: query } },
        { promptText: { $containsi: query } },
      ],
    },
    ...options,
    key: options.key ?? `knowledge-cards-search-${query}`,
  })
}

/**
 * Fetch knowledge cards with specific tags
 */
export function useKnowledgeCardsByTags(tags: string[], options: UseCmsDataOptions = {}) {
  return useKnowledgeCards({
    tags,
    ...options,
    key: options.key ?? `knowledge-cards-tags-${tags.join(',')}`,
  })
}

/**
 * Fetch featured knowledge cards (AI Prompts and Extended Thinking)
 */
export function useFeaturedKnowledgeCards(options: UseCmsDataOptions = {}) {
  return useKnowledgeCards({
    filters: {
      type: {
        $in: ['AI Prompt', 'Extended Thinking'],
      },
    },
    sort: ['createdAt:desc'],
    pagination: {
      pageSize: 10,
    },
    ...options,
    key: options.key ?? 'knowledge-cards-featured',
  })
}
