import type { StrapiFetch } from '~/plugins/strapi-client'

export function useStrapiClient(): StrapiFetch {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$strapiFetch

  if (!client) {
    throw new Error('Strapi client is not available')
  }

  return client
}
