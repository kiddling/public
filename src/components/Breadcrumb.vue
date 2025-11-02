<template>
  <nav
    v-if="breadcrumbItems.length > 0"
    class="breadcrumb"
    aria-label="Breadcrumb"
  >
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="index"
        class="breadcrumb-item"
      >
        <RouterLink
          v-if="item.to && index < breadcrumbItems.length - 1"
          :to="item.to"
          class="breadcrumb-link"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="breadcrumb-current"
          :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <svg
          v-if="index < breadcrumbItems.length - 1"
          class="breadcrumb-separator"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbItems = computed(() => {
  return route.meta.breadcrumb || []
})
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--color-loop-1);
  transition: opacity 0.2s;
}

.breadcrumb-link:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.breadcrumb-link:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
  border-radius: 4px;
}

.breadcrumb-current {
  color: var(--color-text);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
</style>
