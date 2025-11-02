/**
 * Smoke Test: API Endpoints
 *
 * Verifies that critical API endpoints are responding correctly.
 * Tests both frontend API routes and Strapi CMS endpoints.
 */

import { test, expect } from '@playwright/test'

const CMS_BASE_URL = process.env.CMS_BASE_URL || 'http://localhost:1337'

test.describe('API Smoke Tests', () => {
  test('frontend health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
  })

  test('CMS health endpoint responds', async ({ request }) => {
    const response = await request.get(`${CMS_BASE_URL}/_health`)

    // CMS health endpoint may return 200 or 204
    expect([200, 204]).toContain(response.status())
  })

  test('CMS API is accessible', async ({ request }) => {
    // Try to access the API root
    const response = await request.get(`${CMS_BASE_URL}/api`)

    // Should respond (even if 404 for root, means API is up)
    expect([200, 404]).toContain(response.status())
  })

  test('API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now()
    await request.get('/api/health')
    const responseTime = Date.now() - startTime

    // API should respond in less than 1 second
    expect(responseTime).toBeLessThan(1000)
  })
})
