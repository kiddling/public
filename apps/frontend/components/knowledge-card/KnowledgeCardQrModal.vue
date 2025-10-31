<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 no-print"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`qr-modal-title-${card?.id}`"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <h3
              :id="`qr-modal-title-${card?.id}`"
              class="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              QR Code
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Card Title -->
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ card?.title }}
          </p>

          <!-- QR Code -->
          <div class="flex justify-center mb-4">
            <div
              ref="qrCodeContainer"
              class="bg-white p-4 rounded-lg border-2 border-gray-200"
            ></div>
          </div>

          <!-- Link -->
          <div v-if="qrUrl" class="mb-4">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link:
            </label>
            <div class="flex items-center space-x-2">
              <input
                :value="qrUrl"
                readonly
                class="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none"
              />
              <button
                class="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                :title="copied ? 'Copied!' : 'Copy link'"
                @click="copyLink"
              >
                <svg
                  v-if="!copied"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              @click="close"
            >
              Close
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              @click="downloadQr"
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { KnowledgeCard } from '~/types/cms'

const props = defineProps<{
  show: boolean
  card: KnowledgeCard | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const qrCodeContainer = ref<HTMLDivElement | null>(null)
const copied = ref(false)
const qrUrl = ref<string>('')
let QRCode: any = null

onMounted(async () => {
  // Dynamically import QRCode library
  try {
    const module = await import('qrcode')
    QRCode = module.default
  } catch (error) {
    console.error('Failed to load QRCode library:', error)
  }
})

watch(
  () => [props.show, props.card],
  async ([show, card]) => {
    if (show && card) {
      await nextTick()
      generateQrCode(card)
    }
  },
  { immediate: true }
)

function generateQrCode(card: KnowledgeCard) {
  if (!qrCodeContainer.value || !QRCode) return

  // Clear previous QR code
  qrCodeContainer.value.innerHTML = ''

  // Generate URL (use qrLink if available, otherwise construct from slug)
  const url = card.qrLink || getCardUrl(card)
  qrUrl.value = url

  // Generate QR code
  QRCode.toCanvas(
    url,
    {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    },
    (error: Error | null, canvas: HTMLCanvasElement) => {
      if (error) {
        console.error('Error generating QR code:', error)
        return
      }
      qrCodeContainer.value?.appendChild(canvas)
    }
  )
}

function getCardUrl(card: KnowledgeCard): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/knowledge-cards/${card.slug || card.id}`
}

async function copyLink() {
  if (!qrUrl.value) return

  try {
    await navigator.clipboard.writeText(qrUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

function downloadQr() {
  const canvas = qrCodeContainer.value?.querySelector('canvas')
  if (!canvas || !props.card) return

  canvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-code-${props.card?.slug || props.card?.id}.png`
    link.click()
    URL.revokeObjectURL(url)
  })
}

function close() {
  emit('close')
}
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
