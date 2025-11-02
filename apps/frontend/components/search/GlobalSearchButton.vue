<template>
  <div>
    <!-- Desktop Button -->
    <button
      type="button"
      class="hover:border-primary-300 hover:text-primary-600 focus-visible:ring-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-200 hidden items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:inline-flex dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300 dark:focus-visible:ring-offset-gray-900"
      aria-label="Open global search"
      @click="openSearch"
    >
      <Icon
        name="i-heroicons-magnifying-glass-20-solid"
        class="h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
      <span class="hidden lg:inline">Search</span>
      <span class="lg:hidden">Search</span>
      <span
        class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      >
        <kbd class="font-semibold">{{ commandKey }}</kbd>
        <span class="font-semibold">K</span>
      </span>
    </button>

    <!-- Mobile Button -->
    <button
      type="button"
      class="hover:border-primary-300 hover:text-primary-600 focus-visible:ring-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-200 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:hidden dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300 dark:focus-visible:ring-offset-gray-900"
      aria-label="Open global search"
      @click="openSearch"
    >
      <Icon name="i-heroicons-magnifying-glass-20-solid" class="h-5 w-5" aria-hidden="true" />
    </button>

    <!-- Modal -->
    <GlobalSearchModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEventListener } from '@vueuse/core'
import GlobalSearchModal from './GlobalSearchModal.vue'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
const isMac = ref(false)

const commandKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

const openSearch = () => {
  searchStore.open()
}

onMounted(() => {
  if (import.meta.client) {
    const platform = navigator.platform || navigator.userAgent
    isMac.value = /mac|iphone|ipad|ipod/i.test(platform)
  }
})

// Global keyboard shortcut (Cmd/Ctrl + K)
useEventListener(
  () => (import.meta.client ? window : undefined),
  'keydown',
  (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      openSearch()
    } else if (event.key === 'Escape' && searchStore.isOpen) {
      event.preventDefault()
      searchStore.close()
    }
  }
)
</script>
