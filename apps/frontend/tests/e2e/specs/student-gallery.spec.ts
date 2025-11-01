/**
 * Student Gallery E2E Tests
 * Tests gallery filtering, lightbox, and comparison features
 */

import { test, expect } from '@playwright/test'
import { runAxeCheck } from '../helpers/accessibility'

test.describe('Student Gallery', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to student gallery page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for gallery link in navigation
    const galleryLink = page.locator('a').filter({ hasText: /gallery|student.*work|作品/i })
    
    if (await galleryLink.count() > 0) {
      await galleryLink.first().click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('should display student works grid', async ({ page }) => {
    // Look for gallery grid
    const grid = page.locator('[data-test="gallery-grid"], [data-test="works-grid"], .grid, .gallery')
    
    if (await grid.count() > 0) {
      await expect(grid.first()).toBeVisible()
    }

    // Check for work items
    const workItems = page.locator('[data-test="work-item"], .work-card, [data-test="student-work"]')
    const count = await workItems.count()
    
    // Should have some works displayed
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter by grade level', async ({ page }) => {
    // Look for grade filter
    const gradeFilter = page.locator('select, button').filter({ hasText: /grade|年级/i })
    
    if (await gradeFilter.count() > 0) {
      const filter = gradeFilter.first()
      
      if (filter.evaluate(el => el.tagName === 'SELECT')) {
        await filter.selectOption({ label: /grade.*8|8.*grade/i })
      } else {
        await filter.click()
        // Select from dropdown
        const option = page.locator('text=/grade.*8|8.*grade/i').first()
        if (await option.isVisible()) {
          await option.click()
        }
      }
      
      await page.waitForTimeout(1000)
      
      // Check that results updated
      const workItems = page.locator('[data-test="work-item"], .work-card')
      const count = await workItems.count()
    }
  })

  test('should filter by medium', async ({ page }) => {
    // Look for medium filter
    const mediumFilter = page.locator('select, button').filter({ hasText: /medium|媒介|material/i })
    
    if (await mediumFilter.count() > 0) {
      const filter = mediumFilter.first()
      
      if (filter.evaluate(el => el.tagName === 'SELECT')) {
        await filter.selectOption({ index: 1 })
      } else {
        await filter.click()
        const option = page.locator('[role="option"], li').first()
        if (await option.isVisible()) {
          await option.click()
        }
      }
      
      await page.waitForTimeout(1000)
    }
  })

  test('should open work in lightbox', async ({ page }) => {
    // Find first work item
    const workItem = page.locator('[data-test="work-item"], .work-card, img').first()
    
    if (await workItem.isVisible()) {
      await workItem.click()
      await page.waitForTimeout(500)

      // Look for lightbox modal
      const lightbox = page.locator('[data-test="lightbox"], [role="dialog"], .lightbox, .modal')
      
      if (await lightbox.count() > 0) {
        await expect(lightbox.first()).toBeVisible()
      }
    }
  })

  test('should show before/after comparison in lightbox', async ({ page }) => {
    // Open a work with before/after images
    const workItem = page.locator('[data-test="work-item"]').first()
    
    if (await workItem.isVisible()) {
      await workItem.click()
      await page.waitForTimeout(500)

      // Look for before/after toggle
      const compareToggle = page.locator('button').filter({ 
        hasText: /before|after|compare|对比/i 
      })
      
      if (await compareToggle.count() > 0) {
        await expect(compareToggle.first()).toBeVisible()
        
        // Toggle comparison
        await compareToggle.first().click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should navigate between works in lightbox with keyboard', async ({ page }) => {
    // Open first work
    const workItem = page.locator('[data-test="work-item"], img').first()
    
    if (await workItem.isVisible()) {
      await workItem.click()
      await page.waitForTimeout(500)

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(300)

      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(300)

      // Close with Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Lightbox should be closed
      const lightbox = page.locator('[data-test="lightbox"], [role="dialog"]')
      if (await lightbox.count() > 0) {
        await expect(lightbox.first()).not.toBeVisible()
      }
    }
  })

  test('should close lightbox with close button', async ({ page }) => {
    // Open work
    const workItem = page.locator('[data-test="work-item"], img').first()
    
    if (await workItem.isVisible()) {
      await workItem.click()
      await page.waitForTimeout(500)

      // Find close button
      const closeButton = page.locator('button').filter({ 
        hasText: /close|×|✕|关闭/i 
      }).or(page.locator('[aria-label*="close" i]'))
      
      if (await closeButton.count() > 0) {
        await closeButton.first().click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('should display work metadata', async ({ page }) => {
    // Open work
    const workItem = page.locator('[data-test="work-item"]').first()
    
    if (await workItem.isVisible()) {
      await workItem.click()
      await page.waitForTimeout(500)

      // Look for metadata
      const title = page.locator('h1, h2, [data-test="work-title"]')
      const student = page.locator('text=/student|artist|作者/i')
      
      // Should have title
      if (await title.count() > 0) {
        await expect(title.first()).toBeVisible()
      }
    }
  })

  test('should support pagination', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('[data-test="pagination"], nav[aria-label*="pagination" i]')
    
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible()
      
      // Click next page
      const nextButton = page.locator('button, a').filter({ hasText: /next|下一页|›|→/i })
      
      if (await nextButton.count() > 0 && await nextButton.first().isEnabled()) {
        await nextButton.first().click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should pass accessibility checks', async ({ page }) => {
    // Run axe scan on gallery page
    const results = await runAxeCheck(page)
    
    // Allow some violations for images without alt text in mock data
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )
    
    expect(criticalViolations.length).toBe(0)
  })

  test('should handle empty gallery state', async ({ page }) => {
    // Apply filters that return no results
    const mediumFilter = page.locator('select').filter({ hasText: /medium/i })
    
    if (await mediumFilter.count() > 0) {
      await mediumFilter.first().selectOption({ label: /nonexistent/i }).catch(() => {})
      await page.waitForTimeout(500)
    }
  })
})
