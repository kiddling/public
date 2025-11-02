/**
 * Accessibility Plugin
 * Initializes accessibility features on the client side
 */

import { initAriaLiveRegion } from '~/composables/useAriaLive'

export default defineNuxtPlugin(() => {
  // Initialize ARIA live region for screen reader announcements
  initAriaLiveRegion()

  // Add high contrast mode support
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.documentElement.classList.add('high-contrast')
  }

  // Add reduced motion support
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion')
  }

  // Listen for changes
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('high-contrast', e.matches)
  })

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduce-motion', e.matches)
  })
})
