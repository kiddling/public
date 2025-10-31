<template>
  <header class="rounded-2xl bg-white/90 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800">
    <div class="flex flex-wrap items-start justify-between gap-6">
      <div class="max-w-3xl space-y-3">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
          Lesson {{ lesson.code }}
        </p>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          {{ lesson.title }}
        </h1>
        <p v-if="lesson.summary" class="text-base text-gray-600 dark:text-gray-300">
          {{ lesson.summary }}
        </p>
      </div>

      <div class="no-print flex flex-col items-end gap-3">
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          :class="progressBadgeClasses"
        >
          {{ progressLabel }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
          @click="$emit('toggleCompletion')"
        >
          <span v-if="progress.completed">标记为未完成 Mark as incomplete</span>
          <span v-else>标记为完成 Mark as complete</span>
        </button>
        <p v-if="progress.updatedAt" class="text-xs text-gray-500 dark:text-gray-400">
          Updated {{ formatTimestamp(progress.updatedAt) }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
      <LessonDifficultyToggle v-model="modelValue" class="flex-1" />

      <div class="no-print flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
          @click="$emit('print', 'current')"
        >
          打印当前难度 Print selected level
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
          @click="$emit('print', 'all')"
        >
          打印所有难度 Print all levels
        </button>
      </div>
    </div>

    <div v-if="loop" class="mt-6 grid gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40 sm:grid-cols-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Loop Title</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{{ loop.title ?? 'Loop' }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sequence</p>
        <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">
          {{ loop.order != null ? `Step ${loop.order}` : 'Not specified' }}
        </p>
      </div>
      <div v-if="loop.summary || loop.description">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Overview</p>
        <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {{ loop.summary ?? loop.description }}
        </p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Lesson, LessonLoop, DifficultyLevel } from '~/types/lesson'
import type { LessonProgressEntry } from '~/stores/progress'

const props = defineProps<{
  lesson: Lesson
  loop: LessonLoop | null
  progress: LessonProgressEntry
  modelValue: DifficultyLevel
}>()

defineEmits<{
  (event: 'update:modelValue', value: DifficultyLevel): void
  (event: 'toggleCompletion'): void
  (event: 'print', mode: 'current' | 'all'): void
}>()

const progressLabel = computed(() => {
  if (props.progress.completed) {
    return '已完成 Completed'
  }
  if (props.progress.viewed) {
    return '进行中 In progress'
  }
  return '未开始 Not started'
})

const progressBadgeClasses = computed(() => {
  if (props.progress.completed) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
  }
  if (props.progress.viewed) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
})

function formatTimestamp(value: string) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>
