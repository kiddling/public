<template>
  <div class="knowledge-card-skeleton rounded-lg shadow-md overflow-hidden border-l-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 animate-pulse">
    <!-- Header -->
    <div class="p-4 pb-3">
      <div class="flex justify-between items-start">
        <div class="flex-1 space-y-2">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="flex gap-2">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
        <div class="ml-3 h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>

    <!-- Media -->
    <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>

    <!-- Content -->
    <div class="p-4 space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>

    <!-- Footer -->
    <div class="px-4 pb-4 pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      <div class="flex space-x-2">
        <div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton
</script>
