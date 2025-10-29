<template>
  <div class="app-container">
    <AppHeader @toggle-sidebar="toggleSidebar" />
    <CourseSidebar
      :is-open="isSidebarOpen"
      @close="closeSidebar"
    />
    <main
      class="main-content"
      :class="{ 'sidebar-open': isSidebarOpen }"
    >
      <Breadcrumb />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import CourseSidebar from '@/components/CourseSidebar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleResize() {
  if (window.innerWidth >= 1024) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1rem;
  margin-top: var(--header-height);
  transition: margin-left 0.3s ease;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: var(--sidebar-width);
    padding: 2rem;
  }
}

@media (max-width: 1023px) {
  .main-content.sidebar-open {
    overflow: hidden;
  }
}
</style>
