<template>
  <header class="app-header">
    <button
      class="menu-button"
      aria-label="Toggle navigation menu"
      aria-expanded="false"
      @click="$emit('toggle-sidebar')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line
          x1="3"
          y1="12"
          x2="21"
          y2="12"
        />
        <line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
        />
        <line
          x1="3"
          y1="18"
          x2="21"
          y2="18"
        />
      </svg>
    </button>
    <h1 class="app-title">
      Course Navigation
    </h1>
    <ProgressIndicator />
  </header>
</template>

<script setup>
import ProgressIndicator from '@/components/ProgressIndicator.vue'

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
  z-index: 100;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: var(--color-border);
}

.menu-button:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

@media (min-width: 1024px) {
  .app-header {
    left: var(--sidebar-width);
  }

  .menu-button {
    display: none;
  }
}
</style>
