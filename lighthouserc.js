/**
 * Lighthouse CI Configuration
 * 
 * Audits key pages for both desktop and mobile with performance budgets:
 * - Home page
 * - Lesson detail
 * - Resources
 * - Students dashboard
 * - Design log
 * 
 * Target: ≥90 scores for performance, accessibility, best-practices, and SEO
 */

const desktopConfig = {
  preset: 'desktop',
  throttlingMethod: 'simulate',
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
};

const mobileConfig = {
  preset: 'mobile',
  throttlingMethod: 'simulate',
  screenEmulation: {
    mobile: true,
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    disabled: false,
  },
  // Mobile-specific throttling (4G)
  throttling: {
    rttMs: 150,
    throughputKbps: 1600,
    cpuSlowdownMultiplier: 4,
  },
};

// Key URLs to audit (representative pages)
const urls = [
  'http://localhost:3000/', // Home
  'http://localhost:3000/lessons/1', // Lesson detail (example)
  'http://localhost:3000/resources', // Resources
  'http://localhost:3000/students', // Students dashboard
  'http://localhost:3000/design-log', // Design log
];

module.exports = {
  ci: {
    collect: [
      // Desktop run
      {
        startServerCommand:
          'pnpm build:frontend && cd apps/frontend/.output/public && npx http-server -p 3000',
        startServerReadyPattern: 'Available on',
        url: urls,
        numberOfRuns: 3,
        settings: desktopConfig,
      },
      // Mobile run
      {
        startServerCommand:
          'cd apps/frontend/.output/public && npx http-server -p 3000',
        startServerReadyPattern: 'Available on',
        url: urls,
        numberOfRuns: 2, // Fewer runs for mobile to save time
        settings: mobileConfig,
      },
    ],
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Core Web Vitals thresholds
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Performance budgets (desktop)
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Additional metrics
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'max-potential-fid': ['warn', { maxNumericValue: 200 }],

        // Best practices
        'uses-http2': 'warn',
        'uses-long-cache-ttl': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'html-has-lang': 'error',

        // SEO
        'meta-description': 'error',
        'document-title': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
