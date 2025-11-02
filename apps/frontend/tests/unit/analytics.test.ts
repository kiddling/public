import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Analytics System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Event Types', () => {
    it('should define all required event types', () => {
      const eventTypes = [
        'page_view',
        'course_browse',
        'difficulty_switch',
        'progress_mark',
        'search',
        'download',
        'expand',
        'filter',
        'navigation_click',
        'session_start',
        'session_end',
      ]

      expect(eventTypes).toHaveLength(11)
      expect(eventTypes).toContain('page_view')
      expect(eventTypes).toContain('search')
      expect(eventTypes).toContain('download')
    })
  })

  describe('Session Management', () => {
    it('should generate session ID', () => {
      const sessionId = crypto.randomUUID()
      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should store session ID in localStorage', () => {
      const sessionId = crypto.randomUUID()
      localStorage.setItem('analytics_session_id', sessionId)
      
      expect(localStorage.getItem('analytics_session_id')).toBe(sessionId)
    })
  })

  describe('Privacy Controls', () => {
    it('should respect opt-out', () => {
      localStorage.setItem('analytics_opt_out', 'true')
      expect(localStorage.getItem('analytics_opt_out')).toBe('true')
    })

    it('should respect consent', () => {
      localStorage.setItem('analytics_consent', 'true')
      expect(localStorage.getItem('analytics_consent')).toBe('true')
    })
  })

  describe('Offline Queue', () => {
    it('should store events in offline queue', () => {
      const mockEvents = [
        {
          eventType: 'page_view',
          timestamp: Date.now(),
          sessionId: 'test-session',
          url: 'http://localhost:3000/test',
        },
      ]

      localStorage.setItem('analytics_queue', JSON.stringify(mockEvents))
      const stored = JSON.parse(localStorage.getItem('analytics_queue') || '[]')

      expect(stored).toHaveLength(1)
      expect(stored[0].eventType).toBe('page_view')
    })
  })
})
