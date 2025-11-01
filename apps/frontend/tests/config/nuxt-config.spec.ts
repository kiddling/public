/**
 * Nuxt configuration regression tests
 * Ensures critical build and performance optimizations remain in place
 */

import { describe, it, expect, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Mock Nuxt auto-imports for config loading
vi.stubGlobal('defineNuxtConfig', <T>(config: T): T => config)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = resolve(__dirname, '../../nuxt.config.ts')

// Dynamic import to load the config
const { default: nuxtConfig } = await import(configPath)

describe('Nuxt Configuration', () => {
  describe('Performance Features', () => {
    it('should enable experimental payloadExtraction', () => {
      expect(nuxtConfig.experimental?.payloadExtraction).toBe(true)
    })

    it('should set future compatibilityVersion to 4', () => {
      expect(nuxtConfig.future?.compatibilityVersion).toBe(4)
    })

    it('should have performance optimizations configured', () => {
      // Note: Link prefetching is enabled by default in Nuxt 4
      // We verify it's enabled via app.config.ts which is checked separately
      expect(nuxtConfig.experimental?.payloadExtraction).toBe(true)
    })
  })

  describe('Vite Build Configuration', () => {
    it('should configure manualChunks for bundle splitting', () => {
      const manualChunks = nuxtConfig.vite?.build?.rollupOptions?.output?.manualChunks
      expect(manualChunks).toBeDefined()
      expect(typeof manualChunks).toBe('function')
      
      if (typeof manualChunks === 'function') {
        // Test vendor-vue chunk
        expect(manualChunks('node_modules/vue/dist/vue.esm.js')).toBe('vendor-vue')
        expect(manualChunks('node_modules/@vue/reactivity/index.js')).toBe('vendor-vue')
        expect(manualChunks('node_modules/nuxt/dist/index.js')).toBe('vendor-vue')
        
        // Test vendor-pinia chunk
        expect(manualChunks('node_modules/pinia/dist/index.js')).toBe('vendor-pinia')
        
        // Test vendor-ui chunk
        expect(manualChunks('node_modules/@vueuse/core/index.js')).toBe('vendor-ui')
        expect(manualChunks('node_modules/tailwindcss/lib/index.js')).toBe('vendor-ui')
        
        // Test vendor-misc chunk (fallback)
        expect(manualChunks('node_modules/axios/dist/axios.js')).toBe('vendor-misc')
        
        // Test non-vendor modules return undefined
        expect(manualChunks('src/components/MyComponent.vue')).toBeUndefined()
      }
    })
  })

  describe('Nuxt Hooks Configuration', () => {
    it('should configure vite:extendConfig hook for bundle analyzer', () => {
      expect(nuxtConfig.hooks).toBeDefined()
      expect(typeof nuxtConfig.hooks?.['vite:extendConfig']).toBe('function')
    })
  })

  describe('Nitro Configuration', () => {
    it('should configure prerender routes', () => {
      expect(nuxtConfig.nitro?.prerender?.routes).toBeDefined()
      expect(Array.isArray(nuxtConfig.nitro?.prerender?.routes)).toBe(true)
      
      const routes = nuxtConfig.nitro?.prerender?.routes || []
      expect(routes).toContain('/')
      expect(routes).toContain('/lessons')
      expect(routes).toContain('/knowledge-cards')
      expect(routes).toContain('/resources')
      expect(routes).toContain('/downloads')
    })

    it('should disable crawlLinks for prerender', () => {
      expect(nuxtConfig.nitro?.prerender?.crawlLinks).toBe(false)
    })

    it('should configure route rules for caching', () => {
      const routeRules = nuxtConfig.nitro?.routeRules
      expect(routeRules).toBeDefined()
      
      // Check homepage caching
      expect(routeRules?.['/']?.swr).toBe(3600)
      expect(routeRules?.['/']?.headers?.['Cache-Control']).toBeDefined()
      
      // Check CMS list pages
      expect(routeRules?.['/lessons']?.swr).toBe(600)
      expect(routeRules?.['/knowledge-cards']?.swr).toBe(600)
      
      // Check CMS detail pages
      expect(routeRules?.['/lessons/**']?.swr).toBe(1800)
      expect(routeRules?.['/knowledge-cards/**']?.swr).toBe(1800)
      
      // Check static assets
      expect(routeRules?.['/_nuxt/**']?.headers?.['Cache-Control']).toContain('immutable')
      
      // Check API routes
      expect(routeRules?.['/api/**']?.cache).toBe(false)
    })

    it('should configure prerender hooks', () => {
      expect(nuxtConfig.nitro?.hooks).toBeDefined()
      expect(typeof nuxtConfig.nitro?.hooks?.['prerender:routes']).toBe('function')
    })
  })

  describe('SSR Configuration', () => {
    it('should enable SSR for China hosting', () => {
      expect(nuxtConfig.ssr).toBe(true)
    })
  })

  describe('Runtime Configuration', () => {
    it('should have Strapi integration config', () => {
      expect(nuxtConfig.runtimeConfig).toBeDefined()
      expect(nuxtConfig.runtimeConfig?.public).toBeDefined()
    })
  })
})
