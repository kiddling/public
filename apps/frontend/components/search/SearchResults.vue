<template>
  <div class="space-y-4">
    <!-- Suggestions -->
    <div v-if="suggestions.length > 0" class="px-2">
      <h3 class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Suggestions
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-primary-100 hover:text-primary-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
          @click="handleSuggestionClick(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Lessons -->
    <SearchResultGroup
      v-if="groups.lessons.length > 0"
      title="Lessons"
      icon="i-heroicons-book-open-20-solid"
      :results="groups.lessons"
      @select="handleSelect"
    />

    <!-- Knowledge Cards -->
    <SearchResultGroup
      v-if="groups.knowledgeCards.length > 0"
      title="Knowledge Cards"
      icon="i-heroicons-light-bulb-20-solid"
      :results="groups.knowledgeCards"
      @select="handleSelect"
    />

    <!-- Student Works -->
    <SearchResultGroup
      v-if="groups.studentWorks.length > 0"
      title="Student Works"
      icon="i-heroicons-academic-cap-20-solid"
      :results="groups.studentWorks"
      @select="handleSelect"
    />

    <!-- Resources -->
    <SearchResultGroup
      v-if="groups.resources.length > 0"
      title="Resources"
      icon="i-heroicons-folder-20-solid"
      :results="groups.resources"
      @select="handleSelect"
    />

    <!-- Pagination Info -->
    <div v-if="total > pageSize" class="border-t border-gray-200 px-4 py-3 text-center dark:border-gray-800">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Showing {{ results.length }} of {{ total }} results
        <span v-if="hasMoreResults">(scroll for more)</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SearchResultGroup from './SearchResultGroup.vue'
import { useSearchStore, type SearchResult } from '~/stores/search'

const emit = defineEmits<{
  (e: 'select', result: SearchResult): void
}>()

const searchStore = useSearchStore()

const results = computed(() => searchStore.results?.results || [])
const groups = computed(() => searchStore.results?.groups || {
  lessons: [],
  knowledgeCards: [],
  studentWorks: [],
  resources: [],
})
const suggestions = computed(() => searchStore.results?.suggestions || [])
const total = computed(() => searchStore.results?.total || 0)
const pageSize = computed(() => searchStore.results?.pageSize || 20)
const hasMoreResults = computed(() => results.value.length < total.value)

const handleSelect = (result: SearchResult) => {
  emit('select', result)
}

const handleSuggestionClick = (suggestion: string) => {
  searchStore.search(suggestion)
}
</script>
