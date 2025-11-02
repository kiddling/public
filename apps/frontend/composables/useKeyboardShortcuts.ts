/**
 * Keyboard Shortcuts Composable
 * Centralized keyboard shortcut management for accessibility
 */

import { onMounted, onBeforeUnmount } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: (event: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.alt ? event.altKey : !event.altKey
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault()
        shortcut.handler(event)
        break
      }
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      document.addEventListener('keydown', handleKeyDown)
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })
}

/**
 * Global keyboard shortcuts for the application
 */
export function useGlobalShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      meta: true,
      handler: () => {
        // Open global search
        const event = new CustomEvent('open-global-search')
        window.dispatchEvent(event)
      },
      description: '打开全局搜索',
    },
    {
      key: '/',
      handler: (event) => {
        // Focus search if not in input
        const target = event.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          const event = new CustomEvent('open-global-search')
          window.dispatchEvent(event)
        }
      },
      description: '快速搜索',
    },
    {
      key: 'Escape',
      handler: () => {
        // Close any open modals or overlays
        const event = new CustomEvent('close-all-modals')
        window.dispatchEvent(event)
      },
      description: '关闭模态框',
    },
    {
      key: 'h',
      meta: true,
      handler: () => {
        router.push('/')
      },
      description: '返回首页',
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return {
    shortcuts,
  }
}
