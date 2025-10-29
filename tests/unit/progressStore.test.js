import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressStore } from '@/stores/progressStore'

describe('Progress Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty completed lessons', () => {
    const store = useProgressStore()
    expect(store.completedCount).toBe(0)
    expect(store.completionPercentage).toBe(0)
  })

  it('marks a lesson as complete', () => {
    const store = useProgressStore()
    store.markLessonComplete(1)
    expect(store.isLessonComplete(1)).toBe(true)
    expect(store.completedCount).toBe(1)
  })

  it('marks a lesson as incomplete', () => {
    const store = useProgressStore()
    store.markLessonComplete(1)
    store.markLessonIncomplete(1)
    expect(store.isLessonComplete(1)).toBe(false)
    expect(store.completedCount).toBe(0)
  })

  it('toggles lesson completion', () => {
    const store = useProgressStore()
    store.toggleLessonCompletion(1)
    expect(store.isLessonComplete(1)).toBe(true)
    store.toggleLessonCompletion(1)
    expect(store.isLessonComplete(1)).toBe(false)
  })

  it('calculates completion percentage correctly', () => {
    const store = useProgressStore()
    const totalLessons = store.totalLessons
    store.markLessonComplete(1)
    store.markLessonComplete(2)
    store.markLessonComplete(3)
    const expectedPercentage = Math.round((3 / totalLessons) * 100)
    expect(store.completionPercentage).toBe(expectedPercentage)
  })

  it('persists progress to localStorage', () => {
    const store = useProgressStore()
    store.markLessonComplete(1)
    store.markLessonComplete(2)
    
    const stored = localStorage.getItem('course_progress')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored)
    expect(parsed).toContain(1)
    expect(parsed).toContain(2)
  })

  it('loads progress from localStorage', () => {
    localStorage.setItem('course_progress', JSON.stringify([1, 2, 3]))
    const store = useProgressStore()
    expect(store.isLessonComplete(1)).toBe(true)
    expect(store.isLessonComplete(2)).toBe(true)
    expect(store.isLessonComplete(3)).toBe(true)
    expect(store.completedCount).toBe(3)
  })

  it('resets progress', () => {
    const store = useProgressStore()
    store.markLessonComplete(1)
    store.markLessonComplete(2)
    store.resetProgress()
    expect(store.completedCount).toBe(0)
    expect(store.isLessonComplete(1)).toBe(false)
  })
})
