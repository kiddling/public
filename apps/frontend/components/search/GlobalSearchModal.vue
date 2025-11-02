<template>
  <Teleport to="body">
    <Transition name="global-search">
      <div
        v-if="searchStore.isOpen"
        class="global-search-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
      >
        <div class="global-search-overlay" @click="close"></div>
        <section ref="panelRef" class="global-search-panel" tabindex="-1">
          <header
            class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800"
          >
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Global Search
              </p>
              <h2
                id="global-search-title"
                class="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Search across all content
              </h2>
            </div>
            <button
              type="button"
              class="focus-visible:ring-primary-500 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
              aria-label="Close search"
              @click="close"
            >
              <Icon name="i-heroicons-x-mark-16-solid" class="h-4 w-4" />
            </button>
          </header>

          <div class="px-4 py-3">
            <SearchInput />
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Use ↑ ↓ to navigate, Enter to open, ESC to close
            </p>
          </div>

          <div
            class="max-h-[60vh] overflow-y-auto border-t border-gray-200 px-2 pb-4 pt-2 dark:border-gray-800"
          >
            <!-- Loading State -->
            <div v-if="searchStore.isLoading" class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="border-primary-200 border-t-primary-600 h-8 w-8 animate-spin rounded-full border-4"
                ></div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="searchStore.error" class="px-3 py-6 text-center">
              <Icon
                name="i-heroicons-exclamation-triangle-20-solid"
                class="mx-auto h-12 w-12 text-red-500"
              />
              <p class="mt-2 text-sm text-gray-900 dark:text-gray-100">Search Error</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ searchStore.error }}</p>
            </div>

            <!-- Results -->
            <SearchResults v-else-if="searchStore.hasResults" @select="handleSelect" />

            <!-- Empty State -->
            <div v-else-if="searchStore.showEmptyState" class="px-3 py-12 text-center">
              <Icon
                name="i-heroicons-magnifying-glass-20-solid"
                class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
              />
              <p class="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                No results found
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Try adjusting your search terms
              </p>
            </div>

            <!-- History and Recent Visits -->
            <SearchHistory v-else @select="handleHistorySelect" />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import SearchInput from './SearchInput.vue'
import SearchResults from './SearchResults.vue'
import SearchHistory from './SearchHistory.vue'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
const router = useRouter()
const panelRef = ref<HTMLElement | null>(null)

// Handle result selection
const handleSelect = (result: any) => {
  searchStore.addToRecentVisits({
    id: result.id,
    type: result.type,
    title: result.title,
    url: result.url,
  })

  close()

  router.push(result.url).catch(() => {
    /* navigation failure ignored */
  })
}

// Handle history selection
const handleHistorySelect = (query: string) => {
  searchStore.search(query)
}

// Close modal
const close = () => {
  searchStore.close()
}

// Watch for open state changes
watch(
  () => searchStore.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        panelRef.value?.focus()
      })
    }
  }
)

// Focus trap handler
const handleFocus = (event: FocusEvent) => {
  if (!searchStore.isOpen) {
    return
  }

  const panel = panelRef.value
  if (!panel) {
    return
  }

  if (panel.contains(event.target as Node)) {
    return
  }

  event.preventDefault()
  panel.focus()
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  document.addEventListener('focus', handleFocus, true)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }
  document.removeEventListener('focus', handleFocus, true)
})
</script>

<style scoped>
.global-search-container {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4rem 1rem 2rem;
}

.global-search-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
}

.global-search-panel {
  position: relative;
  z-index: 71;
  width: min(52rem, 100%);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 50px 100px -20px rgba(15, 23, 42, 0.35),
    0 30px 60px -30px rgba(15, 23, 42, 0.25);
  color: #111827;
  overflow: hidden;
}

:global(.dark) .global-search-panel {
  background: rgba(17, 24, 39, 0.92);
  color: #f3f4f6;
  box-shadow:
    0 40px 80px -20px rgba(2, 6, 23, 0.7),
    0 25px 50px -30px rgba(15, 23, 42, 0.6);
}

.global-search-enter-active,
.global-search-leave-active {
  transition: opacity 0.2s ease;
}

.global-search-enter-from,
.global-search-leave-to {
  opacity: 0;
}

.global-search-enter-active .global-search-panel,
.global-search-leave-active .global-search-panel {
  transition: transform 0.2s ease;
}

.global-search-enter-from .global-search-panel,
.global-search-leave-to .global-search-panel {
  transform: scale(0.95);
}
</style>
