<template>
  <div ref="layoutRef" class="relative min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <NavigationDrawer
      :open="drawerOpen"
      @update:open="setDrawerOpen"
      @navigate="handleDrawerNavigate"
    />

    <div class="mx-auto flex min-h-screen w-full max-w-[120rem]">
      <aside class="hidden shrink-0 border-r border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-900/80 lg:block">
        <NavigationSidebar @navigate="handleSidebarNavigate" />
      </aside>

      <div class="flex min-h-screen flex-1 flex-col">
        <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white dark:focus-visible:ring-offset-gray-900 lg:hidden"
              aria-label="Open course navigation"
              @click="drawerOpen = true"
            >
              <Icon name="i-heroicons-bars-3-20-solid" class="h-5 w-5" aria-hidden="true" />
            </button>

            <div class="flex flex-1 items-center justify-between gap-3">
              <NavigationBreadcrumb />
              <slot name="layout-actions" />
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSwipe } from '@vueuse/core'
import NavigationBreadcrumb from '~/components/navigation/NavigationBreadcrumb.vue'
import NavigationDrawer from '~/components/navigation/NavigationDrawer.vue'
import NavigationSidebar from '~/components/navigation/NavigationSidebar.vue'
import { useNavigationStore } from '~/stores/navigation'
import '~/types/route-meta'

const route = useRoute()
const navigationStore = useNavigationStore()

try {
  await navigationStore.loadStructure()
} catch (error) {
  if (import.meta.dev) {
    console.error('[navigation] Failed to load course structure', error)
  }
}

const drawerOpen = ref(false)
const layoutRef = ref<HTMLElement | null>(null)
let swipeStartX = 0
let syncRequestId = 0

watch(
  () => route.params.code,
  (rawCode) => {
    const requestId = ++syncRequestId

    const value = Array.isArray(rawCode) ? rawCode[0] : rawCode
    const normalized = typeof value === 'string' ? value.trim() : ''

    if (!normalized) {
      navigationStore.clearCurrentLesson()
      route.meta.breadcrumb = undefined
      return
    }

    const target = normalized.toUpperCase()

    navigationStore
      .navigateToLesson(target)
      .then((lesson) => {
        if (syncRequestId !== requestId) {
          return
        }
        if (lesson) {
          route.meta.breadcrumb = [...lesson.navigation.breadcrumb]
        } else {
          route.meta.breadcrumb = undefined
        }
      })
      .catch(() => {
        if (syncRequestId === requestId) {
          navigationStore.clearCurrentLesson()
          route.meta.breadcrumb = undefined
        }
      })
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
    if (!route.meta.breadcrumbHomeLabel) {
      route.meta.breadcrumbHomeLabel = 'Home'
    }
  },
  { immediate: true },
)

const setDrawerOpen = (value: boolean) => {
  drawerOpen.value = value
}

const handleDrawerNavigate = () => {
  drawerOpen.value = false
}

const handleSidebarNavigate = () => {
  drawerOpen.value = false
}

if (import.meta.client) {
  useSwipe(layoutRef, {
    threshold: 60,
    onSwipeStart(event) {
      if ('touches' in event && event.touches.length > 0) {
        swipeStartX = event.touches[0]?.clientX ?? 0
      } else if ('clientX' in event) {
        swipeStartX = (event as MouseEvent | PointerEvent).clientX ?? 0
      }
    },
    onSwipeEnd(_event, direction) {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches
      if (direction === 'right' && swipeStartX <= 40 && isMobile) {
        drawerOpen.value = true
      }
      swipeStartX = 0
    },
  })
}
</script>
