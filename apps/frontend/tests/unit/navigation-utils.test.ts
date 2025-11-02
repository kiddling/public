import { describe, it, expect } from 'vitest'
import {
  createEmptyNavigationMaps,
  normalizePartType,
  transformNavigationData,
} from '~/utils/navigation'

describe('navigation utils', () => {
  describe('createEmptyNavigationMaps', () => {
    it('creates empty navigation maps with correct structure', () => {
      const maps = createEmptyNavigationMaps()

      expect(maps).toHaveProperty('byCode')
      expect(maps).toHaveProperty('byPart')
      expect(maps).toHaveProperty('byLoop')

      expect(maps.byCode).toEqual({})
      expect(maps.byPart).toHaveProperty('foundation')
      expect(maps.byPart).toHaveProperty('core-blocks')
      expect(maps.byPart).toHaveProperty('extended-thinking')
      expect(maps.byPart).toHaveProperty('appendices')

      expect(maps.byPart.foundation).toEqual([])
      expect(maps.byPart['core-blocks']).toEqual([])
      expect(maps.byPart['extended-thinking']).toEqual([])
      expect(maps.byPart.appendices).toEqual([])

      expect(maps.byLoop).toEqual({})
    })
  })

  describe('normalizePartType', () => {
    it('returns foundation for undefined input', () => {
      expect(normalizePartType(undefined)).toBe('foundation')
    })

    it('returns foundation for null input', () => {
      expect(normalizePartType(null)).toBe('foundation')
    })

    it('returns foundation for empty string', () => {
      expect(normalizePartType('')).toBe('foundation')
    })

    it('normalizes valid part types', () => {
      expect(normalizePartType('foundation')).toBe('foundation')
      expect(normalizePartType('core-blocks')).toBe('core-blocks')
      expect(normalizePartType('extended-thinking')).toBe('extended-thinking')
      expect(normalizePartType('appendices')).toBe('appendices')
    })

    it('handles case-insensitive part types', () => {
      expect(normalizePartType('FOUNDATION')).toBe('foundation')
      expect(normalizePartType('Core-Blocks')).toBe('core-blocks')
    })

    it('returns foundation for invalid part types', () => {
      expect(normalizePartType('invalid')).toBe('foundation')
      expect(normalizePartType('unknown')).toBe('foundation')
    })
  })

  describe('transformNavigationData', () => {
    it('returns empty structure for null response', () => {
      const result = transformNavigationData(null)

      expect(result.tree.parts).toEqual([])
      expect(result.tree.lessons).toEqual([])
      expect(result.maps).toEqual(createEmptyNavigationMaps())
    })

    it('returns empty structure for undefined response', () => {
      const result = transformNavigationData(undefined)

      expect(result.tree.parts).toEqual([])
      expect(result.tree.lessons).toEqual([])
    })

    it('returns empty structure for response without data', () => {
      const result = transformNavigationData({ data: [] })

      expect(result.tree.parts).toEqual([])
      expect(result.tree.lessons).toEqual([])
    })

    it('transforms valid navigation response', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              code: 'P-00',
              title: 'Welcome to Foundations',
              summary: 'Introduction to the course',
              part: {
                data: {
                  id: 1,
                  attributes: {
                    key: 'foundation',
                    title: 'Foundation',
                    order: 1,
                  },
                },
              },
              loop: {
                data: {
                  id: 101,
                  attributes: {
                    code: '101',
                    title: 'Getting Started',
                    order: 1,
                  },
                },
              },
              order: 1,
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.tree.lessons.length).toBe(1)
      expect(result.tree.lessons[0].code).toBe('P-00')
      expect(result.tree.lessons[0].title).toBe('Welcome to Foundations')
      expect(result.tree.lessons[0].part).toBe('foundation')
      
      expect(result.maps.byCode['P-00']).toBeDefined()
      expect(result.maps.byPart.foundation.length).toBe(1)
    })

    it('handles lessons without part data', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              code: 'L1',
              title: 'Test Lesson',
              summary: 'Test',
              order: 1,
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.tree.lessons.length).toBe(1)
      expect(result.tree.lessons[0].part).toBe('foundation')
    })

    it('sorts lessons correctly', () => {
      const mockResponse = {
        data: [
          {
            id: 3,
            attributes: {
              code: 'L3',
              title: 'Lesson 3',
              order: 3,
            },
          },
          {
            id: 1,
            attributes: {
              code: 'L1',
              title: 'Lesson 1',
              order: 1,
            },
          },
          {
            id: 2,
            attributes: {
              code: 'L2',
              title: 'Lesson 2',
              order: 2,
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.tree.lessons.length).toBe(3)
      expect(result.tree.lessons[0].code).toBe('L1')
      expect(result.tree.lessons[1].code).toBe('L2')
      expect(result.tree.lessons[2].code).toBe('L3')
    })

    it('creates previous/next navigation links', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              code: 'L1',
              title: 'Lesson 1',
              order: 1,
            },
          },
          {
            id: 2,
            attributes: {
              code: 'L2',
              title: 'Lesson 2',
              order: 2,
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.tree.lessons[0].navigation.previousCode).toBeNull()
      expect(result.tree.lessons[0].navigation.nextCode).toBe('L2')
      expect(result.tree.lessons[1].navigation.previousCode).toBe('L1')
      expect(result.tree.lessons[1].navigation.nextCode).toBeNull()
    })

    it('groups lessons by loop', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              code: 'L1',
              title: 'Lesson 1',
              loop: {
                data: {
                  id: 101,
                  attributes: {
                    code: '101',
                    title: 'Loop 1',
                  },
                },
              },
              order: 1,
            },
          },
          {
            id: 2,
            attributes: {
              code: 'L2',
              title: 'Lesson 2',
              loop: {
                data: {
                  id: 101,
                  attributes: {
                    code: '101',
                    title: 'Loop 1',
                  },
                },
              },
              order: 2,
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.maps.byLoop['101']).toBeDefined()
      expect(result.maps.byLoop['101'].length).toBe(2)
    })

    it('skips lessons without code or title', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            attributes: {
              code: 'L1',
              title: 'Valid Lesson',
            },
          },
          {
            id: 2,
            attributes: {
              code: '',
              title: 'No Code',
            },
          },
          {
            id: 3,
            attributes: {
              code: 'L3',
              title: '',
            },
          },
        ],
      }

      const result = transformNavigationData(mockResponse as any)

      expect(result.tree.lessons.length).toBe(1)
      expect(result.tree.lessons[0].code).toBe('L1')
    })
  })
})
