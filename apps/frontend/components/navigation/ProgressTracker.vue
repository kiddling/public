<template>
  <section
    v-if="hasLessons"
    :class="containerClass"
    class="progress-tracker"
    aria-label="Course progress tracker"
  >
    <header class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Progress
        </p>
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50">
          Course Progress
        </h2>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ summaryText }}
        </p>
      </div>
      <span
        class="inline-flex h-9 items-center justify-center rounded-full bg-primary-500/10 px-3 text-sm font-semibold text-primary-600 dark:bg-primary-500/20 dark:text-primary-200"
      >
        {{ completionPercentage }}%
      </span>
    </header>

    <div class="mt-4">
      <div class="h-2 w-full rounded-full bg-gray-200/70 dark:bg-gray-800">
        <div
          class="h-2 rounded-full bg-primary-500 transition-[width] duration-500 ease-out dark:bg-primary-400"
          :style="{ width: `${completionPercentage}%` }"
        ></div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
        <span
          v-for="part in partProgressSummaries"
          :key="part.partType"
          class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-200 dark:text-gray-300 dark:ring-gray-700"
        >
          <span
            class="h-2 w-2 rounded-full"
            :style="{ backgroundColor: part.color }"
          ></span>
          {{ part.label }} {{ part.percentage }}%
        </span>
      </div>
    </div>

    <div v-if="showSpiral" class="mt-6">
      <LoopSpiralVisualization
        :lessons="spiralLessons"
        :completed-codes="completedLessonCodes"
        :current-code="currentLessonCodeNormalized"
        :compact="variant === 'compact'"
        @select="handleLessonSelect"
      />
    </div>

    <div
      class="mt-6 grid gap-5"
      :class="variant === 'compact' ? 'md:grid-cols-1' : 'md:grid-cols-2'"
    >
      <section>
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Completed
          </h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ completedLessons.length }}
          </span>
        </div>
        <ul class="mt-3 space-y-2">
          <li
            v-if="!completedLessonsLimited.length"
            class="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
          >
            No lessons completed yet.
          </li>
          <li
            v-for="lesson in completedLessonsLimited"
            :key="`completed-${lesson.code}`"
            :data-current="lesson.code === currentLessonCodeNormalized ? 'true' : undefined"
            class="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-gray-800 dark:bg-gray-900/70 dark:focus-within:ring-offset-gray-900"
          >
            <button
              type="button"
              class="flex flex-1 flex-col truncate text-left"
              @click="handleLessonSelect(lesson.code)"
            >
              <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 group-data-[current=true]:text-primary-600 dark:text-gray-400 dark:group-data-[current=true]:text-primary-300">
                {{ lesson.code }}
              </span>
              <span class="truncate text-sm font-medium text-gray-900 group-data-[current=true]:text-primary-600 dark:text-gray-100 dark:group-data-[current=true]:text-primary-300">
                {{ lesson.title }}
              </span>
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-300 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-400 dark:hover:text-red-300 dark:focus-visible:ring-offset-gray-900"
              :aria-label="`Mark ${lesson.code} as incomplete`"
              @click.stop="toggleLessonCompletion(lesson.code)"
            >
              <Icon name="i-heroicons-x-mark-16-solid" class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </section>

      <section>
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Remaining
          </h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ remainingLessons.length }}
          </span>
        </div>
        <ul class="mt-3 space-y-2">
          <li
            v-if="!remainingLessonsLimited.length"
            class="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
          >
            All lessons completed. 🎉
          </li>
          <li
            v-for="lesson in remainingLessonsLimited"
            :key="`remaining-${lesson.code}`"
            :data-current="lesson.code === currentLessonCodeNormalized ? 'true' : undefined"
            class="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-primary-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-primary-400/60 dark:focus-within:ring-offset-gray-900"
          >
            <button
              type="button"
              class="flex flex-1 flex-col truncate text-left"
              @click="handleLessonSelect(lesson.code)"
            >
              <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 group-data-[current=true]:text-primary-600 dark:text-gray-400 dark:group-data-[current=true]:text-primary-300">
                {{ lesson.code }}
              </span>
              <span class="truncate text-sm font-medium text-gray-900 group-data-[current=true]:text-primary-600 dark:text-gray-100 dark:group-data-[current=true]:text-primary-300">
                {{ lesson.title }}
              </span>
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-300 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-400 dark:hover:text-emerald-300 dark:focus-visible:ring-offset-gray-900"
              :aria-label="`Mark ${lesson.code} as complete`"
              @click.stop="toggleLessonCompletion(lesson.code)"
            >
              <Icon name="i-heroicons-check-16-solid" class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </section>
    </div>

    <div v-if="recentLessons.length" class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Recent Lessons
      </h3>
      <ul class="mt-3 space-y-2 text-sm">
        <li
          v-for="lesson in recentLessons"
          :key="`recent-${lesson.code}`"
          class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/70 px-3 py-2 transition hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-primary-400/60"
        >
          <button
            type="button"
            class="flex flex-1 flex-col truncate text-left"
            @click="handleLessonSelect(lesson.code)"
          >
            <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {{ lesson.code }}
            </span>
            <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ lesson.title }}
            </span>
          </button>
          <span
            class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {{ lesson.partTitle }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoopSpiralVisualization from './LoopSpiralVisualization.vue'
import { useNavigationStore } from '~/stores/navigation'
import { useProgressStore } from '~/stores/progress'
import { NAVIGATION_PART_COLORS, NAVIGATION_PART_LABELS, NAVIGATION_PART_TYPES, type NavigationLesson, type NavigationPartType } from '~/types/navigation'

const props = defineProps<{
  currentLessonCode?: string | null
  variant?: 'default' | 'compact'
}>

const emit = defineEmits<{
  (e: 'navigate', code: string): void
}>()

const navigationStore = useNavigationStore()
const progressStore = useProgressStore()
const router = useRouter()

const variant = computed(() => props.variant ?? 'default')

const lessons = computed(() => navigationStore.courseStructure?.lessons ?? [])
const hasLessons = computed(() => lessons.value.length > 0)

const completedLessonCodes = computed(() => progressStore.completedLessonCodes)
const completionPercentage = computed(() => progressStore.completionPercentage)
const completedLessons = computed(() =>
  lessons.value.filter((lesson) => progressStore.isLessonComplete(lesson.code)),
)
const remainingLessons = computed(() =>
  lessons.value.filter((lesson) => !progressStore.isLessonComplete(lesson.code)),
)

const completedLimit = computed(() => (variant.value === 'compact' ? 3 : 6))
const remainingLimit = computed(() => (variant.value === 'compact' ? 4 : 6))

const completedLessonsLimited = computed(() => completedLessons.value.slice(0, completedLimit.value))
const remainingLessonsLimited = computed(() => remainingLessons.value.slice(0, remainingLimit.value))

const recentLessons = computed(() => progressStore.recentLessons.slice(0, 5))

const totalSummary = computed(() => progressStore.completionSummary)

const summaryText = computed(() => {
  const total = totalSummary.value.total
  const completed = totalSummary.value.completed
  if (total === 0) {
    return 'Waiting for lessons to be added.'
  }

  return `${completed}/${total} lessons completed`
})

const partProgressSummaries = computed(() => {
  const summaries: Array<{
    partType: NavigationPartType
    label: string
    percentage: number
    color: string
  }> = []

  for (const partType of NAVIGATION_PART_TYPES) {
    const progress = progressStore.getProgressByPart(partType)
    if (progress.total === 0) {
      continue
    }
    summaries.push({
      partType,
      label: NAVIGATION_PART_LABELS[partType] ?? partType,
      percentage: progress.percentage,
      color: NAVIGATION_PART_COLORS[partType] ?? '#0ea5e9',
    })
  }

  return summaries
})

const containerClass = computed(() =>
  variant.value === 'compact'
    ? 'rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80'
    : 'rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/80',
)

const currentLessonCodeNormalized = computed(() => {
  if (props.currentLessonCode && props.currentLessonCode.trim().length > 0) {
    return props.currentLessonCode.trim().toUpperCase()
  }
  return navigationStore.currentLesson?.code ?? null
})

const showSpiral = computed(() => lessons.value.length > 0)

const spiralLessons = computed<NavigationLesson[]>(() => lessons.value.slice(0, 12))

function navigateToLesson(code: string) {
  const normalized = code.trim().toUpperCase()
  emit('navigate', normalized)
  progressStore.recordLessonVisit(normalized)
  router
    .push({
      name: 'lessons-code',
      params: { code: normalized },
    })
    .catch(() => {
      /* navigation failure can be ignored */
    })
}

function toggleLessonCompletion(code: string) {
  progressStore.toggleLessonCompletion(code)
}

function handleLessonSelect(code: string) {
  navigateToLesson(code)
}
</script>

<style scoped>
.progress-tracker :deep(.spiral-node[data-state='current']) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.9;
  }
}
</style>
