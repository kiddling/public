# CMS Data Layer - Quick Start Guide

## What is the CMS Data Layer?

The CMS Data Layer is a complete solution for fetching and managing content from the Strapi CMS. It provides automatic caching, error handling, retry logic, and more - so you can focus on building features, not infrastructure.

## Quick Start

### 1. Fetch Lessons

```vue
<script setup>
import { useLessons } from '~/composables/useLessons'

const { data: lessons, pending, error } = useLessons()
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="lesson in lessons?.data" :key="lesson.id">
        {{ lesson.attributes.title }}
      </div>
    </div>
  </div>
</template>
```

### 2. Fetch Single Lesson

```vue
<script setup>
import { useLesson } from '~/composables/useLessons'

const route = useRoute()
const { data: lesson } = useLesson(route.params.code)
</script>

<template>
  <div v-if="lesson">
    <h1>{{ lesson.data.attributes.title }}</h1>
    <p>{{ lesson.data.attributes.summary }}</p>
  </div>
</template>
```

### 3. Search and Filter

```vue
<script setup>
import { useSearchLessons } from '~/composables/useLessons'

const searchQuery = ref('')
const { data: results } = useSearchLessons(searchQuery)

watch(searchQuery, () => {
  // Automatically refetches when query changes
})
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Search lessons..." />
    <div v-for="lesson in results?.data" :key="lesson.id">
      {{ lesson.attributes.title }}
    </div>
  </div>
</template>
```

### 4. Knowledge Cards

```vue
<script setup>
import { useKnowledgeCards, useKnowledgeCardsByType } from '~/composables/useKnowledgeCards'

// All knowledge cards
const { data: allCards } = useKnowledgeCards()

// Filter by type
const { data: theoryCards } = useKnowledgeCardsByType('Theory')
</script>
```

### 5. Student Works

```vue
<script setup>
import { useStudentWorks, useStudentWorksByDiscipline } from '~/composables/useStudentWorks'

// All student works
const { data: allWorks } = useStudentWorks()

// Filter by discipline
const { data: productWorks } = useStudentWorksByDiscipline('产品')
</script>
```

### 6. Resources

```vue
<script setup>
import { useResources, useVideoTutorials } from '~/composables/useResources'

// All resources
const { data: allResources } = useResources()

// Video tutorials only
const { data: videos } = useVideoTutorials()
</script>
```

## Key Features

### ✅ Automatic Caching

Data is automatically cached for 5 minutes. Fresh requests serve cached data immediately.

```typescript
// First call - fetches from API
const { data: lessons1 } = useLessons()

// Second call - uses cached data
const { data: lessons2 } = useLessons()
```

### ✅ Stale-While-Revalidate

Stale cached data is served immediately while fresh data is fetched in the background.

```typescript
// Customize cache and stale times
const { data } = useLessons({
  cacheTime: 10 * 60 * 1000, // 10 minutes
  staleTime: 60 * 1000,       // 1 minute
})
```

### ✅ Automatic Retry

Failed requests are automatically retried with exponential backoff.

```typescript
// Customize retry behavior
const { data } = useLessons({
  retryConfig: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 2,
  },
})
```

### ✅ Request Deduplication

Multiple simultaneous requests for the same data result in a single network call.

### ✅ TypeScript Support

Full type safety for all CMS content types.

```typescript
import type { StrapiCollectionResponse, KnowledgeCardAttributes } from '~/types/cms'

const { data } = useKnowledgeCards()
// data is typed as StrapiCollectionResponse<KnowledgeCardAttributes>
```

## Common Patterns

### Pagination

```vue
<script setup>
const page = ref(1)
const pageSize = 20

const { data: lessons } = useLessons({
  pagination: {
    page: unref(page),
    pageSize,
  },
  watch: [page],
})

function nextPage() {
  page.value++
}

function prevPage() {
  page.value--
}
</script>
```

### Lazy Loading

```vue
<script setup>
// Don't block navigation while loading
const { data: lessons, pending } = useLessons({
  lazy: true,
})
</script>

<template>
  <div>
    <Spinner v-if="pending" />
    <LessonList :lessons="lessons" />
  </div>
</template>
```

### SSR with Client Hydration

```vue
<script setup>
// Fetch on server, hydrate on client
const { data: lessons } = useLessons({
  server: true,
  immediate: true,
})
</script>
```

### Manual Refresh

```vue
<script setup>
const { data, refresh, pending } = useLessons()

async function reloadLessons() {
  await refresh()
}
</script>

<template>
  <button @click="reloadLessons" :disabled="pending">
    Refresh
  </button>
</template>
```

### Cache Invalidation

```vue
<script setup>
import { invalidateCmsCache } from '~/composables/useCmsData'

async function createLesson(lessonData) {
  await $fetch('/api/cms/lessons', {
    method: 'POST',
    body: lessonData,
  })
  
  // Invalidate lessons cache
  invalidateCmsCache(/^lessons-/)
}
</script>
```

## Advanced Filtering

### Multiple Conditions

```typescript
const { data } = useLessons({
  filters: {
    $and: [
      { partKey: { $eq: 'foundation' } },
      { order: { $lte: 10 } },
    ],
  },
})
```

### OR Conditions

```typescript
const { data } = useSearchLessons('design', {
  filters: {
    $or: [
      { title: { $containsi: 'design' } },
      { summary: { $containsi: 'design' } },
      { body: { $containsi: 'design' } },
    ],
  },
})
```

### Relation Filters

```typescript
const { data } = useKnowledgeCards({
  filters: {
    lessons: {
      code: { $eq: 'L1.1' },
    },
  },
})
```

## Performance Tips

1. **Use Pagination**: Always paginate large datasets
2. **Lazy Load**: Use `lazy: true` for non-critical data
3. **Optimize Population**: Only populate relations you need
4. **Cache Wisely**: Adjust cache times based on content update frequency
5. **Batch Queries**: Fetch related data in single requests when possible

## Error Handling

### Basic Error Handling

```vue
<script setup>
const { data, error } = useLessons()
</script>

<template>
  <div v-if="error" class="error">
    Failed to load lessons: {{ error.message }}
  </div>
</template>
```

### Watch for Errors

```vue
<script setup>
const { data, error } = useLessons()

watch(error, (newError) => {
  if (newError) {
    console.error('Lesson fetch error:', newError)
    // Show toast notification, etc.
  }
})
</script>
```

### Retry on Error

```vue
<script setup>
const { data, error, refresh } = useLessons()

async function retry() {
  await refresh()
}
</script>

<template>
  <div v-if="error">
    <p>{{ error.message }}</p>
    <button @click="retry">Retry</button>
  </div>
</template>
```

## Troubleshooting

### Data Not Updating?

Invalidate the cache:

```typescript
import { invalidateCmsCache } from '~/composables/useCmsData'

invalidateCmsCache()
```

### Slow Loading?

Enable SSR and preloading:

```typescript
const { data } = useLessons({
  server: true,
  immediate: true,
})
```

### Request Timeout?

Increase timeout:

```typescript
const { data } = useLessons({
  timeout: 60000, // 60 seconds
})
```

### Too Many Retries?

Adjust retry settings:

```typescript
const { data } = useLessons({
  retryConfig: {
    maxRetries: 1,
  },
})
```

## API Reference

See [CMS_DATA_LAYER.md](./CMS_DATA_LAYER.md) for complete API documentation.

## Examples

See the `examples/` directory for complete working examples of common use cases.

## Support

For issues or questions:
1. Check this README
2. Check [CMS_DATA_LAYER.md](./CMS_DATA_LAYER.md)
3. Check the project README.md
4. Review the test files for usage examples
