<template>
  <aside
    class="hidden w-80 flex-shrink-0 border-r border-gray-200 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70 lg:flex"
    role="complementary"
    aria-label="Course navigation"
  >
    <CourseNavigationPanel class="w-full" @navigate="forwardNavigate" />
  </aside>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (event: 'navigate', payload: { code: string; section?: string | null }): void }>()

const forwardNavigate = (payload: { code: string; section?: string | null }) => {
  emit('navigate', payload)
}
</script>
