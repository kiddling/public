<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`lightbox-title-${work.id}`"
        @click.self="handleClose"
      >
        <div
          ref="lightboxContainer"
          class="relative flex h-full w-full flex-col"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <div class="flex items-center justify-between bg-black/50 p-4 backdrop-blur-sm">
            <div class="flex-1 text-white">
              <h2 :id="`lightbox-title-${work.id}`" class="mb-1 text-xl font-semibold">
                {{ work.projectTitle || work.studentName }}
              </h2>
              <p class="text-sm text-gray-300">
                {{ work.studentName }}
                <span v-if="work.discipline"> • {{ work.discipline }}</span>
                <span v-if="work.loop"> • {{ work.loop }}</span>
                <span v-if="work.grade"> • {{ work.grade }}</span>
              </p>
            </div>

            <button
              class="rounded p-2 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close lightbox"
              @click="handleClose"
            >
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="relative flex flex-1 items-center justify-center overflow-hidden px-16">
            <button
              v-if="hasPrevious"
              class="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous work"
              @click="handlePrevious"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div
              class="relative flex h-full w-full max-w-5xl items-center justify-center"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <div v-if="currentMediaType === 'beforeAfter'" class="w-full">
                <BeforeAfterSlider :pair="currentBeforeAfterPair" />
              </div>
              <NuxtImg
                v-else-if="currentMediaUrl"
                :src="currentMediaUrl"
                :alt="currentMediaAlt"
                class="max-h-full max-w-full object-contain"
                preset="hero"
                sizes="sm:640px md:1024px lg:1536px xl:1920px"
              />
            </div>

            <button
              v-if="hasNext"
              class="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next work"
              @click="handleNext"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div v-if="mediaItems.length > 1" class="bg-black/50 p-4 backdrop-blur-sm">
            <div class="flex items-center justify-center gap-2 overflow-x-auto">
              <button
                v-for="(item, index) in mediaItems"
                :key="`thumb-${index}`"
                class="h-16 w-16 flex-shrink-0 overflow-hidden rounded transition-opacity focus:outline-none focus:ring-2 focus:ring-white"
                :class="
                  currentMediaIndex === index
                    ? 'opacity-100 ring-2 ring-white'
                    : 'opacity-60 hover:opacity-80'
                "
                :aria-label="`View ${item.type === 'beforeAfter' ? 'before/after comparison' : 'image'} ${index + 1}`"
                @click="currentMediaIndex = index"
              >
                <NuxtImg
                  :src="item.thumbnailUrl"
                  :alt="`Thumbnail ${index + 1}`"
                  class="h-full w-full object-cover"
                  width="64"
                  height="64"
                />
              </button>
            </div>
          </div>

          <div class="bg-black/50 p-4 backdrop-blur-sm">
            <div class="mx-auto max-w-5xl">
              <div
                v-if="work.description"
                class="mb-4 text-sm text-white"
                v-html="work.description"
              />
              <div class="flex items-center gap-3">
                <button
                  v-if="work.shareEnabled"
                  class="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  @click="handleShare"
                >
                  <span class="flex items-center gap-2">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Share
                  </span>
                </button>

                <button
                  v-if="work.downloadUrl"
                  class="rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  @click="handleDownload"
                >
                  <span class="flex items-center gap-2">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <StudentQrModal
    v-if="showQrModal"
    :work="work"
    :show="showQrModal"
    @close="showQrModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { StudentWork, BeforeAfterPair } from '~/types/cms'

const props = defineProps<{
  work: StudentWork
  works: StudentWork[]
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', work: StudentWork): void
}>()

const lightboxContainer = ref<HTMLDivElement | null>(null)
const currentMediaIndex = ref(0)
const showQrModal = ref(false)

const touchStartX = ref(0)
const touchEndX = ref(0)

interface MediaItem {
  type: 'image' | 'beforeAfter'
  url?: string
  alt?: string
  thumbnailUrl: string
  pair?: BeforeAfterPair
}

const mediaItems = computed<MediaItem[]>(() => {
  const items: MediaItem[] = []

  props.work.assets.forEach((asset) => {
    items.push({
      type: 'image',
      url: asset.url,
      alt: asset.alternativeText || '',
      thumbnailUrl: asset.url,
    })
  })

  props.work.beforeAfterMedia.forEach((pair) => {
    items.push({
      type: 'beforeAfter',
      thumbnailUrl: pair.beforeMedia.url,
      pair,
    })
  })

  return items
})

const currentMediaType = computed(() => mediaItems.value[currentMediaIndex.value]?.type)
const currentMediaUrl = computed(() => mediaItems.value[currentMediaIndex.value]?.url)
const currentMediaAlt = computed(() => mediaItems.value[currentMediaIndex.value]?.alt || '')
const currentBeforeAfterPair = computed(() => mediaItems.value[currentMediaIndex.value]?.pair)

const currentWorkIndex = computed(() => {
  return props.works.findIndex((w) => w.id === props.work.id)
})

const hasPrevious = computed(() => currentWorkIndex.value > 0)
const hasNext = computed(() => currentWorkIndex.value < props.works.length - 1)

function handleClose() {
  emit('close')
}

function handlePrevious() {
  if (hasPrevious.value) {
    const previousWork = props.works[currentWorkIndex.value - 1]
    currentMediaIndex.value = 0
    emit('navigate', previousWork)
  }
}

function handleNext() {
  if (hasNext.value) {
    const nextWork = props.works[currentWorkIndex.value + 1]
    currentMediaIndex.value = 0
    emit('navigate', nextWork)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
  } else if (event.key === 'ArrowLeft') {
    handlePrevious()
  } else if (event.key === 'ArrowRight') {
    handleNext()
  }
}

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0].clientX
}

function handleTouchMove(event: TouchEvent) {
  touchEndX.value = event.touches[0].clientX
}

function handleTouchEnd() {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      handleNext()
    } else {
      handlePrevious()
    }
  }

  touchStartX.value = 0
  touchEndX.value = 0
}

function handleShare() {
  showQrModal.value = true
}

function handleDownload() {
  if (props.work.downloadUrl) {
    window.open(props.work.downloadUrl, '_blank')
  }
}

watch(
  () => props.show,
  async (show) => {
    if (show) {
      await nextTick()
      lightboxContainer.value?.focus()
    }
  }
)

onMounted(() => {
  if (props.show) {
    nextTick(() => {
      lightboxContainer.value?.focus()
    })
  }
})

watch(
  () => props.work,
  () => {
    currentMediaIndex.value = 0
  }
)
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
