import { test, expect } from '@playwright/test'

test.describe('Lesson View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Introduction to the Course')
  })

  test('displays lesson content with difficulty toggle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Introduction to the Course')
    await expect(page.locator('text=Base')).toBeVisible()
    await expect(page.locator('text=Advance')).toBeVisible()
    await expect(page.locator('text=Stretch')).toBeVisible()
  })

  test('switches difficulty levels without page reload', async ({ page }) => {
    // Check initial base content
    await expect(page.locator('text=Introduction to Core Concepts')).toBeVisible()

    // Switch to Advance
    await page.click('text=Advance')
    await expect(page.locator('text=Deep Dive into Course Methodology')).toBeVisible()
    await expect(page.locator('text=Introduction to Core Concepts')).not.toBeVisible()

    // Switch to Stretch
    await page.click('text=Stretch')
    await expect(page.locator('text=Meta-Learning and Self-Direction')).toBeVisible()
    await expect(page.locator('text=Deep Dive into Course Methodology')).not.toBeVisible()

    // Switch back to Base
    await page.click('text=Base')
    await expect(page.locator('text=Introduction to Core Concepts')).toBeVisible()
  })

  test('persists difficulty preference across navigation', async ({ page }) => {
    // Select Advance difficulty
    await page.click('text=Advance')
    
    // Navigate to another lesson
    await page.click('text=Getting Started')
    await expect(page.locator('h1')).toContainText('Getting Started')
    
    // Check that Advance is still selected
    const advanceButton = page.locator('button:has-text("Advance")')
    await expect(advanceButton).toHaveClass(/active/)
  })

  test('displays media resources', async ({ page }) => {
    await expect(page.locator('text=Media Resources')).toBeVisible()
    await expect(page.locator('img[alt*="Course Structure"]')).toBeVisible()
  })

  test('displays downloadable attachments', async ({ page }) => {
    await expect(page.locator('text=Downloadable Resources')).toBeVisible()
    await expect(page.locator('text=Course Handbook PDF')).toBeVisible()
    await expect(page.locator('text=Quick Reference Guide')).toBeVisible()
  })

  test('displays related resources with QR code toggle', async ({ page }) => {
    await expect(page.locator('text=Related Resources')).toBeVisible()
    await expect(page.locator('text=Learning Strategies')).toBeVisible()
    
    // Toggle QR code
    const qrButton = page.locator('button:has-text("QR Code")').first()
    await qrButton.click()
    await expect(page.locator('.qr-code-svg')).toBeVisible()
    
    // Toggle off
    await qrButton.click()
    await expect(page.locator('.qr-code-svg')).not.toBeVisible()
  })

  test('marks lesson as complete when scrolled to end', async ({ page }) => {
    // Scroll to bottom of content
    await page.evaluate(() => {
      const content = document.querySelector('.lesson-content')
      if (content) {
        content.scrollTop = content.scrollHeight
      }
    })

    // Wait for auto-complete notification
    await expect(page.locator('text=Great job!')).toBeVisible({ timeout: 2000 })
    
    // Check that lesson is marked complete
    const completionCheckbox = page.locator('input[type="checkbox"]')
    await expect(completionCheckbox).toBeChecked()
  })

  test('allows dismissing auto-complete notification', async ({ page }) => {
    // Trigger auto-complete
    await page.evaluate(() => {
      const content = document.querySelector('.lesson-content')
      if (content) {
        content.scrollTop = content.scrollHeight
      }
    })

    await expect(page.locator('text=Great job!')).toBeVisible({ timeout: 2000 })
    
    // Dismiss notification
    await page.click('button[aria-label="Dismiss notification"]')
    await expect(page.locator('text=Great job!')).not.toBeVisible()
  })

  test('navigates to previous and next lessons', async ({ page }) => {
    // Check next button
    const nextButton = page.locator('a:has-text("Getting Started")')
    await expect(nextButton).toBeVisible()
    await nextButton.click()
    
    await expect(page.locator('h1')).toContainText('Getting Started')
    
    // Check previous button
    const prevButton = page.locator('a:has-text("Introduction to the Course")')
    await expect(prevButton).toBeVisible()
    await prevButton.click()
    
    await expect(page.locator('h1')).toContainText('Introduction to the Course')
  })

  test('maintains difficulty state when toggling breaks nothing', async ({ page }) => {
    // Toggle between difficulties multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('text=Advance')
      await page.waitForTimeout(100)
      await page.click('text=Base')
      await page.waitForTimeout(100)
      await page.click('text=Stretch')
      await page.waitForTimeout(100)
    }
    
    // Check that content is still displaying correctly
    await expect(page.locator('h2')).toBeVisible()
    
    // Navigate and come back
    await page.click('text=Getting Started')
    await page.click('text=Introduction to the Course')
    
    // Should still work
    await expect(page.locator('h1')).toContainText('Introduction to the Course')
  })
})
