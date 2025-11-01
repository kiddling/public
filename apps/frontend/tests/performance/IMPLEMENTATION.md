# Performance Monitoring Implementation

This document describes the complete implementation of Web Vitals and Lighthouse CI performance monitoring.

## Implementation Overview

### 1. Web Vitals Client Plugin

**File**: `plugins/web-vitals.client.ts`

Automatically captures and reports Web Vitals metrics:
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **FID** (First Input Delay)
- **INP** (Interaction to Next Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)

**Features**:
- Client-only execution (`.client.ts` suffix)
- Respects analytics consent from localStorage
- Uses `navigator.sendBeacon()` for reliable reporting
- Fallback to `fetch()` when sendBeacon unavailable
- Provides performance mark/measure helpers

**Usage**:
```typescript
const { $webVitals } = useNuxtApp()

// Mark a performance point
$webVitals.mark('interaction-start')

// Measure between marks
$webVitals.measure('user-action', 'interaction-start', 'interaction-end')

// Get all entries
const entries = $webVitals.getEntries()
```

### 2. Analytics Server Endpoint

**File**: `server/api/analytics/web-vitals.post.ts`

Receives Web Vitals metrics from the client and logs them to the server console.

**Future Enhancements**:
- Store metrics in database
- Aggregate metrics for dashboards
- Alert on performance regressions
- Export to external analytics services

### 3. Lighthouse CI Configuration

**File**: `.lighthouserc.json`

Defines performance budgets and audit configuration:

**Performance Budgets**:
- Performance Score: ≥90
- Accessibility Score: ≥90
- Best Practices Score: ≥90
- SEO Score: ≥95

**Metric Budgets**:
- Time to Interactive (TTI): <3500ms
- First Contentful Paint (FCP): <2000ms
- Largest Contentful Paint (LCP): <2500ms
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.1
- Speed Index: <3000ms

**Test Routes**:
1. Home page (`/`)
2. Lesson detail (`/lessons/example-lesson`)
3. Knowledge card (`/knowledge-cards/example-card`)

**Configuration**:
- 3 runs per URL for statistical significance
- Desktop preset with realistic throttling
- Uploads results to temporary public storage (7-day expiry)

### 4. NPM Scripts

Added to `package.json`:

```json
{
  "lighthouse:ci": "lhci autorun",
  "web-vitals:report": "echo 'Web Vitals logs are captured in server console...'"
}
```

**Usage**:
```bash
# Build and run Lighthouse CI
pnpm build && pnpm lighthouse:ci

# View Web Vitals reporting info
pnpm web-vitals:report
```

### 5. Test Suite

**File**: `tests/web-vitals.spec.ts`

Comprehensive test coverage (12 tests):

**Analytics Consent Tests**:
- ✅ Respects enabled consent
- ✅ Blocks reporting when disabled
- ✅ Defaults to enabled when no preference
- ✅ Handles invalid consent data gracefully

**Metric Reporting Tests**:
- ✅ Sends via sendBeacon when available
- ✅ Falls back to fetch when needed
- ✅ Handles network errors gracefully

**Performance Helper Tests**:
- ✅ Performance mark helper
- ✅ Performance measure helper
- ✅ Measure without end mark
- ✅ Error handling for invalid marks
- ✅ Get performance entries

### 6. TypeScript Support

**File**: `types/web-vitals.d.ts`

Type definitions for the Web Vitals plugin, providing IntelliSense support.

### 7. Documentation

**Updated Files**:
- `README.md` - Added comprehensive performance section
- `tests/performance/README.md` - Lighthouse CI usage guide
- `tests/performance/ci-integration.md` - CI/CD integration examples
- `docs/performance-monitoring-example.md` - Code examples

**Updated**: `.gitignore` to exclude `.lighthouseci/` directory

## Analytics Consent Management

### Default Behavior

By default, analytics are **enabled** if no preference is stored.

### Setting Consent

```typescript
// Enable analytics
localStorage.setItem('analytics-consent', JSON.stringify({ 
  analytics: true 
}))

// Disable analytics
localStorage.setItem('analytics-consent', JSON.stringify({ 
  analytics: false 
}))
```

### Integrating with Cookie Banner

In your cookie banner component:

```vue
<script setup lang="ts">
const acceptAnalytics = () => {
  localStorage.setItem('analytics-consent', JSON.stringify({ 
    analytics: true 
  }))
}

const declineAnalytics = () => {
  localStorage.setItem('analytics-consent', JSON.stringify({ 
    analytics: false 
  }))
}
</script>
```

## Viewing Web Vitals Data

### Development Mode

```bash
# Start dev server
pnpm dev

# Web Vitals will be logged as they're captured
# Look for: [Web Vitals] {"metric":"LCP","value":2500,...}
```

### Production Mode

```bash
# Build and preview
pnpm build
pnpm preview

# Web Vitals are logged to server console
```

### Sample Log Entry

```json
{
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

## Running Lighthouse CI

### Prerequisites

1. Build the production version:
```bash
pnpm build
```

2. Ensure no other process is using port 3000

### Local Execution

```bash
pnpm lighthouse:ci
```

This will:
1. Start a preview server
2. Wait for "Local:" in server output
3. Run 3 Lighthouse audits per URL (9 total)
4. Assert against performance budgets
5. Generate reports in `.lighthouseci/`
6. Upload results to temporary public storage
7. Print summary and any failures

### Expected Output

**Success**:
```
✅ All assertions passed
View reports at: https://storage.googleapis.com/...
```

**Failure**:
```
❌ Assertion failed: categories:performance
   Expected: ≥0.9
   Actual: 0.85
```

### Reports

Lighthouse generates:
- `.lighthouseci/manifest.json` - Run metadata
- `.lighthouseci/*.report.html` - Visual reports
- `.lighthouseci/*.report.json` - Raw data

Open HTML reports in a browser to see detailed analysis.

## CI/CD Integration

### GitHub Actions

Run Lighthouse on every PR:

```yaml
- name: Run Lighthouse CI
  run: |
    pnpm --filter frontend build
    pnpm --filter frontend lighthouse:ci
```

See `tests/performance/ci-integration.md` for complete examples.

### GitLab CI

```yaml
lighthouse:
  script:
    - pnpm --filter frontend build
    - pnpm --filter frontend lighthouse:ci
```

## Performance Budget Philosophy

### Current Budgets (Strict)

Our budgets are intentionally strict to maintain excellent user experience:

- **Performance ≥90**: Top 10% of web
- **SEO ≥95**: Excellent discoverability
- **TBT <200ms**: Smooth interactions
- **LCP <2.5s**: Fast perceived load

### Adjusting Budgets

If budgets are too strict initially, consider:

1. **Gradual improvement** - Start at current performance, increase monthly
2. **Route-specific budgets** - Relax budgets for complex pages
3. **Warn instead of fail** - Use `["warn", {...}]` during adoption

Edit `.lighthouserc.json` to adjust.

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .lighthouserc.json
```

### Assertion Failures

1. Check HTML reports for specific issues
2. Review Web Vitals logs for real-world data
3. Profile with Chrome DevTools
4. Optimize assets/code
5. Re-run Lighthouse

### Flaky Results

Lighthouse can be variable. Consider:
- Increasing `numberOfRuns` (5 instead of 3)
- Running on dedicated CI runner
- Disabling flaky audits

## Next Steps

### Short Term
- ✅ Monitor Web Vitals in production
- ✅ Run Lighthouse locally before PRs
- ✅ Fix any budget violations

### Medium Term
- Integrate Lighthouse into CI/CD (see ci-integration.md)
- Set up persistent Lighthouse CI server
- Create performance dashboard from Web Vitals logs
- Add performance regression alerts

### Long Term
- A/B test performance optimizations
- Track Core Web Vitals impact on conversions
- Implement automatic performance recommendations
- Real User Monitoring (RUM) integration

## Testing

All functionality is tested:

```bash
# Run Web Vitals tests
pnpm test web-vitals.spec.ts

# All tests
pnpm test
```

## Support

For issues or questions:
1. Review documentation in `tests/performance/`
2. Check examples in `docs/performance-monitoring-example.md`
3. Consult [Web Vitals](https://web.dev/vitals/) and [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) docs
