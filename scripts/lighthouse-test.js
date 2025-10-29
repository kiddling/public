import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const urls = [
  'http://localhost:3000',
  'http://localhost:3000/courses',
  'http://localhost:3000/resources'
]

async function runLighthouse() {
  const resultsDir = join(__dirname, '..', 'lighthouse-results')
  
  try {
    mkdirSync(resultsDir, { recursive: true })
  } catch (error) {
    console.log('Results directory already exists')
  }

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 1
    }
  }

  const results = []

  for (const url of urls) {
    console.log(`Running Lighthouse for ${url}...`)
    const runnerResult = await lighthouse(url, options)

    const reportName = url.replace('http://localhost:3000', 'index').replace(/\//g, '-') || 'index'
    const reportPath = join(resultsDir, `${reportName}.html`)
    writeFileSync(reportPath, runnerResult.report)

    const scores = {
      url,
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100,
      fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
      lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
      cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
      tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue
    }

    results.push(scores)
    console.log(`Report saved: ${reportPath}`)
  }

  await chrome.kill()

  console.log('\n=== Lighthouse Results Summary ===\n')
  results.forEach(result => {
    console.log(`URL: ${result.url}`)
    console.log(`Performance: ${result.performance.toFixed(0)}`)
    console.log(`Accessibility: ${result.accessibility.toFixed(0)}`)
    console.log(`Best Practices: ${result.bestPractices.toFixed(0)}`)
    console.log(`SEO: ${result.seo.toFixed(0)}`)
    console.log(`FCP: ${result.fcp.toFixed(0)}ms`)
    console.log(`LCP: ${result.lcp.toFixed(0)}ms`)
    console.log(`CLS: ${result.cls.toFixed(3)}`)
    console.log(`TBT: ${result.tbt.toFixed(0)}ms`)
    console.log('---')
  })

  const summaryPath = join(resultsDir, 'summary.json')
  writeFileSync(summaryPath, JSON.stringify(results, null, 2))
  console.log(`\nSummary saved: ${summaryPath}`)

  const allTestsPassed = results.every(result => 
    result.performance >= 85 &&
    result.seo >= 90 &&
    result.lcp <= 3000
  )

  if (!allTestsPassed) {
    console.error('\n⚠️  Some performance thresholds were not met!')
    process.exit(1)
  } else {
    console.log('\n✅ All performance thresholds met!')
  }
}

runLighthouse().catch(error => {
  console.error('Lighthouse test failed:', error)
  process.exit(1)
})
