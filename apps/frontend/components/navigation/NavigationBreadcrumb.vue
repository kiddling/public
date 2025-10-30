<template>
  <nav
    class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center gap-2 overflow-hidden">
      <li class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
        >
          <Icon name="i-heroicons-home-20-solid" class="h-4 w-4" aria-hidden="true" />
          <span class="hidden sm:inline">{{ homeLabel }}</span>
        </NuxtLink>
      </li>

      <li v-for="(item, index) in breadcrumbItems" :key="`${item.type}-${item.id}`" class="flex items-center gap-1">
        <Icon name="i-heroicons-chevron-right-20-solid" class="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <component
          :is="item.to ? 'NuxtLink' : 'span'"
          v-bind="item.to ? { to: item.to } : {}"
          class="inline-flex max-w-[7.5rem] items-center truncate rounded-lg px-2 py-1 text-sm font-medium transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:max-w-none dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
          :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined"
        >
          <span class="truncate">{{ item.label }}</span>
        </component>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useNavigationStore } from '~/stores/navigation'
import type { NavigationBreadcrumbItem } from '~/types/navigation'

const route = useRoute()
const navigationStore = useNavigationStore()

interface BreadcrumbEntry {
  id: string
  label: string
  type: NavigationBreadcrumbItem['type']
  to?: RouteLocationRaw
}

const homeLabel = computed(() => {
  const label = route.meta?.breadcrumbHomeLabel
  if (typeof label === 'string' && label.trim().length > 0) {
    return label
  }
  return 'Home'
})

const rawBreadcrumb = computed<NavigationBreadcrumbItem[]>(() => {
  const metaItems = route.meta?.breadcrumb
  if (Array.isArray(metaItems) && metaItems.length) {
    return metaItems as NavigationBreadcrumbItem[]
  }

  return navigationStore.currentLesson?.navigation.breadcrumb ?? []
})

const breadcrumbItems = computed<BreadcrumbEntry[]>(() => {
  const items: BreadcrumbEntry[] = []
  const lessons = navigationStore.courseStructure?.lessons ?? []

  rawBreadcrumb.value.forEach((item, index, source) => {
    if (item.type === 'part') {
      const fallbackLesson = lessons.find((lesson) => lesson.partId === item.id)
      items.push({
        ...item,
        to: fallbackLesson ? { name: 'lessons-code', params: { code: fallbackLesson.code } } : undefined,
      })
      return
    }

    if (item.type === 'loop') {
      const fallbackLesson = lessons.find((lesson) => lesson.loopId === item.id)
      items.push({
        ...item,
        to: fallbackLesson ? { name: 'lessons-code', params: { code: fallbackLesson.code } } : undefined,
      })
      return
    }

    if (item.type === 'lesson') {
      const lesson = navigationStore.getLessonByCode(item.id)
      items.push({
        ...item,
        to: index === source.length - 1 ? undefined : { name: 'lessons-code', params: { code: item.id } },
        label: lesson?.title ?? item.label,
      })
    }
  })

  return items
})
</script>
