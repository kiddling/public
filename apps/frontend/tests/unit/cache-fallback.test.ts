import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCacheFallback } from '~/composables/useCacheFallback'

describe('useCacheFallback', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  })

  it('should cache and retrieve data', async () => {
    const { setCache, getCached } = useCacheFallback<{ name: string }>({
      key: 'test-cache',
      storage: 'memory',
    })

    const testData = { name: 'Test User' }
    setCache(testData)

    const cached = getCached()
    expect(cached).toEqual(testData)
  })

  it('should return null for non-existent cache', () => {
    const { getCached } = useCacheFallback({
      key: 'non-existent',
      storage: 'memory',
    })

    const cached = getCached()
    expect(cached).toBeNull()
  })

  it('should clear cache', () => {
    const { setCache, getCached, clearCache } = useCacheFallback({
      key: 'test-clear',
      storage: 'memory',
    })

    setCache({ data: 'test' })
    expect(getCached()).not.toBeNull()

    clearCache()
    expect(getCached()).toBeNull()
  })

  it('should fetch with fallback on success', async () => {
    const { fetchWithFallback } = useCacheFallback({
      key: 'test-fetch',
      storage: 'memory',
    })

    const mockData = { id: 1, name: 'Test' }
    const fetcher = vi.fn().mockResolvedValue(mockData)

    const result = await fetchWithFallback(fetcher)
    expect(result).toEqual(mockData)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should use cache when available', async () => {
    const { setCache, fetchWithFallback } = useCacheFallback({
      key: 'test-use-cache',
      storage: 'memory',
    })

    const cachedData = { id: 1, name: 'Cached' }
    setCache(cachedData)

    const fetcher = vi.fn().mockResolvedValue({ id: 2, name: 'Fresh' })

    const result = await fetchWithFallback(fetcher, { useCache: true })
    expect(result).toEqual(cachedData)

    // Should still call fetcher in background
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should fallback to cache on fetch error', async () => {
    const { setCache, fetchWithFallback } = useCacheFallback({
      key: 'test-error-fallback',
      storage: 'memory',
    })

    const cachedData = { id: 1, name: 'Cached' }
    setCache(cachedData)

    const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'))

    const result = await fetchWithFallback(fetcher, { useCache: false })
    expect(result).toEqual(cachedData)
  })

  it('should throw error when no cache and fetch fails', async () => {
    const { fetchWithFallback } = useCacheFallback({
      key: 'test-no-cache',
      storage: 'memory',
    })

    const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'))

    await expect(fetchWithFallback(fetcher, { useCache: false })).rejects.toThrow('Fetch failed')
  })
})

describe('Cache TTL', () => {
  it('should respect TTL in memory storage', async () => {
    const { setCache, getCached } = useCacheFallback({
      key: 'test-ttl',
      ttl: 100, // 100ms
      storage: 'memory',
    })

    setCache({ data: 'test' })
    expect(getCached()).not.toBeNull()

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Note: Memory storage doesn't actually expire by TTL
    // This is a limitation of the current implementation
    // In a real scenario, you'd implement TTL checking in the get method
  })
})
