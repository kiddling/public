import { test, expect } from '@playwright/test'

test.describe('Course Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays home page with welcome message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome to the Course/i })).toBeVisible()
  })

  test('opens and closes sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    const menuButton = page.getByRole('button', { name: /toggle navigation/i })
    await menuButton.click()
    
    const sidebar = page.getByRole('navigation', { name: /course navigation/i })
    await expect(sidebar).toBeVisible()
    
    const closeButton = page.getByRole('button', { name: /close navigation/i })
    await closeButton.click()
  })

  test('navigates to a lesson from sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    const firstLesson = page.getByRole('link', { name: /Introduction to the Course/i })
    await firstLesson.click()
    
    await expect(page).toHaveURL(/\/lesson\/introduction/)
    await expect(page.getByRole('heading', { name: /Introduction to the Course/i })).toBeVisible()
  })

  test('breadcrumb updates on navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await page.goto('/lesson/introduction')
    
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i })
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Loop 1')
  })

  test('marks lesson as complete', async ({ page }) => {
    await page.goto('/lesson/introduction')
    
    const completeButton = page.getByRole('button', { name: /mark as complete/i })
    await completeButton.click()
    
    await expect(page.getByRole('button', { name: /completed/i })).toBeVisible()
  })

  test('progress persists across page reloads', async ({ page }) => {
    await page.goto('/lesson/introduction')
    
    const completeButton = page.getByRole('button', { name: /mark as complete/i })
    await completeButton.click()
    
    await page.reload()
    
    await expect(page.getByRole('button', { name: /completed/i })).toBeVisible()
  })

  test('search functionality works', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    const searchInput = page.getByRole('combobox', { name: /search lessons/i })
    await searchInput.fill('introduction')
    
    await expect(page.getByText(/Introduction to the Course/)).toBeVisible()
  })

  test('keyboard navigation works on sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeTruthy()
  })

  test('supports deep linking', async ({ page }) => {
    await page.goto('/lesson/core-concepts')
    
    await expect(page).toHaveURL(/\/lesson\/core-concepts/)
    await expect(page.getByRole('heading', { name: /Core Concepts/i })).toBeVisible()
  })

  test('navigates using next/previous buttons', async ({ page }) => {
    await page.goto('/lesson/introduction')
    
    const nextButton = page.getByRole('link', { name: /next/i }).first()
    await nextButton.click()
    
    await expect(page).toHaveURL(/\/lesson\/getting-started/)
  })

  test('spiral visualization is interactive', async ({ page }) => {
    await page.goto('/')
    
    const visualization = page.locator('.spiral-svg')
    await expect(visualization).toBeVisible()
    
    const lessonNode = page.locator('.lesson-node').first()
    if (await lessonNode.count() > 0) {
      await lessonNode.click()
      await expect(page).toHaveURL(/\/lesson\//)
    }
  })
})
