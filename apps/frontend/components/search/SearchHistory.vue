<template>
  <div class="space-y-4 px-2">
    <!-- Recent Visits -->
    <div v-if="searchStore.hasRecentVisits">
      <div class="mb-2 flex items-center justify-between px-2">
        <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Recent Visits
        </h3>
        <button
          type="button"
          class="text-[10px] font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          @click="clearRecentVisits"
        >
          Clear
        </button>
      </div>
      <ul class="space-y-1 px-1">
        <li
          v-for="visit in searchStore.recentVisits"
          :key="`${visit.type}-${visit.id}`"
          class="group rounded-xl transition hover:bg-primary-50 dark:hover:bg-primary-500/10"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2 text-left"
            @click="handleVisitClick(visit)"
          >
            <Icon
              :name="getTypeIcon(visit.type)"
              class="h-4 w-4 text-gray-400 dark:text-gray-500"
            />
            <span class="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
              {{ visit.title }}
            </span>
            <Icon
              name="i-heroicons-arrow-right-20-solid"
              class="h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100 dark:text-gray-500"
            />
          </button>
        </li>
      </ul>
    </div>

    <!-- Search History -->
    <div v-if="searchStore.hasHistory">
      <div class="mb-2 flex items-center justify-between px-2">
        <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Recent Searches
        </h3>
        <button
          type="button"
          class="text-[10px] font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          @click="clearHistory"
        >
          Clear
        </button>
      </div>
      <ul class="space-y-1 px-1">
        <li
          v-for="item in searchStore.searchHistory"
          :key="item.query"
          class="group rounded-xl transition hover:bg-primary-50 dark:hover:bg-primary-500/10"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2 text-left"
            @click="handleHistoryClick(item.query)"
          >
            <Icon
              name="i-heroicons-clock-20-solid"
              class="h-4 w-4 text-gray-400 dark:text-gray-500"
            />
            <span class="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
              {{ item.query }}
            </span>
            <Icon
              name="i-heroicons-arrow-right-20-solid"
              class="h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100 dark:text-gray-500"
            />
          </button>
        </li>
      </ul>
    </div>

    <!-- Empty State -->
    <div v-if="!searchStore.hasHistory && !searchStore.hasRecentVisits" class="px-3 py-12 text-center">
      <Icon
        name="i-heroicons-magnifying-glass-20-solid"
        class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
      />
      <p class="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        Start Searching
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Search across lessons, knowledge cards, student works, and resources
      </p>
    </div>

    <!-- Pinned Shortcuts -->
    <div class="px-2">
      <h3 class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Quick Actions
      </h3>
      <div class="grid grid-cols-2 gap-2 px-1">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
          @click="handleShortcut('lesson')"
        >
          <Icon name="i-heroicons-book-open-20-solid" class="h-4 w-4" />
          <span>Browse Lessons</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
          @click="handleShortcut('knowledge-card')"
        >
          <Icon name="i-heroicons-light-bulb-20-solid" class="h-4 w-4" />
          <span>Knowledge Cards</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
          @click="handleShortcut('student-work')"
        >
          <Icon name="i-heroicons-academic-cap-20-solid" class="h-4 w-4" />
          <span>Student Works</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
          @click="handleShortcut('resource')"
        >
          <Icon name="i-heroicons-folder-20-solid" class="h-4 w-4" />
          <span>Resources</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore, type RecentVisit } from '~/stores/search'

const emit = defineEmits<{
  (e: 'select', query: string): void
}>()

const searchStore = useSearchStore()
const router = useRouter()

const handleHistoryClick = (query: string) => {
  emit('select', query)
}

const handleVisitClick = (visit: RecentVisit) => {
  searchStore.close()
  router.push(visit.url)
}

const clearHistory = () => {
  searchStore.clearHistory()
}

const clearRecentVisits = () => {
  searchStore.clearRecentVisits()
}

const handleShortcut = (type: string) => {
  searchStore.close()
  // Navigate to listing pages based on type
  switch (type) {
    case 'lesson':
      router.push('/lessons')
      break
    case 'knowledge-card':
      router.push('/knowledge-cards')
      break
    case 'student-work':
      router.push('/student-works')
      break
    case 'resource':
      router.push('/resources')
      break
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'lesson':
      return 'i-heroicons-book-open-20-solid'
    case 'knowledge-card':
      return 'i-heroicons-light-bulb-20-solid'
    case 'student-work':
      return 'i-heroicons-academic-cap-20-solid'
    case 'resource':
      return 'i-heroicons-folder-20-solid'
    default:
      return 'i-heroicons-document-20-solid'
  }
}
</script>
