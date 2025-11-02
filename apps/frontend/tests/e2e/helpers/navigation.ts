/**
 * Navigation Helpers for E2E Tests
 * Common navigation patterns and waits
 */

import { Page } from '@playwright/test'

/**
 * Navigate to a page and wait for it to be ready
 */
export async function navigateAndWait(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.waitForLoadState('load')
  await page.waitForLoadState('networkidle', { timeout: 10000 })
}

/**
 * Wait for Nuxt hydration to complete
 */
export async function waitForHydration(page: Page): Promise<void> {
  // Wait for Vue to be ready
  await page
    .waitForFunction(
      () => {
        return (window as any).__NUXT__ !== undefined
      },
      { timeout: 5000 }
    )
    .catch(() => {
      // Hydration check is optional
    })
}

/**
 * Click a link and wait for navigation
 */
export async function clickAndWait(page: Page, selector: string): Promise<void> {
  await page.click(selector)
  await page.waitForLoadState('load')
  await page.waitForLoadState('networkidle', { timeout: 10000 })
}

/**
 * Find and click a link by text content
 */
export async function clickLinkByText(page: Page, text: string | RegExp): Promise<void> {
  const link = page.locator('a').filter({ hasText: text }).first()
  await link.click()
  await page.waitForLoadState('load')
}

/**
 * Check if an element is visible with timeout
 */
export async function isVisible(page: Page, selector: string, timeout = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

/**
 * Wait for an element to appear
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout })
}

/**
 * Scroll to an element
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded()
}

/**
 * Get current route path
 */
export async function getCurrentPath(page: Page): Promise<string> {
  const url = new URL(page.url())
  return url.pathname
}
