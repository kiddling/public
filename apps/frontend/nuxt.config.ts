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
  ],

  // SSR configuration for China hosting
  ssr: true,

  // Experimental features for Nuxt 4 compatibility
  experimental: {
    payloadExtraction: true,
  },
  
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
        // Using domestic CDN for Chinese fonts
        // Uncomment and adjust as needed
        // { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/index.css' }
      ],
    },
  },

  // Vite configuration for build optimization
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separate vendor bundles
            if (id.includes('node_modules')) {
              // Pinia state management
              if (id.includes('pinia')) {
                return 'vendor-pinia'
              }
              // UI libraries and utilities (check before vue to handle vueuse)
              if (id.includes('vueuse') || id.includes('tailwind')) {
                return 'vendor-ui'
              }
              // Vue ecosystem
              if (id.includes('vue') || id.includes('nuxt') || id.includes('@vue')) {
                return 'vendor-vue'
              }
              // Other vendors
              return 'vendor-misc'
            }
          },
        },
      },
    },
  },

  // Nuxt hooks for dynamic configuration
  hooks: {
    'vite:extendConfig': async (config, { isClient }) => {
      // Add bundle analyzer only when ANALYZE env var is set
      if (process.env.ANALYZE && isClient) {
        const { default: analyzer } = await import('vite-bundle-analyzer')
        config.plugins = config.plugins || []
        config.plugins.push(
          analyzer({
            analyzerMode: 'server',
            analyzerPort: 8888,
          })
        )
      }
    },
  },

  // Nitro configuration for production
  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
    
    prerender: {
      // Static routes will be added here
      routes: [
        '/',
        '/lessons',
        '/knowledge-cards',
        '/resources',
        '/downloads',
        '/students',
        '/tools/design-log',
      ],
      // Crawl links disabled to avoid over-fetching
      crawlLinks: false,
    },

    // Route rules for caching and ISR
    routeRules: {
      // Static pages - long cache
      '/': { 
        swr: 3600, // 1 hour stale-while-revalidate
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
      
      // CMS list pages - short cache with ISR
      '/lessons': { 
        swr: 600, // 10 minutes
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      },
      '/knowledge-cards': { 
        swr: 600,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      },
      '/resources': { 
        swr: 600,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      },
      '/downloads': { 
        swr: 600,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      },

      // CMS detail pages - ISR with shorter cache
      '/lessons/**': { 
        swr: 1800, // 30 minutes
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=1800, stale-while-revalidate=3600',
        },
      },
      '/knowledge-cards/**': { 
        swr: 1800,
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=1800, stale-while-revalidate=3600',
        },
      },

      // Static assets - long-lived cache
      '/_nuxt/**': { 
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      
      // API routes - no cache
      '/api/**': { 
        cache: false,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    },

    // Build-time hook to enumerate CMS routes
    hooks: {
      async 'prerender:routes'(ctx) {
        // Check if Strapi is available
        const strapiUrl = process.env.NUXT_PUBLIC_STRAPI_URL || process.env.NUXT_PUBLIC_API_BASE_URL
        if (!strapiUrl) {
          console.warn('⚠️  Strapi URL not configured, skipping dynamic route prerendering')
          return
        }

        try {
          const baseUrl = strapiUrl.replace(/\/$/, '')
          const headers: Record<string, string> = {}
          const strapiToken = process.env.NUXT_STRAPI_API_TOKEN
          if (strapiToken) {
            headers.Authorization = `Bearer ${strapiToken}`
          }

          console.log('🔍 Fetching CMS routes for prerendering...')

          // Fetch lessons
          try {
            const lessonsResponse = await fetch(
              `${baseUrl}/api/lessons?pagination[limit]=100&fields[0]=code`,
              { headers }
            )
            if (lessonsResponse.ok) {
              const lessonsData = await lessonsResponse.json() as { data: Array<{ attributes?: { code?: string } }> }
              const lessonRoutes = lessonsData.data
                .filter((lesson) => lesson.attributes?.code)
                .map((lesson) => `/lessons/${lesson.attributes!.code}`)
              ctx.routes.add(...lessonRoutes)
              console.log(`✓ Added ${lessonRoutes.length} lesson routes`)
            }
          } catch (err) {
            console.warn('⚠️  Failed to fetch lessons:', err instanceof Error ? err.message : String(err))
          }

          // Fetch knowledge cards
          try {
            const cardsResponse = await fetch(
              `${baseUrl}/api/knowledge-cards?pagination[limit]=100&fields[0]=slug`,
              { headers }
            )
            if (cardsResponse.ok) {
              const cardsData = await cardsResponse.json() as { data: Array<{ attributes?: { slug?: string } }> }
              const cardRoutes = cardsData.data
                .filter((card) => card.attributes?.slug)
                .map((card) => `/knowledge-cards/${card.attributes!.slug}`)
              ctx.routes.add(...cardRoutes)
              console.log(`✓ Added ${cardRoutes.length} knowledge card routes`)
            }
          } catch (err) {
            console.warn('⚠️  Failed to fetch knowledge cards:', err instanceof Error ? err.message : String(err))
          }

          console.log('✓ CMS route enumeration complete')
        } catch (error) {
          console.warn(
            '⚠️  Failed to enumerate CMS routes (Strapi may be unreachable):',
            error instanceof Error ? error.message : String(error)
          )
          console.warn('   Continuing with static routes only...')
        }
      },
    },
  },
})
