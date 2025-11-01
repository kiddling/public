# Nuxt Build Optimization Guide

This document describes the build optimizations and performance tuning implemented for the Nuxt 4 frontend application.

## Overview

The frontend has been optimized for:
- **Initial load performance** - Faster time to interactive
- **Navigation performance** - Smooth client-side transitions
- **China hosting** - No Google CDN dependencies, optimized for Chinese networks
- **SEO** - Pre-rendered static and dynamic pages
- **Bundle size** - Efficient code splitting and lazy loading

## Key Features Implemented

### 1. Experimental Features (Nuxt 4)

**Payload Extraction** (`experimental.payloadExtraction`)
- Extracts page payloads into separate JSON files
- Reduces initial HTML size
- Enables better caching of page data
- Configured in: `nuxt.config.ts`

**Compatibility Version** (`future.compatibilityVersion: 4`)
- Enables Nuxt 4 features and optimizations
- Ensures forward compatibility

### 2. Vite Build Configuration

**Manual Chunk Splitting** (`vite.build.rollupOptions.output.manualChunks`)

Vendor bundles are split into:
- `vendor-vue` - Vue ecosystem (Vue, Nuxt, @vue packages)
- `vendor-pinia` - State management
- `vendor-ui` - UI libraries (@vueuse, tailwindcss)
- `vendor-misc` - Other third-party libraries

Benefits:
- Parallel loading of vendor chunks
- Better browser caching (vendors change less frequently)
- Smaller main bundle

**Bundle Analyzer Integration**

Run `npm run analyze` to:
- Generate interactive treemap visualization
- Identify large dependencies
- Verify chunk splitting
- Find optimization opportunities
- View at `http://localhost:8888` after build

### 3. Nitro Prerendering

**Static Routes Pre-rendered:**
- `/` - Homepage
- `/lessons` - Lessons index
- `/knowledge-cards` - Knowledge cards index
- `/resources` - Resources index
- `/downloads` - Downloads index
- `/students` - Students page
- `/tools/design-log` - Design log tool

**Dynamic CMS Routes:**

During build, the system:
1. Connects to Strapi API
2. Fetches all lessons (by `code`)
3. Fetches all knowledge cards (by `slug`)
4. Pre-renders individual detail pages

**Graceful Degradation:**
- If Strapi is unreachable → static routes only
- Warnings logged but build continues
- Environment variables required:
  - `NUXT_PUBLIC_STRAPI_URL`
  - `NUXT_STRAPI_API_TOKEN`

### 4. Route Rules & Caching Strategy

**Cache Configuration:**

| Route Pattern | Strategy | Max Age | SWR | Notes |
|--------------|----------|---------|-----|-------|
| `/_nuxt/**` | Immutable | 1 year | - | Static assets |
| `/` | SWR | 1 hour | 24h | Homepage |
| `/lessons` | SWR | 5 min | 1h | CMS list |
| `/knowledge-cards` | SWR | 5 min | 1h | CMS list |
| `/resources` | SWR | 5 min | 1h | CMS list |
| `/downloads` | SWR | 5 min | 1h | CMS list |
| `/lessons/**` | SWR | 10 min | 1h | Detail pages |
| `/knowledge-cards/**` | SWR | 10 min | 1h | Detail pages |
| `/api/**` | No cache | - | - | Dynamic API |

**SWR (Stale-While-Revalidate):**
1. Serve cached content immediately (fast!)
2. Fetch fresh content in background
3. Update cache for next request
4. Balance between speed and freshness

### 5. Performance Settings

**Link Prefetching** (`app.config.ts`)
- Enabled by default in Nuxt 4
- Prefetches links on hover/visibility
- Configurable via `performance.prefetchLinks`

**Lazy Loading**
- Images lazy-loaded by default
- Components can be lazy-loaded with `defineAsyncComponent`
- Configured in `app.config.ts`

### 6. China Deployment Compatibility

✅ **No External CDN Dependencies**
- System fonts only (no Google Fonts)
- No blocked resources
- Domestic CDN alternatives documented

✅ **Optimized Cache Headers**
- CDN-friendly
- Aggressive static asset caching
- ISR for dynamic content

✅ **SSR Enabled**
- Fast initial page loads
- Better SEO for Chinese search engines
- Server-side rendering for all routes

## Performance Benchmarks

After optimization:
- ✅ Vendor bundles split into 4 chunks
- ✅ Static routes pre-rendered at build time
- ✅ Dynamic CMS routes pre-rendered when Strapi available
- ✅ Link prefetching enabled
- ✅ Payload extraction reduces HTML size
- ✅ Cache headers optimize CDN usage

## Testing

**Regression Tests** (`tests/config/`)

Two test suites ensure optimizations remain in place:

1. `nuxt-config.spec.ts` - Validates Nuxt configuration
   - Payload extraction enabled
   - Compatibility version set
   - Manual chunks configured
   - Prerender routes defined
   - Route rules configured
   - Hooks configured

2. `app-config.spec.ts` - Validates app configuration
   - Prefetch links enabled
   - Lazy loading enabled
   - System fonts configured
   - No external CDN dependencies

Run tests: `npm test -- tests/config/`

## Build Commands

```bash
# Standard build
npm run build

# Build with bundle analysis
npm run analyze

# Preview production build
npm run preview

# Run tests
npm test
```

## Environment Variables

For optimal build performance, set:

```bash
# Strapi connection for dynamic route enumeration
NUXT_PUBLIC_STRAPI_URL=https://your-cms.com
NUXT_STRAPI_API_TOKEN=your-api-token

# CDN for assets (optional)
NUXT_PUBLIC_CDN_URL=https://your-cdn.com
```

## Monitoring & Debugging

**Check Pre-rendered Routes:**
```bash
# After build, check .output/public for pre-rendered HTML
ls -la .output/public/lessons/
ls -la .output/public/knowledge-cards/
```

**View Bundle Analysis:**
```bash
npm run analyze
# Opens http://localhost:8888 with interactive visualization
```

**Check Build Logs:**
Look for:
- `🔍 Fetching CMS routes for prerendering...`
- `✓ Added X lesson routes`
- `✓ Added X knowledge card routes`
- `✓ CMS route enumeration complete`

## Future Optimizations

Potential improvements:
- [ ] Image optimization with `@nuxt/image`
- [ ] Font subsetting for Chinese characters
- [ ] Service worker for offline support
- [ ] HTTP/3 and Early Hints support
- [ ] Edge function deployment

## References

- [Nuxt 4 Documentation](https://nuxt.com)
- [Vite Bundle Analyzer](https://github.com/nonzzz/vite-bundle-analyzer)
- [Nitro Prerendering](https://nitro.unjs.io/guide/routing#prerendering)
- [SWR Caching Strategy](https://web.dev/stale-while-revalidate/)
