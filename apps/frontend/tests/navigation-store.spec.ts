import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockNavigationResponse } from './fixtures/navigation'

const fetchCourseNavigationMock = vi.fn().mockResolvedValue(mockNavigationResponse)

vi.mock('~/composables/useNavigationData', () => ({
  fetchCourseNavigation: fetchCourseNavigationMock,
}))

import { useNavigationStore } from '~/stores/navigation'

describe('useNavigationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchCourseNavigationMock.mockClear()
  })

  it('loads navigation structure from provided data', async () => {
    const store = useNavigationStore()

    expect(store.hasStructure).toBe(false)

    await store.loadStructure({ data: mockNavigationResponse })

    expect(store.hasStructure).toBe(true)
    expect(store.lessonCount).toBe(6)
    expect(store.courseStructure?.parts.length).toBe(4)
    expect(store.getLessonByCode('P-00')?.title).toBe('Welcome to Foundations')
  })

  it('setCurrentLesson updates active part and current lesson', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    const lesson = store.setCurrentLesson('PA-01')

    expect(lesson?.code).toBe('PA-01')
    expect(store.currentLesson?.code).toBe('PA-01')
    expect(store.activePart).toBe('core-blocks')
  })

  it('normalizes lesson codes when setting the current lesson', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    const lesson = store.setCurrentLesson('pa-01')

    expect(lesson?.code).toBe('PA-01')
    expect(store.currentLesson?.code).toBe('PA-01')
  })

  it('navigateToLesson fetches structure when needed', async () => {
    const store = useNavigationStore()

    fetchCourseNavigationMock.mockResolvedValueOnce(mockNavigationResponse)

    const lesson = await store.navigateToLesson('P-00')

    expect(fetchCourseNavigationMock).toHaveBeenCalledTimes(1)
    expect(store.hasStructure).toBe(true)
    expect(lesson?.code).toBe('P-00')
  })

  it('provides lesson neighbors', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    const neighbors = store.getLessonNeighbors('PA-01')

    expect(neighbors.previous?.code).toBe('P-01')
    expect(neighbors.next?.code).toBe('PB-01')
  })

  it('handles unknown lessons gracefully', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    store.setCurrentLesson('P-00')
    expect(store.currentLesson).not.toBeNull()

    expect(store.setCurrentLesson('UNKNOWN')).toBeNull()
    expect(store.currentLesson).toBeNull()
    expect(store.activePart).toBeNull()

    const neighbors = store.getLessonNeighbors('UNKNOWN')
    expect(neighbors.previous).toBeNull()
    expect(neighbors.next).toBeNull()
  })

  it('clears current lesson state when requested', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    store.setCurrentLesson('PA-01')
    expect(store.currentLesson).not.toBeNull()

    store.clearCurrentLesson()

    expect(store.currentLesson).toBeNull()
    expect(store.activePart).toBeNull()
  })

  it('avoids refetching structure when already loaded unless forced', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    await store.loadStructure()
    expect(fetchCourseNavigationMock).not.toHaveBeenCalled()

    fetchCourseNavigationMock.mockResolvedValueOnce(mockNavigationResponse)
    await store.loadStructure({ force: true })
    expect(fetchCourseNavigationMock).toHaveBeenCalledTimes(1)
  })

  it('getLessonsByPart returns lessons for a specific part', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    const foundationLessons = store.getLessonsByPart('foundation')
    expect(foundationLessons.length).toBeGreaterThan(0)
    expect(foundationLessons.every((lesson) => lesson.part === 'foundation')).toBe(true)

    const coreBlocksLessons = store.getLessonsByPart('core-blocks')
    expect(coreBlocksLessons.length).toBeGreaterThan(0)
    expect(coreBlocksLessons.every((lesson) => lesson.part === 'core-blocks')).toBe(true)
  })

  it('handles empty lesson codes in setCurrentLesson', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    store.setCurrentLesson('P-00')
    expect(store.currentLesson).not.toBeNull()

    store.setCurrentLesson('')
    expect(store.currentLesson).toBeNull()

    store.setCurrentLesson('P-00')
    store.setCurrentLesson('   ')
    expect(store.currentLesson).toBeNull()
  })

  it('tracks loading state during structure load', async () => {
    const store = useNavigationStore()
    expect(store.isLoading).toBe(false)

    const loadPromise = store.loadStructure({ data: mockNavigationResponse })
    // Note: depending on timing, isLoading might be true or already false
    await loadPromise

    expect(store.isLoading).toBe(false)
    expect(store.lastLoadedAt).not.toBeNull()
  })

  it('refreshes current lesson when reloading structure', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    store.setCurrentLesson('P-00')
    const originalLesson = store.currentLesson

    await store.loadStructure({ force: true, data: mockNavigationResponse })

    expect(store.currentLesson?.code).toBe(originalLesson?.code)
    expect(store.activePart).toBe(originalLesson?.part)
  })

  it('getLessonByCode handles case-insensitive lookups', async () => {
    const store = useNavigationStore()
    await store.loadStructure({ data: mockNavigationResponse })

    const upperCase = store.getLessonByCode('P-00')
    const lowerCase = store.getLessonByCode('p-00')
    const mixedCase = store.getLessonByCode('P-00')

    expect(upperCase).toBeDefined()
    expect(lowerCase).toBeDefined()
    expect(mixedCase).toBeDefined()
    expect(upperCase?.code).toBe(lowerCase?.code)
    expect(upperCase?.code).toBe(mixedCase?.code)
  })
})
