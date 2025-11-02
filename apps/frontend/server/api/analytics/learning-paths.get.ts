import type { LearningPath } from '~/types/analytics'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const sessionId = query.sessionId as string | undefined
    const limit = parseInt(query.limit as string || '10', 10)

    const paths = await getLearningPaths(sessionId, limit)

    return paths
  } catch (error) {
    console.error('Learning paths error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch learning paths',
    })
  }
})

async function getLearningPaths(sessionId?: string, limit: number = 10): Promise<LearningPath[]> {
  const dbPath = process.env.ANALYTICS_DB_PATH || './data/analytics.db'

  try {
    const Database = (await import('better-sqlite3')).default
    const db = new Database(dbPath, { readonly: true })

    let query = `
      SELECT 
        session_id,
        user_id,
        data
      FROM analytics_events
      WHERE event_type IN ('course_browse', 'progress_mark', 'difficulty_switch')
    `

    const params: any[] = []

    if (sessionId) {
      query += ' AND session_id = ?'
      params.push(sessionId)
    }

    query += ' ORDER BY timestamp ASC'

    if (!sessionId) {
      query += ' LIMIT ?'
      params.push(limit * 100) // Get more events to group by session
    }

    const events = db.prepare(query).all(...params) as Array<{
      session_id: string
      user_id: string | null
      data: string
    }>

    // Group events by session
    const sessionMap = new Map<string, LearningPath>()

    for (const event of events) {
      const data = JSON.parse(event.data)
      
      if (!sessionMap.has(event.session_id)) {
        sessionMap.set(event.session_id, {
          userId: event.user_id || undefined,
          sessionId: event.session_id,
          path: [],
          completedLessons: [],
          difficultPoints: [],
        })
      }

      const path = sessionMap.get(event.session_id)!

      if (data.eventType === 'course_browse' && data.lessonId) {
        // Check if lesson already in path
        const existingIndex = path.path.findIndex(p => p.lessonId === data.lessonId)
        if (existingIndex === -1) {
          path.path.push({
            lessonId: data.lessonId,
            timestamp: data.timestamp,
          })
        } else {
          // Update dwell time
          const existing = path.path[existingIndex]
          if (existing.dwellTime === undefined) {
            existing.dwellTime = data.timestamp - existing.timestamp
          }
        }
      }

      if (data.eventType === 'progress_mark' && data.completed) {
        if (!path.completedLessons.includes(data.lessonId)) {
          path.completedLessons.push(data.lessonId)
        }
      }

      if (data.eventType === 'difficulty_switch') {
        const existing = path.difficultPoints.find(d => d.lessonId === data.lessonId)
        if (existing) {
          existing.switchCount++
        } else {
          path.difficultPoints.push({
            lessonId: data.lessonId,
            switchCount: 1,
          })
        }
      }
    }

    db.close()

    const paths = Array.from(sessionMap.values())
    return sessionId ? paths : paths.slice(0, limit)
  } catch (error: any) {
    if (error.code === 'SQLITE_CANTOPEN') {
      return []
    }
    throw error
  }
}
