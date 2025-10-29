export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
    routeRules: {
      '/api/health': { 
        cors: true, 
        headers: { 
          'cache-control': 'no-cache, no-store, must-revalidate',
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'DENY',
          'x-xss-protection': '1; mode=block'
        } 
      },
      '/**': { 
        headers: { 
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'SAMEORIGIN',
          'x-xss-protection': '1; mode=block',
          'strict-transport-security': 'max-age=31536000; includeSubDomains'
        } 
      }
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'renderer', content: 'webkit' },
        { name: 'force-rendering', content: 'webkit' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge,chrome=1' },
        { name: 'applicable-device', content: 'pc,mobile' },
        { name: 'mobile-agent', content: 'format=html5;url=' }
      ]
    }
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true
  },

  router: {
    options: {
      strict: false
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/courses/**': { swr: 3600 },
    '/resources/**': { swr: 3600 },
    '/api/**': { cors: true }
  },

  modules: [
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/fontaine'
  ],

  image: {
    dir: 'assets/images',
    quality: 80,
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    presets: {
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 300,
          height: 200,
          fit: 'cover'
        }
      },
      hero: {
        modifiers: {
          format: 'webp',
          width: 1200,
          height: 630,
          fit: 'cover'
        }
      }
    },
    densities: [1, 2],
    provider: 'ipx'
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: '在线教育平台',
    description: '提供高质量的在线课程和学习资源',
    defaultLocale: 'zh-CN'
  },

  sitemap: {
    hostname: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    gzip: true,
    routes: [],
    exclude: [
      '/admin/**',
      '/api/**'
    ],
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    }
  },

  fontMetrics: {
    fonts: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans SC']
  },

  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    }
  },

  build: {
    analyze: process.env.ANALYZE === 'true'
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      siteName: '在线教育平台',
      siteDescription: '提供高质量的在线课程和学习资源',
      baiduAnalyticsId: process.env.NUXT_PUBLIC_BAIDU_ANALYTICS_ID || '',
      icpNumber: process.env.NUXT_PUBLIC_ICP_NUMBER || ''
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  compatibilityDate: '2024-01-01'
})
