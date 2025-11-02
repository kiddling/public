<template>
  <div class="knowledge-card-filters space-y-4">
    <!-- Search -->
    <div class="search-input">
      <label for="card-search" class="sr-only">Search cards</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="card-search"
          v-model="localSearch"
          type="search"
          placeholder="Search by title or content..."
          class="focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          @input="handleSearchInput"
        />
        <button
          v-if="localSearch"
          class="absolute inset-y-0 right-0 flex items-center pr-3"
          @click="clearSearch"
        >
          <svg
            class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar flex flex-wrap gap-4">
      <!-- Type Filter -->
      <div class="filter-group min-w-[200px] flex-1">
        <label
          for="type-filter"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Card Type
        </label>
        <select
          id="type-filter"
          v-model="localFilters.type"
          class="focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          @change="handleFilterChange"
        >
          <option :value="null">All Types</option>
          <option v-for="type in cardTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <!-- Tags Filter -->
      <div class="filter-group min-w-[200px] flex-1">
        <label
          for="tags-filter"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags
        </label>
        <div class="relative">
          <button
            id="tags-filter"
            type="button"
            class="focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @click="showTagsDropdown = !showTagsDropdown"
          >
            <span v-if="!localFilters.tags.length" class="text-gray-500">Select tags...</span>
            <span v-else class="flex flex-wrap gap-1">
              <span
                v-for="tag in localFilters.tags.slice(0, 2)"
                :key="tag"
                class="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
              >
                {{ tag }}
              </span>
              <span v-if="localFilters.tags.length > 2" class="text-xs text-gray-500">
                +{{ localFilters.tags.length - 2 }} more
              </span>
            </span>
          </button>
          <div
            v-if="showTagsDropdown"
            v-click-outside="() => (showTagsDropdown = false)"
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
          >
            <div class="space-y-1 p-2">
              <label
                v-for="tag in availableTags"
                :key="tag"
                class="flex cursor-pointer items-center rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <input
                  v-model="localFilters.tags"
                  type="checkbox"
                  :value="tag"
                  class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                  @change="handleFilterChange"
                />
                <span class="ml-2 text-sm text-gray-900 dark:text-gray-100">{{ tag }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Loop Filter -->
      <div v-if="showLoopFilter" class="filter-group min-w-[150px] flex-1">
        <label
          for="loop-filter"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Loop
        </label>
        <select
          id="loop-filter"
          v-model="localFilters.loop"
          class="focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          @change="handleFilterChange"
        >
          <option :value="null">All Loops</option>
          <option value="1">Loop 1</option>
          <option value="2">Loop 2</option>
          <option value="3">Loop 3</option>
        </select>
      </div>

      <!-- Difficulty Filter -->
      <div v-if="showDifficultyFilter" class="filter-group min-w-[150px] flex-1">
        <label
          for="difficulty-filter"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Difficulty
        </label>
        <select
          id="difficulty-filter"
          v-model="localFilters.difficulty"
          class="focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          @change="handleFilterChange"
        >
          <option :value="null">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <!-- Clear Filters Button -->
      <div class="filter-group flex items-end">
        <button
          v-if="hasActiveFilters"
          class="focus:ring-primary-500 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div
      v-if="hasActiveFilters || localSearch"
      class="active-filters flex flex-wrap items-center gap-2 text-sm"
    >
      <span class="text-gray-600 dark:text-gray-400">Active filters:</span>

      <span
        v-if="localSearch"
        class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      >
        Search: "{{ localSearch }}"
        <button class="ml-1 hover:text-blue-600" @click="clearSearch">×</button>
      </span>

      <span
        v-if="localFilters.type"
        class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      >
        Type: {{ localFilters.type }}
        <button
          class="ml-1 hover:text-purple-600"
          @click="
            localFilters.type = null
            handleFilterChange()
          "
        >
          ×
        </button>
      </span>

      <span
        v-for="tag in localFilters.tags"
        :key="tag"
        class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        Tag: {{ tag }}
        <button class="ml-1 hover:text-green-600" @click="removeTag(tag)">×</button>
      </span>

      <span
        v-if="localFilters.loop"
        class="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      >
        Loop: {{ localFilters.loop }}
        <button
          class="ml-1 hover:text-orange-600"
          @click="
            localFilters.loop = null
            handleFilterChange()
          "
        >
          ×
        </button>
      </span>

      <span
        v-if="localFilters.difficulty"
        class="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
      >
        Difficulty: {{ localFilters.difficulty }}
        <button
          class="ml-1 hover:text-pink-600"
          @click="
            localFilters.difficulty = null
            handleFilterChange()
          "
        >
          ×
        </button>
      </span>

      <span v-if="resultCount !== null" class="ml-2 text-gray-500 dark:text-gray-400">
        ({{ resultCount }} {{ resultCount === 1 ? 'result' : 'results' }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { KnowledgeCardType } from '~/types/cms'

interface Filters {
  type: KnowledgeCardType | null
  tags: string[]
  loop: string | null
  difficulty: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue?: Filters
    search?: string
    availableTags?: string[]
    cardTypes?: KnowledgeCardType[]
    showLoopFilter?: boolean
    showDifficultyFilter?: boolean
    resultCount?: number | null
    debounceMs?: number
  }>(),
  {
    modelValue: () => ({ type: null, tags: [], loop: null, difficulty: null }),
    search: '',
    availableTags: () => [],
    cardTypes: () => ['Theory', 'Case Study', 'Student Work', 'AI Prompt', 'Extended Thinking'],
    showLoopFilter: false,
    showDifficultyFilter: false,
    resultCount: null,
    debounceMs: 300,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filters): void
  (e: 'update:search', value: string): void
  (e: 'filter-change'): void
}>()

const localSearch = ref(props.search)
const localFilters = reactive<Filters>({ ...props.modelValue })
const showTagsDropdown = ref(false)
let searchTimeout: NodeJS.Timeout | null = null

const hasActiveFilters = computed(() => {
  return (
    localFilters.type !== null ||
    localFilters.tags.length > 0 ||
    localFilters.loop !== null ||
    localFilters.difficulty !== null
  )
})

// Custom directive for click outside
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    Object.assign(localFilters, newValue)
  },
  { deep: true }
)

// Watch for external changes to search
watch(
  () => props.search,
  (newValue) => {
    localSearch.value = newValue
  }
)

function handleSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('update:search', localSearch.value)
    emit('filter-change')
  }, props.debounceMs)
}

function clearSearch() {
  localSearch.value = ''
  emit('update:search', '')
  emit('filter-change')
}

function handleFilterChange() {
  emit('update:modelValue', { ...localFilters })
  emit('filter-change')
}

function removeTag(tag: string) {
  const index = localFilters.tags.indexOf(tag)
  if (index > -1) {
    localFilters.tags.splice(index, 1)
    handleFilterChange()
  }
}

function clearFilters() {
  localFilters.type = null
  localFilters.tags = []
  localFilters.loop = null
  localFilters.difficulty = null
  handleFilterChange()
}
</script>
