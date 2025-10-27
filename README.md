# CMS Data Layer

A comprehensive Nuxt 3 application with Strapi CMS integration, featuring typed composables, SSR-aware caching, ISR (Incremental Static Regeneration), and network optimizations for domestic environments.

## Features

- 🚀 **Nuxt 3** with TypeScript support
- 📝 **Strapi CMS Integration** with typed API client
- 🔄 **SSR-aware Caching** with automatic cache invalidation
- ⚡ **ISR Support** using Nuxt's SWR (stale-while-revalidate) strategy
- 🛡️ **Type Safety** with TypeScript interfaces and Zod schemas
- 🔌 **Reusable Composables** for all main entities
- 🌐 **Network Optimizations** for China (timeouts, retries)
- 🧪 **Unit Tests** with Vitest
- 📄 **Nuxt Content** integration for static fallbacks

## Architecture

### Directory Structure

```
.
├── composables/           # Reusable composables
│   ├── useLessons.ts     # Lessons data fetching
│   ├── useKnowledgeCards.ts
│   ├── useStudentWorks.ts
│   └── useResources.ts
├── pages/                 # Application pages
│   ├── index.vue
│   ├── lessons/
│   ├── knowledge-cards/
│   ├── student-works/
│   └── resources/
├── schemas/               # Zod validation schemas
│   └── strapi.ts
├── server/                # Server-side API routes
│   ├── api/              # API endpoints with ISR
│   └── utils/            # Server utilities
├── tests/                 # Unit tests
│   ├── composables/
│   ├── mocks/
│   └── utils/
├── types/                 # TypeScript type definitions
│   └── strapi.ts
└── utils/                 # Client utilities
    └── api-client.ts     # API client with retry logic
```

## Setup

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Running Strapi instance

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cms-data-layer
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory:

```env
# Strapi Configuration
NUXT_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_TOKEN=your-api-token-here

# Public Strapi URL (optional, defaults to NUXT_STRAPI_URL)
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment Configuration

### Strapi Setup

#### 1. Creating API Tokens

To connect to Strapi, you need to generate an API token:

1. Log into your Strapi admin panel
2. Navigate to Settings → API Tokens
3. Click "Create new API Token"
4. Configure the token:
   - **Name**: `cms-data-layer` (or your preferred name)
   - **Token duration**: Choose based on your needs
   - **Token type**: Select appropriate permissions
5. Copy the generated token and add it to your `.env` file

#### 2. Environment-Specific Configuration

**Development:**
```env
NUXT_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_TOKEN=dev-token-here
```

**Staging:**
```env
NUXT_STRAPI_URL=https://staging-strapi.example.com
NUXT_STRAPI_TOKEN=staging-token-here
```

**Production:**
```env
NUXT_STRAPI_URL=https://strapi.example.com
NUXT_STRAPI_TOKEN=production-token-here
```

### Network Configuration for China

The API client is pre-configured with optimizations for domestic network constraints:

- **Timeout**: 15 seconds (configurable)
- **Retries**: 3 attempts with exponential backoff
- **Retry Delay**: 1 second base delay

These can be adjusted in `server/utils/strapi.ts`:

```typescript
apiClient = createApiClient({
  baseURL: config.strapi.url,
  token: config.strapi.token,
  timeout: 20000,      // Increase timeout to 20s
  retries: 5,          // Increase retries to 5
  retryDelay: 2000,    // Increase base delay to 2s
});
```

## Content Types

The application supports the following Strapi content types:

### Lessons

```typescript
{
  title: string;
  description?: string;
  content?: string;
  slug: string;
  grade?: string;
  subject?: string;
  order?: number;
  duration?: number;
  objectives?: string[];
  materials?: string[];
  thumbnail?: Media;
  knowledgeCards?: KnowledgeCard[];
  resources?: Resource[];
}
```

### Knowledge Cards

```typescript
{
  title: string;
  content: string;
  slug: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  order?: number;
  image?: Media;
  relatedCards?: KnowledgeCard[];
  lessons?: Lesson[];
}
```

### Student Works

```typescript
{
  title: string;
  description?: string;
  slug: string;
  studentName?: string;
  studentGrade?: string;
  completionDate?: string;
  category?: string;
  featured?: boolean;
  images?: Media[];
  lesson?: Lesson;
}
```

### Resources

```typescript
{
  title: string;
  description?: string;
  type: 'document' | 'video' | 'image' | 'link' | 'other';
  url?: string;
  slug: string;
  category?: string;
  tags?: string[];
  file?: Media;
  lessons?: Lesson[];
}
```

## Usage

### Using Composables

All composables follow a consistent pattern and support SSR/CSR contexts:

#### Fetching Collections

```vue
<script setup lang="ts">
const { lessons, pagination, pending, error, refresh } = useLessons({
  page: 1,
  pageSize: 10,
  grade: '1',
  subject: 'math',
  search: 'intro',
});
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="lesson in lessons" :key="lesson.id">
      {{ lesson.attributes.title }}
    </div>
    <div>
      Page {{ pagination.page }} of {{ pagination.pageCount }}
    </div>
  </div>
</template>
```

#### Fetching Single Items

```vue
<script setup lang="ts">
const route = useRoute();
const lessonId = computed(() => route.params.id);

const { lesson, pending, error } = useLesson(lessonId);
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <article v-else-if="lesson">
    <h1>{{ lesson.attributes.title }}</h1>
    <p>{{ lesson.attributes.description }}</p>
  </article>
</template>
```

#### Available Composables

- `useLessons(options)` - Fetch lessons collection
- `useLesson(id)` - Fetch single lesson by ID
- `useLessonBySlug(slug)` - Fetch lesson by slug
- `useKnowledgeCards(options)` - Fetch knowledge cards collection
- `useKnowledgeCard(id)` - Fetch single knowledge card
- `useStudentWorks(options)` - Fetch student works collection
- `useStudentWork(id)` - Fetch single student work
- `useResources(options)` - Fetch resources collection
- `useResource(id)` - Fetch single resource

### Advanced Filtering

Use the filter builder utility for complex queries:

```typescript
import { createFilterBuilder } from '~/utils/api-client';

const filters = createFilterBuilder();

// Simple equality
const filter1 = filters.eq('grade', '1');

// Multiple conditions with AND
const filter2 = filters.and(
  filters.eq('published', true),
  filters.gt('views', 100)
);

// OR conditions
const filter3 = filters.or(
  filters.eq('category', 'math'),
  filters.eq('category', 'science')
);

// Complex nested filters
const filter4 = filters.and(
  filters.eq('published', true),
  filters.or(
    filters.containsi('title', 'math'),
    filters.containsi('description', 'math')
  )
);
```

### Caching Strategy

The application uses a multi-layer caching approach:

1. **SSR Payload Caching**: Data fetched during SSR is serialized and sent to the client
2. **SWR (Stale-While-Revalidate)**: Routes are cached for 1 hour with background revalidation
3. **Composable-level Caching**: Each composable caches based on unique query keys

#### Route Rules (nuxt.config.ts)

```typescript
routeRules: {
  '/api/lessons/**': { swr: 3600 },      // 1 hour
  '/api/knowledge-cards/**': { swr: 3600 },
  '/api/student-works/**': { swr: 3600 },
  '/api/resources/**': { swr: 3600 },
}
```

#### Cache Invalidation

To manually refresh data:

```vue
<script setup lang="ts">
const { lessons, refresh } = useLessons();

const handleRefresh = async () => {
  await refresh();
};
</script>
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run dev:test

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests are located in the `tests/` directory and use Vitest with mocked Strapi responses:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mockLessons } from '../mocks/strapi-data';

describe('useLessons', () => {
  it('should fetch lessons successfully', async () => {
    global.$fetch = vi.fn().mockResolvedValue(mockLessons);
    
    const { lessons, error } = useLessons();
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(lessons.value).toHaveLength(2);
    expect(error.value).toBeNull();
  });
});
```

### Mock Data

Mock data is provided in `tests/mocks/strapi-data.ts` for consistent testing across all composables.

## Extending the Data Layer

### Adding New Content Types

1. **Define TypeScript types** in `types/strapi.ts`:

```typescript
export interface NewContentAttributes {
  title: string;
  // ... other fields
}

export type NewContent = StrapiEntity<NewContentAttributes>;
```

2. **Create Zod schema** in `schemas/strapi.ts`:

```typescript
export const newContentSchema = strapiBaseAttributesSchema.extend({
  title: z.string(),
  // ... other fields
});
```

3. **Create server API route** in `server/api/new-content/index.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const query = getQuery(event);
  
  const response = await client.get('/new-content', {
    query: {
      // ... query params
    },
  });
  
  return response;
});
```

4. **Create composable** in `composables/useNewContent.ts`:

```typescript
export function useNewContent(options = {}) {
  const { data, pending, error, refresh } = useFetch(
    '/api/new-content',
    {
      query: options,
      key: `new-content-${JSON.stringify(options)}`,
    }
  );
  
  return {
    content: computed(() => data.value?.data || []),
    pending,
    error,
    refresh,
  };
}
```

5. **Add tests** in `tests/composables/useNewContent.test.ts`

### Adding New Query Parameters

To support new Strapi query parameters:

1. Update `StrapiQueryParams` interface in `types/strapi.ts`
2. Update `buildQueryParams` function in `utils/api-client.ts`
3. Add support in server routes and composables

### Custom Filter Operators

Add new filter operators to `createFilterBuilder` in `utils/api-client.ts`:

```typescript
export function createFilterBuilder() {
  return {
    // ... existing operators
    
    between(field: string, min: number, max: number) {
      return {
        [field]: {
          $gte: min,
          $lte: max,
        },
      };
    },
  };
}
```

## Nuxt Content Integration

The application includes Nuxt Content for static page fallbacks:

1. Create markdown files in `content/` directory
2. Access them using `useAsyncData` or `queryContent`

Example:

```vue
<script setup lang="ts">
const { data: page } = await useAsyncData('about', () => 
  queryContent('/about').findOne()
);
</script>

<template>
  <ContentDoc :value="page" />
</template>
```

## Best Practices

### 1. Always Handle Loading and Error States

```vue
<div v-if="pending">Loading...</div>
<div v-else-if="error">Error: {{ error.message }}</div>
<div v-else><!-- content --></div>
```

### 2. Use Reactive Parameters

```typescript
const lessonId = computed(() => route.params.id);
const { lesson } = useLesson(lessonId);
```

### 3. Leverage SSR Caching

Fetch data in `<script setup>` for automatic SSR hydration:

```vue
<script setup lang="ts">
const { lessons } = useLessons(); // Automatically SSR-aware
</script>
```

### 4. Optimize Populate Queries

Only populate relations you need:

```typescript
populate: {
  thumbnail: true,
  knowledgeCards: {
    populate: ['image'],
  },
}
```

### 5. Use Type Guards

```typescript
if (lesson.value?.attributes.knowledgeCards?.data) {
  const cards = Array.isArray(lesson.value.attributes.knowledgeCards.data)
    ? lesson.value.attributes.knowledgeCards.data
    : [];
}
```

## Troubleshooting

### Connection Timeouts

If experiencing frequent timeouts:

1. Increase timeout in `server/utils/strapi.ts`
2. Check network connectivity to Strapi server
3. Verify firewall rules for China domestic access

### 401 Unauthorized Errors

1. Verify API token is correct in `.env`
2. Check token permissions in Strapi admin
3. Ensure token hasn't expired

### Data Not Updating

1. Check cache configuration in `nuxt.config.ts`
2. Use `refresh()` to manually invalidate cache
3. Clear `.nuxt` directory and rebuild

### TypeScript Errors

1. Run `npm run postinstall` to regenerate Nuxt types
2. Restart TypeScript server in your IDE
3. Check for type mismatches in Strapi responses

## Performance Optimization

### 1. Enable ISR for Static Routes

```typescript
// nuxt.config.ts
routeRules: {
  '/lessons': { swr: 3600 },
  '/lessons/**': { swr: 7200 },
}
```

### 2. Implement Lazy Loading

```vue
<script setup lang="ts">
const { lessons } = useLessons({ immediate: false });

onMounted(() => {
  // Fetch only when needed
});
</script>
```

### 3. Use Pagination

Always paginate large collections:

```typescript
const { lessons, pagination } = useLessons({
  pageSize: 20,
});
```

### 4. Optimize Media Queries

Request specific image formats:

```typescript
populate: {
  thumbnail: {
    fields: ['url', 'alternativeText'],
    populate: {
      formats: ['thumbnail', 'small'],
    },
  },
}
```

## License

MIT

## Support

For issues, questions, or contributions, please refer to the project repository.
