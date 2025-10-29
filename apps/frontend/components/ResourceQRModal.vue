<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <h2 id="qr-modal-title" class="text-xl font-bold text-gray-900 dark:text-white">
              扫码访问
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="关闭对话框"
              @click="close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- QR Code -->
          <div class="flex flex-col items-center">
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <img
                v-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                :alt="`${resource.title} 的二维码`"
                class="w-48 h-48"
              >
              <div v-else class="w-48 h-48 flex items-center justify-center text-gray-400">
                生成中...
              </div>
            </div>

            <p class="text-center text-gray-700 dark:text-gray-300 mb-2 font-medium">
              {{ resource.title }}
            </p>
            <p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
              使用手机扫描二维码快速访问
            </p>

            <!-- URL Display -->
            <div v-if="resource.url" class="w-full mb-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 break-all text-center">
                {{ resource.url }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 w-full">
              <button
                class="flex-1 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                @click="downloadQR"
              >
                下载二维码
              </button>
              <button
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                @click="close"
              >
                关闭
              </button>
            </div>
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

const qrCodeDataUrl = ref('')

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.resource.url) {
    // Generate QR code when modal opens
    nextTick(() => {
      qrCodeDataUrl.value = generateQRCode(props.resource.url || '', 200)
    })
  }
})

const close = () => {
  emit('close')
}

const downloadQR = () => {
  if (qrCodeDataUrl.value) {
    const filename = `qr-${props.resource.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    downloadQRCode(qrCodeDataUrl.value, filename)
  }
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
