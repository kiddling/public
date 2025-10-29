import type { Resource, ResourceFilters, ResourcesResponse } from '~/types/resource'

export const useResources = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.strapiUrl

  const resources = ref<Resource[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchResources = async (filters?: ResourceFilters) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      
      if (filters?.category && filters.category !== 'all') {
        params.append('filters[category][$eq]', filters.category)
      }
      
      if (filters?.medium && filters.medium !== 'all') {
        params.append('filters[medium][$eq]', filters.medium)
      }
      
      if (filters?.discipline && filters.discipline !== 'all') {
        params.append('filters[disciplines][$contains]', filters.discipline)
      }

      params.append('sort[0]', 'createdAt:desc')
      params.append('pagination[pageSize]', '100')

      const url = `${apiBaseUrl}/api/resources?${params.toString()}`
      
      const response = await $fetch<ResourcesResponse>(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      resources.value = response.data || []
      
      // Client-side search filtering if search term provided
      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim()
        resources.value = resources.value.filter((resource) => {
          return (
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description?.toLowerCase().includes(searchTerm) ||
            resource.shortDescription?.toLowerCase().includes(searchTerm) ||
            resource.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
          )
        })
      }

      return resources.value
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch resources:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    resources,
    loading,
    error,
    fetchResources,
  }
}
