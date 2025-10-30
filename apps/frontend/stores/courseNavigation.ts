import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import type {
  CourseBreadcrumbItem,
  CourseNavigationLesson,
  CourseNavigationPart,
  CourseNavigationSection,
  CoursePartCategory,
} from '~/types/navigation'
import type { StrapiCollectionItem, StrapiCollectionResponse } from '~/types/lesson'

export const PART_CATEGORY_THEME: Record<
  CoursePartCategory,
  {
    indicator: string
    badge: string
    text: string
    border: string
    ring: string
  }
> = {
  foundation: {
    indicator: 'bg-sky-500 dark:bg-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
    text: 'text-sky-700 dark:text-sky-200',
    border: 'border-sky-200 dark:border-sky-500/40',
    ring: 'focus-visible:ring-sky-500',
  },
  core: {
    indicator: 'bg-emerald-500 dark:bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    text: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-500/40',
    ring: 'focus-visible:ring-emerald-500',
  },
  extended: {
    indicator: 'bg-fuchsia-500 dark:bg-fuchsia-400',
    badge: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
    text: 'text-fuchsia-700 dark:text-fuchsia-200',
    border: 'border-fuchsia-200 dark:border-fuchsia-500/40',
    ring: 'focus-visible:ring-fuchsia-500',
  },
  appendix: {
    indicator: 'bg-amber-500 dark:bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-500/40',
    ring: 'focus-visible:ring-amber-500',
  },
}

const PART_ENDPOINT_CANDIDATES = ['/api/course-navigation', '/api/course-parts', '/api/parts']

const normalizeCode = (value: unknown) =>
  value ? String(value).trim().toUpperCase() : ''

const toArray = <T>(input: any): T[] => {
  if (!input) return []
  if (Array.isArray(input)) return input as T[]
  if (Array.isArray(input?.data)) return input.data as T[]
  if (input?.data) return [input.data as T]
  return [input as T]
}

const categoryAliases: Record<string, CoursePartCategory> = {
  foundation: 'foundation',
  foundations: 'foundation',
  base: 'foundation',
  core: 'core',
  'core blocks': 'core',
  'core-blocks': 'core',
  essential: 'core',
  extended: 'extended',
  extension: 'extended',
  stretch: 'extended',
  enrichment: 'extended',
  appendix: 'appendix',
  appendices: 'appendix',
  supplemental: 'appendix',
}

const normaliseCategory = (value: unknown): CoursePartCategory => {
  if (!value) return 'foundation'
  const key = String(value).trim().toLowerCase()
  return categoryAliases[key] ?? 'foundation'
}

const normaliseSection = (
  raw: any,
  index: number,
  fallbackLessonSlug: string
): CourseNavigationSection => {
  const attributes = raw?.attributes ?? raw ?? {}
  const slug = attributes?.slug ?? attributes?.anchor ?? attributes?.id ?? `${fallbackLessonSlug}-section-${index}`

  return {
    id: String(attributes?.id ?? slug ?? index),
    title: attributes?.title ?? attributes?.name ?? `Section ${index + 1}`,
    slug: String(slug).replace(/^#/, ''),
    order: attributes?.order ?? attributes?.position ?? index,
    level: attributes?.level ?? null,
  }
}

const normaliseLesson = (
  raw: any,
  index: number,
  part: CourseNavigationPart
): CourseNavigationLesson => {
  const data = raw?.attributes ?? raw ?? {}
  const code = normalizeCode(data?.code ?? data?.identifier ?? `L-${index + 1}`)
  const slug = data?.slug ?? code.toLowerCase()
  const sections = toArray<any>(data?.sections ?? data?.contentSections ?? data?.chapters).map((section, sectionIndex) =>
    normaliseSection(section, sectionIndex, slug)
  )

  return {
    id: raw?.id ?? data?.id ?? `${part.code}-${code}`,
    code,
    title: data?.title ?? data?.name ?? code,
    slug,
    summary: data?.summary ?? data?.description ?? null,
    order: data?.order ?? data?.position ?? index,
    partCode: part.code,
    partTitle: part.title,
    partCategory: part.category,
    loop: data?.loop ?? data?.loopIndex ?? null,
    colorToken: part.colorToken,
    sections,
  }
}

const normalisePart = (raw: any, index: number): CourseNavigationPart => {
  const data = raw?.attributes ?? raw ?? {}
  const code = normalizeCode(data?.code ?? data?.identifier ?? data?.title ?? `P-${index + 1}`)
  const category = normaliseCategory(data?.category ?? data?.type ?? data?.tag)
  const lessons = toArray<any>(data?.lessons ?? data?.items ?? data?.entries).map((lesson, lessonIndex) =>
    normaliseLesson(lesson, lessonIndex, {
      id: raw?.id ?? data?.id ?? code,
      code,
      title: data?.title ?? data?.name ?? `Part ${index + 1}`,
      slug: data?.slug ?? null,
      summary: data?.summary ?? data?.description ?? null,
      description: data?.description ?? null,
      category,
      order: data?.order ?? data?.position ?? index,
      colorToken: category,
      lessons: [],
    })
  )

  lessons.sort((a, b) => a.order - b.order || a.code.localeCompare(b.code))

  return {
    id: raw?.id ?? data?.id ?? code,
    code,
    title: data?.title ?? data?.name ?? `Part ${index + 1}`,
    slug: data?.slug ?? null,
    summary: data?.summary ?? data?.description ?? null,
    description: data?.description ?? null,
    category,
    order: data?.order ?? data?.position ?? index,
    colorToken: category,
    lessons,
  }
}

const mapStrapiToNavigation = (items: Array<StrapiCollectionItem<Record<string, any>> | Record<string, any>>) => {
  return items
    .map((item, index) => normalisePart(item, index))
    .filter((part) => part.lessons.length > 0)
    .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code))
}

const SAMPLE_STRUCTURE: CourseNavigationPart[] = [
  {
    id: 'foundation',
    code: 'FND',
    title: 'Foundation Loop',
    slug: 'foundation-loop',
    summary: 'Core introductory lessons for the spiral.',
    description: null,
    category: 'foundation',
    order: 0,
    colorToken: 'foundation',
    lessons: [
      { id: '1', code: 'P-00', title: 'Orientation & Warm Up', slug: 'p-00', summary: null, order: 0, partCode: 'FND', partTitle: 'Foundation Loop', partCategory: 'foundation', loop: 1, colorToken: 'foundation', sections: [] },
      { id: '2', code: 'P-01', title: 'Practice Loop 1', slug: 'p-01', summary: null, order: 1, partCode: 'FND', partTitle: 'Foundation Loop', partCategory: 'foundation', loop: 1, colorToken: 'foundation', sections: [] },
      { id: '3', code: 'P-02', title: 'Practice Loop 2', slug: 'p-02', summary: null, order: 2, partCode: 'FND', partTitle: 'Foundation Loop', partCategory: 'foundation', loop: 1, colorToken: 'foundation', sections: [] },
      { id: '4', code: 'P-03', title: 'Reflection & Share', slug: 'p-03', summary: null, order: 3, partCode: 'FND', partTitle: 'Foundation Loop', partCategory: 'foundation', loop: 1, colorToken: 'foundation', sections: [] },
    ],
  },
  {
    id: 'core-blocks',
    code: 'CORE',
    title: 'Core Blocks',
    slug: 'core-blocks',
    summary: 'Main learning cycle.',
    description: null,
    category: 'core',
    order: 1,
    colorToken: 'core',
    lessons: [
      { id: '5', code: 'PA-01', title: 'Core Block A1', slug: 'pa-01', summary: null, order: 0, partCode: 'CORE', partTitle: 'Core Blocks', partCategory: 'core', loop: 2, colorToken: 'core', sections: [] },
      { id: '6', code: 'PA-02', title: 'Core Block A2', slug: 'pa-02', summary: null, order: 1, partCode: 'CORE', partTitle: 'Core Blocks', partCategory: 'core', loop: 2, colorToken: 'core', sections: [] },
      { id: '7', code: 'PB-01', title: 'Core Block B1', slug: 'pb-01', summary: null, order: 2, partCode: 'CORE', partTitle: 'Core Blocks', partCategory: 'core', loop: 2, colorToken: 'core', sections: [] },
      { id: '8', code: 'PB-02', title: 'Core Block B2', slug: 'pb-02', summary: null, order: 3, partCode: 'CORE', partTitle: 'Core Blocks', partCategory: 'core', loop: 2, colorToken: 'core', sections: [] },
    ],
  },
  {
    id: 'extended-thinking',
    code: 'EXT',
    title: 'Extended Thinking',
    slug: 'extended-thinking',
    summary: 'Stretch goals and enrichment.',
    description: null,
    category: 'extended',
    order: 2,
    colorToken: 'extended',
    lessons: [
      { id: '9', code: 'PC-01', title: 'Extended Challenge 1', slug: 'pc-01', summary: null, order: 0, partCode: 'EXT', partTitle: 'Extended Thinking', partCategory: 'extended', loop: 3, colorToken: 'extended', sections: [] },
      { id: '10', code: 'PC-02', title: 'Extended Challenge 2', slug: 'pc-02', summary: null, order: 1, partCode: 'EXT', partTitle: 'Extended Thinking', partCategory: 'extended', loop: 3, colorToken: 'extended', sections: [] },
      { id: '11', code: 'PD-01', title: 'Capstone Prep', slug: 'pd-01', summary: null, order: 2, partCode: 'EXT', partTitle: 'Extended Thinking', partCategory: 'extended', loop: 3, colorToken: 'extended', sections: [] },
      { id: '12', code: 'PD-02', title: 'Capstone Showcase', slug: 'pd-02', summary: null, order: 3, partCode: 'EXT', partTitle: 'Extended Thinking', partCategory: 'extended', loop: 3, colorToken: 'extended', sections: [] },
    ],
  },
]

interface CourseNavigationState {
  parts: CourseNavigationPart[]
  loading: boolean
  error: string | null
  initialized: boolean
  searchTerm: string
  expandedPartCodes: Set<string>
  activeLessonCode: string | null
  activeSection: CourseNavigationSection | null
}

export const useCourseNavigationStore = defineStore('courseNavigation', () => {
  const state = reactive<CourseNavigationState>({
    parts: [],
    loading: false,
    error: null,
    initialized: false,
    searchTerm: '',
    expandedPartCodes: new Set<string>(),
    activeLessonCode: null,
    activeSection: null,
  })

  const allParts = computed(() => state.parts)

  const lessonLookup = computed<Record<string, CourseNavigationLesson>>(() => {
    const lookup: Record<string, CourseNavigationLesson> = {}
    for (const part of state.parts) {
      for (const lesson of part.lessons) {
        lookup[lesson.code] = lesson
      }
    }
    return lookup
  })

  const partLookup = computed<Record<string, CourseNavigationPart>>(() => {
    const lookup: Record<string, CourseNavigationPart> = {}
    for (const part of state.parts) {
      lookup[part.code] = part
    }
    return lookup
  })

  const flattenedLessons = computed(() =>
    state.parts.flatMap((part) => part.lessons.map((lesson) => ({ ...lesson })))
  )

  const trimmedSearch = computed(() => state.searchTerm.trim().toLowerCase())

  const filteredParts = computed(() => {
    if (!trimmedSearch.value) {
      return state.parts
    }

    return state.parts
      .map((part) => {
        const partMatches = `${part.code} ${part.title}`.toLowerCase().includes(trimmedSearch.value)

        const filteredLessons = part.lessons
          .map((lesson) => {
            const lessonMatches = `${lesson.code} ${lesson.title}`
              .toLowerCase()
              .includes(trimmedSearch.value)

            if (!lesson.sections.length) {
              return lessonMatches ? lesson : null
            }

            const filteredSections = lesson.sections.filter((section) =>
              `${section.title} ${section.slug}`.toLowerCase().includes(trimmedSearch.value)
            )

            if (lessonMatches || filteredSections.length) {
              return {
                ...lesson,
                sections: filteredSections.length ? filteredSections : lesson.sections,
              }
            }

            return null
          })
          .filter((lesson): lesson is CourseNavigationLesson => lesson !== null)

        if (partMatches || filteredLessons.length) {
          return {
            ...part,
            lessons: filteredLessons.length ? filteredLessons : part.lessons,
          }
        }

        return null
      })
      .filter((part): part is CourseNavigationPart => part !== null)
  })

  const activeLesson = computed(() => {
    const code = state.activeLessonCode
    if (!code) return null
    return lessonLookup.value[code] ?? null
  })

  const breadcrumbs = computed<CourseBreadcrumbItem[]>(() => {
    const items: CourseBreadcrumbItem[] = []
    const lesson = activeLesson.value
    if (!lesson) {
      return items
    }

    const part = partLookup.value[lesson.partCode] ?? null
    if (part) {
      items.push({
        id: part.code,
        label: part.title,
        ariaLabel: `${part.title} part`,
      })
    }

    items.push({
      id: lesson.code,
      label: `${lesson.code} · ${lesson.title}`,
      to: `/lessons/${lesson.code}`,
      ariaLabel: `Lesson ${lesson.code}: ${lesson.title}`,
    })

    if (state.activeSection) {
      items.push({
        id: state.activeSection.id,
        label: state.activeSection.title,
        to: `/lessons/${lesson.code}#${state.activeSection.slug}`,
      })
    }

    return items
  })

  const isPartExpanded = (code: string) => state.expandedPartCodes.has(code)

  const setPartExpanded = (code: string, expanded: boolean) => {
    const next = new Set(state.expandedPartCodes)
    if (expanded) {
      next.add(code)
    } else {
      next.delete(code)
    }
    state.expandedPartCodes = next
  }

  const togglePart = (code: string) => {
    setPartExpanded(code, !isPartExpanded(code))
  }

  const setActiveLesson = (codeOrLesson: string | CourseNavigationLesson | null) => {
    const nextCode =
      typeof codeOrLesson === 'string'
        ? normalizeCode(codeOrLesson)
        : codeOrLesson?.code ?? null

    state.activeLessonCode = nextCode
    state.activeSection = null

    if (nextCode) {
      const lesson = lessonLookup.value[nextCode]
      if (lesson) {
        setPartExpanded(lesson.partCode, true)
      }
    }
  }

  const setActiveSection = (section: CourseNavigationSection | null) => {
    state.activeSection = section
  }

  const setActiveSectionBySlug = (slug: string | null | undefined) => {
    if (!slug) {
      state.activeSection = null
      return
    }
    const normalized = String(slug).replace(/^#/, '')
    const lesson = activeLesson.value
    if (!lesson) {
      state.activeSection = null
      return
    }
    state.activeSection = lesson.sections.find((section) => section.slug === normalized) ?? null
  }

  const setLessonSections = (lessonCode: string, sections: CourseNavigationSection[]) => {
    const normalized = normalizeCode(lessonCode)
    if (!normalized) return

    for (const part of state.parts) {
      const lessonIndex = part.lessons.findIndex((lesson) => lesson.code === normalized)
      if (lessonIndex !== -1) {
        part.lessons[lessonIndex].sections = [...sections]
        if (
          state.activeLessonCode === normalized &&
          state.activeSection &&
          !sections.find((section) => section.slug === state.activeSection?.slug)
        ) {
          state.activeSection = null
        }
        return
      }
    }
  }

  const setSearchTerm = (value: string) => {
    state.searchTerm = value
  }

  const clearSearch = () => {
    state.searchTerm = ''
  }

  const lessonCodes = computed(() => flattenedLessons.value.map((lesson) => lesson.code))

  const attemptFetch = async (endpoint: string) => {
    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()

    const headers: Record<string, string> = {}
    if (config.strapiApiToken) {
      headers.Authorization = `Bearer ${config.strapiApiToken}`
    }

    const params = {
      populate: {
        lessons: {
          populate: ['sections'],
        },
      },
      sort: ['order:asc', 'code:asc'],
    }

    const base = config.public?.strapiUrl ?? config.public?.apiBaseUrl ?? ''
    const baseUrl = base.replace(/\/$/, '')
    const url = `${baseUrl}${endpoint}`

    const response = await nuxtApp.$fetch<StrapiCollectionResponse<Record<string, any>> | { data: any[] }>(url, {
      params,
      headers,
      retry: 1,
    })

    const data = Array.isArray(response?.data) ? response.data : []
    if (!data.length) {
      return [] as CourseNavigationPart[]
    }

    return mapStrapiToNavigation(data)
  }

  const fetchStructure = async (force = false) => {
    if (state.loading) return state.parts

    if (state.initialized && !force) {
      return state.parts
    }

    state.loading = true
    state.error = null

    try {
      for (const endpoint of PART_ENDPOINT_CANDIDATES) {
        try {
          const parts = await attemptFetch(endpoint)
          if (parts.length) {
            state.parts = parts
            state.initialized = true
            state.error = null
            state.expandedPartCodes = new Set(parts.map((part) => part.code))
            return state.parts
          }
        } catch (error) {
          console.warn(`[courseNavigation] Failed to load from ${endpoint}`, error)
          state.error = `Unable to load course navigation from ${endpoint}`
        }
      }

      if (!state.parts.length) {
        state.parts = SAMPLE_STRUCTURE
        state.initialized = true
        state.error =
          state.error ??
          'Navigation data could not be fetched from Strapi. Using fallback structure.'
        state.expandedPartCodes = new Set(state.parts.map((part) => part.code))
      }

      return state.parts
    } finally {
      state.loading = false
    }
  }

  const ensureInitialized = async () => {
    if (state.initialized) return state.parts
    return fetchStructure()
  }

  return {
    allParts,
    filteredParts,
    flattenedLessons,
    lessonCodes,
    breadcrumbs,
    activeLesson,
    state,
    fetchStructure,
    ensureInitialized,
    setActiveLesson,
    setActiveSection,
    setActiveSectionBySlug,
    setLessonSections,
    setPartExpanded,
    togglePart,
    isPartExpanded,
    setSearchTerm,
    clearSearch,
  }
})

export const courseNavigationInternals = {
  normalizeCode,
  normaliseSection,
  normalisePart,
  mapStrapiToNavigation,
  SAMPLE_STRUCTURE,
  normaliseCategory,
}
