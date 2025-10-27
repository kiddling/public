// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@vueuse/motion/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  // i18n configuration for Chinese language support
  i18n: {
    locales: [
      {
        code: 'zh-CN',
        language: 'zh-CN',
        name: '简体中文',
        files: ['zh-CN.json']
      }
    ],
    langDir: 'i18n/locales',
    defaultLocale: 'zh-CN'
  },

  // Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true
  },

  // Icon configuration
  icon: {
    size: '24px',
    class: 'icon',
    mode: 'svg'
  },

  // VueUse Motion configuration
  motion: {
    directives: {
      'pop-bottom': {
        initial: {
          scale: 0,
          opacity: 0,
          y: 100,
        },
        visible: {
          scale: 1,
          opacity: 1,
          y: 0,
        }
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
