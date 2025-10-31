<!--
  Example: Lesson List Page with Filtering and Pagination
  
  This example demonstrates:
  - Basic lesson fetching
  - Search functionality
  - Part filtering
  - Pagination
  - Error handling
  - Loading states
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLessons, useSearchLessons } from '~/composables/useLessons'
import type { NavigationPartType } from '~/types/navigation'

// Reactive state
const searchQuery = ref('')
const selectedPart = ref<NavigationPartType | null>(null)
const page = ref(1)
const pageSize = 20

// Available parts
const parts: NavigationPartType[] = [
  'foundation',
  'core-blocks',
  'extended-thinking',
  'appendices',
]

// Fetch lessons based on current filters
const { data: lessons, pending, error, refresh } = computed(() => {
  // Use search if query is present
  if (searchQuery.value.trim()) {
    return useSearchLessons(searchQuery.value, {
      pagination: {
        page: page.value,
        pageSize,
      },
      watch: [page],
    })
  }

  // Use part filter if selected
  if (selectedPart.value) {
    return useLessons({
      filters: {
        partKey: { $eq: selectedPart.value },
      },
      sort: ['order:asc'],
      pagination: {
        page: page.value,
        pageSize,
      },
      watch: [page],
    })
  }

  // Default: fetch all lessons
  return useLessons({
    sort: ['partOrder:asc', 'loopOrder:asc', 'order:asc'],
    pagination: {
      page: page.value,
      pageSize,
    },
    watch: [page],
  })
}).value

// Reset page when filters change
watch([searchQuery, selectedPart], () => {
  page.value = 1
})

// Computed properties
const totalPages = computed(() => {
  const meta = lessons.value?.meta?.pagination
  return meta?.pageCount ?? 1
})

const hasResults = computed(() => {
  return lessons.value?.data && lessons.value.data.length > 0
})

// Methods
function clearFilters() {
  searchQuery.value = ''
  selectedPart.value = null
  page.value = 1
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--
  }
}

async function reloadLessons() {
  await refresh()
}
</script>

<template>
  <div class="lesson-list-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Lessons</h1>
      <button @click="reloadLessons" :disabled="pending">
        Refresh
      </button>
    </header>

    <!-- Filters -->
    <div class="filters">
      <!-- Search -->
      <div class="filter-group">
        <label for="search">Search</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Search lessons..."
        />
      </div>

      <!-- Part Filter -->
      <div class="filter-group">
        <label for="part">Part</label>
        <select id="part" v-model="selectedPart">
          <option :value="null">All Parts</option>
          <option v-for="part in parts" :key="part" :value="part">
            {{ part }}
          </option>
        </select>
      </div>

      <!-- Clear Filters -->
      <button @click="clearFilters" class="btn-secondary">
        Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading">
      <div class="spinner"></div>
      <p>Loading lessons...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>Failed to load lessons: {{ error.message }}</p>
      <button @click="reloadLessons">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasResults" class="empty">
      <p>No lessons found.</p>
      <button @click="clearFilters">Clear Filters</button>
    </div>

    <!-- Lesson List -->
    <div v-else class="lesson-list">
      <div
        v-for="item in lessons.data"
        :key="item.id"
        class="lesson-card"
      >
        <div class="lesson-header">
          <span class="lesson-code">{{ item.attributes.code }}</span>
          <span v-if="item.attributes.partKey" class="lesson-part">
            {{ item.attributes.partKey }}
          </span>
        </div>
        <h3 class="lesson-title">{{ item.attributes.title }}</h3>
        <p v-if="item.attributes.summary" class="lesson-summary">
          {{ item.attributes.summary }}
        </p>
        <NuxtLink
          :to="`/lessons/${item.attributes.code}`"
          class="lesson-link"
        >
          View Lesson →
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="hasResults && totalPages > 1" class="pagination">
      <button
        @click="prevPage"
        :disabled="page === 1 || pending"
        class="btn-pagination"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ page }} of {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="page === totalPages || pending"
        class="btn-pagination"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.lesson-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  font-size: 0.875rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.lesson-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.lesson-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.lesson-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.lesson-code {
  font-weight: 700;
  color: #3498db;
}

.lesson-part {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  border-radius: 4px;
  color: #1976d2;
}

.lesson-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.lesson-summary {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
}

.lesson-link {
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.lesson-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-info {
  font-weight: 600;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
