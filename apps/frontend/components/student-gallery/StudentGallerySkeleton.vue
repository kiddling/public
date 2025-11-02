<template>
  <div>
    <!-- Filters Skeleton -->
    <div class="mb-8 animate-pulse space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
      <div class="h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>

    <!-- Gallery Grid Skeleton -->
    <div class="masonry-grid">
      <div v-for="i in 12" :key="i" class="animate-pulse">
        <div class="overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
          <div
            class="w-full bg-gray-300 dark:bg-gray-600"
            :style="{ height: `${getRandomHeight()}px` }"
          ></div>
          <div class="space-y-2 p-4">
            <div class="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div class="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function getRandomHeight(): number {
  const heights = [200, 250, 300, 350, 400]
  return heights[Math.floor(Math.random() * heights.length)]
}
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
