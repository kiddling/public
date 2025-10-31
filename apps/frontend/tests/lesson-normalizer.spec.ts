import { describe, it, expect, vi } from 'vitest'
import { normalizeLesson } from '~/utils/lesson-normalizer'
import type { StrapiCollectionItem } from '~/types/lesson'

// Mock the useMarkdown composable
vi.mock('~/composables/useMarkdown', () => ({
  useMarkdown: (text: string) => `<p>${text}</p>`,
}))

describe('normalizeLesson', () => {
  const assetBase = 'https://cdn.example.com'

  it('should normalize a basic lesson with all difficulty levels', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 1,
      attributes: {
        code: 'L1',
        title: 'Test Lesson',
        summary: 'A test lesson summary',
        body: 'Lesson overview content',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base level content',
            summary: 'Base summary',
          },
          {
            difficulty: 'Advance',
            content: 'Advance level content',
            summary: 'Advance summary',
          },
          {
            difficulty: 'Stretch',
            content: 'Stretch level content',
            summary: 'Stretch summary',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L1', assetBase)

    expect(result.code).toBe('L1')
    expect(result.title).toBe('Test Lesson')
    expect(result.summary).toBe('A test lesson summary')
    expect(result.body).toBe('<p>Lesson overview content</p>')

    expect(result.difficultyBlocks.base).not.toBeNull()
    expect(result.difficultyBlocks.base?.level).toBe('base')
    expect(result.difficultyBlocks.base?.body).toBe('<p>Base level content</p>')
    expect(result.difficultyBlocks.base?.summary).toBe('Base summary')

    expect(result.difficultyBlocks.advance).not.toBeNull()
    expect(result.difficultyBlocks.advance?.level).toBe('advance')

    expect(result.difficultyBlocks.stretch).not.toBeNull()
    expect(result.difficultyBlocks.stretch?.level).toBe('stretch')
  })

  it('should handle missing difficulty blocks', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 2,
      attributes: {
        code: 'L2',
        title: 'Minimal Lesson',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Only base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L2', assetBase)

    expect(result.difficultyBlocks.base).not.toBeNull()
    expect(result.difficultyBlocks.advance).toBeNull()
    expect(result.difficultyBlocks.stretch).toBeNull()
  })

  it('should normalize media within difficulty blocks', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 3,
      attributes: {
        code: 'L3',
        title: 'Media Lesson',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
            media: {
              data: [
                {
                  id: 1,
                  attributes: {
                    url: '/uploads/image.png',
                    mime: 'image/png',
                    alternativeText: 'Test image',
                    caption: 'A test image',
                  },
                },
              ],
            },
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L3', assetBase)

    expect(result.difficultyBlocks.base?.media).toHaveLength(1)
    expect(result.difficultyBlocks.base?.media[0].url).toBe('https://cdn.example.com/uploads/image.png')
    expect(result.difficultyBlocks.base?.media[0].alternativeText).toBe('Test image')
    expect(result.difficultyBlocks.base?.media[0].caption).toBe('A test image')
  })

  it('should normalize attachments within difficulty blocks', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 4,
      attributes: {
        code: 'L4',
        title: 'Attachment Lesson',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
            attachments: {
              data: [
                {
                  id: 1,
                  attributes: {
                    url: '/uploads/worksheet.pdf',
                    name: 'Worksheet',
                    mime: 'application/pdf',
                    size: 102400,
                  },
                },
              ],
            },
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L4', assetBase)

    expect(result.difficultyBlocks.base?.attachments).toHaveLength(1)
    expect(result.difficultyBlocks.base?.attachments[0].name).toBe('Worksheet')
    expect(result.difficultyBlocks.base?.attachments[0].url).toBe('https://cdn.example.com/uploads/worksheet.pdf')
    expect(result.difficultyBlocks.base?.attachments[0].size).toBe(102400)
  })

  it('should normalize prompts within difficulty blocks', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 5,
      attributes: {
        code: 'L5',
        title: 'Prompt Lesson',
        difficulty_specific_fields: [
          {
            difficulty: 'Stretch',
            content: 'Stretch content',
            prompts: [
              {
                id: 1,
                title: 'Reflection Question',
                description: 'Think about how this applies to your context.',
              },
              {
                id: 2,
                title: 'Extension Activity',
                description: 'Try implementing this in your classroom.',
              },
            ],
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L5', assetBase)

    expect(result.difficultyBlocks.stretch?.prompts).toHaveLength(2)
    expect(result.difficultyBlocks.stretch?.prompts[0].title).toBe('Reflection Question')
    expect(result.difficultyBlocks.stretch?.prompts[1].title).toBe('Extension Activity')
  })

  it('should normalize loop relation', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 6,
      attributes: {
        code: 'L6',
        title: 'Loop Lesson',
        loop: {
          data: {
            id: 1,
            attributes: {
              title: 'Loop 1',
              order: 1,
              summary: 'First loop summary',
            },
          },
        },
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L6', assetBase)

    expect(result.loop).not.toBeNull()
    expect(result.loop?.title).toBe('Loop 1')
    expect(result.loop?.order).toBe(1)
    expect(result.loop?.summary).toBe('First loop summary')
  })

  it('should handle legacy loop_reference', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 7,
      attributes: {
        code: 'L7',
        title: 'Legacy Loop Lesson',
        loop_reference: 'Legacy Loop',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L7', assetBase)

    // loop_reference is not automatically converted to loop
    // The loop field would be null unless explicitly populated
    expect(result.loop).toBeNull()
  })

  it('should normalize knowledge cards', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 8,
      attributes: {
        code: 'L8',
        title: 'Knowledge Card Lesson',
        knowledge_cards: {
          data: [
            {
              id: 1,
              attributes: {
                title: 'Card 1',
                summary: 'Card summary',
                url: 'https://example.com/card1',
              },
            },
          ],
        },
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L8', assetBase)

    expect(result.knowledgeCards).toHaveLength(1)
    expect(result.knowledgeCards[0].title).toBe('Card 1')
    expect(result.knowledgeCards[0].summary).toBe('Card summary')
    expect(result.knowledgeCards[0].url).toBe('https://example.com/card1')
  })

  it('should normalize resources with local QR code URLs', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 9,
      attributes: {
        code: 'L9',
        title: 'Resource Lesson',
        resources: {
          data: [
            {
              id: 1,
              attributes: {
                title: 'External Resource',
                url: 'https://example.com/resource',
                description: 'A helpful resource',
                type: 'article',
              },
            },
          ],
        },
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'L9', assetBase)

    expect(result.resources).toHaveLength(1)
    expect(result.resources[0].title).toBe('External Resource')
    expect(result.resources[0].url).toBe('https://example.com/resource')
    expect(result.resources[0].qrCodeUrl).toContain('/api/qr?data=')
    expect(result.resources[0].qrCodeUrl).toContain('https%3A%2F%2Fexample.com%2Fresource')
  })

  it('should use fallback code when code is missing', () => {
    const rawLesson: StrapiCollectionItem<Record<string, any>> = {
      id: 10,
      attributes: {
        title: 'No Code Lesson',
        difficulty_specific_fields: [
          {
            difficulty: 'Base',
            content: 'Base content',
          },
        ],
      },
    }

    const result = normalizeLesson(rawLesson, 'FALLBACK', assetBase)

    expect(result.code).toBe('FALLBACK')
  })
})
