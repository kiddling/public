<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="no-print fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="close"
      >
        <div
          class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`qr-modal-title-${card?.id}`"
        >
          <!-- Header -->
          <div class="mb-4 flex items-start justify-between">
            <h3
              :id="`qr-modal-title-${card?.id}`"
              class="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              QR Code
            </h3>
            <button
              class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              @click="close"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {{ card?.title }}
          </p>

          <!-- QR Code -->
          <div class="mb-4 flex justify-center">
            <div
              ref="qrCodeContainer"
              class="rounded-lg border-2 border-gray-200 bg-white p-4"
            ></div>
          </div>

          <!-- Link -->
          <div v-if="qrUrl" class="mb-4">
            <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Link:
            </label>
            <div class="flex items-center space-x-2">
              <input
                :value="qrUrl"
                readonly
                class="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded px-3 py-2 text-white transition-colors focus:outline-none focus:ring-2"
                :title="copied ? 'Copied!' : 'Copy link'"
                @click="copyLink"
              >
                <svg
                  v-if="!copied"
                  class="h-5 w-5"
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
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button
              class="focus:ring-primary-500 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="close"
            >
              Close
            </button>
            <button
              class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2"
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
