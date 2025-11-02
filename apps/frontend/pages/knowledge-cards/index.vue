<template>
  <div class="knowledge-cards-page min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Knowledge Cards</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explore curated educational content across different formats and topics
        </p>
      </div>

      <!-- View Toggle -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-2 rounded-lg bg-white p-1 shadow-sm dark:bg-gray-800">
          <button
            :class="[
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="viewMode = 'grid'"
          >
            <span class="flex items-center space-x-2">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Grid</span>
            </span>
          </button>
          <button
            :class="[
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="viewMode = 'list'"
          >
            <span class="flex items-center space-x-2">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>List</span>
            </span>
          </button>
        </div>

        <!-- Print Button -->
        <button
          class="no-print focus:ring-primary-500 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="handlePrint"
        >
          <span class="flex items-center space-x-2">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print</span>
          </span>
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <KnowledgeCardFilters
          v-model="filters"
          v-model:search="searchQuery"
          :available-tags="availableTags"
          :result-count="displayCards.length"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- Cards Display -->
      <KnowledgeCardsGrid
        v-if="viewMode === 'grid'"
        :cards="displayCards"
        :loading="pending"
        :has-more="hasMore"
        @card-click="navigateToCard"
        @show-qr="showQrModal"
        @share="shareCard"
        @load-more="loadMore"
      >
        <template #empty-action>
          <button
            class="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
            @click="clearAllFilters"
          >
            Clear All Filters
          </button>
        </template>
      </KnowledgeCardsGrid>

      <KnowledgeCardsList
        v-else
        :cards="displayCards"
        :loading="pending"
        :has-more="hasMore"
        @card-click="navigateToCard"
        @show-qr="showQrModal"
        @share="shareCard"
        @load-more="loadMore"
      >
        <template #empty-action>
          <button
            class="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
            @click="clearAllFilters"
          >
            Clear All Filters
          </button>
        </template>
      </KnowledgeCardsList>
    </div>

    <!-- QR Code Modal -->
    <KnowledgeCardQrModal :show="showQr" :card="selectedCard" @close="closeQrModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useKnowledgeCards } from '~/composables/useKnowledgeCards'
import type { KnowledgeCard, KnowledgeCardType } from '~/types/cms'

const router = useRouter()
const route = useRoute()

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Filters
const filters = ref({
  type: null as KnowledgeCardType | null,
  tags: [] as string[],
  loop: null as string | null,
  difficulty: null as string | null,
})

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 12

// Fetch cards with filters
const queryFilters = computed(() => {
  const f: any = {}

  if (filters.value.type) {
    f.type = { $eq: filters.value.type }
  }

  if (filters.value.tags.length > 0) {
    f.tags = { $containsi: filters.value.tags }
  }

  if (searchQuery.value) {
    f.$or = [
      { title: { $containsi: searchQuery.value } },
      { description: { $containsi: searchQuery.value } },
      { promptText: { $containsi: searchQuery.value } },
    ]
  }

  return f
})

const { data, pending, error, refresh } = useKnowledgeCards({
  filters: queryFilters,
  pagination: {
    page: currentPage.value,
    pageSize,
  },
  sort: ['createdAt:desc'],
})

// Extract available tags from all cards
const availableTags = computed(() => {
  if (!data.value?.data) return []
  const tags = new Set<string>()
  data.value.data.forEach((card: any) => {
    if (card.tags) {
      card.tags.forEach((tag: string) => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
})

// Display cards
const displayCards = computed(() => {
  return data.value?.data || []
})

const hasMore = computed(() => {
  const pagination = data.value?.meta?.pagination
  if (!pagination) return false
  return pagination.page < pagination.pageCount
})

// QR Modal
const showQr = ref(false)
const selectedCard = ref<KnowledgeCard | null>(null)

function showQrModal(card: KnowledgeCard) {
  selectedCard.value = card
  showQr.value = true
}

function closeQrModal() {
  showQr.value = false
  selectedCard.value = null
}

// Navigation
function navigateToCard(card: KnowledgeCard) {
  router.push(`/knowledge-cards/${card.slug || card.id}`)
}

// Share
async function shareCard(card: KnowledgeCard) {
  const url = `${window.location.origin}/knowledge-cards/${card.slug || card.id}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: card.title,
        text: card.description || '',
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

// Filter handling
function handleFilterChange() {
  currentPage.value = 1
  updateUrlParams()
  refresh()
}

function clearAllFilters() {
  filters.value = {
    type: null,
    tags: [],
    loop: null,
    difficulty: null,
  }
  searchQuery.value = ''
  handleFilterChange()
}

function loadMore() {
  currentPage.value++
  refresh()
}

// URL params synchronization
function updateUrlParams() {
  const query: any = {}

  if (filters.value.type) query.type = filters.value.type
  if (filters.value.tags.length > 0) query.tags = filters.value.tags.join(',')
  if (filters.value.loop) query.loop = filters.value.loop
  if (filters.value.difficulty) query.difficulty = filters.value.difficulty
  if (searchQuery.value) query.search = searchQuery.value
  if (viewMode.value !== 'grid') query.view = viewMode.value

  router.replace({ query })
}

function loadFromUrlParams() {
  if (route.query.type) {
    filters.value.type = route.query.type as KnowledgeCardType
  }
  if (route.query.tags) {
    filters.value.tags = (route.query.tags as string).split(',')
  }
  if (route.query.loop) {
    filters.value.loop = route.query.loop as string
  }
  if (route.query.difficulty) {
    filters.value.difficulty = route.query.difficulty as string
  }
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  if (route.query.view) {
    viewMode.value = route.query.view as 'grid' | 'list'
  }
}

// Print
function handlePrint() {
  window.print()
}

// Initialize from URL params
loadFromUrlParams()

// Watch for changes
watch(viewMode, () => {
  updateUrlParams()
})

// Set page title
useHead({
  title: 'Knowledge Cards',
  meta: [
    {
      name: 'description',
      content: 'Explore curated educational content across different formats and topics',
    },
  ],
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
