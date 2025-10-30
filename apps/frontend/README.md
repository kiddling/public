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
NUXT_STRAPI_API_PATH=/api
NUXT_STRAPI_TIMEOUT=8000
NUXT_STRAPI_RETRY=2
NUXT_STRAPI_RETRY_DELAY=600
NUXT_STRAPI_CACHE_TTL=600000
NUXT_PUBLIC_STRAPI_CACHE_TTL=600000

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

The frontend ships with a dedicated, typed Strapi client built on `ofetch`. It automatically applies China-friendly timeouts and retry logic, works during SSR, and caches the last successful payload so components can gracefully degrade if the network is unavailable.

### Generating Strapi API tokens

1. Sign in to your Strapi admin panel.
2. Open **Settings → API Tokens** and click **Create new API Token**.
3. Choose a descriptive name, select the permissions you need ("Full access" is convenient for development), and confirm.
4. Copy the generated token into `NUXT_STRAPI_API_TOKEN` in your `.env` file.

### CMS composables

Use the composables in `composables/` to fetch common content types with full TypeScript support and caching:

```ts
import { computed } from 'vue'
import { useLessons } from '~/composables/useLessons'
import { buildDeepPopulate } from '~/utils/strapi-query'

const lessons = await useLessons({
  code: 'L-001',
  populate: buildDeepPopulate(4),
})

const lesson = computed(() => lessons.data.value?.items[0])
```

Other helpers follow the same pattern:

```ts
const knowledgeCards = await useKnowledgeCards({ type: 'Theory', tags: ['design'] })
const studentWorks = await useStudentWorks({ discipline: '产品', loop: 'Loop 1' })
const resources = await useResources({ category: 'Video Tutorials' })
```

Each composable returns an `AsyncData`-style object with `data`, `pending`, `error`, `refresh`, `items`, `meta`, and an `isFallback` flag so you can detect when cached data is being used.

All requests honour the timeout, retry, and cache TTL variables documented above.

### Runtime config

If you need lower-level access, use `useRuntimeConfig()` to read the current Strapi endpoints:

```ts
const config = useRuntimeConfig()
const strapiUrl = config.public.strapiUrl
const apiBase = config.public.apiBaseUrl
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
