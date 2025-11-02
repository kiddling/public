#!/usr/bin/env node
/**
 * Bundle Budget Check Script
 * 
 * Analyzes build output and fails if chunk sizes exceed defined thresholds.
 * Suitable for CI/CD integration to enforce performance budgets.
 * 
 * Usage:
 *   pnpm bundle:check
 *   npm run bundle:check
 *   node scripts/perf/bundle-budget.ts
 * 
 * Environment Variables:
 *   BUILD_DIR - Path to build output (default: apps/frontend/.output/public)
 *   STRICT_MODE - Fail on any budget violation (default: true)
 *   BUDGET_MARGIN - Allow percentage margin (default: 0, range: 0-20)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { gzipSync } from 'zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const config = {
  buildDir: process.env.BUILD_DIR || path.join(__dirname, '../../apps/frontend/.output/public'),
  strictMode: process.env.STRICT_MODE !== 'false',
  budgetMargin: Math.min(20, Math.max(0, parseInt(process.env.BUDGET_MARGIN || '0'))),
}

// Budget definitions (in KB, for gzipped files)
const budgets = {
  // Initial JavaScript bundle
  entryJS: {
    limit: 200, // 200KB gzipped
    description: '首屏 JavaScript',
  },
  // Total JavaScript
  totalJS: {
    limit: 500, // 500KB gzipped
    description: '所有 JavaScript',
  },
  // Total CSS
  totalCSS: {
    limit: 100, // 100KB
    description: '所有 CSS',
  },
  // Individual chunk size
  maxChunk: {
    limit: 300, // 300KB per chunk (gzipped)
    description: '单个 chunk 最大值',
  },
  // Vendor chunks
  vendorChunks: {
    'vendor-vue': 150, // Vue ecosystem should be under 150KB
    'vendor-utils': 100,
    'vendor-jspdf': 200,
    'vendor-qrcode': 50,
    'vendor-markdown': 100,
  },
}

interface FileInfo {
  path: string
  name: string
  size: number
  gzipSize: number
  type: 'js' | 'css' | 'other'
}

interface BudgetResult {
  name: string
  description: string
  limit: number
  actual: number
  percentage: number
  passed: boolean
  margin: number
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color?: keyof typeof colors) {
  const prefix = color ? colors[color] : ''
  const suffix = color ? colors.reset : ''
  console.log(`${prefix}${message}${suffix}`)
}

function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

function getGzipSize(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath)
    const gzipped = gzipSync(content, { level: 9 })
    return gzipped.length
  } catch {
    return 0
  }
}

function formatSize(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1000) {
    return `${kb.toFixed(2)} KB`
  }
  return `${(kb / 1024).toFixed(2)} MB`
}

function getFileType(filename: string): 'js' | 'css' | 'other' {
  if (filename.endsWith('.js') || filename.endsWith('.mjs')) return 'js'
  if (filename.endsWith('.css')) return 'css'
  return 'other'
}

function findFiles(dir: string, fileList: FileInfo[] = []): FileInfo[] {
  if (!fs.existsSync(dir)) {
    return fileList
  }

  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findFiles(filePath, fileList)
    } else {
      const type = getFileType(file)
      if (type === 'js' || type === 'css') {
        const size = getFileSize(filePath)
        const gzipSize = getGzipSize(filePath)
        
        fileList.push({
          path: filePath,
          name: file,
          size,
          gzipSize,
          type,
        })
      }
    }
  })

  return fileList
}

function analyzeBundle(files: FileInfo[]) {
  const results: BudgetResult[] = []
  let hasViolations = false

  log('\n' + '='.repeat(70), 'bold')
  log('📊 Bundle Budget Analysis', 'bold')
  log('='.repeat(70), 'bold')

  // Find entry file (usually the largest initial chunk)
  const jsFiles = files.filter(f => f.type === 'js')
  const cssFiles = files.filter(f => f.type === 'css')

  // Sort by size to find entry
  const sortedJS = [...jsFiles].sort((a, b) => b.gzipSize - a.gzipSize)
  const entryFile = sortedJS.find(f => f.name.includes('entry') || f.name.includes('index')) || sortedJS[0]

  // Calculate totals
  const totalJSSize = jsFiles.reduce((sum, f) => sum + f.gzipSize, 0) / 1024
  const totalCSSSize = cssFiles.reduce((sum, f) => sum + f.size, 0) / 1024

  // Check entry JS budget
  if (entryFile) {
    const entrySize = entryFile.gzipSize / 1024
    const entryLimit = budgets.entryJS.limit * (1 + config.budgetMargin / 100)
    const passed = entrySize <= entryLimit
    const percentage = (entrySize / budgets.entryJS.limit) * 100

    results.push({
      name: 'Entry JS',
      description: budgets.entryJS.description,
      limit: budgets.entryJS.limit,
      actual: entrySize,
      percentage,
      passed,
      margin: config.budgetMargin,
    })

    if (!passed) hasViolations = true
  }

  // Check total JS budget
  const totalJSPassed = totalJSSize <= budgets.totalJS.limit * (1 + config.budgetMargin / 100)
  const totalJSPercentage = (totalJSSize / budgets.totalJS.limit) * 100
  
  results.push({
    name: 'Total JS',
    description: budgets.totalJS.description,
    limit: budgets.totalJS.limit,
    actual: totalJSSize,
    percentage: totalJSPercentage,
    passed: totalJSPassed,
    margin: config.budgetMargin,
  })

  if (!totalJSPassed) hasViolations = true

  // Check total CSS budget
  const totalCSSPassed = totalCSSSize <= budgets.totalCSS.limit * (1 + config.budgetMargin / 100)
  const totalCSSPercentage = (totalCSSSize / budgets.totalCSS.limit) * 100
  
  results.push({
    name: 'Total CSS',
    description: budgets.totalCSS.description,
    limit: budgets.totalCSS.limit,
    actual: totalCSSSize,
    percentage: totalCSSPercentage,
    passed: totalCSSPassed,
    margin: config.budgetMargin,
  })

  if (!totalCSSPassed) hasViolations = true

  // Check individual chunk sizes
  const largeChunks = jsFiles.filter(f => {
    const sizeKB = f.gzipSize / 1024
    return sizeKB > budgets.maxChunk.limit * (1 + config.budgetMargin / 100)
  })

  if (largeChunks.length > 0) {
    hasViolations = true
    largeChunks.forEach(chunk => {
      const sizeKB = chunk.gzipSize / 1024
      const percentage = (sizeKB / budgets.maxChunk.limit) * 100
      
      results.push({
        name: `Chunk: ${chunk.name}`,
        description: '单个 chunk',
        limit: budgets.maxChunk.limit,
        actual: sizeKB,
        percentage,
        passed: false,
        margin: config.budgetMargin,
      })
    })
  }

  // Check vendor chunks
  Object.entries(budgets.vendorChunks).forEach(([vendorName, limit]) => {
    const vendorFile = jsFiles.find(f => f.name.includes(vendorName))
    if (vendorFile) {
      const sizeKB = vendorFile.gzipSize / 1024
      const adjustedLimit = limit * (1 + config.budgetMargin / 100)
      const passed = sizeKB <= adjustedLimit
      const percentage = (sizeKB / limit) * 100

      results.push({
        name: `Vendor: ${vendorName}`,
        description: `Vendor chunk ${vendorName}`,
        limit,
        actual: sizeKB,
        percentage,
        passed,
        margin: config.budgetMargin,
      })

      if (!passed) hasViolations = true
    }
  })

  // Print results
  log('\n📈 Budget Results:\n', 'cyan')
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗'
    const color = result.passed ? 'green' : 'red'
    const marginInfo = config.budgetMargin > 0 ? ` (margin: ${config.budgetMargin}%)` : ''
    
    log(
      `${status} ${result.name}: ${result.actual.toFixed(2)} KB / ${result.limit} KB (${result.percentage.toFixed(1)}%)${marginInfo}`,
      color
    )
    log(`  ${result.description}`, 'reset')
  })

  // Print top 10 largest files
  log('\n📦 Top 10 Largest Files:\n', 'cyan')
  
  const allFiles = [...jsFiles, ...cssFiles].sort((a, b) => b.gzipSize - a.gzipSize).slice(0, 10)
  
  allFiles.forEach((file, index) => {
    const displaySize = file.type === 'js' ? formatSize(file.gzipSize) : formatSize(file.size)
    const gzipInfo = file.type === 'js' ? ' (gzipped)' : ''
    log(`${index + 1}. ${file.name}: ${displaySize}${gzipInfo}`)
  })

  // Summary
  log('\n' + '='.repeat(70), 'bold')
  log('📋 Summary', 'bold')
  log('='.repeat(70), 'bold')
  log(`Total Files: ${files.length}`)
  log(`Total JS (gzipped): ${formatSize(totalJSSize * 1024)}`)
  log(`Total CSS: ${formatSize(totalCSSSize * 1024)}`)
  log(`Budget Margin: ${config.budgetMargin}%`)
  log(`Strict Mode: ${config.strictMode ? 'Enabled' : 'Disabled'}`)
  
  if (hasViolations) {
    log('\n❌ Budget violations detected!', 'red')
    if (config.strictMode) {
      log('\nℹ️  To adjust budgets, edit scripts/perf/bundle-budget.ts', 'yellow')
      log('ℹ️  To allow margin, set BUDGET_MARGIN environment variable', 'yellow')
      log('ℹ️  Example: BUDGET_MARGIN=10 pnpm bundle:check', 'yellow')
    }
  } else {
    log('\n✅ All budgets passed!', 'green')
  }

  log('='.repeat(70) + '\n', 'bold')

  // Save results to JSON
  const reportPath = path.join(config.buildDir, '../bundle-budget-report.json')
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results,
    files: allFiles.map(f => ({
      name: f.name,
      size: f.size,
      gzipSize: f.gzipSize,
      type: f.type,
    })),
    summary: {
      totalFiles: files.length,
      totalJSSize: totalJSSize * 1024,
      totalCSSSize: totalCSSSize * 1024,
      hasViolations,
    },
  }

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`📄 Report saved to: ${reportPath}`, 'cyan')
  } catch (error) {
    log(`⚠️  Failed to save report: ${error}`, 'yellow')
  }

  // Exit with error if violations found in strict mode
  if (hasViolations && config.strictMode) {
    process.exit(1)
  }
}

// Main execution
function main() {
  log('\n🔍 Analyzing bundle...', 'blue')
  log(`Build directory: ${config.buildDir}\n`, 'cyan')

  if (!fs.existsSync(config.buildDir)) {
    log(`❌ Build directory not found: ${config.buildDir}`, 'red')
    log('\nPlease run the build first:', 'yellow')
    log('  pnpm build:frontend', 'cyan')
    process.exit(1)
  }

  const files = findFiles(config.buildDir)

  if (files.length === 0) {
    log('❌ No JS or CSS files found in build output', 'red')
    process.exit(1)
  }

  analyzeBundle(files)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
