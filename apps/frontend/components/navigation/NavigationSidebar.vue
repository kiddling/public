<template>
  <nav
    class="sticky top-0 flex h-screen w-full max-w-[22rem] flex-col overflow-hidden border-r border-gray-200 bg-white/80 px-4 py-6 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80"
    aria-label="Course navigation"
  >
    <header class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Course Navigation
        </p>
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Course Outline
        </h2>
      </div>
      <slot name="actions" />
    </header>

    <div class="flex-1 overflow-y-auto pr-2">
      <div class="space-y-5 pb-6">
        <ProgressTracker variant="compact" />
        <NavigationMenu @navigate="handleNavigate" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import ProgressTracker from './ProgressTracker.vue'
import NavigationMenu from './NavigationMenu.vue'

const emit = defineEmits<{
  (e: 'navigate', code: string): void
}>()

function handleNavigate(code: string) {
  emit('navigate', code)
}
</script>
