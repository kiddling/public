<template>
  <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div>
        <label for="discipline-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Discipline
        </label>
        <select
          id="discipline-filter"
          v-model="localFilters.discipline"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="loading"
          @change="emitUpdate"
        >
          <option :value="undefined">All Disciplines</option>
          <option value="环艺">环艺 (Environmental Design)</option>
          <option value="产品">产品 (Product Design)</option>
          <option value="视传">视传 (Visual Communication)</option>
          <option value="数媒">数媒 (Digital Media)</option>
          <option value="公艺">公艺 (Public Art)</option>
        </select>
      </div>

      <div>
        <label for="loop-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Loop
        </label>
        <select
          id="loop-filter"
          v-model="localFilters.loop"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="loading"
          @change="emitUpdate"
        >
          <option :value="undefined">All Loops</option>
          <option value="Loop 1">Loop 1</option>
          <option value="Loop 2">Loop 2</option>
          <option value="Loop 3">Loop 3</option>
        </select>
      </div>

      <div>
        <label for="grade-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Grade
        </label>
        <input
          id="grade-filter"
          v-model="localFilters.grade"
          type="text"
          placeholder="e.g., 2023"
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="loading"
          @input="handleDebounceInput"
        />
      </div>

      <div>
        <label for="search-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          id="search-filter"
          v-model="localFilters.search"
          type="text"
          placeholder="Student name, project..."
          class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="loading"
          @input="handleDebounceInput"
        />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <span v-if="activeFilterCount > 0">
          {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
        </span>
      </div>
      <button
        v-if="activeFilterCount > 0"
        class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none focus:underline"
        :disabled="loading"
        @click="clearFilters"
      >
        Clear all filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StudentWorksFilterParams } from '~/composables/useStudentWorks'

const props = defineProps<{
  filters: StudentWorksFilterParams
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: StudentWorksFilterParams): void
}>()

const localFilters = ref<StudentWorksFilterParams>({ ...props.filters })
let debounceTimer: NodeJS.Timeout | null = null

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { deep: true }
)

const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.discipline) count++
  if (localFilters.value.loop) count++
  if (localFilters.value.grade) count++
  if (localFilters.value.search) count++
  return count
})

function emitUpdate() {
  emit('update:filters', { ...localFilters.value })
}

function handleDebounceInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    emitUpdate()
  }, 300)
}

function clearFilters() {
  localFilters.value = {
    discipline: undefined,
    loop: undefined,
    grade: undefined,
    search: undefined,
  }
  emitUpdate()
}
</script>
