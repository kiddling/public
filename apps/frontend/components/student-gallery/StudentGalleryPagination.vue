<template>
  <div class="flex items-center justify-between">
    <!-- Info Text -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      显示 {{ startItem }}-{{ endItem }} / 共 {{ total }} 个作品
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous Button -->
      <button
        :disabled="modelValue === 1"
        @click="goToPage(modelValue - 1)"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        :class="{ 'cursor-not-allowed': modelValue === 1 }"
      >
        上一页
      </button>

      <!-- Page Numbers -->
      <div class="hidden md:flex items-center gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          class="w-10 h-10 rounded-lg border transition-colors"
          :class="
            page === modelValue
              ? 'bg-primary-500 text-white border-primary-500'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          "
        >
          {{ page }}
        </button>
      </div>

      <!-- Current Page (Mobile) -->
      <div class="md:hidden px-4 py-2 text-gray-700 dark:text-gray-300">
        {{ modelValue }} / {{ totalPages }}
      </div>

      <!-- Next Button -->
      <button
        :disabled="modelValue === totalPages"
        @click="goToPage(modelValue + 1)"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        :class="{ 'cursor-not-allowed': modelValue === totalPages }"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  totalPages: number
  total: number
  pageSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const startItem = computed(() => {
  return (props.modelValue - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.modelValue * props.pageSize, props.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, props.modelValue - halfVisible)
  let end = Math.min(props.totalPages, start + maxVisible - 1)
  
  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:modelValue', page)
  }
}
</script>
