/**
 * ARIA Live Region Composable
 * Provides screen reader announcements for dynamic content updates
 * Complies with WCAG 2.1 AA standards
 */

import { ref } from 'vue'

type AriaPoliteness = 'polite' | 'assertive' | 'off'

interface LiveRegionOptions {
  politeness?: AriaPoliteness
  clearAfter?: number // milliseconds
}

const liveRegionContainer = ref<HTMLElement | null>(null)

/**
 * Initialize the live region container (call once in app setup)
 */
export function initAriaLiveRegion() {
  if (import.meta.server || liveRegionContainer.value) return

  const container = document.createElement('div')
  container.setAttribute('role', 'status')
  container.setAttribute('aria-live', 'polite')
  container.setAttribute('aria-atomic', 'true')
  container.className = 'sr-only'
  container.id = 'aria-live-region'
  
  document.body.appendChild(container)
  liveRegionContainer.value = container
}

/**
 * Announce a message to screen readers
 */
export function useAriaLive() {
  const announce = (
    message: string,
    options: LiveRegionOptions = {}
  ): void => {
    if (import.meta.server) return

    // Ensure live region exists
    if (!liveRegionContainer.value) {
      initAriaLiveRegion()
    }

    const { politeness = 'polite', clearAfter = 1000 } = options

    if (!liveRegionContainer.value) return

    // Update politeness level
    liveRegionContainer.value.setAttribute('aria-live', politeness)

    // Set message
    liveRegionContainer.value.textContent = message

    // Clear after timeout
    if (clearAfter > 0) {
      setTimeout(() => {
        if (liveRegionContainer.value) {
          liveRegionContainer.value.textContent = ''
        }
      }, clearAfter)
    }
  }

  const announcePolite = (message: string): void => {
    announce(message, { politeness: 'polite' })
  }

  const announceAssertive = (message: string): void => {
    announce(message, { politeness: 'assertive' })
  }

  const clear = (): void => {
    if (liveRegionContainer.value) {
      liveRegionContainer.value.textContent = ''
    }
  }

  return {
    announce,
    announcePolite,
    announceAssertive,
    clear,
  }
}
