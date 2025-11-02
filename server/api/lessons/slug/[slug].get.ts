import type { StrapiCollectionResponse, LessonAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Lesson slug is required',
    });
  }

  try {
    const response = await client.get<StrapiCollectionResponse<LessonAttributes>>('/lessons', {
      query: {
        filters: {
          slug: { $eq: slug },
        },
        populate: {
          thumbnail: true,
          knowledgeCards: {
            populate: ['image'],
          },
          resources: {
            populate: ['file'],
          },
        },
      },
    });

    if (!response.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Lesson not found',
      });
    }

    return {
      data: response.data[0],
      meta: response.meta,
    };
  } catch (error) {
    console.error(`Error fetching lesson by slug ${slug}:`, error);
    
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch lesson',
    });
  }
});
