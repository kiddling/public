import { vi } from 'vitest'

// Mock Nuxt auto-imports
global.defineNuxtConfig = vi.fn((config) => config)
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    strapiUrl: 'http://localhost:1337',
    apiBaseUrl: 'http://localhost:1337',
  },
}))

// Mock window.matchMedia for dark mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
