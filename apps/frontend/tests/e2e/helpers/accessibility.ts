/**
 * Accessibility Testing Helpers
 * Utilities for running axe accessibility checks in E2E tests
 */

import { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export interface AxeResults {
  violations: Array<{
    id: string
    impact?: string
    description: string
    help: string
    helpUrl: string
    nodes: Array<{
      html: string
      target: string[]
    }>
  }>
}

/**
 * Run axe accessibility scan on the current page
 * @param page - Playwright page object
 * @param options - Optional configuration for axe scan
 * @returns Axe scan results
 */
export async function runAxeCheck(
  page: Page,
  options?: {
    includeTags?: string[]
    excludeTags?: string[]
    rules?: Record<string, { enabled: boolean }>
  }
): Promise<AxeResults> {
  const builder = new AxeBuilder({ page })

  // Apply WCAG 2.1 AA standards by default
  if (options?.includeTags) {
    builder.withTags(options.includeTags)
  } else {
    builder.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  }

  if (options?.excludeTags) {
    builder.exclude(options.excludeTags)
  }

  if (options?.rules) {
    Object.entries(options.rules).forEach(([rule, config]) => {
      if (config.enabled) {
        builder.include(rule)
      } else {
        builder.exclude(rule)
      }
    })
  }

  const results = await builder.analyze()
  
  return {
    violations: results.violations,
  }
}

/**
 * Format axe violations for readable error messages
 */
export function formatAxeViolations(violations: AxeResults['violations']): string {
  if (violations.length === 0) {
    return 'No accessibility violations found'
  }

  return violations
    .map((violation, index) => {
      const nodes = violation.nodes
        .map(node => `    - ${node.html}\n      Target: ${node.target.join(', ')}`)
        .join('\n')

      return `
${index + 1}. ${violation.id} (${violation.impact || 'unknown'})
   ${violation.description}
   Help: ${violation.help}
   URL: ${violation.helpUrl}
   
   Affected elements:
${nodes}
`
    })
    .join('\n')
}

/**
 * Test keyboard navigation on a page
 */
export async function testKeyboardNavigation(page: Page) {
  // Test Tab navigation
  await page.keyboard.press('Tab')
  
  // Check if focus is visible
  const focusedElement = await page.evaluate(() => {
    const element = document.activeElement
    if (!element) return null
    
    const styles = window.getComputedStyle(element)
    return {
      tagName: element.tagName,
      outline: styles.outline,
      outlineWidth: styles.outlineWidth,
    }
  })
  
  return focusedElement
}

/**
 * Check if element has proper ARIA labels
 */
export async function checkAriaLabels(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false
    
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      (element as HTMLInputElement).labels?.length
    )
  }, selector)
}

/**
 * Test screen reader announcements
 */
export async function checkAriaLive(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const liveRegions = Array.from(
      document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
    )
    return liveRegions.map(el => el.textContent || '')
  })
}
