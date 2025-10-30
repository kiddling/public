import { z } from 'zod'

export const strapiIdSchema = z.union([z.number(), z.string()])
export type StrapiId = z.infer<typeof strapiIdSchema>

export const strapiPaginationSchema = z
  .object({
    page: z.number().int().nonnegative().optional(),
    pageSize: z.number().int().nonnegative().optional(),
    pageCount: z.number().int().nonnegative().optional(),
    total: z.number().int().nonnegative().optional(),
  })
  .partial()

export type StrapiPagination = z.infer<typeof strapiPaginationSchema>

export const strapiMetaSchema = z
  .object({
    pagination: strapiPaginationSchema.optional(),
  })
  .passthrough()

export type StrapiMeta = z.infer<typeof strapiMetaSchema>

function createStrapiEntitySchema<T extends z.ZodTypeAny>(attributes: T) {
  return z.object({
    id: strapiIdSchema,
    attributes,
  })
}

function createStrapiCollectionSchema<T extends z.ZodTypeAny>(attributes: T) {
  return z.object({
    data: z.array(createStrapiEntitySchema(attributes)),
    meta: strapiMetaSchema.optional(),
  })
}

const strapiMediaAttributesSchema = z
  .object({
    name: z.string().nullable().optional(),
    alternativeText: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    url: z.string(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    size: z.number().nullable().optional(),
    mime: z.string().nullable().optional(),
    ext: z.string().nullable().optional(),
    hash: z.string().nullable().optional(),
    formats: z.record(z.unknown()).nullable().optional(),
    previewUrl: z.string().nullable().optional(),
  })
  .passthrough()

export const strapiMediaEntitySchema = createStrapiEntitySchema(strapiMediaAttributesSchema)
export type StrapiMediaEntity = z.infer<typeof strapiMediaEntitySchema>

export const strapiMediaRelationSchema = z
  .object({
    data: z.array(strapiMediaEntitySchema),
  })
  .nullable()
  .optional()

export const strapiSingleMediaRelationSchema = z
  .object({
    data: strapiMediaEntitySchema.nullable(),
  })
  .nullable()
  .optional()

export type StrapiMedia = {
  id: StrapiId
  url: string
  mime?: string | null
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  size?: number | null
  name?: string | null
  previewUrl?: string | null
  formats?: Record<string, unknown> | null
}

export const knowledgeCardTypeSchema = z.enum([
  'Theory',
  'Case Study',
  'Student Work',
  'AI Prompt',
  'Extended Thinking',
])

export type KnowledgeCardType = z.infer<typeof knowledgeCardTypeSchema>

export const studentWorkDisciplineSchema = z.enum(['环艺', '产品', '视传', '数媒', '公艺'])
export type StudentDiscipline = z.infer<typeof studentWorkDisciplineSchema>

export const studentLoopSchema = z.enum(['Loop 1', 'Loop 2', 'Loop 3'])
export type StudentLoop = z.infer<typeof studentLoopSchema>

export const resourceCategorySchema = z.enum([
  'Video Tutorials',
  'Tool Links',
  'Case Databases',
  'Readings',
  'PBR Libraries',
])

export type ResourceCategory = z.infer<typeof resourceCategorySchema>

export const lessonDifficultySchema = z.enum(['Base', 'Advance', 'Stretch'])
export type LessonDifficulty = z.infer<typeof lessonDifficultySchema>

export const difficultyLevelSchema = z.enum(['base', 'advance', 'stretch'])
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>

export interface LessonAttachment {
  id: StrapiId
  name: string
  url: string
  mime?: string | null
  size?: number | null
}

export interface LessonPrompt {
  id: StrapiId
  title?: string | null
  description?: string | null
}

export interface LessonDifficultyBlock {
  id: StrapiId
  difficulty: LessonDifficulty
  level: DifficultyLevel
  title?: string | null
  summary?: string | null
  body?: string | null
  richBody?: unknown
  media: StrapiMedia[]
  attachments: LessonAttachment[]
  prompts: LessonPrompt[]
}

export interface LessonKnowledgeCard {
  id: StrapiId
  title: string
  slug?: string | null
  type?: KnowledgeCardType | null
  summary?: string | null
  description?: string | null
  url?: string | null
  promptText?: string | null
  qrLink?: string | null
  tags: string[]
  image?: StrapiMedia | null
  media: StrapiMedia[]
}

export interface LessonResource {
  id: StrapiId
  title: string
  category?: ResourceCategory | string | null
  type?: string | null
  description?: string | null
  url: string
  accessibilityFlag: boolean
  lastChecked?: string | null
  qrCodeUrl?: string | null
  file?: StrapiMedia | null
}

export interface LessonStudentWork {
  id: StrapiId
  studentName: string
  discipline?: StudentDiscipline | string | null
  grade?: string | null
  loop?: StudentLoop | string | null
  description?: string | null
  assets: StrapiMedia[]
  beforeAfterMedia: StrapiMedia[]
}

export interface LessonLoop {
  id?: StrapiId
  title?: string | null
  summary?: string | null
  description?: string | null
  slug?: string | null
  order?: number | null
  icon?: StrapiMedia | null
}

export interface Lesson {
  id: StrapiId
  title: string
  code: string
  summary?: string | null
  body?: string | null
  loopReference?: string | null
  part?: string | null
  loop?: LessonLoop | null
  progressOrder?: number | null
  difficultyBlocks: Record<DifficultyLevel, LessonDifficultyBlock | null>
  knowledgeCards: LessonKnowledgeCard[]
  resources: LessonResource[]
  studentWorks: LessonStudentWork[]
  printableAttachments: StrapiMedia[]
}

const knowledgeCardAttributesSchema = z
  .object({
    title: z.string(),
    slug: z.string().nullable().optional(),
    type: knowledgeCardTypeSchema.nullable().optional(),
    description: z.string().nullable().optional(),
    media: strapiMediaRelationSchema,
    promptText: z.string().nullable().optional(),
    tags: z.union([z.array(z.string()), z.record(z.unknown()), z.string(), z.null(), z.undefined()]).default([]),
    qrLink: z.string().nullable().optional(),
  })
  .passthrough()

export const strapiKnowledgeCardEntitySchema = createStrapiEntitySchema(knowledgeCardAttributesSchema)
export const strapiKnowledgeCardCollectionSchema = createStrapiCollectionSchema(knowledgeCardAttributesSchema)
export type StrapiKnowledgeCardCollection = z.infer<typeof strapiKnowledgeCardCollectionSchema>

const studentWorkAttributesSchema = z
  .object({
    studentName: z.string(),
    discipline: studentWorkDisciplineSchema.nullable().optional(),
    grade: z.string().nullable().optional(),
    loop: studentLoopSchema.nullable().optional(),
    description: z.string().nullable().optional(),
    assets: strapiMediaRelationSchema,
    beforeAfterMedia: strapiMediaRelationSchema,
  })
  .passthrough()

export const strapiStudentWorkEntitySchema = createStrapiEntitySchema(studentWorkAttributesSchema)
export const strapiStudentWorkCollectionSchema = createStrapiCollectionSchema(studentWorkAttributesSchema)
export type StrapiStudentWorkCollection = z.infer<typeof strapiStudentWorkCollectionSchema>

const resourceAttributesSchema = z
  .object({
    title: z.string(),
    category: resourceCategorySchema.nullable().optional(),
    description: z.string().nullable().optional(),
    url: z.string(),
    accessibilityFlag: z.boolean().default(true),
    lastChecked: z.string().nullable().optional(),
    qrAsset: strapiSingleMediaRelationSchema,
    file: strapiSingleMediaRelationSchema,
  })
  .passthrough()

export const strapiResourceEntitySchema = createStrapiEntitySchema(resourceAttributesSchema)
export const strapiResourceCollectionSchema = createStrapiCollectionSchema(resourceAttributesSchema)
export type StrapiResourceCollection = z.infer<typeof strapiResourceCollectionSchema>

const difficultyBlockComponentSchema = z
  .object({
    id: strapiIdSchema.optional(),
    difficulty: lessonDifficultySchema,
    content: z.any().nullable().optional(),
    title: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    body: z.any().nullable().optional(),
    media: z.any().optional(),
    attachments: z.any().optional(),
    prompts: z.any().optional(),
  })
  .passthrough()

const lessonAttributesSchema = z
  .object({
    title: z.string(),
    code: z.string(),
    loop_reference: z.string().nullable().optional(),
    part: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    body: z.any().nullable().optional(),
    difficulty_specific_fields: z.array(difficultyBlockComponentSchema).default([]),
    knowledge_cards: z
      .object({
        data: z.array(strapiKnowledgeCardEntitySchema),
      })
      .nullable()
      .optional(),
    resources: z
      .object({
        data: z.array(strapiResourceEntitySchema),
      })
      .nullable()
      .optional(),
    student_works: z
      .object({
        data: z.array(strapiStudentWorkEntitySchema),
      })
      .nullable()
      .optional(),
    printable_attachments: strapiMediaRelationSchema,
    progress_order: z.number().nullable().optional(),
    loop: z
      .object({
        data: createStrapiEntitySchema(
          z
            .object({
              title: z.string().nullable().optional(),
              summary: z.string().nullable().optional(),
              description: z.string().nullable().optional(),
              slug: z.string().nullable().optional(),
              order: z.number().nullable().optional(),
              icon: strapiSingleMediaRelationSchema,
            })
            .passthrough()
        ).nullable(),
      })
      .nullable()
      .optional(),
  })
  .passthrough()

export type StrapiLessonAttributes = z.infer<typeof lessonAttributesSchema>

export const strapiLessonEntitySchema = createStrapiEntitySchema(lessonAttributesSchema)
export type StrapiLessonEntity = z.infer<typeof strapiLessonEntitySchema>

export const strapiLessonCollectionSchema = createStrapiCollectionSchema(lessonAttributesSchema)
export type StrapiLessonCollection = z.infer<typeof strapiLessonCollectionSchema>

export interface LessonCollectionState<T = Lesson> {
  items: T[]
  meta: StrapiMeta | null
  cacheTimestamp: number
}
