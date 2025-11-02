import { test, expect } from '@playwright/test'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const CMS_URL = process.env.CMS_URL || 'http://localhost:1337'

test.describe('Security Headers - Frontend', () => {
  test('should set HSTS header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['strict-transport-security']).toBeTruthy()
    expect(headers['strict-transport-security']).toContain('max-age=')
  })

  test('should set CSP header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['content-security-policy']).toBeTruthy()
    expect(headers['content-security-policy']).toContain("default-src")
  })

  test('should set X-Frame-Options header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['x-frame-options']).toBeTruthy()
    expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options'])
  })

  test('should set Referrer-Policy header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['referrer-policy']).toBeTruthy()
  })

  test('should set X-Content-Type-Options header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  test('should set Permissions-Policy header', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['permissions-policy']).toBeTruthy()
  })
})

test.describe('Rate Limiting - Frontend', () => {
  test('should include rate limit headers', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    expect(headers['x-ratelimit-limit']).toBeTruthy()
    expect(headers['x-ratelimit-remaining']).toBeTruthy()
    expect(headers['x-ratelimit-reset']).toBeTruthy()
  })

  test('should enforce rate limits', async ({ request }) => {
    const maxRequests = 100
    let rateLimitHit = false
    
    // Send requests up to the limit
    for (let i = 0; i < maxRequests + 5; i++) {
      const response = await request.get(`${FRONTEND_URL}/api/test-rate-limit`)
      
      if (response.status() === 429) {
        rateLimitHit = true
        const headers = response.headers()
        expect(headers['retry-after']).toBeTruthy()
        break
      }
    }
    
    // Note: In development, rate limiting might be disabled
    // This test verifies the infrastructure is in place
    if (process.env.NODE_ENV === 'production') {
      expect(rateLimitHit).toBe(true)
    }
  })

  test('should not rate limit static assets', async ({ request }) => {
    // Static assets should not be rate limited
    const staticPaths = ['/_nuxt/', '/images/', '/fonts/']
    
    for (const path of staticPaths) {
      const response = await request.get(`${FRONTEND_URL}${path}test.js`)
      const headers = response.headers()
      
      // Should either not have rate limit headers or have high limits
      if (headers['x-ratelimit-limit']) {
        const remaining = parseInt(headers['x-ratelimit-remaining'])
        expect(remaining).toBeGreaterThan(0)
      }
    }
  })
})

test.describe('HTTPS Enforcement - Frontend', () => {
  test('should redirect HTTP to HTTPS in production', async ({ request }) => {
    if (process.env.NODE_ENV !== 'production') {
      test.skip()
    }

    // Simulate HTTP request with X-Forwarded-Proto
    const response = await request.get(FRONTEND_URL, {
      headers: {
        'X-Forwarded-Proto': 'http',
      },
      maxRedirects: 0,
    })
    
    expect([301, 302, 307, 308]).toContain(response.status())
    const location = response.headers()['location']
    expect(location).toMatch(/^https:/)
  })
})

test.describe('Security Headers - CMS', () => {
  test('should set security headers on CMS', async ({ request }) => {
    const response = await request.get(CMS_URL)
    const headers = response.headers()
    
    // Check for basic security headers
    expect(headers['x-frame-options'] || headers['x-frame-options']).toBeTruthy()
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  test('should enforce CORS policy', async ({ request }) => {
    const response = await request.get(`${CMS_URL}/api/test`, {
      headers: {
        'Origin': 'https://malicious-domain.com',
      },
    })
    
    const headers = response.headers()
    
    // Should either not have CORS headers or reject the origin
    if (headers['access-control-allow-origin']) {
      expect(headers['access-control-allow-origin']).not.toBe('https://malicious-domain.com')
    }
  })
})

test.describe('Cookie Security', () => {
  test('cookies should have secure flags in production', async ({ context, page }) => {
    if (process.env.NODE_ENV !== 'production') {
      test.skip()
    }

    await page.goto(FRONTEND_URL)
    const cookies = await context.cookies()
    
    for (const cookie of cookies) {
      // In production, cookies should be secure
      if (FRONTEND_URL.startsWith('https')) {
        expect(cookie.secure).toBe(true)
      }
      
      // Should have httpOnly for security-sensitive cookies
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        expect(cookie.httpOnly).toBe(true)
      }
    }
  })
})

test.describe('CSP Validation', () => {
  test('should block inline scripts when CSP is strict', async ({ page }) => {
    const cspViolations: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text())
      }
    })
    
    await page.goto(FRONTEND_URL)
    
    // Try to inject an inline script
    try {
      await page.evaluate(() => {
        const script = document.createElement('script')
        script.textContent = 'console.log("injected")'
        document.body.appendChild(script)
      })
    } catch (error) {
      // Expected to fail with strict CSP
    }
    
    // In production with strict CSP, this should generate violations
    // In development, CSP might be more relaxed
    if (process.env.NODE_ENV === 'production' && process.env.STRICT_CSP === 'true') {
      expect(cspViolations.length).toBeGreaterThan(0)
    }
  })
})

test.describe('Security Best Practices', () => {
  test('should not expose sensitive information in headers', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    const headers = response.headers()
    
    // Should not expose server technology details
    expect(headers['x-powered-by']).toBeUndefined()
    expect(headers['server']).not.toContain('Express')
    expect(headers['server']).not.toContain('Koa')
  })

  test('should use secure response headers', async ({ request }) => {
    const response = await request.get(FRONTEND_URL)
    
    expect(response.status()).toBeLessThan(500)
    
    const headers = response.headers()
    
    // Verify all recommended security headers are present
    const recommendedHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
    ]
    
    for (const header of recommendedHeaders) {
      expect(headers[header]).toBeTruthy()
    }
  })
})
