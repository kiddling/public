/**
 * Composable for implementing cache fallback strategies
 */

import { useLogger } from '~/utils/logger'

export interface CacheOptions {
  key: string
  ttl?: number // Time to live in milliseconds
  storage?: 'local' | 'session' | 'memory'
}

class CacheManager {
  private memoryCache: Map<string, { data: any; timestamp: number }> = new Map()

  set(key: string, data: any, storage: 'local' | 'session' | 'memory' = 'memory', ttl?: number) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    }

    if (storage === 'memory') {
      this.memoryCache.set(key, { data, timestamp: Date.now() })
    } else if (process.client) {
      try {
        const storageObj = storage === 'local' ? localStorage : sessionStorage
        storageObj.setItem(key, JSON.stringify(cacheEntry))
      } catch (error) {
        console.warn('Failed to save to storage:', error)
        // Fallback to memory cache
        this.memoryCache.set(key, { data, timestamp: Date.now() })
      }
    }
  }

  get(key: string, storage: 'local' | 'session' | 'memory' = 'memory'): any | null {
    if (storage === 'memory') {
      const entry = this.memoryCache.get(key)
      return entry ? entry.data : null
    }

    if (process.client) {
      try {
        const storageObj = storage === 'local' ? localStorage : sessionStorage
        const cached = storageObj.getItem(key)
        
        if (!cached) return null

        const { data, timestamp, ttl } = JSON.parse(cached)

        // Check if expired
        if (ttl && Date.now() - timestamp > ttl) {
          this.remove(key, storage)
          return null
        }

        return data
      } catch (error) {
        console.warn('Failed to read from storage:', error)
        return null
      }
    }

    return null
  }

  remove(key: string, storage: 'local' | 'session' | 'memory' = 'memory') {
    if (storage === 'memory') {
      this.memoryCache.delete(key)
    } else if (process.client) {
      try {
        const storageObj = storage === 'local' ? localStorage : sessionStorage
        storageObj.removeItem(key)
      } catch (error) {
        console.warn('Failed to remove from storage:', error)
      }
    }
  }

  clear(storage?: 'local' | 'session' | 'memory') {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear()
    }

    if (process.client && (!storage || storage === 'local')) {
      try {
        localStorage.clear()
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }

    if (process.client && (!storage || storage === 'session')) {
      try {
        sessionStorage.clear()
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error)
      }
    }
  }
}

const cacheManager = new CacheManager()

export function useCacheFallback<T>(options: CacheOptions) {
  const logger = useLogger()
  const { key, ttl = 3600000, storage = 'memory' } = options // Default 1 hour TTL

  const getCached = (): T | null => {
    const cached = cacheManager.get(key, storage)
    if (cached) {
      logger.debug('Cache hit', { key })
    }
    return cached
  }

  const setCache = (data: T) => {
    cacheManager.set(key, data, storage, ttl)
    logger.debug('Cache updated', { key })
  }

  const clearCache = () => {
    cacheManager.remove(key, storage)
    logger.debug('Cache cleared', { key })
  }

  const fetchWithFallback = async <T>(
    fetcher: () => Promise<T>,
    options: {
      useCache?: boolean
      updateCache?: boolean
    } = {}
  ): Promise<T> => {
    const { useCache = true, updateCache = true } = options

    // Try to get from cache first
    if (useCache) {
      const cached = getCached()
      if (cached !== null) {
        logger.info('Using cached data', { key })
        
        // Optionally fetch fresh data in background
        fetcher()
          .then((fresh) => {
            if (updateCache) {
              setCache(fresh as T)
            }
          })
          .catch((error) => {
            logger.warn('Background fetch failed', { key }, error)
          })

        return cached as T
      }
    }

    // Fetch fresh data
    try {
      const data = await fetcher()
      
      if (updateCache) {
        setCache(data as T)
      }
      
      return data
    } catch (error) {
      logger.error('Fetch failed, checking cache', { key }, error)

      // Try cache as fallback even if useCache was false
      const cached = getCached()
      if (cached !== null) {
        logger.warn('Using stale cache as fallback', { key })
        return cached as T
      }

      // No cache available, throw error
      throw error
    }
  }

  return {
    getCached,
    setCache,
    clearCache,
    fetchWithFallback,
  }
}

// Composable for offline-first data fetching
export function useOfflineFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    storage?: 'local' | 'session'
  } = {}
) {
  const { ttl = 86400000, storage = 'local' } = options // Default 24 hours
  const { getCached, setCache, fetchWithFallback } = useCacheFallback<T>({
    key,
    ttl,
    storage,
  })

  const data = ref<T | null>(getCached())
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  const isStale = ref(false)

  const refresh = async (forceRefresh = false) => {
    isLoading.value = true
    error.value = null

    try {
      if (forceRefresh) {
        // Force fresh fetch
        const fresh = await fetcher()
        setCache(fresh)
        data.value = fresh
        isStale.value = false
      } else {
        // Use cache with fallback
        const result = await fetchWithFallback(fetcher, {
          useCache: true,
          updateCache: true,
        })
        data.value = result
        isStale.value = false
      }
    } catch (err: any) {
      error.value = err
      // If we have cached data, mark it as stale but keep using it
      if (data.value !== null) {
        isStale.value = true
      }
    } finally {
      isLoading.value = false
    }
  }

  // Initial fetch
  onMounted(() => {
    if (data.value === null) {
      refresh()
    }
  })

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    isStale: readonly(isStale),
    refresh,
  }
}
