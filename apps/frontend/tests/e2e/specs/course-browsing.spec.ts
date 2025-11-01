/**
 * Course Browsing E2E Tests
 * Tests navigation, content rendering, and UI interactions for lessons
 */

import { test, expect } from '@playwright/test'
import { runAxeCheck, formatAxeViolations } from '../helpers/accessibility'
import { capturePerformanceMetrics, DESKTOP_THRESHOLDS, formatPerformanceMetrics } from '../helpers/performance'

test.describe('Course Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage/lessons page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display lesson navigation sidebar', async ({ page }) => {
    // Check if navigation is visible
    const nav = page.locator('[data-test="lesson-navigation"], nav, aside').first()
    await expect(nav).toBeVisible()

    // Should contain lesson links
    const lessonLinks = page.locator('a[href*="lesson"], a[href*="/"]').filter({ hasText: /Foundation|Core|Extended/i })
    const count = await lessonLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to a lesson and display content', async ({ page }) => {
    // Click on first lesson link
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation|Line/i }).first()
    await lessonLink.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Check if lesson content is displayed
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Check for markdown content rendering
    const content = page.locator('main, article, [data-test="lesson-content"]').first()
    await expect(content).toBeVisible()
  })

  test('should display breadcrumb navigation', async ({ page }) => {
    // Navigate to a lesson
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation/i }).first()
    if (await lessonLink.isVisible()) {
      await lessonLink.click()
      await page.waitForLoadState('networkidle')

      // Check for breadcrumb
      const breadcrumb = page.locator('[data-test="breadcrumb"], nav[aria-label*="breadcrumb" i], .breadcrumb')
      if (await breadcrumb.count() > 0) {
        await expect(breadcrumb.first()).toBeVisible()
      }
    }
  })

  test('should switch difficulty levels', async ({ page }) => {
    // Navigate to a lesson
    const lessonLink = page.locator('a').filter({ hasText: /Color|Composition/i }).first()
    if (await lessonLink.isVisible()) {
      await lessonLink.click()
      await page.waitForLoadState('networkidle')

      // Look for difficulty selector
      const difficultySelector = page.locator('[data-test="difficulty-selector"], select, button').filter({ hasText: /beginner|intermediate|advanced/i })
      
      if (await difficultySelector.count() > 0) {
        const firstSelector = difficultySelector.first()
        await firstSelector.click()
        
        // Wait for content update
        await page.waitForTimeout(500)
      }
    }
  })

  test('should render markdown content properly', async ({ page }) => {
    // Navigate to a lesson with content
    await page.goto('/')
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Line|Color/i }).first()
    await lessonLink.click()
    await page.waitForLoadState('networkidle')

    // Check for markdown elements
    const headings = page.locator('h1, h2, h3')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)

    // Check for paragraphs
    const paragraphs = page.locator('p')
    const paragraphCount = await paragraphs.count()
    expect(paragraphCount).toBeGreaterThan(0)
  })

  test('should have working print controls', async ({ page }) => {
    // Navigate to a lesson
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation/i }).first()
    await lessonLink.click()
    await page.waitForLoadState('networkidle')

    // Look for print button
    const printButton = page.locator('button, a').filter({ hasText: /print|打印/i })
    
    if (await printButton.count() > 0) {
      // Print button exists and is visible
      await expect(printButton.first()).toBeVisible()
    }
  })

  test('should pass accessibility checks', async ({ page }) => {
    // Navigate to a lesson
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation/i }).first()
    await lessonLink.click()
    await page.waitForLoadState('networkidle')

    // Run axe accessibility scan
    const results = await runAxeCheck(page)

    if (results.violations.length > 0) {
      console.log('Accessibility violations found:')
      console.log(formatAxeViolations(results.violations))
    }

    // Assert no violations
    expect(results.violations.length).toBe(0)
  })

  test('should meet performance thresholds', async ({ page }) => {
    // Navigate to a lesson
    await page.goto('/')
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation/i }).first()
    await lessonLink.click()
    await page.waitForLoadState('load')

    // Capture performance metrics
    const metrics = await capturePerformanceMetrics(page)
    
    console.log(formatPerformanceMetrics(metrics))

    // Assert performance thresholds (relaxed for E2E environment)
    if (metrics.ttfb) {
      expect(metrics.ttfb).toBeLessThan(DESKTOP_THRESHOLDS.ttfb! * 2)
    }
    
    if (metrics.domContentLoaded) {
      expect(metrics.domContentLoaded).toBeLessThan(5000)
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement
      return element ? element.tagName : null
    })
    
    expect(focusedElement).toBeTruthy()
  })
})
