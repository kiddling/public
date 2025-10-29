<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">筛选资源</h2>
    
    <div class="space-y-4">
      <!-- Search -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          关键词搜索
        </label>
        <input
          id="search"
          v-model="localFilters.search"
          type="text"
          placeholder="搜索标题、描述或标签..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @input="debouncedUpdate"
        >
      </div>

      <!-- Category Filter -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          类别
        </label>
        <select
          id="category"
          v-model="localFilters.category"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateFilters"
        >
          <option value="all">全部类别</option>
          <option value="video-tutorials">视频教程</option>
          <option value="tool-links">工具链接</option>
          <option value="case-databases">案例数据库</option>
          <option value="readings">阅读材料</option>
          <option value="pbr-libraries">PBR资源库</option>
        </select>
      </div>

      <!-- Medium Filter -->
      <div>
        <label for="medium" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          媒介类型
        </label>
        <select
          id="medium"
          v-model="localFilters.medium"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateFilters"
        >
          <option value="all">全部类型</option>
          <option value="video">视频</option>
          <option value="link">链接</option>
          <option value="pdf">PDF</option>
          <option value="document">文档</option>
          <option value="interactive">互动</option>
          <option value="download">下载</option>
        </select>
      </div>

      <!-- Discipline Filter -->
      <div>
        <label for="discipline" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          学科领域
        </label>
        <select
          id="discipline"
          v-model="localFilters.discipline"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="updateFilters"
        >
          <option value="all">全部学科</option>
          <option v-for="discipline in availableDisciplines" :key="discipline" :value="discipline">
            {{ discipline }}
          </option>
        </select>
      </div>

      <!-- Reset Button -->
      <button
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="resetFilters"
      >
        重置筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResourceFilters } from '~/types/resource'

const props = defineProps<{
  filters: ResourceFilters
  availableDisciplines?: string[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: ResourceFilters]
}>()

const localFilters = ref<ResourceFilters>({ ...props.filters })

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const updateFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

let debounceTimeout: NodeJS.Timeout | null = null

const debouncedUpdate = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    updateFilters()
  }, 300)
}

const resetFilters = () => {
  localFilters.value = {
    category: 'all',
    discipline: 'all',
    medium: 'all',
    search: '',
  }
  updateFilters()
}
</script>
