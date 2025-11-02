import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface DownloadItem {
  id: number
  attributes: {
    title: string
    slug: string
    category: string
    description?: string
    version?: string
    tag?: string
    checksum: string
    fileSize: number
    mimeType: string
    file: {
      data: {
        id: number
        attributes: {
          name: string
          url: string
          size: number
          mime: string
        }
      }
    }
    relatedLessons?: {
      data: Array<{
        id: number
        attributes: {
          title: string
          code: string
        }
      }>
    }
    relatedResources?: {
      data: Array<{
        id: number
        attributes: {
          title: string
        }
      }>
    }
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export interface DownloadMeta {
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export interface DownloadFilters {
  category?: string
  search?: string
  lessonId?: string
  page?: number
  pageSize?: number
}

export interface DownloadHistory {
  itemId: number
  title: string
  downloadedAt: string
  version?: string
  checksumValid?: boolean
}

const HISTORY_STORAGE_KEY = 'download-center-history'
const MAX_HISTORY_ITEMS = 50

export function useDownloads(initialFilters: DownloadFilters = {}) {
  const items: Ref<DownloadItem[]> = ref([])
  const meta: Ref<DownloadMeta | null> = ref(null)
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)
  const filters = ref({ ...initialFilters })

  const fetchDownloads = async () => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      if (filters.value.page) {
        params.append('page', String(filters.value.page))
      }
      if (filters.value.pageSize) {
        params.append('pageSize', String(filters.value.pageSize))
      }
      if (filters.value.category) {
        params.append('category', filters.value.category)
      }
      if (filters.value.search) {
        params.append('search', filters.value.search)
      }
      if (filters.value.lessonId) {
        params.append('lessonId', filters.value.lessonId)
      }

      const response = await $fetch<{ data: DownloadItem[]; meta: DownloadMeta }>(
        `/api/downloads?${params.toString()}`
      )

      items.value = response.data
      meta.value = response.meta
    } catch (e) {
      error.value = e as Error
      items.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  const updateFilters = async (newFilters: Partial<DownloadFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
    await fetchDownloads()
  }

  const refresh = async () => {
    await fetchDownloads()
  }

  return {
    items,
    meta,
    loading,
    error,
    filters,
    fetchDownloads,
    updateFilters,
    refresh,
  }
}

export function useDownloadHistory() {
  const getHistory = (): DownloadHistory[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const addToHistory = (item: Omit<DownloadHistory, 'downloadedAt'>) => {
    if (typeof window === 'undefined') return

    const history = getHistory()

    const newEntry: DownloadHistory = {
      ...item,
      downloadedAt: new Date().toISOString(),
    }

    const updatedHistory = [newEntry, ...history.filter((h) => h.itemId !== item.itemId)].slice(
      0,
      MAX_HISTORY_ITEMS
    )

    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (e) {
      console.error('Failed to save download history:', e)
    }
  }

  const clearHistory = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear download history:', e)
    }
  }

  return {
    getHistory,
    addToHistory,
    clearHistory,
  }
}

export async function verifyChecksum(file: File, expectedChecksum: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return false
  }

  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    return hashHex === expectedChecksum
  } catch (e) {
    console.error('Checksum verification failed:', e)
    return false
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
