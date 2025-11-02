import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateCacheKey,
  getFromCache,
  setCache,
  clearCacheEntry,
  clearAllCache,
  isCacheStale,
  buildStrapiQuery,
} from '~/utils/data-layer'

describe('data-layer utilities', () => {
  beforeEach(() => {
    clearAllCache()
  })

  describe('generateCacheKey', () => {
    it('should generate key from URL only', () => {
      const key = generateCacheKey('/api/lessons')
      expect(key).toBe('/api/lessons')
    })

    it('should generate key from URL and params', () => {
      const key = generateCacheKey('/api/lessons', { page: 1, limit: 10 })
      expect(key).toContain('/api/lessons')
      expect(key).toContain('page')
      expect(key).toContain('limit')
    })

    it('should generate consistent keys for same params in different order', () => {
      const key1 = generateCacheKey('/api/lessons', { b: 2, a: 1 })
      const key2 = generateCacheKey('/api/lessons', { a: 1, b: 2 })
      expect(key1).toBe(key2)
    })
  })

  describe('cache operations', () => {
    it('should set and get from cache', () => {
      const key = 'test-key'
      const data = { id: 1, name: 'Test' }
      const cacheTime = 60000

      setCache(key, data, cacheTime)
      const cached = getFromCache(key, 30000)

      expect(cached).toEqual(data)
    })

    it('should return null for non-existent key', () => {
      const cached = getFromCache('non-existent', 30000)
      expect(cached).toBeNull()
    })

    it('should return null for expired cache', () => {
      const key = 'expired-key'
      const data = { id: 1 }
      const cacheTime = -1000 // Already expired

      setCache(key, data, cacheTime)
      const cached = getFromCache(key, 30000)

      expect(cached).toBeNull()
    })

    it('should detect stale cache', () => {
      const key = 'stale-key'
      const data = { id: 1 }
      const cacheTime = 60000
      const staleTime = -1000 // Already stale

      setCache(key, data, cacheTime)
      const isStale = isCacheStale(key, staleTime)

      expect(isStale).toBe(true)
    })

    it('should clear specific cache entry', () => {
      const key = 'clear-key'
      const data = { id: 1 }

      setCache(key, data, 60000)
      clearCacheEntry(key)
      const cached = getFromCache(key, 30000)

      expect(cached).toBeNull()
    })

    it('should clear all cache', () => {
      setCache('key1', { id: 1 }, 60000)
      setCache('key2', { id: 2 }, 60000)

      clearAllCache()

      expect(getFromCache('key1', 30000)).toBeNull()
      expect(getFromCache('key2', 30000)).toBeNull()
    })
  })

  describe('buildStrapiQuery', () => {
    it('should build simple query', () => {
      const params = { page: 1, limit: 10 }
      const query = buildStrapiQuery(params)

      expect(query.page).toBe('1')
      expect(query.limit).toBe('10')
    })

    it('should build nested query', () => {
      const params = {
        filters: {
          title: { $eq: 'Test' },
        },
      }
      const query = buildStrapiQuery(params)

      expect(query['filters[title][$eq]']).toBe('Test')
    })

    it('should build array query', () => {
      const params = {
        sort: ['name:asc', 'date:desc'],
      }
      const query = buildStrapiQuery(params)

      expect(query['sort[0]']).toBe('name:asc')
      expect(query['sort[1]']).toBe('date:desc')
    })

    it('should skip null and undefined values', () => {
      const params = {
        a: 1,
        b: null,
        c: undefined,
        d: 'test',
      }
      const query = buildStrapiQuery(params)

      expect(query.a).toBe('1')
      expect(query.b).toBeUndefined()
      expect(query.c).toBeUndefined()
      expect(query.d).toBe('test')
    })

    it('should handle complex nested structures', () => {
      const params = {
        populate: {
          media: '*',
          lessons: {
            populate: ['part', 'loop'],
          },
        },
      }
      const query = buildStrapiQuery(params)

      expect(query['populate[media]']).toBe('*')
      expect(query['populate[lessons][populate][0]']).toBe('part')
      expect(query['populate[lessons][populate][1]']).toBe('loop')
    })
  })
})
