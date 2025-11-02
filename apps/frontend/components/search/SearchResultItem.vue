<template>
  <li
    :id="`search-result-${index}`"
    role="option"
    :aria-selected="String(isActive)"
    :data-active="isActive ? 'true' : undefined"
    class="hover:bg-primary-50 focus-within:bg-primary-50 dark:hover:bg-primary-500/10 dark:focus-within:bg-primary-500/10 group relative rounded-xl transition"
  >
    <button
      type="button"
      class="flex w-full items-start gap-3 px-3 py-3 text-left"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
    >
      <!-- Icon -->
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition"
        :class="iconClasses"
      >
        <Icon :name="iconName" class="h-5 w-5" />
      </div>

      <!-- Content -->
      <div class="min-w-0 flex-1">
        <!-- Title with highlights -->
        <div class="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          <HighlightedText :text="result.title" :ranges="result.highlights.title" />
        </div>

        <!-- Excerpt with highlights -->
        <div v-if="result.excerpt" class="mb-2 text-xs text-gray-600 dark:text-gray-400">
          <HighlightedText :text="result.excerpt" :ranges="result.highlights.excerpt" />
        </div>

        <!-- Meta badges -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Type badge -->
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            :class="typeBadgeClasses"
          >
            {{ typeBadgeLabel }}
          </span>

          <!-- Lesson difficulty badges -->
          <template v-if="result.type === 'lesson' && result.meta.difficulty">
            <span
              v-for="diff in result.meta.difficulty"
              :key="diff"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              :class="difficultyBadgeClasses(diff)"
            >
              {{ diff }}
            </span>
          </template>

          <!-- Lesson code -->
          <span
            v-if="result.type === 'lesson' && result.meta.code"
            class="font-mono text-[10px] text-gray-500 dark:text-gray-400"
          >
            {{ result.meta.code }}
          </span>

          <!-- Knowledge card type -->
          <span
            v-if="result.type === 'knowledge-card' && result.meta.type"
            class="text-[10px] text-gray-500 dark:text-gray-400"
          >
            {{ result.meta.type }}
          </span>

          <!-- Student work discipline -->
          <span
            v-if="result.type === 'student-work' && result.meta.discipline"
            class="text-[10px] text-gray-500 dark:text-gray-400"
          >
            {{ result.meta.discipline }}
          </span>

          <!-- Resource category -->
          <span
            v-if="result.type === 'resource' && result.meta.category"
            class="text-[10px] text-gray-500 dark:text-gray-400"
          >
            {{ result.meta.category }}
          </span>
        </div>
      </div>

      <!-- Arrow indicator -->
      <Icon
        name="i-heroicons-arrow-right-20-solid"
        class="h-5 w-5 shrink-0 text-gray-400 opacity-0 transition group-hover:opacity-100 group-data-[active=true]:opacity-100 dark:text-gray-500"
      />
    </button>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HighlightedText from './HighlightedText.vue'
import type { SearchResult } from '~/stores/search'

const props = defineProps<{
  result: SearchResult
  index: number
}>()

const emit = defineEmits<{
  (e: 'select', result: SearchResult): void
}>()

const isActive = computed(() => {
  // This will be managed by keyboard navigation
  return false
})

const iconName = computed(() => {
  switch (props.result.type) {
    case 'lesson':
      return 'i-heroicons-book-open-20-solid'
    case 'knowledge-card':
      return 'i-heroicons-light-bulb-20-solid'
    case 'student-work':
      return 'i-heroicons-academic-cap-20-solid'
    case 'resource':
      return 'i-heroicons-folder-20-solid'
    default:
      return 'i-heroicons-document-20-solid'
  }
})

const iconClasses = computed(() => {
  const baseClasses = 'border'
  switch (props.result.type) {
    case 'lesson':
      return `${baseClasses} border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400`
    case 'knowledge-card':
      return `${baseClasses} border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400`
    case 'student-work':
      return `${baseClasses} border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400`
    case 'resource':
      return `${baseClasses} border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400`
    default:
      return `${baseClasses} border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`
  }
})

const typeBadgeLabel = computed(() => {
  switch (props.result.type) {
    case 'lesson':
      return 'Lesson'
    case 'knowledge-card':
      return 'Card'
    case 'student-work':
      return 'Work'
    case 'resource':
      return 'Resource'
    default:
      return props.result.type
  }
})

const typeBadgeClasses = computed(() => {
  switch (props.result.type) {
    case 'lesson':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'knowledge-card':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    case 'student-work':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    case 'resource':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
})

const difficultyBadgeClasses = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
    case '初级':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'intermediate':
    case '中级':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'advanced':
    case '高级':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

const handleClick = () => {
  emit('select', props.result)
}

const handleMouseEnter = () => {
  // Emit event to update active index
  const event = new CustomEvent('hover-result', { detail: props.index })
  document.dispatchEvent(event)
}
</script>
