import { useAsyncData } from '#app'
import { $fetch } from 'ofetch'
import type { StrapiNavigationResponse } from '~/types/navigation'

export const COURSE_NAVIGATION_ENDPOINT = '/api/navigation'

export async function fetchCourseNavigation(): Promise<StrapiNavigationResponse> {
  return await $fetch<StrapiNavigationResponse>(COURSE_NAVIGATION_ENDPOINT)
}

interface UseCourseNavigationOptions {
  immediate?: boolean
  key?: string
}

export function useCourseNavigation(options: UseCourseNavigationOptions = {}) {
  const key = options.key ?? 'course-navigation'
  const immediate = options.immediate ?? true

  return useAsyncData(key, () => fetchCourseNavigation(), {
    immediate,
  })
}
