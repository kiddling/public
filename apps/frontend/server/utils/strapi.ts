/**
 * Server-side utilities for Strapi API integration
 */

import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export interface StrapiQueryOptions {
  filters?: Record<string, any>
  sort?: string | string[]
  pagination?: {
    page?: number
    pageSize?: number
    start?: number
    limit?: number
  }
  populate?: string | string[] | Record<string, any>
  fields?: string[]
  publicationState?: 'live' | 'preview'
  locale?: string
}

/**
 * Get Strapi configuration from runtime config
 */
export function getStrapiConfig() {
  const config = useRuntimeConfig()
  const baseUrl = normalizeBaseUrl(config.public?.strapiUrl || config.public?.apiBaseUrl)

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Strapi URL is not configured',
    })
  }

  const strapiToken = config.strapiApiToken

  return { baseUrl, strapiToken }
}

/**
 * Build Strapi query URL with parameters
 */
export function buildStrapiUrl(
  baseUrl: string,
  endpoint: string,
  options: StrapiQueryOptions = {}
): string {
  const url = new URL(endpoint, baseUrl)

  // Add filters
  if (options.filters) {
    addFiltersToUrl(url, options.filters)
  }

  // Add sorting
  if (options.sort) {
    addSortToUrl(url, options.sort)
  }

  // Add pagination
  if (options.pagination) {
    addPaginationToUrl(url, options.pagination)
  }

  // Add population
  if (options.populate) {
    addPopulateToUrl(url, options.populate)
  }

  // Add fields
  if (options.fields && options.fields.length > 0) {
    options.fields.forEach((field, index) => {
      url.searchParams.set(`fields[${index}]`, field)
    })
  }

  // Add publication state
  if (options.publicationState) {
    url.searchParams.set('publicationState', options.publicationState)
  }

  // Add locale
  if (options.locale) {
    url.searchParams.set('locale', options.locale)
  }

  return url.toString()
}

/**
 * Add filters to URL
 */
function addFiltersToUrl(url: URL, filters: Record<string, any>, prefix = 'filters'): void {
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) {
      continue
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      addFiltersToUrl(url, value, `${prefix}[${key}]`)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          addFiltersToUrl(url, item, `${prefix}[${key}][${index}]`)
        } else {
          url.searchParams.set(`${prefix}[${key}][${index}]`, String(item))
        }
      })
    } else {
      url.searchParams.set(`${prefix}[${key}]`, String(value))
    }
  }
}

/**
 * Add sorting to URL
 */
function addSortToUrl(url: URL, sort: string | string[]): void {
  const sorts = Array.isArray(sort) ? sort : [sort]
  sorts.forEach((s, index) => {
    url.searchParams.set(`sort[${index}]`, s)
  })
}

/**
 * Add pagination to URL
 */
function addPaginationToUrl(
  url: URL,
  pagination: NonNullable<StrapiQueryOptions['pagination']>
): void {
  if (pagination.page !== undefined) {
    url.searchParams.set('pagination[page]', String(pagination.page))
  }
  if (pagination.pageSize !== undefined) {
    url.searchParams.set('pagination[pageSize]', String(pagination.pageSize))
  }
  if (pagination.start !== undefined) {
    url.searchParams.set('pagination[start]', String(pagination.start))
  }
  if (pagination.limit !== undefined) {
    url.searchParams.set('pagination[limit]', String(pagination.limit))
  }
}

/**
 * Add population to URL
 */
function addPopulateToUrl(
  url: URL,
  populate: string | string[] | Record<string, any>,
  prefix = 'populate'
): void {
  if (typeof populate === 'string') {
    url.searchParams.set(prefix, populate)
  } else if (Array.isArray(populate)) {
    populate.forEach((field, index) => {
      url.searchParams.set(`${prefix}[${index}]`, field)
    })
  } else {
    for (const [key, value] of Object.entries(populate)) {
      if (value === '*' || value === true) {
        url.searchParams.set(`${prefix}[${key}]`, '*')
      } else if (typeof value === 'object') {
        addPopulateToUrl(url, value, `${prefix}[${key}]`)
      } else if (typeof value === 'string') {
        url.searchParams.set(`${prefix}[${key}]`, value)
      }
    }
  }
}

/**
 * Fetch data from Strapi
 */
export async function fetchFromStrapi<T>(
  endpoint: string,
  options: StrapiQueryOptions = {}
): Promise<T> {
  const { baseUrl, strapiToken } = getStrapiConfig()
  const url = buildStrapiUrl(baseUrl, endpoint, options)

  try {
    const response = await $fetch<T>(url, {
      headers: {
        ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
      },
    })

    return response
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 502,
      statusMessage: 'Failed to fetch data from Strapi',
      data: {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

/**
 * Normalize base URL
 */
function normalizeBaseUrl(value?: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
