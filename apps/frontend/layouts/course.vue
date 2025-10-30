<template>
  <div class="relative flex min-h-screen bg-slate-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100">
    <CourseNavigationSidebar @navigate="handleNavigate" />

    <CourseNavigationDrawer v-model:open="drawerOpen" @navigate="handleNavigate" />

    <div class="flex min-h-screen flex-1 flex-col">
      <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-500/60 dark:hover:text-primary-200 lg:hidden"
              aria-label="Open course navigation"
              @click="drawerOpen = true"
            >
              <Icon name="i-heroicons-bars-3" class="h-6 w-6" aria-hidden="true" />
            </button>
            <CourseBreadcrumbs class="max-w-full" />
          </div>
          <div class="hidden min-w-[160px] sm:block">
            <CourseProgressSummary
              :completed="progressSummary.completed"
              :total="progressSummary.total"
              :viewed="progressSummary.viewed"
              :percentage="progressSummary.percentage"
              size="sm"
            />
          </div>
        </div>
        <div class="sr-only" aria-live="polite">
          {{ progressLiveMessage }}
        </div>
      </header>

      <div class="flex flex-1 flex-col lg:flex-row">
        <main class="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
          <slot />
        </main>
        <aside class="sticky top-20 hidden w-[420px] flex-shrink-0 px-6 pb-12 pt-6 xl:block">
          <CourseSpiral v-if="hasLessons" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCourseNavigationStore } from '~/stores/courseNavigation'
import { useCourseProgressStore } from '~/stores/courseProgress'

const navigationStore = useCourseNavigationStore()
const progressStore = useCourseProgressStore()
const route = useRoute()

await navigationStore.ensureInitialized()

const drawerOpen = useState('course-nav-drawer', () => false)

watch(
  () => route.params.code,
  (code) => {
    navigationStore.setActiveLesson(code ? String(code) : null)
  },
  { immediate: true }
)

watch(
  () => route.hash,
  (hash) => {
    navigationStore.setActiveSectionBySlug(hash)
  },
  { immediate: true }
)

watch(
  () => navigationStore.lessonCodes.value,
  (codes) => {
    progressStore.registerLessons(codes)
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  }
)

const progressSummary = computed(() => progressStore.progressSummary.value)
const hasLessons = computed(() => navigationStore.flattenedLessons.value.length > 0)

const progressLiveMessage = computed(
  () =>
    `You have completed ${progressSummary.value.completed} of ${progressSummary.value.total} lessons. ${progressSummary.value.percentage}% complete.`
)

const handleNavigate = () => {
  drawerOpen.value = false
}
</script>
