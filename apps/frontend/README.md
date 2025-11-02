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

## 🐳 Docker Deployment

Build and run the application using Docker for production deployment.

### Building the Docker Image

Build the Docker image with the current git commit hash (from the repository root):

```bash
# Build from repository root (required for monorepo structure)
cd /path/to/project/root
docker build \
  --build-arg GIT_COMMIT_HASH=$(git rev-parse HEAD) \
  -t nuxt-frontend:latest \
  -f apps/frontend/Dockerfile \
  .
```

For faster builds in China, uncomment the registry mirror line in the Dockerfile:

```dockerfile
RUN pnpm config set registry https://registry.npmmirror.com
```

### Running the Container

Run the container with environment variables:

```bash
docker run -d \
  --name nuxt-app \
  -p 3000:3000 \
  -e NUXT_PUBLIC_API_BASE_URL=http://your-api-url:1337 \
  -e NUXT_PUBLIC_STRAPI_URL=http://your-strapi-url:1337 \
  -e NUXT_STRAPI_API_TOKEN=your-token-here \
  -e NUXT_PUBLIC_CDN_URL=https://your-cdn-url \
  nuxt-frontend:latest
```

### Health Check Endpoint

The application exposes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 120,
  "commitHash": "5282e6b",
  "environment": "production",
  "responseTime": 1
}
```

Access the health endpoint:

```bash
curl http://localhost:3000/api/health
```

### Docker Container Management

```bash
# View container logs
docker logs nuxt-app

# Check container health status
docker inspect --format='{{.State.Health.Status}}' nuxt-app

# Stop the container
docker stop nuxt-app

# Remove the container
docker rm nuxt-app
```

### Docker Security Configuration

The Docker container follows security best practices:

#### Non-Root User

The container runs as a non-root user (`nuxt` with UID 1001) for enhanced security. This prevents potential security vulnerabilities from allowing privilege escalation attacks.

To verify the container is running as a non-root user:

```bash
# Check the user running the process
docker exec nuxt-app whoami
# Output: nuxt

# Or inspect the user ID
docker exec nuxt-app id
# Output: uid=1001(nuxt) gid=1001(nodejs) groups=1001(nodejs)
```

#### Health Check

The Dockerfile includes a `HEALTHCHECK` instruction that automatically monitors the application's health:

- **Interval**: 30 seconds - checks health every 30 seconds
- **Timeout**: 3 seconds - health check request must complete within 3 seconds
- **Start Period**: 5 seconds - grace period for the app to start up
- **Retries**: 3 - marks unhealthy after 3 consecutive failures

The health check calls the `/api/health` endpoint and expects a 200 status code.

View the health status:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' nuxt-app
# Output: healthy | unhealthy | starting

# View detailed health check logs
docker inspect --format='{{json .State.Health}}' nuxt-app | jq
```

Docker Compose will automatically restart unhealthy containers when configured with `restart: unless-stopped` or similar policies.

### Environment Variables

The following environment variables can be configured when running the container:

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE_URL` | Base URL for API requests | `http://localhost:1337` |
| `NUXT_PUBLIC_STRAPI_URL` | Strapi CMS URL | `http://localhost:1337` |
| `NUXT_STRAPI_API_TOKEN` | Strapi API authentication token | `''` |
| `NUXT_PUBLIC_CDN_URL` | CDN URL for static assets | `''` |
| `PORT` | Port the app listens on (inside container) | `3000` |
| `NODE_ENV` | Node environment | `production` |

### Image Size Optimization

The Docker image uses a multi-stage build to achieve a lean production image:

- **Builder stage**: Installs all dependencies and builds the application
- **Runtime stage**: Only includes production dependencies and built output
- **Target size**: <200MB compressed

Check the image size:

```bash
docker images nuxt-frontend:latest
```

### China Server Deployment

For optimal performance in China:

1. **Use Domestic Docker Registries:**
   - Aliyun Container Registry: `registry.cn-hangzhou.aliyuncs.com`
   - Tencent Cloud: `ccr.ccs.tencentyun.com`
   - Huawei Cloud: `swr.cn-north-4.myhuaweicloud.com`

2. **NPM Registry Mirrors:**
   - Taobao NPM: `https://registry.npmmirror.com`
   - Huawei Cloud: `https://mirrors.huaweicloud.com/repository/npm/`

3. **Alpine Mirrors (if needed):**
   Add to Dockerfile before package installation:
   ```dockerfile
   RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
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

## 🧪 Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Run tests once
pnpm test

# Run in watch mode
pnpm test:unit

# Run with coverage
pnpm test:unit -- --coverage
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
# Run all E2E tests
pnpm test:e2e

# Run in specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Interactive UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

**Prerequisites for E2E tests:**

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps
```

E2E tests run against a mock Strapi server on port 3457. See [docs/TESTING.md](/docs/TESTING.md) for comprehensive testing documentation.

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
├── tests/                # Test files
│   ├── e2e/              # Playwright E2E tests
│   │   ├── fixtures/     # Mock API data
│   │   ├── helpers/      # Test utilities
│   │   ├── mocks/        # Mock server
│   │   └── specs/        # Test specifications
│   └── *.spec.ts         # Vitest unit tests
├── types/                # TypeScript type definitions
├── nuxt.config.ts        # Nuxt configuration
├── playwright.config.ts  # Playwright E2E configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest unit test configuration
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
const { data } = await useAsyncData('articles', () => queryContent('/articles').find())
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
  <button @click="toggleDark">Toggle Dark Mode</button>
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

## 🖼️ Image Optimization

The project uses `@nuxt/image` for automatic image optimization, lazy loading, and responsive delivery.

### Using NuxtImg

Replace standard `<img>` tags with `<NuxtImg>`:

```vue
<template>
  <!-- Basic usage -->
  <NuxtImg src="/images/photo.jpg" alt="Description" />

  <!-- With preset -->
  <NuxtImg src="/images/photo.jpg" alt="Student work" preset="gallery" loading="lazy" />

  <!-- With responsive sizes -->
  <NuxtImg
    src="/images/photo.jpg"
    alt="Card image"
    preset="card"
    sizes="xs:280px sm:320px md:400px lg:500px"
  />
</template>
```

### Image Presets

Pre-configured image sizes for consistent usage:

- **thumbnail**: 200x200px, cover fit (profile pics, small cards)
- **card**: 400x300px, cover fit (knowledge cards, resource cards)
- **gallery**: 800px width, contain fit (galleries, lightboxes)
- **hero**: 1920px width, contain fit (full-screen images)

### Image Formats

Images are automatically converted to modern formats:

- **WebP**: ~25-35% smaller than JPEG
- **AVIF**: ~50% smaller than JPEG (where supported)
- Original format as fallback

### Performance Best Practices

1. **Always provide descriptive alt text** for accessibility
2. **Use `loading="lazy"`** for below-fold images
3. **Use appropriate presets** to avoid over-optimization
4. **Leverage responsive sizes** for different viewports

### Lazy Loading

For custom lazy loading beyond images:

```vue
<script setup>
import { useLazyLoad } from '~/composables/useLazyLoad'

const { createLazyObserver, observeImages } = useLazyLoad()

onMounted(() => {
  const images = document.querySelectorAll('img[data-src]')
  observeImages(Array.from(images))
})
</script>
```

Or use the directive:

```vue
<template>
  <!-- Lazy load with directive -->
  <div v-lazy-load class="heavy-section">
    <!-- Content loads when scrolled into view -->
  </div>
</template>
```

## 🔤 Font Strategy

The project uses a system font stack by default for instant loading and optimal Chinese typography.

### System Fonts

Configured in `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: [
    'PingFang SC',        // macOS & iOS
    'Hiragino Sans GB',   // Older macOS
    'Microsoft YaHei',    // Windows
    'WenQuanYi Micro Hei',// Linux
    'sans-serif',
  ],
}
```

### Self-Hosting Fonts (Optional)

To use custom fonts like Source Han Sans CN:

1. Add font files to `public/fonts/` (see `public/fonts/README.md` for details)
2. Uncomment `@font-face` declarations in `assets/css/fonts.css`
3. Uncomment font preload in `nuxt.config.ts`
4. Uncomment font name in `tailwind.config.ts`

### Font Display Strategy

All fonts use `font-display: swap`:

- Text appears immediately with fallback fonts
- Custom fonts swap in when ready
- No Flash of Invisible Text (FOIT)

### Performance Considerations

**System Fonts** (Current Default):

- ✅ Zero network requests
- ✅ Instant rendering
- ✅ Platform-optimized
- ✅ Great Chinese support

**Self-Hosted Fonts**:

- ⚠️ Requires network requests
- ⚠️ Needs careful subsetting
- ✅ Consistent branding
- ✅ Works in China (no CDN blocking)

For most projects, system fonts are recommended.

## 🚀 Asset Delivery & Caching

### Caching Strategy

Long-term caching is configured for static assets:

```typescript
// In nuxt.config.ts
nitro: {
  routeRules: {
    '/fonts/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/_ipx/**': { // Optimized images
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
  }
}
```

### Compression

Brotli and Gzip compression are enabled for all assets:

- HTML, CSS, JS: Automatically compressed
- Images: Pre-optimized by `@nuxt/image`
- Fonts: Pre-compressed when using WOFF2

### CDN-Ready

The app is optimized for CDN deployment:

- Immutable asset URLs with content hashing
- Long-term browser caching
- Efficient compression
- Optimized for China hosting

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Nuxt Image Documentation](https://image.nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Pinia Documentation](https://pinia.vuejs.org)
- [VueUse Documentation](https://vueuse.org)
- [Nuxt Content Documentation](https://content.nuxt.com)
- [Source Han Sans Fonts](https://github.com/adobe-fonts/source-han-sans)
