<template>
  <div
    ref="containerRef"
    class="relative select-none touch-none"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <!-- After Image (Background) -->
    <div class="relative">
      <NuxtImg
        v-if="after"
        :src="getImageUrl(after.url)"
        :alt="after.alternativeText || 'After image'"
        class="w-full h-auto object-contain"
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
        class="w-full h-auto object-contain"
        draggable="false"
        preset="gallery"
        sizes="sm:640px md:800px lg:1024px"
      />
    </div>

    <!-- Slider Handle -->
    <div
      class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
      :style="{ left: `${sliderPosition}%` }"
    >
      <!-- Handle Circle -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
        <Icon name="mdi:arrow-left-right" class="text-gray-900 text-xl" />
      </div>
    </div>

    <!-- Labels -->
    <div class="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm font-semibold rounded">
      之前
    </div>
    <div class="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm font-semibold rounded">
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
