/**
 * Mock Design Log Templates Data for E2E Tests
 */

export const designLogTemplatesFixture = {
  data: [
    {
      id: 1,
      attributes: {
        name: 'Basic Project Template',
        description: 'Template for general art projects',
        category: 'general',
        fields: [
          {
            id: 'title',
            label: 'Project Title',
            type: 'text',
            required: true,
          },
          {
            id: 'concept',
            label: 'Concept Description',
            type: 'textarea',
            required: true,
          },
          {
            id: 'materials',
            label: 'Materials Used',
            type: 'textarea',
            required: false,
          },
          {
            id: 'process',
            label: 'Process Notes',
            type: 'textarea',
            required: false,
          },
          {
            id: 'reflection',
            label: 'Reflection',
            type: 'textarea',
            required: false,
          },
        ],
        order: 1,
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 2,
      attributes: {
        name: 'Detailed Research Template',
        description: 'Template for research-based projects',
        category: 'research',
        fields: [
          {
            id: 'title',
            label: 'Research Topic',
            type: 'text',
            required: true,
          },
          {
            id: 'question',
            label: 'Research Question',
            type: 'textarea',
            required: true,
          },
          {
            id: 'background',
            label: 'Background Research',
            type: 'textarea',
            required: true,
          },
          {
            id: 'methodology',
            label: 'Methodology',
            type: 'textarea',
            required: true,
          },
          {
            id: 'findings',
            label: 'Findings',
            type: 'textarea',
            required: false,
          },
          {
            id: 'conclusion',
            label: 'Conclusion',
            type: 'textarea',
            required: false,
          },
        ],
        order: 2,
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      total: 2,
    },
  },
}
