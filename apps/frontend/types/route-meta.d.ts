import type { NavigationBreadcrumbItem } from '~/types/navigation'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: NavigationBreadcrumbItem[]
    breadcrumbHomeLabel?: string
  }
}

export {}
