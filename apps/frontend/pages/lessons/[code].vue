<template>
  <div
    class="lesson-page min-h-screen bg-gray-50 pb-16 pt-8 dark:bg-gray-950"
    :data-print-mode="printMode"
    :data-visible-level="difficulty"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div v-if="pending" class="space-y-6">
        <div
          class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800"
        >
          <div class="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-10 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div
            class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800"
          >
            <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-52 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
            <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div
            class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800"
          >
            <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-40 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error || !lesson"
        class="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
      >
        <p class="text-lg font-medium">
          {{ error ? 'We could not load this lesson right now.' : 'Lesson not found.' }}
        </p>
        <p v-if="error && error.message" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ error.message }}
        </p>
        <div class="no-print mt-6 flex justify-center gap-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back to home
          </NuxtLink>
          <button
            type="button"
            class="bg-primary-500 hover:bg-primary-600 inline-flex items-center rounded-lg px-5 py-2 text-sm font-medium text-white transition"
            @click="refresh"
          >
            Try again
          </button>
        </div>
      </div>

      <div v-else class="space-y-10">
        <LessonHeader
          v-model="difficulty"
          :lesson="lesson"
          :loop="loop"
          :progress="progress"
          @toggle-completion="toggleCompletion"
          @print="handlePrint"
        />

        <main class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article
            class="space-y-10 rounded-2xl bg-white/95 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <section v-if="lesson.body" class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">概述 Overview</h2>
              <div
                class="prose dark:prose-invert max-w-none text-gray-700"
                v-html="lesson.body"
              ></div>
            </section>

            <LessonDifficultySection
              v-for="(block, index) in visibleDifficultyBlocks"
              :key="`${block.level}-${index}`"
              :block="block"
            />
          </article>

          <LessonSidebar
            :lesson-code="lesson.code"
            :knowledge-cards="knowledgeCards"
            :resources="resources"
          />
        </main>

        <!-- Auto-complete sentinel -->
        <div ref="autoCompleteSentinel" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocalStorage, useIntersectionObserver } from '@vueuse/core'
import { useLesson } from '~/composables/useLessons'
import LessonHeader from '~/components/lesson/Header.vue'
import LessonDifficultySection from '~/components/lesson/DifficultySection.vue'
import LessonSidebar from '~/components/lesson/Sidebar.vue'
import type { DifficultyLevel, LessonDifficultyBlock } from '~/types/lesson'
import { useProgressStore } from '~/stores/progress'

definePageMeta({
  breadcrumbHomeLabel: 'Home',
})

const orderedLevels: DifficultyLevel[] = ['base', 'advance', 'stretch']

const route = useRoute()

const rawCode = computed(() => String(route.params.code ?? ''))
const normalizedCode = computed(() => rawCode.value.toUpperCase())

const difficultyKey = computed(() => `lesson:${normalizedCode.value}:difficulty`)
const difficulty = useLocalStorage<DifficultyLevel>(difficultyKey, 'base')

const progressStore = useProgressStore()
const progress = computed(() => {
  const entry = progressStore.getLessonProgress(normalizedCode.value)
  return {
    ...entry,
    updatedAt: entry.completedAt ?? entry.viewedAt,
  }
})

const printMode = ref<'current' | 'all'>('current')
const renderAllBlocks = ref(false)

const { lesson, pending, error, refresh } = useLesson(normalizedCode.value, {
  watch: [() => normalizedCode.value],
})

const availableLevels = computed(() =>
  orderedLevels.filter((level) => (lesson.value?.difficultyBlocks[level] ?? null) !== null)
)

const visibleDifficultyBlocks = computed(() => {
  if (!lesson.value) {
    return [] as LessonDifficultyBlock[]
  }

  const blocks = orderedLevels
    .map((level) => lesson.value?.difficultyBlocks[level] ?? null)
    .filter((block): block is LessonDifficultyBlock => block !== null)

  if (renderAllBlocks.value) {
    return blocks
  }

  const current = lesson.value.difficultyBlocks[difficulty.value]
  if (current) {
    return [current]
  }

  return blocks.slice(0, 1)
})

const knowledgeCards = computed(() => lesson.value?.knowledgeCards ?? [])
const resources = computed(() => lesson.value?.resources ?? [])
const loop = computed(() => lesson.value?.loop ?? null)

// Ensure difficulty is valid when lesson changes
watch(
  () => [lesson.value, difficulty.value] as const,
  ([lessonValue, currentLevel]) => {
    if (!lessonValue) {
      return
    }

    if (!lessonValue.difficultyBlocks[currentLevel]) {
      const fallback = availableLevels.value[0]
      if (fallback) {
        difficulty.value = fallback
      }
    }
  },
  { immediate: true }
)

// Reset print state when lesson changes
watch(
  () => normalizedCode.value,
  () => {
    printMode.value = 'current'
    renderAllBlocks.value = false
  }
)

// Mark lesson as viewed
watch(
  () => lesson.value?.code,
  (code) => {
    if (!code) {
      return
    }
    progressStore.markLessonViewed(code)
  },
  { immediate: true }
)

// Auto-complete on scroll to bottom
const autoCompleteSentinel = ref<HTMLElement | null>(null)
const hasAutoCompleted = ref(false)

useIntersectionObserver(
  autoCompleteSentinel,
  ([{ isIntersecting }]) => {
    if (isIntersecting && lesson.value && !hasAutoCompleted.value && !progress.value.completed) {
      hasAutoCompleted.value = true
      progressStore.markLessonComplete(lesson.value.code)
    }
  },
  {
    threshold: 1.0,
  }
)

// Reset auto-complete flag when lesson changes
watch(
  () => normalizedCode.value,
  () => {
    hasAutoCompleted.value = false
  }
)

const toggleCompletion = () => {
  if (!normalizedCode.value) {
    return
  }
  progressStore.toggleLessonCompletion(normalizedCode.value)
  // Allow re-triggering auto-complete if marked incomplete
  if (!progress.value.completed) {
    hasAutoCompleted.value = false
  }
}

const handlePrint = async (mode: 'current' | 'all') => {
  if (!process.client) {
    return
  }

  printMode.value = mode
  renderAllBlocks.value = mode === 'all'
  await nextTick()
  window.print()
}

const resetPrintState = () => {
  printMode.value = 'current'
  renderAllBlocks.value = false
}

onMounted(() => {
  if (!process.client) {
    return
  }

  window.addEventListener('afterprint', resetPrintState)
})

onBeforeUnmount(() => {
  if (!process.client) {
    return
  }

  window.removeEventListener('afterprint', resetPrintState)
})

useHead(() => {
  if (!lesson.value) {
    return {
      title: `Lesson ${normalizedCode.value}`,
    }
  }

  return {
    title: `${lesson.value.code} · ${lesson.value.title}`,
    meta: [
      {
        name: 'description',
        content: lesson.value.summary ?? lesson.value.title,
      },
    ],
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .lesson-page {
    background: #fff !important;
    padding: 0 !important;
  }

  .lesson-page > div {
    max-width: 100% !important;
    padding: 0 !important;
  }

  [data-print-mode='current'] [data-difficulty-block] {
    display: none !important;
  }

  [data-print-mode='current'][data-visible-level='base'] [data-difficulty-block][data-level='base'],
  [data-print-mode='current'][data-visible-level='advance']
    [data-difficulty-block][data-level='advance'],
  [data-print-mode='current'][data-visible-level='stretch']
    [data-difficulty-block][data-level='stretch'],
  [data-print-mode='all'] [data-difficulty-block] {
    display: block !important;
  }

  .difficulty-section {
    page-break-inside: avoid;
  }

  .difficulty-section + .difficulty-section {
    page-break-before: always;
  }

  .print-page-break {
    page-break-before: always;
  }
}
</style>
