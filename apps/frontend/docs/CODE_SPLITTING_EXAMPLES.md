# Code Splitting Examples

This document provides practical examples of code splitting strategies for optimal performance.

## Dynamic Import Annotations

Vite and Webpack support magic comments to control how chunks are generated.

### Basic Dynamic Import

```typescript
// Simple dynamic import
const module = await import('./my-module.js')
```

### Named Chunks

```typescript
// Give the chunk a meaningful name
const module = await import(
  /* webpackChunkName: "my-feature" */
  /* vite-plugin-name: "my-feature" */
  './my-module.js'
)
```

### Prefetch

```typescript
// Tell the browser to prefetch this chunk when idle
const module = await import(
  /* webpackPrefetch: true */
  './frequently-used-module.js'
)
```

### Preload

```typescript
// Preload the chunk in parallel with the parent
const module = await import(
  /* webpackPreload: true */
  './critical-module.js'
)
```

## Vue Component Lazy Loading

### Simple Lazy Component

```vue
<script setup lang="ts">
// Lazy load a component
const HeavyComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)
</script>

<template>
  <HeavyComponent v-if="showHeavy" />
</template>
```

### With Loading State

```vue
<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const HeavyComponent = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200, // Show loading after 200ms
  timeout: 10000, // Timeout after 10s
})
</script>
```

### Conditional Lazy Loading

```vue
<script setup lang="ts">
const route = useRoute()
const showAdminPanel = ref(false)

// Only import when needed
const AdminPanel = computed(() => {
  if (showAdminPanel.value) {
    return defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "admin-panel" */
        './components/AdminPanel.vue'
      )
    )
  }
  return null
})
</script>

<template>
  <component :is="AdminPanel" v-if="AdminPanel" />
</template>
```

## Route-Level Code Splitting

Already handled by Nuxt automatically, but you can enhance it:

### pages/lessons/[code].vue

```vue
<script setup lang="ts">
// Heavy dependencies loaded on-demand
const exportLesson = async () => {
  // This will be in a separate chunk
  const { jsPDF } = await import(
    /* webpackChunkName: "pdf-export" */
    'jspdf'
  )
  
  const pdf = new jsPDF()
  // ... generate PDF
}

const generateQRCode = async () => {
  const QRCode = await import(
    /* webpackChunkName: "qrcode-gen" */
    'qrcode'
  )
  
  // ... generate QR code
}
</script>

<template>
  <div>
    <button @click="exportLesson">Export PDF</button>
    <button @click="generateQRCode">Generate QR</button>
  </div>
</template>
```

## Store Module Splitting

### stores/lessons.ts

```typescript
import { defineStore } from 'pinia'

export const useLessonsStore = defineStore('lessons', {
  state: () => ({
    lessons: [],
  }),
  
  actions: {
    async loadLessonEditor() {
      // Load editor module only when needed
      const { LessonEditor } = await import(
        /* webpackChunkName: "lesson-editor" */
        './modules/lesson-editor'
      )
      
      return new LessonEditor()
    },
    
    async exportToArchive() {
      // Load archiver only when exporting
      const archiver = await import(
        /* webpackChunkName: "archiver" */
        'archiver'
      )
      
      // ... use archiver
    },
  },
})
```

## Feature Flags with Code Splitting

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const isFeatureEnabled = config.public.newFeatureEnabled

// Only load new feature code if enabled
const NewFeature = computed(() => {
  if (isFeatureEnabled) {
    return defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "new-feature" */
        './components/NewFeature.vue'
      )
    )
  }
  return null
})
</script>
```

## Vendor Splitting by Feature

### Manual Chunk Configuration (nuxt.config.ts)

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // PDF-related features
            if (id.includes('jspdf') || id.includes('pdf-lib')) {
              return 'feature-pdf'
            }
            
            // Image processing features
            if (id.includes('sharp') || id.includes('image-compressor')) {
              return 'feature-images'
            }
            
            // Data visualization features
            if (id.includes('chart') || id.includes('d3')) {
              return 'feature-charts'
            }
            
            // Admin features
            if (id.includes('/admin/')) {
              return 'feature-admin'
            }
          },
        },
      },
    },
  },
})
```

## Conditional Polyfills

```typescript
// Only load polyfills if needed
async function loadPolyfills() {
  if (!('IntersectionObserver' in window)) {
    await import(
      /* webpackChunkName: "polyfill-io" */
      'intersection-observer'
    )
  }
  
  if (!('requestIdleCallback' in window)) {
    await import(
      /* webpackChunkName: "polyfill-ric" */
      './polyfills/request-idle-callback'
    )
  }
}
```

## Progressive Enhancement

```vue
<script setup lang="ts">
const supportsWebGL = ref(false)
const WebGLVisualization = ref(null)

onMounted(async () => {
  // Check capability
  const canvas = document.createElement('canvas')
  supportsWebGL.value = !!(
    canvas.getContext('webgl') || 
    canvas.getContext('experimental-webgl')
  )
  
  // Only load if supported
  if (supportsWebGL.value) {
    const module = await import(
      /* webpackChunkName: "webgl-viz" */
      './components/WebGLVisualization.vue'
    )
    WebGLVisualization.value = module.default
  }
})
</script>

<template>
  <component :is="WebGLVisualization" v-if="supportsWebGL" />
  <FallbackVisualization v-else />
</template>
```

## Connection-Aware Loading

```typescript
export function useDynamicImport() {
  const shouldEagerLoad = () => {
    // Check connection speed
    const connection = (navigator as any).connection
    if (!connection) return true
    
    const { effectiveType, saveData } = connection
    
    // Don't eager load on slow connections or data saver
    if (saveData) return false
    if (effectiveType === '2g' || effectiveType === '3g') return false
    
    return true
  }
  
  const loadComponent = async (path: string) => {
    if (shouldEagerLoad()) {
      // Load immediately
      return await import(path)
    } else {
      // Load on interaction
      return new Promise((resolve) => {
        const listener = () => {
          document.removeEventListener('click', listener)
          import(path).then(resolve)
        }
        document.addEventListener('click', listener, { once: true })
      })
    }
  }
  
  return { loadComponent }
}
```

## Best Practices

### DO ✅

- Split by route automatically (Nuxt does this)
- Lazy load heavy libraries (PDF, QR codes, charts)
- Split by feature domain
- Use meaningful chunk names
- Load on user interaction when possible
- Consider connection speed

### DON'T ❌

- Over-split (too many small chunks)
- Split critical above-the-fold code
- Dynamic import in loops
- Ignore loading states
- Forget error handling

## Measuring Impact

```typescript
// Track dynamic import performance
export async function measureImport(
  name: string,
  importFn: () => Promise<any>
) {
  const start = performance.now()
  
  try {
    const module = await importFn()
    const duration = performance.now() - start
    
    if (import.meta.dev) {
      console.log(`[Import] ${name}: ${duration.toFixed(2)}ms`)
    }
    
    return module
  } catch (error) {
    console.error(`[Import Error] ${name}:`, error)
    throw error
  }
}

// Usage
const { jsPDF } = await measureImport(
  'jsPDF',
  () => import('jspdf')
)
```

## Testing Code Splitting

```typescript
// tests/unit/code-splitting.spec.ts
import { describe, it, expect, vi } from 'vitest'

describe('Code Splitting', () => {
  it('should lazy load PDF library', async () => {
    const importSpy = vi.spyOn(await import('jspdf'), 'default')
    
    // Initially not loaded
    expect(importSpy).not.toHaveBeenCalled()
    
    // Trigger load
    await triggerPDFExport()
    
    // Now loaded
    expect(importSpy).toHaveBeenCalled()
  })
  
  it('should handle import errors gracefully', async () => {
    const errorHandler = vi.fn()
    
    try {
      await import('./non-existent-module')
    } catch (error) {
      errorHandler(error)
    }
    
    expect(errorHandler).toHaveBeenCalled()
  })
})
```

## Debugging

```typescript
// Enable chunk loading debugging
if (import.meta.dev) {
  const originalImport = window.__vite__import || window.import
  
  window.__vite__import = async (path) => {
    console.log('🔷 Loading chunk:', path)
    const start = performance.now()
    
    try {
      const module = await originalImport(path)
      console.log('✅ Loaded in:', performance.now() - start, 'ms')
      return module
    } catch (error) {
      console.error('❌ Failed to load:', path, error)
      throw error
    }
  }
}
```

## Related Documentation

- [Vite Code Splitting](https://vitejs.dev/guide/features.html#async-chunk-loading-optimization)
- [Vue Async Components](https://vuejs.org/guide/components/async.html)
- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION.md)
