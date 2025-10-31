/**
 * Composable for fetching student works from the CMS
 * 
 * Supports filtering by discipline, loop, grade, and searching.
 */

import type { QueryParams, StudentWorkDiscipline, StudentWorkLoop } from '~/types/cms'
import type { UseCmsDataOptions } from './useCmsData'
import { useCmsData } from './useCmsData'
import { buildStrapiQuery } from '~/utils/data-layer'

const STUDENT_WORKS_ENDPOINT = '/api/cms/student-works'

export interface UseStudentWorksOptions extends UseCmsDataOptions {
  studentName?: string
  projectTitle?: string
  discipline?: StudentWorkDiscipline
  loop?: StudentWorkLoop
  grade?: string
  populate?: boolean | string[]
  filters?: QueryParams['filters']
  sort?: string | string[]
  pagination?: QueryParams['pagination']
}

export interface StudentWorksFilterParams {
  discipline?: StudentWorkDiscipline
  loop?: StudentWorkLoop
  grade?: string
  search?: string
}

/**
 * Build filter payload from filter parameters
 */
export function buildFilterPayload(params: StudentWorksFilterParams): QueryParams['filters'] {
  const filters: QueryParams['filters'] = {}

  if (params.discipline) {
    filters.discipline = { $eq: params.discipline }
  }

  if (params.loop) {
    filters.loop = { $eq: params.loop }
  }

  if (params.grade) {
    filters.grade = { $eq: params.grade }
  }

  if (params.search) {
    filters.$or = [
      { studentName: { $containsi: params.search } },
      { projectTitle: { $containsi: params.search } },
      { description: { $containsi: params.search } },
    ]
  }

  return filters
}

/**
 * Convert URL query params to filter params
 */
export function parseFilterParams(query: Record<string, any>): StudentWorksFilterParams {
  return {
    discipline: query.discipline as StudentWorkDiscipline | undefined,
    loop: query.loop as StudentWorkLoop | undefined,
    grade: query.grade as string | undefined,
    search: query.search as string | undefined,
  }
}

/**
 * Convert filter params to URL query params
 */
export function buildQueryParams(filters: StudentWorksFilterParams): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.discipline) params.discipline = filters.discipline
  if (filters.loop) params.loop = filters.loop
  if (filters.grade) params.grade = filters.grade
  if (filters.search) params.search = filters.search

  return params
}

/**
 * Fetch a single student work by ID
 */
export function useStudentWork(id: string | number, options: UseCmsDataOptions = {}) {
  const endpoint = `${STUDENT_WORKS_ENDPOINT}/${id}`
  const key = options.key ?? `student-work-${id}`

  return useCmsData(endpoint, {}, { ...options, key })
}

/**
 * Fetch multiple student works with optional filtering, sorting, and pagination
 */
export function useStudentWorks(options: UseStudentWorksOptions = {}) {
  const {
    studentName,
    projectTitle,
    discipline,
    loop,
    grade,
    populate = true,
    filters,
    sort = ['displayOrder:asc', 'createdAt:desc'],
    pagination,
    ...restOptions
  } = options

  // Build query parameters
  const queryParams: QueryParams = {}

  // Add filters
  if (filters) {
    queryParams.filters = filters
  }

  // Filter by student name if provided
  if (studentName) {
    queryParams.filters = {
      ...queryParams.filters,
      studentName: { $containsi: studentName },
    }
  }

  // Filter by project title if provided
  if (projectTitle) {
    queryParams.filters = {
      ...queryParams.filters,
      projectTitle: { $containsi: projectTitle },
    }
  }

  // Filter by discipline if provided
  if (discipline) {
    queryParams.filters = {
      ...queryParams.filters,
      discipline: { $eq: discipline },
    }
  }

  // Filter by loop if provided
  if (loop) {
    queryParams.filters = {
      ...queryParams.filters,
      loop: { $eq: loop },
    }
  }

  // Filter by grade if provided
  if (grade) {
    queryParams.filters = {
      ...queryParams.filters,
      grade: { $eq: grade },
    }
  }

  // Add sorting
  if (sort) {
    queryParams.sort = sort
  }

  // Add pagination
  if (pagination) {
    queryParams.pagination = pagination
  }

  // Add population
  if (populate) {
    if (populate === true) {
      queryParams.populate = {
        assets: '*',
        beforeAfterMedia: {
          populate: ['beforeMedia', 'afterMedia']
        },
        relatedLesson: '*'
      }
    } else if (Array.isArray(populate)) {
      queryParams.populate = populate
    }
  }

  const params = buildStrapiQuery(queryParams)
  const key = restOptions.key ?? 'student-works'

  return useCmsData(STUDENT_WORKS_ENDPOINT, params, { ...restOptions, key })
}

/**
 * Fetch student works by discipline
 */
export function useStudentWorksByDiscipline(
  discipline: StudentWorkDiscipline,
  options: UseCmsDataOptions = {},
) {
  return useStudentWorks({
    discipline,
    ...options,
    key: options.key ?? `student-works-discipline-${discipline}`,
  })
}

/**
 * Fetch student works by loop
 */
export function useStudentWorksByLoop(loop: StudentWorkLoop, options: UseCmsDataOptions = {}) {
  return useStudentWorks({
    loop,
    ...options,
    key: options.key ?? `student-works-loop-${loop}`,
  })
}

/**
 * Fetch student works by grade
 */
export function useStudentWorksByGrade(grade: string, options: UseCmsDataOptions = {}) {
  return useStudentWorks({
    grade,
    ...options,
    key: options.key ?? `student-works-grade-${grade}`,
  })
}

/**
 * Search student works by student name or description
 */
export function useSearchStudentWorks(query: string, options: UseCmsDataOptions = {}) {
  if (!query.trim()) {
    return useStudentWorks({
      ...options,
      immediate: false,
    })
  }

  return useStudentWorks({
    filters: {
      $or: [
        { studentName: { $containsi: query } },
        { description: { $containsi: query } },
        { grade: { $containsi: query } },
      ],
    },
    ...options,
    key: options.key ?? `student-works-search-${query}`,
  })
}

/**
 * Fetch featured student works (recent works)
 */
export function useFeaturedStudentWorks(options: UseCmsDataOptions = {}) {
  return useStudentWorks({
    sort: ['createdAt:desc'],
    pagination: {
      pageSize: 12,
    },
    ...options,
    key: options.key ?? 'student-works-featured',
  })
}

/**
 * Fetch student works grouped by discipline
 */
export function useStudentWorksGroupedByDiscipline(options: UseCmsDataOptions = {}) {
  const disciplines: StudentWorkDiscipline[] = ['环艺', '产品', '视传', '数媒', '公艺']

  return disciplines.map((discipline) =>
    useStudentWorksByDiscipline(discipline, {
      ...options,
      pagination: { pageSize: 20 },
    }),
  )
}
