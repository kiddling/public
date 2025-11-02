import type { StrapiNavigationResponse } from '~/types/navigation'

export const mockNavigationResponse: StrapiNavigationResponse = {
  data: [
    {
      id: 1,
      attributes: {
        code: 'P-00',
        title: 'Welcome to Foundations',
        description: 'Start here',
        partOrder: 1,
        loopOrder: 1,
        order: 1,
        slug: 'welcome-to-foundations',
        metadata: { estimatedTime: 10 },
        part: {
          data: {
            id: 10,
            attributes: {
              key: 'foundation',
              title: 'Foundation',
              description: 'Foundation part overview',
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
              description: 'Core readiness skills',
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
        title: 'Foundational Practice',
        summary: 'Practice basics',
        partOrder: 1,
        loopOrder: 1,
        order: 2,
        part: {
          data: {
            id: 10,
            attributes: {
              key: 'foundation',
              title: 'Foundation',
              description: 'Foundation part overview',
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
              description: 'Core readiness skills',
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
        title: 'Core Block A',
        description: 'Deepen understanding',
        partOrder: 2,
        loopOrder: 1,
        order: 1,
        part: {
          data: {
            id: 20,
            attributes: {
              key: 'core-blocks',
              title: 'Core Blocks',
              description: 'Key learning blocks',
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
              description: 'Loop for block A',
              order: 1,
            },
          },
        },
      },
    },
    {
      id: 4,
      attributes: {
        code: 'PB-01',
        title: 'Core Block B',
        description: 'Expand practice',
        partOrder: 2,
        loopOrder: 2,
        order: 1,
        part: {
          data: {
            id: 20,
            attributes: {
              key: 'core-blocks',
              title: 'Core Blocks',
              description: 'Key learning blocks',
              order: 2,
            },
          },
        },
        loop: {
          data: {
            id: 202,
            attributes: {
              code: 'block-b',
              title: 'Block B Loop',
              description: 'Loop for block B',
              order: 2,
            },
          },
        },
      },
    },
    {
      id: 5,
      attributes: {
        code: 'ET-01',
        title: 'Extended Exploration',
        description: 'Stretch thinking',
        partOrder: 3,
        order: 1,
        part: {
          data: {
            id: 30,
            attributes: {
              key: 'extended-thinking',
              title: 'Extended Thinking',
              description: 'Extend and explore',
              order: 3,
            },
          },
        },
      },
    },
    {
      id: 6,
      attributes: {
        code: 'AP-01',
        title: 'Reference Materials',
        description: 'Supplementary resources',
        partOrder: 4,
        order: 1,
        partTitle: 'Appendices',
        part: {
          data: {
            id: 40,
            attributes: {
              key: 'appendices',
              title: 'Appendices',
              description: 'Supporting content',
              order: 4,
            },
          },
        },
      },
    },
  ],
}
