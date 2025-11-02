/**
 * ARIA Live Region Composable Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initAriaLiveRegion, useAriaLive } from '~/composables/useAriaLive'

describe('useAriaLive', () => {
  beforeEach(() => {
    // Clean up any existing live regions
    const existing = document.getElementById('aria-live-region')
    if (existing) {
      document.body.removeChild(existing)
    }
  })

  afterEach(() => {
    const existing = document.getElementById('aria-live-region')
    if (existing) {
      document.body.removeChild(existing)
    }
  })

  it('should create live region container', () => {
    initAriaLiveRegion()

    const container = document.getElementById('aria-live-region')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('role')).toBe('status')
    expect(container?.getAttribute('aria-live')).toBe('polite')
    expect(container?.getAttribute('aria-atomic')).toBe('true')
  })

  it('should announce polite messages', () => {
    const { announcePolite } = useAriaLive()

    announcePolite('Test message')

    const container = document.getElementById('aria-live-region')
    expect(container?.textContent).toBe('Test message')
    expect(container?.getAttribute('aria-live')).toBe('polite')
  })

  it('should announce assertive messages', () => {
    const { announceAssertive } = useAriaLive()

    announceAssertive('Urgent message')

    const container = document.getElementById('aria-live-region')
    expect(container?.textContent).toBe('Urgent message')
    expect(container?.getAttribute('aria-live')).toBe('assertive')
  })

  it('should clear messages after timeout', async () => {
    vi.useFakeTimers()

    const { announcePolite } = useAriaLive()

    announcePolite('Temporary message')

    const container = document.getElementById('aria-live-region')
    expect(container?.textContent).toBe('Temporary message')

    // Fast-forward time
    vi.advanceTimersByTime(1100)

    expect(container?.textContent).toBe('')

    vi.useRealTimers()
  })

  it('should manually clear messages', () => {
    const { announcePolite, clear } = useAriaLive()

    announcePolite('Message to clear')

    const container = document.getElementById('aria-live-region')
    expect(container?.textContent).toBe('Message to clear')

    clear()

    expect(container?.textContent).toBe('')
  })
})
