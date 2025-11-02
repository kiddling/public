import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildStrapiUrl } from '~/server/utils/strapi'

describe('Strapi Server Utils', () => {
  describe('buildStrapiUrl', () => {
    const baseUrl = 'http://localhost:1337'
    const endpoint = '/api/lessons'

    it('should build basic URL without options', () => {
      const url = buildStrapiUrl(baseUrl, endpoint)
      expect(url).toBe('http://localhost:1337/api/lessons')
    })

    it('should add filters to URL', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          title: { $eq: 'Test Lesson' },
        },
      })

      expect(url).toContain('filters[title][$eq]=Test%20Lesson')
    })

    it('should add nested filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          part: {
            key: { $eq: 'foundation' },
          },
        },
      })

      expect(url).toContain('filters[part][key][$eq]=foundation')
    })

    it('should add sorting', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        sort: 'order:asc',
      })

      expect(url).toContain('sort[0]=order%3Aasc')
    })

    it('should add multiple sorts', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        sort: ['order:asc', 'title:asc'],
      })

      expect(url).toContain('sort[0]=order%3Aasc')
      expect(url).toContain('sort[1]=title%3Aasc')
    })

    it('should add pagination', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        pagination: {
          page: 1,
          pageSize: 20,
        },
      })

      expect(url).toContain('pagination[page]=1')
      expect(url).toContain('pagination[pageSize]=20')
    })

    it('should add simple population', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        populate: '*',
      })

      expect(url).toContain('populate=*')
    })

    it('should add array population', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        populate: ['part', 'loop'],
      })

      expect(url).toContain('populate[0]=part')
      expect(url).toContain('populate[1]=loop')
    })

    it('should add nested population', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        populate: {
          part: '*',
          knowledge_cards: {
            populate: ['media'],
          },
        },
      })

      expect(url).toContain('populate[part]=*')
      expect(url).toContain('populate[knowledge_cards][populate][0]=media')
    })

    it('should add fields', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        fields: ['title', 'code'],
      })

      expect(url).toContain('fields[0]=title')
      expect(url).toContain('fields[1]=code')
    })

    it('should add publication state', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        publicationState: 'preview',
      })

      expect(url).toContain('publicationState=preview')
    })

    it('should add locale', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        locale: 'zh-CN',
      })

      expect(url).toContain('locale=zh-CN')
    })

    it('should handle complex query with all options', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          partKey: { $eq: 'foundation' },
          order: { $lte: 10 },
        },
        sort: ['order:asc', 'title:asc'],
        pagination: {
          page: 2,
          pageSize: 20,
        },
        populate: {
          part: '*',
          loop: '*',
        },
        fields: ['title', 'code'],
        publicationState: 'live',
        locale: 'zh-CN',
      })

      // Should contain all parameters
      expect(url).toContain('filters[partKey][$eq]=foundation')
      expect(url).toContain('filters[order][$lte]=10')
      expect(url).toContain('sort[0]=order%3Aasc')
      expect(url).toContain('pagination[page]=2')
      expect(url).toContain('populate[part]=*')
      expect(url).toContain('fields[0]=title')
      expect(url).toContain('publicationState=live')
      expect(url).toContain('locale=zh-CN')
    })

    it('should skip null and undefined values in filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          title: { $eq: 'Test' },
          code: null,
          summary: undefined,
        },
      })

      expect(url).toContain('filters[title][$eq]=Test')
      expect(url).not.toContain('code')
      expect(url).not.toContain('summary')
    })

    it('should handle array filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          type: {
            $in: ['Theory', 'Case Study'],
          },
        },
      })

      expect(url).toContain('filters[type][$in][0]=Theory')
      expect(url).toContain('filters[type][$in][1]=Case%20Study')
    })

    it('should handle OR filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          $or: [{ title: { $containsi: 'design' } }, { summary: { $containsi: 'design' } }],
        },
      })

      expect(url).toContain('filters[$or][0][title][$containsi]=design')
      expect(url).toContain('filters[$or][1][summary][$containsi]=design')
    })

    it('should handle AND filters', () => {
      const url = buildStrapiUrl(baseUrl, endpoint, {
        filters: {
          $and: [{ partKey: { $eq: 'foundation' } }, { order: { $lte: 10 } }],
        },
      })

      expect(url).toContain('filters[$and][0][partKey][$eq]=foundation')
      expect(url).toContain('filters[$and][1][order][$lte]=10')
    })
  })
})
