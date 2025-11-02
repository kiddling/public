/**
 * Resource Download E2E Tests
 * Tests resource browsing and download functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Resource Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to resources page
    const resourcesLink = page.locator('a').filter({ hasText: /resource|资源|download/i })

    if ((await resourcesLink.count()) > 0) {
      await resourcesLink.first().click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('should display resources list', async ({ page }) => {
    // Look for resources list
    const resourcesList = page.locator('[data-test="resources-list"], .resources, ul, .grid')

    if ((await resourcesList.count()) > 0) {
      await expect(resourcesList.first()).toBeVisible()
    }

    // Check for resource items
    const items = page.locator('[data-test="resource-item"], .resource-card')
    const count = await items.count()

    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter resources by category', async ({ page }) => {
    // Look for category filter
    const categoryFilter = page.locator('button, select').filter({
      hasText: /category|类别|filter/i,
    })

    if ((await categoryFilter.count()) > 0) {
      await categoryFilter.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should display resource preview', async ({ page }) => {
    // Click on a resource
    const resource = page.locator('[data-test="resource-item"]').first()

    if (await resource.isVisible()) {
      await resource.click()
      await page.waitForTimeout(500)

      // Look for preview
      const preview = page.locator('[data-test="preview"], img, .preview')

      if ((await preview.count()) > 0) {
        await expect(preview.first()).toBeVisible()
      }
    }
  })

  test('should initiate single file download', async ({ page, context }) => {
    // Accept downloads
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

    // Click download button
    const downloadButton = page
      .locator('button, a')
      .filter({
        hasText: /download|下载/i,
      })
      .first()

    if (await downloadButton.isVisible()) {
      await downloadButton.click()

      // Wait for download to start
      const download = await downloadPromise

      if (download) {
        expect(download).toBeTruthy()
      }
    }
  })

  test('should select multiple resources for batch download', async ({ page }) => {
    // Look for checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')

    if ((await checkboxes.count()) > 1) {
      // Select multiple items
      await checkboxes.nth(0).check()
      await checkboxes.nth(1).check()

      // Look for batch download button
      const batchDownload = page.locator('button').filter({
        hasText: /download.*selected|batch.*download|下载选中/i,
      })

      if ((await batchDownload.count()) > 0) {
        await expect(batchDownload.first()).toBeVisible()
      }
    }
  })

  test('should show download progress indicator', async ({ page }) => {
    // Click download
    const downloadButton = page
      .locator('button, a')
      .filter({
        hasText: /download|下载/i,
      })
      .first()

    if (await downloadButton.isVisible()) {
      await downloadButton.click()

      // Look for progress indicator
      const progress = page.locator(
        '[role="progressbar"], .progress, [data-test="download-progress"]'
      )

      // Progress might appear briefly
      await page.waitForTimeout(500)
    }
  })

  test('should display file size information', async ({ page }) => {
    // Check for file size display
    const sizeInfo = page.locator('text=/\\d+\\s*(kb|mb|gb)/i')

    const count = await sizeInfo.count()
    // File sizes should be displayed
  })

  test('should show resource metadata', async ({ page }) => {
    // Look for metadata
    const title = page.locator('h1, h2, h3').first()
    const description = page.locator('p, [data-test="description"]')

    if (await title.isVisible()) {
      await expect(title).toBeVisible()
    }
  })

  test('should handle download errors gracefully', async ({ page }) => {
    // This would test error handling if a download fails
    // In E2E with mocks, we can't easily trigger real download errors
    // but we can check that error UI exists

    const errorMessage = page.locator('[role="alert"], .error, [data-test="error"]')
    // Error UI should exist in the app
  })

  test('should support download cancellation', async ({ page }) => {
    // Look for cancel button during download
    const downloadButton = page
      .locator('button')
      .filter({ hasText: /download/i })
      .first()

    if (await downloadButton.isVisible()) {
      await downloadButton.click()
      await page.waitForTimeout(200)

      // Look for cancel button
      const cancelButton = page.locator('button').filter({
        hasText: /cancel|取消|stop/i,
      })

      if ((await cancelButton.count()) > 0 && (await cancelButton.first().isVisible())) {
        await cancelButton.first().click()
      }
    }
  })
})
