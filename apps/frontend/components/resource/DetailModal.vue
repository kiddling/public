<script setup lang="ts">
import type { Resource } from '~/types/cms'

const props = defineProps<{
  resource: Resource | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
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

  const daysSinceCheck = Math.floor(
    (Date.now() - new Date(resource.lastChecked).getTime()) / (1000 * 60 * 60 * 24)
  )

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

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.resource) {
      qrCodeDataUri.value = null
      generateQRCode()
    }
  }
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && resource"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="close"
      >
        <div
          class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`modal-title-${resource.id}`"
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <h2
              :id="`modal-title-${resource.id}`"
              class="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {{ resource.title }}
            </h2>
            <button
              @click="close"
              class="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div class="space-y-6 p-6">
            <div
              v-if="
                resource.category ||
                resource.mediaType ||
                (resource.disciplines && resource.disciplines.length > 0)
              "
              class="flex flex-wrap gap-2"
            >
              <span
                v-if="resource.category"
                class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {{ resource.category }}
              </span>
              <span
                v-if="resource.mediaType"
                class="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
              >
                {{ resource.mediaType }}
              </span>
              <span
                v-for="discipline in resource.disciplines"
                :key="discipline"
                class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                {{ discipline }}
              </span>
            </div>

            <div
              v-if="resource"
              :class="['rounded-lg border p-4', getAccessibilityDetails(resource).class]"
            >
              <div class="flex items-start space-x-3">
                <span class="text-2xl">
                  {{ resource.accessibilityFlag ? '✓' : '⚠️' }}
                </span>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    可访问性状态: {{ getAccessibilityDetails(resource).status }}
                  </p>
                  <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {{ getAccessibilityDetails(resource).message }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="resource.description">
              <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">描述</h3>
              <div class="prose dark:prose-invert max-w-none" v-html="resource.description" />
            </div>

            <div>
              <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">链接</h3>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="break-all text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {{ resource.url }} ↗
              </a>
            </div>

            <div v-if="qrCodeDataUri" class="flex flex-col items-center">
              <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">二维码</h3>
              <NuxtImg
                :src="qrCodeDataUri"
                alt="QR Code for resource link"
                class="h-64 w-64 rounded border border-gray-200 dark:border-gray-700"
                width="256"
                height="256"
              />
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                扫描二维码以在移动设备上打开
              </p>
            </div>

            <div v-else-if="isLoadingQR" class="flex flex-col items-center">
              <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">正在生成二维码...</p>
            </div>

            <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">离线使用说明</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                要离线访问此资源，请在有网络连接时访问该链接，并使用浏览器的保存功能（通常为 Ctrl+S
                或 Cmd+S）将页面保存到本地。
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                @click="close"
                class="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                关闭
              </button>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
