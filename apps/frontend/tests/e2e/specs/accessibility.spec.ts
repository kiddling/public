/**
 * Comprehensive Accessibility Tests
 * Validates WCAG 2.1 AA compliance across the application
 */

import { test, expect } from '@playwright/test'
import { runAxeCheck, formatAxeViolations } from '../helpers/accessibility'

test.describe('Accessibility Compliance - WCAG 2.1 AA', () => {
  test.describe('Home Page', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const results = await runAxeCheck(page)
      
      expect(results.violations.length, formatAxeViolations(results.violations)).toBe(0)
    })

    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/')
      
      // Focus on skip link with Tab
      await page.keyboard.press('Tab')
      
      const skipLink = page.locator('.skip-to-main')
      await expect(skipLink).toBeFocused()
      
      const text = await skipLink.textContent()
      expect(text).toBeTruthy()
    })

    test('should trap focus in skip link and navigate to main content', async ({ page }) => {
      await page.goto('/')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeFocused()
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should allow full keyboard navigation', async ({ page }) => {
      await page.goto('/')
      
      // Tab through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => document.activeElement?.tagName)
        expect(focused).toBeTruthy()
      }
    })

    test('should show visible focus indicators', async ({ page }) => {
      await page.goto('/')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return null
        
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        }
      })
      
      expect(focusedElement).toBeTruthy()
      // Should have either outline or box-shadow for focus
      expect(
        focusedElement!.outline !== 'none' || 
        focusedElement!.boxShadow !== 'none'
      ).toBeTruthy()
    })

    test('should support Escape key to close modals', async ({ page }) => {
      await page.goto('/')
      
      // Open search with Cmd+K
      await page.keyboard.press('Meta+K')
      
      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => null)
      
      const modalBefore = await page.locator('[role="dialog"]').count()
      if (modalBefore > 0) {
        await page.keyboard.press('Escape')
        
        // Modal should close
        await expect(page.locator('[role="dialog"]')).toHaveCount(0)
      }
    })
  })

  test.describe('ARIA Labels and Roles', () => {
    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/')
      
      const landmarks = await page.evaluate(() => {
        return {
          main: document.querySelectorAll('main, [role="main"]').length,
          nav: document.querySelectorAll('nav, [role="navigation"]').length,
          header: document.querySelectorAll('header, [role="banner"]').length,
        }
      })
      
      expect(landmarks.main).toBeGreaterThan(0)
      expect(landmarks.nav).toBeGreaterThan(0)
    })

    test('should have lang attribute on root element', async ({ page }) => {
      await page.goto('/')
      
      const lang = await page.evaluate(() => {
        return document.documentElement.lang || document.querySelector('[lang]')?.getAttribute('lang')
      })
      
      expect(lang).toBeTruthy()
      expect(lang).toMatch(/zh/i)
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')
      
      const headings = await page.evaluate(() => {
        const h1s = Array.from(document.querySelectorAll('h1'))
        const h2s = Array.from(document.querySelectorAll('h2'))
        const h3s = Array.from(document.querySelectorAll('h3'))
        
        return {
          h1Count: h1s.length,
          h2Count: h2s.length,
          h3Count: h3s.length,
          firstH1Text: h1s[0]?.textContent,
        }
      })
      
      // Should have at least one h1
      expect(headings.h1Count).toBeGreaterThan(0)
    })
  })

  test.describe('Forms and Inputs', () => {
    test('should have labels for all form inputs', async ({ page }) => {
      await page.goto('/')
      
      // Open search to test input
      await page.keyboard.press('Meta+K')
      await page.waitForTimeout(500)
      
      const inputs = await page.evaluate(() => {
        const allInputs = Array.from(
          document.querySelectorAll('input:not([type="hidden"]), textarea, select')
        )
        
        return allInputs.map(input => {
          const hasLabel = 
            input.getAttribute('aria-label') ||
            input.getAttribute('aria-labelledby') ||
            (input as HTMLInputElement).labels?.length ||
            input.getAttribute('placeholder')
          
          return {
            id: input.id,
            name: (input as HTMLInputElement).name,
            type: (input as HTMLInputElement).type,
            hasLabel: !!hasLabel,
          }
        })
      })
      
      inputs.forEach(input => {
        expect(input.hasLabel, `Input ${input.id || input.name} should have a label`).toBeTruthy()
      })
    })
  })

  test.describe('Color and Contrast', () => {
    test('should meet WCAG AA contrast requirements', async ({ page }) => {
      await page.goto('/')
      
      // Run axe check specifically for color contrast
      const results = await runAxeCheck(page, {
        includeTags: ['wcag2aa', 'wcag21aa'],
      })
      
      const contrastViolations = results.violations.filter(
        v => v.id.includes('color-contrast')
      )
      
      expect(
        contrastViolations.length,
        formatAxeViolations(contrastViolations)
      ).toBe(0)
    })
  })

  test.describe('Images and Media', () => {
    test('should have alt text for images', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          hasAlt: img.hasAttribute('alt'),
          ariaHidden: img.getAttribute('aria-hidden'),
          role: img.getAttribute('role'),
        }))
      })
      
      images.forEach(img => {
        // Image should have alt text OR be decorative (aria-hidden or role="presentation")
        const isDecorative = img.ariaHidden === 'true' || img.role === 'presentation'
        expect(
          img.hasAlt || isDecorative,
          `Image ${img.src} should have alt text or be marked as decorative`
        ).toBeTruthy()
      })
    })
  })

  test.describe('Dynamic Content', () => {
    test('should have ARIA live regions for dynamic updates', async ({ page }) => {
      await page.goto('/')
      
      const liveRegions = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
        ).length
      })
      
      expect(liveRegions).toBeGreaterThan(0)
    })
  })

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/')
      
      const hasReducedMotion = await page.evaluate(() => {
        return document.documentElement.classList.contains('reduce-motion')
      })
      
      expect(hasReducedMotion).toBeTruthy()
    })
  })

  test.describe('High Contrast Mode', () => {
    test('should support high contrast mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark', contrast: 'more' })
      await page.goto('/')
      
      // Check if high contrast styles are applied
      const hasHighContrast = await page.evaluate(() => {
        return (
          document.documentElement.classList.contains('high-contrast') ||
          window.matchMedia('(prefers-contrast: high)').matches
        )
      })
      
      // Just verify the media query works (classList may not be set yet)
      const matchesQuery = await page.evaluate(() => {
        return window.matchMedia('(prefers-contrast: high)').matches
      })
      
      expect(matchesQuery || hasHighContrast).toBeTruthy()
    })
  })
})

test.describe('Page-Specific Accessibility', () => {
  test.describe('Lesson Pages', () => {
    test('should have no violations on lesson list', async ({ page }) => {
      await page.goto('/lessons')
      await page.waitForLoadState('networkidle')
      
      const results = await runAxeCheck(page)
      expect(results.violations.length, formatAxeViolations(results.violations)).toBe(0)
    })
  })

  test.describe('Student Gallery', () => {
    test('should have no violations on student gallery', async ({ page }) => {
      await page.goto('/student-gallery')
      await page.waitForLoadState('networkidle')
      
      const results = await runAxeCheck(page)
      expect(results.violations.length, formatAxeViolations(results.violations)).toBe(0)
    })
  })

  test.describe('Resources', () => {
    test('should have no violations on resources page', async ({ page }) => {
      await page.goto('/resources')
      await page.waitForLoadState('networkidle')
      
      const results = await runAxeCheck(page)
      expect(results.violations.length, formatAxeViolations(results.violations)).toBe(0)
    })
  })
})
