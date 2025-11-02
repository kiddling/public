/**
 * Smoke Tests
 * Basic tests to verify the application loads and core functionality works
 */

import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('load')

    // Check that the page has loaded
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should have a valid title', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out expected errors (if any)
    const criticalErrors = consoleErrors.filter((error) => {
      // Filter out known non-critical errors
      return !error.includes('favicon')
    })

    // Should not have critical errors
    expect(criticalErrors.length).toBe(0)
  })

  test('should render main content area', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    // Look for main content container
    const main = page.locator('main, #__nuxt, [data-test="app"]').first()
    await expect(main).toBeVisible()
  })

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for any navigation elements
    const nav = page.locator('nav, header, [role="navigation"]')
    const count = await nav.count()

    // Should have at least one navigation element
    expect(count).toBeGreaterThan(0)
  })

  test('mock server should be running', async ({ request }) => {
    // Test that mock server is accessible
    const response = await request.get('http://localhost:3457/health')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('should load lessons from mock API', async ({ request }) => {
    const response = await request.get('http://localhost:3457/api/lessons')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
  })

  test('should respond to keyboard input', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test Tab key
    await page.keyboard.press('Tab')

    // Check that focus moved
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName || null
    })

    expect(focusedElement).toBeTruthy()
  })
})
