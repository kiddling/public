# CI Integration for Lighthouse

This document provides guidance for integrating Lighthouse CI into your CI/CD pipeline.

## GitHub Actions Example

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'apps/frontend/**'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build frontend
        run: pnpm --filter frontend build
      
      - name: Run Lighthouse CI
        run: pnpm --filter frontend lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Upload Lighthouse reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-reports
          path: apps/frontend/.lighthouseci
          retention-days: 30
```

## GitLab CI Example

Add to `.gitlab-ci.yml`:

```yaml
lighthouse:
  stage: test
  image: node:20
  only:
    changes:
      - apps/frontend/**
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm --filter frontend build
    - pnpm --filter frontend lighthouse:ci
  artifacts:
    paths:
      - apps/frontend/.lighthouseci/
    expire_in: 30 days
    when: always
```

## Configuration Options

### Temporary Public Storage

The default configuration uploads results to temporary public storage:

```json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

This creates a public URL that expires after 7 days. Perfect for PR reviews.

### Lighthouse Server

For persistent storage, set up a Lighthouse CI server:

```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://your-lhci-server.com",
      "token": "your-build-token"
    }
  }
}
```

### Filesystem

For local or CI artifact storage:

```json
{
  "ci": {
    "upload": {
      "target": "filesystem",
      "outputDir": "./lighthouse-reports"
    }
  }
}
```

## Assertion Strategies

### Fail on Budget Violations

Current configuration (strict):

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Warn Instead of Fail

For gradual adoption:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

### Custom Budgets per Route

Advanced configuration:

```json
{
  "ci": {
    "collect": {
      "url": [
        {
          "url": "http://localhost:3000/",
          "assertions": {
            "categories:performance": ["error", {"minScore": 0.95}]
          }
        },
        {
          "url": "http://localhost:3000/lessons/example",
          "assertions": {
            "categories:performance": ["error", {"minScore": 0.85}]
          }
        }
      ]
    }
  }
}
```

## Best Practices

### 1. Run on Representative Routes

Test the most critical user journeys:
- Home page (first impression)
- Most visited content pages
- Key conversion pages

### 2. Use Stable Test Data

Ensure test content is:
- Consistent across runs
- Representative of production
- Includes realistic images/assets

### 3. Multiple Runs

Always run multiple times (3-5) to account for variability:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    }
  }
}
```

### 4. Desktop vs Mobile

Test both when relevant:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "desktop"  // or "mobile"
      }
    }
  }
}
```

### 5. Monitor Trends

Use Lighthouse CI server or store reports to track performance over time.

### 6. Set Realistic Budgets

Start with current performance and gradually improve:

```
Week 1: Performance ≥70
Week 4: Performance ≥80
Week 8: Performance ≥90
```

## Troubleshooting

### Build Timeout

Increase timeout in CI:

```json
{
  "ci": {
    "collect": {
      "startServerReadyTimeout": 60000
    }
  }
}
```

### Flaky Tests

Add warmup request:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 5,
      "settings": {
        "skipAudits": ["uses-http2"]
      }
    }
  }
}
```

### Memory Issues

Reduce concurrent runs:

```json
{
  "ci": {
    "collect": {
      "maxAutodiscoverUrls": 3
    }
  }
}
```

## Reporting

### PR Comments

Use Lighthouse Bot for GitHub:

```yaml
- name: Comment PR
  uses: treosh/lighthouse-ci-action@v9
  with:
    uploadArtifacts: true
    temporaryPublicStorage: true
```

### Slack Notifications

Add webhook to CI:

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Lighthouse CI: Performance score dropped to 85"}' \
  $SLACK_WEBHOOK_URL
```

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
