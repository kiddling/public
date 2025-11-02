<template>
  <div
    ref="containerRef"
    class="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900"
    role="img"
    :aria-label="`${pair.beforeLabel} and ${pair.afterLabel} comparison`"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <NuxtImg
      :src="pair.afterMedia.url"
      :alt="pair.afterLabel"
      class="absolute inset-0 h-full w-full select-none object-contain"
      draggable="false"
      preset="gallery"
      sizes="sm:640px md:800px lg:1024px"
    />

    <div class="absolute inset-0 overflow-hidden" :style="{ width: `${sliderPosition}%` }">
      <NuxtImg
        :src="pair.beforeMedia.url"
        :alt="pair.beforeLabel"
        class="absolute inset-0 h-full w-full select-none object-contain"
        :style="{ width: containerWidth + 'px' }"
        draggable="false"
        preset="gallery"
        sizes="sm:640px md:800px lg:1024px"
      />
    </div>

    <div
      class="absolute bottom-0 top-0 w-1 cursor-ew-resize bg-white"
      :style="{ left: `${sliderPosition}%` }"
    >
      <div
        class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg"
      >
        <svg class="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </div>
    </div>

    <div
      class="absolute left-4 top-4 rounded bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
    >
      {{ pair.beforeLabel }}
    </div>
    <div
      class="absolute right-4 top-4 rounded bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
    >
      {{ pair.afterLabel }}
    </div>

    <div
      class="sr-only"
      role="slider"
      :aria-valuenow="sliderPosition"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`Adjust comparison slider. Current position: ${Math.round(sliderPosition)}%`"
      tabindex="0"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { BeforeAfterPair } from '~/types/cms'

const props = defineProps<{
  pair: BeforeAfterPair
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const sliderPosition = ref(50)
const containerWidth = ref(0)
const isDragging = ref(false)

function updateSliderPosition(clientX: number) {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percentage = (x / rect.width) * 100
  sliderPosition.value = Math.max(0, Math.min(100, percentage))
}

function handleMouseDown(event: MouseEvent) {
  isDragging.value = true
  updateSliderPosition(event.clientX)
  event.preventDefault()
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    updateSliderPosition(event.clientX)
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleTouchStart(event: TouchEvent) {
  isDragging.value = true
  updateSliderPosition(event.touches[0].clientX)
  event.preventDefault()
}

function handleTouchMove(event: TouchEvent) {
  if (isDragging.value) {
    updateSliderPosition(event.touches[0].clientX)
    event.preventDefault()
  }
}

function handleTouchEnd() {
  isDragging.value = false
}

function handleKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1

  if (event.key === 'ArrowLeft') {
    sliderPosition.value = Math.max(0, sliderPosition.value - step)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    sliderPosition.value = Math.min(100, sliderPosition.value + step)
    event.preventDefault()
  }
}

function updateContainerWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
  }
}

onMounted(() => {
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleTouchEnd)
})
</script>
