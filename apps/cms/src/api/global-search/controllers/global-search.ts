import type { Core } from '@strapi/strapi'

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Global search endpoint
   * GET /api/global-search
   */
  async search(ctx) {
    try {
      const { query, type, page = '1', pageSize = '20', difficulty } = ctx.query

      // Validate query parameter
      if (!query || typeof query !== 'string') {
        return ctx.badRequest('Query parameter is required')
      }

      // Validate query length (minimum 2 characters)
      if (query.trim().length < 2) {
        return ctx.send({
          results: [],
          groups: {
            lessons: [],
            knowledgeCards: [],
            studentWorks: [],
            resources: [],
          },
          suggestions: [],
          total: 0,
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
        })
      }

      // Parse type parameter (can be comma-separated)
      let types: string[] = []
      if (type) {
        types = typeof type === 'string' ? type.split(',').map((t) => t.trim()) : []
      }

      // Parse difficulty parameter (can be comma-separated)
      let difficulties: string[] = []
      if (difficulty) {
        difficulties = typeof difficulty === 'string' ? difficulty.split(',').map((d) => d.trim()) : []
      }

      // Parse pagination
      const pageNum = Math.max(1, parseInt(page, 10) || 1)
      const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))

      // Execute search
      const results = await strapi
        .service('api::global-search.global-search')
        .search({
          query: query.trim(),
          type: types,
          page: pageNum,
          pageSize: pageSizeNum,
          difficulty: difficulties,
        })

      return ctx.send(results)
    } catch (error) {
      strapi.log.error('Global search error:', error)
      return ctx.internalServerError('An error occurred during search')
    }
  },

  /**
   * Clear search cache endpoint (for admin use)
   * POST /api/global-search/clear-cache
   */
  async clearCache(ctx) {
    try {
      strapi.service('api::global-search.global-search').clearCache()
      return ctx.send({ message: 'Cache cleared successfully' })
    } catch (error) {
      strapi.log.error('Clear cache error:', error)
      return ctx.internalServerError('An error occurred while clearing cache')
    }
  },
})
