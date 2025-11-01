<script setup lang="ts">
import type { ResourceCategory, ResourceDiscipline, ResourceMediaType } from '~/types/cms'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  categories: ResourceCategory[]
  disciplines: ResourceDiscipline[]
  mediaTypes: ResourceMediaType[]
}>()

const emit = defineEmits<{
  'update:category': [value: ResourceCategory | null]
  'update:discipline': [value: ResourceDiscipline[]]
  'update:mediaType': [value: ResourceMediaType[]]
  'update:accessibleOnly': [value: boolean]
  'update:search': [value: string]
}>()

const selectedCategory = ref<ResourceCategory | null>(null)
const selectedDisciplines = ref<ResourceDiscipline[]>([])
const selectedMediaTypes = ref<ResourceMediaType[]>([])
const accessibleOnly = ref(false)
const searchQuery = ref('')

watch(selectedCategory, (value) => emit('update:category', value))
watch(selectedDisciplines, (value) => emit('update:discipline', value))
watch(selectedMediaTypes, (value) => emit('update:mediaType', value))
watch(accessibleOnly, (value) => emit('update:accessibleOnly', value))

const debouncedSearch = useDebounceFn((value: string) => {
  emit('update:search', value)
}, 300)

watch(searchQuery, (value) => debouncedSearch(value))

const clearFilters = () => {
  selectedCategory.value = null
  selectedDisciplines.value = []
  selectedMediaTypes.value = []
  accessibleOnly.value = false
  searchQuery.value = ''
}

const toggleDiscipline = (discipline: ResourceDiscipline) => {
  const index = selectedDisciplines.value.indexOf(discipline)
  if (index > -1) {
    selectedDisciplines.value.splice(index, 1)
  } else {
    selectedDisciplines.value.push(discipline)
  }
}

const toggleMediaType = (mediaType: ResourceMediaType) => {
  const index = selectedMediaTypes.value.indexOf(mediaType)
  if (index > -1) {
    selectedMediaTypes.value.splice(index, 1)
  } else {
    selectedMediaTypes.value.push(mediaType)
  }
}

const hasActiveFilters = computed(() => {
  return (
    selectedCategory.value !== null ||
    selectedDisciplines.value.length > 0 ||
    selectedMediaTypes.value.length > 0 ||
    accessibleOnly.value ||
    searchQuery.value.trim().length > 0
  )
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">筛选</h2>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        aria-label="Clear all filters"
      >
        清除所有
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <label for="search-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          关键词搜索
        </label>
        <input
          id="search-input"
          v-model="searchQuery"
          type="text"
          placeholder="搜索标题或描述..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label for="category-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分类
        </label>
        <select
          id="category-select"
          v-model="selectedCategory"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option :value="null">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          专业
        </span>
        <div class="space-y-2">
          <label
            v-for="discipline in disciplines"
            :key="discipline"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="selectedDisciplines.includes(discipline)"
              @change="toggleDiscipline(discipline)"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ discipline }}</span>
          </label>
        </div>
      </div>

      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          媒体类型
        </span>
        <div class="space-y-2">
          <label
            v-for="mediaType in mediaTypes"
            :key="mediaType"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="selectedMediaTypes.includes(mediaType)"
              @change="toggleMediaType(mediaType)"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ mediaType }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            v-model="accessibleOnly"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">仅显示可访问的资源</span>
        </label>
      </div>
    </div>
  </div>
</template>
