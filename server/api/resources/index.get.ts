import type { StrapiCollectionResponse, ResourceAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const type = query.type as string | undefined;
  const category = query.category as string | undefined;
  const search = query.search as string | undefined;
  const tags = query.tags as string | string[] | undefined;

  const filters: Record<string, unknown> = {};

  if (type) {
    filters.type = { $eq: type };
  }

  if (category) {
    filters.category = { $eq: category };
  }

  if (search) {
    filters.$or = [
      { title: { $containsi: search } },
      { description: { $containsi: search } },
    ];
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filters.tags = { $in: tagArray };
  }

  try {
    const response = await client.get<StrapiCollectionResponse<ResourceAttributes>>('/resources', {
      query: {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: ['file', 'lessons'],
        sort: ['createdAt:desc'],
        pagination: {
          page,
          pageSize,
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch resources',
    });
  }
});
