# Testing Guide

This document covers the testing strategy for the Nuxt 3 frontend application, including unit tests with Vitest and end-to-end (E2E) tests with Playwright.

## Table of Contents

- [Unit Testing](#unit-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests Locally](#running-tests-locally)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## Unit Testing

Unit tests are written using Vitest and Vue Test Utils, focusing on isolated component and function testing.

### Running Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:unit -- --watch

# Run tests with coverage
pnpm test:unit -- --coverage
```

### Unit Test Location

Unit tests are located in `/apps/frontend/tests/` with the following structure:

- Component tests: `*.spec.ts`
- Store tests: `*-store.spec.ts`
- Utility tests: `*-helper.spec.ts` or `*-util.spec.ts`

## E2E Testing

E2E tests use Playwright to test the complete application flow with mocked Strapi backend responses.

### Architecture

The E2E testing suite consists of:

1. **Mock Strapi Server**: A lightweight HTTP server that simulates Strapi API responses
2. **Fixtures**: JSON data representing API responses
3. **Test Specs**: Playwright tests for critical user journeys
4. **Helpers**: Reusable utilities for accessibility, performance, and storage testing

### Running E2E Tests Locally

#### Prerequisites

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Install Playwright browsers:
   ```bash
   cd apps/frontend
   npx playwright install --with-deps
   ```

#### Run Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
pnpm test:e2e --project=mobile-chrome

# Run in UI mode (interactive)
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e tests/e2e/specs/course-browsing.spec.ts
```

### E2E Test Structure

```
apps/frontend/tests/e2e/
├── fixtures/              # Mock API response data
│   ├── lessons.ts
│   ├── navigation.ts
│   ├── resources.ts
│   ├── student-works.ts
│   ├── design-log-templates.ts
│   └── knowledge-cards.ts
├── helpers/               # Reusable test utilities
│   ├── accessibility.ts   # Axe accessibility checks
│   ├── performance.ts     # Performance metrics
│   └── storage.ts         # localStorage helpers
├── mocks/                 # Mock server implementation
│   └── strapi-mock-server.ts
├── specs/                 # Test specifications
│   ├── course-browsing.spec.ts
│   ├── progress-tracking.spec.ts
│   ├── command-search.spec.ts
│   ├── student-gallery.spec.ts
│   ├── resource-download.spec.ts
│   └── design-log.spec.ts
├── global-setup.ts        # Start mock server
└── global-teardown.ts     # Stop mock server
```

### Mock Strapi Server

The mock server runs on port `3457` and provides fixture-based responses for all Strapi endpoints.

**Supported Endpoints:**

- `/api/lessons` - Course lessons
- `/api/navigation` - Navigation structure
- `/api/resources` - Downloadable resources
- `/api/student-works` - Student gallery
- `/api/design-log-templates` - Design log templates
- `/api/knowledge-cards` - Knowledge cards for search
- `/api/design-logs` (POST) - Save design logs
- `/api/upload` (POST) - File uploads

### Environment Variables

E2E tests use `.env.e2e` for configuration:

```env
# Nuxt dev server
NUXT_PORT=3456

# Mock Strapi server
E2E_STRAPI_URL=http://localhost:3457
E2E_STRAPI_PORT=3457

# Test environment
NODE_ENV=test
```

## Test Coverage

### Critical User Journeys Covered

1. **Course Browsing**
   - Navigation sidebar
   - Lesson content rendering
   - Breadcrumb navigation
   - Difficulty level switching
   - Markdown content display
   - Print controls
   - Accessibility compliance
   - Performance metrics

2. **Progress Tracking**
   - Mark lessons complete
   - Progress persistence (localStorage)
   - Progress UI updates
   - Spiral/progress visualization

3. **Command Search (Cmd+K)**
   - Keyboard shortcut activation
   - Chinese and English search
   - Result navigation
   - Keyboard navigation
   - Empty state handling

4. **Student Gallery**
   - Grid display
   - Filtering (grade, medium)
   - Lightbox modal
   - Before/after comparison
   - Keyboard navigation
   - Pagination

5. **Resource Download**
   - Resource browsing
   - Category filtering
   - Single file download
   - Batch download
   - Progress indicators
   - Download validation

6. **Design Log**
   - Form display and validation
   - Autosave functionality
   - Template selection
   - PDF export
   - Image upload
   - Data persistence

## Accessibility Testing

All E2E specs include accessibility checks using `@axe-core/playwright`:

```typescript
import { runAxeCheck, formatAxeViolations } from '../helpers/accessibility'

test('should pass accessibility checks', async ({ page }) => {
  const results = await runAxeCheck(page)
  expect(results.violations.length).toBe(0)
})
```

**Standards**: WCAG 2.1 Level AA

## Performance Testing

Performance metrics are captured in critical flows:

```typescript
import { capturePerformanceMetrics, DESKTOP_THRESHOLDS } from '../helpers/performance'

test('should meet performance thresholds', async ({ page }) => {
  const metrics = await capturePerformanceMetrics(page)
  expect(metrics.ttfb).toBeLessThan(DESKTOP_THRESHOLDS.ttfb!)
})
```

**Thresholds:**

- **Desktop**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - TTFB < 600ms

- **Mobile**:
  - LCP < 4s
  - FID < 100ms
  - CLS < 0.1
  - TTFB < 1s

## CI/CD Integration

E2E tests run automatically in GitHub Actions for all PRs and merges.

### Workflow

The `.github/workflows/ci.yml` includes an `e2e` job that:

1. Runs in parallel with other CI jobs
2. Tests across 4 browser projects (Chromium, Firefox, WebKit, Mobile Chrome)
3. Uploads test results, reports, and traces on failure
4. Gates merges on passing tests

### Viewing Results

After CI runs:

1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Download artifacts:
   - `playwright-results-{browser}` - Test results JSON
   - `playwright-report-{browser}` - HTML report
   - `playwright-traces-{browser}` - Debug traces (on failure)

## Writing New Tests

### Adding Test Specs

1. Create a new spec file in `tests/e2e/specs/`:

   ```typescript
   import { test, expect } from '@playwright/test'

   test.describe('Feature Name', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/')
     })

     test('should do something', async ({ page }) => {
       // Test implementation
     })
   })
   ```

2. Use data-test attributes for stable selectors:

   ```vue
   <button data-test="submit-button">Submit</button>
   ```

3. Include accessibility checks:
   ```typescript
   const results = await runAxeCheck(page)
   expect(results.violations.length).toBe(0)
   ```

### Updating Fixtures

1. Add or modify data in `tests/e2e/fixtures/`
2. Follow the Strapi response format:

   ```typescript
   export const myFixture = {
     data: [...],
     meta: { pagination: { total: 0 } }
   }
   ```

3. Update the mock server in `mocks/strapi-mock-server.ts` to serve the new fixture

### Best Practices

- **Stable Selectors**: Use `data-test` attributes instead of CSS classes
- **Wait for Stability**: Use `waitForLoadState('networkidle')` after navigation
- **Avoid Hardcoded Delays**: Use `waitForSelector` instead of `waitForTimeout` when possible
- **Test Resilience**: Handle both presence and absence of optional UI elements
- **Clean State**: Clear storage before tests that depend on clean state
- **Meaningful Assertions**: Assert on user-visible behavior, not implementation details

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 60 * 1000, // 60 seconds
  ```
- Check if mock server started successfully
- Verify network requests are reaching mock server

### Mock Server Not Starting

- Check port 3457 is available
- Review `global-setup.ts` logs
- Ensure h3 dependency is installed

### Playwright Browsers Not Installed

```bash
cd apps/frontend
npx playwright install --with-deps
```

### Tests Passing Locally but Failing in CI

- Check environment variables in CI
- Verify CI has required dependencies
- Review uploaded traces from CI artifacts

### Accessibility Violations

1. Review the violation details in test output
2. Check the `helpUrl` for guidance
3. Fix the issue in components
4. Rerun tests

### Performance Metrics Not Available

- Ensure page is fully loaded before capturing metrics
- Check browser console for JavaScript errors
- Verify web-vitals library is loaded

## Debugging Tests

### Interactive Mode

```bash
pnpm test:e2e:ui
```

Provides a UI to:

- See all tests
- Run individual tests
- View step-by-step execution
- Inspect DOM at each step

### Debug Mode

```bash
pnpm test:e2e:debug
```

Opens browser with Playwright Inspector for step-through debugging.

### View Traces

After a test failure:

```bash
npx playwright show-trace test-results/trace.zip
```

## Maintenance

### Regular Updates

- **Fixtures**: Update when Strapi schema changes
- **Selectors**: Update when UI components change
- **Thresholds**: Adjust performance thresholds based on actual metrics
- **Browsers**: Update Playwright regularly for latest browser support

### Adding New Endpoints

1. Add fixture in `tests/e2e/fixtures/`
2. Add route handler in `mocks/strapi-mock-server.ts`
3. Write tests that use the new endpoint
4. Update this documentation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
