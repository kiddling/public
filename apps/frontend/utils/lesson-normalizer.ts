/**
 * Shared lesson normalization utility
 * Converts raw Strapi lesson data to normalized Lesson DTO
 */

import type {
  DifficultyLevel,
  Lesson,
  LessonAttachment,
  LessonDifficultyBlock,
  LessonKnowledgeCard,
  LessonLoop,
  LessonPrompt,
  LessonResource,
  StrapiCollectionItem,
  StrapiMedia,
} from '~/types/lesson'
import { useMarkdown } from '~/composables/useMarkdown'

const orderedLevels: DifficultyLevel[] = ['base', 'advance', 'stretch']

const difficultyLabels: Record<DifficultyLevel, string> = {
  base: 'Base',
  advance: 'Advance',
  stretch: 'Stretch',
}

/**
 * Normalize a raw Strapi lesson item to a Lesson DTO
 */
export function normalizeLesson(
  item: StrapiCollectionItem<Record<string, any>>,
  fallbackCode: string,
  assetBase: string = ''
): Lesson {
  const attributes = item.attributes ?? {}

  const difficultyBlocks: Record<DifficultyLevel, LessonDifficultyBlock | null> = {
    base: null,
    advance: null,
    stretch: null,
  }

  const rawBlocks = toArray(attributes.difficultyBlocks ?? attributes.difficulty_blocks ?? attributes.difficulty_specific_fields)
  for (const rawBlock of rawBlocks) {
    const blockAttributes = rawBlock?.attributes ?? rawBlock
    const level = normalizeLevel(blockAttributes?.level ?? blockAttributes?.difficulty ?? blockAttributes?.name ?? blockAttributes?.title)
    if (!level) {
      continue
    }

    const bodyHtml = determineBodyContent(blockAttributes, assetBase)
    const media = normalizeMediaList(blockAttributes?.media ?? blockAttributes?.images ?? blockAttributes?.videos, assetBase)
    const attachments = normalizeAttachments(blockAttributes?.attachments, assetBase)
    const prompts = normalizePrompts(blockAttributes?.prompts ?? blockAttributes?.questions ?? blockAttributes?.extendedPrompts)

    difficultyBlocks[level] = {
      level,
      title: blockAttributes?.title ?? difficultyLabels[level],
      summary: blockAttributes?.summary ?? blockAttributes?.description ?? null,
      body: bodyHtml?.stringContent ?? null,
      richBody: bodyHtml?.richContent ?? null,
      media,
      attachments,
      prompts,
    }
  }

  const knowledgeCards = normalizeKnowledgeCards(attributes?.knowledgeCards ?? attributes?.knowledge_cards, assetBase)
  const resources = normalizeResources(attributes?.resources, assetBase)
  const loop = normalizeLoop(attributes?.loop, assetBase)

  const lessonBody = determineBodyContent(attributes, assetBase)

  return {
    id: item.id,
    title: attributes?.title ?? 'Untitled lesson',
    code: attributes?.code ?? fallbackCode,
    summary: attributes?.summary ?? attributes?.description ?? null,
    body: lessonBody?.stringContent ?? renderRichTextToHtml(lessonBody?.richContent, assetBase) ?? null,
    loop,
    difficultyBlocks,
    knowledgeCards,
    resources,
  }
}

function determineBodyContent(value: any, assetBase: string) {
  const body = value?.body ?? value?.content ?? value?.richBody ?? value?.rich_text ?? null
  if (!body) {
    return null
  }

  if (typeof body === 'string') {
    // Check if it's markdown and render it
    const rendered = useMarkdown(body)
    return { stringContent: rendered, richContent: null }
  }

  if (Array.isArray(body) || typeof body === 'object') {
    return { stringContent: null, richContent: body }
  }

  return null
}

function normalizeLevel(input: unknown): DifficultyLevel | null {
  if (!input) {
    return null
  }

  const value = String(input).trim().toLowerCase()
  if (value.startsWith('base') || value === 'core' || value === 'b') {
    return 'base'
  }
  if (value.startsWith('adv') || value === 'a') {
    return 'advance'
  }
  if (value.startsWith('stretch') || value === 's' || value === 'extension') {
    return 'stretch'
  }
  return null
}

function toArray<T>(input: any): T[] {
  if (!input) {
    return []
  }

  if (Array.isArray(input)) {
    return input as T[]
  }

  if (Array.isArray(input?.data)) {
    return input.data as T[]
  }

  if (input?.data) {
    return [input.data as T]
  }

  return [input as T]
}

function normalizeMediaList(input: any, assetBase: string): StrapiMedia[] {
  const items = toArray<any>(input)
  return items
    .map((item) => {
      const data = item?.attributes ?? item
      const url = resolveUrl(data?.url ?? data?.src, assetBase)
      if (!url) {
        return null
      }
      return {
        id: item?.id ?? data?.id ?? url,
        url,
        mime: data?.mime ?? null,
        alternativeText: data?.alternativeText ?? data?.alt ?? null,
        caption: data?.caption ?? null,
        width: data?.width ?? null,
        height: data?.height ?? null,
        size: data?.size ?? null,
        name: data?.name ?? null,
      } satisfies StrapiMedia
    })
    .filter((media): media is StrapiMedia => media !== null)
}

function normalizeAttachments(input: any, assetBase: string): LessonAttachment[] {
  const items = toArray<any>(input)
  return items
    .map((item) => {
      const data = item?.attributes ?? item
      const url = resolveUrl(data?.url ?? data?.href, assetBase)
      if (!url) {
        return null
      }

      return {
        id: item?.id ?? data?.id ?? url,
        name: data?.name ?? data?.title ?? 'Download',
        url,
        mime: data?.mime ?? null,
        size: data?.size ?? null,
      } satisfies LessonAttachment
    })
    .filter((attachment): attachment is LessonAttachment => attachment !== null)
}

function normalizePrompts(input: any): LessonPrompt[] {
  const items = toArray<any>(input)
  return items
    .map((item, index) => {
      const data = item?.attributes ?? item
      if (!data) {
        return null
      }

      return {
        id: item?.id ?? data?.id ?? `prompt-${index}`,
        title: data?.title ?? data?.heading ?? null,
        description: data?.description ?? data?.body ?? data?.content ?? null,
      } satisfies LessonPrompt
    })
    .filter((prompt): prompt is LessonPrompt => prompt !== null)
}

function normalizeKnowledgeCards(input: any, assetBase: string): LessonKnowledgeCard[] {
  const items = toArray<any>(input)
  return items
    .map((item) => {
      const data = item?.attributes ?? item
      if (!data) {
        return null
      }

      const image = normalizeMediaList(data?.image ?? item?.image ?? data?.cover ?? data?.media, assetBase)[0] ?? null

      return {
        id: item?.id ?? data?.id ?? data?.slug ?? data?.title ?? Math.random().toString(36).slice(2),
        title: data?.title ?? 'Knowledge Card',
        summary: data?.summary ?? null,
        description: data?.description ?? null,
        slug: data?.slug ?? null,
        url: data?.url ?? data?.link ?? null,
        image,
      } satisfies LessonKnowledgeCard
    })
    .filter((card): card is LessonKnowledgeCard => card !== null)
}

function normalizeResources(input: any, assetBase: string): LessonResource[] {
  const items = toArray<any>(input)
  return items
    .map((item, index) => {
      const data = item?.attributes ?? item
      const url = data?.url ?? data?.link ?? null
      if (!url) {
        return null
      }

      const resolvedUrl = resolveUrl(url, assetBase)
      // Use local QR code generator instead of external service
      const qrCodeUrl = `/api/qr?data=${encodeURIComponent(resolvedUrl)}&size=160`

      return {
        id: item?.id ?? data?.id ?? `resource-${index}`,
        title: data?.title ?? 'Resource',
        description: data?.description ?? data?.summary ?? null,
        url: resolvedUrl,
        type: data?.type ?? data?.category ?? null,
        qrCodeUrl,
      } satisfies LessonResource
    })
    .filter((resource): resource is LessonResource => resource !== null)
}

function normalizeLoop(input: any, assetBase: string): LessonLoop | null {
  if (!input) {
    return null
  }

  const data = Array.isArray(input?.data) 
    ? input.data[0]?.attributes 
    : input?.data?.attributes ?? input?.attributes ?? input
  
  if (!data) {
    return null
  }

  return {
    id: input?.id ?? data?.id ?? null,
    title: data?.title ?? data?.name ?? null,
    summary: data?.summary ?? null,
    description: data?.description ?? null,
    order: data?.order ?? data?.position ?? null,
    slug: data?.slug ?? null,
    icon: normalizeMediaList(data?.icon, assetBase)[0] ?? null,
  }
}

function resolveUrl(url?: string | null, assetBase: string = ''): string {
  if (!url) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(url)) {
    return url
  }

  if (!assetBase) {
    return url
  }

  const normalised = url.startsWith('/') ? url : `/${url}`
  return `${assetBase}${normalised}`
}

function renderRichTextToHtml(value: unknown, assetBase: string): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(node => renderRichTextNode(node, assetBase)).join('')
  }

  if (typeof value === 'object') {
    return renderRichTextNode(value, assetBase)
  }

  return null
}

function renderRichTextNode(node: any, assetBase: string): string {
  if (!node) {
    return ''
  }

  if (typeof node === 'string') {
    return escapeHtml(node)
  }

  if (typeof node.text === 'string') {
    let text = escapeHtml(node.text)
    if (node.bold) {
      text = `<strong>${text}</strong>`
    }
    if (node.italic) {
      text = `<em>${text}</em>`
    }
    if (node.underline) {
      text = `<u>${text}</u>`
    }
    if (node.code) {
      text = `<code>${text}</code>`
    }
    return text
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child: any) => renderRichTextNode(child, assetBase)).join('')
    : ''

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
    case 'heading-one':
    case 'heading-1':
      return `<h1>${children}</h1>`
    case 'heading-two':
    case 'heading-2':
      return `<h2>${children}</h2>`
    case 'heading-three':
    case 'heading-3':
      return `<h3>${children}</h3>`
    case 'heading-four':
    case 'heading-4':
      return `<h4>${children}</h4>`
    case 'heading-five':
    case 'heading-5':
      return `<h5>${children}</h5>`
    case 'heading-six':
    case 'heading-6':
      return `<h6>${children}</h6>`
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'code':
      return `<pre><code>${children}</code></pre>`
    case 'list':
    case 'list-unordered':
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'list-ordered':
    case 'numbered-list':
    case 'ordered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link': {
      const href = resolveUrl(node.url ?? node.href ?? '#', assetBase)
      return `<a href="${href}" target="_blank" rel="noopener">${children}</a>`
    }
    case 'image': {
      const src = resolveUrl(node?.image?.url ?? node?.url ?? node?.src, assetBase)
      const alt = escapeHtml(node?.image?.alternativeText ?? node?.alt ?? '')
      return src ? `<img src="${src}" alt="${alt}" loading="lazy" />` : ''
    }
    default:
      return children
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
