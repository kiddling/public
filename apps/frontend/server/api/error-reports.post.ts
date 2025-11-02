/**
 * Endpoint for receiving error reports from the client
 */

export interface ErrorReport {
  message: string
  stack?: string
  context?: Record<string, any>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  breadcrumbs?: Array<{ message: string; timestamp: string }>
  tags?: Record<string, string>
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  timestamp: string
  environment: string
  release?: string
  url: string
  userAgent: string
}

export default defineEventHandler(async (event) => {
  try {
    const report = await readBody<ErrorReport>(event)

    // Log the error
    console.error('[ERROR REPORT]', {
      message: report?.message,
      level: report?.level,
      environment: report?.environment,
      url: report?.url,
      timestamp: report?.timestamp,
    })

    // In production, you would:
    // 1. Store in a database
    // 2. Send to external error tracking service (Sentry, etc.)
    // 3. Send notifications for critical errors
    // 4. Aggregate for analytics

    // Example: Store in database (pseudo-code)
    // await db.errorReports.create(report)

    // Example: Send to external service
    // await sendToErrorTrackingService(report)

    // Example: Send alert for critical errors
    // if (report.level === 'fatal' || report.level === 'error') {
    //   await sendAlert(report)
    // }

    return {
      success: true,
      message: 'Error report received',
    }
  } catch (error) {
    console.error('Failed to process error report:', error)

    return {
      success: false,
      message: 'Failed to process error report',
    }
  }
})
