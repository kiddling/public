<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          学生作品展示
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          浏览学生优秀作品，探索创意与灵感
        </p>
      </div>

      <!-- Filter Controls -->
      <StudentGalleryFilters
        v-model:search="search"
        v-model:discipline="discipline"
        v-model:loop="loop"
        v-model:grade="grade"
        :total="meta?.pagination?.total || 0"
        class="mb-8"
      />

      <!-- Loading State -->
      <div v-if="pending && !data" class="space-y-8">
        <StudentGallerySkeleton />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="text-red-500 mb-4">
          <Icon name="mdi:alert-circle" class="text-6xl" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          加载失败
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ error.message }}
        </p>
        <button
          @click="refresh"
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          重试
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!works || works.length === 0" class="text-center py-16">
        <div class="text-gray-400 dark:text-gray-600 mb-4">
          <Icon name="mdi:image-search" class="text-6xl" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          暂无作品
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          尝试调整筛选条件以查看更多作品
        </p>
      </div>

      <!-- Gallery Grid -->
      <div v-else>
        <StudentGalleryGrid
          :works="works"
          @open="openLightbox"
        />

        <!-- Pagination -->
        <div v-if="meta?.pagination && meta.pagination.pageCount > 1" class="mt-8">
          <StudentGalleryPagination
            v-model="page"
            :total-pages="meta.pagination.pageCount"
            :total="meta.pagination.total"
            :page-size="pageSize"
          />
        </div>
      </div>

      <!-- Lightbox Modal - Lazy loaded for better performance -->
      <LazyStudentGalleryLightbox
        v-if="lightboxOpen"
        :works="works"
        :initial-index="lightboxIndex"
        @close="closeLightbox"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentWork, StudentWorkDiscipline, StudentWorkLoop } from '~/types/cms'

definePageMeta({
  breadcrumbHomeLabel: '学生作品',
})

// URL query parameters
const route = useRoute()
const router = useRouter()

// Filter states
const search = ref(route.query.search as string || '')
const discipline = ref(route.query.discipline as StudentWorkDiscipline || undefined)
const loop = ref(route.query.loop as StudentWorkLoop || undefined)
const grade = ref(route.query.grade as string || undefined)
const page = ref(Number(route.query.page) || 1)
const pageSize = ref(24)

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

// Build filters for API
const filters = computed(() => {
  const f: any = {}
  
  if (search.value) {
    f.$or = [
      { studentName: { $containsi: search.value } },
      { description: { $containsi: search.value } },
    ]
  }
  
  if (discipline.value) {
    f.discipline = { $eq: discipline.value }
  }
  
  if (loop.value) {
    f.loop = { $eq: loop.value }
  }
  
  if (grade.value) {
    f.grade = { $eq: grade.value }
  }
  
  return Object.keys(f).length > 0 ? f : undefined
})

// Fetch student works
const { data, pending, error, refresh } = useStudentWorks({
  filters: filters.value,
  pagination: {
    page: page.value,
    pageSize: pageSize.value,
  },
  sort: ['createdAt:desc'],
  watch: [filters, page],
})

// Extract works and metadata
const works = computed(() => data.value?.data || [])
const meta = computed(() => data.value?.meta)

// Watch filters and update URL
watch([search, discipline, loop, grade, page], () => {
  const query: any = {}
  
  if (search.value) query.search = search.value
  if (discipline.value) query.discipline = discipline.value
  if (loop.value) query.loop = loop.value
  if (grade.value) query.grade = grade.value
  if (page.value > 1) query.page = page.value
  
  router.push({ query })
})

// Reset page when filters change
watch([search, discipline, loop, grade], () => {
  page.value = 1
})

// Deep link support - open lightbox from URL
const workId = route.query.work
if (workId && works.value.length > 0) {
  const index = works.value.findIndex((w: StudentWork) => String(w.id) === String(workId))
  if (index !== -1) {
    lightboxIndex.value = index
    lightboxOpen.value = true
  }
}

// Lightbox methods
function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
  
  // Update URL with work ID
  const work = works.value[index]
  if (work) {
    router.push({
      query: {
        ...route.query,
        work: String(work.id),
      },
    })
  }
}

function closeLightbox() {
  lightboxOpen.value = false
  
  // Remove work ID from URL
  const query = { ...route.query }
  delete query.work
  router.push({ query })
}

// SEO
useHead({
  title: '学生作品展示',
  meta: [
    {
      name: 'description',
      content: '浏览学生优秀作品，探索创意与灵感',
    },
  ],
})
</script>
