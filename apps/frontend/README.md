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

### Bundle Analysis

Analyze the production bundle to identify optimization opportunities:

```bash
pnpm analyze
```

This will:
- Build the application with bundle analysis enabled
- Generate a visual treemap of your bundle composition
- Open an interactive visualization server at `http://localhost:8888`
- Show vendor chunk splitting (Vue, Pinia, UI libraries, misc)

The analyzer helps you:
- Identify large dependencies that could be optimized
- Verify that manual chunk splitting is working correctly
- Find opportunities to reduce bundle size
- Understand what's included in each chunk

### Prerendering

The application automatically pre-renders static and dynamic routes during the build process:

**Static Routes:**
- Homepage (`/`)
- Lessons index (`/lessons`)
- Knowledge cards index (`/knowledge-cards`)
- Resources index (`/resources`)
- Downloads index (`/downloads`)
- Students page (`/students`)
- Tools pages

**Dynamic CMS Routes:**
During build, the application connects to Strapi (if available) to enumerate:
- Individual lesson pages (`/lessons/[code]`)
- Individual knowledge card pages (`/knowledge-cards/[slug]`)

This provides:
- **Faster initial page loads** - Pre-rendered HTML served immediately
- **Better SEO** - Search engines can crawl all content
- **Improved performance** - No server-side rendering needed for pre-rendered pages
- **Graceful fallback** - If Strapi is unavailable during build, static routes are still pre-rendered

**Build-time Configuration:**
Set these environment variables before building to enable CMS route enumeration:
```bash
NUXT_PUBLIC_STRAPI_URL=https://your-cms-url.com
NUXT_STRAPI_API_TOKEN=your-api-token
```

If Strapi is unreachable during build, you'll see warnings but the build will continue with static routes only.

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

This application is optimized for hosting in China with several key considerations:

### China-Compatible Configuration

✅ **No Google CDN Dependencies**
- All fonts use system fonts (no Google Fonts)
- No external CDN dependencies by default
- When external resources are needed, domestic CDN alternatives are configured

✅ **Optimized for Chinese Networks**
- SSR enabled for fast initial loads
- Aggressive caching strategy for static assets
- CDN-friendly cache headers configured
- ISR (Incremental Static Regeneration) for dynamic content

✅ **Performance Optimizations**
- Link prefetching enabled (configured in `app.config.ts`)
- Manual chunk splitting for optimal loading
- Payload extraction for smaller initial bundles
- Long-lived cache for static assets (1 year)
- Short cache with stale-while-revalidate for CMS content

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

### Caching Strategy

The application uses a tiered caching approach:

| Route Type | Cache Duration | Strategy |
|------------|----------------|----------|
| Static assets (`/_nuxt/**`) | 1 year | Immutable |
| Homepage (`/`) | 1 hour | SWR with 24h stale |
| CMS list pages | 10 minutes | SWR with 1h stale |
| CMS detail pages | 30 minutes | SWR with 1h stale |
| API routes | No cache | Always fresh |

**SWR (Stale-While-Revalidate)** means:
- Serve cached content immediately
- Fetch fresh content in the background
- Update cache for next request
- Provides fast response times while keeping content fresh

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
