export const useBaiduAnalytics = () => {
  const config = useRuntimeConfig()
  const baiduId = config.public.baiduAnalyticsId

  if (!baiduId || process.server) {
    return
  }

  const consentGiven = useState<boolean>('analytics-consent', () => {
    if (process.client) {
      const stored = localStorage.getItem('analytics-consent')
      return stored === 'true'
    }
    return false
  })

  const loadBaiduAnalytics = () => {
    if (!consentGiven.value || !process.client) {
      return
    }

    const script = document.createElement('script')
    script.innerHTML = `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `
    document.head.appendChild(script)
  }

  const giveConsent = () => {
    if (process.client) {
      localStorage.setItem('analytics-consent', 'true')
      consentGiven.value = true
      loadBaiduAnalytics()
    }
  }

  const revokeConsent = () => {
    if (process.client) {
      localStorage.setItem('analytics-consent', 'false')
      consentGiven.value = false
    }
  }

  onMounted(() => {
    if (consentGiven.value) {
      loadBaiduAnalytics()
    }
  })

  return {
    consentGiven: readonly(consentGiven),
    giveConsent,
    revokeConsent
  }
}
