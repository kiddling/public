# Performance Monitoring Quick Start

## 🚀 5-Minute Setup

### 1. Run Lighthouse CI Locally

```bash
# Navigate to frontend
cd apps/frontend

# Build production version
pnpm build

# Run Lighthouse CI
pnpm lighthouse:ci
```

**What happens:**
- Starts preview server on port 3000
- Runs 3 audits on 3 routes (9 total audits)
- Generates reports in `.lighthouseci/`
- Outputs pass/fail results

### 2. View Web Vitals

```bash
# Start dev server
pnpm dev

# Visit the app in your browser
# Open server console - look for [Web Vitals] logs
```

**Metrics you'll see:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

### 3. Use Performance Helpers

```vue
<script setup lang="ts">
const { $webVitals } = useNuxtApp()

// Mark critical points
$webVitals.mark('data-fetch-start')
await fetchData()
$webVitals.mark('data-fetch-end')

// Measure duration
$webVitals.measure('data-fetch', 'data-fetch-start', 'data-fetch-end')
</script>
```

## 📊 Understanding Results

### Lighthouse Scores

| Score | Rating |
|-------|--------|
| 90-100 | ✅ Good |
| 50-89 | ⚠️ Needs Improvement |
| 0-49 | ❌ Poor |

### Web Vitals Ratings

**LCP (Loading)**
- ✅ Good: ≤2.5s
- ⚠️ Needs Improvement: 2.5-4s
- ❌ Poor: >4s

**INP (Interactivity)**
- ✅ Good: ≤200ms
- ⚠️ Needs Improvement: 200-500ms
- ❌ Poor: >500ms

**CLS (Visual Stability)**
- ✅ Good: ≤0.1
- ⚠️ Needs Improvement: 0.1-0.25
- ❌ Poor: >0.25

## 🔧 Common Commands

```bash
# Run Web Vitals tests
pnpm test web-vitals.spec.ts

# Check Web Vitals reporting
pnpm web-vitals:report

# Run all tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run Lighthouse CI
pnpm lighthouse:ci
```

## 🎯 Performance Budgets

Current enforcement:
- **Performance Score**: ≥90
- **SEO Score**: ≥95
- **Accessibility Score**: ≥90
- **Best Practices Score**: ≥90
- **Total Blocking Time**: <200ms
- **LCP**: <2.5s
- **CLS**: <0.1

## 🔍 Troubleshooting

### Lighthouse won't start
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Try again
pnpm lighthouse:ci
```

### No Web Vitals logs
```bash
# Check browser console (client logs)
# Check server terminal (server logs)
# Verify analytics consent is enabled
localStorage.setItem('analytics-consent', JSON.stringify({ analytics: true }))
```

### Tests failing
```bash
# Rebuild and retry
pnpm clean
pnpm install
pnpm build
pnpm test
```

## 📚 Learn More

- `README.md` - Main documentation
- `IMPLEMENTATION.md` - Technical details
- `ci-integration.md` - CI/CD setup
- `../docs/performance-monitoring-example.md` - Code examples

## 🎉 Next Steps

1. ✅ Run Lighthouse locally
2. ✅ Check Web Vitals in browser
3. ✅ Review performance budgets
4. ✅ Integrate into CI/CD (see `ci-integration.md`)
5. ✅ Monitor performance over time

## 💡 Pro Tips

1. **Run before every PR** - Catch regressions early
2. **Check real devices** - Test on actual phones/tablets
3. **Monitor trends** - One-off scores vary, trends matter
4. **Optimize iteratively** - Fix biggest issues first
5. **Use Chrome DevTools** - Profile before optimizing

## 🆘 Need Help?

1. Check documentation in `tests/performance/`
2. Review examples in `docs/`
3. Consult Web Vitals docs: https://web.dev/vitals/
4. Consult Lighthouse CI docs: https://github.com/GoogleChrome/lighthouse-ci
