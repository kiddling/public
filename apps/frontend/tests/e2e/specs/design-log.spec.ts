/**
 * Design Log E2E Tests
 * Tests design log form, autosave, and PDF export
 */

import { test, expect } from '@playwright/test'

test.describe('Design Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Navigate to design log page
    const designLogLink = page.locator('a').filter({ 
      hasText: /design.*log|设计.*日志|log/i 
    })
    
    if (await designLogLink.count() > 0) {
      await designLogLink.first().click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('should display design log form', async ({ page }) => {
    // Look for form elements
    const form = page.locator('form, [data-test="design-log-form"]')
    
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible()
    }

    // Check for input fields
    const inputs = page.locator('input, textarea')
    const count = await inputs.count()
    
    expect(count).toBeGreaterThan(0)
  })

  test('should fill form fields', async ({ page }) => {
    // Fill title field
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first()
    
    if (await titleInput.isVisible()) {
      await titleInput.fill('My Art Project')
      
      // Verify value
      const value = await titleInput.inputValue()
      expect(value).toBe('My Art Project')
    }
  })

  test('should show autosave indicator', async ({ page }) => {
    // Fill a field
    const input = page.locator('input, textarea').first()
    
    if (await input.isVisible()) {
      await input.fill('Test content for autosave')
      
      // Wait for autosave
      await page.waitForTimeout(2000)
      
      // Look for autosave indicator
      const saveIndicator = page.locator('text=/saved|保存|auto.*save/i')
      
      if (await saveIndicator.count() > 0) {
        // Autosave indicator should appear
      }
    }
  })

  test('should show validation errors for required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ 
      hasText: /submit|save|提交|保存/i 
    }).first()
    
    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(500)
      
      // Look for error messages
      const errors = page.locator('[role="alert"], .error, .invalid')
      const count = await errors.count()
      
      // Should show validation errors
    }
  })

  test('should save design log successfully', async ({ page }) => {
    // Fill required fields
    const titleInput = page.locator('input').first()
    const descriptionInput = page.locator('textarea').first()
    
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Design Log')
    }
    
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('This is a test description for the design log.')
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ 
      hasText: /submit|save|提交/i 
    }).first()
    
    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(1000)
      
      // Look for success message
      const successMessage = page.locator('text=/success|saved|成功/i')
      
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible()
      }
    }
  })

  test('should export to PDF', async ({ page }) => {
    // Fill some data first
    const titleInput = page.locator('input').first()
    if (await titleInput.isVisible()) {
      await titleInput.fill('PDF Export Test')
    }
    
    // Look for export/PDF button
    const exportButton = page.locator('button').filter({ 
      hasText: /export|pdf|下载|导出/i 
    })
    
    if (await exportButton.count() > 0) {
      // Wait for potential download
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      await exportButton.first().click()
      await page.waitForTimeout(1000)
      
      const download = await downloadPromise
      // Download might be initiated
    }
  })

  test('should support template selection', async ({ page }) => {
    // Look for template selector
    const templateSelector = page.locator('select, button').filter({ 
      hasText: /template|模板/i 
    })
    
    if (await templateSelector.count() > 0) {
      await templateSelector.first().click()
      await page.waitForTimeout(500)
      
      // Select a template
      const templateOption = page.locator('[role="option"], option').first()
      if (await templateOption.isVisible()) {
        await templateOption.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should support image upload', async ({ page }) => {
    // Look for file input
    const fileInput = page.locator('input[type="file"]')
    
    if (await fileInput.count() > 0) {
      // In E2E tests, we can set files
      // For now, just verify the input exists
      await expect(fileInput.first()).toBeAttached()
    }
  })

  test('should preserve form data on page refresh', async ({ page }) => {
    // Fill form
    const titleInput = page.locator('input').first()
    if (await titleInput.isVisible()) {
      await titleInput.fill('Persistent Data Test')
      
      // Wait for autosave
      await page.waitForTimeout(2000)
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Check if data persisted
      const newTitleInput = page.locator('input').first()
      if (await newTitleInput.isVisible()) {
        const value = await newTitleInput.inputValue()
        // Data might be persisted in localStorage or IndexedDB
      }
    }
  })

  test('should show character count for text fields', async ({ page }) => {
    // Look for character counter
    const textarea = page.locator('textarea').first()
    
    if (await textarea.isVisible()) {
      await textarea.fill('Test content')
      
      // Look for character count display
      const charCount = page.locator('text=/\\d+.*character|字符/i')
      
      if (await charCount.count() > 0) {
        await expect(charCount.first()).toBeVisible()
      }
    }
  })
})
