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
  
  // Runtime config for Strapi integration
  runtimeConfig: {
    // Private keys (server-side only)
    strapiApiToken: process.env.NUXT_STRAPI_API_TOKEN || '',
    
    // Public keys (exposed to client)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1337',
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
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

  // Nitro configuration for production
  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
  },
})
