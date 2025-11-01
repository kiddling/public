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

## 🎥 Video Embed Component

The application includes a privacy-first video embed component supporting Chinese video platforms (Bilibili, Tencent Video, and Youku).

### Supported Providers

- **Bilibili** - China's leading video sharing platform
- **Tencent Video** - Tencent's video streaming service
- **Youku** - Alibaba's video platform

### Features

- **Privacy-First Loading**: Videos are not loaded until user explicitly clicks to play
- **Lazy Loading**: Uses intersection observer to defer loading until visible
- **Responsive Design**: Maintains 16:9 aspect ratio on all screen sizes
- **Progress Tracking**: Automatically saves and resumes playback position (minimum 10 seconds)
- **Offline Fallback**: Shows helpful error message with direct link when provider is unavailable
- **Cover Images**: Optional custom thumbnail before activation
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Usage in Components

```vue
<template>
  <MediaVideoEmbed
    :embed="videoEmbed"
    :privacy-mode="true"
    :lazy-load="true"
  />
</template>

<script setup lang="ts">
import type { VideoEmbed } from '~/utils/video-providers'

const videoEmbed: VideoEmbed = {
  id: 'video-1',
  provider: 'bilibili',
  videoId: 'BV1GJ411x7h7',
  title: 'Introduction to Design',
  description: 'A comprehensive guide to design principles',
  coverImage: {
    url: '/images/cover.jpg',
    alt: 'Video cover'
  },
  startTime: 0,
  fallbackNotes: 'This video may not be available in your region'
}
</script>
```

### Video Provider Utilities

The `utils/video-providers.ts` module provides helper functions:

```typescript
import {
  parseVideoUrl,
  generateEmbedUrl,
  generateDirectUrl,
  normalizeVideoId,
  getProviderName
} from '~/utils/video-providers'

// Parse video URL to extract provider and ID
const parsed = parseVideoUrl('https://www.bilibili.com/video/BV1GJ411x7h7')
// { provider: 'bilibili', videoId: 'BV1GJ411x7h7', startTime: undefined }

// Generate embed iframe URL
const embedUrl = generateEmbedUrl('bilibili', 'BV1GJ411x7h7', 30)
// https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7&high_quality=1&autoplay=0&t=30

// Generate direct link to video page
const directUrl = generateDirectUrl('bilibili', 'BV1GJ411x7h7')
// https://www.bilibili.com/video/BV1GJ411x7h7

// Get friendly provider name
const name = getProviderName('bilibili')
// 'Bilibili'
```

### Progress Persistence

Video playback progress is automatically saved to `localStorage` with the key format:
```
video-progress:{provider}:{videoId}
```

Progress is only saved if:
- The video has been watched for at least 10 seconds
- The user hasn't finished watching (to allow rewatching)

### Integration with Strapi

Video embeds are configured in Strapi as a shared component (`interactive.video-embed`) and can be added to:
- **Lesson difficulty blocks**: Multiple videos per difficulty level
- **Resources**: Embedded videos in resource detail modal

The normalizers in `utils/lesson-normalizer.ts` and `utils/resource-normalizer.ts` automatically parse video embed data from Strapi.

### Privacy Behavior

By default, `privacyMode` is enabled, which means:
1. No external requests are made until user action
2. A placeholder with cover image (or default gradient) is shown
3. User must click "Load video" button to activate iframe
4. Once activated, the video provider's iframe is embedded and may set cookies

This approach complies with privacy regulations and reduces bandwidth usage.

### Testing

Unit tests cover:
- Video URL parsing for all providers
- Embed URL generation with timestamps
- Component privacy mode behavior
- Progress persistence in localStorage
- Fallback error handling

Run tests:
```bash
pnpm test
```

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Pinia Documentation](https://pinia.vuejs.org)
- [VueUse Documentation](https://vueuse.org)
- [Nuxt Content Documentation](https://content.nuxt.com)
