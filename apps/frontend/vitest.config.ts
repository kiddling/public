import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(new URL('./package.json', import.meta.url)))

export default defineConfig({
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
    },
  },
})
