export const useSchemaOrg = (schemas: any[]) => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': schemas
        })
      }
    ]
  })
}
