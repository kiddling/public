<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          资源库
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          浏览、搜索和导出教学资源
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filters Sidebar -->
        <aside class="lg:col-span-1">
          <ResourceFilters
            :filters="filters"
            :available-disciplines="availableDisciplines"
            @update:filters="handleFilterUpdate"
          />
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-3">
          <!-- Actions Bar -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium text-gray-900 dark:text-white">{{ filteredResources.length }}</span> 项资源
              </div>
              
              <div class="flex gap-2 flex-wrap">
                <button
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  :disabled="filteredResources.length === 0"
                  :class="{ 'opacity-50 cursor-not-allowed': filteredResources.length === 0 }"
                  @click="handleExportCSV"
                >
                  📊 导出 CSV
                </button>
                <button
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  :disabled="filteredResources.length === 0"
                  :class="{ 'opacity-50 cursor-not-allowed': filteredResources.length === 0 }"
                  @click="handleExportPDF"
                >
                  📄 导出 PDF
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"/>
              <p class="text-gray-600 dark:text-gray-400">加载资源中...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p class="text-red-800 dark:text-red-200">
              ⚠️ 加载资源失败: {{ error.message }}
            </p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredResources.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              未找到资源
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              尝试调整筛选条件或清空搜索关键词
            </p>
            <button
              class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              @click="resetFilters"
            >
              重置筛选
            </button>
          </div>

          <!-- Resources Grid -->
          <div v-else class="grid grid-cols-1 gap-4">
            <ResourceCard
              v-for="resource in filteredResources"
              :key="resource.id"
              :resource="resource"
              :search-term="filters.search"
              @show-details="showResourceDetails"
              @show-qr="showResourceQR"
            />
          </div>

          <!-- Accessibility Summary -->
          <div v-if="filteredResources.length > 0" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              可访问性状态统计
            </h3>
            <div class="flex gap-4 flex-wrap text-sm">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"/>
                <span class="text-gray-700 dark:text-gray-300">
                  已验证: {{ accessibilityStats.verified }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-yellow-500 rounded-full" aria-hidden="true"/>
                <span class="text-gray-700 dark:text-gray-300">
                  需关注: {{ accessibilityStats.needsAttention }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-gray-500 rounded-full" aria-hidden="true"/>
                <span class="text-gray-700 dark:text-gray-300">
                  未知: {{ accessibilityStats.unknown }}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Modals -->
    <ResourceDetailModal
      v-if="selectedResource"
      :is-open="showDetailModal"
      :resource="selectedResource"
      @close="showDetailModal = false"
    />

    <ResourceQRModal
      v-if="qrResource"
      :is-open="showQRModal"
      :resource="qrResource"
      @close="showQRModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Resource, ResourceFilters } from '~/types/resource'

// Page metadata
useHead({
  title: '资源库',
  meta: [
    { name: 'description', content: '浏览、搜索和导出教学资源' },
  ],
})

// State
const filters = ref<ResourceFilters>({
  category: 'all',
  discipline: 'all',
  medium: 'all',
  search: '',
})

const showDetailModal = ref(false)
const showQRModal = ref(false)
const selectedResource = ref<Resource | null>(null)
const qrResource = ref<Resource | null>(null)

// Composables
const { resources, loading, error, fetchResources } = useResources()

// Computed
const filteredResources = computed(() => resources.value)

const availableDisciplines = computed(() => {
  const disciplines = new Set<string>()
  resources.value.forEach((resource) => {
    resource.disciplines?.forEach((discipline) => disciplines.add(discipline))
  })
  return Array.from(disciplines).sort()
})

const accessibilityStats = computed(() => {
  return {
    verified: filteredResources.value.filter(r => r.accessibilityStatus === 'verified').length,
    needsAttention: filteredResources.value.filter(r => r.accessibilityStatus === 'needs-attention').length,
    unknown: filteredResources.value.filter(r => r.accessibilityStatus === 'unknown').length,
  }
})

// Methods
const handleFilterUpdate = (newFilters: ResourceFilters) => {
  filters.value = { ...newFilters }
  fetchResources(filters.value)
}

const resetFilters = () => {
  filters.value = {
    category: 'all',
    discipline: 'all',
    medium: 'all',
    search: '',
  }
  fetchResources(filters.value)
}

const showResourceDetails = (resource: Resource) => {
  selectedResource.value = resource
  showDetailModal.value = true
}

const showResourceQR = (resource: Resource) => {
  qrResource.value = resource
  showQRModal.value = true
}

const handleExportCSV = () => {
  if (filteredResources.value.length > 0) {
    const filename = `resources-${new Date().toISOString().slice(0, 10)}.csv`
    exportToCSV(filteredResources.value, filename)
  }
}

const handleExportPDF = () => {
  if (filteredResources.value.length > 0) {
    const filename = `resources-${new Date().toISOString().slice(0, 10)}.pdf`
    exportToPDF(filteredResources.value, filename)
  }
}

// Initial fetch
onMounted(() => {
  fetchResources(filters.value)
})
</script>
