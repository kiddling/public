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
      
      // Security configuration
      securityEnforceHttps: process.env.NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS || 'true',
      securityHstsEnabled: process.env.NUXT_PUBLIC_SECURITY_HSTS_ENABLED || 'true',
      securityHstsMaxAge: process.env.NUXT_PUBLIC_SECURITY_HSTS_MAX_AGE || '31536000',
      securityHstsIncludeSubdomains: process.env.NUXT_PUBLIC_SECURITY_HSTS_INCLUDE_SUBDOMAINS || 'true',
      securityHstsPreload: process.env.NUXT_PUBLIC_SECURITY_HSTS_PRELOAD || 'true',
      
      securityCspEnabled: process.env.NUXT_PUBLIC_SECURITY_CSP_ENABLED || 'true',
      securityCspDefaultSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_DEFAULT_SRC || "'self'",
      securityCspScriptSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_SCRIPT_SRC || "'self' 'unsafe-inline' 'unsafe-eval'",
      securityCspStyleSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_STYLE_SRC || "'self' 'unsafe-inline'",
      securityCspImgSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_IMG_SRC || "'self' data: https:",
      securityCspConnectSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_CONNECT_SRC || "'self'",
      securityCspFontSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_FONT_SRC || "'self' data:",
      securityCspObjectSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_OBJECT_SRC || "'none'",
      securityCspMediaSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_MEDIA_SRC || "'self'",
      securityCspFrameSrc: process.env.NUXT_PUBLIC_SECURITY_CSP_FRAME_SRC || "'none'",
      securityCspBaseUri: process.env.NUXT_PUBLIC_SECURITY_CSP_BASE_URI || "'self'",
      securityCspFormAction: process.env.NUXT_PUBLIC_SECURITY_CSP_FORM_ACTION || "'self'",
      securityCspFrameAncestors: process.env.NUXT_PUBLIC_SECURITY_CSP_FRAME_ANCESTORS || "'none'",
      securityCspUpgradeInsecureRequests: process.env.NUXT_PUBLIC_SECURITY_CSP_UPGRADE_INSECURE_REQUESTS || 'true',
      securityCspReportUri: process.env.NUXT_PUBLIC_SECURITY_CSP_REPORT_URI || '',
      
      securityXFrameOptions: process.env.NUXT_PUBLIC_SECURITY_X_FRAME_OPTIONS || 'DENY',
      securityReferrerPolicy: process.env.NUXT_PUBLIC_SECURITY_REFERRER_POLICY || 'strict-origin-when-cross-origin',
      securityPermissionsPolicy: process.env.NUXT_PUBLIC_SECURITY_PERMISSIONS_POLICY || 'camera=(), microphone=(), geolocation=()',
      securityXContentTypeOptions: process.env.NUXT_PUBLIC_SECURITY_X_CONTENT_TYPE_OPTIONS || 'true',
      securityXXssProtection: process.env.NUXT_PUBLIC_SECURITY_X_XSS_PROTECTION || 'true',
      securitySecureCookies: process.env.NUXT_PUBLIC_SECURITY_SECURE_COOKIES || 'true',
      
      securityRateLimitEnabled: process.env.NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED || 'true',
      securityRateLimitMaxRequests: process.env.NUXT_PUBLIC_SECURITY_RATE_LIMIT_MAX_REQUESTS || '100',
      securityRateLimitWindowMs: process.env.NUXT_PUBLIC_SECURITY_RATE_LIMIT_WINDOW_MS || '60000',
      securityRateLimitSkipPaths: process.env.NUXT_PUBLIC_SECURITY_RATE_LIMIT_SKIP_PATHS || '/_nuxt,/fonts,/images,/_ipx',
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
      htmlAttrs: {
        lang: 'zh-CN',
      },
      meta: [
        { name: 'description', content: 'A modern web application built with Nuxt 3 and Strapi' },
      ],
      link: [
        // Preload critical fonts for faster rendering
        // Add font preloads here when self-hosted fonts are configured
        // { rel: 'preload', href: '/fonts/source-han-sans-cn-regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
    },
    // Intelligent page transitions for better UX
    pageTransition: {
      name: 'page',
      mode: 'out-in',
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
    // Pre-render static routes for faster first load
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/design-log',
        '/resources',
        '/downloads',
        '/tools/design-log',
        '/knowledge-cards',
        '/students',
        '/error/404',
        '/error/offline',
      ],
      // Ignore dynamic routes that require CMS data
      ignore: [
        '/lessons/**',
        '/knowledge-cards/**',
        '/api/**',
      ],
    },
    // Route rules for long-term caching of static assets and ISR
    routeRules: {
      // Static assets - long-term caching
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
      // Static pages - pre-rendered with stale-while-revalidate
      '/': { 
        prerender: true,
        swr: true,
      },
      '/design-log': { 
        prerender: true,
        swr: 3600, // Revalidate every hour
      },
      '/resources': { 
        prerender: true,
        swr: 3600,
      },
      '/downloads': { 
        prerender: true,
        swr: 3600,
      },
      '/students': { 
        prerender: true,
        swr: 3600,
      },
      // ISR for CMS-driven pages - balance freshness with performance
      '/lessons/**': {
        swr: 1800, // 30 minutes for lesson content
        cache: {
          maxAge: 1800,
          staleMaxAge: 3600, // Serve stale for 1 hour while revalidating
        },
      },
      '/knowledge-cards/**': {
        swr: 1800, // 30 minutes for knowledge card content
        cache: {
          maxAge: 1800,
          staleMaxAge: 3600,
        },
      },
      // API routes - shorter cache for dynamic data
      '/api/**': {
        cache: {
          maxAge: 300, // 5 minutes
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
          // Manual chunks for better caching - organized by feature domains
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
            
            // Feature-based chunking for application code
            // Lessons feature domain
            if (id.includes('/pages/lessons/') || id.includes('/components/lessons/')) {
              return 'feature-lessons'
            }
            
            // Knowledge cards feature domain
            if (id.includes('/pages/knowledge-cards/') || id.includes('/components/knowledge-cards/')) {
              return 'feature-knowledge'
            }
            
            // Student management feature domain
            if (id.includes('/pages/students') || id.includes('/components/student')) {
              return 'feature-students'
            }
            
            // Tools and utilities feature domain
            if (id.includes('/pages/tools/') || id.includes('/pages/design-log')) {
              return 'feature-tools'
            }
            
            // Downloads and resources feature domain
            if (id.includes('/pages/downloads/') || id.includes('/pages/resources/')) {
              return 'feature-resources'
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

  // Router options for code splitting and smart prefetching
  router: {
    options: {
      // Enable strict mode for better performance
      strict: true,
      // Smart prefetching suitable for China bandwidth environments
      linkPrefetchedClass: 'nuxt-link-prefetched',
      linkActiveClass: 'nuxt-link-active',
      linkExactActiveClass: 'nuxt-link-exact-active',
    },
  },

  // App-level router configuration for intelligent prefetching
  hooks: {
    'pages:extend'(pages) {
      // Add custom prefetch logic for heavy pages
      const heavyPages = ['/lessons', '/knowledge-cards', '/students']
      pages.forEach(page => {
        if (heavyPages.some(p => page.path.startsWith(p))) {
          // @ts-ignore - meta is available but may not be fully typed
          page.meta = page.meta || {}
          // @ts-ignore
          page.meta.prefetch = false // Disable auto-prefetch for heavy pages
        }
      })
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
