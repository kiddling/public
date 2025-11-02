import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useSearchStore } from '~/stores/search'

// Mock $fetch
vi.stubGlobal('$fetch', vi.fn())

describe('useSearchStore', () => {
  beforeEach(() => {
    localStorage.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const store = useSearchStore()

    expect(store.query).toBe('')
    expect(store.results).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isOpen).toBe(false)
    expect(store.searchHistory).toEqual([])
    expect(store.recentVisits).toEqual([])
  })

  it('opens and closes search modal', () => {
    const store = useSearchStore()

    expect(store.isOpen).toBe(false)

    store.open()
    expect(store.isOpen).toBe(true)

    store.close()
    expect(store.isOpen).toBe(false)
    expect(store.query).toBe('')
    expect(store.results).toBeNull()
  })

  it('adds queries to search history', () => {
    const store = useSearchStore()

    store.addToHistory('design thinking')
    expect(store.searchHistory.length).toBe(1)
    expect(store.searchHistory[0].query).toBe('design thinking')
    expect(store.hasHistory).toBe(true)

    store.addToHistory('student works')
    expect(store.searchHistory.length).toBe(2)
    expect(store.searchHistory[0].query).toBe('student works')
  })

  it('does not add empty queries to history', () => {
    const store = useSearchStore()

    store.addToHistory('')
    store.addToHistory('   ')
    expect(store.searchHistory.length).toBe(0)
  })

  it('removes duplicate queries from history', () => {
    const store = useSearchStore()

    store.addToHistory('design')
    store.addToHistory('thinking')
    store.addToHistory('design')

    expect(store.searchHistory.length).toBe(2)
    expect(store.searchHistory[0].query).toBe('design')
    expect(store.searchHistory[1].query).toBe('thinking')
  })

  it('limits search history to MAX_HISTORY_ITEMS', () => {
    const store = useSearchStore()

    for (let i = 0; i < 15; i++) {
      store.addToHistory(`query ${i}`)
    }

    expect(store.searchHistory.length).toBe(10)
    expect(store.searchHistory[0].query).toBe('query 14')
  })

  it('clears search history', () => {
    const store = useSearchStore()

    store.addToHistory('design')
    store.addToHistory('thinking')
    expect(store.searchHistory.length).toBe(2)

    store.clearHistory()
    expect(store.searchHistory.length).toBe(0)
    expect(store.hasHistory).toBe(false)
  })

  it('adds items to recent visits', () => {
    const store = useSearchStore()

    store.addToRecentVisits({
      id: 1,
      type: 'lesson',
      title: 'Design Thinking',
      url: '/lessons/design-thinking',
    })

    expect(store.recentVisits.length).toBe(1)
    expect(store.recentVisits[0].title).toBe('Design Thinking')
    expect(store.hasRecentVisits).toBe(true)
  })

  it('removes duplicate items from recent visits', () => {
    const store = useSearchStore()

    const item = {
      id: 1,
      type: 'lesson',
      title: 'Design Thinking',
      url: '/lessons/design-thinking',
    }

    store.addToRecentVisits(item)
    store.addToRecentVisits(item)

    expect(store.recentVisits.length).toBe(1)
  })

  it('limits recent visits to MAX_RECENT_VISITS', () => {
    const store = useSearchStore()

    for (let i = 0; i < 10; i++) {
      store.addToRecentVisits({
        id: i,
        type: 'lesson',
        title: `Lesson ${i}`,
        url: `/lessons/${i}`,
      })
    }

    expect(store.recentVisits.length).toBe(5)
    expect(store.recentVisits[0].id).toBe(9)
  })

  it('clears recent visits', () => {
    const store = useSearchStore()

    store.addToRecentVisits({
      id: 1,
      type: 'lesson',
      title: 'Design Thinking',
      url: '/lessons/design-thinking',
    })

    expect(store.recentVisits.length).toBe(1)

    store.clearRecentVisits()
    expect(store.recentVisits.length).toBe(0)
    expect(store.hasRecentVisits).toBe(false)
  })

  it('resets search state', () => {
    const store = useSearchStore()

    store.query = 'test query'
    store.results = { results: [], groups: {}, suggestions: [], total: 0, page: 1, pageSize: 10 } as any
    store.error = 'test error'
    store.isLoading = true

    store.reset()

    expect(store.query).toBe('')
    expect(store.results).toBeNull()
    expect(store.error).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('does not search for queries shorter than 2 characters', async () => {
    const store = useSearchStore()

    await store.search('a')
    expect(store.results).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  it('performs search and updates results', async () => {
    const mockResults = {
      results: [
        {
          id: 1,
          type: 'lesson',
          title: 'Design Thinking',
          excerpt: 'Learn about design thinking',
          highlights: { title: [], excerpt: [] },
          meta: {},
          url: '/lessons/design-thinking',
        },
      ],
      groups: {
        lessons: [],
        knowledgeCards: [],
        studentWorks: [],
        resources: [],
      },
      suggestions: [],
      total: 1,
      page: 1,
      pageSize: 10,
    }

    vi.mocked($fetch).mockResolvedValueOnce(mockResults)

    const store = useSearchStore()
    await store.search('design')

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350))
    await nextTick()

    expect(store.results).toEqual(mockResults)
    expect(store.hasResults).toBe(true)
    expect(store.searchHistory.length).toBe(1)
  })

  it('handles search errors gracefully', async () => {
    vi.mocked($fetch).mockRejectedValueOnce(new Error('Network error'))

    const store = useSearchStore()
    
    try {
      await store.search('design')
      await new Promise((resolve) => setTimeout(resolve, 350))
    } catch (e) {
      // Expected to fail
    }

    await nextTick()
    
    expect(store.error).toBeTruthy()
    expect(store.isLoading).toBe(false)
  })

  it('computes showEmptyState correctly', () => {
    const store = useSearchStore()

    expect(store.showEmptyState).toBe(false)

    store.query = 'test'
    expect(store.showEmptyState).toBe(true)

    store.isLoading = true
    expect(store.showEmptyState).toBe(false)

    store.isLoading = false
    store.results = { results: [{ id: 1 }] } as any
    expect(store.showEmptyState).toBe(false)
  })

  it('persists search history to localStorage', () => {
    const store = useSearchStore()

    store.addToHistory('design thinking')
    
    const stored = localStorage.getItem('global-search-history')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.length).toBe(1)
    expect(parsed[0].query).toBe('design thinking')
  })

  it('persists recent visits to localStorage', () => {
    const store = useSearchStore()

    store.addToRecentVisits({
      id: 1,
      type: 'lesson',
      title: 'Design Thinking',
      url: '/lessons/design-thinking',
    })

    const stored = localStorage.getItem('global-search-recent-visits')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.length).toBe(1)
    expect(parsed[0].title).toBe('Design Thinking')
  })
})
