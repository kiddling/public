/**
 * CMS Data Layer Utilities
 * 
 * Provides caching, retry logic, request deduplication, and error handling
 * for all CMS data operations.
 */

import type { AsyncDataOptions } from '#app'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export interface DataLayerOptions {
  cacheTime?: number // Time in ms to cache data (default: 5 minutes)
  staleTime?: number // Time in ms before data is considered stale (default: 1 minute)
  retryConfig?: Partial<RetryConfig>
  timeout?: number // Request timeout in ms (default: 30 seconds)
}

const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutes
const DEFAULT_STALE_TIME = 60 * 1000 // 1 minute
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}
const DEFAULT_TIMEOUT = 30000 // 30 seconds

// In-memory cache
const cache = new Map<string, CacheEntry<any>>()

// Active request tracking for deduplication
const activeRequests = new Map<string, Promise<any>>()

// Abort controllers for request cancellation
const abortControllers = new Map<string, AbortController>()

/**
 * Generate a cache key from URL and options
 */
export function generateCacheKey(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return url
  }
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)
  return `${url}?${JSON.stringify(sortedParams)}`
}

/**
 * Get data from cache if available and not expired
 */
export function getFromCache<T>(key: string, staleTime: number): T | null {
  const entry = cache.get(key)
  if (!entry) {
    return null
  }

  const now = Date.now()
  
  // If expired, remove from cache
  if (now > entry.expiresAt) {
    cache.delete(key)
    return null
  }

  // Return cached data even if stale (stale-while-revalidate)
  return entry.data
}

/**
 * Check if cached data is stale
 */
export function isCacheStale(key: string, staleTime: number): boolean {
  const entry = cache.get(key)
  if (!entry) {
    return true
  }

  const now = Date.now()
  const staleAt = entry.timestamp + staleTime
  
  return now > staleAt
}

/**
 * Set data in cache
 */
export function setCache<T>(key: string, data: T, cacheTime: number): void {
  const now = Date.now()
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + cacheTime,
  })
}

/**
 * Clear cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key)
}

/**
 * Clear all cache entries matching a pattern
 */
export function clearCachePattern(pattern: string | RegExp): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear()
}

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt)
  return Math.min(delay, config.maxDelay)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return true
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return true
  }
  
  // 5xx server errors
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true
  }
  
  // 429 Too Many Requests
  if (error.statusCode === 429) {
    return true
  }
  
  return false
}

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options: DataLayerOptions = {},
): Promise<T> {
  const retryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...options.retryConfig,
  }

  let lastError: any
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fetcher()
    } catch (error) {
      lastError = error
      
      // Don't retry if not retryable or if we've exhausted retries
      if (!isRetryableError(error) || attempt === retryConfig.maxRetries) {
        throw error
      }
      
      // Calculate delay and wait before retrying
      const delay = calculateBackoffDelay(attempt, retryConfig)
      await sleep(delay)
    }
  }
  
  throw lastError
}

/**
 * Fetch with request deduplication
 * If the same request is already in flight, return the existing promise
 */
export async function fetchWithDeduplication<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  // Check if request is already in flight
  const existingRequest = activeRequests.get(key)
  if (existingRequest) {
    return existingRequest
  }

  // Create new request
  const request = fetcher().finally(() => {
    // Clean up when request completes
    activeRequests.delete(key)
  })

  activeRequests.set(key, request)
  return request
}

/**
 * Cancel an active request
 */
export function cancelRequest(key: string): void {
  const controller = abortControllers.get(key)
  if (controller) {
    controller.abort()
    abortControllers.delete(key)
  }
  activeRequests.delete(key)
}

/**
 * Cancel all active requests matching a pattern
 */
export function cancelRequestsPattern(pattern: string | RegExp): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  
  for (const key of abortControllers.keys()) {
    if (regex.test(key)) {
      cancelRequest(key)
    }
  }
}

/**
 * Create an abort controller for a request
 */
export function createAbortController(key: string, timeout: number = DEFAULT_TIMEOUT): AbortController {
  // Cancel any existing controller for this key
  cancelRequest(key)
  
  const controller = new AbortController()
  abortControllers.set(key, controller)
  
  // Auto-cancel after timeout
  setTimeout(() => {
    if (abortControllers.get(key) === controller) {
      controller.abort()
      abortControllers.delete(key)
    }
  }, timeout)
  
  return controller
}

/**
 * Transform Strapi error to user-friendly error
 */
export function transformStrapiError(error: any): Error {
  if (error.data?.error) {
    const strapiError = error.data.error
    return new Error(
      `${strapiError.name || 'StrapiError'}: ${strapiError.message}`,
    )
  }
  
  if (error.statusCode) {
    return new Error(
      `HTTP ${error.statusCode}: ${error.statusMessage || 'Request failed'}`,
    )
  }
  
  if (error instanceof Error) {
    return error
  }
  
  return new Error(String(error))
}

/**
 * Main data fetching function with all features
 * - Caching with stale-while-revalidate
 * - Retry logic with exponential backoff
 * - Request deduplication
 * - Request cancellation
 * - Error handling
 */
export async function fetchWithDataLayer<T>(
  url: string,
  params: Record<string, any> = {},
  options: DataLayerOptions = {},
): Promise<T> {
  const cacheTime = options.cacheTime ?? DEFAULT_CACHE_TIME
  const staleTime = options.staleTime ?? DEFAULT_STALE_TIME
  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  
  const cacheKey = generateCacheKey(url, params)
  
  // Try to get from cache
  const cachedData = getFromCache<T>(cacheKey, staleTime)
  const isStale = isCacheStale(cacheKey, staleTime)
  
  // If we have non-stale cached data, return it immediately
  if (cachedData && !isStale) {
    return cachedData
  }
  
  // Fetch fresh data
  const fetchFreshData = async (): Promise<T> => {
    return fetchWithDeduplication(cacheKey, async () => {
      const controller = createAbortController(cacheKey, timeout)
      
      try {
        const data = await fetchWithRetry(
          async () => {
            const response = await $fetch<T>(url, {
              signal: controller.signal,
              ...params,
            })
            return response
          },
          options,
        )
        
        // Update cache
        setCache(cacheKey, data, cacheTime)
        
        return data
      } catch (error) {
        // If we have stale cached data, return it as fallback
        if (cachedData) {
          console.warn('Fetch failed, using stale cached data:', transformStrapiError(error).message)
          return cachedData
        }
        
        throw transformStrapiError(error)
      } finally {
        abortControllers.delete(cacheKey)
      }
    })
  }
  
  // If we have stale cached data, return it immediately and revalidate in background
  if (cachedData) {
    // Stale-while-revalidate: return stale data and fetch in background
    fetchFreshData().catch(() => {
      // Ignore background fetch errors, we already have cached data
    })
    return cachedData
  }
  
  // No cached data, must fetch
  return fetchFreshData()
}

/**
 * Invalidate cache entries (useful after mutations)
 */
export function invalidateCache(pattern?: string | RegExp): void {
  if (pattern) {
    clearCachePattern(pattern)
    cancelRequestsPattern(pattern)
  } else {
    clearAllCache()
  }
}

/**
 * Build query string from Strapi query params
 */
export function buildStrapiQuery(params: Record<string, any>): Record<string, string> {
  const query: Record<string, string> = {}
  
  function flatten(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key
      
      if (value === null || value === undefined) {
        continue
      }
      
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            flatten(item, `${fullKey}[${index}]`)
          } else {
            query[`${fullKey}[${index}]`] = String(item)
          }
        })
      } else if (typeof value === 'object') {
        flatten(value, fullKey)
      } else {
        query[fullKey] = String(value)
      }
    }
  }
  
  flatten(params)
  return query
}
