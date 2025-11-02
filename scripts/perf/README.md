# Performance Scripts

This directory contains performance monitoring and validation scripts for the project.

## Scripts

### bundle-budget.mjs

Automated bundle size checker that enforces performance budgets for the frontend application.

#### Features

- 🔍 Analyzes all JavaScript and CSS files in build output
- 📊 Calculates gzipped sizes for accurate production estimates
- ✅ Validates against predefined budgets
- 📈 Generates detailed reports in JSON format
- 🚨 Fails CI/CD pipeline if budgets are exceeded
- 🎯 Supports custom budget margins for gradual optimization

#### Usage

```bash
# Build the frontend first
pnpm build:frontend

# Run budget check (strict mode)
pnpm bundle:check

# Run with 10% margin
pnpm bundle:check:margin

# Custom margin
BUDGET_MARGIN=15 pnpm bundle:check

# Non-strict mode (warnings only)
STRICT_MODE=false pnpm bundle:check
```

#### Budget Configuration

Current budgets (defined in `bundle-budget.mjs`):

| Asset Type      | Limit  | Description                                 |
| --------------- | ------ | ------------------------------------------- |
| Entry JS        | 200 KB | Initial JavaScript bundle (gzipped)         |
| Total JS        | 500 KB | All JavaScript combined (gzipped)           |
| Total CSS       | 100 KB | All CSS combined                            |
| Max Chunk       | 300 KB | Maximum size for any single chunk (gzipped) |
| vendor-vue      | 150 KB | Vue ecosystem chunk                         |
| vendor-utils    | 100 KB | Utility libraries chunk                     |
| vendor-jspdf    | 200 KB | jsPDF library chunk                         |
| vendor-qrcode   | 50 KB  | QRCode library chunk                        |
| vendor-markdown | 100 KB | Markdown renderer chunk                     |

#### Environment Variables

- `BUILD_DIR`: Path to build output directory (default: `apps/frontend/.output/public`)
- `STRICT_MODE`: Fail on budget violations (default: `true`)
- `BUDGET_MARGIN`: Allow percentage over budget (default: `0`, max: `20`)

#### Output

The script generates:

1. **Terminal Output**: Colored, formatted budget check results
2. **JSON Report**: Detailed report saved to `apps/frontend/.output/bundle-budget-report.json`

##### Example Terminal Output

```
======================================================================
📊 Bundle Budget Analysis
======================================================================

📈 Budget Results:

✓ Entry JS: 185.50 KB / 200 KB (92.8%)
  首屏 JavaScript
✓ Total JS: 420.30 KB / 500 KB (84.1%)
  所有 JavaScript
✓ Total CSS: 85.20 KB / 100 KB (85.2%)
  所有 CSS
✓ Vendor: vendor-vue: 142.10 KB / 150 KB (94.7%)
  Vendor chunk vendor-vue

📦 Top 10 Largest Files:

1. entry-abc123.js: 185.50 KB (gzipped)
2. vendor-vue-def456.js: 142.10 KB (gzipped)
3. vendor-jspdf-ghi789.js: 178.20 KB (gzipped)
...

======================================================================
📋 Summary
======================================================================
Total Files: 45
Total JS (gzipped): 420.30 KB
Total CSS: 85.20 KB
Budget Margin: 0%
Strict Mode: Enabled

✅ All budgets passed!
======================================================================

📄 Report saved to: apps/frontend/.output/bundle-budget-report.json
```

##### Example JSON Report

```json
{
  "timestamp": "2024-11-02T10:30:00.000Z",
  "config": {
    "buildDir": "apps/frontend/.output/public",
    "strictMode": true,
    "budgetMargin": 0
  },
  "results": [
    {
      "name": "Entry JS",
      "description": "首屏 JavaScript",
      "limit": 200,
      "actual": 185.5,
      "percentage": 92.75,
      "passed": true,
      "margin": 0
    }
  ],
  "files": [
    {
      "name": "entry-abc123.js",
      "size": 650000,
      "gzipSize": 189952,
      "type": "js"
    }
  ],
  "summary": {
    "totalFiles": 45,
    "totalJSSize": 430387,
    "totalCSSSize": 87244,
    "hasViolations": false
  }
}
```

#### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Build Frontend
  run: pnpm build:frontend

- name: Check Bundle Budget
  run: pnpm bundle:check
  # This step will fail if budgets are exceeded
```

Or with a margin for gradual improvement:

```yaml
- name: Check Bundle Budget (with margin)
  run: BUDGET_MARGIN=10 pnpm bundle:check
```

#### Adjusting Budgets

To modify budget limits, edit the `budgets` object in `bundle-budget.mjs`:

```javascript
const budgets = {
  entryJS: {
    limit: 250, // Increase to 250 KB
    description: '首屏 JavaScript',
  },
  // ... other budgets
}
```

#### Troubleshooting

**Issue**: Build directory not found

```bash
❌ Build directory not found: apps/frontend/.output/public
```

**Solution**: Run the build first

```bash
pnpm build:frontend
```

---

**Issue**: Budget violations

```bash
❌ Budget violations detected!
```

**Solution**:

1. Run `pnpm --filter frontend build:analyze` to visualize bundle
2. Identify large chunks and optimize them
3. Consider lazy loading or code splitting
4. Remove unused dependencies
5. Adjust budgets if necessary

---

**Issue**: Script fails to calculate gzip sizes

**Solution**: Ensure Node.js version >= 18.0.0

## Best Practices

1. **Run checks before committing**: Add to git hooks
2. **Monitor trends**: Track budget reports over time
3. **Set realistic budgets**: Based on your target devices and networks
4. **Use margins wisely**: Only for gradual improvements, not to bypass issues
5. **Automate in CI**: Prevent performance regressions

## Related Documentation

- [Frontend Performance Optimization Guide](../../apps/frontend/PERFORMANCE_OPTIMIZATION.md)
- [Nuxt Configuration](../../apps/frontend/nuxt.config.ts)
- [Build Scripts](../../apps/frontend/package.json)
