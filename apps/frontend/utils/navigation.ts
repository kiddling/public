import {
  NAVIGATION_PART_COLORS,
  NAVIGATION_PART_LABELS,
  NAVIGATION_PART_ORDER,
  NAVIGATION_PART_TYPES,
  type NavigationBreadcrumbItem,
  type NavigationData,
  type NavigationLesson,
  type NavigationLoop,
  type NavigationLookupMaps,
  type NavigationPart,
  type NavigationPartType,
  type StrapiNavigationLessonAttributes,
  type StrapiNavigationLoopAttributes,
  type StrapiNavigationPartAttributes,
  type StrapiNavigationResponse,
} from '~/types/navigation'
import type { StrapiCollectionItem } from '~/types/lesson'

const MAX_ORDER_VALUE = Number.MAX_SAFE_INTEGER

interface LessonSortKey {
  part: number
  loop: number
  lesson: number
  code: string
}

interface PartContext {
  part: NavigationPart
  loops: Map<string, NavigationLoop>
}

export function createEmptyNavigationMaps(): NavigationLookupMaps {
  return {
    byCode: {},
    byPart: {
      foundation: [],
      'core-blocks': [],
      'extended-thinking': [],
      appendices: [],
    },
    byLoop: {},
  }
}

export function normalizePartType(raw?: string | null): NavigationPartType {
  if (!raw) {
    return 'foundation'
  }

  const normalized = normaliseKey(raw)
  if (isNavigationPartType(normalized)) {
    return normalized
  }

  return 'foundation'
}

export function transformNavigationData(
  response: StrapiNavigationResponse | null | undefined,
): NavigationData {
  if (!response?.data?.length) {
    return {
      tree: {
        parts: [],
        lessons: [],
      },
      maps: createEmptyNavigationMaps(),
    }
  }

  const partsMap = new Map<string, PartContext>()
  const loopsMap = new Map<string, NavigationLoop>()
  const lessons: NavigationLesson[] = []
  const lessonSortKeys = new Map<string, LessonSortKey>()
  const byCode: Record<string, NavigationLesson> = {}

  for (const item of response.data) {
    const attributes = item.attributes
    if (!attributes?.code || !attributes.title) {
      continue
    }

    const partData = attributes.part?.data ?? null
    const partAttributes = partData?.attributes ?? null
    const partType = resolvePartType(attributes, partAttributes)
    const partTitle = resolvePartTitle(partType, attributes, partAttributes)
    const partDescription = partAttributes?.description ?? null
    const partColor = resolvePartColor(partType, attributes, partAttributes)
    const partOrder = resolvePartOrder(partType, attributes, partAttributes)
    const partId = partData?.id ? String(partData.id) : partType

    const partContext = ensurePartContext(
      partsMap,
      partId,
      partType,
      partTitle,
      partDescription,
      partColor,
      partOrder,
    )

    const loopData = attributes.loop?.data ?? null
    const loopAttributes = loopData?.attributes ?? null
    const loopOrder = resolveLoopOrder(attributes, loopAttributes)
    const loopTitle = resolveLoopTitle(attributes, loopAttributes)
    const loopCode = resolveLoopCode(attributes, loopAttributes)
    const loopDescription = resolveLoopDescription(attributes, loopAttributes)
    const loopId = deriveLoopId(partId, loopData, loopCode, loopTitle)

    let loop: NavigationLoop | undefined
    if (loopId) {
      loop = ensureLoop(partContext, loopId, loopCode, loopTitle, loopDescription, loopOrder)
      loopsMap.set(loopId, loop)
    }

    const lessonOrder = resolveLessonOrder(attributes)
    const metadata: Record<string, unknown> = {}
    if (attributes.slug) {
      metadata.slug = attributes.slug
    }
    if (attributes.summary) {
      metadata.summary = attributes.summary
    }
    if (attributes.metadata && typeof attributes.metadata === 'object') {
      Object.assign(metadata, attributes.metadata)
    }

    const lesson: NavigationLesson = {
      id: String(item.id),
      code: attributes.code,
      title: attributes.title,
      description: attributes.description ?? attributes.summary ?? null,
      part: partType,
      partId,
      partTitle,
      loopId,
      loopTitle: loopTitle ?? loopCode ?? null,
      order: lessonOrder,
      metadata,
      navigation: {
        previousCode: null,
        nextCode: null,
        breadcrumb: [],
      },
    }

    lessons.push(lesson)
    byCode[lesson.code] = lesson

    const sortKey: LessonSortKey = {
      part: partOrder,
      loop: loopOrder,
      lesson: lessonOrder,
      code: attributes.code.toLowerCase(),
    }
    lessonSortKeys.set(lesson.code, sortKey)
  }

  const sortedLessons = [...lessons].sort((a, b) =>
    compareSortKeys(lessonSortKeys.get(a.code), lessonSortKeys.get(b.code)),
  )

  const byPart: NavigationLookupMaps['byPart'] = {
    foundation: [],
    'core-blocks': [],
    'extended-thinking': [],
    appendices: [],
  }
  const byLoop: NavigationLookupMaps['byLoop'] = {}

  for (const [, context] of partsMap) {
    context.part.lessons = []
    for (const loop of context.loops.values()) {
      loop.lessons = []
    }
  }

  sortedLessons.forEach((lesson, index) => {
    const previousLesson = index > 0 ? sortedLessons[index - 1] : undefined
    const nextLesson = index < sortedLessons.length - 1 ? sortedLessons[index + 1] : undefined

    lesson.navigation.previousCode = previousLesson?.code ?? null
    lesson.navigation.nextCode = nextLesson?.code ?? null

    const partContext = partsMap.get(lesson.partId)
    const part = partContext?.part
    const loop = lesson.loopId ? partContext?.loops.get(lesson.loopId) : undefined

    lesson.navigation.breadcrumb = buildBreadcrumb(lesson, part, loop)

    if (part) {
      part.lessons.push(lesson)
    }

    byPart[lesson.part].push(lesson)

    if (lesson.loopId && loop) {
      loop.lessons.push(lesson)
      if (!byLoop[lesson.loopId]) {
        byLoop[lesson.loopId] = []
      }
      byLoop[lesson.loopId].push(lesson)
    }
  })

  const parts = Array.from(partsMap.values())
    .map(({ part, loops }) => {
      part.loops = Array.from(loops.values()).sort(sortLoops)
      return part
    })
    .sort(sortParts)

  const tree = {
    parts,
    lessons: sortedLessons,
  }

  const maps: NavigationLookupMaps = {
    byCode,
    byPart,
    byLoop,
  }

  return { tree, maps }
}

function resolvePartType(
  attributes: StrapiNavigationLessonAttributes,
  partAttributes: StrapiNavigationPartAttributes | null,
): NavigationPartType {
  const candidates = [partAttributes?.key, attributes.partKey, attributes.partTitle]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const normalized = normaliseKey(candidate)
    if (isNavigationPartType(normalized)) {
      return normalized
    }
  }

  return 'foundation'
}

function resolvePartTitle(
  partType: NavigationPartType,
  attributes: StrapiNavigationLessonAttributes,
  partAttributes: StrapiNavigationPartAttributes | null,
): string {
  return (
    partAttributes?.title ??
    attributes.partTitle ??
    NAVIGATION_PART_LABELS[partType] ??
    NAVIGATION_PART_LABELS.foundation
  )
}

function resolvePartColor(
  partType: NavigationPartType,
  attributes: StrapiNavigationLessonAttributes,
  partAttributes: StrapiNavigationPartAttributes | null,
): string {
  return (
    partAttributes?.color ??
    attributes.partColor ??
    NAVIGATION_PART_COLORS[partType] ??
    NAVIGATION_PART_COLORS.foundation
  )
}

function resolvePartOrder(
  partType: NavigationPartType,
  attributes: StrapiNavigationLessonAttributes,
  partAttributes: StrapiNavigationPartAttributes | null,
): number {
  return getOrderValue(partAttributes?.order, attributes.partOrder, NAVIGATION_PART_ORDER[partType])
}

function resolveLoopTitle(
  attributes: StrapiNavigationLessonAttributes,
  loopAttributes: StrapiNavigationLoopAttributes | null,
): string | null {
  return loopAttributes?.title ?? attributes.loopTitle ?? null
}

function resolveLoopCode(
  attributes: StrapiNavigationLessonAttributes,
  loopAttributes: StrapiNavigationLoopAttributes | null,
): string | null {
  return loopAttributes?.code ?? attributes.loopCode ?? null
}

function resolveLoopDescription(
  attributes: StrapiNavigationLessonAttributes,
  loopAttributes: StrapiNavigationLoopAttributes | null,
): string | null {
  return loopAttributes?.description ?? attributes.loopDescription ?? null
}

function resolveLoopOrder(
  attributes: StrapiNavigationLessonAttributes,
  loopAttributes: StrapiNavigationLoopAttributes | null,
): number {
  return getOrderValue(loopAttributes?.order, attributes.loopOrder)
}

function resolveLessonOrder(attributes: StrapiNavigationLessonAttributes): number {
  return getOrderValue(attributes.order)
}

function ensurePartContext(
  map: Map<string, PartContext>,
  partId: string,
  partType: NavigationPartType,
  title: string,
  description: string | null,
  color: string,
  order: number,
): PartContext {
  const existing = map.get(partId)

  if (existing) {
    if (!existing.part.title && title) {
      existing.part.title = title
    }
    if (!existing.part.description && description) {
      existing.part.description = description
    }
    if (!existing.part.color && color) {
      existing.part.color = color
    }
    existing.part.order = Math.min(existing.part.order, order)
    return existing
  }

  const part: NavigationPart = {
    id: partId,
    title,
    type: partType,
    description: description ?? null,
    color,
    order,
    loops: [],
    lessons: [],
  }

  const context: PartContext = {
    part,
    loops: new Map<string, NavigationLoop>(),
  }

  map.set(partId, context)
  return context
}

function ensureLoop(
  context: PartContext,
  loopId: string,
  code: string | null,
  title: string | null,
  description: string | null,
  order: number,
): NavigationLoop {
  const existing = context.loops.get(loopId)

  if (existing) {
    if (!existing.title && (title || code)) {
      existing.title = title ?? code ?? existing.title
    }
    if (!existing.description && description) {
      existing.description = description
    }
    existing.order = Math.min(existing.order, order)
    return existing
  }

  const loop: NavigationLoop = {
    id: loopId,
    code,
    title: title ?? code ?? 'Loop',
    description: description ?? null,
    order,
    lessons: [],
  }

  context.loops.set(loopId, loop)
  return loop
}

function buildBreadcrumb(
  lesson: NavigationLesson,
  part: NavigationPart | undefined,
  loop: NavigationLoop | undefined,
): NavigationBreadcrumbItem[] {
  const breadcrumb: NavigationBreadcrumbItem[] = []

  if (part) {
    breadcrumb.push({ type: 'part', id: part.id, label: part.title })
  } else {
    breadcrumb.push({
      type: 'part',
      id: lesson.partId,
      label: NAVIGATION_PART_LABELS[lesson.part] ?? lesson.part,
    })
  }

  if (lesson.loopId) {
    breadcrumb.push({
      type: 'loop',
      id: lesson.loopId,
      label: loop?.title ?? lesson.loopTitle ?? 'Loop',
    })
  }

  breadcrumb.push({ type: 'lesson', id: lesson.code, label: lesson.title })

  return breadcrumb
}

function compareSortKeys(a?: LessonSortKey, b?: LessonSortKey): number {
  const left = a ?? {
    part: MAX_ORDER_VALUE,
    loop: MAX_ORDER_VALUE,
    lesson: MAX_ORDER_VALUE,
    code: '',
  }
  const right = b ?? {
    part: MAX_ORDER_VALUE,
    loop: MAX_ORDER_VALUE,
    lesson: MAX_ORDER_VALUE,
    code: '',
  }

  if (left.part !== right.part) {
    return left.part - right.part
  }

  if (left.loop !== right.loop) {
    return left.loop - right.loop
  }

  if (left.lesson !== right.lesson) {
    return left.lesson - right.lesson
  }

  return left.code.localeCompare(right.code)
}

function sortParts(a: NavigationPart, b: NavigationPart): number {
  if (a.order !== b.order) {
    return a.order - b.order
  }

  const fallbackOrder = NAVIGATION_PART_ORDER[a.type] - NAVIGATION_PART_ORDER[b.type]
  if (fallbackOrder !== 0) {
    return fallbackOrder
  }

  return a.title.localeCompare(b.title)
}

function sortLoops(a: NavigationLoop, b: NavigationLoop): number {
  if (a.order !== b.order) {
    return a.order - b.order
  }

  return a.title.localeCompare(b.title)
}

function deriveLoopId(
  partId: string,
  loopData: StrapiCollectionItem<StrapiNavigationLoopAttributes> | null,
  loopCode: string | null,
  loopTitle: string | null,
): string | null {
  if (loopData?.id) {
    return String(loopData.id)
  }

  if (loopCode) {
    return `${partId}::${loopCode}`
  }

  if (loopTitle) {
    return `${partId}::${slugify(loopTitle)}`
  }

  return null
}

function getOrderValue(...values: Array<number | null | undefined>): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }
  return MAX_ORDER_VALUE
}

function slugify(value: string): string {
  const slug = normaliseKey(value)
  return slug || 'loop'
}

function normaliseKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isNavigationPartType(value: string): value is NavigationPartType {
  return (NAVIGATION_PART_TYPES as readonly string[]).includes(value)
}
