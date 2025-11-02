/**
 * Smart Prefetch Plugin
 *
 * Optimizes resource prefetching for bandwidth-constrained environments (China)
 * - Detects connection speed
 * - Prefetches only on fast connections or when idle
 * - Respects user's data saver preferences
 */

export default defineNuxtPlugin((nuxtApp) => {
  // Check if connection API is available
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  // Determine if we should prefetch based on connection
  const shouldPrefetch = (): boolean => {
    // Respect Save-Data header
    if (connection?.saveData) {
      return false
    }

    // Check effective connection type
    const effectiveType = connection?.effectiveType
    if (effectiveType) {
      // Only prefetch on 4g or better
      return effectiveType === '4g' || effectiveType === '5g'
    }

    // Check downlink speed (Mbps)
    if (connection?.downlink) {
      // Only prefetch if > 1.5 Mbps
      return connection.downlink > 1.5
    }

    // Default to true if no connection info available
    return true
  }

  // Smart prefetch function
  const smartPrefetch = (url: string, options: { priority?: 'high' | 'low' | 'auto' } = {}) => {
    if (!shouldPrefetch()) {
      if (import.meta.dev) {
        console.log(`[Smart Prefetch] Skipping ${url} - slow connection or data saver enabled`)
      }
      return
    }

    // Use Intersection Observer for viewport-based prefetching
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'

    // Set fetchpriority if supported
    if ('fetchPriority' in link) {
      ;(link as any).fetchPriority = options.priority || 'low'
    }

    document.head.appendChild(link)

    if (import.meta.dev) {
      console.log(`[Smart Prefetch] Prefetching ${url}`)
    }
  }

  // Expose to app
  nuxtApp.provide('smartPrefetch', smartPrefetch)
  nuxtApp.provide('shouldPrefetch', shouldPrefetch)

  // Monitor connection changes
  if (connection) {
    connection.addEventListener('change', () => {
      if (import.meta.dev) {
        console.log('[Smart Prefetch] Connection changed:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData,
        })
      }
    })
  }

  // Add custom router hook for intelligent prefetching
  nuxtApp.hook('page:start', () => {
    // Cancel any pending prefetch requests on navigation start
    const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]')
    prefetchLinks.forEach((link) => {
      // Only remove dynamically added prefetch links
      if (!link.hasAttribute('data-keep')) {
        link.remove()
      }
    })
  })

  // Prefetch visible links on idle
  if ('requestIdleCallback' in window) {
    nuxtApp.hook('page:finish', () => {
      if (!shouldPrefetch()) return

      requestIdleCallback(
        () => {
          const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
                  const href = entry.target.getAttribute('href')
                  if (href && !entry.target.hasAttribute('data-no-prefetch')) {
                    smartPrefetch(href, { priority: 'low' })
                    observer.unobserve(entry.target)
                  }
                }
              })
            },
            {
              rootMargin: '50px', // Start prefetching 50px before viewport
            }
          )

          links.forEach((link) => {
            // Skip heavy pages unless explicitly marked for prefetch
            const href = link.getAttribute('href') || ''
            const isHeavyPage = ['/lessons/', '/knowledge-cards/', '/students'].some((p) =>
              href.startsWith(p)
            )

            if (!isHeavyPage || link.hasAttribute('data-prefetch')) {
              observer.observe(link)
            }
          })
        },
        { timeout: 2000 }
      )
    })
  }
})
