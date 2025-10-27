<template>
  <div class="container">
    <h1>Lessons</h1>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lessons..."
        @input="handleSearch"
      />
      
      <select v-model="selectedGrade" @change="handleFilterChange">
        <option value="">All Grades</option>
        <option value="1">Grade 1</option>
        <option value="2">Grade 2</option>
        <option value="3">Grade 3</option>
        <option value="4">Grade 4</option>
        <option value="5">Grade 5</option>
        <option value="6">Grade 6</option>
      </select>

      <select v-model="selectedSubject" @change="handleFilterChange">
        <option value="">All Subjects</option>
        <option value="math">Math</option>
        <option value="science">Science</option>
        <option value="language">Language</option>
        <option value="art">Art</option>
      </select>
    </div>

    <div v-if="pending" class="loading">Loading lessons...</div>
    
    <div v-else-if="error" class="error">
      <p>Error loading lessons: {{ error.message }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <div v-else-if="lessons.length === 0" class="empty">
      No lessons found.
    </div>

    <div v-else class="lessons-grid">
      <div v-for="lesson in lessons" :key="lesson.id" class="lesson-card">
        <h3>{{ lesson.attributes.title }}</h3>
        <p v-if="lesson.attributes.description">
          {{ lesson.attributes.description }}
        </p>
        <div class="meta">
          <span v-if="lesson.attributes.grade">Grade: {{ lesson.attributes.grade }}</span>
          <span v-if="lesson.attributes.subject">Subject: {{ lesson.attributes.subject }}</span>
          <span v-if="lesson.attributes.duration">Duration: {{ lesson.attributes.duration }}min</span>
        </div>
        <NuxtLink :to="`/lessons/${lesson.id}`" class="view-link">
          View Lesson →
        </NuxtLink>
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
const selectedGrade = ref((route.query.grade as string) || '');
const selectedSubject = ref((route.query.subject as string) || '');

const { lessons, pagination, pending, error, refresh } = useLessons({
  page: currentPage.value,
  pageSize: 12,
  grade: selectedGrade.value || undefined,
  subject: selectedSubject.value || undefined,
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
      ...(selectedGrade.value && { grade: selectedGrade.value }),
      ...(selectedSubject.value && { subject: selectedSubject.value }),
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
  title: 'Lessons',
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
  margin-bottom: 2rem;
}

.filters input,
.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters input {
  flex: 1;
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

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.lesson-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.lesson-card h3 {
  margin: 0 0 0.5rem 0;
}

.lesson-card p {
  color: #666;
  margin: 0.5rem 0;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #666;
}

.view-link {
  display: inline-block;
  margin-top: 1rem;
  color: #0070f3;
  text-decoration: none;
}

.view-link:hover {
  text-decoration: underline;
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
