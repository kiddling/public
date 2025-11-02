# Lighthouse CI Configuration Guide

## Overview

Lighthouse CI provides automated performance, accessibility, SEO, and best practices auditing for the application. This document describes the configuration, usage, and interpretation of Lighthouse CI results.

## Configuration

### Configuration File

The Lighthouse CI configuration is defined in `.lighthouserc.json` at the project root.

### Tested Routes

Lighthouse CI audits the following critical routes:

- **Home** (`/`) - Main landing page
- **Students** (`/students`) - Student works gallery
- **Design Log** (`/design-log`) - Design journal system
- **Downloads** (`/downloads`) - Download center

These routes represent key user journeys and content types in the application.

### Performance Budgets

The following budgets are enforced as **error-level assertions** (builds will fail if not met):

#### Core Metrics
- **Performance Score**: ≥ 90
- **SEO Score**: ≥ 95
- **Accessibility Score**: ≥ 95
- **Best Practices Score**: ≥ 90

#### Resource Budgets
- **JavaScript Size**: ≤ 200KB (204,800 bytes)
- **CSS Size**: ≤ 100KB (102,400 bytes)
- **Total Resource Size**: ≤ 1MB (1,048,576 bytes)

#### Core Web Vitals (Warning Level)
- **First Contentful Paint (FCP)**: ≤ 1.5s
- **Largest Contentful Paint (LCP)**: ≤ 2.5s
- **Cumulative Layout Shift (CLS)**: ≤ 0.1
- **Total Blocking Time (TBT)**: ≤ 200ms
- **Speed Index**: ≤ 2.5s
- **Time to Interactive (TTI)**: ≤ 3.5s

## Running Lighthouse CI

### Local Execution

To run Lighthouse CI locally:

```bash
pnpm lighthouse
```

This command will:
1. Build the frontend application
2. Start a local HTTP server
3. Run Lighthouse audits on all configured URLs
4. Check assertions against budgets
5. Generate reports in `.lighthouseci` directory

### Prerequisites

- Frontend must build successfully
- Port 3000 must be available
- No other services running on port 3000

### Review Local Results

After running locally, reports are saved in `.lighthouseci` directory:

```bash
# View HTML reports
open .lighthouseci/*.html

# View JSON reports
cat .lighthouseci/*.json | jq
```

## CI/CD Integration

### Automated Execution

Lighthouse CI runs automatically in GitHub Actions:

- **Triggers**: Push to `main` or `develop`, Pull Requests
- **Timing**: After frontend build completes
- **Dependencies**: Requires successful frontend build

### Workflow Configuration

The CI workflow (`ci.yml`) includes:

1. **Artifact Reuse**: Downloads pre-built frontend from the build job
2. **Caching**: Uses pnpm cache for faster dependency installation
3. **Execution**: Runs `pnpm lighthouse` command
4. **Upload**: Saves reports as artifacts with descriptive names

### Artifact Naming Convention

Reports are uploaded with the following naming pattern:

```
lighthouse-results-{branch}-{run_number}-{commit_sha}
```

Examples:
- `lighthouse-results-main-123-a1b2c3d`
- `lighthouse-results-develop-456-e4f5g6h`
- `lighthouse-results-feature-new-ui-789-i7j8k9l`

This naming provides:
- **Branch identification**: Know which branch was tested
- **Run tracking**: Sequential run numbers for comparison
- **Commit linkage**: Direct correlation to specific commits

## Interpreting Results

### Score Ranges

Lighthouse uses a 0-100 scoring system:

- **90-100** (Green): ✅ Good - Meets quality standards
- **50-89** (Orange): ⚠️ Needs Improvement - Should be addressed
- **0-49** (Red): ❌ Poor - Requires immediate attention

### Understanding Failures

#### Budget Failure

If a budget fails, the CI build will fail with error messages:

```
Error: Assertion failed
  categories:performance - Expected >= 0.9, got 0.87
```

**Action**: Review the specific metric and implement optimizations.

#### Resource Size Failure

```
Error: Assertion failed
  resource-summary:script:size - Expected <= 204800, got 250000
```

**Action**: 
1. Run bundle analysis: `pnpm bundle:check`
2. Identify large dependencies
3. Consider code splitting or lazy loading

### Key Metrics Explained

#### Performance Score Components

1. **First Contentful Paint (FCP)**: Time until first text/image appears
   - Target: ≤ 1.5s
   - Improve by: Reducing blocking resources, optimizing fonts

2. **Largest Contentful Paint (LCP)**: Time until largest content element is visible
   - Target: ≤ 2.5s
   - Improve by: Optimizing images, preloading critical resources

3. **Cumulative Layout Shift (CLS)**: Visual stability score
   - Target: ≤ 0.1
   - Improve by: Setting image dimensions, avoiding layout shifts

4. **Total Blocking Time (TBT)**: Sum of all time periods between FCP and TTI
   - Target: ≤ 200ms
   - Improve by: Reducing JavaScript execution time

#### SEO Score Components

- Meta tags (title, description)
- Semantic HTML
- Image alt attributes
- Valid structured data
- Mobile-friendly viewport
- HTTPS usage

#### Accessibility Score Components

- ARIA attributes
- Color contrast
- Keyboard navigation
- Screen reader support
- Form labels
- Alt text on images

## Best Practices

### Before Merging

1. **Run locally**: Always run `pnpm lighthouse` before pushing
2. **Fix errors**: Address any budget violations
3. **Review warnings**: Consider improving warning-level metrics
4. **Check reports**: Review HTML reports for specific recommendations

### Regular Audits

- **Weekly**: Check trending metrics over time
- **Per release**: Compare reports between releases
- **After major changes**: Run Lighthouse when adding large features

### Continuous Improvement

1. **Baseline**: Establish current scores as baseline
2. **Set goals**: Aim for incremental improvements
3. **Monitor**: Track changes in CI artifacts
4. **Iterate**: Implement optimizations based on recommendations

## Troubleshooting

### Common Issues

#### Server Timeout

```
Error: startServerReadyPattern not found
```

**Solution**: 
- Check port 3000 is available
- Verify build completes successfully
- Check server logs in CI output

#### Flaky Results

Lighthouse scores can vary slightly between runs.

**Solution**:
- Configuration runs each test 3 times and takes median
- If consistent failures occur, investigate the specific metric
- Consider network conditions in CI environment

#### Memory Issues

Large applications may cause memory issues during audit.

**Solution**:
- Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096`
- Reduce number of URLs tested
- Test routes separately

## Command Reference

```bash
# Run Lighthouse CI locally
pnpm lighthouse

# Run with debug output
DEBUG=lhci:* pnpm lighthouse

# Run on specific URL (requires modification)
pnpm dlx @lhci/cli autorun --config=.lighthouserc.json

# View configuration
cat .lighthouserc.json

# Clean up old reports
rm -rf .lighthouseci
```

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Optimization Guide](../apps/frontend/docs/PERFORMANCE.md)
- [Monitoring Documentation](./MONITORING.md)

## Changelog

### 2024-11-02
- ✅ Migrated from `lighthouserc.js` to `.lighthouserc.json`
- ✅ Updated budgets: Performance ≥90, SEO ≥95
- ✅ Added multiple critical route testing
- ✅ Improved CI artifact naming with branch/commit info
- ✅ Updated to use `pnpm dlx` to avoid global npm installs
- ✅ Enhanced documentation with interpretation guide
