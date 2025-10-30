import { computed, toValue, type MaybeRef } from 'vue'
import type { Lesson, LessonCollectionState, StrapiLessonCollection, StrapiMeta } from '~/types/lesson'
import { strapiLessonCollectionSchema } from '~/types/lesson'
import { useStrapiCollection } from '~/composables/useStrapiCollection'
import { normaliseLessonCollection, resolveAssetBaseUrl } from '~/utils/strapi-normalize'
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

export interface UseLessonsOptions {
  code?: MaybeRef<string | string[] | null | undefined>
  loop?: MaybeRef<string | string[] | null | undefined>
  part?: MaybeRef<string | string[] | null | undefined>
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

export async function useLessons(options: UseLessonsOptions = {}) {
  const runtimeConfig = useRuntimeConfig()

  const assetBaseUrl = computed(() =>
    resolveAssetBaseUrl({
      cdnUrl: runtimeConfig.public?.cdnUrl,
      strapiUrl: runtimeConfig.public?.strapiUrl,
    })
  )

  const baseFilter = computed<StrapiFilter>(() => {
    const filters: Record<string, unknown> = {}

    const codes = ensureArray(toValue(options.code))
    if (codes.length === 1) {
      filters.code = codes[0]
    } else if (codes.length > 1) {
      filters.code = { $in: codes }
    }

    const loops = ensureArray(toValue(options.loop))
    if (loops.length === 1) {
      filters.loop_reference = loops[0]
    } else if (loops.length > 1) {
      filters.loop_reference = { $in: loops }
    }

    const parts = ensureArray(toValue(options.part))
    if (parts.length === 1) {
      filters.part = parts[0]
    } else if (parts.length > 1) {
      filters.part = { $in: parts }
    }

    return buildStrapiFilter(filters)
  })

  const combinedFilters = computed(() => {
    const externalFilters = toValue(options.filters) ?? {}
    return mergeStrapiFilters(baseFilter.value, externalFilters)
  })

  const query = computed(() => {
    const populate = toValue(options.populate) ?? buildDeepPopulate(4)

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

    return `lessons:${hashString(stableKey(query.value))}`
  })

  const transform = (payload: StrapiLessonCollection): LessonCollectionState<Lesson> =>
    normaliseLessonCollection(payload, {
      assetBaseUrl: assetBaseUrl.value,
      timestamp: Date.now(),
    })

  const collection = await useStrapiCollection<StrapiLessonCollection, Lesson>({
    endpoint: '/lessons',
    schema: strapiLessonCollectionSchema,
    query,
    key: collectionKey,
    transform,
    immediate: options.immediate,
    defaultState: () => ({ items: [], meta: null as StrapiMeta | null, cacheTimestamp: Date.now() }),
  })

  return collection
}
