import type { StrapiCollectionItem, StrapiCollectionResponse } from '~/types/lesson'

export const NAVIGATION_PART_TYPES = [
  'foundation',
  'core-blocks',
  'extended-thinking',
  'appendices',
] as const

export type NavigationPartType = (typeof NAVIGATION_PART_TYPES)[number]

export const NAVIGATION_PART_LABELS: Record<NavigationPartType, string> = {
  foundation: 'Foundation',
  'core-blocks': 'Core Blocks',
  'extended-thinking': 'Extended Thinking',
  appendices: 'Appendices',
}

export const NAVIGATION_PART_ORDER: Record<NavigationPartType, number> = {
  foundation: 0,
  'core-blocks': 1,
  'extended-thinking': 2,
  appendices: 3,
}

export const NAVIGATION_PART_COLORS: Record<NavigationPartType, string> = {
  foundation: '#2563EB',
  'core-blocks': '#16A34A',
  'extended-thinking': '#F97316',
  appendices: '#7C3AED',
}

export interface NavigationBreadcrumbItem {
  type: 'part' | 'loop' | 'lesson'
  id: string
  label: string
}

export interface NavigationLessonNavigation {
  previousCode: string | null
  nextCode: string | null
  breadcrumb: NavigationBreadcrumbItem[]
}

export interface NavigationLesson {
  id: string
  code: string
  title: string
  description?: string | null
  part: NavigationPartType
  partId: string
  partTitle: string
  loopId?: string | null
  loopTitle?: string | null
  order: number
  metadata: Record<string, unknown>
  navigation: NavigationLessonNavigation
}

export interface NavigationLoop {
  id: string
  code?: string | null
  title: string
  description?: string | null
  order: number
  lessons: NavigationLesson[]
}

export interface NavigationPart {
  id: string
  title: string
  type: NavigationPartType
  description?: string | null
  color: string
  order: number
  loops: NavigationLoop[]
  lessons: NavigationLesson[]
}

export interface NavigationTree {
  parts: NavigationPart[]
  lessons: NavigationLesson[]
}

export interface NavigationLookupMaps {
  byCode: Record<string, NavigationLesson>
  byPart: Record<NavigationPartType, NavigationLesson[]>
  byLoop: Record<string, NavigationLesson[]>
}

export interface NavigationData {
  tree: NavigationTree
  maps: NavigationLookupMaps
}

export interface StrapiNavigationPartAttributes {
  key?: string | null
  title?: string | null
  description?: string | null
  color?: string | null
  order?: number | null
}

export interface StrapiNavigationLoopAttributes {
  code?: string | null
  title?: string | null
  description?: string | null
  order?: number | null
}

export interface StrapiNavigationLessonAttributes {
  code: string
  title: string
  description?: string | null
  summary?: string | null
  slug?: string | null
  metadata?: Record<string, unknown> | null
  order?: number | null
  loopOrder?: number | null
  partOrder?: number | null
  partKey?: string | null
  partTitle?: string | null
  partColor?: string | null
  loopTitle?: string | null
  loopCode?: string | null
  loopDescription?: string | null
  part?: {
    data: StrapiCollectionItem<StrapiNavigationPartAttributes> | null
  } | null
  loop?: {
    data: StrapiCollectionItem<StrapiNavigationLoopAttributes> | null
  } | null
}

export type StrapiNavigationResponse = StrapiCollectionResponse<StrapiNavigationLessonAttributes>
