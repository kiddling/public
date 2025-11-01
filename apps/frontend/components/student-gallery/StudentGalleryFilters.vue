<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
    <!-- Search Bar -->
    <div class="relative">
      <Icon
        name="mdi:magnify"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <input
        :value="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="搜索学生姓名或作品描述..."
        class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
      />
      <button
        v-if="search"
        @click="$emit('update:search', '')"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <Icon name="mdi:close" />
      </button>
    </div>

    <!-- Filter Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Discipline Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          专业方向
        </label>
        <select
          :value="discipline"
          @change="$emit('update:discipline', ($event.target as HTMLSelectElement).value || undefined)"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">全部专业</option>
          <option value="环艺">环艺</option>
          <option value="产品">产品</option>
          <option value="视传">视传</option>
          <option value="数媒">数媒</option>
          <option value="公艺">公艺</option>
        </select>
      </div>

      <!-- Loop Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          课程循环
        </label>
        <select
          :value="loop"
          @change="$emit('update:loop', ($event.target as HTMLSelectElement).value || undefined)"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">全部循环</option>
          <option value="Loop 1">Loop 1</option>
          <option value="Loop 2">Loop 2</option>
          <option value="Loop 3">Loop 3</option>
        </select>
      </div>

      <!-- Grade Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          年级
        </label>
        <input
          :value="grade"
          @input="$emit('update:grade', ($event.target as HTMLInputElement).value || undefined)"
          type="text"
          placeholder="例如：2023"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Active Filters Summary & Clear -->
    <div class="flex items-center justify-between text-sm">
      <div class="text-gray-600 dark:text-gray-400">
        找到 <span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span> 个作品
      </div>
      <button
        v-if="hasActiveFilters"
        @click="clearAll"
        class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1"
      >
        <Icon name="mdi:filter-remove" />
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentWorkDiscipline, StudentWorkLoop } from '~/types/cms'

interface Props {
  search?: string
  discipline?: StudentWorkDiscipline
  loop?: StudentWorkLoop
  grade?: string
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  total: 0,
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:discipline': [value: StudentWorkDiscipline | undefined]
  'update:loop': [value: StudentWorkLoop | undefined]
  'update:grade': [value: string | undefined]
}>()

const hasActiveFilters = computed(() => {
  return !!(props.search || props.discipline || props.loop || props.grade)
})

function clearAll() {
  emit('update:search', '')
  emit('update:discipline', undefined)
  emit('update:loop', undefined)
  emit('update:grade', undefined)
}
</script>
