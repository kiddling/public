<template>
  <div class="knowledge-card-detail min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="pending" class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="space-y-3">
          <div class="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <svg
        class="mx-auto h-16 w-16 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Card Not Found</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        The knowledge card you're looking for doesn't exist or has been removed.
      </p>
      <NuxtLink
        to="/knowledge-cards"
        class="bg-primary-600 hover:bg-primary-700 mt-6 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Knowledge Cards
      </NuxtLink>
    </div>

    <!-- Card Content -->
    <div v-else-if="card" class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="no-print mb-6 text-sm text-gray-600 dark:text-gray-400">
        <ol class="flex items-center space-x-2">
          <li>
            <NuxtLink to="/" class="hover:text-primary-600">Home</NuxtLink>
          </li>
          <li>/</li>
          <li>
            <NuxtLink to="/knowledge-cards" class="hover:text-primary-600"
              >Knowledge Cards</NuxtLink
            >
          </li>
          <li>/</li>
          <li class="max-w-xs truncate text-gray-900 dark:text-gray-100">{{ card.title }}</li>
        </ol>
      </nav>

      <!-- Header -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div class="flex-1">
            <div class="mb-3 flex items-center space-x-3">
              <span :class="['rounded-full px-3 py-1 text-sm font-semibold', typeColorClass]">
                {{ card.type }}
              </span>
              <div
                v-if="card.publishedAt || card.createdAt"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                <svg
                  class="mr-1 inline h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formatDate(card.publishedAt || card.createdAt) }}
              </div>
            </div>
            <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ card.title }}
            </h1>
            <div v-if="card.tags && card.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="no-print flex items-center space-x-2">
            <button
              v-if="card.qrLink"
              class="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Show QR code"
              @click="showQr = true"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                  clip-rule="evenodd"
                />
                <path
                  d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"
                />
              </svg>
            </button>
            <button
              class="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Share"
              @click="handleShare"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              class="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Print"
              @click="handlePrint"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Media Gallery -->
      <div
        v-if="card.media && card.media.length > 0"
        class="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Media</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div v-for="(media, index) in card.media" :key="index" class="group relative">
            <img
              v-if="media.mime?.startsWith('image/')"
              :src="media.url"
              :alt="media.alternativeText || `Media ${index + 1}`"
              class="h-64 w-full cursor-pointer rounded-lg object-cover transition-transform group-hover:scale-105"
              @click="openLightbox(index)"
            />
            <div
              v-else-if="media.mime?.startsWith('video/')"
              class="relative h-64 overflow-hidden rounded-lg bg-gray-900"
            >
              <video :src="media.url" controls class="h-full w-full object-contain">
                Your browser does not support the video tag.
              </video>
            </div>
            <a
              v-else-if="media.mime === 'application/pdf'"
              :href="media.url"
              target="_blank"
              class="block flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 transition-opacity hover:opacity-80 dark:from-red-900 dark:to-red-800"
            >
              <div class="text-center">
                <svg
                  class="mx-auto h-16 w-16 text-red-600 dark:text-red-300"
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
                <p class="mt-2 text-sm font-medium text-red-800 dark:text-red-200">View PDF</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Description / Content -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {{ contentTitle }}
        </h2>

        <!-- AI Prompt specific -->
        <div v-if="card.type === 'AI Prompt' && card.promptText" class="mb-6">
          <div class="relative">
            <pre
              class="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              >{{ card.promptText }}</pre
            >
            <button
              class="absolute right-2 top-2 rounded bg-white p-2 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
              :title="copied ? 'Copied!' : 'Copy prompt'"
              @click="copyPrompt"
            >
              <svg
                v-if="!copied"
                class="h-5 w-5 text-gray-600 dark:text-gray-300"
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
                class="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        <!-- Description -->
        <div v-if="card.description" class="prose prose-lg dark:prose-invert max-w-none">
          <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ card.description }}</p>
        </div>

        <div v-else class="italic text-gray-500 dark:text-gray-400">No description available.</div>
      </div>

      <!-- Related Content placeholder -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Related Content</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Related lessons and resources will be displayed here when implemented.
        </p>
      </div>

      <!-- Back Button -->
      <div class="no-print">
        <NuxtLink
          to="/knowledge-cards"
          class="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Knowledge Cards
        </NuxtLink>
      </div>
    </div>

    <!-- QR Code Modal -->
    <KnowledgeCardQrModal :show="showQr" :card="card" @close="showQr = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useKnowledgeCard } from '~/composables/useKnowledgeCards'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Fetch card data
const { data, pending, error } = useKnowledgeCard(slug.value)

const card = computed(() => data.value?.data?.[0] || data.value?.data || null)

// QR Modal
const showQr = ref(false)
const copied = ref(false)

const typeColorClass = computed(() => {
  if (!card.value?.type) return ''
  const colors = {
    Theory: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Case Study': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Student Work': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'AI Prompt': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Extended Thinking': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  }
  return colors[card.value.type] || ''
})

const contentTitle = computed(() => {
  if (!card.value?.type) return 'Content'
  const titles = {
    Theory: 'Theory',
    'Case Study': 'Case Study Details',
    'Student Work': 'Student Work Description',
    'AI Prompt': 'AI Prompt',
    'Extended Thinking': 'Extended Thinking',
  }
  return titles[card.value.type] || 'Content'
})

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function copyPrompt() {
  if (!card.value?.promptText) return

  try {
    await navigator.clipboard.writeText(card.value.promptText)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy prompt:', err)
  }
}

async function handleShare() {
  if (!card.value) return

  const url = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({
        title: card.value.title,
        text: card.value.description || '',
        url,
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
        copyToClipboard(url)
      }
    }
  } else {
    copyToClipboard(url)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => {
      alert('Link copied to clipboard!')
    },
    (err) => {
      console.error('Failed to copy:', err)
    }
  )
}

function handlePrint() {
  window.print()
}

function openLightbox(index: number) {
  // Placeholder for lightbox functionality
  console.log('Open lightbox for image', index)
  // Could implement a modal lightbox here
}

// Set page title
useHead(() => ({
  title: card.value ? `${card.value.title} - Knowledge Card` : 'Knowledge Card',
  meta: [
    {
      name: 'description',
      content: card.value?.description || 'Knowledge card detail',
    },
  ],
}))
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
