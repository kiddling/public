// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxt/image',
  ],

  // SSR configuration for China hosting
  ssr: true,
  
  // Runtime config for Strapi integration
  runtimeConfig: {
    // Private keys (server-side only)
    strapiApiToken: process.env.NUXT_STRAPI_API_TOKEN || '',
    
    // Public keys (exposed to client)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1337',
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
      cmsUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
      cdnUrl: process.env.NUXT_PUBLIC_CDN_URL || '',
    },
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: './assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  // Color mode configuration for dark mode
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // Content module configuration
  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
    },
  },

  // Image module configuration for optimized delivery
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp', 'avif', 'jpg', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: ['localhost', process.env.NUXT_PUBLIC_STRAPI_URL || ''],
    strapi: {
      baseURL: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    },
    presets: {
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 200,
          height: 200,
          fit: 'cover',
        },
      },
      card: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 300,
          fit: 'cover',
        },
      },
      gallery: {
        modifiers: {
          format: 'webp',
          width: 800,
          fit: 'inside',
        },
      },
      hero: {
        modifiers: {
          format: 'webp',
          width: 1920,
          fit: 'inside',
        },
      },
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disable during dev for faster startup
  },

  // App configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Nuxt + Strapi App',
      meta: [
        { name: 'description', content: 'A modern web application built with Nuxt 3 and Strapi' },
      ],
      link: [
        // Preload critical fonts for faster rendering
        // Add font preloads here when self-hosted fonts are configured
        // { rel: 'preload', href: '/fonts/source-han-sans-cn-regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
    },
  },

  // Nitro configuration for production
  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
    compression: {
      algorithm: 'gzip',
      // Enable Brotli compression for better compression ratios
      brotli: true,
    },
    // Route rules for long-term caching of static assets
    routeRules: {
      '/fonts/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      '/_ipx/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    },
  },
})
