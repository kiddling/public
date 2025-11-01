import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStudentWorks, useStudentWork, useSearchStudentWorks } from '~/composables/useStudentWorks'

// Mock the useCmsData composable
vi.mock('~/composables/useCmsData', () => ({
  useCmsData: vi.fn((endpoint: string, params: any) => {
    return {
      data: { value: null },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn(),
    }
  }),
}))

// Mock buildStrapiQuery
vi.mock('~/utils/data-layer', () => ({
  buildStrapiQuery: vi.fn((params) => params),
}))

describe('useStudentWorks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls useCmsData with correct endpoint', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks()
    
    expect(useCmsData).toHaveBeenCalledWith(
      '/api/cms/student-works',
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes discipline filter to query params', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ discipline: '环艺' })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters).toEqual({
      discipline: { $eq: '环艺' },
    })
  })

  it('passes loop filter to query params', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ loop: 'Loop 2' })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters).toEqual({
      loop: { $eq: 'Loop 2' },
    })
  })

  it('passes grade filter to query params', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ grade: '2023' })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters).toEqual({
      grade: { $eq: '2023' },
    })
  })

  it('passes student name filter to query params', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ studentName: 'John' })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters).toEqual({
      studentName: { $containsi: 'John' },
    })
  })

  it('combines multiple filters', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({
      discipline: '环艺',
      loop: 'Loop 1',
      grade: '2023',
    })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters).toEqual({
      discipline: { $eq: '环艺' },
      loop: { $eq: 'Loop 1' },
      grade: { $eq: '2023' },
    })
  })

  it('populates related data by default', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks()
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.populate).toEqual(['assets', 'beforeAfterMedia', 'relatedLesson'])
  })

  it('allows custom populate fields', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ populate: ['assets'] })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.populate).toEqual(['assets'])
  })

  it('allows disabling populate', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ populate: false })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.populate).toBeUndefined()
  })

  it('applies default sorting by createdAt desc', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks()
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.sort).toEqual(['createdAt:desc'])
  })

  it('allows custom sorting', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({ sort: ['studentName:asc'] })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.sort).toEqual(['studentName:asc'])
  })

  it('passes pagination params', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWorks({
      pagination: {
        page: 2,
        pageSize: 12,
      },
    })
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.pagination).toEqual({
      page: 2,
      pageSize: 12,
    })
  })
})

describe('useStudentWork', () => {
  it('calls useCmsData with correct endpoint for single work', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useStudentWork(123)
    
    expect(useCmsData).toHaveBeenCalledWith(
      '/api/cms/student-works/123',
      {},
      expect.objectContaining({
        key: 'student-work-123',
      })
    )
  })
})

describe('useSearchStudentWorks', () => {
  it('creates $or filter for search query', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useSearchStudentWorks('test query')
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters.$or).toBeDefined()
    expect(params.filters.$or).toContainEqual({
      studentName: { $containsi: 'test query' },
    })
    expect(params.filters.$or).toContainEqual({
      description: { $containsi: 'test query' },
    })
  })

  it('returns immediate:false for empty query', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useSearchStudentWorks('')
    
    const options = useCmsData.mock.calls[0][2]
    expect(options.immediate).toBe(false)
  })

  it('searches across multiple fields', () => {
    const { useCmsData } = require('~/composables/useCmsData')
    
    useSearchStudentWorks('search term')
    
    const params = useCmsData.mock.calls[0][1]
    expect(params.filters.$or.length).toBeGreaterThanOrEqual(2)
  })
})
