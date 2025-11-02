<template>
  <div class="container">
    <h1>Knowledge Cards</h1>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search knowledge cards..."
        @input="handleSearch"
      />

      <select v-model="selectedDifficulty" @change="handleFilterChange">
        <option value="">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <select v-model="selectedCategory" @change="handleFilterChange">
        <option value="">All Categories</option>
        <option value="concept">Concept</option>
        <option value="skill">Skill</option>
        <option value="theory">Theory</option>
        <option value="practice">Practice</option>
      </select>
    </div>

    <div v-if="pending" class="loading">Loading knowledge cards...</div>
    
    <div v-else-if="error" class="error">
      <p>Error loading knowledge cards: {{ error.message }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <div v-else-if="knowledgeCards.length === 0" class="empty">
      No knowledge cards found.
    </div>

    <div v-else class="cards-grid">
      <div v-for="card in knowledgeCards" :key="card.id" class="card">
        <h3>{{ card.attributes.title }}</h3>
        <p>{{ truncate(card.attributes.content, 150) }}</p>
        <div class="meta">
          <span v-if="card.attributes.category" class="badge">
            {{ card.attributes.category }}
          </span>
          <span v-if="card.attributes.difficulty" class="badge difficulty">
            {{ card.attributes.difficulty }}
          </span>
        </div>
        <div v-if="card.attributes.tags && card.attributes.tags.length > 0" class="tags">
          <span v-for="tag in card.attributes.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
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
const selectedDifficulty = ref((route.query.difficulty as string) || '');
const selectedCategory = ref((route.query.category as string) || '');

const { knowledgeCards, pagination, pending, error, refresh } = useKnowledgeCards({
  page: currentPage.value,
  pageSize: 12,
  difficulty: selectedDifficulty.value as any || undefined,
  category: selectedCategory.value || undefined,
  search: searchQuery.value || undefined,
});

let searchTimeout: NodeJS.Timeout;

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

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
      ...(selectedDifficulty.value && { difficulty: selectedDifficulty.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
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
  title: 'Knowledge Cards',
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.card h3 {
  margin: 0 0 0.5rem 0;
}

.card p {
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: #e0e0e0;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.badge.difficulty {
  background: #0070f3;
  color: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.75rem;
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
