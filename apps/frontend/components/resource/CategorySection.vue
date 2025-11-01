<script setup lang="ts">
import type { Resource, ResourceCategory } from '~/types/cms'

const props = defineProps<{
  category: ResourceCategory
  resources: Resource[]
  searchTerm?: string
}>()

const emit = defineEmits<{
  'open-detail': [resource: Resource]
}>()

const isExpanded = ref(true)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="mb-8">
    <div
      class="flex items-center justify-between mb-4 cursor-pointer"
      @click="toggleExpanded"
      @keydown.enter="toggleExpanded"
      tabindex="0"
      role="button"
      :aria-expanded="isExpanded"
      :aria-label="`Toggle ${category} section`"
    >
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ category }}
        <span class="text-lg text-gray-500 dark:text-gray-400 ml-2">({{ resources.length }})</span>
      </h2>
      <span
        class="text-gray-500 dark:text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': !isExpanded }"
        aria-hidden="true"
      >
        ▼
      </span>
    </div>

    <div v-if="isExpanded" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ResourceCard
        v-for="resource in resources"
        :key="resource.id"
        :resource="resource"
        :search-term="searchTerm"
        @open-detail="emit('open-detail', resource)"
      />
    </div>

    <div v-else class="text-gray-500 dark:text-gray-400 text-sm italic">
      点击展开查看 {{ resources.length }} 个资源
    </div>
  </div>
</template>
