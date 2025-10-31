<template>
  <div class="relative">
    <button
      type="button"
      class="hidden items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-primary-300 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-gray-900 sm:inline-flex"
      @click="openPalette"
    >
      <Icon name="i-heroicons-magnifying-glass-20-solid" class="h-4 w-4 text-gray-400" aria-hidden="true" />
      <span class="hidden lg:inline">Quick jump</span>
      <span class="lg:hidden">Search</span>
      <span class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <kbd class="font-semibold">{{ commandKey }}</kbd>
        <span class="font-semibold">K</span>
      </span>
    </button>

    <Teleport to="body">
      <Transition name="quick-search">
        <div v-if="open" class="quick-search-container" role="dialog" aria-modal="true">
          <div class="quick-search-overlay" @click="closePalette"></div>
          <section class="quick-search-panel" ref="panelRef" tabindex="-1">
            <header class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Quick Navigation
                </p>
                <h2 class="text-sm font-medium text-gray-900 dark:text-gray-100">Search lessons</h2>
              </div>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
                aria-label="Close quick search"
                @click="closePalette"
              >
                <Icon name="i-heroicons-x-mark-16-solid" class="h-4 w-4" />
              </button>
            </header>

            <div class="px-4 py-3">
              <div class="relative">
                <Icon name="i-heroicons-magnifying-glass-20-solid" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  ref="inputRef"
                  v-model="query"
                  type="search"
                  class="w-full rounded-xl border border-gray-200 bg-white/90 py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-primary-400 dark:focus:ring-primary-500/30"
                  placeholder="Search by lesson code or title"
                  role="combobox"
                  :aria-expanded="String(open)"
                  :aria-activedescendant="activeOptionId"
                  @keydown.down.prevent="moveSelection(1)"
                  @keydown.up.prevent="moveSelection(-1)"
                  @keydown.enter.prevent="selectActiveResult"
                  @keydown.escape.prevent="closePalette"
                />
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Use ↑ ↓ to navigate, Enter to open. {{ completedLessonCount }} of {{ totalLessons }} lessons completed.
              </p>
            </div>

            <div class="border-t border-gray-200 px-2 pb-4 pt-2 dark:border-gray-800">
              <template v-if="hasQuery && filteredResults.length">
                <h3 class="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Results
                </h3>
              </template>

              <template v-else-if="!hasQuery">
                <h3 class="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Recent lessons
                </h3>
              </template>

              <ul
                v-if="listItems.length"
                role="listbox"
                class="max-h-80 space-y-1 overflow-y-auto px-1"
              >
                <li
                  v-for="(item, index) in listItems"
                  :id="`quick-search-option-${index}`"
                  :key="item.lesson.code"
                  role="option"
                  :aria-selected="String(activeIndex === index)"
                  :data-active="activeIndex === index ? 'true' : undefined"
                  class="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-primary-50 focus-within:bg-primary-50 dark:hover:bg-primary-500/10 dark:focus-within:bg-primary-500/10"
                  @mouseenter="setActiveIndex(index)"
                >
                  <button
                    type="button"
                    class="flex flex-1 items-center gap-3 text-left"
                    @click="() => selectResult(index)"
                  >
                    <span
                      class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-600 transition group-data-[active=true]:border-primary-400 group-data-[active=true]:text-primary-600 dark:border-gray-700 dark:text-gray-300 dark:group-data-[active=true]:border-primary-400 dark:group-data-[active=true]:text-primary-200"
                    >
                      {{ item.lesson.code }}
                    </span>
                    <span class="flex min-w-0 flex-1 flex-col">
                      <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        <HighlightedText :segments="item.titleSegments" />
                      </span>
                      <span class="truncate text-xs text-gray-500 dark:text-gray-400">
                        <HighlightedText :segments="item.codeSegments" />
                      </span>
                    </span>
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                      :style="{ backgroundColor: item.partBadge.background, color: item.partBadge.foreground }"
                    >
                      {{ item.partBadge.label }}
                    </span>
                    <Icon
                      v-if="item.completed"
                      name="i-heroicons-check-circle-16-solid"
                      class="h-5 w-5 text-emerald-500"
                    />
                  </button>
                </li>
              </ul>

              <p
                v-else
                class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No lessons found.
              </p>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import HighlightedText from './internal/HighlightedText.vue'
import { useNavigationStore } from '~/stores/navigation'
import { useProgressStore } from '~/stores/progress'
import { NAVIGATION_PART_COLORS, NAVIGATION_PART_LABELS, type NavigationLesson } from '~/types/navigation'

const emit = defineEmits<{
  (e: 'navigate', code: string): void
}>()

const navigationStore = useNavigationStore()
const progressStore = useProgressStore()
const router = useRouter()
const route = useRoute()

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const isMac = ref(false)

const lessons = computed(() => navigationStore.courseStructure?.lessons ?? [])

const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const hasQuery = computed(() => normalizedQuery.value.length > 0)

const completedLessonCount = computed(() => progressStore.completedCount)
const totalLessons = computed(() => progressStore.totalLessons)

const recentLessons = computed(() => progressStore.recentLessons)

const scoreResults = computed(() => {
  if (!normalizedQuery.value.length) {
    return []
  }

  const queryValue = normalizedQuery.value

  return lessons.value
    .map((lesson) => ({
      lesson,
      score: scoreLesson(lesson, queryValue),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
})

const filteredResults = computed(() => scoreResults.value.slice(0, 12))

const listItems = computed(() => {
  if (hasQuery.value) {
    return filteredResults.value.map((entry) => createListItem(entry.lesson))
  }

  const recents = recentLessons.value
  if (recents.length) {
    return recents.map((lesson) => createListItem(lesson))
  }

  return lessons.value.slice(0, 10).map((lesson) => createListItem(lesson))
})

const activeOptionId = computed(() => `quick-search-option-${activeIndex.value}`)

const commandKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

watch(
  () => route.fullPath,
  () => {
    closePalette()
  },
)

watch(open, (value) => {
  if (value) {
    activeIndex.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  } else {
    query.value = ''
  }
})

watch(
  () => listItems.value.length,
  () => {
    if (activeIndex.value >= listItems.value.length) {
      activeIndex.value = Math.max(0, listItems.value.length - 1)
    }
  },
)

onMounted(() => {
  if (import.meta.client) {
    const platform = navigator.platform || navigator.userAgent
    isMac.value = /mac|iphone|ipad|ipod/i.test(platform)
  }
})

function openPalette() {
  open.value = true
}

function closePalette() {
  open.value = false
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightSegments(text: string, queryValue: string) {
  if (!queryValue) {
    return [{ text, matched: false }]
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(queryValue)})`, 'gi'))
  return parts
    .filter((segment) => segment.length)
    .map((segment) => ({
      text: segment,
      matched: segment.toLowerCase() === queryValue.toLowerCase(),
    }))
}

function computeSequentialScore(text: string, queryValue: string): number {
  let score = 0
  let lastIndex = -1
  for (const char of queryValue) {
    const nextIndex = text.indexOf(char, lastIndex + 1)
    if (nextIndex === -1) {
      return score
    }
    score += 4 - Math.min(nextIndex - lastIndex, 3)
    lastIndex = nextIndex
  }
  return score
}

function scoreLesson(lesson: NavigationLesson, queryValue: string): number {
  const lowerQuery = queryValue.toLowerCase()
  const code = lesson.code.toLowerCase()
  const title = lesson.title.toLowerCase()
  const part = lesson.partTitle?.toLowerCase() ?? ''

  if (code === lowerQuery) {
    return 120
  }

  let score = 0

  if (code.startsWith(lowerQuery)) {
    score = Math.max(score, 100)
  }
  if (title.startsWith(lowerQuery)) {
    score = Math.max(score, 90)
  }
  if (code.includes(lowerQuery)) {
    score = Math.max(score, 80)
  }
  if (title.includes(lowerQuery)) {
    score = Math.max(score, 70)
  }
  if (part.includes(lowerQuery)) {
    score = Math.max(score, 40)
  }

  if (score === 0) {
    score = Math.max(
      computeSequentialScore(code, lowerQuery) * 4,
      computeSequentialScore(title, lowerQuery) * 3,
    )
  }

  return score
}

function createListItem(lesson: NavigationLesson) {
  const queryValue = normalizedQuery.value
  const completed = progressStore.isLessonComplete(lesson.code)
  const partLabel = NAVIGATION_PART_LABELS[lesson.part] ?? lesson.part
  const baseColor = NAVIGATION_PART_COLORS[lesson.part] ?? '#0ea5e9'

  const titleSegments = highlightSegments(lesson.title, queryValue)
  const codeSegments = highlightSegments(lesson.code, queryValue)

  const badgeColor = hexToRgba(baseColor, 0.12)
  const badgeText = hexToRgba(baseColor, 0.9, true)

  return {
    lesson,
    completed,
    titleSegments,
    codeSegments,
    partBadge: {
      label: partLabel,
      background: badgeColor,
      foreground: badgeText,
    },
  }
}

function hexToRgba(hex: string, alpha: number, preferOpaque = false): string {
  const sanitized = hex.trim().replace(/^#/, '')
  const full = sanitized.length === 3
    ? sanitized
        .split('')
        .map((char) => char + char)
        .join('')
    : sanitized.padEnd(6, '0')
  const value = Number.parseInt(full.slice(0, 6), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255

  if (preferOpaque) {
    return `rgba(${r}, ${g}, ${b}, ${Math.min(alpha + 0.35, 1).toFixed(2)})`
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function moveSelection(direction: 1 | -1) {
  if (!listItems.value.length) {
    return
  }
  const nextIndex = (activeIndex.value + direction + listItems.value.length) % listItems.value.length
  activeIndex.value = nextIndex

  nextTick(() => {
    const activeElement = panelRef.value?.querySelector<HTMLElement>(`#${activeOptionId.value}`)
    activeElement?.scrollIntoView({ block: 'nearest' })
  })
}

function setActiveIndex(index: number) {
  activeIndex.value = index
}

function selectActiveResult() {
  if (!listItems.value.length) {
    return
  }
  selectResult(activeIndex.value)
}

function selectResult(index: number) {
  const item = listItems.value[index]
  if (!item) {
    return
  }
  navigateToLesson(item.lesson)
}

function navigateToLesson(lesson: NavigationLesson) {
  emit('navigate', lesson.code)
  progressStore.recordLessonVisit(lesson.code)
  closePalette()
  router
    .push({ name: 'lessons-code', params: { code: lesson.code } })
    .catch(() => {
      /* navigation failure ignored */
    })
}

useEventListener(
  () => (import.meta.client ? window : undefined),
  'keydown',
  (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      openPalette()
    } else if (event.key === 'Escape' && open.value) {
      event.preventDefault()
      closePalette()
    }
  },
)

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  document.addEventListener('focus', handleFocus, true)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }
  document.removeEventListener('focus', handleFocus, true)
})

function handleFocus(event: FocusEvent) {
  if (!open.value) {
    return
  }

  const panel = panelRef.value
  if (!panel) {
    return
  }

  if (panel.contains(event.target as Node)) {
    return
  }

  event.preventDefault()
  panel.focus()
}
</script>

<style scoped>
.quick-search-container {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4rem 1rem 2rem;
}

.quick-search-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
}

.quick-search-panel {
  position: relative;
  z-index: 71;
  width: min(42rem, 100%);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 50px 100px -20px rgba(15, 23, 42, 0.35),
    0 30px 60px -30px rgba(15, 23, 42, 0.25);
  color: #111827;
  overflow: hidden;
}

:global(.dark) .quick-search-panel {
  background: rgba(17, 24, 39, 0.92);
  color: #f3f4f6;
  box-shadow:
    0 40px 80px -20px rgba(2, 6, 23, 0.7),
    0 25px 50px -30px rgba(15, 23, 42, 0.6);
}

.quick-search-enter-active,
.quick-search-leave-active {
  transition: opacity 0.2s ease;
}

.quick-search-enter-from,
.quick-search-leave-to {
  opacity: 0;
}

.quick-search-enter-active .quick-search-panel,
.quick-search-leave-active .quick-search-panel {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.quick-search-enter-from .quick-search-panel,
.quick-search-leave-to .quick-search-panel {
  transform: translateY(-10px);
  opacity: 0.9;
}

[data-active='true'] {
  background: rgba(14, 165, 233, 0.08);
}

:global(.dark) [data-active='true'] {
  background: rgba(56, 189, 248, 0.12);
}
</style>
