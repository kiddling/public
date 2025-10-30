import { computed, toValue, type MaybeRef } from 'vue'
import type { LessonStudentWork, StrapiStudentWorkCollection } from '~/types/lesson'
import { strapiStudentWorkCollectionSchema } from '~/types/lesson'
import { useStrapiCollection } from '~/composables/useStrapiCollection'
import { normaliseStudentWorks, resolveAssetBaseUrl } from '~/utils/strapi-normalize'
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

export interface UseStudentWorksOptions {
  discipline?: MaybeRef<string | string[] | null | undefined>
  loop?: MaybeRef<string | string[] | null | undefined>
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

export async function useStudentWorks(options: UseStudentWorksOptions = {}) {
  const runtimeConfig = useRuntimeConfig()

  const assetBaseUrl = computed(() =>
    resolveAssetBaseUrl({
      cdnUrl: runtimeConfig.public?.cdnUrl,
      strapiUrl: runtimeConfig.public?.strapiUrl,
    })
  )

  const baseFilter = computed<StrapiFilter>(() => {
    const filters: Record<string, unknown> = {}

    const disciplines = ensureArray(toValue(options.discipline))
    if (disciplines.length === 1) {
      filters.discipline = disciplines[0]
    } else if (disciplines.length > 1) {
      filters.discipline = { $in: disciplines }
    }

    const loops = ensureArray(toValue(options.loop))
    if (loops.length === 1) {
      filters.loop = loops[0]
    } else if (loops.length > 1) {
      filters.loop = { $in: loops }
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

    return `student-works:${hashString(stableKey(query.value))}`
  })

  const transform = (payload: StrapiStudentWorkCollection) => ({
    items: normaliseStudentWorks(payload.data, assetBaseUrl.value),
    meta: payload.meta ?? null,
    cacheTimestamp: Date.now(),
  })

  return useStrapiCollection<StrapiStudentWorkCollection, LessonStudentWork>({
    endpoint: '/student-works',
    schema: strapiStudentWorkCollectionSchema,
    query,
    key: collectionKey,
    transform,
    immediate: options.immediate,
    defaultState: () => ({ items: [], meta: null, cacheTimestamp: Date.now() }),
  })
}
