<template>
  <div
    ref="containerRef"
    class="relative touch-none select-none"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <!-- After Image (Background) -->
    <div class="relative">
      <NuxtImg
        v-if="after"
        :src="getImageUrl(after.url)"
        :alt="after.alternativeText || 'After image'"
        class="h-auto w-full object-contain"
        draggable="false"
        preset="gallery"
        sizes="sm:640px md:800px lg:1024px"
      />
    </div>

    <!-- Before Image (Clipped) -->
    <div
      class="absolute inset-0 overflow-hidden"
      :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
    >
      <NuxtImg
        v-if="before"
        :src="getImageUrl(before.url)"
        :alt="before.alternativeText || 'Before image'"
        class="h-auto w-full object-contain"
        draggable="false"
        preset="gallery"
        sizes="sm:640px md:800px lg:1024px"
      />
    </div>

    <!-- Slider Handle -->
    <div
      class="absolute bottom-0 top-0 w-1 cursor-ew-resize bg-white"
      :style="{ left: `${sliderPosition}%` }"
    >
      <!-- Handle Circle -->
      <div
        class="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-white shadow-lg"
      >
        <Icon name="mdi:arrow-left-right" class="text-xl text-gray-900" />
      </div>
    </div>

    <!-- Labels -->
    <div
      class="absolute left-4 top-4 rounded bg-black/60 px-3 py-1.5 text-sm font-semibold text-white"
    >
      之前
    </div>
    <div
      class="absolute right-4 top-4 rounded bg-black/60 px-3 py-1.5 text-sm font-semibold text-white"
    >
      之后
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StrapiMedia } from '~/types/cms'

interface Props {
  before: StrapiMedia
  after: StrapiMedia
  initialPosition?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialPosition: 50,
})

const sliderPosition = ref(props.initialPosition)
const containerRef = ref<HTMLElement>()
const isDragging = ref(false)

function getImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const config = useRuntimeConfig()
  const cmsUrl = config.public.cmsUrl || 'http://localhost:1337'
  return `${cmsUrl}${url}`
}

function updateSliderPosition(clientX: number) {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
  sliderPosition.value = percentage
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  updateSliderPosition(e.clientX)

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      updateSliderPosition(e.clientX)
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleTouchStart(e: TouchEvent) {
  isDragging.value = true
  updateSliderPosition(e.touches[0].clientX)

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging.value) {
      e.preventDefault()
      updateSliderPosition(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    isDragging.value = false
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

// Keyboard accessibility
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    sliderPosition.value = Math.max(0, sliderPosition.value - 5)
  } else if (e.key === 'ArrowRight') {
    sliderPosition.value = Math.min(100, sliderPosition.value + 5)
  }
}

onMounted(() => {
  containerRef.value?.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('keydown', handleKeyDown)
})
</script>
