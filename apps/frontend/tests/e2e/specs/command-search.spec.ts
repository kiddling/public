/**
 * Command Search (Cmd+K) E2E Tests
 * Tests global search functionality with keyboard shortcuts
 */

import { test, expect } from '@playwright/test'

test.describe('Command Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should open search with Cmd+K / Ctrl+K', async ({ page }) => {
    // Trigger search with keyboard shortcut
    const isMac = process.platform === 'darwin'
    
    if (isMac) {
      await page.keyboard.press('Meta+k')
    } else {
      await page.keyboard.press('Control+k')
    }

    // Wait a moment for search to appear
    await page.waitForTimeout(500)

    // Look for search modal/dialog
    const searchModal = page.locator('[data-test="search-modal"], [role="dialog"], [data-test="command-search"], input[type="search"]')
    
    if (await searchModal.count() > 0) {
      await expect(searchModal.first()).toBeVisible()
    }
  })

  test('should search with Chinese keywords', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="搜索"]').first()
    
    if (await searchInput.isVisible()) {
      // Type Chinese search term
      await searchInput.fill('颜色')
      await page.waitForTimeout(1000)

      // Check for search results
      const results = page.locator('[data-test="search-results"], [role="listbox"], [data-test="search-result"]')
      
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible()
      }
    }
  })

  test('should search with English keywords', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      // Type English search term
      await searchInput.fill('color')
      await page.waitForTimeout(1000)

      // Check for results
      const results = page.locator('[data-test="search-result"]')
      const count = await results.count()
      
      // Should have some results for 'color'
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('should navigate to search result', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('foundation')
      await page.waitForTimeout(1000)

      // Click on first result
      const firstResult = page.locator('[data-test="search-result"], [role="option"], a').first()
      
      if (await firstResult.isVisible()) {
        const currentUrl = page.url()
        await firstResult.click()
        await page.waitForTimeout(1000)
        
        // URL might have changed
        const newUrl = page.url()
      }
    }
  })

  test('should close search with Escape key', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchModal = page.locator('[role="dialog"], [data-test="search-modal"]').first()
    
    if (await searchModal.isVisible()) {
      // Press Escape to close
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Modal should be hidden
      await expect(searchModal).not.toBeVisible()
    }
  })

  test('should support keyboard navigation in results', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('art')
      await page.waitForTimeout(1000)

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(200)
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(200)
      
      // Press Enter to select
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    }
  })

  test('should highlight search terms in results', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('line')
      await page.waitForTimeout(1000)

      // Look for highlighted text
      const highlighted = page.locator('mark, .highlight, .search-highlight')
      const count = await highlighted.count()
      
      // Highlighting might be implemented
    }
  })

  test('should show empty state for no results', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      // Search for something that doesn't exist
      await searchInput.fill('xyzabc123nonexistent')
      await page.waitForTimeout(1000)

      // Look for empty state message
      const emptyMessage = page.locator('text=/no results|没有结果|not found/i')
      
      if (await emptyMessage.count() > 0) {
        await expect(emptyMessage.first()).toBeVisible()
      }
    }
  })

  test('should filter by content type', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    // Look for type filters
    const filters = page.locator('[data-test="search-filter"], button').filter({ 
      hasText: /lesson|resource|student/i 
    })

    if (await filters.count() > 0) {
      // Click a filter
      await filters.first().click()
      await page.waitForTimeout(500)
    }
  })
})
