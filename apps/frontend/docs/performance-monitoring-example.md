# Performance Monitoring Examples

## Using Web Vitals Performance Helpers

### Example 1: Measuring Page Load Time

```vue
<script setup lang="ts">
const { $webVitals } = useNuxtApp()

onMounted(() => {
  // Mark when component mounted
  $webVitals.mark('page-load-complete')
  
  // Measure from navigation start to mount
  $webVitals.measure('total-page-load', 'navigationStart', 'page-load-complete')
})
</script>
```

### Example 2: Tracking User Interactions

```vue
<script setup lang="ts">
const { $webVitals } = useNuxtApp()

const handleSearch = async (query: string) => {
  // Mark the start of the search
  $webVitals.mark('search-start')
  
  try {
    const results = await searchContent(query)
    
    // Mark the end of the search
    $webVitals.mark('search-end')
    
    // Measure the search duration
    $webVitals.measure('search-duration', 'search-start', 'search-end')
    
    return results
  } catch (error) {
    console.error('Search failed:', error)
  }
}
</script>
```

### Example 3: Tracking Image Loading

```vue
<script setup lang="ts">
const { $webVitals } = useNuxtApp()

const handleImageLoad = (imageId: string) => {
  $webVitals.mark(`image-loaded-${imageId}`)
  
  // Get all performance entries to analyze
  const entries = $webVitals.getEntries()
  const imageEntries = entries.filter(e => e.name.includes(imageId))
  
  console.log(`Image ${imageId} loaded in ${imageEntries[0]?.duration}ms`)
}
</script>

<template>
  <img 
    :src="imageUrl" 
    @load="handleImageLoad('hero-image')"
    alt="Hero"
  />
</template>
```

### Example 4: Measuring Critical Path Operations

```vue
<script setup lang="ts">
const { $webVitals } = useNuxtApp()

const loadLesson = async (lessonCode: string) => {
  $webVitals.mark('lesson-fetch-start')
  
  // Fetch lesson data
  const lesson = await fetchLesson(lessonCode)
  $webVitals.mark('lesson-fetch-end')
  $webVitals.measure('lesson-fetch', 'lesson-fetch-start', 'lesson-fetch-end')
  
  // Process lesson data
  $webVitals.mark('lesson-process-start')
  const processed = processLessonData(lesson)
  $webVitals.mark('lesson-process-end')
  $webVitals.measure('lesson-process', 'lesson-process-start', 'lesson-process-end')
  
  // Total time
  $webVitals.measure('lesson-total', 'lesson-fetch-start', 'lesson-process-end')
  
  return processed
}
</script>
```

## Analytics Consent Management

### Setting Consent Preferences

```typescript
// In your cookie banner or settings component
const setAnalyticsConsent = (enabled: boolean) => {
  localStorage.setItem('analytics-consent', JSON.stringify({ 
    analytics: enabled 
  }))
  
  // Optionally reload to apply changes
  if (enabled) {
    console.log('Analytics enabled - Web Vitals will be reported')
  } else {
    console.log('Analytics disabled - Web Vitals will not be reported')
  }
}

// Enable analytics
setAnalyticsConsent(true)

// Disable analytics
setAnalyticsConsent(false)
```

### Checking Current Consent

```typescript
const getAnalyticsConsent = (): boolean => {
  try {
    const consent = localStorage.getItem('analytics-consent')
    if (consent) {
      const parsed = JSON.parse(consent)
      return parsed.analytics === true
    }
  } catch (error) {
    console.warn('Failed to parse analytics consent:', error)
  }
  
  // Default to enabled
  return true
}
```

## Viewing Web Vitals Data

### In Browser DevTools

1. Open DevTools Console
2. Look for `[Web Vitals]` prefixed logs
3. These show real-time metrics as they're captured

### In Server Logs

```bash
# Development mode
pnpm dev

# Production mode
pnpm build && pnpm preview
```

Server logs will show entries like:
```
[Web Vitals] {
  "timestamp": "2025-01-01T12:00:00.000Z",
  "metric": "LCP",
  "value": 2500,
  "rating": "good",
  "delta": 2500,
  "id": "v3-123456789",
  "navigationType": "navigate",
  "url": "http://localhost:3000/",
  "userAgent": "Mozilla/5.0..."
}
```

## Performance Analysis

### Good vs Poor Metrics

**LCP (Largest Contentful Paint)**
- Good: ≤2.5s
- Needs Improvement: 2.5s - 4s
- Poor: >4s

**FID/INP (First Input Delay / Interaction to Next Paint)**
- Good: ≤100ms (FID), ≤200ms (INP)
- Needs Improvement: 100-300ms (FID), 200-500ms (INP)
- Poor: >300ms (FID), >500ms (INP)

**CLS (Cumulative Layout Shift)**
- Good: ≤0.1
- Needs Improvement: 0.1 - 0.25
- Poor: >0.25

### Common Issues and Solutions

**High LCP:**
- Optimize images (use WebP, proper sizing)
- Reduce server response time
- Preload critical resources
- Use CDN for static assets

**High INP/FID:**
- Reduce JavaScript execution time
- Break up long tasks
- Use web workers for heavy computations
- Defer non-critical JavaScript

**High CLS:**
- Set explicit dimensions for images/videos
- Reserve space for ads/embeds
- Avoid inserting content above existing content
- Use transform animations instead of layout-triggering properties
