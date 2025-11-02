import { describe, expect, it } from 'vitest'
import { transformNavigationData } from '~/utils/navigation'
import {
  NAVIGATION_PART_COLORS,
  NAVIGATION_PART_LABELS,
  type NavigationLesson,
} from '~/types/navigation'
import { mockNavigationResponse } from './fixtures/navigation'

describe('transformNavigationData', () => {
  it('transforms Strapi response into hierarchical navigation data', () => {
    const { tree, maps } = transformNavigationData(mockNavigationResponse)

    expect(tree.parts).toHaveLength(4)
    expect(tree.lessons.map((lesson) => lesson.code)).toEqual([
      'P-00',
      'P-01',
      'PA-01',
      'PB-01',
      'ET-01',
      'AP-01',
    ])

    const foundation = tree.parts.find((part) => part.type === 'foundation')
    expect(foundation).toBeDefined()
    expect(foundation?.color).toBe('#0EA5E9')
    expect(foundation?.lessons.map((lesson) => lesson.code)).toEqual(['P-00', 'P-01'])
    expect(foundation?.loops).toHaveLength(1)
    expect(foundation?.loops[0].lessons.map((lesson) => lesson.code)).toEqual(['P-00', 'P-01'])

    const coreBlocks = tree.parts.find((part) => part.type === 'core-blocks')
    expect(coreBlocks).toBeDefined()
    expect(coreBlocks?.color).toBe(NAVIGATION_PART_COLORS['core-blocks'])
    expect(coreBlocks?.loops.map((loop) => loop.title)).toEqual(['Block A Loop', 'Block B Loop'])

    expect(maps.byPart['extended-thinking'][0].code).toBe('ET-01')
    expect(maps.byPart.appendices[0].code).toBe('AP-01')

    const blockALessons = maps.byLoop['201']?.map((lesson: NavigationLesson) => lesson.code)
    expect(blockALessons).toEqual(['PA-01'])

    const lesson = maps.byCode['P-01']
    expect(lesson).toBeDefined()
    expect(lesson.metadata.summary).toBe('Practice basics')

    const neighbors = maps.byCode['PA-01'].navigation
    expect(neighbors.previousCode).toBe('P-01')
    expect(neighbors.nextCode).toBe('PB-01')

    expect(maps.byCode['P-00'].navigation.breadcrumb).toEqual([
      { type: 'part', id: '10', label: NAVIGATION_PART_LABELS.foundation },
      { type: 'loop', id: '101', label: 'Readiness Loop' },
      { type: 'lesson', id: 'P-00', label: 'Welcome to Foundations' },
    ])
  })

  it('returns empty structures when response is empty', () => {
    const { tree, maps } = transformNavigationData(null)

    expect(tree.parts).toHaveLength(0)
    expect(tree.lessons).toHaveLength(0)
    expect(Object.keys(maps.byCode)).toHaveLength(0)
    expect(maps.byPart.foundation).toHaveLength(0)
  })
})
