/**
 * Shared CMS types for Strapi content
 */

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
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
    [key: string]: unknown
  }
}

export interface StrapiError {
  status: number
  name: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Knowledge Card types
 */
export type KnowledgeCardType =
  | 'Theory'
  | 'Case Study'
  | 'Student Work'
  | 'AI Prompt'
  | 'Extended Thinking'

export interface KnowledgeCardAttributes {
  title: string
  slug?: string | null
  type?: KnowledgeCardType | null
  description?: string | null
  promptText?: string | null
  tags?: string[] | null
  qrLink?: string | null
  media?: {
    data: Array<StrapiCollectionItem<StrapiMedia>> | null
  } | null
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface KnowledgeCard {
  id: number | string
  title: string
  slug?: string | null
  type?: KnowledgeCardType | null
  description?: string | null
  promptText?: string | null
  tags?: string[]
  qrLink?: string | null
  media: StrapiMedia[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export type StrapiKnowledgeCardResponse = StrapiCollectionResponse<KnowledgeCardAttributes>

/**
 * Resource types
 */
export type ResourceCategory =
  | 'Video Tutorials'
  | 'Tool Links'
  | 'Case Databases'
  | 'Readings'
  | 'PBR Libraries'

export type ResourceDiscipline = '环艺' | '产品' | '视传' | '数媒' | '公艺'

export type ResourceMediaType = 'video' | 'pdf' | 'link' | 'dataset'

export interface ResourceAttributes {
  title: string
  category?: ResourceCategory | null
  description?: string | null
  url: string
  accessibilityFlag?: boolean | null
  lastChecked?: string | null
  disciplines?: ResourceDiscipline[] | null
  mediaType?: ResourceMediaType | null
  qrAsset?: {
    data: StrapiCollectionItem<StrapiMedia> | null
  } | null
  file?: {
    data: StrapiCollectionItem<StrapiMedia> | null
  } | null
  lessons?: {
    data: Array<StrapiCollectionItem<any>> | null
  } | null
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface Resource {
  id: number | string
  title: string
  category?: ResourceCategory | null
  description?: string | null
  url: string
  accessibilityFlag?: boolean
  lastChecked?: string | null
  disciplines?: ResourceDiscipline[]
  mediaType?: ResourceMediaType
  qrAsset?: StrapiMedia | null
  file?: StrapiMedia | null
  lessons?: any[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export type StrapiResourceResponse = StrapiCollectionResponse<ResourceAttributes>

/**
 * Student Work types
 */
export type StudentWorkDiscipline = '环艺' | '产品' | '视传' | '数媒' | '公艺'

export type StudentWorkLoop = 'Loop 1' | 'Loop 2' | 'Loop 3'

export interface StudentWorkAttributes {
  studentName: string
  discipline?: StudentWorkDiscipline | null
  grade?: string | null
  loop?: StudentWorkLoop | null
  description?: string | null
  assets?: {
    data: Array<StrapiCollectionItem<StrapiMedia>> | null
  } | null
  beforeAfterMedia?: {
    data: Array<StrapiCollectionItem<StrapiMedia>> | null
  } | null
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface StudentWork {
  id: number | string
  studentName: string
  discipline?: StudentWorkDiscipline | null
  grade?: string | null
  loop?: StudentWorkLoop | null
  description?: string | null
  assets: StrapiMedia[]
  beforeAfterMedia: StrapiMedia[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export type StrapiStudentWorkResponse = StrapiCollectionResponse<StudentWorkAttributes>

/**
 * Query parameters for collections
 */
export interface QueryFilters {
  [key: string]: string | number | boolean | null | QueryFilters
}

export interface QueryParams {
  filters?: QueryFilters
  sort?: string | string[]
  pagination?: {
    page?: number
    pageSize?: number
    start?: number
    limit?: number
  }
  populate?: string | string[] | Record<string, unknown>
  fields?: string[]
  publicationState?: 'live' | 'preview'
  locale?: string
}
