import { z } from 'zod'
import type { AnalyticsEventBatch } from '~/types/analytics'

// Validation schemas
const BaseEventSchema = z.object({
  eventType: z.string(),
  timestamp: z.number(),
  sessionId: z.string(),
  userId: z.string().optional(),
  url: z.string(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
})

const PageViewEventSchema = BaseEventSchema.extend({
  eventType: z.literal('page_view'),
  pageTitle: z.string(),
  pagePath: z.string(),
  dwellTime: z.number().optional(),
})

const CourseBrowseEventSchema = BaseEventSchema.extend({
  eventType: z.literal('course_browse'),
  courseId: z.string(),
  courseTitle: z.string().optional(),
  lessonId: z.string().optional(),
  lessonTitle: z.string().optional(),
})

const DifficultySwitchEventSchema = BaseEventSchema.extend({
  eventType: z.literal('difficulty_switch'),
  lessonId: z.string(),
  fromDifficulty: z.string(),
  toDifficulty: z.string(),
})

const ProgressMarkEventSchema = BaseEventSchema.extend({
  eventType: z.literal('progress_mark'),
  lessonId: z.string(),
  lessonTitle: z.string().optional(),
  completed: z.boolean(),
})

const SearchEventSchema = BaseEventSchema.extend({
  eventType: z.literal('search'),
  query: z.string(),
  resultsCount: z.number().optional(),
  selectedResultIndex: z.number().optional(),
  selectedResultId: z.string().optional(),
})

const DownloadEventSchema = BaseEventSchema.extend({
  eventType: z.literal('download'),
  resourceId: z.string(),
  resourceName: z.string(),
  resourceType: z.string(),
  fileFormat: z.string().optional(),
})

const InteractionEventSchema = BaseEventSchema.extend({
  eventType: z.enum(['expand', 'filter', 'navigation_click']),
  elementId: z.string().optional(),
  elementType: z.string().optional(),
  action: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const SessionEventSchema = BaseEventSchema.extend({
  eventType: z.enum(['session_start', 'session_end']),
  sessionDuration: z.number().optional(),
})

const AnalyticsEventSchema = z.discriminatedUnion('eventType', [
  PageViewEventSchema,
  CourseBrowseEventSchema,
  DifficultySwitchEventSchema,
  ProgressMarkEventSchema,
  SearchEventSchema,
  DownloadEventSchema,
  InteractionEventSchema,
  SessionEventSchema,
])

const EventBatchSchema = z.object({
  events: z.array(AnalyticsEventSchema),
  batchId: z.string(),
  timestamp: z.number(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate the request body
    const validatedBatch = EventBatchSchema.parse(body)

    // Store events in database
    await storeAnalyticsEvents(validatedBatch)

    return {
      success: true,
      eventsProcessed: validatedBatch.events.length,
    }
  } catch (error) {
    console.error('Analytics tracking error:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid event data',
        data: error.errors,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process analytics events',
    })
  }
})

// Store analytics events in database
async function storeAnalyticsEvents(batch: AnalyticsEventBatch) {
  const dbPath = process.env.ANALYTICS_DB_PATH || './data/analytics.db'
  
  // Ensure data directory exists
  const { mkdir } = await import('fs/promises')
  const { dirname } = await import('path')
  await mkdir(dirname(dbPath), { recursive: true })

  // Use better-sqlite3 for storage
  const Database = (await import('better-sqlite3')).default
  const db = new Database(dbPath)

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_id TEXT,
      timestamp INTEGER NOT NULL,
      url TEXT,
      referrer TEXT,
      user_agent TEXT,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_event_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_session_id ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_user_id ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON analytics_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_created_at ON analytics_events(created_at);

    CREATE TABLE IF NOT EXISTS analytics_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      user_id TEXT,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration INTEGER,
      page_views INTEGER DEFAULT 0,
      events_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_session_session_id ON analytics_sessions(session_id);
    CREATE INDEX IF NOT EXISTS idx_session_user_id ON analytics_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_session_start_time ON analytics_sessions(start_time);

    CREATE TABLE IF NOT EXISTS analytics_page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id TEXT,
      page_path TEXT NOT NULL,
      page_title TEXT,
      dwell_time INTEGER,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_page_views_path ON analytics_page_views(page_path);
    CREATE INDEX IF NOT EXISTS idx_page_views_session ON analytics_page_views(session_id);

    CREATE TABLE IF NOT EXISTS analytics_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id TEXT,
      query TEXT NOT NULL,
      results_count INTEGER,
      selected_result_id TEXT,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_searches_query ON analytics_searches(query);
  `)

  // Insert events
  const insertStmt = db.prepare(`
    INSERT INTO analytics_events (
      batch_id, event_type, session_id, user_id, timestamp, url, referrer, user_agent, data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((events) => {
    for (const event of events) {
      insertStmt.run(
        batch.batchId,
        event.eventType,
        event.sessionId,
        event.userId || null,
        event.timestamp,
        event.url,
        event.referrer || null,
        event.userAgent || null,
        JSON.stringify(event)
      )

      // Store specific event types in dedicated tables
      if (event.eventType === 'page_view') {
        const pageViewStmt = db.prepare(`
          INSERT INTO analytics_page_views (session_id, user_id, page_path, page_title, dwell_time, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        pageViewStmt.run(
          event.sessionId,
          event.userId || null,
          event.pagePath,
          event.pageTitle,
          event.dwellTime || null,
          event.timestamp
        )
      }

      if (event.eventType === 'search') {
        const searchStmt = db.prepare(`
          INSERT INTO analytics_searches (session_id, user_id, query, results_count, selected_result_id, timestamp)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        searchStmt.run(
          event.sessionId,
          event.userId || null,
          event.query,
          event.resultsCount || null,
          event.selectedResultId || null,
          event.timestamp
        )
      }

      // Update session data
      if (event.eventType === 'session_start') {
        const sessionStmt = db.prepare(`
          INSERT INTO analytics_sessions (session_id, user_id, start_time)
          VALUES (?, ?, ?)
          ON CONFLICT(session_id) DO UPDATE SET
            start_time = MIN(start_time, excluded.start_time),
            updated_at = strftime('%s', 'now')
        `)
        sessionStmt.run(event.sessionId, event.userId || null, event.timestamp)
      }

      if (event.eventType === 'session_end') {
        const sessionEndStmt = db.prepare(`
          UPDATE analytics_sessions
          SET end_time = ?, duration = ? - start_time, updated_at = strftime('%s', 'now')
          WHERE session_id = ?
        `)
        sessionEndStmt.run(event.timestamp, event.timestamp, event.sessionId)
      }

      // Update session event count
      const updateSessionStmt = db.prepare(`
        UPDATE analytics_sessions
        SET events_count = events_count + 1, updated_at = strftime('%s', 'now')
        WHERE session_id = ?
      `)
      updateSessionStmt.run(event.sessionId)

      // Update page view count
      if (event.eventType === 'page_view') {
        const updatePageViewStmt = db.prepare(`
          UPDATE analytics_sessions
          SET page_views = page_views + 1, updated_at = strftime('%s', 'now')
          WHERE session_id = ?
        `)
        updatePageViewStmt.run(event.sessionId)
      }
    }
  })

  insertMany(batch.events)

  db.close()
}
