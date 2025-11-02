/**
 * Mock Resources Data for E2E Tests
 */

export const resourcesFixture = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Basic Drawing Techniques Guide',
        description: 'Comprehensive guide to fundamental drawing techniques',
        category: 'guides',
        type: 'pdf',
        fileSize: 2048576,
        downloadUrl: '/mock/basic-drawing.pdf',
        previewUrl: '/mock/basic-drawing-preview.jpg',
        tags: ['drawing', 'basics', 'fundamentals'],
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 2,
      attributes: {
        title: 'Color Mixing Chart',
        description: 'Visual reference for color combinations',
        category: 'reference',
        type: 'pdf',
        fileSize: 1024768,
        downloadUrl: '/mock/color-chart.pdf',
        previewUrl: '/mock/color-chart-preview.jpg',
        tags: ['color', 'reference', 'theory'],
        publishedAt: '2024-01-02T00:00:00.000Z',
      },
    },
    {
      id: 3,
      attributes: {
        title: 'Composition Templates Pack',
        description: 'Ready-to-use composition templates',
        category: 'templates',
        type: 'zip',
        fileSize: 5242880,
        downloadUrl: '/mock/composition-templates.zip',
        previewUrl: '/mock/composition-preview.jpg',
        tags: ['composition', 'templates', 'design'],
        publishedAt: '2024-01-03T00:00:00.000Z',
      },
    },
    {
      id: 4,
      attributes: {
        title: 'Perspective Grid Tool',
        description: 'Printable perspective grids for practice',
        category: 'tools',
        type: 'pdf',
        fileSize: 512000,
        downloadUrl: '/mock/perspective-grids.pdf',
        previewUrl: '/mock/perspective-preview.jpg',
        tags: ['perspective', 'tools', 'practice'],
        publishedAt: '2024-01-04T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      total: 4,
    },
  },
}
