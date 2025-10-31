<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Student Gallery
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explore exceptional student work from our design programs
        </p>
      </header>

      <StudentFilterBar
        v-model:filters="filters"
        :loading="pending"
        @update:filters="handleFiltersChange"
      />

      <div v-if="error" class="my-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-red-800 dark:text-red-200">
          Failed to load student works. Please try again later.
        </p>
      </div>

      <StudentGalleryGrid
        v-else
        :works="studentWorks"
        :loading="pending"
        @open-lightbox="handleOpenLightbox"
      />

      <StudentLightbox
        v-if="selectedWork"
        :work="selectedWork"
        :works="studentWorks"
        :show="showLightbox"
        @close="handleCloseLightbox"
        @navigate="handleNavigate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { parseFilterParams, buildQueryParams, buildFilterPayload, useStudentWorks } from '~/composables/useStudentWorks'
import type { StudentWork } from '~/types/cms'
import type { StudentWorksFilterParams } from '~/composables/useStudentWorks'

const route = useRoute()
const router = useRouter()

const filters = ref<StudentWorksFilterParams>(parseFilterParams(route.query))

const filterPayload = computed(() => buildFilterPayload(filters.value))

const { data, pending, error, refresh } = useStudentWorks({
  filters: filterPayload.value,
  pagination: {
    pageSize: 50,
  },
  key: 'student-works-gallery',
  watch: [filterPayload],
})

const studentWorks = computed(() => {
  if (!data.value?.data) return []
  return data.value.data.map((item: any) => ({
    id: item.id,
    studentName: item.attributes.studentName,
    projectTitle: item.attributes.projectTitle,
    slug: item.attributes.slug,
    discipline: item.attributes.discipline,
    grade: item.attributes.grade,
    loop: item.attributes.loop,
    description: item.attributes.description,
    assets: item.attributes.assets?.data?.map((media: any) => ({
      id: media.id,
      url: media.attributes.url,
      alternativeText: media.attributes.alternativeText,
      caption: media.attributes.caption,
      width: media.attributes.width,
      height: media.attributes.height,
    })) || [],
    beforeAfterMedia: item.attributes.beforeAfterMedia?.map((pair: any) => ({
      id: pair.id,
      beforeMedia: {
        url: pair.beforeMedia?.data?.attributes?.url || '',
        alternativeText: pair.beforeMedia?.data?.attributes?.alternativeText,
      },
      afterMedia: {
        url: pair.afterMedia?.data?.attributes?.url || '',
        alternativeText: pair.afterMedia?.data?.attributes?.alternativeText,
      },
      beforeLabel: pair.beforeLabel || 'Before',
      afterLabel: pair.afterLabel || 'After',
    })) || [],
    downloadUrl: item.attributes.downloadUrl,
    shareEnabled: item.attributes.shareEnabled ?? true,
    displayOrder: item.attributes.displayOrder ?? 0,
    createdAt: item.attributes.createdAt,
    updatedAt: item.attributes.updatedAt,
    publishedAt: item.attributes.publishedAt,
  })) as StudentWork[]
})

const showLightbox = ref(false)
const selectedWork = ref<StudentWork | null>(null)

function handleFiltersChange(newFilters: StudentWorksFilterParams) {
  filters.value = newFilters
  const queryParams = buildQueryParams(newFilters)
  router.push({
    query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  })
}

function handleOpenLightbox(work: StudentWork) {
  selectedWork.value = work
  showLightbox.value = true
  router.push({
    query: {
      ...route.query,
      work: work.slug || String(work.id),
    },
  })
}

function handleCloseLightbox() {
  showLightbox.value = false
  selectedWork.value = null
  const query = { ...route.query }
  delete query.work
  router.push({
    query: Object.keys(query).length > 0 ? query : undefined,
  })
}

function handleNavigate(work: StudentWork) {
  selectedWork.value = work
  router.replace({
    query: {
      ...route.query,
      work: work.slug || String(work.id),
    },
  })
}

watch(
  () => route.query,
  (newQuery) => {
    filters.value = parseFilterParams(newQuery)
    
    if (newQuery.work && studentWorks.value.length > 0) {
      const work = studentWorks.value.find(
        (w) => w.slug === newQuery.work || String(w.id) === newQuery.work
      )
      if (work) {
        selectedWork.value = work
        showLightbox.value = true
      }
    }
  },
  { immediate: true }
)

useHead({
  title: 'Student Gallery',
  meta: [
    {
      name: 'description',
      content: 'Explore exceptional student work from our design programs',
    },
  ],
})
</script>
