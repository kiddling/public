import { describe, expect, it } from 'vitest'
import { courseNavigationInternals, useCourseNavigationStore } from '~/stores/courseNavigation'
import type { StrapiCollectionItem } from '~/types/lesson'

const sampleStrapiPart = (overrides: Partial<Record<string, any>> = {}) =>
  ({
    id: 1,
    attributes: {
      title: 'Foundation Loop',
      code: 'fnd',
      category: 'Foundation',
      order: 1,
      lessons: {
        data: [
          {
            id: 11,
            attributes: {
              title: 'Orientation',
              code: 'p-00',
              order: 1,
              sections: {
                data: [
                  {
                    id: 111,
                    attributes: {
                      title: 'Warm up',
                      slug: 'warm-up',
                      order: 1,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      ...overrides,
    },
  }) as StrapiCollectionItem<Record<string, any>>

describe('course navigation normalization', () => {
  it('maps Strapi collection into navigation parts and lessons', () => {
    const result = courseNavigationInternals.mapStrapiToNavigation([
      sampleStrapiPart({
        title: 'Core Blocks',
        code: 'core',
        category: 'Core Blocks',
        order: 2,
        lessons: {
          data: [
            {
              id: 21,
              attributes: {
                title: 'Lesson A',
                code: 'pa-01',
                order: 1,
              },
            },
            {
              id: 22,
              attributes: {
                title: 'Lesson B',
                code: 'pb-02',
                order: 2,
              },
            },
          ],
        },
      }),
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      code: 'CORE',
      category: 'core',
      lessons: [
        { code: 'PA-01', partCode: 'CORE' },
        { code: 'PB-02', partCode: 'CORE' },
      ],
    })
  })

  it('falls back to foundation category and normalises sections', () => {
    const [part] = courseNavigationInternals.mapStrapiToNavigation([
      sampleStrapiPart({ category: undefined })
    ])

    expect(part.category).toBe('foundation')
    expect(part.lessons[0].sections).toHaveLength(1)
    expect(part.lessons[0].sections[0]).toMatchObject({ slug: 'warm-up', order: 1 })
  })

  it('allows setting sections on lessons and updates active section safely', () => {
    const store = useCourseNavigationStore()
    store.state.parts = courseNavigationInternals.SAMPLE_STRUCTURE

    const lessonCode = store.state.parts[0].lessons[0].code
    store.setLessonSections(lessonCode, [
      { id: 'sec-1', title: 'Overview', slug: 'overview', order: 1 },
      { id: 'sec-2', title: 'Deep dive', slug: 'deep-dive', order: 2 },
    ])

    const updatedLesson = store.state.parts[0].lessons[0]
    expect(updatedLesson.sections).toHaveLength(2)
    expect(updatedLesson.sections[0].slug).toBe('overview')
  })
})
