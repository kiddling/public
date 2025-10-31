<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 bg-black/95 flex flex-col"
      @keydown.esc="close"
      @keydown.left="previous"
      @keydown.right="next"
      tabindex="0"
      ref="lightboxRef"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 text-white">
        <div class="flex-1">
          <h2 class="text-xl font-semibold">{{ currentWork.studentName }}</h2>
          <div class="flex items-center gap-2 text-sm text-gray-300 mt-1">
            <span v-if="currentWork.discipline">{{ currentWork.discipline }}</span>
            <span v-if="currentWork.loop">· {{ currentWork.loop }}</span>
            <span v-if="currentWork.grade">· {{ currentWork.grade }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Share Button -->
          <button
            @click="share"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="分享"
          >
            <Icon name="mdi:share-variant" class="text-xl" />
          </button>
          
          <!-- Download Button -->
          <button
            v-if="currentAsset"
            @click="download"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="下载"
          >
            <Icon name="mdi:download" class="text-xl" />
          </button>
          
          <!-- QR Code Button -->
          <button
            @click="showQR = !showQR"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="二维码"
          >
            <Icon name="mdi:qrcode" class="text-xl" />
          </button>
          
          <!-- Close Button -->
          <button
            @click="close"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="关闭 (ESC)"
          >
            <Icon name="mdi:close" class="text-2xl" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex items-center justify-center p-4 relative">
        <!-- Previous Button -->
        <button
          v-if="!isFirst"
          @click="previous"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          title="上一个 (←)"
        >
          <Icon name="mdi:chevron-left" class="text-3xl text-white" />
        </button>

        <!-- Image/Comparison Container -->
        <div
          class="max-w-7xl max-h-full w-full flex items-center justify-center"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Before/After Comparison -->
          <StudentGalleryComparison
            v-if="hasComparison && showComparison"
            :before="currentAsset"
            :after="currentWork.beforeAfterMedia[0]"
            class="max-w-full max-h-[calc(100vh-200px)]"
          />
          
          <!-- Regular Image -->
          <img
            v-else-if="currentAsset"
            :src="getImageUrl(currentAsset.url)"
            :alt="currentWork.studentName"
            class="max-w-full max-h-[calc(100vh-200px)] object-contain"
          />
        </div>

        <!-- Next Button -->
        <button
          v-if="!isLast"
          @click="next"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          title="下一个 (→)"
        >
          <Icon name="mdi:chevron-right" class="text-3xl text-white" />
        </button>
      </div>

      <!-- Footer -->
      <div class="p-4 text-white">
        <div class="max-w-3xl mx-auto">
          <!-- Description -->
          <p v-if="currentWork.description" class="text-gray-300 mb-4">
            {{ currentWork.description }}
          </p>

          <!-- Toggle Comparison Button -->
          <div v-if="hasComparison" class="mb-4">
            <button
              @click="showComparison = !showComparison"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              {{ showComparison ? '查看作品' : '查看对比' }}
            </button>
          </div>

          <!-- Counter -->
          <div class="text-center text-sm text-gray-400">
            {{ currentIndex + 1 }} / {{ works.length }}
          </div>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div
        v-if="showQR"
        class="absolute top-20 right-4 bg-white p-4 rounded-lg shadow-xl"
        @click.stop
      >
        <div class="text-center">
          <div class="bg-white p-2 mb-2">
            <canvas ref="qrCanvas" class="mx-auto"></canvas>
          </div>
          <p class="text-sm text-gray-600">扫码分享作品</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { StudentWork } from '~/types/cms'
import QRCode from 'qrcode'

interface Props {
  works: StudentWork[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
})

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)
const showComparison = ref(false)
const showQR = ref(false)
const lightboxRef = ref<HTMLElement>()
const qrCanvas = ref<HTMLCanvasElement>()

// Touch handling for mobile swipe
const touchStartX = ref(0)
const touchEndX = ref(0)

const currentWork = computed(() => props.works[currentIndex.value])
const currentAsset = computed(() => {
  const assets = currentWork.value.assets
  return assets && assets.length > 0 ? assets[0] : null
})

const hasComparison = computed(() => {
  return currentWork.value.beforeAfterMedia && currentWork.value.beforeAfterMedia.length > 0
})

const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === props.works.length - 1)

function close() {
  emit('close')
}

function next() {
  if (!isLast.value) {
    currentIndex.value++
    showComparison.value = false
  }
}

function previous() {
  if (!isFirst.value) {
    currentIndex.value--
    showComparison.value = false
  }
}

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.changedTouches[0].screenX
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.changedTouches[0].screenX
}

function handleTouchEnd() {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      next()
    } else {
      previous()
    }
  }
}

function getImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const config = useRuntimeConfig()
  const cmsUrl = config.public.cmsUrl || 'http://localhost:1337'
  return `${cmsUrl}${url}`
}

async function share() {
  const url = window.location.href
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${currentWork.value.studentName}的作品`,
        text: currentWork.value.description || '',
        url,
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      alert('链接已复制到剪贴板')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}

function download() {
  if (!currentAsset.value) return
  
  const url = getImageUrl(currentAsset.value.url)
  const link = document.createElement('a')
  link.href = url
  link.download = currentAsset.value.name || 'student-work.jpg'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generate QR code when shown
watch(showQR, async (show) => {
  if (show && qrCanvas.value) {
    const url = window.location.href
    try {
      await QRCode.toCanvas(qrCanvas.value, url, {
        width: 200,
        margin: 1,
      })
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    }
  }
})

// Focus lightbox for keyboard navigation
onMounted(() => {
  lightboxRef.value?.focus()
})

// Prevent body scroll
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
