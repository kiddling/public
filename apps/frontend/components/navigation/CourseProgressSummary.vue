<template>
  <div
    class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80"
    :class="sizeClasses.container"
    role="group"
    aria-label="Course progress summary"
  >
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Progress
      </p>
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
        {{ summaryLabel }}
      </span>
    </div>
    <div class="flex items-center gap-3">
      <div class="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          class="absolute h-full rounded-full bg-primary-500 transition-all duration-500 ease-out dark:bg-primary-400"
          :style="{ width: `${Math.min(percentage, 100)}%` }"
          aria-hidden="true"
        ></div>
      </div>
      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {{ percentage }}%
      </span>
    </div>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {{ assistiveLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    completed: number
    total: number
    viewed?: number
    percentage: number
    size?: 'sm' | 'md'
  }>(),
  {
    viewed: 0,
    size: 'md',
  }
)

const summaryLabel = computed(() => `${props.completed}/${props.total} lessons`)

const assistiveLabel = computed(() => {
  if (!props.total) {
    return 'No lessons registered yet.'
  }

  const viewedLabel = props.viewed && props.viewed > props.completed ? ` (${props.viewed} viewed)` : ''
  return `Completed ${props.completed} of ${props.total} lessons${viewedLabel}.`
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return {
      container: 'p-3 gap-1.5',
    }
  }
  return {
    container: '',
  }
})
</script>
