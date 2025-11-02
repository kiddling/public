/**
 * Mock Navigation Data for E2E Tests
 */

export const navigationFixture = {
  data: [
    {
      id: 1,
      attributes: {
        code: 'P-00',
        title: 'Welcome to Art Foundations',
        description: 'Introduction to visual arts',
        partOrder: 1,
        loopOrder: 1,
        order: 1,
        slug: 'welcome-to-foundations',
        metadata: { estimatedTime: 45 },
        part: {
          data: {
            id: 10,
            attributes: {
              key: 'foundation',
              title: 'Foundation',
              description: 'Core foundational skills',
              color: '#0EA5E9',
              order: 1,
            },
          },
        },
        loop: {
          data: {
            id: 101,
            attributes: {
              code: 'readiness',
              title: 'Readiness Loop',
              description: 'Prepare for artistic practice',
              order: 1,
            },
          },
        },
      },
    },
    {
      id: 2,
      attributes: {
        code: 'P-01',
        title: 'Line and Form',
        summary: 'Basic line techniques',
        partOrder: 1,
        loopOrder: 1,
        order: 2,
        slug: 'line-and-form',
        part: {
          data: {
            id: 10,
            attributes: {
              key: 'foundation',
              title: 'Foundation',
              description: 'Core foundational skills',
              color: '#0EA5E9',
              order: 1,
            },
          },
        },
        loop: {
          data: {
            id: 101,
            attributes: {
              code: 'readiness',
              title: 'Readiness Loop',
              description: 'Prepare for artistic practice',
              order: 1,
            },
          },
        },
      },
    },
    {
      id: 3,
      attributes: {
        code: 'PA-01',
        title: 'Color Theory Fundamentals',
        description: 'Understanding color',
        partOrder: 2,
        loopOrder: 1,
        order: 1,
        slug: 'color-theory-fundamentals',
        part: {
          data: {
            id: 20,
            attributes: {
              key: 'core-blocks',
              title: 'Core Blocks',
              description: 'Essential artistic concepts',
              color: '#10B981',
              order: 2,
            },
          },
        },
        loop: {
          data: {
            id: 201,
            attributes: {
              code: 'block-a',
              title: 'Block A Loop',
              description: 'Color and composition',
              order: 1,
            },
          },
        },
      },
    },
    {
      id: 4,
      attributes: {
        code: 'PA-02',
        title: 'Composition and Balance',
        description: 'Visual organization',
        partOrder: 2,
        loopOrder: 1,
        order: 2,
        slug: 'composition-and-balance',
        part: {
          data: {
            id: 20,
            attributes: {
              key: 'core-blocks',
              title: 'Core Blocks',
              description: 'Essential artistic concepts',
              color: '#10B981',
              order: 2,
            },
          },
        },
        loop: {
          data: {
            id: 201,
            attributes: {
              code: 'block-a',
              title: 'Block A Loop',
              description: 'Color and composition',
              order: 1,
            },
          },
        },
      },
    },
    {
      id: 5,
      attributes: {
        code: 'ET-01',
        title: 'Advanced Perspective Drawing',
        description: 'Complex perspective techniques',
        partOrder: 3,
        order: 1,
        slug: 'advanced-perspective',
        part: {
          data: {
            id: 30,
            attributes: {
              key: 'extended-thinking',
              title: 'Extended Thinking',
              description: 'Advanced concepts',
              color: '#F59E0B',
              order: 3,
            },
          },
        },
      },
    },
  ],
}
