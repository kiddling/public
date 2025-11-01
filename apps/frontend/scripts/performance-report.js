#!/usr/bin/env node

/**
 * Performance Report Generator
 * Analyzes build output and generates performance metrics
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_DIR = path.join(__dirname, '..', '.output', 'public')
const REPORT_FILE = path.join(__dirname, '..', 'performance-report.json')

// Performance budgets (in bytes)
const BUDGETS = {
  entryJS: 200 * 1024, // 200KB gzipped
  totalJS: 500 * 1024, // 500KB gzipped
  totalCSS: 100 * 1024, // 100KB
  totalAssets: 1000 * 1024, // 1MB
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

/**
 * Get gzipped file size
 */
function getGzipSize(filePath) {
  const gzPath = filePath + '.gz'
  if (fs.existsSync(gzPath)) {
    return getFileSize(gzPath)
  }
  return getFileSize(filePath)
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Recursively get all files in directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles
  }

  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else {
      arrayOfFiles.push(filePath)
    }
  })

  return arrayOfFiles
}

/**
 * Analyze bundle
 */
function analyzeBuild() {
  console.log('🔍 Analyzing build output...\n')

  const allFiles = getAllFiles(OUTPUT_DIR)

  const jsFiles = allFiles.filter((f) => f.endsWith('.js') && !f.endsWith('.gz') && !f.endsWith('.br'))
  const cssFiles = allFiles.filter((f) => f.endsWith('.css') && !f.endsWith('.gz') && !f.endsWith('.br'))
  const imageFiles = allFiles.filter((f) => /\.(png|jpg|jpeg|gif|svg|webp|avif)$/.test(f))
  const fontFiles = allFiles.filter((f) => /\.(woff|woff2|ttf|eot)$/.test(f))

  // Calculate sizes
  const jsSize = jsFiles.reduce((sum, f) => sum + getFileSize(f), 0)
  const jsGzipSize = jsFiles.reduce((sum, f) => sum + getGzipSize(f), 0)
  const cssSize = cssFiles.reduce((sum, f) => sum + getFileSize(f), 0)
  const cssGzipSize = cssFiles.reduce((sum, f) => sum + getGzipSize(f), 0)
  const imageSize = imageFiles.reduce((sum, f) => sum + getFileSize(f), 0)
  const fontSize = fontFiles.reduce((sum, f) => sum + getFileSize(f), 0)

  const totalSize = jsSize + cssSize + imageSize + fontSize
  const totalGzipSize = jsGzipSize + cssGzipSize + imageSize + fontSize

  // Find entry chunk
  const entryFile = jsFiles.find((f) => f.includes('/entry/') || f.includes('entry-'))
  const entrySize = entryFile ? getGzipSize(entryFile) : 0

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allFiles.length,
      totalSize: totalSize,
      totalGzipSize: totalGzipSize,
    },
    javascript: {
      files: jsFiles.length,
      size: jsSize,
      gzipSize: jsGzipSize,
      entrySize: entrySize,
    },
    css: {
      files: cssFiles.length,
      size: cssSize,
      gzipSize: cssGzipSize,
    },
    images: {
      files: imageFiles.length,
      size: imageSize,
    },
    fonts: {
      files: fontFiles.length,
      size: fontSize,
    },
    budgets: {
      entryJS: {
        budget: BUDGETS.entryJS,
        actual: entrySize,
        passed: entrySize <= BUDGETS.entryJS,
        percentage: Math.round((entrySize / BUDGETS.entryJS) * 100),
      },
      totalJS: {
        budget: BUDGETS.totalJS,
        actual: jsGzipSize,
        passed: jsGzipSize <= BUDGETS.totalJS,
        percentage: Math.round((jsGzipSize / BUDGETS.totalJS) * 100),
      },
      totalCSS: {
        budget: BUDGETS.totalCSS,
        actual: cssSize,
        passed: cssSize <= BUDGETS.totalCSS,
        percentage: Math.round((cssSize / BUDGETS.totalCSS) * 100),
      },
      totalAssets: {
        budget: BUDGETS.totalAssets,
        actual: totalGzipSize,
        passed: totalGzipSize <= BUDGETS.totalAssets,
        percentage: Math.round((totalGzipSize / BUDGETS.totalAssets) * 100),
      },
    },
    largestFiles: [
      ...jsFiles.map((f) => ({
        path: path.relative(OUTPUT_DIR, f),
        size: getFileSize(f),
        gzipSize: getGzipSize(f),
        type: 'js',
      })),
      ...cssFiles.map((f) => ({
        path: path.relative(OUTPUT_DIR, f),
        size: getFileSize(f),
        gzipSize: getGzipSize(f),
        type: 'css',
      })),
    ]
      .sort((a, b) => b.gzipSize - a.gzipSize)
      .slice(0, 10),
  }

  // Save report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2))

  // Print summary
  console.log('📊 Build Analysis Summary\n')
  console.log('=' .repeat(50))
  console.log('\n📦 Total Size')
  console.log(`  Raw: ${formatBytes(totalSize)}`)
  console.log(`  Gzipped: ${formatBytes(totalGzipSize)}`)
  console.log('\n📜 JavaScript')
  console.log(`  Files: ${jsFiles.length}`)
  console.log(`  Size: ${formatBytes(jsSize)} (${formatBytes(jsGzipSize)} gzipped)`)
  console.log(`  Entry: ${formatBytes(entrySize)} gzipped`)
  console.log('\n🎨 CSS')
  console.log(`  Files: ${cssFiles.length}`)
  console.log(`  Size: ${formatBytes(cssSize)} (${formatBytes(cssGzipSize)} gzipped)`)
  console.log('\n🖼️  Images')
  console.log(`  Files: ${imageFiles.length}`)
  console.log(`  Size: ${formatBytes(imageSize)}`)
  console.log('\n🔤 Fonts')
  console.log(`  Files: ${fontFiles.length}`)
  console.log(`  Size: ${formatBytes(fontSize)}`)

  console.log('\n\n🎯 Performance Budgets\n')
  console.log('=' .repeat(50))

  Object.entries(report.budgets).forEach(([name, data]) => {
    const status = data.passed ? '✅' : '❌'
    const label = name.replace(/([A-Z])/g, ' $1').trim()
    console.log(`\n${status} ${label}`)
    console.log(`  Budget: ${formatBytes(data.budget)}`)
    console.log(`  Actual: ${formatBytes(data.actual)}`)
    console.log(`  Usage: ${data.percentage}%`)
  })

  console.log('\n\n📋 Top 10 Largest Files\n')
  console.log('=' .repeat(50))

  report.largestFiles.forEach((file, index) => {
    console.log(`\n${index + 1}. ${file.path}`)
    console.log(`   ${formatBytes(file.gzipSize)} gzipped (${formatBytes(file.size)} raw)`)
  })

  console.log('\n\n✅ Report saved to: ' + REPORT_FILE)
  console.log('\n')

  // Exit with error if budgets failed
  const allBudgetsPassed = Object.values(report.budgets).every((b) => b.passed)
  if (!allBudgetsPassed) {
    console.error('❌ Performance budgets exceeded!')
    process.exit(1)
  }
}

// Run analysis
analyzeBuild()
