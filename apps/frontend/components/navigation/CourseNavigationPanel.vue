<template>
  <div class="flex h-full flex-col">
    <div class="space-y-3 border-b border-gray-200 p-4 dark:border-gray-800">
      <label class="sr-only" for="course-nav-search">Search lessons</label>
      <div class="relative">
        <Icon name="i-heroicons-magnifying-glass" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          id="course-nav-search"
          ref="searchInputRef"
          v-model="searchTerm"
          type="search"
          placeholder="Search by code or title"
          class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          @keydown.down.prevent="focusFirstLesson"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="absolute right-2 top-2 rounded-md bg-gray-100 p-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="clearSearch"
        >
          Clear
        </button>
      </div>
      <CourseProgressSummary
        :completed="progressSummary.completed"
        :total="progressSummary.total"
        :viewed="progressSummary.viewed"
        :percentage="progressSummary.percentage"
        size="sm"
      />
      <p class="sr-only" aria-live="polite">
        {{ assistiveSearchMessage }}
      </p>
    </div>

    <div
      v-if="navigationStore.state.loading"
      class="flex flex-1 items-center justify-center p-6"
      role="status"
      aria-live="polite"
    >
      <span class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <Icon name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
        Loading course outline…
      </span>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-2 py-3" role="navigation" aria-label="Course outline">
      <template v-if="filteredParts.length">
        <ul role="tree" class="space-y-2">
          <li v-for="part in filteredParts" :key="part.code" role="treeitem" :aria-expanded="isPartOpen(part.code)">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 dark:text-gray-100 dark:hover:bg-gray-800"
              :class="partButtonClasses(part)"
              @click="navigationStore.togglePart(part.code)"
            >
              <span class="flex items-center gap-3">
                <span :class="['h-2.5 w-2.5 rounded-full', partTheme(part).indicator]" aria-hidden="true"></span>
                <span class="flex flex-col">
                  <span>{{ part.title }}</span>
                  <span class="text-xs font-normal text-gray-500 dark:text-gray-400">{{ part.code }}</span>
                </span>
              </span>
              <Icon
                :name="isPartOpen(part.code) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                class="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </button>
            <Transition name="course-nav-collapse" appear>
              <ul
                v-show="isPartOpen(part.code)"
                class="mt-2 space-y-1 border-l border-dashed border-gray-200 pl-4 dark:border-gray-700"
                role="group"
              >
                <li
                  v-for="lesson in part.lessons"
                  :key="lesson.code"
                  class="group"
                  role="treeitem"
                  :aria-current="lesson.code === activeLessonCode ? 'page' : undefined"
                  :aria-expanded="lesson.sections.length ? isLessonExpanded(lesson.code) : undefined"
                >
                  <button
                    :ref="(el) => registerLessonRef(lesson.code, el as Element | null)"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2"
                    :class="lessonClasses(lesson)"
                    @click="() => goToLesson(lesson)"
                    @keydown="(event) => handleLessonKeydown(event, lesson)"
                  >
                    <span class="flex flex-1 items-center gap-2">
                      <span class="font-semibold text-gray-500 dark:text-gray-400">{{ lesson.code }}</span>
                      <span class="truncate text-gray-800 dark:text-gray-100">{{ lesson.title }}</span>
                    </span>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="lesson.sections.length"
                        class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {{ lesson.sections.length }} sections
                      </span>
                      <Icon
                        v-if="progressStore.getRecord(lesson.code)?.completed"
                        name="i-heroicons-check-circle"
                        class="h-4 w-4 text-emerald-500"
                        aria-hidden="true"
                      />
                      <button
                        v-if="lesson.sections.length"
                        type="button"
                        class="rounded-full p-1 text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        aria-label="Toggle sections"
                        @click.stop="toggleLessonExpanded(lesson.code)"
                      >
                        <Icon
                          :name="isLessonExpanded(lesson.code) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                          class="h-4 w-4"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </button>

                  <Transition name="course-nav-collapse">
                    <ul
                      v-if="lesson.sections.length && isLessonExpanded(lesson.code)"
                      class="mt-1 space-y-1 border-l border-dashed border-gray-200 pl-4 dark:border-gray-700"
                      role="group"
                    >
                      <li
                        v-for="section in lesson.sections"
                        :key="section.id"
                        role="treeitem"
                        :aria-current="isSectionActive(lesson.code, section.slug) ? 'true' : undefined"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 dark:text-gray-300 dark:hover:bg-gray-800"
                          @click="() => goToLesson(lesson, section)"
                          @keydown="(event) => handleSectionKeydown(event, lesson, section)"
                        >
                          <span class="flex items-center gap-2">
                            <span class="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-500"></span>
                            <span class="truncate">{{ section.title }}</span>
                          </span>
                          <Icon
                            v-if="isSectionActive(lesson.code, section.slug)"
                            name="i-heroicons-arrow-top-right-on-square"
                            class="h-3 w-3 text-primary-500"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    </ul>
                  </Transition>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
      </template>

      <div v-else class="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <Icon name="i-heroicons-no-symbol" class="h-6 w-6" aria-hidden="true" />
        <p>No lessons match “{{ searchTerm }}”.</p>
        <button
          type="button"
          class="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
          @click="clearSearch"
        >
          Clear search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useCourseNavigationStore, PART_CATEGORY_THEME } from '~/stores/courseNavigation'
import { useCourseProgressStore } from '~/stores/courseProgress'
import type { CourseNavigationLesson, CourseNavigationPart, CourseNavigationSection } from '~/types/navigation'

const navigationStore = useCourseNavigationStore()
const progressStore = useCourseProgressStore()
const router = useRouter()

const emit = defineEmits<{ (event: 'navigate', payload: { code: string; section?: string | null }): void }>()

const searchInputRef = ref<HTMLInputElement | null>(null)
const searchTerm = computed({
  get: () => navigationStore.state.searchTerm,
  set: (value: string) => navigationStore.setSearchTerm(value),
})

const filteredParts = computed(() => navigationStore.filteredParts.value)
const activeLessonCode = computed(() => navigationStore.state.activeLessonCode)
const activeSection = computed(() => navigationStore.state.activeSection)

const progressSummary = computed(() => progressStore.progressSummary.value)

const assistiveSearchMessage = computed(() => {
  const total = filteredParts.value.reduce((count, part) => count + part.lessons.length, 0)
  if (!searchTerm.value) {
    return `Full course outline loaded with ${total} lessons.`
  }
  return `${total} lessons match your search for “${searchTerm.value}”.`
})

const lessonRefs = reactive<Record<string, HTMLElement | null>>({})
const expandedLessons = ref(new Set<string>())

const visibleLessonCodes = computed(() =>
  filteredParts.value.flatMap((part) => part.lessons.map((lesson) => lesson.code))
)

const registerLessonRef = (code: string, element: Element | null) => {
  const el = (element as HTMLElement | null) ?? null
  if (!el) {
    delete lessonRefs[code]
  } else {
    lessonRefs[code] = el
  }
}

const focusLesson = async (code: string) => {
  await nextTick()
  const el = lessonRefs[code]
  el?.focus()
}

const handleLessonKeydown = (event: KeyboardEvent, lesson: CourseNavigationLesson) => {
  const { key } = event
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
    if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      void goToLesson(lesson)
    }
    return
  }

  event.preventDefault()
  const codes = visibleLessonCodes.value
  const currentIndex = codes.indexOf(lesson.code)
  if (currentIndex === -1) return

  let nextIndex = currentIndex
  if (key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % codes.length
  } else if (key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + codes.length) % codes.length
  } else if (key === 'Home') {
    nextIndex = 0
  } else if (key === 'End') {
    nextIndex = codes.length - 1
  }

  focusLesson(codes[nextIndex])
}

const handleSectionKeydown = (
  event: KeyboardEvent,
  lesson: CourseNavigationLesson,
  section: CourseNavigationSection
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    void goToLesson(lesson, section)
  }
}

const goToLesson = async (lesson: CourseNavigationLesson, section?: CourseNavigationSection) => {
  const hash = section ? `#${section.slug}` : undefined
  emit('navigate', { code: lesson.code, section: section?.slug ?? null })
  await router.push({ path: `/lessons/${lesson.code}`, hash }).catch(() => {})
}

const partTheme = (part: CourseNavigationPart) => PART_CATEGORY_THEME[part.category]

const partButtonClasses = (part: CourseNavigationPart) => {
  const theme = partTheme(part)
  return [
    theme.text,
    navigationStore.state.expandedPartCodes.has(part.code)
      ? 'bg-gray-100/70 dark:bg-gray-800/70'
      : 'bg-transparent',
  ]
}

const lessonClasses = (lesson: CourseNavigationLesson) => {
  const isActive = lesson.code === activeLessonCode.value
  const record = progressStore.getRecord(lesson.code)
  const base = isActive
    ? 'bg-primary-50/80 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'
    : 'bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
  const ring = PART_CATEGORY_THEME[lesson.partCategory]?.ring ?? 'focus-visible:ring-primary-500'
  const completed = record?.completed
    ? 'border border-emerald-200 dark:border-emerald-400/40'
    : 'border border-transparent'

  return [base, ring, completed].join(' ')
}

const isPartOpen = (code: string) => navigationStore.state.expandedPartCodes.has(code)

const toggleLessonExpanded = (code: string) => {
  const next = new Set(expandedLessons.value)
  if (next.has(code)) {
    next.delete(code)
  } else {
    next.add(code)
  }
  expandedLessons.value = next
}

const isLessonExpanded = (code: string) => {
  if (expandedLessons.value.has(code)) return true
  return code === activeLessonCode.value
}

const isSectionActive = (lessonCode: string, slug: string) => {
  return (
    activeLessonCode.value === lessonCode &&
    (!!activeSection.value && activeSection.value.slug === slug)
  )
}

const clearSearch = () => {
  navigationStore.clearSearch()
  void focusFirstLesson()
}

const focusFirstLesson = async () => {
  if (!visibleLessonCodes.value.length) return
  await focusLesson(visibleLessonCodes.value[0])
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === '/' && document.activeElement !== searchInputRef.value) {
    event.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

watch(
  () => navigationStore.state.activeLessonCode,
  (code) => {
    if (!code) return
    const next = new Set(expandedLessons.value)
    next.add(code)
    expandedLessons.value = next
  },
  { immediate: true }
)
</script>

<style scoped>
.course-nav-collapse-enter-active,
.course-nav-collapse-leave-active {
  transition: all 0.2s ease;
}

.course-nav-collapse-enter-from,
.course-nav-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.course-nav-collapse-enter-to,
.course-nav-collapse-leave-from {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
}
</style>
