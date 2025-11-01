import { describe, it, expect } from 'vitest'
import {
  buildFilterPayload,
  parseFilterParams,
  buildQueryParams,
} from '~/composables/useStudentWorks'
import type { StudentWorksFilterParams } from '~/composables/useStudentWorks'

describe('Student Works Filters', () => {
  describe('buildFilterPayload', () => {
    it('should build empty filter payload when no params provided', () => {
      const params: StudentWorksFilterParams = {}
      const result = buildFilterPayload(params)
      expect(result).toEqual({})
    })

    it('should build filter payload with discipline', () => {
      const params: StudentWorksFilterParams = {
        discipline: '环艺',
      }
      const result = buildFilterPayload(params)
      expect(result).toEqual({
        discipline: { $eq: '环艺' },
      })
    })

    it('should build filter payload with loop', () => {
      const params: StudentWorksFilterParams = {
        loop: 'Loop 1',
      }
      const result = buildFilterPayload(params)
      expect(result).toEqual({
        loop: { $eq: 'Loop 1' },
      })
    })

    it('should build filter payload with grade', () => {
      const params: StudentWorksFilterParams = {
        grade: '2023',
      }
      const result = buildFilterPayload(params)
      expect(result).toEqual({
        grade: { $eq: '2023' },
      })
    })

    it('should build filter payload with search', () => {
      const params: StudentWorksFilterParams = {
        search: 'design project',
      }
      const result = buildFilterPayload(params)
      expect(result).toEqual({
        $or: [
          { studentName: { $containsi: 'design project' } },
          { projectTitle: { $containsi: 'design project' } },
          { description: { $containsi: 'design project' } },
        ],
      })
    })

    it('should build filter payload with multiple params', () => {
      const params: StudentWorksFilterParams = {
        discipline: '产品',
        loop: 'Loop 2',
        grade: '2023',
        search: 'chair design',
      }
      const result = buildFilterPayload(params)
      expect(result).toEqual({
        discipline: { $eq: '产品' },
        loop: { $eq: 'Loop 2' },
        grade: { $eq: '2023' },
        $or: [
          { studentName: { $containsi: 'chair design' } },
          { projectTitle: { $containsi: 'chair design' } },
          { description: { $containsi: 'chair design' } },
        ],
      })
    })
  })

  describe('parseFilterParams', () => {
    it('should parse empty query params', () => {
      const query = {}
      const result = parseFilterParams(query)
      expect(result).toEqual({
        discipline: undefined,
        loop: undefined,
        grade: undefined,
        search: undefined,
      })
    })

    it('should parse query params with all filters', () => {
      const query = {
        discipline: '视传',
        loop: 'Loop 3',
        grade: '2024',
        search: 'poster',
      }
      const result = parseFilterParams(query)
      expect(result).toEqual({
        discipline: '视传',
        loop: 'Loop 3',
        grade: '2024',
        search: 'poster',
      })
    })

    it('should parse query params with some filters', () => {
      const query = {
        discipline: '数媒',
        search: 'animation',
      }
      const result = parseFilterParams(query)
      expect(result).toEqual({
        discipline: '数媒',
        loop: undefined,
        grade: undefined,
        search: 'animation',
      })
    })
  })

  describe('buildQueryParams', () => {
    it('should build empty query params when no filters provided', () => {
      const filters: StudentWorksFilterParams = {}
      const result = buildQueryParams(filters)
      expect(result).toEqual({})
    })

    it('should build query params with all filters', () => {
      const filters: StudentWorksFilterParams = {
        discipline: '公艺',
        loop: 'Loop 1',
        grade: '2022',
        search: 'sculpture',
      }
      const result = buildQueryParams(filters)
      expect(result).toEqual({
        discipline: '公艺',
        loop: 'Loop 1',
        grade: '2022',
        search: 'sculpture',
      })
    })

    it('should build query params with some filters', () => {
      const filters: StudentWorksFilterParams = {
        discipline: '环艺',
        grade: '2023',
      }
      const result = buildQueryParams(filters)
      expect(result).toEqual({
        discipline: '环艺',
        grade: '2023',
      })
    })

    it('should omit undefined values', () => {
      const filters: StudentWorksFilterParams = {
        discipline: '产品',
        loop: undefined,
        grade: undefined,
        search: undefined,
      }
      const result = buildQueryParams(filters)
      expect(result).toEqual({
        discipline: '产品',
      })
    })
  })

  describe('roundtrip conversion', () => {
    it('should maintain filter values through query param conversion', () => {
      const originalFilters: StudentWorksFilterParams = {
        discipline: '视传',
        loop: 'Loop 2',
        grade: '2023',
        search: 'branding',
      }

      const queryParams = buildQueryParams(originalFilters)
      const parsedFilters = parseFilterParams(queryParams)

      expect(parsedFilters).toEqual(originalFilters)
    })
  })
})
