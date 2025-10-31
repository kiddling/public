/**
 * Composable for fetching lessons from the CMS
 * 
 * Supports filtering, sorting, pagination, and full population of relations.
 */

import type { QueryParams } from '~/types/cms'
import type { UseCmsDataOptions } from './useCmsData'
import { useCmsData } from './useCmsData'
import { buildStrapiQuery } from '~/utils/data-layer'

const LESSONS_ENDPOINT = '/api/cms/lessons'

export interface UseLessonsOptions extends UseCmsDataOptions {
  code?: string
  populate?: boolean | string[]
  filters?: QueryParams['filters']
  sort?: string | string[]
  pagination?: QueryParams['pagination']
}

/**
 * Fetch a single lesson by code
 */
export function useLesson(code: string, options: UseCmsDataOptions = {}) {
  const endpoint = `${LESSONS_ENDPOINT}/${code}`
  const key = options.key ?? `lesson-${code}`

  return useCmsData(endpoint, {}, { ...options, key })
}

/**
 * Fetch multiple lessons with optional filtering, sorting, and pagination
 */
export function useLessons(options: UseLessonsOptions = {}) {
  const {
    code,
    populate = true,
    filters,
    sort,
    pagination,
    ...restOptions
  } = options

  // Build query parameters
  const queryParams: QueryParams = {}

  // Add filters
  if (filters) {
    queryParams.filters = filters
  }

  // Filter by code if provided
  if (code) {
    queryParams.filters = {
      ...queryParams.filters,
      code: { $eq: code },
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
      // Populate all relations
      queryParams.populate = {
        part: '*',
        loop: '*',
        knowledge_cards: {
          populate: ['media'],
        },
        resources: {
          populate: ['qrAsset', 'file'],
        },
        student_works: {
          populate: ['assets', 'beforeAfterMedia'],
        },
        difficulty_specific_fields: {
          populate: ['media', 'attachments', 'prompts'],
        },
        printable_attachments: '*',
      }
    } else if (Array.isArray(populate)) {
      queryParams.populate = populate
    }
  }

  const params = buildStrapiQuery(queryParams)
  const key = restOptions.key ?? 'lessons'

  return useCmsData(LESSONS_ENDPOINT, params, { ...restOptions, key })
}

/**
 * Fetch lessons by part
 */
export function useLessonsByPart(partKey: string, options: UseCmsDataOptions = {}) {
  return useLessons({
    filters: {
      partKey: { $eq: partKey },
    },
    sort: ['partOrder:asc', 'loopOrder:asc', 'order:asc'],
    ...options,
    key: options.key ?? `lessons-part-${partKey}`,
  })
}

/**
 * Fetch lessons by loop
 */
export function useLessonsByLoop(loopCode: string, options: UseCmsDataOptions = {}) {
  return useLessons({
    filters: {
      loopCode: { $eq: loopCode },
    },
    sort: ['order:asc'],
    ...options,
    key: options.key ?? `lessons-loop-${loopCode}`,
  })
}

/**
 * Search lessons by title or code
 */
export function useSearchLessons(query: string, options: UseCmsDataOptions = {}) {
  if (!query.trim()) {
    return useLessons({
      ...options,
      immediate: false,
    })
  }

  return useLessons({
    filters: {
      $or: [
        { title: { $containsi: query } },
        { code: { $containsi: query } },
        { summary: { $containsi: query } },
      ],
    },
    ...options,
    key: options.key ?? `lessons-search-${query}`,
  })
}
