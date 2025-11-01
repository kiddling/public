# Performance Testing

This directory contains configuration and artifacts for performance testing with Lighthouse CI.

## Configuration Files

- `lighthouse.config.ts` - Performance budgets and test route definitions
- `../.lighthouserc.json` - Lighthouse CI configuration

## Running Lighthouse CI

### Prerequisites

Before running Lighthouse CI, ensure you have:

1. Built the application: `pnpm build`
2. The production build available for preview

### Local Testing

Run Lighthouse CI locally:

```bash
pnpm lighthouse:ci
```

This will:
1. Start a preview server
2. Run Lighthouse audits against key routes
3. Assert performance budgets
4. Generate reports

### CI/CD Integration

In CI pipelines, run:

```bash
pnpm --filter frontend lighthouse:ci
```

## Performance Budgets

Current performance budgets:

### Category Scores
- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥95

### Core Metrics
- **Time to Interactive (TTI)**: <3.5s
- **First Contentful Paint (FCP)**: <2s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Total Blocking Time (TBT)**: <200ms
- **Cumulative Layout Shift (CLS)**: <0.1
- **Speed Index**: <3s

## Test Routes

Lighthouse runs against these key routes:
- Home page (`/`)
- Lesson detail page (`/lessons/example-lesson`)
- Knowledge card page (`/knowledge-cards/example-card`)

## Interpreting Results

### Success
If all assertions pass, your performance meets the defined budgets.

### Failures
If assertions fail:
1. Review the generated HTML reports
2. Identify failing metrics
3. Use the Web Vitals plugin data to investigate issues
4. Optimize code/assets as needed
5. Re-run tests

## Artifacts

Lighthouse generates reports in `.lighthouseci/` directory (gitignored):
- JSON reports for each run
- HTML reports for visual analysis
- Manifest files for CI integration
