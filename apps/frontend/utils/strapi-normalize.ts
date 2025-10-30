import {
  lessonDifficultySchema,
  type DifficultyLevel,
  type Lesson,
  type LessonAttachment,
  type LessonDifficulty,
  type LessonDifficultyBlock,
  type LessonKnowledgeCard,
  type LessonLoop,
  type LessonPrompt,
  type LessonResource,
  type LessonStudentWork,
  type LessonCollectionState,
  type StrapiId,
  type StrapiLessonCollection,
  type StrapiLessonEntity,
  type StrapiMedia,
  type StrapiMediaEntity,
  type StrapiMeta,
} from '~/types/lesson'

const difficultyLabelMap: Record<DifficultyLevel, LessonDifficulty> = {
  base: 'Base',
  advance: 'Advance',
  stretch: 'Stretch',
}

const difficultyToLevelMap: Record<LessonDifficulty, DifficultyLevel> = {
  Base: 'base',
  Advance: 'advance',
  Stretch: 'stretch',
}

const difficultyReverseLookup: Record<string, DifficultyLevel> = {
  base: 'base',
  foundation: 'base',
  core: 'base',
  beginner: 'base',
  advance: 'advance',
  advanced: 'advance',
  intermediate: 'advance',
  stretch: 'stretch',
  extension: 'stretch',
  extended: 'stretch',
}

interface NormaliseOptions {
  assetBaseUrl?: string
  timestamp?: number
}

export function resolveAssetBaseUrl({
  cdnUrl,
  strapiUrl,
}: {
  cdnUrl?: string
  strapiUrl?: string
}): string {
  const candidate = (cdnUrl || strapiUrl || '').trim()
  if (!candidate) {
    return ''
  }

  return candidate.replace(/\/+$/, '')
}

function resolveAssetUrl(url: unknown, assetBaseUrl: string): string {
  if (!url) {
    return ''
  }

  const value = String(url)
  if (!value) {
    return ''
  }

  if (/^(?:https?:)?\/\//i.test(value)) {
    return value
  }

  if (!assetBaseUrl) {
    return value.startsWith('/') ? value : `/${value}`
  }

  const prefix = assetBaseUrl.endsWith('/') ? assetBaseUrl.slice(0, -1) : assetBaseUrl
  const suffix = value.startsWith('/') ? value : `/${value}`
  return `${prefix}${suffix}`
}

function toArray<T>(input: unknown): T[] {
  if (!input) {
    return []
  }

  if (Array.isArray(input)) {
    return input as T[]
  }

  if (typeof input === 'object' && input !== null) {
    const withData = input as { data?: unknown }
    if (Array.isArray(withData.data)) {
      return withData.data as T[]
    }

    if (withData.data != null) {
      return [withData.data as T]
    }
  }

  return [input as T]
}

function normaliseMediaEntity(entity: StrapiMediaEntity | Record<string, any> | null | undefined, assetBaseUrl: string): StrapiMedia | null {
  if (!entity) {
    return null
  }

  const rawAttributes = 'attributes' in entity ? (entity as StrapiMediaEntity).attributes : entity
  const id = 'id' in entity ? (entity as { id?: StrapiId }).id ?? rawAttributes?.id : rawAttributes?.id
  const url = resolveAssetUrl(rawAttributes?.url ?? rawAttributes?.src ?? '', assetBaseUrl)

  if (!url) {
    return null
  }

  return {
    id: (id ?? url) as StrapiId,
    url,
    mime: rawAttributes?.mime ?? null,
    alternativeText: rawAttributes?.alternativeText ?? rawAttributes?.alt ?? null,
    caption: rawAttributes?.caption ?? null,
    width: rawAttributes?.width ?? null,
    height: rawAttributes?.height ?? null,
    size: rawAttributes?.size ?? null,
    name: rawAttributes?.name ?? null,
    previewUrl: rawAttributes?.previewUrl
      ? resolveAssetUrl(rawAttributes.previewUrl, assetBaseUrl)
      : rawAttributes?.preview_url
        ? resolveAssetUrl(rawAttributes.preview_url, assetBaseUrl)
        : null,
    formats: rawAttributes?.formats ?? null,
  }
}

function normaliseMediaList(input: unknown, assetBaseUrl: string): StrapiMedia[] {
  return toArray<StrapiMediaEntity | Record<string, any>>(input)
    .map((entry) => normaliseMediaEntity(entry, assetBaseUrl))
    .filter((item): item is StrapiMedia => item !== null)
}

function normaliseSingleMedia(input: unknown, assetBaseUrl: string): StrapiMedia | null {
  const [first] = toArray<StrapiMediaEntity | Record<string, any>>(input)
  return normaliseMediaEntity(first, assetBaseUrl)
}

function normaliseAttachments(input: unknown, assetBaseUrl: string): LessonAttachment[] {
  return toArray<Record<string, any>>(input)
    .map((entry, index): LessonAttachment | null => {
      const raw = entry?.attributes ?? entry
      const url = resolveAssetUrl(raw?.url ?? raw?.href ?? raw?.link ?? '', assetBaseUrl)
      if (!url) {
        return null
      }

      return {
        id: (entry?.id ?? raw?.id ?? `attachment-${index}`) as StrapiId,
        name: raw?.name ?? raw?.title ?? 'Download',
        url,
        mime: raw?.mime ?? null,
        size: raw?.size ?? null,
      }
    })
    .filter((item): item is LessonAttachment => item !== null)
}

function normalisePrompts(input: unknown): LessonPrompt[] {
  return toArray<Record<string, any>>(input)
    .map((entry, index): LessonPrompt | null => {
      const raw = entry?.attributes ?? entry
      if (!raw) {
        return null
      }

      return {
        id: (entry?.id ?? raw?.id ?? `prompt-${index}`) as StrapiId,
        title: raw?.title ?? raw?.heading ?? raw?.label ?? null,
        description: raw?.description ?? raw?.body ?? raw?.content ?? null,
      }
    })
    .filter((item): item is LessonPrompt => item !== null)
}

function toDifficultyLevel(value: unknown): { level: DifficultyLevel; label: LessonDifficulty } | null {
  if (!value) {
    return null
  }

  if (lessonDifficultySchema.safeParse(value).success) {
    const label = lessonDifficultySchema.parse(value)
    const level = difficultyToLevelMap[label]
    return { level, label }
  }

  const candidate = String(value).trim().toLowerCase()
  const mapped = difficultyReverseLookup[candidate]
  if (!mapped) {
    return null
  }

  return { level: mapped, label: difficultyLabelMap[mapped] }
}

function extractText(value: unknown): { text: string | null; rich: unknown } {
  if (value == null) {
    return { text: null, rich: null }
  }

  if (typeof value === 'string') {
    return { text: value, rich: null }
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return { text: null, rich: value }
  }

  return { text: String(value), rich: null }
}

export function normaliseKnowledgeCards(
  input: unknown,
  assetBaseUrl: string
): LessonKnowledgeCard[] {
  return toArray<{ id?: StrapiId; attributes?: Record<string, any> }>(input)
    .map((entry) => {
      const raw = entry?.attributes ?? entry
      if (!raw) {
        return null
      }

      const tagsSource = raw.tags
      const tags = parseTags(tagsSource)
      const media = normaliseMediaList(raw.media ?? raw.image, assetBaseUrl)
      const image = media[0] ?? normaliseSingleMedia(raw.image, assetBaseUrl)

      return {
        id: (entry?.id ?? raw?.id ?? raw?.slug ?? raw?.title ?? cryptoRandomId()) as StrapiId,
        title: raw.title ?? 'Knowledge Card',
        slug: raw.slug ?? null,
        type: raw.type ?? null,
        summary: raw.summary ?? null,
        description: raw.description ?? null,
        url: raw.url ?? raw.link ?? null,
        promptText: raw.promptText ?? null,
        qrLink: raw.qrLink ?? null,
        tags,
        image: image ?? null,
        media,
      }
    })
    .filter((item): item is LessonKnowledgeCard => item !== null)
}

function parseTags(source: unknown): string[] {
  if (!source) {
    return []
  }

  if (Array.isArray(source)) {
    return source.map((item) => String(item)).filter(Boolean)
  }

  if (typeof source === 'string') {
    return source
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof source === 'object') {
    return Object.values(source as Record<string, unknown>)
      .map((item) => (item == null ? '' : String(item)))
      .filter(Boolean)
  }

  return []
}

export function normaliseResources(input: unknown, assetBaseUrl: string): LessonResource[] {
  return toArray<{ id?: StrapiId; attributes?: Record<string, any> }>(input)
    .map((entry, index) => {
      const raw = entry?.attributes ?? entry
      if (!raw?.url) {
        return null
      }

      const url = String(raw.url)
      const qrAsset = normaliseSingleMedia(raw.qrAsset, assetBaseUrl)
      const file = normaliseSingleMedia(raw.file, assetBaseUrl)

      return {
        id: (entry?.id ?? raw?.id ?? `resource-${index}`) as StrapiId,
        title: raw.title ?? 'Resource',
        category: raw.category ?? null,
        type: raw.category ?? null,
        description: raw.description ?? null,
        url,
        accessibilityFlag: raw.accessibilityFlag ?? true,
        lastChecked: raw.lastChecked ?? null,
        qrCodeUrl: qrAsset?.url ?? null,
        file,
      }
    })
    .filter((item): item is LessonResource => item !== null)
}

export function normaliseStudentWorks(input: unknown, assetBaseUrl: string): LessonStudentWork[] {
  return toArray<{ id?: StrapiId; attributes?: Record<string, any> }>(input)
    .map((entry, index) => {
      const raw = entry?.attributes ?? entry
      if (!raw) {
        return null
      }

      const description = extractText(raw.description)

      return {
        id: (entry?.id ?? raw?.id ?? `student-work-${index}`) as StrapiId,
        studentName: raw.studentName ?? 'Student Work',
        discipline: raw.discipline ?? null,
        grade: raw.grade ?? null,
        loop: raw.loop ?? null,
        description: description.text ?? null,
        assets: normaliseMediaList(raw.assets, assetBaseUrl),
        beforeAfterMedia: normaliseMediaList(raw.beforeAfterMedia, assetBaseUrl),
      }
    })
    .filter((item): item is LessonStudentWork => item !== null)
}

function normaliseLoop(input: unknown, assetBaseUrl: string): LessonLoop | null {
  const [value] = toArray<{ id?: StrapiId; attributes?: Record<string, any> }>(input)
  if (!value) {
    return null
  }

  const raw = value?.attributes ?? value
  if (!raw) {
    return null
  }

  return {
    id: (value?.id ?? raw?.id ?? null) as StrapiId,
    title: raw.title ?? raw.name ?? null,
    summary: raw.summary ?? null,
    description: raw.description ?? null,
    slug: raw.slug ?? null,
    order: raw.order ?? raw.position ?? null,
    icon: normaliseSingleMedia(raw.icon, assetBaseUrl),
  }
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `id-${Math.random().toString(36).slice(2, 10)}`
}

export function normaliseLessonEntity(entity: StrapiLessonEntity, options: NormaliseOptions = {}): Lesson {
  const assetBaseUrl = options.assetBaseUrl ?? ''
  const attributes = entity.attributes ?? ({} as Record<string, any>)

  const difficultyBlocks: Record<DifficultyLevel, LessonDifficultyBlock | null> = {
    base: null,
    advance: null,
    stretch: null,
  }

  for (const block of toArray<Record<string, any>>(attributes.difficulty_specific_fields)) {
    const difficultyInfo =
      toDifficultyLevel(block?.difficulty) || toDifficultyLevel(block?.level) || toDifficultyLevel(block?.name)

    if (!difficultyInfo) {
      continue
    }

    const content = extractText(block?.content ?? block?.body)
    const level = difficultyInfo.level

    difficultyBlocks[level] = {
      id: (block?.id ?? `${entity.id}-${level}`) as StrapiId,
      difficulty: difficultyInfo.label,
      level,
      title: block?.title ?? difficultyInfo.label,
      summary: block?.summary ?? null,
      body: content.text,
      richBody: content.rich,
      media: normaliseMediaList(block?.media, assetBaseUrl),
      attachments: normaliseAttachments(block?.attachments, assetBaseUrl),
      prompts: normalisePrompts(block?.prompts),
    }
  }

  const lessonBody = extractText(attributes.body)

  const printableAttachments = normaliseMediaList(attributes.printable_attachments, assetBaseUrl)

  const loopRelation = attributes.loop?.data
  const loop = loopRelation ? normaliseLoop(loopRelation, assetBaseUrl) : null

  return {
    id: entity.id,
    title: attributes.title ?? 'Lesson',
    code: attributes.code ?? String(entity.id),
    summary: attributes.summary ?? null,
    body: lessonBody.text ?? null,
    loopReference: attributes.loop_reference ?? null,
    part: attributes.part ?? null,
    loop,
    progressOrder: attributes.progress_order ?? null,
    difficultyBlocks,
    knowledgeCards: normaliseKnowledgeCards(attributes.knowledge_cards?.data, assetBaseUrl),
    resources: normaliseResources(attributes.resources?.data, assetBaseUrl),
    studentWorks: normaliseStudentWorks(attributes.student_works?.data, assetBaseUrl),
    printableAttachments,
  }
}

export function normaliseLessonCollection(
  collection: StrapiLessonCollection,
  options: NormaliseOptions = {}
): LessonCollectionState {
  const assetBaseUrl = options.assetBaseUrl ?? ''
  const timestamp = options.timestamp ?? Date.now()

  const items = collection.data.map((entity) => normaliseLessonEntity(entity, { assetBaseUrl }))
  const meta: StrapiMeta | null = collection.meta ?? null

  return {
    items,
    meta,
    cacheTimestamp: timestamp,
  }
}
