<template>
  <div
    ref="layoutRef"
    class="relative min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100"
  >
    <a
      href="#main-content"
      class="skip-to-main bg-primary-600 focus:ring-primary-500 sr-only left-4 top-4 z-[9999] rounded-md px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      跳转到主内容
    </a>

    <NavigationDrawer
      :open="drawerOpen"
      @update:open="setDrawerOpen"
      @navigate="handleDrawerNavigate"
    />

    <div class="mx-auto flex min-h-screen w-full max-w-[120rem]">
      <nav
        aria-label="课程导航"
        class="hidden shrink-0 border-r border-gray-200 bg-white/80 lg:block dark:border-gray-800 dark:bg-gray-900/80"
      >
        <NavigationSidebar @navigate="handleSidebarNavigate" />
      </nav>

      <div class="flex min-h-screen flex-1 flex-col">
        <header
          class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80"
        >
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="focus-visible:ring-primary-500 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
              aria-label="打开课程导航"
              aria-expanded="false"
              aria-controls="navigation-drawer"
              @click="drawerOpen = true"
            >
              <Icon name="i-heroicons-bars-3-20-solid" class="h-5 w-5" aria-hidden="true" />
            </button>

            <div class="flex flex-1 items-center justify-between gap-3">
              <NavigationBreadcrumb />
              <div class="flex items-center gap-2">
                <GlobalSearchButton />
                <slot name="layout-actions" />
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" tabindex="-1" class="flex-1 overflow-x-hidden focus:outline-none">
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
import GlobalSearchButton from '~/components/search/GlobalSearchButton.vue'
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

// Update aria-expanded when drawer state changes
watch(drawerOpen, (isOpen) => {
  if (import.meta.client) {
    const menuButton = document.querySelector('[aria-controls="navigation-drawer"]')
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(isOpen))
    }
  }
})

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
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
    if (!route.meta.breadcrumbHomeLabel) {
      route.meta.breadcrumbHomeLabel = 'Home'
    }
  },
  { immediate: true }
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
