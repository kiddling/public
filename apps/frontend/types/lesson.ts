export type DifficultyLevel = 'base' | 'advance' | 'stretch'

export interface StrapiMedia {
  id?: number | string
  url: string
  mime?: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  size?: number | null
  name?: string | null
}

export interface LessonAttachment {
  id: number | string
  name: string
  url: string
  mime?: string | null
  size?: number | null
}

export interface LessonPrompt {
  id: number | string
  title?: string | null
  description?: string | null
}

export interface LessonDifficultyBlock {
  level: DifficultyLevel
  title: string
  summary?: string | null
  body?: string | null
  richBody?: unknown
  media: StrapiMedia[]
  attachments: LessonAttachment[]
  prompts: LessonPrompt[]
}

export interface LessonKnowledgeCard {
  id: number | string
  title: string
  summary?: string | null
  description?: string | null
  slug?: string | null
  url?: string | null
  image?: StrapiMedia | null
}

export interface LessonResource {
  id: number | string
  title: string
  description?: string | null
  url: string
  type?: string | null
  qrCodeUrl?: string | null
}

export interface LessonLoop {
  id?: number | string
  title?: string | null
  summary?: string | null
  description?: string | null
  slug?: string | null
  order?: number | null
  icon?: StrapiMedia | null
}

export interface Lesson {
  id: number | string
  title: string
  code: string
  summary?: string | null
  body?: string | null
  loop?: LessonLoop | null
  difficultyBlocks: Record<DifficultyLevel, LessonDifficultyBlock | null>
  knowledgeCards: LessonKnowledgeCard[]
  resources: LessonResource[]
}

export interface StrapiSingleType<T> {
  data: T | null
  meta?: Record<string, unknown>
}

export interface StrapiCollectionItem<T> {
  id: number
  attributes: T
}

export interface StrapiCollectionResponse<T> {
  data: Array<StrapiCollectionItem<T>>
  meta?: Record<string, unknown>
}
