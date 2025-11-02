# Test Coverage Documentation

This document describes the test coverage setup for the frontend application.

## Overview

We use Vitest with @vitest/coverage-v8 for test coverage reporting. The project aims for **70%+ coverage** across all code metrics.

## Running Tests

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:unit

# Run tests with coverage
pnpm test:coverage

# Run tests with coverage and UI
pnpm test:coverage:ui
```

### Coverage Reports

Coverage reports are generated in multiple formats:

- **HTML**: `coverage/index.html` - Open in browser for detailed view
- **LCOV**: `coverage/lcov.info` - For CI/CD integration
- **JSON**: `coverage/coverage-final.json` - Machine-readable format
- **Text**: Printed to console after test run

## Coverage Thresholds

The following thresholds are enforced (configured in `vitest.config.ts`):

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 70%       |
| Functions  | 70%       |
| Branches   | 70%       |
| Statements | 70%       |

Tests will fail if coverage falls below these thresholds.

## What's Covered

The coverage includes:

- ✅ Composables (`composables/**/*.ts`)
- ✅ Stores (`stores/**/*.ts`)
- ✅ Utils (`utils/**/*.ts`)
- ✅ Components (`components/**/*.vue`)

Excluded from coverage:

- ❌ Tests (`tests/**`)
- ❌ Configuration files (`**/*.config.ts`)
- ❌ Type definitions (`**/*.d.ts`, `types/**`)
- ❌ Generated files (`.nuxt/**`, `node_modules/**`)

## Test Organization

```
tests/
├── composables/          # Composable tests
│   ├── useKnowledgeCards.spec.ts
│   ├── useLessons.spec.ts
│   ├── useErrorHandling.spec.ts
│   └── ...
├── stores/               # Pinia store tests
│   ├── search.spec.ts
│   └── ...
├── components/           # Component tests
│   ├── ProgressTracker.spec.ts
│   └── ...
├── unit/                 # Utility function tests
│   ├── navigation-utils.test.ts
│   ├── api-client.test.ts
│   └── ...
├── fixtures/             # Mock data for tests
└── stubs/                # Mock implementations
```

## Writing Tests

### Composable Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { useMyComposable } from '~/composables/useMyComposable'

// Mock dependencies
vi.mock('~/utils/data-layer', () => ({
  fetchData: vi.fn(),
}))

describe('useMyComposable', () => {
  it('should do something', () => {
    const { data } = useMyComposable()
    expect(data.value).toBeDefined()
  })
})
```

### Store Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMyStore } from '~/stores/myStore'

describe('useMyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update state', () => {
    const store = useMyStore()
    store.updateValue('new value')
    expect(store.value).toBe('new value')
  })
})
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [createPinia()],
      },
    })
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

## CI/CD Integration

Coverage is automatically checked in CI/CD pipeline:

1. Tests run with coverage on every PR and push
2. Coverage report uploaded to Codecov
3. Coverage summary commented on PRs
4. Build fails if coverage < 70%

## Viewing Coverage Reports

### Locally

```bash
pnpm test:coverage
# Open coverage/index.html in your browser
```

### In CI

- Check the PR comment for coverage summary
- Download coverage artifacts from GitHub Actions
- View detailed report in Codecov (if configured)

## Tips for Improving Coverage

1. **Focus on critical paths**: Prioritize testing business logic
2. **Test edge cases**: Include error scenarios and boundary conditions
3. **Mock external dependencies**: Use `vi.mock()` to isolate code
4. **Test user interactions**: In components, test clicks, inputs, etc.
5. **Keep tests simple**: One test should verify one behavior

## Common Issues

### Coverage not updating

- Run `pnpm clean` and reinstall dependencies
- Ensure `nuxt prepare` has been run

### Tests passing locally but failing in CI

- Check Node.js version matches between local and CI
- Ensure all dependencies are in `package.json`
- Clear test cache: `rm -rf node_modules/.vitest`

### Coverage threshold failures

- Run `pnpm test:coverage` to see which files need more tests
- Focus on files with lowest coverage first
- Consider if some code should be excluded (e.g., dev-only code)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Coverage Documentation](https://vitest.dev/guide/coverage.html)
