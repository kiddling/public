# CMS Data Layer - Troubleshooting Guide

## Common Issues and Solutions

### Issue: Data Not Updating After Changes

**Symptoms**: Content updated in Strapi CMS but not reflected in the frontend

**Possible Causes**:
1. Cached data is being served
2. Cache invalidation not triggered
3. Publish state not updated in Strapi

**Solutions**:

1. **Manual Cache Invalidation**:
```typescript
import { invalidateCmsCache } from '~/composables/useCmsData'

// Clear all cache
invalidateCmsCache()

// Clear specific pattern
invalidateCmsCache(/^lessons-/)
```

2. **Reduce Cache Time**:
```typescript
const { data } = useLessons({
  cacheTime: 60000,  // 1 minute
  staleTime: 10000,  // 10 seconds
})
```

3. **Force Refresh**:
```typescript
const { data, refresh } = useLessons()

// Force fetch fresh data
await refresh()
```

4. **Check Publish State**: Ensure content is published in Strapi admin panel

---

### Issue: Slow Initial Page Load

**Symptoms**: First page load takes a long time

**Possible Causes**:
1. Large data sets being fetched
2. SSR not enabled
3. Too much data being populated
4. No pagination

**Solutions**:

1. **Enable SSR and Preloading**:
```typescript
const { data } = useLessons({
  server: true,      // Fetch on server
  immediate: true,   // Fetch immediately
})
```

2. **Use Pagination**:
```typescript
const { data } = useLessons({
  pagination: {
    pageSize: 20,
  },
})
```

3. **Optimize Population**:
```typescript
// BAD: Populate everything
const { data } = useLessons({ populate: true })

// GOOD: Only populate what you need
const { data } = useLessons({
  populate: ['part', 'loop'],
})
```

4. **Use Lazy Loading**:
```typescript
const { data } = useLessons({
  lazy: true,  // Don't block navigation
})
```

---

### Issue: Request Timeouts

**Symptoms**: Requests fail with timeout errors

**Possible Causes**:
1. Slow Strapi backend
2. Large data sets
3. Network issues
4. Default timeout too short

**Solutions**:

1. **Increase Timeout**:
```typescript
const { data } = useLessons({
  timeout: 60000,  // 60 seconds
})
```

2. **Add Pagination**:
```typescript
const { data } = useLessons({
  pagination: {
    pageSize: 20,
  },
})
```

3. **Reduce Population Depth**:
```typescript
const { data } = useLessons({
  populate: ['part'],  // Only essential relations
})
```

4. **Check Strapi Performance**: Review Strapi logs and database queries

---

### Issue: Excessive Retries

**Symptoms**: Multiple retry attempts slowing down the application

**Possible Causes**:
1. Persistent server errors
2. Network connectivity issues
3. Retry configuration too aggressive

**Solutions**:

1. **Adjust Retry Configuration**:
```typescript
const { data } = useLessons({
  retryConfig: {
    maxRetries: 1,        // Reduce retries
    baseDelay: 500,       // Faster retries
  },
})
```

2. **Check Error Logs**:
```typescript
const { error } = useLessons()

watch(error, (err) => {
  console.error('Fetch error:', err)
})
```

3. **Verify Strapi Health**: Check if Strapi is running and accessible

---

### Issue: Stale Data Displayed

**Symptoms**: Old data shown even after updates

**Possible Causes**:
1. Long stale time
2. Background revalidation not completing
3. Network issues preventing revalidation

**Solutions**:

1. **Reduce Stale Time**:
```typescript
const { data } = useLessons({
  staleTime: 30000,  // 30 seconds
})
```

2. **Force Refresh**:
```typescript
const { refresh } = useLessons()

await refresh()
```

3. **Disable Stale-While-Revalidate**:
```typescript
const { data } = useLessons({
  staleTime: 0,  // Always consider cache stale
})
```

---

### Issue: Memory Leaks

**Symptoms**: Increasing memory usage over time

**Possible Causes**:
1. Cache growing too large
2. Active requests not cleaned up
3. Watch dependencies causing issues

**Solutions**:

1. **Clear Cache Periodically**:
```typescript
// In app lifecycle
onUnmounted(() => {
  invalidateCmsCache()
})
```

2. **Reduce Cache Time**:
```typescript
const { data } = useLessons({
  cacheTime: 120000,  // 2 minutes
})
```

3. **Cancel Requests on Component Unmount**:
```typescript
import { cancelRequest } from '~/utils/data-layer'

onUnmounted(() => {
  cancelRequest('lessons')
})
```

---

### Issue: TypeScript Errors

**Symptoms**: Type errors when using composables

**Possible Causes**:
1. Missing type imports
2. Incorrect type usage
3. Outdated types

**Solutions**:

1. **Import Types Correctly**:
```typescript
import type { StrapiCollectionResponse } from '~/types/cms'
import type { KnowledgeCardAttributes } from '~/types/cms'

const { data } = useKnowledgeCards()
// data is typed as Ref<StrapiCollectionResponse<KnowledgeCardAttributes> | null>
```

2. **Use Type Guards**:
```typescript
const { data } = useLessons()

if (data.value?.data) {
  data.value.data.forEach((lesson) => {
    // lesson is properly typed
    console.log(lesson.attributes.title)
  })
}
```

3. **Regenerate Types**: Run `pnpm typecheck` to ensure types are up to date

---

### Issue: Filters Not Working

**Symptoms**: Filters don't affect results

**Possible Causes**:
1. Incorrect filter syntax
2. Field names don't match Strapi schema
3. Filters not passed to query

**Solutions**:

1. **Check Filter Syntax**:
```typescript
// CORRECT
const { data } = useLessons({
  filters: {
    partKey: { $eq: 'foundation' },
  },
})

// INCORRECT
const { data } = useLessons({
  filters: {
    partKey: 'foundation',  // Missing operator
  },
})
```

2. **Verify Field Names**: Check Strapi schema for correct field names

3. **Use Strapi Filter Operators**:
- `$eq` - Equal
- `$ne` - Not equal
- `$in` - In array
- `$notIn` - Not in array
- `$lt` - Less than
- `$lte` - Less than or equal
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$contains` - Contains (case-sensitive)
- `$containsi` - Contains (case-insensitive)
- `$startsWith` - Starts with
- `$endsWith` - Ends with
- `$null` - Is null
- `$notNull` - Is not null
- `$and` - Logical AND
- `$or` - Logical OR

---

### Issue: SSR/CSR Hydration Mismatch

**Symptoms**: Different content rendered on server vs client

**Possible Causes**:
1. Different data fetched on server and client
2. Cache not shared between SSR and CSR
3. Different query parameters

**Solutions**:

1. **Ensure Consistent Options**:
```typescript
const { data } = useLessons({
  server: true,      // Fetch on server
  immediate: true,   // Fetch immediately
})
```

2. **Use Same Cache Key**:
```typescript
const { data } = useLessons({
  key: 'all-lessons',  // Explicit cache key
})
```

3. **Avoid Client-Only Logic in SSR**:
```typescript
const { data } = useLessons({
  server: !process.client,  // Only fetch on server
})
```

---

### Issue: Network Errors

**Symptoms**: "Failed to fetch" or network-related errors

**Possible Causes**:
1. Strapi not running
2. Incorrect API URL
3. CORS issues
4. Network connectivity problems

**Solutions**:

1. **Verify Strapi is Running**:
```bash
# Check Strapi health
curl http://localhost:1337/_health
```

2. **Check Environment Variables**:
```bash
# .env
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_API_TOKEN=your-token-here
```

3. **Configure CORS in Strapi**:
```javascript
// config/middlewares.js
module.exports = [
  'strapi::cors',  // Enable CORS
  // ... other middleware
]
```

4. **Test API Directly**:
```bash
curl http://localhost:1337/api/lessons
```

---

### Issue: Pagination Not Working

**Symptoms**: All results returned regardless of pagination settings

**Possible Causes**:
1. Incorrect pagination syntax
2. Strapi configuration limits
3. Pagination parameters not passed

**Solutions**:

1. **Use Correct Pagination Syntax**:
```typescript
// Page-based (recommended)
const { data } = useLessons({
  pagination: {
    page: 1,
    pageSize: 20,
  },
})

// Offset-based
const { data } = useLessons({
  pagination: {
    start: 0,
    limit: 20,
  },
})
```

2. **Check Strapi Limits**: Review `config/api.js` in Strapi

3. **Access Pagination Meta**:
```typescript
const { data } = useLessons()

const totalPages = data.value?.meta?.pagination?.pageCount
const totalResults = data.value?.meta?.pagination?.total
```

---

### Issue: Population Not Loading Relations

**Symptoms**: Related data is null or undefined

**Possible Causes**:
1. Incorrect population syntax
2. Relations not configured in Strapi
3. Insufficient permissions

**Solutions**:

1. **Use Correct Population Syntax**:
```typescript
// Populate all fields
const { data } = useLessons({
  populate: '*',
})

// Populate specific fields
const { data } = useLessons({
  populate: ['part', 'loop'],
})

// Nested population
const { data } = useLessons({
  populate: {
    part: '*',
    knowledge_cards: {
      populate: ['media'],
    },
  },
})
```

2. **Verify Relations in Strapi**: Check content type relations in Strapi admin

3. **Check Permissions**: Ensure API permissions allow reading related content

---

## Debugging Tips

### Enable Debug Logging

```typescript
// Enable debug mode
const { data, pending, error } = useLessons()

watch([data, pending, error], ([newData, newPending, newError]) => {
  console.log('Data:', newData)
  console.log('Pending:', newPending)
  console.log('Error:', newError)
})
```

### Inspect Network Requests

1. Open browser DevTools
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to `/api/cms/`
5. Inspect request/response details

### Check Cache State

```typescript
import { getFromCache } from '~/utils/data-layer'

// Inspect cache
const cached = getFromCache('lessons', 60000)
console.log('Cached data:', cached)
```

### Monitor Performance

```typescript
const startTime = performance.now()

const { data } = await useLessons()

const endTime = performance.now()
console.log(`Fetch took ${endTime - startTime}ms`)
```

---

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**: Review [CMS_DATA_LAYER.md](./CMS_DATA_LAYER.md)
2. **Review Examples**: Check `docs/examples/` for working examples
3. **Check Tests**: Review test files for correct usage patterns
4. **Verify Strapi**: Ensure Strapi is running and accessible
5. **Check Logs**: Review browser console and Strapi logs
6. **Test API Directly**: Use curl or Postman to test Strapi API
7. **Report Issue**: Create an issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details
   - Error messages
   - Code samples
