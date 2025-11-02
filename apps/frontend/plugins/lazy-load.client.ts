/**
 * Lazy Load Plugin
 *
 * Provides a v-lazy-load directive for deferring loading of non-critical media
 * using IntersectionObserver for optimal performance
 */

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy-load', {
    mounted(el: HTMLElement, binding) {
      // Options for intersection observer
      const options = {
        root: binding.value?.root || null,
        rootMargin: binding.value?.rootMargin || '50px',
        threshold: binding.value?.threshold || 0.01,
      }

      // Callback when element enters viewport
      const callback: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement

            // Load images
            if (target.tagName === 'IMG' && target.dataset.src) {
              const img = target as HTMLImageElement
              img.src = img.dataset.src
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset
              }
              delete img.dataset.src
              delete img.dataset.srcset
            }

            // Load background images
            if (target.dataset.bg) {
              target.style.backgroundImage = `url('${target.dataset.bg}')`
              delete target.dataset.bg
            }

            // Load iframes
            if (target.tagName === 'IFRAME' && target.dataset.src) {
              const iframe = target as HTMLIFrameElement
              iframe.src = iframe.dataset.src
              delete iframe.dataset.src
            }

            // Execute custom load function if provided
            if (binding.value?.onLoad) {
              binding.value.onLoad(target)
            }

            // Add loaded class
            target.classList.add('lazy-loaded')

            // Stop observing this element
            observer.unobserve(target)
          }
        })
      }

      // Create and start observing
      const observer = new IntersectionObserver(callback, options)
      observer.observe(el)

      // Store observer on element for cleanup
      ;(el as any).__lazyLoadObserver__ = observer
    },

    unmounted(el: HTMLElement) {
      // Cleanup observer
      const observer = (el as any).__lazyLoadObserver__
      if (observer) {
        observer.disconnect()
        delete (el as any).__lazyLoadObserver__
      }
    },
  })
})
