import type { AnalyticsStats } from '~/types/analytics'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const timeRange = (query.timeRange as string) || '7d' // 24h, 7d, 30d, all

    const stats = await getAnalyticsStats(timeRange)

    return stats
  } catch (error) {
    console.error('Analytics stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analytics stats',
    })
  }
})

async function getAnalyticsStats(timeRange: string): Promise<AnalyticsStats> {
  const dbPath = process.env.ANALYTICS_DB_PATH || './data/analytics.db'

  try {
    const Database = (await import('better-sqlite3')).default
    const db = new Database(dbPath, { readonly: true })

    // Calculate time filter
    const now = Date.now()
    let timeFilter = 0

    switch (timeRange) {
      case '24h':
        timeFilter = now - 24 * 60 * 60 * 1000
        break
      case '7d':
        timeFilter = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        timeFilter = now - 30 * 24 * 60 * 60 * 1000
        break
      default:
        timeFilter = 0
    }

    // Get total events
    const totalEventsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE timestamp >= ?
    `).get(timeFilter) as { count: number }

    // Get total sessions
    const totalSessionsResult = db.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM analytics_events
      WHERE timestamp >= ?
    `).get(timeFilter) as { count: number }

    // Get unique users
    const uniqueUsersResult = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM analytics_events
      WHERE user_id IS NOT NULL AND timestamp >= ?
    `).get(timeFilter) as { count: number }

    // Get average session duration
    const avgDurationResult = db.prepare(`
      SELECT AVG(duration) as avg
      FROM analytics_sessions
      WHERE duration IS NOT NULL AND start_time >= ?
    `).get(timeFilter) as { avg: number | null }

    // Get popular pages
    const popularPages = db.prepare(`
      SELECT 
        page_path as path,
        COUNT(*) as views,
        AVG(dwell_time) as avgDwellTime
      FROM analytics_page_views
      WHERE timestamp >= ?
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `).all(timeFilter) as Array<{ path: string; views: number; avgDwellTime: number | null }>

    // Get popular courses
    const popularCourses = db.prepare(`
      SELECT 
        json_extract(data, '$.courseId') as id,
        json_extract(data, '$.courseTitle') as title,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_type = 'course_browse' AND timestamp >= ?
      GROUP BY id
      ORDER BY views DESC
      LIMIT 10
    `).all(timeFilter) as Array<{ id: string; title: string | null; views: number }>

    // Get search queries
    const searchQueries = db.prepare(`
      SELECT 
        query,
        COUNT(*) as count
      FROM analytics_searches
      WHERE timestamp >= ?
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `).all(timeFilter) as Array<{ query: string; count: number }>

    // Get downloads
    const downloads = db.prepare(`
      SELECT 
        json_extract(data, '$.resourceName') as resourceName,
        COUNT(*) as count
      FROM analytics_events
      WHERE event_type = 'download' AND timestamp >= ?
      GROUP BY resourceName
      ORDER BY count DESC
      LIMIT 10
    `).all(timeFilter) as Array<{ resourceName: string; count: number }>

    db.close()

    return {
      totalEvents: totalEventsResult.count,
      totalSessions: totalSessionsResult.count,
      uniqueUsers: uniqueUsersResult.count,
      avgSessionDuration: avgDurationResult.avg || 0,
      popularPages: popularPages.map(p => ({
        path: p.path,
        views: p.views,
        avgDwellTime: p.avgDwellTime || 0,
      })),
      popularCourses: popularCourses.map(c => ({
        id: c.id,
        title: c.title || 'Unknown',
        views: c.views,
      })),
      searchQueries: searchQueries,
      downloads: downloads,
    }
  } catch (error: any) {
    // Return empty stats if database doesn't exist yet
    if (error.code === 'SQLITE_CANTOPEN') {
      return {
        totalEvents: 0,
        totalSessions: 0,
        uniqueUsers: 0,
        avgSessionDuration: 0,
        popularPages: [],
        popularCourses: [],
        searchQueries: [],
        downloads: [],
      }
    }
    throw error
  }
}
