export const LIGHTHOUSE_BUDGETS = {
  performance: {
    minScore: 90,
    description: 'Performance score must be at least 90',
  },
  accessibility: {
    minScore: 90,
    description: 'Accessibility score must be at least 90',
  },
  bestPractices: {
    minScore: 90,
    description: 'Best Practices score must be at least 90',
  },
  seo: {
    minScore: 95,
    description: 'SEO score must be at least 95',
  },
  metrics: {
    interactive: {
      maxValue: 3500,
      description: 'Time to Interactive should be under 3.5s',
    },
    firstContentfulPaint: {
      maxValue: 2000,
      description: 'First Contentful Paint should be under 2s',
    },
    largestContentfulPaint: {
      maxValue: 2500,
      description: 'Largest Contentful Paint should be under 2.5s',
    },
    totalBlockingTime: {
      maxValue: 200,
      description: 'Total Blocking Time should be under 200ms',
    },
    cumulativeLayoutShift: {
      maxValue: 0.1,
      description: 'Cumulative Layout Shift should be under 0.1',
    },
    speedIndex: {
      maxValue: 3000,
      description: 'Speed Index should be under 3s',
    },
  },
}

export const TEST_ROUTES = [
  {
    name: 'Home',
    path: '/',
    description: 'Main landing page',
  },
  {
    name: 'Lesson Detail',
    path: '/lessons/example-lesson',
    description: 'Example lesson detail page',
  },
  {
    name: 'Knowledge Card',
    path: '/knowledge-cards/example-card',
    description: 'Example knowledge card page',
  },
]
