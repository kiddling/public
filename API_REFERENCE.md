# API Reference

Complete reference for all composables, utilities, and server endpoints in the CMS data layer.

## Composables

### useLessons

Fetch a collection of lessons with optional filters and pagination.

**Signature:**
```typescript
function useLessons(options?: UseLessonsOptions): {
  lessons: ComputedRef<Lesson[]>;
  pagination: ComputedRef<PaginationMeta | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Options:**
```typescript
interface UseLessonsOptions {
  page?: number;        // Current page (default: 1)
  pageSize?: number;    // Items per page (default: 10)
  grade?: string;       // Filter by grade
  subject?: string;     // Filter by subject
  search?: string;      // Search in title and description
  immediate?: boolean;  // Fetch immediately (default: true)
}
```

**Example:**
```vue
<script setup lang="ts">
const { lessons, pagination, pending, error, refresh } = useLessons({
  page: 1,
  pageSize: 12,
  grade: '1',
  subject: 'math',
});
</script>
```

---

### useLesson

Fetch a single lesson by ID.

**Signature:**
```typescript
function useLesson(
  id: MaybeRef<string | number>,
  options?: UseOptions
): {
  lesson: ComputedRef<Lesson | null | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Example:**
```vue
<script setup lang="ts">
const route = useRoute();
const lessonId = computed(() => route.params.id);
const { lesson, pending, error } = useLesson(lessonId);
</script>
```

---

### useLessonBySlug

Fetch a single lesson by slug.

**Signature:**
```typescript
function useLessonBySlug(
  slug: MaybeRef<string>,
  options?: UseOptions
): {
  lesson: ComputedRef<Lesson | null | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Example:**
```vue
<script setup lang="ts">
const { lesson } = useLessonBySlug('intro-to-math');
</script>
```

---

### useKnowledgeCards

Fetch a collection of knowledge cards with optional filters.

**Signature:**
```typescript
function useKnowledgeCards(options?: UseKnowledgeCardsOptions): {
  knowledgeCards: ComputedRef<KnowledgeCard[]>;
  pagination: ComputedRef<PaginationMeta | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Options:**
```typescript
interface UseKnowledgeCardsOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
  tags?: string | string[];
  immediate?: boolean;
}
```

**Example:**
```vue
<script setup lang="ts">
const { knowledgeCards, pagination } = useKnowledgeCards({
  difficulty: 'beginner',
  tags: ['math', 'addition'],
});
</script>
```

---

### useKnowledgeCard

Fetch a single knowledge card by ID.

**Signature:**
```typescript
function useKnowledgeCard(
  id: MaybeRef<string | number>,
  options?: UseOptions
): {
  knowledgeCard: ComputedRef<KnowledgeCard | null | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

---

### useStudentWorks

Fetch a collection of student works.

**Signature:**
```typescript
function useStudentWorks(options?: UseStudentWorksOptions): {
  studentWorks: ComputedRef<StudentWork[]>;
  pagination: ComputedRef<PaginationMeta | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Options:**
```typescript
interface UseStudentWorksOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  grade?: string;
  search?: string;
  immediate?: boolean;
}
```

**Example:**
```vue
<script setup lang="ts">
const { studentWorks } = useStudentWorks({
  featured: true,
  pageSize: 6,
});
</script>
```

---

### useStudentWork

Fetch a single student work by ID.

---

### useResources

Fetch a collection of resources.

**Signature:**
```typescript
function useResources(options?: UseResourcesOptions): {
  resources: ComputedRef<Resource[]>;
  pagination: ComputedRef<PaginationMeta | undefined>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}
```

**Options:**
```typescript
interface UseResourcesOptions {
  page?: number;
  pageSize?: number;
  type?: 'document' | 'video' | 'image' | 'link' | 'other';
  category?: string;
  search?: string;
  tags?: string | string[];
  immediate?: boolean;
}
```

**Example:**
```vue
<script setup lang="ts">
const { resources } = useResources({
  type: 'document',
  tags: 'worksheet',
});
</script>
```

---

### useResource

Fetch a single resource by ID.

---

## Utilities

### createApiClient

Create a configured API client for making requests to Strapi.

**Signature:**
```typescript
function createApiClient(options: ApiClientOptions): {
  client: $Fetch;
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}
```

**Options:**
```typescript
interface ApiClientOptions {
  baseURL: string;
  token?: string;
  timeout?: number;      // Default: 15000ms
  retries?: number;      // Default: 3
  retryDelay?: number;   // Default: 1000ms
}
```

**Example:**
```typescript
const client = createApiClient({
  baseURL: 'https://strapi.example.com',
  token: 'your-api-token',
  timeout: 20000,
  retries: 5,
});

const data = await client.get('/lessons');
```

---

### buildQueryParams

Convert Strapi query parameters object to URL query params.

**Signature:**
```typescript
function buildQueryParams(params: StrapiQueryParams): Record<string, unknown>
```

**Example:**
```typescript
const params = buildQueryParams({
  filters: {
    grade: { $eq: '1' },
  },
  populate: ['thumbnail', 'author'],
  sort: ['createdAt:desc'],
  pagination: {
    page: 1,
    pageSize: 10,
  },
});
```

---

### createFilterBuilder

Create a filter builder for constructing Strapi filter queries.

**Signature:**
```typescript
function createFilterBuilder(): FilterBuilder
```

**Methods:**

| Method | Description | Example |
|--------|-------------|---------|
| `eq(field, value)` | Equal to | `eq('status', 'published')` |
| `ne(field, value)` | Not equal to | `ne('status', 'draft')` |
| `in(field, values)` | In array | `in('category', ['math', 'science'])` |
| `notIn(field, values)` | Not in array | `notIn('status', ['draft', 'archived'])` |
| `contains(field, value)` | Contains (case-sensitive) | `contains('title', 'Math')` |
| `notContains(field, value)` | Not contains (case-sensitive) | - |
| `containsi(field, value)` | Contains (case-insensitive) | `containsi('title', 'math')` |
| `notContainsi(field, value)` | Not contains (case-insensitive) | - |
| `gt(field, value)` | Greater than | `gt('views', 100)` |
| `gte(field, value)` | Greater than or equal | `gte('views', 100)` |
| `lt(field, value)` | Less than | `lt('views', 1000)` |
| `lte(field, value)` | Less than or equal | `lte('views', 1000)` |
| `and(...filters)` | AND condition | `and(eq('published', true), gt('views', 100))` |
| `or(...filters)` | OR condition | `or(eq('category', 'math'), eq('category', 'science'))` |
| `not(filter)` | NOT condition | `not(eq('published', false))` |

**Example:**
```typescript
const filters = createFilterBuilder();

const complexFilter = filters.and(
  filters.eq('published', true),
  filters.or(
    filters.containsi('title', 'math'),
    filters.containsi('description', 'math')
  ),
  filters.gt('views', 100)
);
```

---

### Strapi Helper Functions

#### getStrapiMediaUrl

Get the full URL for a Strapi media file.

**Signature:**
```typescript
function getStrapiMediaUrl(
  media: StrapiRelation<StrapiMedia> | undefined,
  format?: string
): string | null
```

**Example:**
```typescript
const imageUrl = getStrapiMediaUrl(lesson.thumbnail, 'medium');
```

---

#### getStrapiMediaAlt

Get the alt text for a Strapi media file.

**Signature:**
```typescript
function getStrapiMediaAlt(
  media: StrapiRelation<StrapiMedia> | undefined
): string
```

---

#### getRelationIds

Extract IDs from a Strapi relation.

**Signature:**
```typescript
function getRelationIds<T>(
  relation: StrapiRelation<T> | undefined
): number[]
```

**Example:**
```typescript
const cardIds = getRelationIds(lesson.knowledgeCards);
// [1, 2, 3]
```

---

#### getRelationCount

Get the count of items in a relation.

**Signature:**
```typescript
function getRelationCount<T>(
  relation: StrapiRelation<T> | undefined
): number
```

---

#### hasRelation

Check if a relation exists and has data.

**Signature:**
```typescript
function hasRelation<T>(
  relation: StrapiRelation<T> | undefined
): boolean
```

**Example:**
```typescript
if (hasRelation(lesson.knowledgeCards)) {
  // Display related cards
}
```

---

#### formatDate

Format a date string to locale-specific format.

**Signature:**
```typescript
function formatDate(
  dateString: string,
  locale?: string
): string
```

**Example:**
```typescript
const formatted = formatDate('2024-01-15T10:30:00.000Z', 'zh-CN');
// "2024年1月15日"
```

---

#### formatDateTime

Format a datetime string to locale-specific format.

**Signature:**
```typescript
function formatDateTime(
  dateString: string,
  locale?: string
): string
```

---

#### stripHtml

Remove HTML tags from a string.

**Signature:**
```typescript
function stripHtml(html: string): string
```

**Example:**
```typescript
const plain = stripHtml('<p>Hello <strong>World</strong></p>');
// "Hello World"
```

---

#### truncateText

Truncate text to a maximum length.

**Signature:**
```typescript
function truncateText(
  text: string,
  maxLength: number,
  suffix?: string
): string
```

**Example:**
```typescript
const short = truncateText('This is a very long text', 15, '...');
// "This is a ve..."
```

---

## Server API Endpoints

All server endpoints return Strapi-formatted responses and support ISR caching.

### Lessons

#### GET /api/lessons

Fetch all lessons with optional filters.

**Query Parameters:**
- `page` (number): Page number
- `pageSize` (number): Items per page
- `grade` (string): Filter by grade
- `subject` (string): Filter by subject
- `search` (string): Search query

**Response:**
```typescript
{
  data: Lesson[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

---

#### GET /api/lessons/:id

Fetch a single lesson by ID.

**Response:**
```typescript
{
  data: Lesson | null;
  meta: {};
}
```

---

#### GET /api/lessons/slug/:slug

Fetch a single lesson by slug.

---

### Knowledge Cards

#### GET /api/knowledge-cards

Fetch all knowledge cards.

**Query Parameters:**
- `page`, `pageSize`
- `category` (string)
- `difficulty` (string): beginner, intermediate, advanced
- `search` (string)
- `tags` (string | string[])

---

#### GET /api/knowledge-cards/:id

Fetch a single knowledge card by ID.

---

### Student Works

#### GET /api/student-works

Fetch all student works.

**Query Parameters:**
- `page`, `pageSize`
- `category` (string)
- `featured` (boolean)
- `grade` (string)
- `search` (string)

---

#### GET /api/student-works/:id

Fetch a single student work by ID.

---

### Resources

#### GET /api/resources

Fetch all resources.

**Query Parameters:**
- `page`, `pageSize`
- `type` (string): document, video, image, link, other
- `category` (string)
- `search` (string)
- `tags` (string | string[])

---

#### GET /api/resources/:id

Fetch a single resource by ID.

---

## Type Definitions

### Lesson

```typescript
interface LessonAttributes {
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
  thumbnail?: StrapiRelation<StrapiMedia>;
  knowledgeCards?: StrapiRelation<KnowledgeCardAttributes>;
  resources?: StrapiRelation<ResourceAttributes>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

---

### KnowledgeCard

```typescript
interface KnowledgeCardAttributes {
  title: string;
  content: string;
  slug: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  order?: number;
  image?: StrapiRelation<StrapiMedia>;
  relatedCards?: StrapiRelation<KnowledgeCardAttributes>;
  lessons?: StrapiRelation<LessonAttributes>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

---

### StudentWork

```typescript
interface StudentWorkAttributes {
  title: string;
  description?: string;
  slug: string;
  studentName?: string;
  studentGrade?: string;
  completionDate?: string;
  category?: string;
  featured?: boolean;
  images?: StrapiRelation<StrapiMedia>;
  lesson?: StrapiRelation<LessonAttributes>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

---

### Resource

```typescript
interface ResourceAttributes {
  title: string;
  description?: string;
  type: 'document' | 'video' | 'image' | 'link' | 'other';
  url?: string;
  slug: string;
  category?: string;
  tags?: string[];
  file?: StrapiRelation<StrapiMedia>;
  lessons?: StrapiRelation<LessonAttributes>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

---

## Error Handling

All composables return an `error` ref that can be used for error handling:

```vue
<script setup lang="ts">
const { lessons, error } = useLessons();

watchEffect(() => {
  if (error.value) {
    console.error('Error fetching lessons:', error.value);
    // Handle error (show notification, fallback content, etc.)
  }
});
</script>
```

API errors are wrapped in an `ApiError` class:

```typescript
class ApiError extends Error {
  statusCode: number;
  data?: unknown;
}
```

## Caching

### Composable-level Caching

Composables use `useFetch` with unique cache keys:

```typescript
const { data } = useFetch('/api/lessons', {
  key: `lessons-${JSON.stringify(query)}`,
  getCachedData(key) {
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
  },
});
```

### Route-level Caching (ISR)

Server routes are cached using SWR strategy:

```typescript
routeRules: {
  '/api/lessons/**': { swr: 3600 }, // Cache for 1 hour
}
```

### Manual Cache Invalidation

Use the `refresh()` function returned by composables:

```typescript
const { lessons, refresh } = useLessons();

// Manually refresh data
await refresh();
```
