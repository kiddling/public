export type Primitive = string | number | boolean

export type StrapiFilterOperator =
  | '$eq'
  | '$ne'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$in'
  | '$notIn'
  | '$between'
  | '$contains'
  | '$notContains'
  | '$containsi'
  | '$notContainsi'
  | '$startsWith'
  | '$endsWith'
  | '$null'
  | '$notNull'

export type StrapiLogicalOperator = '$and' | '$or' | '$not'

export type StrapiFilterOperators = Partial<Record<StrapiFilterOperator, Primitive | Primitive[]>>

export type StrapiFilter = {
  [key: string]: StrapiFilter | StrapiFilterOperators | Primitive | Primitive[] | undefined
} & Partial<Record<StrapiLogicalOperator, StrapiFilter[]>>

export interface StrapiPaginationInput {
  page?: number
  pageSize?: number
  start?: number
  limit?: number
}

export type StrapiSortInput =
  | string
  | Array<string | { field: string; order?: 'asc' | 'desc' }>
  | { field: string; order?: 'asc' | 'desc' }

export type StrapiPopulateInput =
  | true
  | string
  | string[]
  | Record<string, StrapiPopulateInput | boolean | string | string[]>

export interface BuildStrapiQueryOptions {
  filters?: StrapiFilter
  pagination?: StrapiPaginationInput
  sort?: StrapiSortInput
  populate?: StrapiPopulateInput
  fields?: string[]
  locale?: string
  publicationState?: 'live' | 'preview'
  [key: string]: unknown
}

export type StrapiQueryParams = Record<string, string | number | boolean>

const LOGICAL_OPERATORS: StrapiLogicalOperator[] = ['$and', '$or', '$not']

const FILTER_OPERATORS: StrapiFilterOperator[] = [
  '$eq',
  '$ne',
  '$lt',
  '$lte',
  '$gt',
  '$gte',
  '$in',
  '$notIn',
  '$between',
  '$contains',
  '$notContains',
  '$containsi',
  '$notContainsi',
  '$startsWith',
  '$endsWith',
  '$null',
  '$notNull',
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isOperatorObject(value: unknown): value is StrapiFilterOperators {
  if (!isPlainObject(value)) {
    return false
  }

  return Object.keys(value).every((key) => FILTER_OPERATORS.includes(key as StrapiFilterOperator))
}

function isLogicalOperatorKey(key: string): key is StrapiLogicalOperator {
  return LOGICAL_OPERATORS.includes(key as StrapiLogicalOperator)
}

export function buildStrapiFilter(
  input: Record<string, Primitive | Primitive[] | StrapiFilterOperators | StrapiFilter | undefined | null>
): StrapiFilter {
  const result: StrapiFilter = {}

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue
    }

    if (isLogicalOperatorKey(key)) {
      const logicalValue = Array.isArray(value) ? (value as StrapiFilter[]) : [value as StrapiFilter]
      result[key] = logicalValue.map((item) => buildStrapiFilter(item as Record<string, unknown>))
      continue
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((item) => item !== undefined && item !== null)
      if (filtered.length === 0) {
        continue
      }
      result[key] = { $in: filtered as Primitive[] }
      continue
    }

    if (isOperatorObject(value)) {
      result[key] = value
      continue
    }

    if (isPlainObject(value)) {
      result[key] = buildStrapiFilter(value as Record<string, unknown>)
      continue
    }

    result[key] = { $eq: value as Primitive }
  }

  return result
}

export function mergeStrapiFilters(...filters: Array<StrapiFilter | undefined | null>): StrapiFilter {
  const result: StrapiFilter = {}

  for (const filter of filters) {
    if (!filter) {
      continue
    }

    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) {
        continue
      }

      if (isLogicalOperatorKey(key)) {
        const existing = Array.isArray(result[key]) ? (result[key] as StrapiFilter[]) : []
        const incoming = Array.isArray(value) ? (value as StrapiFilter[]) : [value as StrapiFilter]
        result[key] = [...existing, ...incoming]
        continue
      }

      const existingValue = result[key]

      if (isPlainObject(value) && isPlainObject(existingValue)) {
        result[key] = mergeStrapiFilters(existingValue as StrapiFilter, value as StrapiFilter)
        continue
      }

      result[key] = value
    }
  }

  return result
}

export function isEmptyStrapiFilter(filter?: StrapiFilter | null): boolean {
  if (!filter) {
    return true
  }

  return Object.keys(filter).length === 0
}

function assignParam(target: StrapiQueryParams, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      assignParam(target, `${key}[${index}]`, entry)
    })
    return
  }

  if (isPlainObject(value)) {
    for (const [childKey, childValue] of Object.entries(value)) {
      assignParam(target, `${key}[${childKey}]`, childValue)
    }
    return
  }

  target[key] = typeof value === 'number' || typeof value === 'boolean' ? value : String(value)
}

function sanitizePagination(pagination: StrapiPaginationInput | undefined): StrapiPaginationInput | undefined {
  if (!pagination) {
    return undefined
  }

  const sanitized: StrapiPaginationInput = {}

  if (pagination.page !== undefined) {
    sanitized.page = Number.parseInt(String(pagination.page), 10)
  }

  if (pagination.pageSize !== undefined) {
    sanitized.pageSize = Number.parseInt(String(pagination.pageSize), 10)
  }

  if (pagination.start !== undefined) {
    sanitized.start = Number.parseInt(String(pagination.start), 10)
  }

  if (pagination.limit !== undefined) {
    sanitized.limit = Number.parseInt(String(pagination.limit), 10)
  }

  return sanitized
}

function normalizeSort(sort: StrapiSortInput | undefined): string[] | undefined {
  if (!sort) {
    return undefined
  }

  const items = Array.isArray(sort) ? sort : [sort]
  const result: string[] = []

  for (const item of items) {
    if (!item) {
      continue
    }

    if (typeof item === 'string') {
      result.push(item)
      continue
    }

    const order = item.order ?? 'asc'
    result.push(`${item.field}:${order}`)
  }

  return result.length > 0 ? result : undefined
}

function normalizePopulate(populate: StrapiPopulateInput | undefined): StrapiPopulateInput | undefined {
  if (populate === undefined) {
    return undefined
  }

  if (populate === true || typeof populate === 'string' || Array.isArray(populate)) {
    return populate
  }

  if (isPlainObject(populate)) {
    const normalized: Record<string, StrapiPopulateInput | boolean | string | string[]> = {}
    for (const [key, value] of Object.entries(populate)) {
      if (value === undefined || value === null) {
        continue
      }
      normalized[key] = normalizePopulate(value as StrapiPopulateInput) ?? true
    }
    return normalized
  }

  return undefined
}

export function buildStrapiQuery(options: BuildStrapiQueryOptions = {}): StrapiQueryParams {
  const params: StrapiQueryParams = {}

  if (options.filters && !isEmptyStrapiFilter(options.filters)) {
    assignParam(params, 'filters', options.filters)
  }

  const pagination = sanitizePagination(options.pagination)
  if (pagination) {
    assignParam(params, 'pagination', pagination)
  }

  if (options.fields && options.fields.length > 0) {
    assignParam(params, 'fields', options.fields)
  }

  const sort = normalizeSort(options.sort)
  if (sort && sort.length > 0) {
    assignParam(params, 'sort', sort)
  }

  const populate = normalizePopulate(options.populate)
  if (populate === true) {
    params.populate = '*'
  } else if (typeof populate === 'string') {
    params.populate = populate
  } else if (Array.isArray(populate)) {
    populate.forEach((relation) => {
      assignParam(params, `populate[${relation}]`, true)
    })
  } else if (populate) {
    assignParam(params, 'populate', populate)
  }

  if (options.locale) {
    params.locale = options.locale
  }

  if (options.publicationState) {
    params.publicationState = options.publicationState
  }

  return params
}

export function buildStrapiPagination(pagination?: StrapiPaginationInput): StrapiPaginationInput | undefined {
  return sanitizePagination(pagination)
}

export function buildStrapiSort(sort?: StrapiSortInput): string[] | undefined {
  return normalizeSort(sort)
}

export function buildStrapiPopulate(populate?: StrapiPopulateInput): StrapiPopulateInput | undefined {
  return normalizePopulate(populate)
}

export function buildDeepPopulate(level = 3): string {
  const depth = Math.min(Math.max(Math.trunc(level), 1), 5)
  return depth === 1 ? 'deep' : `deep,${depth}`
}
