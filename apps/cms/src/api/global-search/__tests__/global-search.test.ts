import globalSearchService from '../services/global-search'

// Mock Strapi instance
const mockStrapi = {
  entityService: {
    findMany: jest.fn(),
  },
  log: {
    error: jest.fn(),
  },
}

describe('Global Search Service', () => {
  let service: any

  beforeEach(() => {
    service = globalSearchService({ strapi: mockStrapi as any })
    jest.clearAllMocks()
    service.clearCache()
  })

  describe('segmentText', () => {
    it('should segment Chinese text into words', () => {
      const result = service.segmentText('我爱学习设计')
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle English text', () => {
      const result = service.segmentText('Hello World')
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle empty string', () => {
      const result = service.segmentText('')
      expect(result).toEqual([])
    })

    it('should handle mixed Chinese and English', () => {
      const result = service.segmentText('Design设计思维Thinking')
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('buildSearchFilters', () => {
    it('should create single filter for one token', () => {
      const filters = service.buildSearchFilters('设计', 'title')
      expect(filters).toHaveProperty('title')
      expect(filters.title).toHaveProperty('$containsi', '设计')
    })

    it('should create OR filters for multiple tokens', () => {
      const filters = service.buildSearchFilters('设计思维', 'title')
      expect(filters).toHaveProperty('$or')
      expect(Array.isArray(filters.$or)).toBe(true)
    })

    it('should handle empty query', () => {
      const filters = service.buildSearchFilters('', 'title')
      expect(filters).toEqual([])
    })
  })

  describe('findHighlightRanges', () => {
    it('should find single match', () => {
      const ranges = service.findHighlightRanges('这是一个设计课程', '设计')
      expect(ranges).toHaveLength(1)
      expect(ranges[0]).toEqual({ start: 4, end: 6 })
    })

    it('should find multiple matches', () => {
      const ranges = service.findHighlightRanges('设计是设计的核心', '设计')
      expect(ranges.length).toBeGreaterThan(0)
    })

    it('should merge overlapping ranges', () => {
      const ranges = service.findHighlightRanges('设计思维设计', '设计思维')
      expect(ranges).toBeInstanceOf(Array)
    })

    it('should handle case-insensitive matching', () => {
      const ranges = service.findHighlightRanges('Design Course', 'design')
      expect(ranges).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      const ranges = service.findHighlightRanges('Hello World', '设计')
      expect(ranges).toEqual([])
    })
  })

  describe('createExcerpt', () => {
    it('should return full text if shorter than maxLength', () => {
      const text = '这是一个短文本'
      const excerpt = service.createExcerpt(text, '短', 100)
      expect(excerpt).toBe(text)
    })

    it('should truncate long text', () => {
      const text = '这是一个很长的文本'.repeat(20)
      const excerpt = service.createExcerpt(text, '很长', 50)
      expect(excerpt.length).toBeLessThanOrEqual(60) // Including ellipsis
    })

    it('should add ellipsis for truncated text', () => {
      const text =
        'A very long text that needs to be truncated because it exceeds the maximum length'
      const excerpt = service.createExcerpt(text, 'truncated', 50)
      expect(excerpt).toMatch(/\.{3}/)
    })

    it('should center excerpt around match', () => {
      const text = 'Start of text with important keyword in the middle and more text at the end'
      const excerpt = service.createExcerpt(text, 'keyword', 40)
      expect(excerpt).toContain('keyword')
    })

    it('should strip HTML tags', () => {
      const text = '<p>This is <strong>HTML</strong> content</p>'
      const excerpt = service.createExcerpt(text, 'HTML', 50)
      expect(excerpt).not.toContain('<p>')
      expect(excerpt).not.toContain('<strong>')
    })
  })

  describe('search', () => {
    beforeEach(() => {
      mockStrapi.entityService.findMany.mockResolvedValue([])
    })

    it('should return empty results for queries shorter than 2 characters', async () => {
      const result = await service.search({ query: 'a', page: 1, pageSize: 20 })
      expect(result.results).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should search all types by default', async () => {
      await service.search({ query: '设计', page: 1, pageSize: 20 })
      expect(mockStrapi.entityService.findMany).toHaveBeenCalledTimes(4)
    })

    it('should search specific types when provided', async () => {
      await service.search({ query: '设计', type: ['lesson'], page: 1, pageSize: 20 })
      expect(mockStrapi.entityService.findMany).toHaveBeenCalledTimes(1)
    })

    it('should filter lessons by difficulty', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Test Lesson',
          code: 'L001',
          summary: 'Test summary',
          difficulty_specific_fields: [{ difficulty: 'beginner' }],
        },
      ])

      const result = await service.search({
        query: 'Test',
        type: ['lesson'],
        difficulty: ['beginner'],
        page: 1,
        pageSize: 20,
      })

      expect(mockStrapi.entityService.findMany).toHaveBeenCalled()
      const callArgs = mockStrapi.entityService.findMany.mock.calls[0][1]
      expect(callArgs.filters).toHaveProperty('difficulty_specific_fields')
    })

    it('should implement pagination', async () => {
      const mockResults = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        code: `CODE${i}`,
        summary: 'Test',
        publishedAt: new Date(),
      }))

      mockStrapi.entityService.findMany.mockResolvedValue(mockResults)

      const result1 = await service.search({ query: 'Test', page: 1, pageSize: 10 })
      expect(result1.results.length).toBeLessThanOrEqual(10)
      expect(result1.page).toBe(1)

      const result2 = await service.search({ query: 'Test', page: 2, pageSize: 10 })
      expect(result2.page).toBe(2)
    })

    it('should cache search results', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([])

      await service.search({ query: 'Test', page: 1, pageSize: 20 })
      await service.search({ query: 'Test', page: 1, pageSize: 20 })

      // Should only call once due to caching
      expect(mockStrapi.entityService.findMany).toHaveBeenCalledTimes(4) // 4 types on first call
    })

    it('should generate suggestions', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([
        { id: 1, title: 'Design Thinking', code: 'L001', summary: 'Test', publishedAt: new Date() },
        {
          id: 2,
          title: 'Design Principles',
          code: 'L002',
          summary: 'Test',
          publishedAt: new Date(),
        },
      ])

      const result = await service.search({
        query: 'Design',
        type: ['lesson'],
        page: 1,
        pageSize: 20,
      })
      expect(result.suggestions).toBeInstanceOf(Array)
    })
  })

  describe('searchLessons', () => {
    it('should search in title, code, and summary', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([
        {
          id: 1,
          title: '设计思维',
          code: 'DT001',
          summary: '这是关于设计思维的课程',
          publishedAt: new Date(),
        },
      ])

      const results = await service.searchLessons('设计', [])
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('lesson')
    })

    it('should include difficulty metadata', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'Test Lesson',
          code: 'L001',
          summary: 'Test',
          difficulty_specific_fields: [{ difficulty: 'beginner' }, { difficulty: 'intermediate' }],
          publishedAt: new Date(),
        },
      ])

      const results = await service.searchLessons('Test', [])
      expect(results[0].meta.difficulty).toEqual(['beginner', 'intermediate'])
    })
  })

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      mockStrapi.entityService.findMany.mockResolvedValue([])

      // Populate cache
      await service.search({ query: 'Test', page: 1, pageSize: 20 })

      // Clear cache
      service.clearCache()

      // Search again - should make new API calls
      mockStrapi.entityService.findMany.mockClear()
      await service.search({ query: 'Test', page: 1, pageSize: 20 })

      expect(mockStrapi.entityService.findMany).toHaveBeenCalled()
    })
  })
})
