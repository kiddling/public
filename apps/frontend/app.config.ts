/**
 * App configuration for runtime values
 * China deployment compatible - no Google CDN dependencies
 */
export default defineAppConfig({
  // App metadata
  name: 'Nuxt + Strapi App',
  description: 'A modern web application built with Nuxt 3 and Strapi',
  
  // UI configuration
  ui: {
    // System fonts optimized for Chinese - no external CDN fonts
    fonts: {
      system: true, // Use system fonts
      // Fallback to domestic CDNs if external fonts needed:
      // jsDelivr: 'https://cdn.jsdelivr.net/',
      // Bootcdn: 'https://cdn.bootcdn.net/',
    },
  },

  // Feature flags
  features: {
    darkMode: true,
    search: true,
    navigation: true,
  },

  // Performance settings
  performance: {
    // Link prefetching is enabled by default in Nuxt 4
    // Can be configured via nuxtApp.$router.options.linkPrefetchedClass
    prefetchLinks: true, // Link prefetching enabled
    lazyLoad: true, // Lazy load images and components
  },
})
