import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useLessons } from '~/composables/useLessons'
import { useKnowledgeCards } from '~/composables/useKnowledgeCards'
import { useStudentWorks } from '~/composables/useStudentWorks'
import { useResources } from '~/composables/useResources'

const fetchMock = vi.fn()
const callHookMock = vi.fn()
const stateStore = new Map<string, any>()

const runtimeConfig = {
  strapi: {
    cacheTtl: 600000,
  },
  public: {
    strapiCacheTtl: 600000,
    strapiUrl: 'http://localhost:1337',
    cdnUrl: '',
  },
}

vi.mock('#imports', () => ({
  useRuntimeConfig: () => runtimeConfig,
  useNuxtApp: () => ({
    $strapiFetch: fetchMock,
    callHook: callHookMock,
  }),
  useState: (key: string, init?: () => any) => {
    if (!stateStore.has(key)) {
      stateStore.set(key, ref(init ? init() : undefined))
    }
    return stateStore.get(key)
  },
  useAsyncData: async (
    _key: string,
    handler: () => Promise<any>,
    options?: { default?: () => any; lazy?: boolean }
  ) => {
    const data = ref(options?.default ? options.default() : null)
    const pending = ref(true)
    const error = ref<Error | null>(null)
    const status = ref<'idle' | 'pending' | 'success' | 'error'>(options?.lazy ? 'idle' : 'pending')

    const execute = async () => {
      try {
        pending.value = true
        status.value = 'pending'
        const result = await handler()
        data.value = result
        error.value = null
        status.value = 'success'
        return result
      } catch (err) {
        error.value = err as Error
        status.value = 'error'
        throw err
      } finally {
        pending.value = false
      }
    }

    if (!options?.lazy) {
      await execute()
    } else {
      pending.value = false
    }

    return {
      data,
      pending,
      error,
      status,
      refresh: async () => execute(),
    }
  },
}))

beforeEach(() => {
  fetchMock.mockReset()
  callHookMock.mockReset()
  stateStore.clear()
  runtimeConfig.public.cdnUrl = ''
  runtimeConfig.public.strapiUrl = 'http://localhost:1337'
  runtimeConfig.strapi.cacheTtl = 600000
  runtimeConfig.public.strapiCacheTtl = 600000
})

describe('useLessons', () => {
  it('fetches and normalizes lesson data', async () => {
    fetchMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          attributes: {
            title: 'Lesson One',
            code: 'L-001',
            loop_reference: 'Loop 1',
            summary: 'A short summary',
            body: '<p>Lesson body</p>',
            difficulty_specific_fields: [
              {
                id: 11,
                difficulty: 'Base',
                content: '<p>Base content</p>',
                title: 'Base Block',
                summary: 'Base summary',
                media: {
                  data: [
                    {
                      id: 21,
                      attributes: {
                        url: '/uploads/base.jpg',
                        mime: 'image/jpeg',
                        alternativeText: 'Base image',
                      },
                    },
                  ],
                },
              },
            ],
            knowledge_cards: {
              data: [
                {
                  id: 31,
                  attributes: {
                    title: 'Card A',
                    type: 'Theory',
                    summary: 'Card summary',
                    description: 'Card description',
                    url: 'https://example.com/card',
                    tags: ['analysis'],
                    promptText: 'Think deeper',
                    qrLink: 'https://example.com',
                    media: {
                      data: [
                        {
                          id: 32,
                          attributes: {
                            url: '/uploads/card.jpg',
                            mime: 'image/jpeg',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            resources: {
              data: [
                {
                  id: 41,
                  attributes: {
                    title: 'Resource One',
                    category: 'Video Tutorials',
                    description: 'Resource description',
                    url: 'https://example.com/resource',
                    accessibilityFlag: true,
                    lastChecked: '2024-01-01T00:00:00.000Z',
                    qrAsset: {
                      data: {
                        id: 42,
                        attributes: {
                          url: '/uploads/qr.png',
                          mime: 'image/png',
                        },
                      },
                    },
                    file: {
                      data: null,
                    },
                  },
                },
              ],
            },
            student_works: {
              data: [
                {
                  id: 51,
                  attributes: {
                    studentName: 'Alice',
                    discipline: '产品',
                    grade: '2024',
                    loop: 'Loop 1',
                    description: 'Great work',
                    assets: { data: [] },
                    beforeAfterMedia: { data: [] },
                  },
                },
              ],
            },
            printable_attachments: {
              data: [
                {
                  id: 61,
                  attributes: {
                    url: '/uploads/attachment.pdf',
                    mime: 'application/pdf',
                    name: 'Attachment',
                    size: 2048,
                  },
                },
              ],
            },
            progress_order: 1,
          },
        },
      ],
      meta: {
        pagination: {
          page: 1,
          pageSize: 1,
          pageCount: 1,
          total: 1,
        },
      },
    })

    const collection = await useLessons({ code: 'L-001', populate: 'deep,4' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, requestOptions] = fetchMock.mock.calls[0]
    expect(requestOptions.params['filters[code][$eq]']).toEqual('L-001')
    expect(requestOptions.params.populate).toEqual('deep,4')

    const lesson = collection.data.value?.items[0]
    expect(lesson?.title).toEqual('Lesson One')
    expect(lesson?.difficultyBlocks.base?.difficulty).toEqual('Base')
    expect(lesson?.difficultyBlocks.base?.media[0].url).toEqual('http://localhost:1337/uploads/base.jpg')
    expect(lesson?.knowledgeCards[0].tags).toEqual(['analysis'])
    expect(lesson?.knowledgeCards[0].summary).toEqual('Card summary')
    expect(lesson?.knowledgeCards[0].url).toEqual('https://example.com/card')
    expect(lesson?.knowledgeCards[0].image?.url).toEqual('http://localhost:1337/uploads/card.jpg')
    expect(lesson?.resources[0].qrCodeUrl).toEqual('http://localhost:1337/uploads/qr.png')
    expect(collection.meta.value?.pagination?.total).toEqual(1)
  })

  it('falls back to cached data when the request fails', async () => {
    const response = {
      data: [
        {
          id: 1,
          attributes: {
            title: 'Lesson Cached',
            code: 'L-002',
            difficulty_specific_fields: [],
          },
        },
      ],
      meta: {},
    }

    fetchMock.mockResolvedValueOnce(response)

    const collection = await useLessons({ code: 'L-002' })
    expect(collection.data.value?.items[0]?.title).toEqual('Lesson Cached')

    fetchMock.mockRejectedValueOnce(new Error('offline'))

    const refreshed = await collection.refresh()
    expect(refreshed?.items[0].title).toEqual('Lesson Cached')
    expect(collection.isFallback.value).toEqual(true)
  })
})

describe('useKnowledgeCards', () => {
  it('applies filters for type and tags', async () => {
    fetchMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          attributes: {
            title: 'Card Title',
            type: 'Theory',
            description: null,
            tags: ['analysis'],
            media: { data: [] },
          },
        },
      ],
      meta: {},
    })

    const collection = await useKnowledgeCards({ type: 'Theory', tags: 'analysis' })
    const [, requestOptions] = fetchMock.mock.calls[0]

    expect(requestOptions.params['filters[type][$eq]']).toEqual('Theory')
    expect(requestOptions.params['filters[tags][$containsi]']).toEqual('analysis')
    expect(collection.data.value?.items[0].tags).toEqual(['analysis'])
  })
})

describe('useStudentWorks', () => {
  it('filters by discipline and loop', async () => {
    fetchMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          attributes: {
            studentName: 'Alice',
            discipline: '产品',
            loop: 'Loop 1',
            description: 'Work',
            assets: { data: [] },
            beforeAfterMedia: { data: [] },
          },
        },
      ],
      meta: {},
    })

    const collection = await useStudentWorks({ discipline: '产品', loop: ['Loop 1'] })
    const [, requestOptions] = fetchMock.mock.calls[0]

    expect(requestOptions.params['filters[discipline][$eq]']).toEqual('产品')
    expect(requestOptions.params['filters[loop][$in][0]']).toEqual('Loop 1')
    expect(collection.data.value?.items[0].studentName).toEqual('Alice')
  })
})

describe('useResources', () => {
  it('filters by category and normalizes media', async () => {
    fetchMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          attributes: {
            title: 'Resource',
            category: 'Video Tutorials',
            description: null,
            url: 'https://example.com',
            accessibilityFlag: true,
            lastChecked: null,
            qrAsset: {
              data: {
                id: 2,
                attributes: {
                  url: '/uploads/qr.png',
                  mime: 'image/png',
                },
              },
            },
            file: { data: null },
          },
        },
      ],
      meta: {},
    })

    const collection = await useResources({ category: 'Video Tutorials' })
    const [, requestOptions] = fetchMock.mock.calls[0]

    expect(requestOptions.params['filters[category][$eq]']).toEqual('Video Tutorials')
    expect(collection.data.value?.items[0].type).toEqual('Video Tutorials')
    expect(collection.data.value?.items[0].qrCodeUrl).toEqual('http://localhost:1337/uploads/qr.png')
  })
})
