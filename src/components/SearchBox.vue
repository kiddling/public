<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle
          cx="11"
          cy="11"
          r="8"
        />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lessons..."
        class="search-input"
        aria-label="Search lessons"
        aria-autocomplete="list"
        :aria-expanded="showResults"
        role="combobox"
        @input="handleSearch"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectHighlightedResult"
        @keydown.escape="clearSearch"
      >
      <button
        v-if="searchQuery"
        class="clear-button"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
          />
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          />
        </svg>
      </button>
    </div>

    <ul
      v-if="showResults"
      class="search-results"
      role="listbox"
    >
      <li
        v-for="(result, index) in searchResults"
        :key="result.id"
        class="search-result-item"
        :class="{ highlighted: index === highlightedIndex }"
        role="option"
        :aria-selected="index === highlightedIndex"
        @click="selectResult(result)"
        @mouseenter="highlightedIndex = index"
      >
        <span
          class="result-code"
          :style="{ color: result.color }"
        >
          {{ result.code }}
        </span>
        <span class="result-title">{{ result.title }}</span>
        <span class="result-meta">{{ result.partName }}</span>
      </li>
      <li
        v-if="searchResults.length === 0"
        class="no-results"
      >
        No lessons found
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAllLessons } from '@/services/strapiService'

const emit = defineEmits(['select'])

const searchQuery = ref('')
const highlightedIndex = ref(0)
const allLessons = getAllLessons()

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase()
  return allLessons
    .filter(lesson => 
      lesson.title.toLowerCase().includes(query) ||
      lesson.code.toLowerCase().includes(query) ||
      lesson.partName.toLowerCase().includes(query)
    )
    .slice(0, 5)
})

const showResults = computed(() => {
  return searchQuery.value.trim().length > 0
})

function handleSearch() {
  highlightedIndex.value = 0
}

function navigateResults(direction) {
  if (searchResults.value.length === 0) return

  highlightedIndex.value += direction
  if (highlightedIndex.value < 0) {
    highlightedIndex.value = searchResults.value.length - 1
  } else if (highlightedIndex.value >= searchResults.value.length) {
    highlightedIndex.value = 0
  }
}

function selectHighlightedResult() {
  if (searchResults.value.length > 0 && searchResults.value[highlightedIndex.value]) {
    selectResult(searchResults.value[highlightedIndex.value])
  }
}

function selectResult(result) {
  emit('select', result)
  clearSearch()
}

function clearSearch() {
  searchQuery.value = ''
  highlightedIndex.value = 0
}
</script>

<style scoped>
.search-box {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: var(--color-background);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-loop-1);
}

.clear-button {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--color-text-muted);
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: var(--color-border);
}

.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover,
.search-result-item.highlighted {
  background-color: var(--color-surface);
}

.result-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

.result-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.result-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>
