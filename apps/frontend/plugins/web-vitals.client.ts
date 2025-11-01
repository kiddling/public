import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

// Performance budgets (target thresholds)
const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // Largest Contentful Paint
  FCP: 1500,  // First Contentful Paint
  CLS: 0.1,   // Cumulative Layout Shift
  FID: 100,   // First Input Delay
  INP: 200,   // Interaction to Next Paint
  TTFB: 600,  // Time to First Byte
};

export default defineNuxtPlugin(() => {
  const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';
  const metricsStore: Record<string, number> = {};

  function checkPerformanceBudget(metric: Metric) {
    const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
    if (budget && metric.value > budget) {
      console.warn(
        `[Performance Budget] ${metric.name} exceeded budget:`,
        `${metric.value.toFixed(2)}ms > ${budget}ms`,
        `(${metric.rating})`
      );
    }
  }

  function sendToAnalytics(metric: Metric) {
    const body = {
      dsn: 'nuxt-strapi-monorepo',
      id: metric.id,
      page: window.location.pathname,
      href: window.location.href,
      event_name: metric.name,
      value: metric.value.toString(),
      rating: metric.rating,
      speed: navigator.connection && (navigator.connection as any).effectiveType,
    };

    // Store metric for summary
    metricsStore[metric.name] = metric.value;

    // Check performance budgets
    checkPerformanceBudget(metric);

    if (process.dev) {
      console.log(
        `[Web Vitals] ${metric.name}:`,
        `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
        `(${metric.rating})`
      );
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

  // Log summary on page unload (development only)
  if (process.dev) {
    window.addEventListener('beforeunload', () => {
      console.log('[Web Vitals Summary]', metricsStore);
    });
  }

  // Expose metrics for debugging
  if (process.dev) {
    (window as any).__webVitals = metricsStore;
  }
});
