# Contributing to E2E Tests

This guide helps you write effective E2E tests for the Nuxt 3 frontend.

## Quick Checklist

When adding new E2E tests:

- [ ] Add `data-test` attributes to components
- [ ] Create or update fixtures for mock API responses
- [ ] Write tests using stable selectors
- [ ] Include accessibility checks
- [ ] Add performance assertions for critical paths
- [ ] Test keyboard navigation
- [ ] Handle loading states properly
- [ ] Clean up test state (localStorage, etc.)
- [ ] Document any special setup needed

## Adding Data-Test Attributes

Always use `data-test` attributes for stable, semantic selectors:

### Good Examples

```vue
<!-- Component.vue -->
<template>
  <button data-test="submit-button" @click="submit">Submit</button>

  <div data-test="lesson-content">
    <h1 data-test="lesson-title">{{ title }}</h1>
    <div data-test="lesson-body" v-html="content" />
  </div>

  <nav data-test="lesson-navigation">
    <a
      v-for="lesson in lessons"
      :key="lesson.id"
      :data-test="`lesson-link-${lesson.id}`"
      :href="lesson.path"
    >
      {{ lesson.title }}
    </a>
  </nav>
</template>
```

### Bad Examples

```vue
<!-- DON'T use CSS classes for testing -->
<button class="btn-primary">Submit</button>

<!-- DON'T use generic text matching -->
<button>Click here</button>

<!-- DON'T rely on DOM structure -->
<div>
  <div>
    <button>Target</button>
  </div>
</div>
```

## Writing Tests

### Basic Structure

```typescript
import { test, expect } from '@playwright/test'
import { runAxeCheck } from '../helpers/accessibility'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to page
    await page.goto('/feature')
    await page.waitForLoadState('networkidle')
  })

  test('should do something', async ({ page }) => {
    // Arrange: setup test data
    const button = page.locator('[data-test="submit-button"]')

    // Act: perform action
    await button.click()

    // Assert: verify result
    const result = page.locator('[data-test="result"]')
    await expect(result).toHaveText('Success')
  })

  test('should pass accessibility checks', async ({ page }) => {
    const results = await runAxeCheck(page)
    expect(results.violations.length).toBe(0)
  })
})
```

### Using Helpers

#### Accessibility

```typescript
import { runAxeCheck, formatAxeViolations, testKeyboardNavigation } from '../helpers/accessibility'

// Run axe scan
const results = await runAxeCheck(page)
if (results.violations.length > 0) {
  console.log(formatAxeViolations(results.violations))
}
expect(results.violations.length).toBe(0)

// Test keyboard navigation
const focusInfo = await testKeyboardNavigation(page)
expect(focusInfo).toBeTruthy()
```

#### Performance

```typescript
import {
  capturePerformanceMetrics,
  DESKTOP_THRESHOLDS,
  formatPerformanceMetrics,
} from '../helpers/performance'

const metrics = await capturePerformanceMetrics(page)
console.log(formatPerformanceMetrics(metrics))

expect(metrics.ttfb).toBeLessThan(DESKTOP_THRESHOLDS.ttfb!)
```

#### Storage

```typescript
import { setLessonProgress, getLessonProgress, clearAllStorage } from '../helpers/storage'

// Set progress
await setLessonProgress(page, 'lesson-1', true)

// Get progress
const progress = await getLessonProgress(page, 'lesson-1')
expect(progress?.completed).toBe(true)

// Clear all
await clearAllStorage(page)
```

## Adding Fixtures

### 1. Create Fixture File

```typescript
// tests/e2e/fixtures/my-feature.ts
export const myFeatureFixture = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Example',
        description: 'Example description',
        // ... other fields
      },
    },
  ],
  meta: {
    pagination: {
      total: 1,
    },
  },
}
```

### 2. Update Mock Server

```typescript
// tests/e2e/mocks/strapi-mock-server.ts
import { myFeatureFixture } from '../fixtures/my-feature'

// In createRouter():
router.get(
  '/api/my-feature',
  eventHandler(() => myFeatureFixture)
)
```

### 3. Use in Tests

```typescript
test('should load my feature data', async ({ page }) => {
  await page.goto('/my-feature')

  // Data will be loaded from fixture
  const items = page.locator('[data-test="feature-item"]')
  expect(await items.count()).toBe(1)
})
```

## Testing Patterns

### Testing Forms

```typescript
test('should submit form', async ({ page }) => {
  // Fill inputs
  await page.fill('[data-test="name-input"]', 'John Doe')
  await page.fill('[data-test="email-input"]', 'john@example.com')

  // Submit
  await page.click('[data-test="submit-button"]')

  // Verify success
  await expect(page.locator('[data-test="success-message"]')).toBeVisible()
})
```

### Testing Modals/Dialogs

```typescript
test('should open and close modal', async ({ page }) => {
  // Open modal
  await page.click('[data-test="open-modal"]')

  const modal = page.locator('[data-test="modal"]')
  await expect(modal).toBeVisible()

  // Close with button
  await page.click('[data-test="close-modal"]')
  await expect(modal).not.toBeVisible()

  // Test Escape key
  await page.click('[data-test="open-modal"]')
  await page.keyboard.press('Escape')
  await expect(modal).not.toBeVisible()
})
```

### Testing Search/Filter

```typescript
test('should filter results', async ({ page }) => {
  // Initial state
  const items = page.locator('[data-test="item"]')
  const initialCount = await items.count()

  // Apply filter
  await page.selectOption('[data-test="filter-select"]', 'category-1')
  await page.waitForTimeout(500) // Wait for filter to apply

  // Verify filtered results
  const filteredCount = await items.count()
  expect(filteredCount).toBeLessThan(initialCount)
})
```

### Testing Downloads

```typescript
test('should download file', async ({ page }) => {
  // Start waiting for download before clicking
  const downloadPromise = page.waitForEvent('download')

  await page.click('[data-test="download-button"]')

  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('.pdf')
})
```

### Testing Navigation

```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/')

  // Navigate to page
  await page.click('[data-test="nav-link-about"]')
  await page.waitForURL('**/about')

  // Verify navigation
  expect(page.url()).toContain('/about')
  await expect(page.locator('[data-test="page-title"]')).toHaveText('About')
})
```

## Best Practices

### ✅ Do

- Use `data-test` attributes for all interactive elements
- Wait for network idle after navigation
- Clear storage before tests that need clean state
- Test both success and error states
- Include accessibility checks in every spec
- Test keyboard navigation for interactive features
- Use meaningful test descriptions
- Group related tests with `describe` blocks

### ❌ Don't

- Don't use CSS classes or IDs for selectors
- Don't use hardcoded delays (`waitForTimeout`) unless necessary
- Don't rely on text content that might change
- Don't skip error handling tests
- Don't ignore accessibility violations
- Don't test implementation details
- Don't make tests depend on each other

## Debugging

### View Test in Browser

```bash
pnpm test:e2e:ui
```

### Debug Specific Test

```bash
pnpm test:e2e:debug tests/e2e/specs/my-test.spec.ts
```

### View Trace

After failure, traces are saved in `test-results/`:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

### Console Logs

```typescript
test('debug test', async ({ page }) => {
  page.on('console', (msg) => console.log('Browser:', msg.text()))

  // Your test code
})
```

## Common Issues

### Test Timeout

If tests timeout, increase timeout in test or config:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ...
})
```

### Element Not Found

Ensure element exists and use proper waits:

```typescript
// Wait for element to appear
await page.waitForSelector('[data-test="element"]', { state: 'visible' })

// Check if element exists
const exists = (await page.locator('[data-test="element"]').count()) > 0
if (exists) {
  // ...
}
```

### Flaky Tests

- Add proper waits for dynamic content
- Clear state between tests
- Don't rely on timing-sensitive assertions
- Use `waitForLoadState('networkidle')` after navigation

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging](https://playwright.dev/docs/debug)
