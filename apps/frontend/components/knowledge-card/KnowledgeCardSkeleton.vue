<template>
  <div
    class="knowledge-card-skeleton animate-pulse overflow-hidden rounded-lg border-l-4 border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900"
  >
    <!-- Header -->
    <div class="p-4 pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1 space-y-2">
          <div class="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="flex gap-2">
            <div class="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
        <div class="ml-3 h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>

    <!-- Media -->
    <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>

    <!-- Content -->
    <div class="space-y-2 p-4">
      <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between border-t border-gray-100 px-4 pb-4 pt-2 dark:border-gray-700"
    >
      <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="flex space-x-2">
        <div class="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton
</script>
