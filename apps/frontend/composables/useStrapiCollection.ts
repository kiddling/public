import { computed, ref, toValue, type ComputedRef, type MaybeRef, type Ref, type WatchSource } from 'vue'
import { z } from 'zod'
import type { StrapiMeta } from '~/types/lesson'
import { useStrapiClient } from '~/composables/useStrapiClient'
import type { StrapiFetch } from '~/plugins/strapi-client'

export interface StrapiCollectionState<TItem> {
  items: TItem[]
  meta: StrapiMeta | null
  cacheTimestamp: number
}

export interface UseStrapiCollectionOptions<TParsed, TItem> {
  endpoint: string
  schema: z.ZodType<TParsed>
  query: MaybeRef<Record<string, unknown>>
  key: MaybeRef<string>
  transform: (parsed: TParsed) => StrapiCollectionState<TItem>
  client?: StrapiFetch
  defaultState?: () => StrapiCollectionState<TItem>
  watch?: Array<WatchSource<unknown>>
  immediate?: boolean
}

export interface UseStrapiCollectionReturn<TItem> {
  data: Ref<StrapiCollectionState<TItem> | null>
  pending: Ref<boolean>
  error: Ref<Error | null>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  refresh: () => Promise<StrapiCollectionState<TItem> | null>
  items: ComputedRef<TItem[]>
  meta: ComputedRef<StrapiMeta | null>
  pagination: ComputedRef<StrapiMeta['pagination'] | null>
  hasCachedData: ComputedRef<boolean>
  isFallback: ComputedRef<boolean>
  isStale: ComputedRef<boolean>
}

interface CacheStore<TItem> {
  [key: string]: StrapiCollectionState<TItem>
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(
    value,
    (key, val) => {
      if (val && typeof val === 'object') {
        if (seen.has(val as object)) {
          return
        }
        seen.add(val as object)
        if (Array.isArray(val)) {
          return val
        }
        const ordered: Record<string, unknown> = {}
        for (const propertyKey of Object.keys(val as Record<string, unknown>).sort()) {
          ordered[propertyKey] = (val as Record<string, unknown>)[propertyKey]
        }
        return ordered
      }
      return val
    },
    0
  )
}

function hashString(input: string): string {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export async function useStrapiCollection<TParsed, TItem>(
  options: UseStrapiCollectionOptions<TParsed, TItem>
): Promise<UseStrapiCollectionReturn<TItem>> {
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const client = options.client ?? useStrapiClient()

  const defaultState = options.defaultState ?? (() => ({ items: [], meta: null, cacheTimestamp: 0 }))

  const queryRef = computed(() => toValue(options.query) ?? {})
  const keyRef = computed(() => toValue(options.key))
  const signatureRef = computed(() => hashString(stableStringify(queryRef.value)))
  const requestKeyRef = computed(() => `${keyRef.value}:${signatureRef.value}`)

  const cacheStore = useState<CacheStore<TItem>>('__strapi_collection_cache__', () => ({}))

  const cacheTtl = Number(runtimeConfig.strapi?.cacheTtl ?? runtimeConfig.public?.strapiCacheTtl ?? 0)
  const fallbackUsed = ref(false)

  const getCacheEntry = (key: string): StrapiCollectionState<TItem> | null => {
    const entry = cacheStore.value[key]
    if (!entry) {
      return null
    }

    return entry
  }

  const setCacheEntry = (key: string, state: StrapiCollectionState<TItem>) => {
    cacheStore.value[key] = state
  }

  const endpoint = options.endpoint.startsWith('/') ? options.endpoint : `/${options.endpoint}`

  const fetcher = async () => {
    fallbackUsed.value = false
    const params = queryRef.value

    try {
      const response = await client(endpoint, {
        method: 'GET',
        params,
      })

      const parsed = options.schema.parse(response)
      const state = options.transform(parsed)
      setCacheEntry(requestKeyRef.value, state)
      return state
    } catch (error) {
      const cached = getCacheEntry(requestKeyRef.value)
      if (cached) {
        fallbackUsed.value = true
        return cached
      }

      throw error
    }
  }

  const initialCache = getCacheEntry(requestKeyRef.value)
  const asyncData = await useAsyncData(requestKeyRef.value, fetcher, {
    server: true,
    lazy: options.immediate === false,
    default: () => initialCache ?? defaultState(),
    watch: [...(options.watch ?? []), queryRef, requestKeyRef],
  })

  const items = computed(() => asyncData.data.value?.items ?? defaultState().items)
  const meta = computed(() => asyncData.data.value?.meta ?? null)
  const pagination = computed(() => meta.value?.pagination ?? null)

  const hasCachedData = computed(() => Boolean(getCacheEntry(requestKeyRef.value)))
  const isFallback = computed(() => fallbackUsed.value)
  const isStale = computed(() => {
    const cacheEntry = getCacheEntry(requestKeyRef.value)
    if (!cacheEntry) {
      return false
    }

    if (!cacheTtl || cacheTtl <= 0) {
      return false
    }

    return Date.now() - cacheEntry.cacheTimestamp > cacheTtl
  })

  const refresh = async () => {
    fallbackUsed.value = false
    const result = await asyncData.refresh()
    return result ?? null
  }

  return {
    data: asyncData.data,
    pending: asyncData.pending,
    error: asyncData.error,
    status: asyncData.status,
    refresh,
    items,
    meta,
    pagination,
    hasCachedData,
    isFallback,
    isStale,
  }
}
