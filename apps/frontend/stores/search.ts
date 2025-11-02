import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SearchResult {
  id: number
  type: 'lesson' | 'knowledge-card' | 'student-work' | 'resource'
  title: string
  excerpt: string
  highlights: {
    title: Array<{ start: number; end: number }>
    excerpt: Array<{ start: number; end: number }>
  }
  meta: Record<string, any>
  url: string
}

export interface SearchResponse {
  results: SearchResult[]
  groups: {
    lessons: SearchResult[]
    knowledgeCards: SearchResult[]
    studentWorks: SearchResult[]
    resources: SearchResult[]
  }
  suggestions: string[]
  total: number
  page: number
  pageSize: number
}

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

export interface RecentVisit {
  id: number
  type: string
  title: string
  url: string
  timestamp: number
}

const SEARCH_HISTORY_KEY = 'global-search-history'
const RECENT_VISITS_KEY = 'global-search-recent-visits'
const MAX_HISTORY_ITEMS = 10
const MAX_RECENT_VISITS = 5

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<SearchResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isOpen = ref(false)
  const searchHistory = ref<SearchHistoryItem[]>([])
  const recentVisits = ref<RecentVisit[]>([])
  
  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_DELAY = 300

  // Load history from localStorage
  const loadHistory = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
        if (stored) {
          searchHistory.value = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }

  // Save history to localStorage
  const saveHistory = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
      } catch (e) {
        console.error('Failed to save search history:', e)
      }
    }
  }

  // Load recent visits from localStorage
  const loadRecentVisits = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(RECENT_VISITS_KEY)
        if (stored) {
          recentVisits.value = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load recent visits:', e)
      }
    }
  }

  // Save recent visits to localStorage
  const saveRecentVisits = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem(RECENT_VISITS_KEY, JSON.stringify(recentVisits.value))
      } catch (e) {
        console.error('Failed to save recent visits:', e)
      }
    }
  }

  // Add to search history
  const addToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      return
    }

    // Remove existing entry if present
    searchHistory.value = searchHistory.value.filter((item) => item.query !== searchQuery)

    // Add to beginning
    searchHistory.value.unshift({
      query: searchQuery,
      timestamp: Date.now(),
    })

    // Keep only MAX_HISTORY_ITEMS
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  // Add to recent visits
  const addToRecentVisits = (item: Omit<RecentVisit, 'timestamp'>) => {
    // Remove existing entry if present
    recentVisits.value = recentVisits.value.filter(
      (visit) => !(visit.id === item.id && visit.type === item.type),
    )

    // Add to beginning
    recentVisits.value.unshift({
      ...item,
      timestamp: Date.now(),
    })

    // Keep only MAX_RECENT_VISITS
    if (recentVisits.value.length > MAX_RECENT_VISITS) {
      recentVisits.value = recentVisits.value.slice(0, MAX_RECENT_VISITS)
    }

    saveRecentVisits()
  }

  // Clear search history
  const clearHistory = () => {
    searchHistory.value = []
    saveHistory()
  }

  // Clear recent visits
  const clearRecentVisits = () => {
    recentVisits.value = []
    saveRecentVisits()
  }

  // Perform search with debouncing
  const search = async (searchQuery: string, options: {
    type?: string[]
    difficulty?: string[]
    page?: number
    pageSize?: number
  } = {}) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set loading state immediately
    query.value = searchQuery
    error.value = null

    // If query is too short, clear results
    if (searchQuery.trim().length < 2) {
      results.value = null
      isLoading.value = false
      return
    }

    // Set loading after a brief delay to avoid flicker
    const loadingTimer = setTimeout(() => {
      isLoading.value = true
    }, 100)

    // Debounce the actual search
    return new Promise<void>((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            query: searchQuery.trim(),
          })

          if (options.type && options.type.length > 0) {
            params.append('type', options.type.join(','))
          }

          if (options.difficulty && options.difficulty.length > 0) {
            params.append('difficulty', options.difficulty.join(','))
          }

          if (options.page) {
            params.append('page', options.page.toString())
          }

          if (options.pageSize) {
            params.append('pageSize', options.pageSize.toString())
          }

          const response = await $fetch<SearchResponse>(`/api/search/global?${params.toString()}`)
          
          results.value = response
          addToHistory(searchQuery)
          clearTimeout(loadingTimer)
          isLoading.value = false

          // Track analytics event
          if (import.meta.client) {
            const analytics = useAnalytics()
            analytics.trackSearch(searchQuery, response.total)
          }

          resolve()
        } catch (err: any) {
          clearTimeout(loadingTimer)
          isLoading.value = false
          error.value = err.message || 'Search failed'
          console.error('Search error:', err)
          reject(err)
        }
      }, DEBOUNCE_DELAY)
    })
  }

  // Open search modal
  const open = () => {
    isOpen.value = true
    loadHistory()
    loadRecentVisits()
  }

  // Close search modal
  const close = () => {
    isOpen.value = false
    query.value = ''
    results.value = null
    error.value = null
  }

  // Reset search state
  const reset = () => {
    query.value = ''
    results.value = null
    error.value = null
    isLoading.value = false
  }

  // Computed properties
  const hasResults = computed(() => results.value && results.value.results.length > 0)
  const hasHistory = computed(() => searchHistory.value.length > 0)
  const hasRecentVisits = computed(() => recentVisits.value.length > 0)
  const showEmptyState = computed(() => query.value.trim().length >= 2 && !isLoading.value && !hasResults.value)

  return {
    // State
    query,
    results,
    isLoading,
    error,
    isOpen,
    searchHistory,
    recentVisits,

    // Computed
    hasResults,
    hasHistory,
    hasRecentVisits,
    showEmptyState,

    // Actions
    search,
    open,
    close,
    reset,
    addToHistory,
    addToRecentVisits,
    clearHistory,
    clearRecentVisits,
  }
})
