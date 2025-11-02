# Web Vitals Telemetry Guide

## Overview

This guide explains how to use the Web Vitals telemetry system for monitoring real user performance metrics.

## Quick Start

### 1. Enable Telemetry

Add to your `.env` file:

```bash
NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY=true
NUXT_PUBLIC_VITALS_SAMPLING_RATE=1.0
```

### 2. Start Your App

```bash
pnpm dev:frontend
```

### 3. Check Metrics

Open browser console and type:

```javascript
window.__webVitals
```

You'll see collected metrics like:

```javascript
{
  LCP: 1234.5,
  FID: 50.2,
  CLS: 0.05,
  FCP: 800.3,
  TTFB: 200.1,
  INP: 150.3
}
```

## Architecture

```
Browser → Plugin → Batch Queue → API Endpoint → Logs/Strapi
```

### Components

1. **Client Plugin** (`plugins/web-vitals.client.ts`)
   - Collects Web Vitals metrics
   - Batches metrics for efficient sending
   - Handles offline scenarios
   - Retries failed requests

2. **API Endpoint** (`server/api/observability/vitals.post.ts`)
   - Validates incoming metrics
   - Enriches with metadata (IP, User Agent)
   - Rate limits requests
   - Applies sampling
   - Outputs to logs or forwards to Strapi

3. **Performance Utils** (`utils/perf.ts`)
   - Mark performance points
   - Measure durations
   - Wrap functions for automatic tracking

4. **Monitoring Composable** (`composables/useMonitoring.ts`)
   - Track data fetches
   - Track user interactions
   - Track component performance
   - Track route changes

## Usage Examples

### Track Custom Performance Marks

```typescript
import { perfMark, perfMeasure } from '~/utils/perf'

// Start of operation
perfMark('data-load-start')

// Do some work
await loadData()

// End of operation
perfMark('data-load-end')

// Measure duration
const duration = perfMeasure('data-load', 'data-load-start', 'data-load-end')
console.log(`Data loaded in ${duration}ms`)
```

### Track Data Fetching

```typescript
import { useMonitoring } from '~/composables/useMonitoring'

const { trackDataFetch } = useMonitoring()

// Automatically track fetch duration
const users = await trackDataFetch(
  'fetch-users',
  () => $fetch('/api/users'),
  { endpoint: '/api/users' }
)
```

### Track User Interactions

```typescript
import { useMonitoring } from '~/composables/useMonitoring'

const { trackInteraction } = useMonitoring()

function handleClick() {
  trackInteraction('button-click', {
    button: 'download',
    page: 'lessons'
  })
  
  // ... handle the click
}
```

### Track Component Mount Time

```typescript
import { useMonitoring } from '~/composables/useMonitoring'

const { trackComponentMount } = useMonitoring()

// This will measure from call to onMounted
trackComponentMount('StudentGallery')
```

### Measure Async Functions

```typescript
import { measureAsync } from '~/utils/perf'

async function loadLessons() {
  return await measureAsync('load-lessons', async () => {
    const response = await $fetch('/api/lessons')
    return processLessons(response)
  })
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY` | `true` | Enable/disable telemetry |
| `NUXT_PUBLIC_VITALS_SAMPLING_RATE` | `1.0` | Sampling rate (0.0 to 1.0) |
| `NUXT_PUBLIC_VITALS_RATE_LIMIT` | `100` | Max requests per session per hour |
| `NUXT_PUBLIC_ENABLE_VITALS_FORWARDING` | `false` | Forward to Strapi |

### Production Recommendations

```bash
# Recommended production settings
NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY=true
NUXT_PUBLIC_VITALS_SAMPLING_RATE=0.1  # 10% sampling
NUXT_PUBLIC_VITALS_RATE_LIMIT=50
NUXT_PUBLIC_ENABLE_VITALS_FORWARDING=true
```

### Development Settings

```bash
# Recommended development settings
NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY=true
NUXT_PUBLIC_VITALS_SAMPLING_RATE=1.0  # 100% sampling
NUXT_PUBLIC_VITALS_RATE_LIMIT=100
NUXT_PUBLIC_ENABLE_VITALS_FORWARDING=false
```

## Viewing Metrics

### In Development

1. Open browser console
2. Check `window.__webVitals` for collected metrics
3. Check `window.__webVitalsQueue` for pending metrics
4. Check `window.__webVitalsOffline` for offline queue

### In Production

#### Via Logs

Metrics are output as JSON to stdout. Use standard log tools:

```bash
# View Web Vitals logs
docker logs your-container | grep '"type":"web-vitals"'

# Extract LCP values
docker logs your-container | \
  grep '"type":"web-vitals"' | \
  jq 'select(.metric == "LCP") | .value'

# Calculate average LCP
docker logs your-container | \
  grep '"type":"web-vitals"' | \
  jq 'select(.metric == "LCP") | .value' | \
  awk '{ sum += $1; n++ } END { if (n > 0) print sum / n; }'
```

#### Via Strapi

If forwarding is enabled:

```bash
# Get recent metrics
curl "http://localhost:1337/api/web-vitals?sort=timestamp:desc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by page
curl "http://localhost:1337/api/web-vitals?filters[page]=/home" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

### Manual Testing

```bash
# Start dev server
pnpm dev:frontend

# Visit pages and check console
# You should see Web Vitals logs like:
# [Web Vitals] LCP: 1234.50ms (good)
# [Web Vitals] FID: 50.20ms (good)

# Check batched requests in Network tab
# Filter for: /api/observability/vitals
```

### Test Offline Handling

1. Open DevTools → Network tab
2. Set to "Offline"
3. Navigate between pages
4. Set back to "Online"
5. Check that queued metrics are sent

### Run Unit Tests

```bash
# Test performance utils
pnpm test perf.spec

# Test vitals API
pnpm test vitals-api.spec

# Test monitoring composable
pnpm test useMonitoring.spec
```

## Performance Budgets

The system includes performance budgets that warn when exceeded:

| Metric | Budget | Description |
|--------|--------|-------------|
| LCP | 2500ms | Largest Contentful Paint |
| FCP | 1500ms | First Contentful Paint |
| CLS | 0.1 | Cumulative Layout Shift |
| FID | 100ms | First Input Delay |
| INP | 200ms | Interaction to Next Paint |
| TTFB | 600ms | Time to First Byte |

When a metric exceeds its budget, you'll see a warning in the console:

```
[Performance Budget] LCP exceeded budget: 2800.00ms > 2500ms (needs-improvement)
```

## Troubleshooting

### No Metrics Collected

1. Check if telemetry is enabled:
   ```bash
   echo $NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY
   ```

2. Check sampling rate (might be too low):
   ```bash
   echo $NUXT_PUBLIC_VITALS_SAMPLING_RATE
   ```

3. Check browser console for errors

### Rate Limit Errors

Increase the rate limit:

```bash
NUXT_PUBLIC_VITALS_RATE_LIMIT=200
```

### Metrics Not Appearing in Logs

1. Make sure you're in production mode:
   ```bash
   pnpm build:frontend
   pnpm --filter frontend preview
   ```

2. Check stdout/stderr output

3. Verify metrics are being sent (Network tab)

### Strapi Forwarding Fails

1. Verify Strapi API token is correct
2. Check Strapi has `web-vitals` collection type
3. Verify API permissions
4. Check Strapi logs for errors

## Best Practices

### Development

- Use 100% sampling rate to see all metrics
- Enable detailed console logging
- Use `window.__webVitals` to inspect metrics
- Add custom performance marks for key operations

### Production

- Use 10-20% sampling (sufficient for most cases)
- Enable rate limiting to prevent abuse
- Use log shipping for centralized metrics
- Set up alerting for budget violations
- Create dashboards for visualization

### Adding Custom Metrics

1. **Component Performance**
   ```typescript
   const { trackComponentMount } = useMonitoring()
   trackComponentMount('MyComponent')
   ```

2. **Data Fetching**
   ```typescript
   const { trackDataFetch } = useMonitoring()
   await trackDataFetch('my-fetch', fetchFn, { tags: 'here' })
   ```

3. **User Actions**
   ```typescript
   const { trackInteraction } = useMonitoring()
   trackInteraction('button-click', { button: 'submit' })
   ```

## Log Shipping Setup

### With Fluentd

```conf
<source>
  @type tail
  path /var/log/app/frontend.log
  tag app.vitals
  <parse>
    @type json
  </parse>
</source>

<filter app.vitals>
  @type grep
  <regexp>
    key type
    pattern /^web-vitals$/
  </regexp>
</filter>

<match app.vitals>
  @type elasticsearch
  host elasticsearch:9200
  index_name web-vitals
</match>
```

### With Promtail + Loki

```yaml
scrape_configs:
  - job_name: web-vitals
    static_configs:
      - targets: [localhost]
        labels:
          job: frontend
          __path__: /var/log/app/frontend.log
    pipeline_stages:
      - json:
          expressions:
            type: type
            metric: metric
            value: value
      - match:
          selector: '{type="web-vitals"}'
          stages:
            - labels:
                metric:
```

## API Reference

### Plugin API

The plugin automatically collects Web Vitals. No manual API calls needed.

Debug in console:
```javascript
window.__webVitals        // Current metrics
window.__webVitalsQueue   // Pending batch
window.__webVitalsOffline // Offline queue
```

### Performance Tracker API

```typescript
import { usePerformanceTracker } from '~/utils/perf'

const tracker = usePerformanceTracker()

tracker.mark('start')
tracker.mark('end')
tracker.measure('my-operation', 'start', 'end')
tracker.getMeasures()
tracker.clear()
```

### Monitoring Composable API

```typescript
import { useMonitoring } from '~/composables/useMonitoring'

const monitoring = useMonitoring()

monitoring.trackMetric(name, value, tags)
monitoring.trackDataFetch(name, fetchFn, tags)
monitoring.trackComponentMount(componentName)
monitoring.trackInteraction(actionName, metadata)
monitoring.trackRouteChange(from, to)
monitoring.exportMetrics()
monitoring.clearMetrics()
```

## Performance Impact

The telemetry system is designed to have minimal impact:

- **Client bundle**: < 5KB gzipped (web-vitals library)
- **Network**: Batched requests, ~1-2KB per batch
- **Memory**: Minimal, bounded queues
- **Server**: Async processing, negligible overhead

## Further Reading

- [Web Vitals Specification](https://web.dev/vitals/)
- [Performance Optimization Guide](./PERFORMANCE.md)
- [Performance Patterns](./examples/performance-patterns.vue)
- Full implementation: [PERFORMANCE_OPTIMIZATION.md](../PERFORMANCE_OPTIMIZATION.md)
