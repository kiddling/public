<script setup lang="ts">
import type { Resource } from '~/types/cms'
import { highlightSearchTerm, stripHtml, truncateText } from '~/utils/search-highlight'

const props = defineProps<{
  resource: Resource
  searchTerm?: string
}>()

const emit = defineEmits<{
  'open-detail': [resource: Resource]
}>()

const getAccessibilityStatus = (resource: Resource) => {
  if (!resource.accessibilityFlag) {
    return { text: '需关注', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
  }
  
  if (!resource.lastChecked) {
    return { text: '未知', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  }

  const daysSinceCheck = Math.floor((Date.now() - new Date(resource.lastChecked).getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceCheck > 90) {
    return { text: '需重新验证', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' }
  }
  
  return { text: '已验证', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
}

const accessibilityStatus = computed(() => getAccessibilityStatus(props.resource))

const highlightedTitle = computed(() => {
  if (props.searchTerm) {
    return highlightSearchTerm(props.resource.title, props.searchTerm)
  }
  return props.resource.title
})

const description = computed(() => {
  const text = stripHtml(props.resource.description || '')
  const truncated = truncateText(text, 120)
  if (props.searchTerm) {
    return highlightSearchTerm(truncated, props.searchTerm)
  }
  return truncated
})

const mediaTypeIcon = computed(() => {
  switch (props.resource.mediaType) {
    case 'video':
      return '🎥'
    case 'pdf':
      return '📄'
    case 'dataset':
      return '📊'
    default:
      return '🔗'
  }
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 p-6 cursor-pointer"
    @click="emit('open-detail', resource)"
    @keydown.enter="emit('open-detail', resource)"
    tabindex="0"
    role="button"
    :aria-label="`Open details for ${resource.title}`"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-2">
        <span class="text-2xl" aria-hidden="true">{{ mediaTypeIcon }}</span>
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-white"
          v-html="highlightedTitle"
        />
      </div>
      <span
        :class="['px-2 py-1 text-xs font-medium rounded-full', accessibilityStatus.class]"
        :title="resource.lastChecked ? `Last checked: ${new Date(resource.lastChecked).toLocaleDateString()}` : 'Not checked yet'"
      >
        {{ accessibilityStatus.text }}
      </span>
    </div>

    <p
      v-if="description"
      class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
      v-html="description"
    />

    <div class="flex flex-wrap gap-2 mb-3">
      <span
        v-if="resource.category"
        class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
      >
        {{ resource.category }}
      </span>
      <span
        v-for="discipline in resource.disciplines"
        :key="discipline"
        class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
      >
        {{ discipline }}
      </span>
    </div>

    <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
      <span class="truncate">{{ resource.url }}</span>
      <button
        class="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        @click.stop="window.open(resource.url, '_blank')"
      >
        访问 →
      </button>
    </div>
  </div>
</template>
