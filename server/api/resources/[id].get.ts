import type { StrapiResponse, ResourceAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required',
    });
  }

  try {
    const response = await client.get<StrapiResponse<ResourceAttributes>>(`/resources/${id}`, {
      query: {
        populate: {
          file: true,
          lessons: {
            populate: ['thumbnail'],
          },
        },
      },
    });

    if (!response.data) {
      throw createError({
        statusCode: 404,
        message: 'Resource not found',
      });
    }

    return response;
  } catch (error) {
    console.error(`Error fetching resource ${id}:`, error);
    
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch resource',
    });
  }
});
