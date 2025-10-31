/**
 * Base composable factory for CMS data fetching
 * 
 * Provides a consistent interface for fetching CMS data with caching,
 * error handling, and request management.
 */

import { useAsyncData } from '#app'
import type { AsyncDataOptions } from '#app'
import type { DataLayerOptions } from '~/utils/data-layer'
import { fetchWithDataLayer, invalidateCache } from '~/utils/data-layer'

export interface UseCmsDataOptions extends DataLayerOptions {
  key?: string
  immediate?: boolean
  server?: boolean
  lazy?: boolean
  watch?: any[]
}

/**
 * Base composable for CMS data fetching
 */
export function useCmsData<T>(
  endpoint: string,
  params: Record<string, any> = {},
  options: UseCmsDataOptions = {},
) {
  const {
    key,
    immediate = true,
    server = true,
    lazy = false,
    watch = [],
    ...dataLayerOptions
  } = options

  const cacheKey = key ?? endpoint

  const asyncDataOptions: AsyncDataOptions<T> = {
    immediate,
    server,
    lazy,
    watch,
  }

  return useAsyncData<T>(
    cacheKey,
    () => fetchWithDataLayer<T>(endpoint, params, dataLayerOptions),
    asyncDataOptions,
  )
}

/**
 * Invalidate cache for specific patterns
 */
export function invalidateCmsCache(pattern?: string | RegExp): void {
  invalidateCache(pattern)
}
