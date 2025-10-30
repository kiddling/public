<template>
  <Teleport to="body">
    <Transition name="course-drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex">
        <button
          type="button"
          class="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
          aria-label="Close course navigation"
          @click="close"
        ></button>
        <div
          ref="panelRef"
          class="relative ml-0 flex h-full w-[84%] max-w-96 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-xl transition-all dark:border-gray-800 dark:bg-gray-950"
          role="dialog"
          aria-modal="true"
          aria-label="Course navigation"
        >
          <header class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <Icon name="i-heroicons-map" class="h-5 w-5 text-primary-500" aria-hidden="true" />
              Course outline
            </div>
            <button
              type="button"
              class="rounded-full border border-gray-200 p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close navigation"
              @click="close"
            >
              <Icon name="i-heroicons-x-mark" class="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <CourseNavigationPanel class="flex-1" @navigate="handleNavigate" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSwipe } from '@vueuse/core'

const props = defineProps<{ open: boolean }>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'navigate', payload: { code: string; section?: string | null }): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const open = computed(() => props.open)

const close = () => {
  emit('update:open', false)
}

const handleNavigate = (payload: { code: string; section?: string | null }) => {
  emit('navigate', payload)
  emit('update:open', false)
}

const restoreBodyScroll = () => {
  document.body.classList.remove('overflow-hidden')
}

watch(
  open,
  async (isOpen) => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
      await nextTick()
      const focusTarget = panelRef.value?.querySelector<HTMLElement>('input, button, [tabindex]')
      focusTarget?.focus()
    } else {
      restoreBodyScroll()
    }
  },
  { immediate: true }
)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  restoreBodyScroll()
})

useSwipe(panelRef, {
  threshold: 80,
  onSwipeEnd(_, direction) {
    if (direction === 'left') {
      close()
    }
  },
})
</script>

<style scoped>
.course-drawer-enter-active,
.course-drawer-leave-active {
  transition: all 0.25s ease;
}

.course-drawer-enter-from,
.course-drawer-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.course-drawer-enter-to,
.course-drawer-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
