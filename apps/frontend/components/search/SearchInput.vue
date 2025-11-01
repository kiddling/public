<template>
  <div class="relative">
    <Icon
      name="i-heroicons-magnifying-glass-20-solid"
      class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
      aria-hidden="true"
    />
    <input
      ref="inputRef"
      v-model="searchStore.query"
      type="search"
      class="w-full rounded-xl border border-gray-200 bg-white/90 py-3 pl-11 pr-3 text-base text-gray-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-primary-400 dark:focus:ring-primary-500/30"
      placeholder="Search lessons, cards, works, resources..."
      role="combobox"
      aria-label="Global search input"
      aria-autocomplete="list"
      :aria-expanded="String(hasResults)"
      :aria-activedescendant="activeOptionId"
      @input="handleInput"
      @keydown.down.prevent="moveSelection(1)"
      @keydown.up.prevent="moveSelection(-1)"
      @keydown.enter.prevent="selectActive"
      @keydown.escape.prevent="handleEscape"
    />
    <button
      v-if="searchStore.query"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      aria-label="Clear search"
      @click="clearSearch"
    >
      <Icon name="i-heroicons-x-mark-16-solid" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
const inputRef = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const hasResults = computed(() => searchStore.hasResults)

const activeOptionId = computed(() => {
  if (!hasResults.value) {
    return undefined
  }
  return `search-result-${activeIndex.value}`
})

// Handle input changes
const handleInput = () => {
  activeIndex.value = 0
  searchStore.search(searchStore.query)
}

// Clear search
const clearSearch = () => {
  searchStore.reset()
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Handle escape key
const handleEscape = () => {
  if (searchStore.query) {
    clearSearch()
  } else {
    searchStore.close()
  }
}

// Move selection with arrow keys
const moveSelection = (direction: 1 | -1) => {
  if (!hasResults.value || !searchStore.results) {
    return
  }

  const totalResults = searchStore.results.results.length
  if (totalResults === 0) {
    return
  }

  activeIndex.value = (activeIndex.value + direction + totalResults) % totalResults

  nextTick(() => {
    const activeElement = document.querySelector(`#${activeOptionId.value}`)
    activeElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

// Select active result
const selectActive = () => {
  if (!hasResults.value || !searchStore.results) {
    return
  }

  const activeResult = searchStore.results.results[activeIndex.value]
  if (activeResult) {
    const event = new CustomEvent('select-result', { detail: activeResult })
    document.dispatchEvent(event)
  }
}

// Expose active index for parent components
defineExpose({
  activeIndex,
})

// Focus input when modal opens
watch(() => searchStore.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

onMounted(() => {
  if (searchStore.isOpen) {
    inputRef.value?.focus()
  }
})
</script>
