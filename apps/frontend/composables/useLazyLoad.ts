/**
 * Lazy Load Composable
 * 
 * Provides utilities for implementing lazy loading patterns
 * for heavy media sections like galleries and timelines
 */

interface LazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useLazyLoad() {
  /**
   * Create an intersection observer for lazy loading elements
   */
  function createLazyObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options: LazyLoadOptions = {}
  ): IntersectionObserver {
    const {
      root = null,
      rootMargin = '50px',
      threshold = 0.01,
      once = true,
    } = options

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry)
            if (once) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      { root, rootMargin, threshold }
    )

    return observer
  }

  /**
   * Lazy load images by setting data-src attribute
   */
  function lazyLoadImage(img: HTMLImageElement): void {
    if (img.dataset.src) {
      img.src = img.dataset.src
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset
      }
      img.classList.add('lazy-loaded')
    }
  }

  /**
   * Lazy load background images
   */
  function lazyLoadBackground(el: HTMLElement): void {
    if (el.dataset.bg) {
      el.style.backgroundImage = `url('${el.dataset.bg}')`
      el.classList.add('lazy-loaded')
    }
  }

  /**
   * Batch lazy load multiple images
   */
  function observeImages(
    images: HTMLImageElement[],
    options?: LazyLoadOptions
  ): IntersectionObserver {
    const observer = createLazyObserver((entry) => {
      lazyLoadImage(entry.target as HTMLImageElement)
    }, options)

    images.forEach((img) => observer.observe(img))
    return observer
  }

  /**
   * Prefetch images for smoother transitions
   */
  function prefetchImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load ${url}`))
          img.src = url
        })
      })
    )
  }

  return {
    createLazyObserver,
    lazyLoadImage,
    lazyLoadBackground,
    observeImages,
    prefetchImages,
  }
}
