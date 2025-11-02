/**
 * Global error handler plugin for Vue and unhandled promise rejections
 */

import { logger } from '~/utils/logger'
import { ErrorCode, createError } from '~/types/error'

export default defineNuxtPlugin((nuxtApp) => {
  // Vue error handler
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    logger.error('Vue error caught', {
      componentName: instance?.$options?.name || 'Unknown',
      info,
    }, error)

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      // e.g., Sentry.captureException(error)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Vue Error:', error)
      console.error('Component:', instance)
      console.error('Info:', info)
    }
  }

  // Handle unhandled promise rejections
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
      }, event.reason)

      // Prevent the default browser console error
      event.preventDefault()

      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
        // e.g., Sentry.captureException(event.reason)
      }
    })

    // Handle errors that weren't caught by error handlers
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, event.error)

      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
        // e.g., Sentry.captureException(event.error)
      }
    })

    // Handle offline/online events
    window.addEventListener('offline', () => {
      logger.warn('Network connection lost')
      nuxtApp.$router.push('/error/offline')
    })

    window.addEventListener('online', () => {
      logger.info('Network connection restored')
    })
  }

  // Provide error handling utilities
  return {
    provide: {
      handleError: (error: any, context?: string) => {
        logger.error(context || 'Error occurred', {}, error)
        
        // Show user-friendly error message
        // You can integrate with a toast/notification system here
        console.error('An error occurred:', error)
      },
    },
  }
})
