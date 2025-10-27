export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  runtimeConfig: {
    strapi: {
      url: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',
      token: process.env.NUXT_STRAPI_TOKEN || '',
    },
    public: {
      strapi: {
        url: process.env.NUXT_PUBLIC_STRAPI_URL || process.env.NUXT_STRAPI_URL || 'http://localhost:1337',
      },
    },
  },

  routeRules: {
    '/api/lessons/**': { swr: 3600 },
    '/api/knowledge-cards/**': { swr: 3600 },
    '/api/student-works/**': { swr: 3600 },
    '/api/resources/**': { swr: 3600 },
  },

  nitro: {
    routeRules: {
      '/api/**': { 
        cors: true,
        headers: {
          'cache-control': 'public, max-age=3600, stale-while-revalidate=7200'
        }
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  compatibilityDate: '2024-04-03',
})
