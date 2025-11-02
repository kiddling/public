/**
 * Storage Helpers for E2E Tests
 * Utilities for managing localStorage and sessionStorage in tests
 */

import { Page } from '@playwright/test'

/**
 * Clear all localStorage data
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

/**
 * Clear all sessionStorage data
 */
export async function clearSessionStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    sessionStorage.clear()
  })
}

/**
 * Clear all storage (localStorage + sessionStorage)
 */
export async function clearAllStorage(page: Page): Promise<void> {
  await clearLocalStorage(page)
  await clearSessionStorage(page)
}

/**
 * Get localStorage value
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((k) => {
    return localStorage.getItem(k)
  }, key)
}

/**
 * Set localStorage value
 */
export async function setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(
    ({ k, v }) => {
      localStorage.setItem(k, v)
    },
    { k: key, v: value }
  )
}

/**
 * Get all localStorage keys and values
 */
export async function getAllLocalStorage(page: Page): Promise<Record<string, string>> {
  return await page.evaluate(() => {
    const items: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        items[key] = localStorage.getItem(key) || ''
      }
    }
    return items
  })
}

/**
 * Set progress for a lesson (common in education apps)
 */
export async function setLessonProgress(
  page: Page,
  lessonId: string,
  completed: boolean
): Promise<void> {
  await page.evaluate(
    ({ id, isCompleted }) => {
      const progress = JSON.parse(localStorage.getItem('lesson-progress') || '{}')
      progress[id] = {
        completed: isCompleted,
        timestamp: Date.now(),
      }
      localStorage.setItem('lesson-progress', JSON.stringify(progress))
    },
    { id: lessonId, isCompleted: completed }
  )
}

/**
 * Get progress for a lesson
 */
export async function getLessonProgress(
  page: Page,
  lessonId: string
): Promise<{ completed: boolean; timestamp: number } | null> {
  return await page.evaluate((id) => {
    const progress = JSON.parse(localStorage.getItem('lesson-progress') || '{}')
    return progress[id] || null
  }, lessonId)
}

/**
 * Wait for localStorage to contain a specific key
 */
export async function waitForLocalStorageKey(
  page: Page,
  key: string,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const value = await getLocalStorageItem(page, key)
    if (value !== null) {
      return
    }
    await page.waitForTimeout(100)
  }

  throw new Error(`Timeout waiting for localStorage key: ${key}`)
}
