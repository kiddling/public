<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">
      {{ $t('navigation.skipToContent') }}
    </a>

    <AppHeader @toggle-sidebar="handleToggleSidebar" />

    <div class="app-body">
      <AppSidebar
        :open="sidebarOpen"
        @close="handleCloseSidebar"
      />

      <main
        id="main-content"
        class="app-main"
        role="main"
        aria-label="主要内容"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarOpen = ref(false)

const handleToggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleCloseSidebar = () => {
  sidebarOpen.value = false
}
</script>

<style scoped>
.app-shell {
  @apply min-h-screen flex flex-col bg-neutral-50;
}

.app-body {
  @apply flex flex-1 relative;
}

.app-main {
  @apply flex-1 w-full;
  @apply transition-all duration-300;
}

@media print {
  .app-main {
    @apply w-full;
  }
}
</style>
