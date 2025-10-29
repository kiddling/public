<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          :class="getMediumIconClass(resource.medium)"
        >
          {{ getMediumIcon(resource.medium) }}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Title and badges -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3
            class="font-semibold text-gray-900 dark:text-white text-base leading-tight"
            v-html="highlightedTitle"
          />
          <div class="flex gap-1 flex-shrink-0">
            <!-- Accessibility badge -->
            <span
              class="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
              :class="getAccessibilityBadgeClass(resource.accessibilityStatus)"
              :aria-label="`可访问性状态: ${getAccessibilityLabel(resource.accessibilityStatus)}`"
            >
              {{ getAccessibilityLabel(resource.accessibilityStatus) }}
            </span>
          </div>
        </div>

        <!-- Category and Medium -->
        <div class="flex gap-2 mb-2 flex-wrap">
          <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {{ getCategoryLabel(resource.category) }}
          </span>
          <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {{ getMediumLabel(resource.medium) }}
          </span>
        </div>

        <!-- Short Description -->
        <p
          v-if="resource.shortDescription"
          class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
          v-html="highlightedDescription"
        />

        <!-- Disciplines -->
        <div v-if="resource.disciplines && resource.disciplines.length > 0" class="mb-3">
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="discipline in resource.disciplines"
              :key="discipline"
              class="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded"
            >
              {{ discipline }}
            </span>
          </div>
        </div>

        <!-- Last checked status -->
        <div v-if="resource.lastChecked" class="text-xs text-gray-500 dark:text-gray-400 mb-3">
          最后检查: {{ formatDate(resource.lastChecked) }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-if="resource.url"
            class="text-sm px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            @click="openResource"
          >
            访问资源
          </button>
          <button
            class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="$emit('show-details', resource)"
          >
            详情
          </button>
          <button
            class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="显示二维码用于移动访问"
            @click="$emit('show-qr', resource)"
          >
            📱 二维码
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

const props = defineProps<{
  resource: Resource
  searchTerm?: string
}>()

defineEmits<{
  'show-details': [resource: Resource]
  'show-qr': [resource: Resource]
}>()

const highlightedTitle = computed(() => {
  if (!props.searchTerm) return props.resource.title
  return highlightText(props.resource.title, props.searchTerm)
})

const highlightedDescription = computed(() => {
  if (!props.searchTerm || !props.resource.shortDescription) {
    return props.resource.shortDescription || ''
  }
  return highlightText(props.resource.shortDescription, props.searchTerm)
})

const openResource = () => {
  if (props.resource.url) {
    window.open(props.resource.url, '_blank', 'noopener,noreferrer')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getMediumIcon = (medium: string) => {
  const icons: Record<string, string> = {
    'video': '🎥',
    'link': '🔗',
    'pdf': '📄',
    'document': '📝',
    'interactive': '🎮',
    'download': '📦',
  }
  return icons[medium] || '📌'
}

const getMediumIconClass = (medium: string) => {
  const classes: Record<string, string> = {
    'video': 'bg-red-100 dark:bg-red-900',
    'link': 'bg-blue-100 dark:bg-blue-900',
    'pdf': 'bg-green-100 dark:bg-green-900',
    'document': 'bg-yellow-100 dark:bg-yellow-900',
    'interactive': 'bg-purple-100 dark:bg-purple-900',
    'download': 'bg-indigo-100 dark:bg-indigo-900',
  }
  return classes[medium] || 'bg-gray-100 dark:bg-gray-700'
}

const getAccessibilityBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'verified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'needs-attention': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return classes[status] || classes.unknown
}

const getAccessibilityLabel = (status: string) => {
  const labels: Record<string, string> = {
    'verified': '已验证',
    'needs-attention': '需关注',
    'unknown': '未知',
  }
  return labels[status] || '未知'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'video-tutorials': '视频教程',
    'tool-links': '工具链接',
    'case-databases': '案例数据库',
    'readings': '阅读材料',
    'pbr-libraries': 'PBR资源库',
  }
  return labels[category] || category
}

const getMediumLabel = (medium: string) => {
  const labels: Record<string, string> = {
    'video': '视频',
    'link': '链接',
    'pdf': 'PDF',
    'document': '文档',
    'interactive': '互动',
    'download': '下载',
  }
  return labels[medium] || medium
}
</script>
