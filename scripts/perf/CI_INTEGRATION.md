# CI/CD Integration Guide for Bundle Budget

This guide shows how to integrate the bundle budget checker into various CI/CD systems.

## GitHub Actions

### Basic Integration

Add to `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build Frontend
        run: pnpm build:frontend
        
      - name: Check Bundle Budget
        run: pnpm bundle:check
        
      - name: Upload Bundle Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: bundle-budget-report
          path: apps/frontend/.output/bundle-budget-report.json
```

### With Margin for PRs

Allow a margin for pull requests while being strict on main:

```yaml
- name: Check Bundle Budget
  run: |
    if [ "${{ github.event_name }}" == "pull_request" ]; then
      BUDGET_MARGIN=10 pnpm bundle:check
    else
      pnpm bundle:check
    fi
```

### With Comments on PRs

Add bundle size information to PR comments:

```yaml
- name: Check Bundle Budget
  id: budget
  run: pnpm bundle:check || true
  
- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const fs = require('fs');
      const report = JSON.parse(
        fs.readFileSync('apps/frontend/.output/bundle-budget-report.json', 'utf8')
      );
      
      const { summary, results } = report;
      const status = summary.hasViolations ? '❌' : '✅';
      
      let comment = `## ${status} Bundle Budget Report\n\n`;
      comment += `**Total JS**: ${(summary.totalJSSize / 1024).toFixed(2)} KB (gzipped)\n`;
      comment += `**Total CSS**: ${(summary.totalCSSSize / 1024).toFixed(2)} KB\n\n`;
      comment += `### Budget Results\n\n`;
      
      results.forEach(r => {
        const icon = r.passed ? '✅' : '❌';
        comment += `${icon} **${r.name}**: ${r.actual.toFixed(2)} KB / ${r.limit} KB (${r.percentage.toFixed(1)}%)\n`;
      });
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

## GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - test
  - validate

build:frontend:
  stage: build
  image: node:20
  before_script:
    - npm install -g pnpm@8
    - pnpm install
  script:
    - pnpm build:frontend
  artifacts:
    paths:
      - apps/frontend/.output/
    expire_in: 1 hour

validate:budget:
  stage: validate
  image: node:20
  dependencies:
    - build:frontend
  script:
    - pnpm bundle:check
  artifacts:
    when: always
    reports:
      metrics: apps/frontend/.output/bundle-budget-report.json
```

## Jenkins

Add to `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'pnpm install'
            }
        }
        
        stage('Build') {
            steps {
                sh 'pnpm build:frontend'
            }
        }
        
        stage('Check Bundle Budget') {
            steps {
                script {
                    def budgetCheck = sh(
                        script: 'pnpm bundle:check',
                        returnStatus: true
                    )
                    
                    if (budgetCheck != 0) {
                        currentBuild.result = 'FAILURE'
                        error('Bundle budget exceeded!')
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'apps/frontend/.output/bundle-budget-report.json'
                }
            }
        }
    }
}
```

## CircleCI

Add to `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  build-and-validate:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - v1-deps-{{ checksum "pnpm-lock.yaml" }}
            
      - run:
          name: Install pnpm
          command: npm install -g pnpm@8
          
      - run:
          name: Install dependencies
          command: pnpm install
          
      - save_cache:
          key: v1-deps-{{ checksum "pnpm-lock.yaml" }}
          paths:
            - node_modules
            
      - run:
          name: Build Frontend
          command: pnpm build:frontend
          
      - run:
          name: Check Bundle Budget
          command: pnpm bundle:check
          
      - store_artifacts:
          path: apps/frontend/.output/bundle-budget-report.json

workflows:
  version: 2
  build-deploy:
    jobs:
      - build-and-validate
```

## Custom Scripts

### Pre-commit Hook

Add to `.husky/pre-commit` or `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Only check bundle if there are changes to frontend
if git diff --cached --name-only | grep -q "^apps/frontend/"; then
  echo "Frontend changes detected, checking bundle budget..."
  
  # Build
  pnpm build:frontend
  
  # Check budget with margin
  BUDGET_MARGIN=5 pnpm bundle:check
  
  if [ $? -ne 0 ]; then
    echo "Bundle budget check failed. Commit rejected."
    exit 1
  fi
fi
```

### Pre-push Hook

Add to `.husky/pre-push` or `.git/hooks/pre-push`:

```bash
#!/bin/sh

echo "Running bundle budget check before push..."

pnpm build:frontend
pnpm bundle:check

if [ $? -ne 0 ]; then
  echo "Bundle budget exceeded. Push rejected."
  echo "Run 'pnpm bundle:check' to see details."
  exit 1
fi
```

## Environment-Specific Configuration

### Development

```bash
# Allow larger margins in development
BUDGET_MARGIN=20 STRICT_MODE=false pnpm bundle:check
```

### Staging

```bash
# Moderate restrictions for staging
BUDGET_MARGIN=10 pnpm bundle:check
```

### Production

```bash
# Strict enforcement for production
BUDGET_MARGIN=0 STRICT_MODE=true pnpm bundle:check
```

## Monitoring and Alerting

### Store Historical Data

```bash
# Append to historical log
cat apps/frontend/.output/bundle-budget-report.json >> bundle-history.jsonl

# Track trends over time
node scripts/analyze-bundle-trends.js
```

### Slack Notifications

```yaml
# GitHub Actions example
- name: Notify Slack on Budget Violation
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      Bundle budget check failed!
      View report: ${{ steps.budget.outputs.report-url }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Run on Every Build**: Ensure budget checks run on all builds
2. **Fail Fast**: Make budget violations block merges
3. **Track Trends**: Monitor bundle size over time
4. **Set Realistic Budgets**: Based on real user constraints
5. **Review Regularly**: Adjust budgets as needed
6. **Document Changes**: Note why budgets change

## Troubleshooting

### Build Fails on CI but Passes Locally

- Ensure same Node.js version
- Check environment variables
- Verify build directory path

### Inconsistent Results

- Clear build cache: `rm -rf apps/frontend/.output`
- Ensure deterministic builds
- Check for dynamic imports

### Budget Too Strict

- Gradually increase budgets
- Use `BUDGET_MARGIN` temporarily
- Optimize code before adjusting limits

## Further Reading

- [Bundle Budget Script Documentation](./README.md)
- [Performance Optimization Guide](../../apps/frontend/PERFORMANCE_OPTIMIZATION.md)
- [Web Performance Budgets](https://web.dev/performance-budgets-101/)
