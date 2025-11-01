<template>
  <article
    :class="[
      'knowledge-card rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg',
      cardTypeClass,
      { 'cursor-pointer': clickable },
    ]"
    :aria-label="`Knowledge card: ${card.title}`"
    @click="handleClick"
  >
    <!-- Card Header with Type Badge -->
    <div class="card-header p-4 pb-3 flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {{ card.title }}
        </h3>
        <div v-if="card.tags && card.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="tag in card.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <span
        :class="[
          'ml-3 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap',
          typeColorClass,
        ]"
      >
        {{ card.type }}
      </span>
    </div>

    <!-- Card Media -->
    <div v-if="showMedia && firstMedia" class="card-media relative bg-gray-100 dark:bg-gray-800">
      <NuxtImg
        v-if="isImage(firstMedia)"
        :src="firstMedia.url"
        :alt="firstMedia.alternativeText || card.title || 'Knowledge card image'"
        class="w-full h-48 object-cover"
        loading="lazy"
        preset="card"
        sizes="sm:400px md:400px lg:400px"
      />
      <div v-else-if="isVideo(firstMedia)" class="relative h-48 flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
        <svg
          class="relative z-10 w-16 h-16 text-white opacity-75"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
          />
        </svg>
      </div>
      <div v-else-if="isPdf(firstMedia)" class="relative h-48 flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800"></div>
        <svg
          class="relative z-10 w-16 h-16 text-red-600 dark:text-red-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content p-4">
      <!-- Theory Type -->
      <div v-if="card.type === 'Theory'" class="space-y-2">
        <p v-if="card.description" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ card.description }}
        </p>
      </div>

      <!-- Case Study Type -->
      <div v-else-if="card.type === 'Case Study'" class="space-y-2">
        <p v-if="card.description" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
          {{ card.description }}
        </p>
      </div>

      <!-- Student Work Type -->
      <div v-else-if="card.type === 'Student Work'" class="space-y-2">
        <p v-if="card.description" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ card.description }}
        </p>
        <div v-if="card.media.length > 1" class="flex items-center text-xs text-gray-500">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clip-rule="evenodd"
            />
          </svg>
          {{ card.media.length }} {{ card.media.length === 1 ? 'image' : 'images' }}
        </div>
      </div>

      <!-- AI Prompt Type -->
      <div v-else-if="card.type === 'AI Prompt'" class="space-y-3">
        <div v-if="card.promptText" class="relative">
          <div class="prompt-preview bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm font-mono text-gray-800 dark:text-gray-200 line-clamp-3">
            {{ card.promptText }}
          </div>
          <button
            v-if="showCopyButton"
            class="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            :title="copied ? 'Copied!' : 'Copy prompt'"
            @click.stop="copyPrompt"
          >
            <svg
              v-if="!copied"
              class="w-4 h-4 text-gray-600 dark:text-gray-300"
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
            <svg
              v-else
              class="w-4 h-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
        <p v-if="card.description" class="text-xs text-gray-600 dark:text-gray-400">
          {{ card.description }}
        </p>
      </div>

      <!-- Extended Thinking Type -->
      <div v-else-if="card.type === 'Extended Thinking'" class="space-y-2">
        <div class="flex items-start space-x-2">
          <svg class="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div v-if="showFooter" class="card-footer px-4 pb-4 pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span v-if="card.publishedAt">{{ formatDate(card.publishedAt) }}</span>
        <span v-else-if="card.createdAt">{{ formatDate(card.createdAt) }}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          v-if="showQrButton && card.qrLink"
          class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="View QR code"
          @click.stop="$emit('show-qr')"
        >
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
              clip-rule="evenodd"
            />
            <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
          </svg>
        </button>
        
        <button
          v-if="showShareButton"
          class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Share card"
          @click.stop="$emit('share')"
        >
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { KnowledgeCard } from '~/types/cms'

const props = withDefaults(
  defineProps<{
    card: KnowledgeCard
    clickable?: boolean
    showMedia?: boolean
    showFooter?: boolean
    showCopyButton?: boolean
    showQrButton?: boolean
    showShareButton?: boolean
  }>(),
  {
    clickable: true,
    showMedia: true,
    showFooter: true,
    showCopyButton: true,
    showQrButton: true,
    showShareButton: true,
  }
)

const emit = defineEmits<{
  (e: 'click', card: KnowledgeCard): void
  (e: 'show-qr'): void
  (e: 'share'): void
}>()

const copied = ref(false)

const firstMedia = computed(() => {
  return props.card.media && props.card.media.length > 0 ? props.card.media[0] : null
})

const cardTypeClass = computed(() => {
  const baseClass = 'border-l-4'
  const typeClasses = {
    Theory: 'border-blue-500 bg-white dark:bg-gray-900',
    'Case Study': 'border-green-500 bg-white dark:bg-gray-900',
    'Student Work': 'border-yellow-500 bg-white dark:bg-gray-900',
    'AI Prompt': 'border-purple-500 bg-white dark:bg-gray-900',
    'Extended Thinking': 'border-pink-500 bg-white dark:bg-gray-900',
  }
  return [baseClass, typeClasses[props.card.type || 'Theory']]
})

const typeColorClass = computed(() => {
  const colors = {
    Theory: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Case Study': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Student Work': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'AI Prompt': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Extended Thinking': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  }
  return colors[props.card.type || 'Theory']
})

function isImage(media: { mime?: string }): boolean {
  return media.mime?.startsWith('image/') || false
}

function isVideo(media: { mime?: string }): boolean {
  return media.mime?.startsWith('video/') || false
}

function isPdf(media: { mime?: string }): boolean {
  return media.mime === 'application/pdf' || false
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function copyPrompt() {
  if (!props.card.promptText) return

  try {
    await navigator.clipboard.writeText(props.card.promptText)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy prompt:', err)
  }
}

function handleClick() {
  if (props.clickable) {
    emit('click', props.card)
  }
}
</script>

<style scoped>
.knowledge-card {
  @apply print:break-inside-avoid;
}

.card-footer {
  @apply print:hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
