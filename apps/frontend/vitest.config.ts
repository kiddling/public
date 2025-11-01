import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

const rootDir = dirname(fileURLToPath(new URL('./package.json', import.meta.url)))

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '~': rootDir,
      '@': rootDir,
      '#app': resolve(rootDir, 'tests/stubs/nuxt-app.ts'),
      '#sitemap/types': resolve(rootDir, 'tests/stubs/sitemap-types.ts'),
      '~/composables/useCookieConsent': resolve(rootDir, 'tests/stubs/use-cookie-consent.ts'),
    },
  },
})
