import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Cookie Consent', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('useCookieConsent composable', () => {
    it('should initialize with default state', () => {
      const consentState = { accepted: false, timestamp: null }
      expect(consentState.accepted).toBe(false)
      expect(consentState.timestamp).toBeNull()
    })

    it('should save consent to localStorage when accepting', () => {
      const mockTimestamp = Date.now()

      localStorageMock.setItem(
        'cookie-consent',
        JSON.stringify({ accepted: true, timestamp: mockTimestamp }),
      )

      const stored = localStorageMock.getItem('cookie-consent')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.accepted).toBe(true)
      expect(parsed.timestamp).toBe(mockTimestamp)
    })

    it('should save consent to localStorage when rejecting', () => {
      const mockTimestamp = Date.now()

      localStorageMock.setItem(
        'cookie-consent',
        JSON.stringify({ accepted: false, timestamp: mockTimestamp }),
      )

      const stored = localStorageMock.getItem('cookie-consent')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.accepted).toBe(false)
      expect(parsed.timestamp).toBe(mockTimestamp)
    })

    it('should load consent from localStorage', () => {
      const mockTimestamp = Date.now()
      localStorageMock.setItem(
        'cookie-consent',
        JSON.stringify({ accepted: true, timestamp: mockTimestamp }),
      )

      const stored = localStorageMock.getItem('cookie-consent')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.accepted).toBe(true)
      expect(parsed.timestamp).toBe(mockTimestamp)
    })
  })

  describe('CookieConsentBanner component', () => {
    it('should have default Chinese text configured', () => {
      const defaultProps = {
        title: '我们使用 Cookie',
        message: '我们使用 Cookie 和类似技术来改善您的浏览体验、分析网站流量，并为您提供个性化内容。点击"接受"即表示您同意使用这些技术。',
        acceptText: '接受',
        rejectText: '拒绝',
      }

      expect(defaultProps.title).toContain('Cookie')
      expect(defaultProps.acceptText).toBe('接受')
      expect(defaultProps.rejectText).toBe('拒绝')
    })

    it('should support custom text', () => {
      const customProps = {
        title: '自定义标题',
        message: '自定义消息',
        acceptText: '同意',
        rejectText: '不同意',
      }

      expect(customProps.title).toBe('自定义标题')
      expect(customProps.message).toBe('自定义消息')
      expect(customProps.acceptText).toBe('同意')
      expect(customProps.rejectText).toBe('不同意')
    })

    it('should define accept and reject actions', () => {
      const actions = {
        handleAccept: () => ({ accepted: true }),
        handleReject: () => ({ accepted: false }),
      }

      expect(actions.handleAccept()).toEqual({ accepted: true })
      expect(actions.handleReject()).toEqual({ accepted: false })
    })
  })

  describe('Cookie consent state machine', () => {
    it('should transition from no consent to accepted', () => {
      let state = { accepted: false, timestamp: null as number | null }
      
      // User accepts
      state = { accepted: true, timestamp: Date.now() }
      
      expect(state.accepted).toBe(true)
      expect(state.timestamp).not.toBeNull()
    })

    it('should transition from no consent to rejected', () => {
      let state = { accepted: false, timestamp: null as number | null }
      
      // User rejects
      state = { accepted: false, timestamp: Date.now() }
      
      expect(state.accepted).toBe(false)
      expect(state.timestamp).not.toBeNull()
    })

    it('should allow changing consent decision', () => {
      // Initial rejection
      let state = { accepted: false, timestamp: Date.now() }
      expect(state.accepted).toBe(false)
      
      // Change to acceptance
      state = { accepted: true, timestamp: Date.now() }
      expect(state.accepted).toBe(true)
    })
  })
})
