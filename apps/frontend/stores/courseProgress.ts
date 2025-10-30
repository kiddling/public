import { computed, reactive, watch } from 'vue'
import { defineStore } from 'pinia'

export interface LessonProgressRecord {
  code: string
  viewed: boolean
  completed: boolean
  updatedAt: string | null
}

interface PersistedState {
  records: Record<string, LessonProgressRecord>
  knownLessonCodes: string[]
}

const STORAGE_KEY = 'kdl.course-progress.v1'

const createEmptyRecord = (code: string): LessonProgressRecord => ({
  code,
  viewed: false,
  completed: false,
  updatedAt: null,
})

const normalizeCode = (code: string | null | undefined) =>
  code ? String(code).trim().toUpperCase() : ''

export const useCourseProgressStore = defineStore('courseProgress', () => {
  const state = reactive<PersistedState>({
    records: {},
    knownLessonCodes: [],
  })

  const completedCount = computed(() =>
    state.knownLessonCodes.reduce((count, code) => {
      const record = state.records[code]
      return record?.completed ? count + 1 : count
    }, 0)
  )

  const viewedCount = computed(() =>
    state.knownLessonCodes.reduce((count, code) => {
      const record = state.records[code]
      return record?.viewed ? count + 1 : count
    }, 0)
  )

  const totalLessons = computed(() => state.knownLessonCodes.length)

  const completionPercentage = computed(() => {
    if (totalLessons.value === 0) return 0
    return Math.round((completedCount.value / totalLessons.value) * 100)
  })

  const progressSummary = computed(() => ({
    completed: completedCount.value,
    viewed: viewedCount.value,
    total: totalLessons.value,
    percentage: completionPercentage.value,
  }))

  const getRecord = (code: string) => {
    const normalized = normalizeCode(code)
    if (!normalized) return null
    return state.records[normalized] ?? null
  }

  const upsertRecord = (code: string) => {
    const normalized = normalizeCode(code)
    if (!normalized) return null

    if (!state.records[normalized]) {
      state.records[normalized] = createEmptyRecord(normalized)
    }

    return state.records[normalized]
  }

  const registerLessons = (codes: string[]) => {
    const normalized = Array.from(
      new Set(codes.map((code) => normalizeCode(code)).filter(Boolean))
    )

    state.knownLessonCodes = normalized

    for (const code of normalized) {
      upsertRecord(code)
    }
  }

  const markViewed = (code: string) => {
    const record = upsertRecord(code)
    if (!record || record.viewed) return record

    record.viewed = true
    record.updatedAt = new Date().toISOString()
    return record
  }

  const setCompletion = (code: string, completed: boolean) => {
    const record = upsertRecord(code)
    if (!record) return null

    record.completed = completed
    record.updatedAt = new Date().toISOString()
    if (completed) {
      record.viewed = true
    }

    return record
  }

  const toggleCompletion = (code: string) => {
    const record = upsertRecord(code)
    if (!record) return null
    return setCompletion(code, !record.completed)
  }

  const resetProgress = () => {
    for (const code of Object.keys(state.records)) {
      state.records[code] = createEmptyRecord(code)
    }
  }

  const hydrateFromStorage = () => {
    if (!process.client) return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as Partial<PersistedState> | null
      if (!parsed) return

      if (Array.isArray(parsed.knownLessonCodes)) {
        state.knownLessonCodes = parsed.knownLessonCodes
      }

      if (parsed.records && typeof parsed.records === 'object') {
        for (const [code, value] of Object.entries(parsed.records)) {
          if (!code) continue
          const normalized = normalizeCode(code)
          if (!normalized) continue

          const record = createEmptyRecord(normalized)
          record.completed = Boolean(value?.completed)
          record.viewed = Boolean(value?.viewed)
          record.updatedAt = value?.updatedAt ?? null
          state.records[normalized] = record
        }
      }
    } catch (error) {
      console.error('[courseProgress] Failed to read progress from storage', error)
    }
  }

  const persistToStorage = () => {
    if (!process.client) return

    try {
      const payload: PersistedState = {
        records: state.records,
        knownLessonCodes: state.knownLessonCodes,
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.error('[courseProgress] Failed to persist progress to storage', error)
    }
  }

  if (process.client) {
    hydrateFromStorage()

    watch(
      () => ({ records: state.records, knownLessonCodes: state.knownLessonCodes }),
      persistToStorage,
      { deep: true }
    )
  }

  return {
    progressSummary,
    completedCount,
    viewedCount,
    totalLessons,
    completionPercentage,
    getRecord,
    registerLessons,
    markViewed,
    setCompletion,
    toggleCompletion,
    resetProgress,
  }
})
