# CMS Data Layer Documentation

## Overview

The CMS Data Layer provides a robust, optimized interface for fetching content from the Strapi CMS. It includes comprehensive caching strategies, error handling, retry logic, and request management to ensure reliable and performant data access.

## Features

- ✅ **Stale-While-Revalidate Caching**: Serve cached data immediately while fetching fresh data in the background
- ✅ **Retry Logic**: Automatic retry with exponential backoff for failed requests
- ✅ **Request Deduplication**: Prevent duplicate requests for the same data
- ✅ **Request Cancellation**: Cancel stale requests when new ones are initiated
- ✅ **TypeScript Support**: Full type safety for all CMS content types
- ✅ **SSR/CSR Compatible**: Works seamlessly in both server-side and client-side rendering
- ✅ **Flexible Filtering**: Support for Strapi's powerful filter syntax
- ✅ **Pagination & Sorting**: Built-in support for pagination and sorting
- ✅ **Population Control**: Fine-grained control over relation population

## Architecture

### Layers

1. **Composables** (`composables/`): High-level Vue composables for components
2. **Server API Routes** (`server/api/cms/`): Nuxt server routes that proxy to Strapi
3. **Data Layer Utilities** (`utils/data-layer.ts`): Core caching and request management
4. **Server Utilities** (`server/utils/strapi.ts`): Server-side Strapi integration helpers

## Content Types

The data layer supports the following CMS content types:

### Lessons

**Composable**: `useLessons()`

```typescript
import { useLessons, useLesson, useLessonsByPart } from '~/composables/useLessons'

// Fetch all lessons
const { data: lessons } = useLessons()

// Fetch a single lesson by code
const { data: lesson } = useLesson('L1.1')

// Fetch lessons by part
const { data: partLessons } = useLessonsByPart('foundation')

// Search lessons
const { data: searchResults } = useSearchLessons('design thinking')

// Custom query
const { data: customLessons } = useLessons({
  filters: {
    partKey: { $eq: 'core-blocks' },
  },
  sort: ['order:asc'],
  pagination: {
    page: 1,
    pageSize: 10,
  },
})
```

### Knowledge Cards

**Composable**: `useKnowledgeCards()`

```typescript
import {
  useKnowledgeCards,
  useKnowledgeCard,
  useKnowledgeCardsByType,
} from '~/composables/useKnowledgeCards'

// Fetch all knowledge cards
const { data: cards } = useKnowledgeCards()

// Fetch by slug
const { data: card } = useKnowledgeCard('theory-design-thinking')

// Fetch by type
const { data: theoryCards } = useKnowledgeCardsByType('Theory')

// Fetch by tags
const { data: taggedCards } = useKnowledgeCardsByTags(['ai', 'design'])

// Search
const { data: searchResults } = useSearchKnowledgeCards('prompt')

// Featured cards
const { data: featured } = useFeaturedKnowledgeCards()
```

### Student Works

**Composable**: `useStudentWorks()`

```typescript
import {
  useStudentWorks,
  useStudentWork,
  useStudentWorksByDiscipline,
} from '~/composables/useStudentWorks'

// Fetch all student works
const { data: works } = useStudentWorks()

// Fetch by ID
const { data: work } = useStudentWork(123)

// Fetch by discipline
const { data: productWorks } = useStudentWorksByDiscipline('产品')

// Fetch by loop
const { data: loopWorks } = useStudentWorksByLoop('Loop 1')

// Search
const { data: searchResults } = useSearchStudentWorks('张三')

// Featured works
const { data: featured } = useFeaturedStudentWorks()
```

### Resources

**Composable**: `useResources()`

```typescript
import { useResources, useResource, useResourcesByCategory } from '~/composables/useResources'

// Fetch all resources
const { data: resources } = useResources()

// Fetch by ID
const { data: resource } = useResource(123)

// Fetch by category
const { data: videos } = useResourcesByCategory('Video Tutorials')

// Fetch only accessible resources
const { data: accessible } = useAccessibleResources()

// Search
const { data: searchResults } = useSearchResources('blender')

// Category-specific helpers
const { data: videos } = useVideoTutorials()
const { data: tools } = useToolLinks()
const { data: cases } = useCaseDatabases()
const { data: readings } = useReadings()
const { data: libraries } = usePBRLibraries()
```

## Common Options

All composables accept common options:

```typescript
interface UseCmsDataOptions {
  key?: string // Cache key (auto-generated if not provided)
  immediate?: boolean // Fetch immediately (default: true)
  server?: boolean // Fetch on server-side (default: true)
  lazy?: boolean // Don't block navigation (default: false)
  watch?: any[] // Reactive dependencies to watch
  cacheTime?: number // Cache duration in ms (default: 5 minutes)
  staleTime?: number // Stale threshold in ms (default: 1 minute)
  timeout?: number // Request timeout in ms (default: 30 seconds)
  retryConfig?: {
    maxRetries: number // Max retry attempts (default: 3)
    baseDelay: number // Initial delay in ms (default: 1000)
    maxDelay: number // Max delay in ms (default: 10000)
    backoffFactor: number // Backoff multiplier (default: 2)
  }
}
```

## Filtering

The data layer supports Strapi's filter operators:

```typescript
// Equal
filters: {
  category: {
    $eq: 'Video Tutorials'
  }
}

// Not equal
filters: {
  category: {
    $ne: 'Readings'
  }
}

// In array
filters: {
  type: {
    $in: ['Theory', 'Case Study']
  }
}

// Contains (case-insensitive)
filters: {
  title: {
    $containsi: 'design'
  }
}

// Greater than / Less than
filters: {
  grade: {
    $gte: '2023'
  }
}

// Logical operators
filters: {
  $or: [{ title: { $containsi: 'design' } }, { description: { $containsi: 'design' } }]
}

// Nested relations
filters: {
  lessons: {
    code: {
      $eq: 'L1.1'
    }
  }
}
```

## Sorting

```typescript
// Single sort
sort: 'title:asc'

// Multiple sorts
sort: ['order:asc', 'title:asc']
```

## Pagination

```typescript
// Page-based
pagination: {
  page: 1,
  pageSize: 20
}

// Offset-based
pagination: {
  start: 0,
  limit: 20
}
```

## Population

Control which relations are populated:

```typescript
// Populate all
populate: true

// Populate specific fields
populate: ['media', 'lessons']

// Nested population
populate: {
  media: '*',
  lessons: {
    populate: ['part', 'loop']
  }
}
```

## Caching Strategy

### Stale-While-Revalidate

The data layer implements a stale-while-revalidate strategy:

1. **Fresh Data**: If cached data is fresh (within `staleTime`), return it immediately
2. **Stale Data**: If cached data is stale but valid (within `cacheTime`), return it and fetch fresh data in background
3. **No Data**: If no cached data or expired, fetch fresh data

### Cache Invalidation

```typescript
import { invalidateCmsCache } from '~/composables/useCmsData'

// Invalidate specific pattern
invalidateCmsCache(/^lessons-/)

// Invalidate all
invalidateCmsCache()
```

### Cache Keys

Cache keys are auto-generated based on endpoint and parameters. You can override:

```typescript
const { data } = useLessons({
  key: 'my-custom-key',
})
```

## Error Handling

### Retry Logic

Failed requests are automatically retried with exponential backoff:

1. **First retry**: Wait 1 second
2. **Second retry**: Wait 2 seconds
3. **Third retry**: Wait 4 seconds
4. **Max retries**: 3 attempts

Retryable errors:

- Network errors
- Timeout errors
- 5xx server errors
- 429 Too Many Requests

Non-retryable errors:

- 4xx client errors (except 429)
- Invalid data errors

### Fallback to Cached Data

If a fetch fails and cached data is available, the cached data is returned with a console warning:

```typescript
const { data, error } = useLessons()

// data will contain cached data if fetch fails
// error will contain the error details
```

### Custom Error Handling

```typescript
const { data, error, refresh } = useLessons()

watch(error, (newError) => {
  if (newError) {
    console.error('Failed to fetch lessons:', newError)
    // Handle error (show notification, etc.)
  }
})

// Manually retry
await refresh()
```

## Request Deduplication

Multiple simultaneous requests for the same data are deduplicated:

```typescript
// These will result in a single network request
const lessons1 = useLessons()
const lessons2 = useLessons()
const lessons3 = useLessons()
```

## Request Cancellation

Stale requests are automatically cancelled:

```typescript
// Manual cancellation
import { cancelRequest } from '~/utils/data-layer'

cancelRequest('lessons')
```

## Performance Optimizations

### Batch Queries

Fetch related data efficiently:

```typescript
// BAD: Multiple separate requests
const { data: part1 } = useLessonsByPart('foundation')
const { data: part2 } = useLessonsByPart('core-blocks')
const { data: part3 } = useLessonsByPart('extended-thinking')

// GOOD: Single request with filters
const { data: allLessons } = useLessons({
  filters: {
    partKey: { $in: ['foundation', 'core-blocks', 'extended-thinking'] },
  },
})
```

### Lazy Loading

Use `lazy: true` for non-critical data:

```typescript
const { data, pending } = useLessons({
  lazy: true,
})
```

### Preloading

Preload critical data:

```typescript
// In page setup
const { data: lessons } = useLessons({
  immediate: true,
  server: true,
})

// Data will be available immediately on client
```

### Pagination

Use pagination for large datasets:

```typescript
const page = ref(1)
const pageSize = 20

const { data: lessons } = useLessons({
  pagination: {
    page: unref(page),
    pageSize,
  },
  watch: [page],
})

// Load next page
function nextPage() {
  page.value++
}
```

## Testing

The data layer includes comprehensive tests. See:

- `tests/composables/` for composable tests
- `tests/utils/data-layer.spec.ts` for utility tests
- `tests/server/` for server route tests

Run tests:

```bash
pnpm test:unit
```

## Troubleshooting

### Issue: Data not updating

**Solution**: Check cache settings and invalidate cache if needed:

```typescript
invalidateCmsCache()
```

### Issue: Slow initial load

**Solution**: Enable server-side rendering and preloading:

```typescript
const { data } = useLessons({
  server: true,
  immediate: true,
})
```

### Issue: Request timeout

**Solution**: Increase timeout:

```typescript
const { data } = useLessons({
  timeout: 60000, // 60 seconds
})
```

### Issue: Too many retries

**Solution**: Adjust retry configuration:

```typescript
const { data } = useLessons({
  retryConfig: {
    maxRetries: 1,
    baseDelay: 500,
  },
})
```

### Issue: Stale data shown

**Solution**: Reduce stale time:

```typescript
const { data } = useLessons({
  staleTime: 30000, // 30 seconds
})
```

## Migration Guide

### From Direct Strapi Calls

Before:

```typescript
const { data } = await useFetch('/api/lessons')
```

After:

```typescript
const { data } = useLessons()
```

### From Custom Composables

Before:

```typescript
const { data } = useAsyncData('lessons', () => $fetch('/api/lessons'))
```

After:

```typescript
const { data } = useLessons()
```

## Best Practices

1. **Use typed composables**: Always use the specific composables (`useLessons`, `useKnowledgeCards`, etc.) instead of generic `useFetch`
2. **Leverage caching**: Let the data layer handle caching automatically
3. **Use lazy loading**: For non-critical data, use `lazy: true`
4. **Invalidate cache after mutations**: After creating/updating/deleting content, invalidate relevant cache
5. **Handle errors gracefully**: Always check for errors and provide fallbacks
6. **Use pagination**: For large datasets, always use pagination
7. **Optimize population**: Only populate relations you need
8. **Monitor performance**: Use browser dev tools to monitor cache hits and network requests

## API Reference

### Composables

- `useLessons()` - Fetch lessons
- `useLesson(code)` - Fetch single lesson
- `useLessonsByPart(partKey)` - Fetch lessons by part
- `useLessonsByLoop(loopCode)` - Fetch lessons by loop
- `useSearchLessons(query)` - Search lessons
- `useKnowledgeCards()` - Fetch knowledge cards
- `useKnowledgeCard(slug)` - Fetch single knowledge card
- `useKnowledgeCardsByType(type)` - Fetch knowledge cards by type
- `useKnowledgeCardsByTags(tags)` - Fetch knowledge cards by tags
- `useSearchKnowledgeCards(query)` - Search knowledge cards
- `useFeaturedKnowledgeCards()` - Fetch featured knowledge cards
- `useStudentWorks()` - Fetch student works
- `useStudentWork(id)` - Fetch single student work
- `useStudentWorksByDiscipline(discipline)` - Fetch student works by discipline
- `useStudentWorksByLoop(loop)` - Fetch student works by loop
- `useStudentWorksByGrade(grade)` - Fetch student works by grade
- `useSearchStudentWorks(query)` - Search student works
- `useFeaturedStudentWorks()` - Fetch featured student works
- `useResources()` - Fetch resources
- `useResource(id)` - Fetch single resource
- `useResourcesByCategory(category)` - Fetch resources by category
- `useAccessibleResources()` - Fetch accessible resources
- `useSearchResources(query)` - Search resources
- `useVideoTutorials()` - Fetch video tutorials
- `useToolLinks()` - Fetch tool links
- `useCaseDatabases()` - Fetch case databases
- `useReadings()` - Fetch readings
- `usePBRLibraries()` - Fetch PBR libraries

### Utilities

- `fetchWithDataLayer(url, params, options)` - Fetch with full data layer features
- `invalidateCache(pattern)` - Invalidate cache entries
- `cancelRequest(key)` - Cancel active request
- `buildStrapiQuery(params)` - Build Strapi query parameters

## Support

For issues or questions, please refer to:

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Strapi Documentation](https://docs.strapi.io)
- Project README.md
