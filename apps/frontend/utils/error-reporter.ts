/**
 * Error reporting service integration
 * This is a placeholder that can be integrated with services like:
 * - Sentry (international)
 * - FunDebug (China)
 * - Fundebug (China)
 * - BetterStack (international)
 */

import { logger } from './logger'
import type { AppError } from '~/types/error'

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

class ErrorReporter {
  private enabled: boolean = false
  private endpoint: string = ''
  private apiKey: string = ''
  private environment: string = 'production'
  private release?: string

  init(config: {
    enabled?: boolean
    endpoint?: string
    apiKey?: string
    environment?: string
    release?: string
  }) {
    this.enabled = config.enabled ?? (process.env.NODE_ENV === 'production')
    this.endpoint = config.endpoint || '/api/error-reports'
    this.apiKey = config.apiKey || ''
    this.environment = config.environment || process.env.NODE_ENV || 'production'
    this.release = config.release
  }

  async captureException(
    error: Error | AppError | unknown,
    context?: Record<string, any>,
    level: ErrorReport['level'] = 'error'
  ): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      const report = this.buildErrorReport(error, context, level)
      await this.sendReport(report)
    } catch (err) {
      logger.error('Failed to send error report', {}, err)
    }
  }

  async captureMessage(
    message: string,
    context?: Record<string, any>,
    level: ErrorReport['level'] = 'info'
  ): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      const report: ErrorReport = {
        message,
        context,
        level,
        timestamp: new Date().toISOString(),
        environment: this.environment,
        release: this.release,
        url: process.client ? window.location.href : '',
        userAgent: process.client ? navigator.userAgent : '',
        breadcrumbs: logger.getBreadcrumbs(),
      }

      await this.sendReport(report)
    } catch (err) {
      logger.error('Failed to send message report', {}, err)
    }
  }

  private buildErrorReport(
    error: any,
    context?: Record<string, any>,
    level: ErrorReport['level'] = 'error'
  ): ErrorReport {
    const message = error?.message || String(error)
    const stack = error?.stack

    return {
      message,
      stack,
      context: {
        ...context,
        errorCode: error?.code,
        statusCode: error?.statusCode,
      },
      breadcrumbs: logger.getBreadcrumbs(),
      level,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      url: process.client ? window.location.href : '',
      userAgent: process.client ? navigator.userAgent : '',
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    if (!this.endpoint) {
      logger.warn('Error reporter endpoint not configured')
      return
    }

    try {
      // Send to custom endpoint
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
        },
        body: JSON.stringify(report),
      })

      logger.debug('Error report sent successfully', { message: report.message })
    } catch (err) {
      logger.error('Failed to send error report to endpoint', {}, err)
    }
  }

  setUser(user: ErrorReport['user']) {
    // Store user info for including in future reports
    // This is a simplified version - in a real app, you'd want to store this properly
    if (process.client) {
      try {
        sessionStorage.setItem('error-reporter-user', JSON.stringify(user))
      } catch (err) {
        logger.warn('Failed to store user info', {}, err)
      }
    }
  }

  addTag(key: string, value: string) {
    // Add tags for categorizing errors
    // Implementation depends on your error tracking service
  }
}

const errorReporter = new ErrorReporter()

// Initialize with default config
if (process.env.NODE_ENV === 'production') {
  errorReporter.init({
    enabled: true,
    environment: process.env.NODE_ENV,
  })
}

export { errorReporter }

// Composable for Vue components
export function useErrorReporter() {
  return {
    captureException: errorReporter.captureException.bind(errorReporter),
    captureMessage: errorReporter.captureMessage.bind(errorReporter),
    setUser: errorReporter.setUser.bind(errorReporter),
  }
}
