/**
 * Mock Strapi Server for E2E Testing
 * Provides fixture-based responses for all Strapi API endpoints
 */

import { createApp, createRouter, eventHandler, toNodeListener } from 'h3'
import { createServer, Server } from 'http'
import type { AddressInfo } from 'net'
import { lessonsFixture } from '../fixtures/lessons'
import { navigationFixture } from '../fixtures/navigation'
import { resourcesFixture } from '../fixtures/resources'
import { studentWorksFixture } from '../fixtures/student-works'
import { designLogTemplatesFixture } from '../fixtures/design-log-templates'
import { knowledgeCardsFixture } from '../fixtures/knowledge-cards'

export class StrapiMockServer {
  private server: Server | null = null
  private port: number
  public url: string = ''

  constructor(port: number = 3457) {
    this.port = port
  }

  async start(): Promise<void> {
    const app = createApp()
    const router = createRouter()

    // Health check endpoint
    router.get(
      '/health',
      eventHandler(() => ({ status: 'ok' }))
    )

    // Lessons endpoints
    router.get(
      '/api/lessons',
      eventHandler((event) => {
        const query = new URL(event.node.req.url || '', 'http://localhost').searchParams
        const slug = query.get('filters[slug][$eq]')

        if (slug) {
          // Filter by slug for single lesson
          const lesson = lessonsFixture.data.find((l) => l.attributes.slug === slug)
          return lesson ? { data: [lesson] } : { data: [] }
        }

        return lessonsFixture
      })
    )

    router.get(
      '/api/lessons/:id',
      eventHandler((event) => {
        const id = parseInt(event.context.params?.id || '0')
        const lesson = lessonsFixture.data.find((l) => l.id === id)
        return lesson ? { data: lesson } : { data: null }
      })
    )

    // Navigation endpoint
    router.get(
      '/api/navigation',
      eventHandler(() => navigationFixture)
    )

    // Resources endpoints
    router.get(
      '/api/resources',
      eventHandler((event) => {
        const query = new URL(event.node.req.url || '', 'http://localhost').searchParams
        const category = query.get('filters[category][$eq]')

        if (category) {
          const filtered = resourcesFixture.data.filter((r) => r.attributes.category === category)
          return { data: filtered }
        }

        return resourcesFixture
      })
    )

    // Student works endpoints
    router.get(
      '/api/student-works',
      eventHandler((event) => {
        const query = new URL(event.node.req.url || '', 'http://localhost').searchParams
        const grade = query.get('filters[gradeLevel][$eq]')
        const medium = query.get('filters[medium][$eq]')

        let filtered = studentWorksFixture.data

        if (grade) {
          filtered = filtered.filter((w) => w.attributes.gradeLevel === grade)
        }
        if (medium) {
          filtered = filtered.filter((w) => w.attributes.medium === medium)
        }

        return { data: filtered, meta: { pagination: { total: filtered.length } } }
      })
    )

    // Design log templates endpoint
    router.get(
      '/api/design-log-templates',
      eventHandler(() => designLogTemplatesFixture)
    )

    // Knowledge cards endpoint
    router.get(
      '/api/knowledge-cards',
      eventHandler((event) => {
        const query = new URL(event.node.req.url || '', 'http://localhost').searchParams
        const search = query.get('filters[$or][0][title][$containsi]')

        if (search) {
          const filtered = knowledgeCardsFixture.data.filter(
            (k) =>
              k.attributes.title.toLowerCase().includes(search.toLowerCase()) ||
              k.attributes.description?.toLowerCase().includes(search.toLowerCase())
          )
          return { data: filtered }
        }

        return knowledgeCardsFixture
      })
    )

    // Design log save endpoint (POST)
    router.post(
      '/api/design-logs',
      eventHandler(async (event) => {
        // Mock successful save
        return {
          data: {
            id: Math.floor(Math.random() * 1000),
            attributes: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }
      })
    )

    // Upload endpoint (for design log attachments)
    router.post(
      '/api/upload',
      eventHandler(async () => {
        return [
          {
            id: Math.floor(Math.random() * 1000),
            url: '/mock-upload.jpg',
            name: 'mock-file.jpg',
          },
        ]
      })
    )

    // Catch-all for unhandled routes
    router.get(
      '/**',
      eventHandler(() => {
        return { data: [], meta: {} }
      })
    )

    app.use(router)

    // Create HTTP server
    this.server = createServer(toNodeListener(app))

    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server not initialized'))
        return
      }

      this.server.listen(this.port, () => {
        const address = this.server?.address() as AddressInfo
        this.url = `http://localhost:${address.port}`
        console.log(`[Mock Strapi] Server running at ${this.url}`)
        resolve()
      })

      this.server.on('error', (error) => {
        console.error('[Mock Strapi] Server error:', error)
        reject(error)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            console.error('[Mock Strapi] Error stopping server:', err)
            reject(err)
          } else {
            console.log('[Mock Strapi] Server stopped')
            resolve()
          }
        })
      })
    }
  }
}
