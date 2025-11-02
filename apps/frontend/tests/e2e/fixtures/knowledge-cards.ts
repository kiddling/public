/**
 * Mock Knowledge Cards Data for E2E Tests
 */

export const knowledgeCardsFixture = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Line Types',
        description: 'Different types of lines in art',
        content: 'Straight, curved, broken, and implied lines',
        category: 'fundamentals',
        keywords: ['line', '线条', 'drawing', 'basics'],
        relatedLessons: ['P-00', 'P-01'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 2,
      attributes: {
        title: 'Color Wheel',
        description: 'Understanding the color wheel',
        content: 'Primary, secondary, and tertiary colors arrangement',
        category: 'color-theory',
        keywords: ['color', '颜色', 'wheel', 'theory'],
        relatedLessons: ['PA-01'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 3,
      attributes: {
        title: 'Rule of Thirds',
        description: 'Compositional guideline',
        content: 'Divide canvas into thirds for balanced composition',
        category: 'composition',
        keywords: ['composition', '构图', 'balance', 'design'],
        relatedLessons: ['PA-02'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 4,
      attributes: {
        title: 'Perspective Basics',
        description: 'Introduction to perspective drawing',
        content: 'One-point, two-point, and three-point perspective',
        category: 'perspective',
        keywords: ['perspective', '透视', 'depth', '深度', 'drawing'],
        relatedLessons: ['ET-01'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 5,
      attributes: {
        title: 'Value Scale',
        description: 'Understanding light and dark values',
        content: 'Range from white to black in gradual steps',
        category: 'fundamentals',
        keywords: ['value', '明度', 'shading', 'light'],
        relatedLessons: ['P-01'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      total: 5,
    },
  },
}
