<script setup lang="ts">
import type { Resource } from '~/types/cms'

const props = defineProps<{
  resource: Resource | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

const qrCodeDataUri = ref<string | null>(null)
const isLoadingQR = ref(false)

const close = () => {
  emit('close')
}

const generateQRCode = async () => {
  if (!props.resource || isLoadingQR.value || qrCodeDataUri.value) return

  isLoadingQR.value = true
  try {
    const response = await $fetch<{ dataURI: string }>('/api/qr', {
      params: {
        data: props.resource.url,
        size: 256,
      },
    })
    qrCodeDataUri.value = response.dataURI
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  } finally {
    isLoadingQR.value = false
  }
}

const getAccessibilityDetails = (resource: Resource) => {
  if (!resource.accessibilityFlag) {
    return {
      status: '需关注',
      message: '该资源可能无法访问或存在问题。',
      class: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    }
  }
  
  if (!resource.lastChecked) {
    return {
      status: '未知',
      message: '该资源尚未进行可访问性验证。',
      class: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
    }
  }

  const daysSinceCheck = Math.floor((Date.now() - new Date(resource.lastChecked).getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceCheck > 90) {
    return {
      status: '需重新验证',
      message: `最后验证时间为 ${daysSinceCheck} 天前，建议重新验证可访问性。`,
      class: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    }
  }
  
  return {
    status: '已验证',
    message: `该资源在 ${daysSinceCheck} 天前已验证可访问。`,
    class: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.resource) {
    qrCodeDataUri.value = null
    generateQRCode()
  }
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && resource"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`modal-title-${resource.id}`"
        >
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 :id="`modal-title-${resource.id}`" class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ resource.title }}
            </h2>
            <button
              @click="close"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div class="p-6 space-y-6">
            <div v-if="resource.category || resource.mediaType || (resource.disciplines && resource.disciplines.length > 0)" class="flex flex-wrap gap-2">
              <span
                v-if="resource.category"
                class="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
              >
                {{ resource.category }}
              </span>
              <span
                v-if="resource.mediaType"
                class="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full"
              >
                {{ resource.mediaType }}
              </span>
              <span
                v-for="discipline in resource.disciplines"
                :key="discipline"
                class="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full"
              >
                {{ discipline }}
              </span>
            </div>

            <div
              v-if="resource"
              :class="['p-4 border rounded-lg', getAccessibilityDetails(resource).class]"
            >
              <div class="flex items-start space-x-3">
                <span class="text-2xl">
                  {{ resource.accessibilityFlag ? '✓' : '⚠️' }}
                </span>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    可访问性状态: {{ getAccessibilityDetails(resource).status }}
                  </p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {{ getAccessibilityDetails(resource).message }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="resource.description">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">描述</h3>
              <div class="prose dark:prose-invert max-w-none" v-html="resource.description" />
            </div>

            <div v-if="resource.videoEmbeds && resource.videoEmbeds.length" class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">视频资源</h3>
              <div class="grid gap-6 md:grid-cols-1">
                <MediaVideoEmbed
                  v-for="videoEmbed in resource.videoEmbeds"
                  :key="videoEmbed.id"
                  :embed="videoEmbed"
                  :privacy-mode="true"
                  :lazy-load="false"
                />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">链接</h3>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all"
              >
                {{ resource.url }} ↗
              </a>
            </div>

            <div v-if="qrCodeDataUri" class="flex flex-col items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">二维码</h3>
              <img
                :src="qrCodeDataUri"
                alt="QR Code"
                class="w-64 h-64 border border-gray-200 dark:border-gray-700 rounded"
              />
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                扫描二维码以在移动设备上打开
              </p>
            </div>

            <div v-else-if="isLoadingQR" class="flex flex-col items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                正在生成二维码...
              </p>
            </div>

            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">离线使用说明</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                要离线访问此资源，请在有网络连接时访问该链接，并使用浏览器的保存功能（通常为 Ctrl+S 或 Cmd+S）将页面保存到本地。
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                @click="close"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                关闭
              </button>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                访问资源 ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
