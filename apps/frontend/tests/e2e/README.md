# E2E Tests

This directory contains the Playwright-based end-to-end test suite for the Nuxt 3 frontend.

## Quick Start

```bash
# Install dependencies and browsers
pnpm install
npx playwright install --with-deps

# Run all tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e --project=chromium
```

## Directory Structure

```
tests/e2e/
├── fixtures/              # Mock API response data
├── helpers/               # Reusable test utilities
├── mocks/                 # Mock Strapi server
├── specs/                 # Test specifications
├── global-setup.ts        # Test environment setup
├── global-teardown.ts     # Test environment cleanup
└── README.md             # This file
```

## Key Files

- **playwright.config.ts** - Main Playwright configuration
- **.env.e2e** - Environment variables for E2E tests
- **global-setup.ts** - Starts mock Strapi server before tests
- **mocks/strapi-mock-server.ts** - Mock backend implementation

## Writing Tests

1. Create new spec in `specs/` directory
2. Use helpers from `helpers/` for common operations
3. Add fixtures in `fixtures/` for new API endpoints
4. Use data-test attributes for stable selectors

## Mock Server

The mock Strapi server runs on `http://localhost:3457` and provides fixture-based responses.

To add a new endpoint:
1. Create fixture in `fixtures/`
2. Add route handler in `mocks/strapi-mock-server.ts`
3. Export fixture
4. Write tests

## Helpers

### Accessibility

```typescript
import { runAxeCheck } from '../helpers/accessibility'

const results = await runAxeCheck(page)
expect(results.violations.length).toBe(0)
```

### Performance

```typescript
import { capturePerformanceMetrics } from '../helpers/performance'

const metrics = await capturePerformanceMetrics(page)
console.log(metrics)
```

### Storage

```typescript
import { setLessonProgress, getLessonProgress } from '../helpers/storage'

await setLessonProgress(page, 'lesson-1', true)
const progress = await getLessonProgress(page, 'lesson-1')
```

## Documentation

See [/docs/TESTING.md](/docs/TESTING.md) for comprehensive testing documentation.
