/**
 * Performance Testing Helpers
 * Utilities for measuring and asserting web performance metrics
 */

import { Page } from '@playwright/test'

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  
  // Other metrics
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  tti?: number // Time to Interactive
  domContentLoaded?: number
  loadComplete?: number
}

export interface PerformanceThresholds {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
  tti?: number
  domContentLoaded?: number
  loadComplete?: number
}

/**
 * Capture performance metrics from the browser
 */
export async function capturePerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime
    
    // Get LCP from PerformanceObserver if available
    const lcpEntry = performance.getEntriesByType('largest-contentful-paint').pop() as any
    const lcp = lcpEntry?.renderTime || lcpEntry?.loadTime
    
    return {
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      fcp,
      lcp,
    }
  })
}

/**
 * Wait for page to be fully loaded and stable
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  await page.waitForLoadState('load', { timeout })
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Measure Web Vitals using the web-vitals library
 */
export async function measureWebVitals(page: Page): Promise<PerformanceMetrics> {
  // Inject web-vitals library if not already present
  await page.evaluate(() => {
    if (!(window as any).__WEB_VITALS__) {
      (window as any).__WEB_VITALS__ = {}
    }
  })

  // Wait for metrics to be collected
  await page.waitForTimeout(2000)

  const metrics = await page.evaluate(() => {
    const vitals = (window as any).__WEB_VITALS__ || {}
    return {
      lcp: vitals.lcp?.value,
      fid: vitals.fid?.value,
      cls: vitals.cls?.value,
      fcp: vitals.fcp?.value,
    }
  })

  return metrics
}

/**
 * Assert performance metrics against thresholds
 */
export function assertPerformanceThresholds(
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (thresholds.lcp && metrics.lcp && metrics.lcp > thresholds.lcp) {
    failures.push(`LCP: ${metrics.lcp}ms exceeds threshold of ${thresholds.lcp}ms`)
  }

  if (thresholds.fid && metrics.fid && metrics.fid > thresholds.fid) {
    failures.push(`FID: ${metrics.fid}ms exceeds threshold of ${thresholds.fid}ms`)
  }

  if (thresholds.cls && metrics.cls && metrics.cls > thresholds.cls) {
    failures.push(`CLS: ${metrics.cls} exceeds threshold of ${thresholds.cls}`)
  }

  if (thresholds.fcp && metrics.fcp && metrics.fcp > thresholds.fcp) {
    failures.push(`FCP: ${metrics.fcp}ms exceeds threshold of ${thresholds.fcp}ms`)
  }

  if (thresholds.ttfb && metrics.ttfb && metrics.ttfb > thresholds.ttfb) {
    failures.push(`TTFB: ${metrics.ttfb}ms exceeds threshold of ${thresholds.ttfb}ms`)
  }

  if (thresholds.tti && metrics.tti && metrics.tti > thresholds.tti) {
    failures.push(`TTI: ${metrics.tti}ms exceeds threshold of ${thresholds.tti}ms`)
  }

  return {
    passed: failures.length === 0,
    failures,
  }
}

/**
 * Default performance thresholds for desktop
 */
export const DESKTOP_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500,  // Good: < 2.5s
  fid: 100,   // Good: < 100ms
  cls: 0.1,   // Good: < 0.1
  fcp: 1800,  // Good: < 1.8s
  ttfb: 600,  // Good: < 600ms
  tti: 3800,  // Good: < 3.8s
}

/**
 * Default performance thresholds for mobile
 */
export const MOBILE_THRESHOLDS: PerformanceThresholds = {
  lcp: 4000,  // Acceptable on mobile
  fid: 100,   // Same as desktop
  cls: 0.1,   // Same as desktop
  fcp: 3000,  // Acceptable on mobile
  ttfb: 1000, // Acceptable on mobile
  tti: 5000,  // Acceptable on mobile
}

/**
 * Log performance metrics in a readable format
 */
export function formatPerformanceMetrics(metrics: PerformanceMetrics): string {
  return `
Performance Metrics:
  - LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A'}
  - FID: ${metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A'}
  - CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
  - FCP: ${metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A'}
  - TTFB: ${metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A'}
  - TTI: ${metrics.tti ? `${metrics.tti.toFixed(2)}ms` : 'N/A'}
  - DOM Content Loaded: ${metrics.domContentLoaded ? `${metrics.domContentLoaded.toFixed(2)}ms` : 'N/A'}
  - Load Complete: ${metrics.loadComplete ? `${metrics.loadComplete.toFixed(2)}ms` : 'N/A'}
  `
}
