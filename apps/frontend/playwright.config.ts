import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * Tests run against mocked Strapi backend with full cross-browser coverage
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e/specs',

  // Global setup/teardown for mock server
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3456',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Video on failure
    video: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Artifacts
    acceptDownloads: true,

    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Projects for different browsers and devices
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable downloads for resource download tests
        acceptDownloads: true,
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        acceptDownloads: true,
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        acceptDownloads: true,
      },
    },

    // Mobile emulation with throttling
    {
      name: 'mobile-chrome',
      use: {
        ...devices['iPhone 13 Pro'],
        // Emulate slower network for mobile performance tests
        offline: false,
      },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3456',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Use E2E environment variables
      NODE_ENV: 'test',
      NUXT_HOST: '0.0.0.0',
      NUXT_PORT: '3456',
      NUXT_PUBLIC_API_BASE_URL: process.env.E2E_STRAPI_URL || 'http://localhost:3457',
      NUXT_PUBLIC_STRAPI_URL: process.env.E2E_STRAPI_URL || 'http://localhost:3457',
      NUXT_PUBLIC_CMS_URL: process.env.E2E_STRAPI_URL || 'http://localhost:3457',
      NUXT_STRAPI_API_TOKEN: 'test-token',
    },
  },

  // Output directory for test artifacts
  outputDir: 'test-results',
})
