<template>
  <div class="px-2">
    <div class="mb-2 flex items-center gap-2 px-2">
      <Icon :name="icon" class="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {{ title }} ({{ results.length }})
      </h3>
    </div>
    <ul role="listbox" class="space-y-1 px-1">
      <SearchResultItem
        v-for="(result, index) in results"
        :key="`${result.type}-${result.id}`"
        :result="result"
        :index="index"
        @select="handleSelect"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import SearchResultItem from './SearchResultItem.vue'
import type { SearchResult } from '~/stores/search'

defineProps<{
  title: string
  icon: string
  results: SearchResult[]
}>()

const emit = defineEmits<{
  (e: 'select', result: SearchResult): void
}>()

const handleSelect = (result: SearchResult) => {
  emit('select', result)
}
</script>
