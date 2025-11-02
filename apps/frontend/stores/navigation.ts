import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCourseNavigation } from '~/composables/useNavigationData'
import { createEmptyNavigationMaps, transformNavigationData } from '~/utils/navigation'
import type {
  NavigationLesson,
  NavigationLookupMaps,
  NavigationPartType,
  NavigationTree,
  StrapiNavigationResponse,
} from '~/types/navigation'

export interface NavigationNeighbors {
  previous: NavigationLesson | null
  next: NavigationLesson | null
}

interface LoadStructureOptions {
  force?: boolean
  data?: StrapiNavigationResponse
}

function cloneLookupMaps(source: NavigationLookupMaps): NavigationLookupMaps {
  return {
    byCode: { ...source.byCode },
    byPart: {
      foundation: [...source.byPart.foundation],
      'core-blocks': [...source.byPart['core-blocks']],
      'extended-thinking': [...source.byPart['extended-thinking']],
      appendices: [...source.byPart.appendices],
    },
    byLoop: Object.fromEntries(
      Object.entries(source.byLoop).map(([loopId, lessons]) => [loopId, [...lessons]])
    ),
  }
}

export const useNavigationStore = defineStore('navigation', () => {
  const courseStructure = ref<NavigationTree | null>(null)
  const lookupMaps = ref<NavigationLookupMaps>(createEmptyNavigationMaps())
  const currentLesson = ref<NavigationLesson | null>(null)
  const activePart = ref<NavigationPartType | null>(null)
  const isLoading = ref(false)
  const lastLoadedAt = ref<Date | null>(null)

  const hasStructure = computed(() => courseStructure.value !== null)
  const lessonCount = computed(() => courseStructure.value?.lessons.length ?? 0)

  function normalizeLessonCode(code: string): string {
    return code.trim().toUpperCase()
  }

  function resolveLesson(code: string | null | undefined): NavigationLesson | undefined {
    if (!code) {
      return undefined
    }

    const map = lookupMaps.value.byCode
    const direct = map[code]
    if (direct) {
      return direct
    }

    const normalized = normalizeLessonCode(code)
    return map[normalized]
  }

  function getLessonByCode(code: string): NavigationLesson | undefined {
    return resolveLesson(code)
  }

  function getLessonsByPart(part: NavigationPartType): NavigationLesson[] {
    return lookupMaps.value.byPart[part] ?? []
  }

  function getLessonNeighbors(code: string): NavigationNeighbors {
    const lesson = resolveLesson(code)

    if (!lesson) {
      return { previous: null, next: null }
    }

    const previous = lesson.navigation.previousCode
      ? (resolveLesson(lesson.navigation.previousCode) ?? null)
      : null
    const next = lesson.navigation.nextCode
      ? (resolveLesson(lesson.navigation.nextCode) ?? null)
      : null

    return { previous, next }
  }

  async function loadStructure(options: LoadStructureOptions = {}): Promise<NavigationTree> {
    if (!options.force && courseStructure.value) {
      return courseStructure.value
    }

    isLoading.value = true
    try {
      const rawData = options.data ?? (await fetchCourseNavigation())
      const { tree, maps } = transformNavigationData(rawData)

      courseStructure.value = tree
      lookupMaps.value = cloneLookupMaps(maps)

      if (currentLesson.value) {
        const refreshed = resolveLesson(currentLesson.value.code) ?? null
        currentLesson.value = refreshed ?? null
        activePart.value = refreshed?.part ?? null
      }

      lastLoadedAt.value = new Date()

      return tree
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrentLesson(): void {
    currentLesson.value = null
    activePart.value = null
  }

  function setCurrentLesson(code: string | null | undefined): NavigationLesson | null {
    if (!code || !code.trim()) {
      clearCurrentLesson()
      return null
    }

    const lesson = resolveLesson(code)

    if (!lesson) {
      clearCurrentLesson()
      return null
    }

    currentLesson.value = lesson
    activePart.value = lesson.part

    return lesson
  }

  async function navigateToLesson(code: string): Promise<NavigationLesson | null> {
    if (!courseStructure.value) {
      await loadStructure()
    }

    return setCurrentLesson(code)
  }

  return {
    courseStructure,
    currentLesson,
    activePart,
    isLoading,
    lastLoadedAt,
    hasStructure,
    lessonCount,
    getLessonByCode,
    getLessonsByPart,
    getLessonNeighbors,
    loadStructure,
    clearCurrentLesson,
    setCurrentLesson,
    navigateToLesson,
  }
})
