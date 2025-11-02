/**
 * Focus Trap Composable
 * Traps focus within a container element for modal dialogs and overlays
 * Complies with WCAG 2.1 AA standards for keyboard navigation
 */

import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',')

export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  isActive: Ref<boolean>,
  options: {
    initialFocus?: Ref<HTMLElement | null>
    returnFocus?: boolean
  } = {}
) {
  const { returnFocus = true } = options
  const previouslyFocusedElement = ref<HTMLElement | null>(null)

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    )
    return elements.filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    )
  }

  const trapFocus = (event: KeyboardEvent) => {
    if (!containerRef.value || !isActive.value) return

    const focusableElements = getFocusableElements(containerRef.value)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }

  const activate = () => {
    if (!containerRef.value) return

    // Store currently focused element
    previouslyFocusedElement.value = document.activeElement as HTMLElement

    // Set initial focus
    if (options.initialFocus?.value) {
      options.initialFocus.value.focus()
    } else {
      const focusableElements = getFocusableElements(containerRef.value)
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus()
      }
    }

    // Add keyboard event listener
    document.addEventListener('keydown', trapFocus)
  }

  const deactivate = () => {
    // Remove keyboard event listener
    document.removeEventListener('keydown', trapFocus)

    // Return focus to previously focused element
    if (returnFocus && previouslyFocusedElement.value) {
      previouslyFocusedElement.value.focus()
      previouslyFocusedElement.value = null
    }
  }

  // Watch for activation/deactivation
  watch(
    isActive,
    (active) => {
      if (active) {
        // Use nextTick to ensure DOM is ready
        setTimeout(activate, 0)
      } else {
        deactivate()
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (isActive.value) {
      deactivate()
    }
  })

  return {
    activate,
    deactivate,
  }
}
