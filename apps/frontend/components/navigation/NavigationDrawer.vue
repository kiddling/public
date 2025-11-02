<template>
  <Teleport to="body">
    <transition name="drawer-container">
      <div v-if="open" class="fixed inset-0 z-[60] flex">
        <div
          class="drawer-overlay absolute inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-gray-950/60"
          role="presentation"
          @click="close"
        ></div>

        <section
          id="navigation-drawer"
          ref="panelRef"
          class="drawer-panel relative z-[61] flex h-full w-[min(90vw,22rem)] flex-col overflow-hidden border-r border-gray-200 bg-white/95 shadow-xl backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900"
          role="dialog"
          aria-modal="true"
          aria-label="课程导航"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <header
            class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">课程大纲</p>
            <button
              ref="closeButtonRef"
              type="button"
              class="focus-visible:ring-primary-500 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
              aria-label="关闭课程导航"
              @click="close"
            >
              <Icon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <div
              class="mb-4 rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <NuxtLink
                to="/downloads"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                @click="close"
              >
                <Icon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
                <span>Download Center</span>
              </NuxtLink>
            </div>
            <NavigationMenu @navigate="handleNavigate" />
          </div>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useSwipe } from '@vueuse/core'
import NavigationMenu from './NavigationMenu.vue'

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'navigate', code: string): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
let lastFocusedElement: HTMLElement | null = null

const close = () => {
  emit('update:open', false)
}

const handleNavigate = (code: string) => {
  emit('navigate', code)
  close()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const container = panelRef.value
  if (!container) {
    return
  }

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  )

  if (!focusable.length) {
    event.preventDefault()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (active === first || !active) {
      event.preventDefault()
      last.focus()
    }
  } else if (active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  (value) => {
    if (import.meta.client) {
      if (value) {
        lastFocusedElement = document.activeElement as HTMLElement | null
        document.body.style.setProperty('overflow', 'hidden')
        queueMicrotask(() => {
          closeButtonRef.value?.focus()
        })
      } else {
        document.body.style.removeProperty('overflow')
        lastFocusedElement?.focus?.()
        lastFocusedElement = null
      }
    }
  },
  { immediate: true }
)

useSwipe(panelRef, {
  threshold: 40,
  onSwipeEnd: (_event, direction) => {
    if (direction === 'left') {
      close()
    }
  },
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.removeProperty('overflow')
    lastFocusedElement = null
  }
})
</script>

<style scoped>
.drawer-container-enter-active,
.drawer-container-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-container-enter-from,
.drawer-container-leave-to {
  opacity: 0;
}

.drawer-panel {
  transition: transform 0.25s ease;
  transform: translateX(0);
}

.drawer-container-enter-from .drawer-panel,
.drawer-container-leave-to .drawer-panel {
  transform: translateX(-100%);
}
</style>
