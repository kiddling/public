<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Download Center
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Access templates, worksheets, case materials and more with integrity checks
        </p>
      </div>

      <div v-if="offlineNotice" class="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div class="flex items-start gap-3">
          <span class="text-2xl">💡</span>
          <div class="flex-1">
            <h3 class="font-semibold text-blue-900 dark:text-blue-200">
              Offline Access
            </h3>
            <p class="mt-1 text-sm text-blue-800 dark:text-blue-300">
              Downloaded files are stored in your browser cache for offline access. Clear your browser cache to remove them.
            </p>
          </div>
          <button
            type="button"
            class="text-blue-800 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
            @click="offlineNotice = false"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside class="lg:col-span-1">
          <div class="sticky top-4 space-y-6">
            <div class="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>

              <div class="space-y-4">
                <div>
                  <label
                    for="search"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Search
                  </label>
                  <input
                    id="search"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search downloads..."
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    @input="debouncedSearch"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="category in categories"
                      :key="category.value"
                      class="flex items-center"
                    >
                      <input
                        v-model="selectedCategory"
                        type="radio"
                        :value="category.value"
                        class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {{ category.label }}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  v-if="selectedCategory || searchQuery"
                  type="button"
                  class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  @click="clearFilters"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <DownloadSummary ref="summaryRef" />
          </div>
        </aside>

        <main class="lg:col-span-3">
          <div v-if="loading" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>

          <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
            <p class="text-red-800 dark:text-red-400">
              {{ error.message }}
            </p>
            <button
              type="button"
              class="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              @click="refresh"
            >
              Try Again
            </button>
          </div>

          <div v-else-if="items.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-gray-800">
            <p class="text-gray-600 dark:text-gray-400">
              No downloads found. Try adjusting your filters.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Showing {{ items.length }} of {{ meta?.pagination.total || 0 }} items
              </p>
              <button
                v-if="selectedItems.size > 0"
                type="button"
                class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                @click="selectAll"
              >
                {{ selectedItems.size === items.length ? 'Deselect All' : 'Select All' }}
              </button>
            </div>

            <DownloadCard
              v-for="item in items"
              :key="item.id"
              :item="item"
              :selected="selectedItems.has(item.id)"
              @toggle-selection="toggleSelection"
            />

            <div v-if="meta && meta.pagination.pageCount > 1" class="mt-6 flex justify-center gap-2">
              <button
                type="button"
                class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="filters.page === 1 || loading"
                @click="changePage(filters.page! - 1)"
              >
                Previous
              </button>
              <span class="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300">
                Page {{ filters.page }} of {{ meta.pagination.pageCount }}
              </span>
              <button
                type="button"
                class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="filters.page === meta.pagination.pageCount || loading"
                @click="changePage(filters.page! + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <BatchBar
      :selected-count="selectedItems.size"
      :selected-ids="Array.from(selectedItems)"
      @clear-selection="clearSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDownloads } from '~/composables/useDownloads'
import DownloadCard from '~/components/downloads/DownloadCard.vue'
import DownloadSummary from '~/components/downloads/DownloadSummary.vue'
import BatchBar from '~/components/downloads/BatchBar.vue'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Template', label: 'Templates' },
  { value: 'Worksheet', label: 'Worksheets' },
  { value: 'Case', label: 'Cases' },
  { value: 'Other', label: 'Other' },
]

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedItems = ref(new Set<number>())
const offlineNotice = ref(true)
const summaryRef = ref<InstanceType<typeof DownloadSummary> | null>(null)

const { items, meta, loading, error, filters, fetchDownloads, updateFilters, refresh } = useDownloads({
  page: 1,
  pageSize: 25,
})

let debounceTimer: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    updateFilters({ search: searchQuery.value, page: 1 })
  }, 500)
}

watch(selectedCategory, (newCategory) => {
  updateFilters({ category: newCategory || undefined, page: 1 })
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  updateFilters({ search: undefined, category: undefined, page: 1 })
}

const toggleSelection = (id: number) => {
  if (selectedItems.value.has(id)) {
    selectedItems.value.delete(id)
  } else {
    selectedItems.value.add(id)
  }
}

const selectAll = () => {
  if (selectedItems.value.size === items.value.length) {
    selectedItems.value.clear()
  } else {
    items.value.forEach((item) => selectedItems.value.add(item.id))
  }
}

const clearSelection = () => {
  selectedItems.value.clear()
  summaryRef.value?.refreshHistory()
}

const changePage = (page: number) => {
  updateFilters({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await fetchDownloads()
})

useHead({
  title: 'Download Center',
  meta: [
    {
      name: 'description',
      content: 'Access templates, worksheets, case materials and more with integrity checks',
    },
  ],
})
</script>
