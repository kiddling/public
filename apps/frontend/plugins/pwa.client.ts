export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('Cache updated:', event.data.url)
      }
    })

    window.addEventListener('online', () => {
      console.log('Network connection restored')
    })

    window.addEventListener('offline', () => {
      console.log('Network connection lost')
    })
  }
})
