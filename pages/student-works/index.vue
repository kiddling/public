<template>
  <div class="container">
    <h1>Student Works</h1>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search student works..."
        @input="handleSearch"
      />

      <label>
        <input
          v-model="showFeatured"
          type="checkbox"
          @change="handleFilterChange"
        />
        Featured only
      </label>
    </div>

    <div v-if="pending" class="loading">Loading student works...</div>
    
    <div v-else-if="error" class="error">
      <p>Error loading student works: {{ error.message }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <div v-else-if="studentWorks.length === 0" class="empty">
      No student works found.
    </div>

    <div v-else class="works-grid">
      <div v-for="work in studentWorks" :key="work.id" class="work-card">
        <span v-if="work.attributes.featured" class="featured-badge">★ Featured</span>
        <h3>{{ work.attributes.title }}</h3>
        <p v-if="work.attributes.description">
          {{ work.attributes.description }}
        </p>
        <div class="meta">
          <span v-if="work.attributes.studentName">By: {{ work.attributes.studentName }}</span>
          <span v-if="work.attributes.studentGrade">Grade: {{ work.attributes.studentGrade }}</span>
          <span v-if="work.attributes.category">Category: {{ work.attributes.category }}</span>
        </div>
      </div>
    </div>

    <div v-if="pagination" class="pagination">
      <button
        :disabled="pagination.page === 1"
        @click="goToPage(pagination.page - 1)"
      >
        Previous
      </button>
      <span>Page {{ pagination.page }} of {{ pagination.pageCount }}</span>
      <button
        :disabled="pagination.page === pagination.pageCount"
        @click="goToPage(pagination.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const currentPage = computed(() => Number(route.query.page) || 1);
const searchQuery = ref((route.query.search as string) || '');
const showFeatured = ref(route.query.featured === 'true');

const { studentWorks, pagination, pending, error, refresh } = useStudentWorks({
  page: currentPage.value,
  pageSize: 12,
  featured: showFeatured.value || undefined,
  search: searchQuery.value || undefined,
});

let searchTimeout: NodeJS.Timeout;

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    updateQuery();
  }, 500);
};

const handleFilterChange = () => {
  updateQuery();
};

const updateQuery = () => {
  router.push({
    query: {
      page: '1',
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(showFeatured.value && { featured: 'true' }),
    },
  });
};

const goToPage = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page: page.toString(),
    },
  });
};

useHead({
  title: 'Student Works',
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.filters input[type="text"] {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.work-card {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  background: #ffd700;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.work-card h3 {
  margin: 0 0 0.5rem 0;
}

.work-card p {
  color: #666;
  margin: 0.5rem 0;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
