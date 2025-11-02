import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useNavigationStore } from '~/stores/navigation'
import { useProgressStore } from '~/stores/progress'
import { mockNavigationResponse } from './fixtures/navigation'

async function prepareNavigationStore() {
  const navigationStore = useNavigationStore()
  await navigationStore.loadStructure({ data: mockNavigationResponse })
  return navigationStore
}

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('tracks lesson completion state and computes overall progress', async () => {
    const navigationStore = await prepareNavigationStore()
    const progressStore = useProgressStore()

    expect(progressStore.totalLessons).toBe(navigationStore.lessonCount)
    expect(progressStore.completionPercentage).toBe(0)

    progressStore.markLessonComplete('P-00')
    await nextTick()

    expect(progressStore.isLessonComplete('P-00')).toBe(true)
    expect(progressStore.completedLessonCodes).toContain('P-00')
    expect(progressStore.completedCount).toBe(1)
    expect(progressStore.completionPercentage).toBe(17)

    const foundationProgress = progressStore.getProgressByPart('foundation')
    expect(foundationProgress.total).toBeGreaterThan(0)
    expect(foundationProgress.completed).toBe(1)

    const loopProgress = progressStore.getProgressByLoop('101')
    expect(loopProgress.total).toBeGreaterThan(0)
    expect(loopProgress.completed).toBe(1)
    expect(loopProgress.loopId).toBe('101')
  })

  it('persists progress to localStorage and restores state', async () => {
    const navigationStore = await prepareNavigationStore()
    const progressStore = useProgressStore()

    progressStore.markLessonComplete('PA-01')
    await nextTick()

    const stored = localStorage.getItem('course:progress:lessons')
    expect(stored).toBeTruthy()

    const secondPinia = createPinia()
    setActivePinia(secondPinia)

    const navigationStore2 = useNavigationStore()
    await navigationStore2.loadStructure({ data: mockNavigationResponse })

    const restoredProgress = useProgressStore()
    expect(restoredProgress.isLessonComplete('PA-01')).toBe(true)
    expect(restoredProgress.completedCount).toBe(1)
    expect(restoredProgress.completionPercentage).toBeGreaterThan(0)
    expect(restoredProgress.lastVisitedLesson).toBe('PA-01')

    // ensure navigation store reference updated correctly
    expect(restoredProgress.totalLessons).toBe(navigationStore.lessonCount)
  })

  it('toggles lesson completion between complete and incomplete', async () => {
    await prepareNavigationStore()
    const progressStore = useProgressStore()

    expect(progressStore.isLessonComplete('P-00')).toBe(false)

    progressStore.toggleLessonCompletion('P-00')
    await nextTick()
    expect(progressStore.isLessonComplete('P-00')).toBe(true)

    progressStore.toggleLessonCompletion('P-00')
    await nextTick()
    expect(progressStore.isLessonComplete('P-00')).toBe(false)
  })

  it('marks lesson as viewed when marking as complete', async () => {
    await prepareNavigationStore()
    const progressStore = useProgressStore()

    progressStore.markLessonComplete('P-01')
    await nextTick()

    const progress = progressStore.getLessonProgress('P-01')
    expect(progress.viewed).toBe(true)
    expect(progress.completed).toBe(true)
    expect(progress.viewedAt).toBeTruthy()
    expect(progress.completedAt).toBeTruthy()
  })

  it('allows marking incomplete without losing viewed status', async () => {
    await prepareNavigationStore()
    const progressStore = useProgressStore()

    progressStore.markLessonViewed('P-02')
    await nextTick()
    progressStore.markLessonComplete('P-02')
    await nextTick()

    const viewedAt = progressStore.getLessonProgress('P-02').viewedAt

    progressStore.markLessonIncomplete('P-02')
    await nextTick()

    const progress = progressStore.getLessonProgress('P-02')
    expect(progress.viewed).toBe(true)
    expect(progress.completed).toBe(false)
    expect(progress.viewedAt).toBe(viewedAt)
    expect(progress.completedAt).toBeNull()
  })

  it('tracks recent lessons in order', async () => {
    await prepareNavigationStore()
    const progressStore = useProgressStore()

    progressStore.markLessonViewed('P-00')
    progressStore.markLessonViewed('P-01')
    progressStore.markLessonViewed('P-02')
    await nextTick()

    expect(progressStore.recentLessonCodes).toEqual(['P-02', 'P-01', 'P-00'])
  })
})
