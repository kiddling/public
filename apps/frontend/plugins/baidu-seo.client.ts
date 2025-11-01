export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Inject Baidu site verification meta tag if configured
  if (config.public.baiduSiteVerification) {
    useHead({
      meta: [
        {
          name: 'baidu-site-verification',
          content: config.public.baiduSiteVerification,
        },
      ],
    })
  }
})
