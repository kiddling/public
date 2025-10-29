<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <!-- Header -->
          <div class="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex-1 min-w-0">
              <h2 id="modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ resource.title }}
              </h2>
              <div class="flex gap-2 mt-2 flex-wrap">
                <span class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {{ getCategoryLabel(resource.category) }}
                </span>
                <span class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {{ getMediumLabel(resource.medium) }}
                </span>
                <span
                  class="text-sm px-2 py-1 rounded font-medium"
                  :class="getAccessibilityBadgeClass(resource.accessibilityStatus)"
                >
                  {{ getAccessibilityLabel(resource.accessibilityStatus) }}
                </span>
              </div>
            </div>
            <button
              class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="关闭对话框"
              @click="close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <!-- Description -->
            <div v-if="resource.description" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">描述</h3>
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ resource.description }}
              </p>
            </div>

            <!-- Disciplines -->
            <div v-if="resource.disciplines && resource.disciplines.length > 0" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">学科领域</h3>
              <div class="flex gap-2 flex-wrap">
                <span
                  v-for="discipline in resource.disciplines"
                  :key="discipline"
                  class="px-3 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded"
                >
                  {{ discipline }}
                </span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="resource.tags && resource.tags.length > 0" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">标签</h3>
              <div class="flex gap-2 flex-wrap">
                <span
                  v-for="tag in resource.tags"
                  :key="tag"
                  class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Link Check Status -->
            <div v-if="resource.lastChecked" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">链接状态</h3>
              <p class="text-gray-700 dark:text-gray-300">
                最后检查时间: {{ formatDateTime(resource.lastChecked) }}
              </p>
              <div
                v-if="resource.accessibilityStatus === 'needs-attention'"
                class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"
              >
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ 该资源可能存在访问问题，请尝试以下备用方案或联系管理员。
                </p>
              </div>
            </div>

            <!-- Offline Instructions -->
            <div v-if="resource.offlineInstructions" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">离线说明</h3>
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ resource.offlineInstructions }}
              </p>
            </div>

            <!-- URL -->
            <div v-if="resource.url" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">访问链接</h3>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 dark:text-primary-400 hover:underline break-all"
              >
                {{ resource.url }}
              </a>
            </div>

            <!-- Attachment -->
            <div v-if="resource.attachmentUrl" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">附件下载</h3>
              <a
                :href="resource.attachmentUrl"
                download
                class="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                下载附件
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              v-if="resource.url"
              class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              @click="openResource"
            >
              打开资源
            </button>
            <button
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              @click="close"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

const props = defineProps<{
  isOpen: boolean
  resource: Resource
}>()

const emit = defineEmits<{
  'close': []
}>()

const close = () => {
  emit('close')
}

const openResource = () => {
  if (props.resource.url) {
    window.open(props.resource.url, '_blank', 'noopener,noreferrer')
  }
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
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

const getAccessibilityLabel = (status: string) => {
  const labels: Record<string, string> = {
    'verified': '已验证',
    'needs-attention': '需关注',
    'unknown': '未知',
  }
  return labels[status] || '未知'
}

const getAccessibilityBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'verified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'needs-attention': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return classes[status] || classes.unknown
}

// Handle escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
