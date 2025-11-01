import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

export default defineNuxtPlugin(() => {
  const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

  function sendToAnalytics(metric: Metric) {
    const body = {
      dsn: 'nuxt-strapi-monorepo',
      id: metric.id,
      page: window.location.pathname,
      href: window.location.href,
      event_name: metric.name,
      value: metric.value.toString(),
      speed: navigator.connection && (navigator.connection as any).effectiveType,
    };

    if (process.dev) {
      console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
    }

    // Send to analytics endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, JSON.stringify(body));
    } else {
      fetch(vitalsUrl, {
        body: JSON.stringify(body),
        method: 'POST',
        keepalive: true,
      }).catch((err) => {
        console.error('[Web Vitals] Failed to send:', err);
      });
    }
  }

  // Register all Web Vitals metrics
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
});
