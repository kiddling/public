/**
 * Smoke Test: Homepage
 *
 * Critical path test that verifies the homepage loads successfully.
 * This test runs during deployment to ensure basic functionality.
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Verify page title
    await expect(page).toHaveTitle(/Chinese Learning|Nuxt/)

    // Verify main heading is visible
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Verify no critical errors in console
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000)

    // Should have minimal or no errors
    expect(errors.length).toBeLessThan(5)
  })

  test('navigation is functional', async ({ page }) => {
    await page.goto('/')

    // Check if navigation exists
    const nav = page.locator('nav, header').first()
    await expect(nav).toBeVisible()
  })

  test('page responds within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // Homepage should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})
