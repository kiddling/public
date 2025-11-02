module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm build:frontend && cd apps/frontend/.output/public && npx http-server -p 3000',
      startServerReadyPattern: 'Available on',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 2500 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        // Bundle size budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 204800 }], // 200KB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 102400 }], // 100KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 1048576 }], // 1MB
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
