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
  discipline?: StudentWorkDiscipline
  loop?: StudentWorkLoop
  grade?: string
  populate?: boolean | string[]
  filters?: QueryParams['filters']
  sort?: string | string[]
  pagination?: QueryParams['pagination']
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
    discipline,
    loop,
    grade,
    populate = true,
    filters,
    sort = ['createdAt:desc'],
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
      queryParams.populate = ['assets', 'beforeAfterMedia', 'relatedLesson']
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
