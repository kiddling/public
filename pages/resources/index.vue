<template>
  <div class="container">
    <h1>Resources</h1>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search resources..."
        @input="handleSearch"
      />

      <select v-model="selectedType" @change="handleFilterChange">
        <option value="">All Types</option>
        <option value="document">Document</option>
        <option value="video">Video</option>
        <option value="image">Image</option>
        <option value="link">Link</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div v-if="pending" class="loading">Loading resources...</div>
    
    <div v-else-if="error" class="error">
      <p>Error loading resources: {{ error.message }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <div v-else-if="resources.length === 0" class="empty">
      No resources found.
    </div>

    <div v-else class="resources-list">
      <div v-for="resource in resources" :key="resource.id" class="resource-card">
        <div class="type-icon">
          {{ getTypeIcon(resource.attributes.type) }}
        </div>
        <div class="resource-content">
          <h3>{{ resource.attributes.title }}</h3>
          <p v-if="resource.attributes.description">
            {{ resource.attributes.description }}
          </p>
          <div class="meta">
            <span class="badge">{{ resource.attributes.type }}</span>
            <span v-if="resource.attributes.category">{{ resource.attributes.category }}</span>
          </div>
          <div v-if="resource.attributes.tags && resource.attributes.tags.length > 0" class="tags">
            <span v-for="tag in resource.attributes.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
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
const selectedType = ref((route.query.type as string) || '');

const { resources, pagination, pending, error, refresh } = useResources({
  page: currentPage.value,
  pageSize: 15,
  type: selectedType.value as any || undefined,
  search: searchQuery.value || undefined,
});

let searchTimeout: NodeJS.Timeout;

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    document: '📄',
    video: '🎥',
    image: '🖼️',
    link: '🔗',
    other: '📎',
  };
  return icons[type] || '📎';
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
      ...(selectedType.value && { type: selectedType.value }),
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
  title: 'Resources',
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

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-card {
  display: flex;
  gap: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.type-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.resource-content {
  flex: 1;
}

.resource-content h3 {
  margin: 0 0 0.5rem 0;
}

.resource-content p {
  color: #666;
  margin: 0.5rem 0;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: #0070f3;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
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
