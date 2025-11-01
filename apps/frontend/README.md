# Frontend - Nuxt 3 Application

Modern web application built with Nuxt 3, TypeScript, and Tailwind CSS, optimized for Chinese hosting and typography.

## 🚀 Tech Stack

- **Nuxt 3** - Vue 3 framework with SSR support
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management for Vue
- **VueUse** - Collection of Vue Composition Utilities
- **Nuxt Content** - File-based CMS for content
- **Color Mode** - Dark mode support
- **ESLint** - Code linting

## 📦 Features

- ✅ Server-Side Rendering (SSR) for better SEO
- ✅ TypeScript with strict type checking
- ✅ Tailwind CSS with Chinese typography optimization
- ✅ Dark mode support with system preference detection
- ✅ Pinia state management
- ✅ VueUse composables integration
- ✅ Nuxt Content for markdown-based content
- ✅ ESLint configuration for code quality
- ✅ Optimized for China hosting (domestic fonts and CDNs)

## 🔧 Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Strapi API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:1337
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_API_TOKEN=your-strapi-api-token-here

# CDN Configuration
NUXT_PUBLIC_CDN_URL=

# Application Configuration
PORT=3000
```

## 🏃 Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🔨 Building

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## 🧹 Code Quality

### Linting

```bash
# Check for linting errors
pnpm lint

# Fix linting errors automatically
pnpm lint:fix
```

### Type Checking

```bash
pnpm typecheck
```

## ⚡ Performance Monitoring

The application includes comprehensive performance monitoring using Web Vitals and Lighthouse CI.

### Web Vitals

Web Vitals are automatically captured on the client side and reported to the analytics endpoint. Metrics include:

- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity (legacy)
- **INP** (Interaction to Next Paint) - Interactivity
- **LCP** (Largest Contentful Paint) - Loading performance
- **TTFB** (Time to First Byte) - Server response time

#### Viewing Web Vitals Logs

Web Vitals are logged to the server console in real-time:

```bash
# Run the development server
pnpm dev

# In another terminal, check for Web Vitals logs
pnpm web-vitals:report
```

Look for entries like:
```
[Web Vitals] {"timestamp":"2025-01-01T12:00:00.000Z","metric":"LCP","value":2500,"rating":"good",...}
```

#### Analytics Consent

Web Vitals respect user analytics consent stored in localStorage under the key `analytics-consent`:

```typescript
// Enable analytics
localStorage.setItem('analytics-consent', JSON.stringify({ analytics: true }))

// Disable analytics
localStorage.setItem('analytics-consent', JSON.stringify({ analytics: false }))
```

#### Performance Helpers

The Web Vitals plugin provides helpers for custom performance measurements:

```typescript
// In a component or composable
const { $webVitals } = useNuxtApp()

// Mark a performance point
$webVitals.mark('interaction-start')

// Measure between marks
$webVitals.mark('interaction-end')
$webVitals.measure('user-interaction', 'interaction-start', 'interaction-end')

// Get all performance entries
const entries = $webVitals.getEntries()
```

### Lighthouse CI

Lighthouse CI runs automated performance audits against production builds.

#### Performance Budgets

The following budgets are enforced:

**Category Scores:**
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥95

**Core Web Vitals:**
- Time to Interactive (TTI): <3.5s
- First Contentful Paint (FCP): <2s
- Largest Contentful Paint (LCP): <2.5s
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.1
- Speed Index: <3s

#### Running Lighthouse Locally

```bash
# 1. Build the production version
pnpm build

# 2. Run Lighthouse CI (starts preview server automatically)
pnpm lighthouse:ci
```

Lighthouse will:
1. Start a preview server
2. Run audits on key routes (home, lesson, knowledge card)
3. Generate HTML and JSON reports
4. Assert performance budgets

#### Interpreting Results

**Success:**
All budgets pass - your changes maintain performance standards.

**Failure:**
1. Check the generated HTML reports in `.lighthouseci/`
2. Identify which metrics failed
3. Review Web Vitals data for real-world impact
4. Optimize code/assets as needed
5. Re-run Lighthouse

**Common Issues:**
- Large JavaScript bundles → Code splitting, lazy loading
- Unoptimized images → Use Nuxt Image, WebP format
- Render-blocking resources → Defer non-critical CSS/JS
- Layout shifts → Reserve space for dynamic content

#### CI/CD Integration

In CI pipelines, Lighthouse runs automatically on pull requests:

```bash
pnpm --filter frontend lighthouse:ci
```

See `tests/performance/README.md` for detailed documentation.

## 📁 Project Structure

```
apps/frontend/
├── app/                    # Application entry and layouts
├── assets/                 # Static assets (CSS, images, etc.)
│   └── css/
│       └── tailwind.css   # Tailwind CSS configuration
├── components/            # Vue components
├── composables/          # Vue composables
├── content/              # Nuxt Content markdown files
├── layouts/              # Application layouts
├── pages/                # Application pages (file-based routing)
├── plugins/              # Nuxt plugins
├── public/               # Static files served at root
├── server/               # Server API routes and middleware
├── stores/               # Pinia stores
├── types/                # TypeScript type definitions
├── nuxt.config.ts        # Nuxt configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Tailwind CSS & Chinese Typography

The project is configured with Chinese typography optimization:

- System fonts optimized for Chinese characters (PingFang SC, Hiragino Sans GB, Microsoft YaHei)
- Proper letter spacing and line height for Chinese text
- Dark mode support with class-based toggling

### Using Tailwind Classes

```vue
<template>
  <div class="dark:bg-gray-800 dark:text-white">
    <h1 class="text-2xl font-medium">标题</h1>
    <p class="text-base">这是一段中文文本，经过优化以提供更好的阅读体验。</p>
  </div>
</template>
```

## 🌐 Strapi Integration

The app is configured to connect to a Strapi CMS backend. API calls can be made using:

### Runtime Config

```typescript
const config = useRuntimeConfig()
const strapiUrl = config.public.strapiUrl
```

### Example API Call

```typescript
// In a composable or component
const { data } = await useFetch(`${config.public.strapiUrl}/api/articles`)
```

## 🔌 State Management with Pinia

Create stores in the `stores/` directory:

```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const count = ref(0)
  
  function increment() {
    count.value++
  }
  
  return { count, increment }
})
```

Use in components:

```vue
<script setup lang="ts">
const exampleStore = useExampleStore()
</script>
```

## 📝 Nuxt Content

Place markdown files in the `content/` directory and query them:

```typescript
const { data } = await useAsyncData('articles', () =>
  queryContent('/articles').find()
)
```

## 🌙 Dark Mode

Toggle dark mode using the color mode composable:

```vue
<script setup lang="ts">
const colorMode = useColorMode()

const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button @click="toggleDark">
    Toggle Dark Mode
  </button>
</template>
```

## 🇨🇳 China Deployment Notes

### Font Loading

The project uses system fonts by default to avoid blocked CDNs. If you need web fonts, use domestic CDNs:

- jsDelivr (China CDN): `https://cdn.jsdelivr.net/`
- Bootcdn: `https://cdn.bootcdn.net/`
- 75CDN: `https://cdn.baomitu.com/`

### Registry Configuration

For faster package installation in China, edit `.npmrc` in the project root:

```ini
registry=https://registry.npmmirror.com
```

## 🔍 Troubleshooting

### Module Not Found Errors

If you encounter module resolution errors, try:

```bash
rm -rf node_modules .nuxt
pnpm install
```

### TypeScript Errors

Regenerate types:

```bash
pnpm postinstall
```

### Port Already in Use

Change the port in `.env`:

```env
PORT=3001
```

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Pinia Documentation](https://pinia.vuejs.org)
- [VueUse Documentation](https://vueuse.org)
- [Nuxt Content Documentation](https://content.nuxt.com)
