export type CoursePartCategory =
  | 'foundation'
  | 'core'
  | 'extended'
  | 'appendix'

export interface CourseNavigationSection {
  id: string
  title: string
  slug: string
  order: number
  level?: number | null
}

export interface CourseNavigationLesson {
  id: string | number
  code: string
  title: string
  slug: string
  summary?: string | null
  order: number
  partCode: string
  partTitle: string
  partCategory: CoursePartCategory
  loop?: number | null
  colorToken: string
  sections: CourseNavigationSection[]
}

export interface CourseNavigationPart {
  id: string | number
  code: string
  title: string
  slug?: string | null
  summary?: string | null
  description?: string | null
  category: CoursePartCategory
  order: number
  colorToken: string
  lessons: CourseNavigationLesson[]
}

export interface CourseBreadcrumbItem {
  id: string
  label: string
  to?: string
  ariaLabel?: string
}
