import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

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
    // @ts-ignore - highlight is a valid config but types may not be updated
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
    // @ts-ignore - compression config is valid but types may not be fully exposed
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

  // Vite configuration for build optimizations
  vite: {
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunk size
      chunkSizeWarningLimit: 500,
      // Enable sourcemaps for error tracking
      sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
      // Rollup options for better code splitting
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: (id) => {
            // Vendor chunks strategy
            if (id.includes('node_modules')) {
              // Large libraries get their own chunks
              if (id.includes('jspdf')) return 'vendor-jspdf'
              if (id.includes('qrcode')) return 'vendor-qrcode'
              if (id.includes('markdown-it')) return 'vendor-markdown'
              if (id.includes('archiver')) return 'vendor-archiver'
              if (id.includes('better-sqlite3')) return 'vendor-sqlite'
              if (id.includes('sharp')) return 'vendor-sharp'
              
              // Vue ecosystem
              if (id.includes('@vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor-vue'
              }
              
              // VueUse and utilities
              if (id.includes('@vueuse') || id.includes('axios')) {
                return 'vendor-utils'
              }
              
              // Other node_modules go to vendor chunk
              return 'vendor'
            }
          },
          // Optimize chunk file names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
            return `chunks/[name]-[hash].js`
          },
          entryFileNames: 'entry/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
      ],
      exclude: [
        'jspdf',
        'archiver',
        'better-sqlite3',
        'sharp',
      ],
    },
    plugins: [
      // Bundle analyzer
      process.env.ANALYZE && visualizer({
        open: true,
        filename: '.nuxt/analyze/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
      // Compression plugins for production
      process.env.NODE_ENV === 'production' && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // Only compress files > 10KB
      }),
      process.env.NODE_ENV === 'production' && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
      }),
    ].filter(Boolean) as any, // Filter out false values and cast to any for type compatibility
    // Server options for development
    server: {
      hmr: {
        overlay: true,
      },
    },
  },

  // Experimental features for better performance
  experimental: {
    // Enable payload extraction for faster hydration
    payloadExtraction: true,
    // Enable render JSON payloads with support for revivable payloads
    renderJsonPayloads: true,
    // View transitions API
    viewTransition: true,
  },

  // Router options for code splitting
  router: {
    options: {
      // Enable strict mode for better performance
      strict: true,
    },
  },

  // Performance hints
  build: {
    // Analyze bundle in CI/CD
    analyze: process.env.ANALYZE === 'true',
    // Transpile specific packages if needed
    transpile: [],
  },
})
