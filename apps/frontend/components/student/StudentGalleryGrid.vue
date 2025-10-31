<template>
  <div class="py-4">
    <div v-if="loading && works.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="`skeleton-${i}`" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[3/4]"></div>
        <div class="mt-3 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="works.length > 0"
      class="masonry-grid"
    >
      <StudentGalleryCard
        v-for="work in works"
        :key="work.id"
        :work="work"
        @click="emit('open-lightbox', work)"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <svg
        class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No student works found
      </h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md">
        Try adjusting your filters or search terms to find what you're looking for.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentWork } from '~/types/cms'

defineProps<{
  works: StudentWork[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-lightbox', work: StudentWork): void
}>()
</script>

<style scoped>
.masonry-grid {
  column-count: 1;
  column-gap: 1.5rem;
}

@media (min-width: 640px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .masonry-grid {
    column-count: 4;
  }
}

.masonry-grid > * {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}
</style>
