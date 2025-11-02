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
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['composables/**/*.ts', 'stores/**/*.ts', 'utils/**/*.ts', 'components/**/*.vue'],
      exclude: [
        'tests/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/*.d.ts',
        'node_modules/**',
        '.nuxt/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
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
