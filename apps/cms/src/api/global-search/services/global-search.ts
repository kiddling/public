import type { Core } from '@strapi/strapi'
import nodejieba from 'nodejieba'

interface SearchOptions {
  query: string
  type?: string[]
  page?: number
  pageSize?: number
  difficulty?: string[]
}

interface HighlightRange {
  start: number
  end: number
}

interface SearchResult {
  id: number
  type: 'lesson' | 'knowledge-card' | 'student-work' | 'resource'
  title: string
  excerpt: string
  highlights: {
    title: HighlightRange[]
    excerpt: HighlightRange[]
  }
  meta: Record<string, any>
  url: string
}

interface SearchResponse {
  results: SearchResult[]
  groups: {
    lessons: SearchResult[]
    knowledgeCards: SearchResult[]
    studentWorks: SearchResult[]
    resources: SearchResult[]
  }
  suggestions: string[]
  total: number
  page: number
  pageSize: number
}

// In-memory cache with TTL
const cache = new Map<string, { data: SearchResponse; expires: number }>()
const CACHE_TTL = 60000 // 1 minute

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Segment Chinese text into words using nodejieba
   */
  segmentText(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return []
    }
    return nodejieba.cut(text)
  },

  /**
   * Build flexible search filters using segmented tokens
   */
  buildSearchFilters(query: string, field: string) {
    const tokens = this.segmentText(query)
    if (tokens.length === 0) {
      return []
    }

    // For single token, use simple contains
    if (tokens.length === 1) {
      return {
        [field]: {
          $containsi: tokens[0],
        },
      }
    }

    // For multiple tokens, match if any token is found
    return {
      $or: tokens.map((token) => ({
        [field]: {
          $containsi: token,
        },
      })),
    }
  },

  /**
   * Find highlight ranges for matched terms in text
   */
  findHighlightRanges(text: string, query: string): HighlightRange[] {
    if (!text || !query) {
      return []
    }

    const ranges: HighlightRange[] = []
    const tokens = this.segmentText(query)
    const lowerText = text.toLowerCase()

    for (const token of tokens) {
      const lowerToken = token.toLowerCase()
      let index = 0

      while ((index = lowerText.indexOf(lowerToken, index)) !== -1) {
        ranges.push({
          start: index,
          end: index + token.length,
        })
        index += token.length
      }
    }

    // Merge overlapping ranges
    if (ranges.length === 0) {
      return []
    }

    ranges.sort((a, b) => a.start - b.start)
    const merged: HighlightRange[] = [ranges[0]]

    for (let i = 1; i < ranges.length; i++) {
      const current = ranges[i]
      const last = merged[merged.length - 1]

      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end)
      } else {
        merged.push(current)
      }
    }

    return merged
  },

  /**
   * Create excerpt from text with context around matches
   */
  createExcerpt(text: string, query: string, maxLength: number = 150): string {
    if (!text) {
      return ''
    }

    // Strip HTML if present
    const plainText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }

    const tokens = this.segmentText(query)
    if (tokens.length === 0) {
      return plainText.slice(0, maxLength) + '...'
    }

    // Find first match position
    const lowerText = plainText.toLowerCase()
    let firstMatchIndex = -1

    for (const token of tokens) {
      const index = lowerText.indexOf(token.toLowerCase())
      if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
        firstMatchIndex = index
      }
    }

    if (firstMatchIndex === -1) {
      return plainText.slice(0, maxLength) + '...'
    }

    // Extract context around match
    const start = Math.max(0, firstMatchIndex - Math.floor(maxLength / 2))
    const end = Math.min(plainText.length, start + maxLength)
    let excerpt = plainText.slice(start, end)

    if (start > 0) {
      excerpt = '...' + excerpt
    }
    if (end < plainText.length) {
      excerpt = excerpt + '...'
    }

    return excerpt
  },

  /**
   * Search lessons with difficulty filtering
   */
  async searchLessons(query: string, difficulty?: string[]): Promise<SearchResult[]> {
    const filters: any = {
      publishedAt: { $notNull: true },
      $or: [
        this.buildSearchFilters(query, 'title'),
        this.buildSearchFilters(query, 'code'),
        this.buildSearchFilters(query, 'summary'),
      ],
    }

    // Add difficulty filtering if specified
    if (difficulty && difficulty.length > 0) {
      filters['difficulty_specific_fields'] = {
        difficulty: {
          $in: difficulty,
        },
      }
    }

    const lessons = await strapi.entityService.findMany('api::lesson.lesson', {
      filters,
      populate: ['difficulty_specific_fields', 'loop'],
      limit: 20,
    })

    return lessons.map((lesson: any) => {
      const title = lesson.title || ''
      const summary = lesson.summary || ''
      const excerpt = this.createExcerpt(summary, query)

      return {
        id: lesson.id,
        type: 'lesson' as const,
        title,
        excerpt,
        highlights: {
          title: this.findHighlightRanges(title, query),
          excerpt: this.findHighlightRanges(excerpt, query),
        },
        meta: {
          code: lesson.code,
          difficulty: lesson.difficulty_specific_fields?.map((d: any) => d.difficulty) || [],
          loopTitle: lesson.loop?.title,
        },
        url: `/lessons/${lesson.code}`,
      }
    })
  },

  /**
   * Search knowledge cards
   */
  async searchKnowledgeCards(query: string): Promise<SearchResult[]> {
    const filters = {
      publishedAt: { $notNull: true },
      $or: [this.buildSearchFilters(query, 'title'), this.buildSearchFilters(query, 'description')],
    }

    const cards = await strapi.entityService.findMany('api::knowledge-card.knowledge-card', {
      filters,
      limit: 20,
    })

    return cards.map((card: any) => {
      const title = card.title || ''
      const description = card.description || ''
      const excerpt = this.createExcerpt(description, query)

      return {
        id: card.id,
        type: 'knowledge-card' as const,
        title,
        excerpt,
        highlights: {
          title: this.findHighlightRanges(title, query),
          excerpt: this.findHighlightRanges(excerpt, query),
        },
        meta: {
          type: card.type,
          slug: card.slug,
        },
        url: `/knowledge-cards/${card.slug}`,
      }
    })
  },

  /**
   * Search student works
   */
  async searchStudentWorks(query: string): Promise<SearchResult[]> {
    const filters = {
      publishedAt: { $notNull: true },
      $or: [
        this.buildSearchFilters(query, 'studentName'),
        this.buildSearchFilters(query, 'description'),
      ],
    }

    const works = await strapi.entityService.findMany('api::student-work.student-work', {
      filters,
      limit: 20,
    })

    return works.map((work: any) => {
      const title = work.studentName || ''
      const description = work.description || ''
      const excerpt = this.createExcerpt(description, query)

      return {
        id: work.id,
        type: 'student-work' as const,
        title: `${work.studentName}${work.discipline ? ` - ${work.discipline}` : ''}`,
        excerpt,
        highlights: {
          title: this.findHighlightRanges(title, query),
          excerpt: this.findHighlightRanges(excerpt, query),
        },
        meta: {
          discipline: work.discipline,
          grade: work.grade,
          loop: work.loop,
        },
        url: `/student-works/${work.id}`,
      }
    })
  },

  /**
   * Search resources
   */
  async searchResources(query: string): Promise<SearchResult[]> {
    const filters = {
      publishedAt: { $notNull: true },
      $or: [this.buildSearchFilters(query, 'title'), this.buildSearchFilters(query, 'description')],
    }

    const resources = await strapi.entityService.findMany('api::resource.resource', {
      filters,
      limit: 20,
    })

    return resources.map((resource: any) => {
      const title = resource.title || ''
      const description = resource.description || ''
      const excerpt = this.createExcerpt(description, query)

      return {
        id: resource.id,
        type: 'resource' as const,
        title,
        excerpt,
        highlights: {
          title: this.findHighlightRanges(title, query),
          excerpt: this.findHighlightRanges(excerpt, query),
        },
        meta: {
          category: resource.category,
          mediaType: resource.mediaType,
          url: resource.url,
        },
        url: `/resources/${resource.id}`,
      }
    })
  },

  /**
   * Generate search suggestions based on query
   */
  generateSuggestions(query: string, results: SearchResult[]): string[] {
    const tokens = this.segmentText(query)
    const suggestions = new Set<string>()

    // Add titles that match
    results.slice(0, 5).forEach((result) => {
      suggestions.add(result.title)
    })

    return Array.from(suggestions).slice(0, 5)
  },

  /**
   * Main search function
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    const { query, type = [], page = 1, pageSize = 20, difficulty = [] } = options

    // Validate query length (min 2 characters)
    if (!query || query.trim().length < 2) {
      return {
        results: [],
        groups: {
          lessons: [],
          knowledgeCards: [],
          studentWorks: [],
          resources: [],
        },
        suggestions: [],
        total: 0,
        page,
        pageSize,
      }
    }

    // Check cache
    const cacheKey = JSON.stringify(options)
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    // Determine which types to search
    const searchTypes =
      type.length > 0 ? type : ['lesson', 'knowledge-card', 'student-work', 'resource']

    // Execute searches in parallel
    const [lessons, knowledgeCards, studentWorks, resources] = await Promise.all([
      searchTypes.includes('lesson') ? this.searchLessons(query, difficulty) : Promise.resolve([]),
      searchTypes.includes('knowledge-card')
        ? this.searchKnowledgeCards(query)
        : Promise.resolve([]),
      searchTypes.includes('student-work') ? this.searchStudentWorks(query) : Promise.resolve([]),
      searchTypes.includes('resource') ? this.searchResources(query) : Promise.resolve([]),
    ])

    // Combine and score results
    const allResults = [...lessons, ...knowledgeCards, ...studentWorks, ...resources]

    // Generate suggestions
    const suggestions = this.generateSuggestions(query, allResults)

    // Pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedResults = allResults.slice(start, end)

    const response: SearchResponse = {
      results: paginatedResults,
      groups: {
        lessons,
        knowledgeCards,
        studentWorks,
        resources,
      },
      suggestions,
      total: allResults.length,
      page,
      pageSize,
    }

    // Cache response
    cache.set(cacheKey, {
      data: response,
      expires: Date.now() + CACHE_TTL,
    })

    return response
  },

  /**
   * Clear cache (useful for testing or manual cache invalidation)
   */
  clearCache() {
    cache.clear()
  },
})
