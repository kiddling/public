# Smoke Tests

Smoke tests are a subset of critical path tests that run during deployment to verify basic functionality. These tests are designed to be fast and focus on the most important features.

## Purpose

Smoke tests serve as a gate for deployments:
- Run automatically during blue/green deployments
- Block traffic cutover if critical paths fail
- Trigger automatic rollback on failure
- Provide quick feedback on deployment health

## Test Categories

### Critical Path Tests (Must Pass)
- Homepage loads
- API health endpoints respond
- User authentication works
- Database connectivity
- CMS admin accessible

### Extended Tests (Warnings if Fail)
- Search functionality
- Media uploads
- Third-party integrations
- Caching layers

## Running Smoke Tests

### Locally
```bash
# Run all smoke tests
npx playwright test --grep="smoke"

# Run with specific base URL
PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test tests/smoke/

# Run against specific deployment color
CMS_BASE_URL=http://localhost:1338 npx playwright test tests/smoke/
```

### During Deployment
Smoke tests run automatically as part of the deployment process via `post-deploy-verify.sh`.

### In CI/CD
The GitHub Actions workflow runs smoke tests after deployment and triggers rollback on failure.

## Configuration

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.ts/,
      timeout: 30000,
      retries: 2,
    },
  ],
});
```

### Environment Variables
- `PLAYWRIGHT_BASE_URL` - Frontend URL (default: http://localhost:3000)
- `CMS_BASE_URL` - CMS URL (default: http://localhost:1337)

## Writing Smoke Tests

### Guidelines

1. **Keep it Fast:** Smoke tests should complete in < 2 minutes total
2. **Test Critical Paths:** Focus on functionality that would break the entire site
3. **Be Reliable:** Tests should not be flaky
4. **No External Dependencies:** Mock or skip tests that depend on external services
5. **Clear Assertions:** Make it obvious what failed

### Template
```typescript
/**
 * Smoke Test: [Feature Name]
 * 
 * Description of what this test verifies.
 */

import { test, expect } from '@playwright/test';

test.describe('[Feature] Smoke Tests', () => {
  test('critical functionality works', async ({ page }) => {
    // Test implementation
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Naming Convention
- File: `[feature].smoke.spec.ts`
- Test: Descriptive name of what is being tested
- Tags: Use `@smoke` tag if using tag-based filtering

## Current Tests

### homepage.smoke.spec.ts
Tests basic homepage functionality:
- Page loads successfully
- Title is correct
- Navigation is functional
- Response time is acceptable
- No critical console errors

### api.smoke.spec.ts
Tests API endpoint availability:
- Frontend health endpoint
- CMS health endpoint
- API accessibility
- Response time

### security.smoke.spec.ts
Tests security configuration:
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting enforcement
- HTTPS redirection
- CORS policies
- Cookie security
- CSP validation

## Extending Smoke Tests

To add new smoke tests:

1. Create a new file in `tests/smoke/` with `.smoke.spec.ts` extension
2. Follow the template above
3. Focus on critical paths only
4. Keep tests fast and reliable
5. Update this README with test description

## Integration with Deployment

### Deployment Flow
```
Preflight Checks
      ↓
Deploy to Idle Stack
      ↓
Health Checks
      ↓
[Smoke Tests] ← You are here
      ↓
Traffic Cutover (if tests pass)
      ↓
Post-Cutover Monitoring
```

### Failure Handling
If smoke tests fail:
1. Deployment is marked as failed
2. Automatic rollback is triggered
3. Traffic remains on previous stack
4. Logs are collected for debugging
5. Team is notified

## Troubleshooting

### Tests Timing Out
- Increase timeout in playwright.config.ts
- Check if application is responding
- Verify network connectivity

### Flaky Tests
- Add explicit waits for dynamic content
- Increase retries temporarily
- Investigate root cause of flakiness

### False Positives
- Review test assertions
- Check if test environment matches production
- Verify test data availability

## Best Practices

1. **Run Locally First:** Always run smoke tests locally before pushing
2. **Keep Tests Updated:** Update tests when features change
3. **Monitor Test Duration:** Keep total execution time under 2 minutes
4. **Review Failures:** Investigate all smoke test failures before deploying
5. **Document Changes:** Update this README when adding/modifying tests

## Related Documentation

- [DEPLOYMENT_STRATEGY.md](../../docs/DEPLOYMENT_STRATEGY.md) - Deployment strategy
- [scripts/deploy/README.md](../../scripts/deploy/README.md) - Deployment scripts
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) - CI/CD configuration
