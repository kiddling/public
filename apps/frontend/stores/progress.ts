import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useNavigationStore } from '~/stores/navigation'
import type { NavigationLesson, NavigationPartType } from '~/types/navigation'

export interface LessonProgressEntry {
  viewed: boolean
  viewedAt: string | null
  completed: boolean
  completedAt: string | null
}

export interface ProgressSummary {
  total: number
  completed: number
  percentage: number
}

export interface LoopProgress extends ProgressSummary {
  loopId: string
  loopTitle: string | null
  partType: NavigationPartType | null
  lessons: NavigationLesson[]
}

export interface PartProgress extends ProgressSummary {
  partType: NavigationPartType
  lessons: NavigationLesson[]
}

const LESSON_PROGRESS_KEY = 'course:progress:lessons'
const LAST_VISITED_KEY = 'course:progress:last-visited'
const RECENT_LESSONS_KEY = 'course:progress:recent-lessons'
const RECENT_LESSON_LIMIT = 8

function normalizeCode(raw: string | null | undefined): string | null {
  if (!raw) {
    return null
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  return trimmed.toUpperCase()
}

function createProgressEntry(base?: Partial<LessonProgressEntry> | null): LessonProgressEntry {
  return {
    viewed: base?.viewed ?? false,
    viewedAt: base?.viewedAt ?? null,
    completed: base?.completed ?? false,
    completedAt: base?.completedAt ?? null,
  }
}

function summariseProgress(total: number, completed: number): ProgressSummary {
  if (!Number.isFinite(total) || total <= 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
    }
  }

  const clampedCompleted = Math.max(0, Math.min(completed, total))
  return {
    total,
    completed: clampedCompleted,
    percentage: Math.round((clampedCompleted / total) * 100),
  }
}

export const useProgressStore = defineStore('progress', () => {
  const navigationStore = useNavigationStore()

  const lessonProgress = useStorage<Record<string, LessonProgressEntry>>(
    LESSON_PROGRESS_KEY,
    {},
    undefined,
    { mergeDefaults: true }
  )

  const lastVisitedLesson = useStorage<string | null>(LAST_VISITED_KEY, null)

  const recentLessonCodes = useStorage<string[]>(RECENT_LESSONS_KEY, [], undefined, {
    mergeDefaults: true,
  })

  const completedLessonCodes = computed(() =>
    Object.entries(lessonProgress.value)
      .filter(([, entry]) => entry?.completed)
      .map(([code]) => code)
  )

  const completedLessonSet = computed(() => new Set(completedLessonCodes.value))

  const completedCount = computed(() => completedLessonCodes.value.length)

  const totalLessons = computed(() => navigationStore.lessonCount ?? 0)

  const completionSummary = computed(() =>
    summariseProgress(totalLessons.value, completedCount.value)
  )

  const completionPercentage = computed(() => completionSummary.value.percentage)

  const recentLessons = computed<NavigationLesson[]>(() => {
    const lessons: NavigationLesson[] = []
    for (const code of recentLessonCodes.value) {
      const lesson = navigationStore.getLessonByCode(code)
      if (lesson) {
        lessons.push(lesson)
      }
    }
    return lessons
  })

  function removeLessonProgress(code: string): void {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return
    }

    if (lessonProgress.value[normalized] === undefined) {
      return
    }

    const { [normalized]: _removed, ...rest } = lessonProgress.value
    lessonProgress.value = rest
  }

  function getLessonProgress(code: string): LessonProgressEntry {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return createProgressEntry()
    }

    return createProgressEntry(lessonProgress.value[normalized])
  }

  function recordLessonVisit(code: string): void {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return
    }

    lastVisitedLesson.value = normalized

    const uniqueCodes = recentLessonCodes.value.filter((item) => item !== normalized)
    uniqueCodes.unshift(normalized)
    recentLessonCodes.value = uniqueCodes.slice(0, RECENT_LESSON_LIMIT)
  }

  function markLessonViewed(code: string): void {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return
    }

    const current = createProgressEntry(lessonProgress.value[normalized])
    if (!current.viewed) {
      current.viewed = true
      current.viewedAt = new Date().toISOString()
    }

    lessonProgress.value = {
      ...lessonProgress.value,
      [normalized]: current,
    }

    recordLessonVisit(normalized)
  }

  function markLessonComplete(code: string): void {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return
    }

    const timestamp = new Date().toISOString()
    const current = createProgressEntry(lessonProgress.value[normalized])
    current.viewed = true
    current.viewedAt = current.viewedAt ?? timestamp
    current.completed = true
    current.completedAt = timestamp

    lessonProgress.value = {
      ...lessonProgress.value,
      [normalized]: current,
    }

    recordLessonVisit(normalized)
  }

  function markLessonIncomplete(code: string): void {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return
    }

    const current = lessonProgress.value[normalized]
    if (!current) {
      return
    }

    const next = createProgressEntry(current)
    next.completed = false
    next.completedAt = null

    if (!next.viewed) {
      removeLessonProgress(normalized)
      return
    }

    lessonProgress.value = {
      ...lessonProgress.value,
      [normalized]: next,
    }
  }

  function toggleLessonCompletion(code: string): void {
    const entry = getLessonProgress(code)
    if (entry.completed) {
      markLessonIncomplete(code)
    } else {
      markLessonComplete(code)
    }
  }

  function isLessonComplete(code: string): boolean {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return false
    }
    return completedLessonSet.value.has(normalized)
  }

  function getProgressByLoop(loopId: string): LoopProgress {
    const lessons = (navigationStore.courseStructure?.lessons ?? []).filter(
      (lesson) => lesson.loopId === loopId
    )
    const completed = lessons.filter((lesson) => completedLessonSet.value.has(lesson.code)).length

    let loopTitle: string | null = null
    let partType: NavigationPartType | null = null

    for (const part of navigationStore.courseStructure?.parts ?? []) {
      const loop = part.loops.find((item) => item.id === loopId)
      if (loop) {
        loopTitle = loop.title ?? loop.code ?? null
        partType = part.type
        break
      }
    }

    return {
      ...summariseProgress(lessons.length, completed),
      loopId,
      loopTitle,
      partType,
      lessons,
    }
  }

  function getProgressByPart(partType: NavigationPartType): PartProgress {
    const lessons = navigationStore.getLessonsByPart(partType) ?? []
    const completed = lessons.filter((lesson) => completedLessonSet.value.has(lesson.code)).length

    return {
      ...summariseProgress(lessons.length, completed),
      partType,
      lessons,
    }
  }

  function resetProgress(): void {
    lessonProgress.value = {}
    lastVisitedLesson.value = null
    recentLessonCodes.value = []
  }

  return {
    lessonProgress,
    lastVisitedLesson,
    recentLessonCodes,
    recentLessons,
    completionSummary,
    completionPercentage,
    completedLessonCodes,
    completedCount,
    totalLessons,
    getLessonProgress,
    markLessonViewed,
    markLessonComplete,
    markLessonIncomplete,
    toggleLessonCompletion,
    isLessonComplete,
    getProgressByLoop,
    getProgressByPart,
    recordLessonVisit,
    resetProgress,
  }
})
