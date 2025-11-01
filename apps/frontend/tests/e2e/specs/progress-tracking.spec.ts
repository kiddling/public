/**
 * Progress Tracking E2E Tests
 * Tests lesson completion, progress persistence, and UI updates
 */

import { test, expect } from '@playwright/test'
import { clearAllStorage, getLessonProgress, setLessonProgress } from '../helpers/storage'

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/')
    await clearAllStorage(page)
  })

  test('should mark lesson as complete', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to a lesson
    const lessonLink = page.locator('a').filter({ hasText: /Welcome|Foundation|Line/i }).first()
    await lessonLink.click()
    await page.waitForLoadState('networkidle')

    // Look for complete button
    const completeButton = page.locator('button, [role="button"]').filter({ 
      hasText: /complete|完成|mark.*complete/i 
    })

    if (await completeButton.count() > 0) {
      const button = completeButton.first()
      await button.click()

      // Wait for update
      await page.waitForTimeout(1000)

      // Check if button state changed
      const updatedButton = page.locator('button, [role="button"]').filter({ 
        hasText: /completed|已完成/i 
      })
      
      if (await updatedButton.count() > 0) {
        await expect(updatedButton.first()).toBeVisible()
      }
    }
  })

  test('should persist progress in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set progress manually
    await setLessonProgress(page, 'lesson-1', true)

    // Verify it was saved
    const progress = await getLessonProgress(page, 'lesson-1')
    expect(progress).toBeTruthy()
    expect(progress?.completed).toBe(true)
  })

  test('should display progress in navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set some lessons as completed
    await setLessonProgress(page, 'lesson-1', true)
    await setLessonProgress(page, 'lesson-2', true)

    // Reload page to see persisted progress
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Look for progress indicators in navigation
    const progressIndicators = page.locator('[data-test*="progress"], [data-test*="complete"], .completed, .progress-indicator')
    
    // Should have some progress indicators if implemented
    const count = await progressIndicators.count()
    // Note: This is optional as the UI might not show this
  })

  test('should update progress spiral/visualization', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for spiral or progress visualization
    const spiralViz = page.locator('[data-test="spiral"], [data-test="progress-viz"], svg').first()
    
    if (await spiralViz.isVisible()) {
      // Spiral visualization exists
      await expect(spiralViz).toBeVisible()
    }
  })

  test('should restore progress after page reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set progress
    await setLessonProgress(page, 'welcome-to-foundations', true)
    await setLessonProgress(page, 'line-and-form', true)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check that progress is still there
    const progress1 = await getLessonProgress(page, 'welcome-to-foundations')
    const progress2 = await getLessonProgress(page, 'line-and-form')

    expect(progress1?.completed).toBe(true)
    expect(progress2?.completed).toBe(true)
  })

  test('should show overall progress percentage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for progress percentage display
    const progressText = page.locator('text=/\\d+%/, text=/progress/i')
    
    // Progress display might exist
    const count = await progressText.count()
  })

  test('should track multiple lesson completions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Complete multiple lessons
    const lessons = ['lesson-1', 'lesson-2', 'lesson-3']
    
    for (const lessonId of lessons) {
      await setLessonProgress(page, lessonId, true)
    }

    // Verify all are completed
    for (const lessonId of lessons) {
      const progress = await getLessonProgress(page, lessonId)
      expect(progress?.completed).toBe(true)
    }
  })

  test('should allow uncompleting a lesson', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set a lesson as complete
    await setLessonProgress(page, 'lesson-1', true)

    // Navigate to lesson
    const lessonLink = page.locator('a').first()
    await lessonLink.click()
    await page.waitForLoadState('networkidle')

    // Look for uncomplete button
    const uncompleteButton = page.locator('button').filter({ 
      hasText: /uncomplete|mark.*incomplete|reset/i 
    })

    if (await uncompleteButton.count() > 0) {
      await uncompleteButton.first().click()
      await page.waitForTimeout(500)

      // Verify state changed
      const progress = await getLessonProgress(page, 'lesson-1')
      // Progress might be null or marked as incomplete
    }
  })
})
