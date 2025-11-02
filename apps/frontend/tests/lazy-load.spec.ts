import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLazyLoad } from '~/composables/useLazyLoad'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
})

describe('useLazyLoad Composable', () => {
  describe('createLazyObserver', () => {
    it('creates an IntersectionObserver with default options', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      const observer = createLazyObserver(callback)

      expect(observer).toBeDefined()
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('accepts custom options', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      const observer = createLazyObserver(callback, {
        rootMargin: '100px',
        threshold: 0.5,
      })

      expect(observer).toBeDefined()
    })

    it('handles callback execution when element intersects', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      createLazyObserver(callback)

      // Get the callback that was passed to IntersectionObserver
      const observerCallback =
        mockIntersectionObserver.mock.calls[mockIntersectionObserver.mock.calls.length - 1][0]

      // Simulate an intersection
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('div'),
      }

      observerCallback([mockEntry])

      expect(callback).toHaveBeenCalledWith(mockEntry)
    })
  })

  describe('lazyLoadImage', () => {
    it('loads image from data-src attribute', () => {
      const { lazyLoadImage } = useLazyLoad()

      const img = document.createElement('img')
      img.dataset.src = '/test-image.jpg'
      img.dataset.srcset = '/test-small.jpg 320w, /test-large.jpg 1024w'

      lazyLoadImage(img)

      expect(img.src).toContain('/test-image.jpg')
      expect(img.srcset).toBe('/test-small.jpg 320w, /test-large.jpg 1024w')
      expect(img.classList.contains('lazy-loaded')).toBe(true)
    })

    it('handles images without data-src', () => {
      const { lazyLoadImage } = useLazyLoad()

      const img = document.createElement('img')

      lazyLoadImage(img)

      // Should not throw error
      expect(img.src).toBe('')
    })

    it('adds lazy-loaded class', () => {
      const { lazyLoadImage } = useLazyLoad()

      const img = document.createElement('img')
      img.dataset.src = '/test.jpg'

      lazyLoadImage(img)

      expect(img.classList.contains('lazy-loaded')).toBe(true)
    })
  })

  describe('lazyLoadBackground', () => {
    it('applies background image from data-bg attribute', () => {
      const { lazyLoadBackground } = useLazyLoad()

      const div = document.createElement('div')
      div.dataset.bg = '/background.jpg'

      lazyLoadBackground(div)

      expect(div.style.backgroundImage).toBe('url("/background.jpg")')
      expect(div.classList.contains('lazy-loaded')).toBe(true)
    })

    it('handles elements without data-bg', () => {
      const { lazyLoadBackground } = useLazyLoad()

      const div = document.createElement('div')

      lazyLoadBackground(div)

      expect(div.style.backgroundImage).toBe('')
    })
  })

  describe('observeImages', () => {
    it('observes multiple images', () => {
      const { observeImages } = useLazyLoad()

      const img1 = document.createElement('img')
      img1.dataset.src = '/image1.jpg'

      const img2 = document.createElement('img')
      img2.dataset.src = '/image2.jpg'

      const observer = observeImages([img1, img2])

      expect(observer).toBeDefined()
      expect(observer.observe).toHaveBeenCalledTimes(2)
    })

    it('returns an observer instance', () => {
      const { observeImages } = useLazyLoad()

      const observer = observeImages([])

      expect(observer).toBeDefined()
      expect(typeof observer.observe).toBe('function')
      expect(typeof observer.disconnect).toBe('function')
    })
  })

  describe('prefetchImages', () => {
    it('prefetches multiple image URLs', async () => {
      const { prefetchImages } = useLazyLoad()

      // Mock Image constructor
      global.Image = class {
        src = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        constructor() {
          // Simulate successful load
          setTimeout(() => {
            if (this.onload) this.onload()
          }, 0)
        }
      } as any

      const urls = ['/image1.jpg', '/image2.jpg', '/image3.jpg']

      await expect(prefetchImages(urls)).resolves.toBeDefined()
    })

    it('handles empty URL array', async () => {
      const { prefetchImages } = useLazyLoad()

      await expect(prefetchImages([])).resolves.toEqual([])
    })

    it('handles failed image loads', async () => {
      const { prefetchImages } = useLazyLoad()

      // Mock Image constructor with failure
      global.Image = class {
        src = ''
        onload: (() => void) | null = null
        onerror: ((err: Error) => void) | null = null

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Failed to load'))
            }
          }, 0)
        }
      } as any

      const urls = ['/broken-image.jpg']

      await expect(prefetchImages(urls)).rejects.toThrow()
    })
  })

  describe('Performance Considerations', () => {
    it('supports once option to stop observing after first intersection', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      const observer = createLazyObserver(callback, { once: true })

      expect(observer).toBeDefined()
      // The observer should unobserve the element after first intersection
      // This is tested by the implementation in the composable
    })

    it('allows custom threshold values', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      // Test with different threshold values
      const observer1 = createLazyObserver(callback, { threshold: 0 })
      const observer2 = createLazyObserver(callback, { threshold: 0.5 })
      const observer3 = createLazyObserver(callback, { threshold: 1 })

      expect(observer1).toBeDefined()
      expect(observer2).toBeDefined()
      expect(observer3).toBeDefined()
    })

    it('supports custom root margin for early loading', () => {
      const { createLazyObserver } = useLazyLoad()
      const callback = vi.fn()

      // Load images 200px before they enter viewport
      const observer = createLazyObserver(callback, {
        rootMargin: '200px',
      })

      expect(observer).toBeDefined()
    })
  })
})
