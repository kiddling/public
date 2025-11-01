export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { onAnalyticsInit } = useCookieConsent()

  // Initialize analytics only after user consent
  onAnalyticsInit(() => {
    // Priority 1: Baidu Tongji Analytics
    if (config.public.baiduAnalyticsId) {
      initBaiduTongji(config.public.baiduAnalyticsId)
    }
    // Fallback: Umami Analytics
    else if (config.public.umamiWebsiteId && config.public.umamiScriptUrl) {
      initUmami(config.public.umamiWebsiteId, config.public.umamiScriptUrl)
    }
  })
})

/**
 * Initialize Baidu Tongji (百度统计) Analytics
 */
function initBaiduTongji(analyticsId: string) {
  if (typeof window === 'undefined') return

  try {
    // Create _hmt array for Baidu Tongji
    const _hmt = (window as any)._hmt || []
    ;(window as any)._hmt = _hmt

    // Create and inject script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://hm.baidu.com/hm.js?${analyticsId}`
    
    script.onerror = () => {
      console.error('Failed to load Baidu Tongji analytics')
    }

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode?.insertBefore(script, firstScript)

    console.log('Baidu Tongji analytics initialized')
  } catch (error) {
    console.error('Error initializing Baidu Tongji:', error)
  }
}

/**
 * Initialize Umami Analytics (privacy-friendly alternative)
 */
function initUmami(websiteId: string, scriptUrl: string) {
  if (typeof window === 'undefined') return

  try {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = scriptUrl
    script.setAttribute('data-website-id', websiteId)
    script.setAttribute('data-auto-track', 'true')
    script.setAttribute('data-do-not-track', 'false')
    
    script.onerror = () => {
      console.error('Failed to load Umami analytics')
    }

    document.head.appendChild(script)

    console.log('Umami analytics initialized')
  } catch (error) {
    console.error('Error initializing Umami:', error)
  }
}
