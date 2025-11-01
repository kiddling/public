import type { SitemapUrl } from '#sitemap/types'

export default defineEventHandler(async (event): Promise<SitemapUrl[]> => {
  const config = useRuntimeConfig()
  const strapiUrl = config.public.strapiUrl
  const apiToken = config.strapiApiToken

  const urls: SitemapUrl[] = []

  try {
    // Fetch lessons from Strapi
    const lessonsResponse = await $fetch<any>(`${strapiUrl}/api/lessons`, {
      headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
      params: {
        'pagination[limit]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
      },
    })

    if (lessonsResponse?.data) {
      lessonsResponse.data.forEach((lesson: any) => {
        if (lesson.slug) {
          urls.push({
            loc: `/lessons/${lesson.slug}`,
            lastmod: lesson.updatedAt,
            changefreq: 'weekly',
            priority: 0.8,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching lessons for sitemap:', error)
  }

  try {
    // Fetch knowledge cards from Strapi
    const cardsResponse = await $fetch<any>(`${strapiUrl}/api/knowledge-cards`, {
      headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
      params: {
        'pagination[limit]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
      },
    })

    if (cardsResponse?.data) {
      cardsResponse.data.forEach((card: any) => {
        if (card.slug) {
          urls.push({
            loc: `/knowledge-cards/${card.slug}`,
            lastmod: card.updatedAt,
            changefreq: 'weekly',
            priority: 0.7,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching knowledge cards for sitemap:', error)
  }

  try {
    // Fetch resources from Strapi
    const resourcesResponse = await $fetch<any>(`${strapiUrl}/api/resources`, {
      headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
      params: {
        'pagination[limit]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
      },
    })

    if (resourcesResponse?.data) {
      resourcesResponse.data.forEach((resource: any) => {
        if (resource.slug) {
          urls.push({
            loc: `/resources/${resource.slug}`,
            lastmod: resource.updatedAt,
            changefreq: 'monthly',
            priority: 0.6,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching resources for sitemap:', error)
  }

  try {
    // Fetch student works from Strapi
    const studentsResponse = await $fetch<any>(`${strapiUrl}/api/student-works`, {
      headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
      params: {
        'pagination[limit]': 100,
        'fields[0]': 'id',
        'fields[1]': 'updatedAt',
      },
    })

    if (studentsResponse?.data) {
      studentsResponse.data.forEach((student: any) => {
        if (student.id) {
          urls.push({
            loc: `/students/${student.id}`,
            lastmod: student.updatedAt,
            changefreq: 'monthly',
            priority: 0.5,
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching student works for sitemap:', error)
  }

  return urls
})
