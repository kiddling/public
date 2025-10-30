import { computed, toValue, type MaybeRef } from 'vue'
import type { LessonKnowledgeCard, StrapiKnowledgeCardCollection } from '~/types/lesson'
import { strapiKnowledgeCardCollectionSchema } from '~/types/lesson'
import { useStrapiCollection } from '~/composables/useStrapiCollection'
import { normaliseKnowledgeCards, resolveAssetBaseUrl } from '~/utils/strapi-normalize'
import {
  buildDeepPopulate,
  buildStrapiFilter,
  buildStrapiQuery,
  mergeStrapiFilters,
  type StrapiFilter,
  type StrapiPaginationInput,
  type StrapiPopulateInput,
  type StrapiSortInput,
} from '~/utils/strapi-query'

export interface UseKnowledgeCardsOptions {
  type?: MaybeRef<string | null | undefined>
  tags?: MaybeRef<string | string[] | null | undefined>
  filters?: MaybeRef<StrapiFilter | undefined>
  pagination?: MaybeRef<StrapiPaginationInput | undefined>
  sort?: MaybeRef<StrapiSortInput | undefined>
  populate?: MaybeRef<StrapiPopulateInput | undefined>
  fields?: MaybeRef<string[] | undefined>
  locale?: MaybeRef<string | undefined>
  key?: MaybeRef<string | undefined>
  immediate?: boolean
}

function ensureArray(input: string | string[] | null | undefined): string[] {
  if (!input) {
    return []
  }
  return Array.isArray(input) ? input.filter(Boolean) : [input]
}

function hashString(input: string): string {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function stableKey(input: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(
    input,
    (key, value) => {
      if (value && typeof value === 'object') {
        if (seen.has(value as object)) {
          return
        }
        seen.add(value as object)
        if (Array.isArray(value)) {
          return value
        }
        const ordered: Record<string, unknown> = {}
        for (const propertyKey of Object.keys(value as Record<string, unknown>).sort()) {
          ordered[propertyKey] = (value as Record<string, unknown>)[propertyKey]
        }
        return ordered
      }
      return value
    },
    0
  )
}

export async function useKnowledgeCards(options: UseKnowledgeCardsOptions = {}) {
  const runtimeConfig = useRuntimeConfig()

  const assetBaseUrl = computed(() =>
    resolveAssetBaseUrl({
      cdnUrl: runtimeConfig.public?.cdnUrl,
      strapiUrl: runtimeConfig.public?.strapiUrl,
    })
  )

  const baseFilter = computed<StrapiFilter>(() => {
    const filters: Record<string, unknown> = {}

    const cardType = toValue(options.type)
    if (cardType) {
      filters.type = cardType
    }

    const tags = ensureArray(toValue(options.tags))
    if (tags.length === 1) {
      filters.tags = { $containsi: tags[0] }
    } else if (tags.length > 1) {
      filters.$and = tags.map((tag) => ({ tags: { $containsi: tag } }))
    }

    return buildStrapiFilter(filters)
  })

  const combinedFilters = computed(() => {
    const external = toValue(options.filters) ?? {}
    return mergeStrapiFilters(baseFilter.value, external)
  })

  const query = computed(() => {
    const populate = toValue(options.populate) ?? buildDeepPopulate(2)

    return buildStrapiQuery({
      filters: combinedFilters.value,
      pagination: toValue(options.pagination),
      sort: toValue(options.sort),
      populate,
      fields: toValue(options.fields),
      locale: toValue(options.locale),
    })
  })

  const collectionKey = computed(() => {
    const explicitKey = toValue(options.key)
    if (explicitKey) {
      return explicitKey
    }

    return `knowledge-cards:${hashString(stableKey(query.value))}`
  })

  const transform = (payload: StrapiKnowledgeCardCollection) => ({
    items: normaliseKnowledgeCards(payload.data, assetBaseUrl.value),
    meta: payload.meta ?? null,
    cacheTimestamp: Date.now(),
  })

  return useStrapiCollection<StrapiKnowledgeCardCollection, LessonKnowledgeCard>({
    endpoint: '/knowledge-cards',
    schema: strapiKnowledgeCardCollectionSchema,
    query,
    key: collectionKey,
    transform,
    immediate: options.immediate,
    defaultState: () => ({ items: [], meta: null, cacheTimestamp: Date.now() }),
  })
}
