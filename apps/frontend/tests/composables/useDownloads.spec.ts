import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDownloads, useDownloadHistory, verifyChecksum, formatFileSize } from '~/composables/useDownloads'

global.fetch = vi.fn()

describe('useDownloads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDownloads composable', () => {
    it('should initialize with empty items', () => {
      const { items, loading, error } = useDownloads()
      
      expect(items.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should fetch downloads with default filters', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              title: 'Test Download',
              slug: 'test-download',
              category: 'Template',
              checksum: 'abc123',
              fileSize: 1024,
              mimeType: 'application/pdf',
            },
          },
        ],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 1,
          },
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const { items, fetchDownloads } = useDownloads()
      await fetchDownloads()

      expect(fetch).toHaveBeenCalled()
    })

    it('should update filters and refetch', async () => {
      const mockResponse = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const { updateFilters } = useDownloads()
      await updateFilters({ category: 'Template', page: 2 })

      expect(fetch).toHaveBeenCalled()
    })

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { error, fetchDownloads } = useDownloads()
      await fetchDownloads()

      expect(error.value).toBeTruthy()
    })
  })

  describe('useDownloadHistory', () => {
    let localStorageMock: Record<string, string> = {}

    beforeEach(() => {
      localStorageMock = {}
      global.localStorage = {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key]
        }),
        clear: vi.fn(() => {
          localStorageMock = {}
        }),
        length: 0,
        key: vi.fn(),
      } as Storage
    })

    it('should return empty history initially', () => {
      const { getHistory } = useDownloadHistory()
      expect(getHistory()).toEqual([])
    })

    it('should add items to history', () => {
      const { addToHistory, getHistory } = useDownloadHistory()
      
      addToHistory({
        itemId: 1,
        title: 'Test Item',
        version: '1.0',
        checksumValid: true,
      })

      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].itemId).toBe(1)
      expect(history[0].title).toBe('Test Item')
    })

    it('should limit history to MAX_HISTORY_ITEMS', () => {
      const { addToHistory, getHistory } = useDownloadHistory()
      
      for (let i = 0; i < 60; i++) {
        addToHistory({
          itemId: i,
          title: `Item ${i}`,
        })
      }

      const history = getHistory()
      expect(history.length).toBeLessThanOrEqual(50)
    })

    it('should clear history', () => {
      const { addToHistory, clearHistory, getHistory } = useDownloadHistory()
      
      addToHistory({
        itemId: 1,
        title: 'Test Item',
      })

      expect(getHistory()).toHaveLength(1)
      
      clearHistory()
      expect(getHistory()).toEqual([])
    })

    it('should handle duplicate items by updating', () => {
      const { addToHistory, getHistory } = useDownloadHistory()
      
      addToHistory({
        itemId: 1,
        title: 'Test Item',
        version: '1.0',
      })

      addToHistory({
        itemId: 1,
        title: 'Test Item',
        version: '2.0',
      })

      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].version).toBe('2.0')
    })
  })

  describe('verifyChecksum', () => {
    beforeEach(() => {
      global.crypto = {
        subtle: {
          digest: vi.fn(async (algorithm: string, data: ArrayBuffer) => {
            return new Uint8Array([0, 1, 2, 3]).buffer
          }),
        },
      } as any
    })

    it('should verify checksum correctly', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const checksum = '00010203'

      const result = await verifyChecksum(file, checksum)
      expect(result).toBe(true)
    })

    it('should return false for mismatched checksum', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const checksum = 'wrongchecksum'

      const result = await verifyChecksum(file, checksum)
      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      global.crypto = undefined as any
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })

      const result = await verifyChecksum(file, 'anyChecksum')
      expect(result).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle large file sizes', () => {
      const result = formatFileSize(5368709120)
      expect(result).toContain('GB')
    })

    it('should format decimal places correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2560)).toBe('2.5 KB')
    })
  })
})
