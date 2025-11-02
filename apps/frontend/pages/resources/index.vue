<script setup lang="ts">
import type { Resource, ResourceCategory, ResourceDiscipline, ResourceMediaType } from '~/types/cms'
import { useResources } from '~/composables/useResources'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const router = useRouter()

const allCategories: ResourceCategory[] = [
  'Video Tutorials',
  'Tool Links',
  'Case Databases',
  'Readings',
  'PBR Libraries',
]

const allDisciplines: ResourceDiscipline[] = ['环艺', '产品', '视传', '数媒', '公艺']

const allMediaTypes: ResourceMediaType[] = ['video', 'pdf', 'link', 'dataset']

const selectedCategory = ref<ResourceCategory | null>(null)
const selectedDisciplines = ref<ResourceDiscipline[]>([])
const selectedMediaTypes = ref<ResourceMediaType[]>([])
const accessibleOnly = ref(false)
const searchQuery = ref('')
const selectedResource = ref<Resource | null>(null)
const isDetailModalOpen = ref(false)
const isExporting = ref(false)
const exportError = ref<string | null>(null)

const CACHE_KEY = 'resources-cache'
const CACHE_TIMESTAMP_KEY = 'resources-cache-timestamp'
const CACHE_TTL = 5 * 60 * 1000

const initializeFromQuery = () => {
  if (route.query.category) {
    selectedCategory.value = route.query.category as ResourceCategory
  }
  if (route.query.discipline) {
    const disciplines = Array.isArray(route.query.discipline)
      ? route.query.discipline
      : [route.query.discipline]
    selectedDisciplines.value = disciplines as ResourceDiscipline[]
  }
  if (route.query.mediaType) {
    const mediaTypes = Array.isArray(route.query.mediaType)
      ? route.query.mediaType
      : [route.query.mediaType]
    selectedMediaTypes.value = mediaTypes as ResourceMediaType[]
  }
  if (route.query.accessible === 'true') {
    accessibleOnly.value = true
  }
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
}

const updateQueryParams = useDebounceFn(() => {
  const query: Record<string, any> = {}

  if (selectedCategory.value) {
    query.category = selectedCategory.value
  }
  if (selectedDisciplines.value.length > 0) {
    query.discipline = selectedDisciplines.value
  }
  if (selectedMediaTypes.value.length > 0) {
    query.mediaType = selectedMediaTypes.value
  }
  if (accessibleOnly.value) {
    query.accessible = 'true'
  }
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value
  }

  router.push({ query })
}, 300)

watch(
  [selectedCategory, selectedDisciplines, selectedMediaTypes, accessibleOnly, searchQuery],
  () => {
    updateQueryParams()
  }
)

const resourceFilters = computed(() => {
  const filters: any = {}

  if (selectedCategory.value) {
    filters.category = selectedCategory.value
  }
  if (selectedDisciplines.value.length > 0) {
    filters.discipline = selectedDisciplines.value
  }
  if (selectedMediaTypes.value.length > 0) {
    filters.mediaType = selectedMediaTypes.value
  }
  if (accessibleOnly.value) {
    filters.accessibleOnly = true
  }
  if (searchQuery.value.trim()) {
    filters.filters = {
      $or: [
        { title: { $containsi: searchQuery.value } },
        { description: { $containsi: searchQuery.value } },
      ],
    }
  }

  return filters
})

const {
  data: resourcesData,
  pending,
  error,
} = useResources({
  ...resourceFilters.value,
  key: computed(() => `resources-${JSON.stringify(resourceFilters.value)}`),
})

const getCachedData = () => {
  if (process.client) {
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10)
      if (age < CACHE_TTL) {
        try {
          return JSON.parse(cached)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

const setCachedData = (data: any) => {
  if (process.client) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  }
}

const resources = computed(() => {
  if (resourcesData.value?.data) {
    const normalized = resourcesData.value.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      category: item.attributes.category,
      description: item.attributes.description,
      url: item.attributes.url,
      accessibilityFlag: item.attributes.accessibilityFlag ?? true,
      lastChecked: item.attributes.lastChecked,
      disciplines: item.attributes.disciplines || [],
      mediaType: item.attributes.mediaType || 'link',
      qrAsset: item.attributes.qrAsset?.data?.attributes,
      file: item.attributes.file?.data?.attributes,
      lessons: item.attributes.lessons?.data || [],
      createdAt: item.attributes.createdAt,
      updatedAt: item.attributes.updatedAt,
      publishedAt: item.attributes.publishedAt,
    }))

    setCachedData(normalized)
    return normalized
  }

  const cached = getCachedData()
  return cached || []
})

const resourcesByCategory = computed(() => {
  const grouped = new Map<ResourceCategory, Resource[]>()

  allCategories.forEach((category) => {
    grouped.set(category, [])
  })

  resources.value.forEach((resource: Resource) => {
    if (resource.category) {
      const list = grouped.get(resource.category) || []
      list.push(resource)
      grouped.set(resource.category, list)
    }
  })

  return Array.from(grouped.entries())
    .filter(([, resources]) => resources.length > 0)
    .map(([category, resources]) => ({ category, resources }))
})

const openDetail = (resource: Resource) => {
  selectedResource.value = resource
  isDetailModalOpen.value = true
}

const closeDetail = () => {
  isDetailModalOpen.value = false
  selectedResource.value = null
}

const exportResources = async (format: 'csv' | 'pdf') => {
  isExporting.value = true
  exportError.value = null

  try {
    const query: Record<string, any> = { format }

    if (selectedCategory.value) {
      query.category = selectedCategory.value
    }
    if (selectedDisciplines.value.length > 0) {
      query.discipline = selectedDisciplines.value
    }
    if (selectedMediaTypes.value.length > 0) {
      query.mediaType = selectedMediaTypes.value
    }
    if (accessibleOnly.value) {
      query.accessibleOnly = 'true'
    }
    if (searchQuery.value.trim()) {
      query.search = searchQuery.value
    }

    const queryString = new URLSearchParams(query).toString()
    const url = `/api/resources/export?${queryString}`

    window.open(url, '_blank')
  } catch (err) {
    exportError.value = err instanceof Error ? err.message : 'Export failed'
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  initializeFromQuery()
})

definePageMeta({
  breadcrumbHomeLabel: 'Resources',
})

useHead({
  title: '资源库 - Resources',
  meta: [
    {
      name: 'description',
      content: '浏览和搜索教学资源，包括视频教程、工具链接、案例数据库等。',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="mb-2 text-4xl font-bold text-gray-900 dark:text-white">资源库</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          浏览教学资源，包括视频教程、工具链接、案例数据库等
        </p>
      </header>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside class="lg:col-span-1">
          <ResourceFilterPanel
            :categories="allCategories"
            :disciplines="allDisciplines"
            :media-types="allMediaTypes"
            @update:category="(value) => (selectedCategory = value)"
            @update:discipline="(value) => (selectedDisciplines = value)"
            @update:media-type="(value) => (selectedMediaTypes = value)"
            @update:accessible-only="(value) => (accessibleOnly = value)"
            @update:search="(value) => (searchQuery = value)"
          />

          <div class="mt-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">导出</h3>
            <div class="space-y-3">
              <button
                @click="exportResources('csv')"
                :disabled="isExporting || resources.length === 0"
                class="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
              >
                {{ isExporting ? '导出中...' : '导出为 CSV' }}
              </button>
              <button
                @click="exportResources('pdf')"
                :disabled="isExporting || resources.length === 0"
                class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
              >
                {{ isExporting ? '导出中...' : '导出为文本' }}
              </button>
            </div>
            <p v-if="exportError" class="mt-2 text-sm text-red-600 dark:text-red-400">
              {{ exportError }}
            </p>
          </div>
        </aside>

        <main class="lg:col-span-3">
          <div v-if="pending" class="flex items-center justify-center py-12">
            <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>

          <div
            v-else-if="error"
            class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
          >
            <p class="text-red-800 dark:text-red-200">加载资源时出错: {{ error.message }}</p>
          </div>

          <div
            v-else-if="resources.length === 0"
            class="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20"
          >
            <p class="text-yellow-800 dark:text-yellow-200">
              未找到匹配的资源。请尝试调整筛选条件。
            </p>
          </div>

          <div v-else>
            <div class="mb-6 text-sm text-gray-600 dark:text-gray-400">
              显示 {{ resources.length }} 个资源
            </div>

            <ResourceCategorySection
              v-for="{ category, resources: categoryResources } in resourcesByCategory"
              :key="category"
              :category="category"
              :resources="categoryResources"
              :search-term="searchQuery"
              @open-detail="openDetail"
            />
          </div>
        </main>
      </div>
    </div>

    <ResourceDetailModal
      :resource="selectedResource"
      :is-open="isDetailModalOpen"
      @close="closeDetail"
    />
  </div>
</template>
