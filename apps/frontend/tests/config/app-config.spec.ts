/**
 * App configuration regression tests
 * Ensures runtime configuration and performance settings are correct
 */

import { describe, it, expect, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Mock Nuxt auto-imports for config loading
vi.stubGlobal('defineAppConfig', <T>(config: T): T => config)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = resolve(__dirname, '../../app.config.ts')

// Dynamic import to load the config
const { default: appConfig } = await import(configPath)

describe('App Configuration', () => {
  describe('Performance Settings', () => {
    it('should enable prefetchLinks for performance', () => {
      expect(appConfig.performance?.prefetchLinks).toBe(true)
    })

    it('should enable lazy loading', () => {
      expect(appConfig.performance?.lazyLoad).toBe(true)
    })
  })

  describe('China Deployment Compatibility', () => {
    it('should use system fonts (no external CDN)', () => {
      expect(appConfig.ui?.fonts?.system).toBe(true)
    })

    it('should have app metadata configured', () => {
      expect(appConfig.name).toBeDefined()
      expect(appConfig.description).toBeDefined()
    })
  })

  describe('Feature Flags', () => {
    it('should enable dark mode feature', () => {
      expect(appConfig.features?.darkMode).toBe(true)
    })

    it('should enable search feature', () => {
      expect(appConfig.features?.search).toBe(true)
    })

    it('should enable navigation feature', () => {
      expect(appConfig.features?.navigation).toBe(true)
    })
  })
})
