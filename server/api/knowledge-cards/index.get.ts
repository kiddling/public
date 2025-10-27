import type { StrapiCollectionResponse, KnowledgeCardAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const category = query.category as string | undefined;
  const difficulty = query.difficulty as string | undefined;
  const search = query.search as string | undefined;
  const tags = query.tags as string | string[] | undefined;

  const filters: Record<string, unknown> = {};

  if (category) {
    filters.category = { $eq: category };
  }

  if (difficulty) {
    filters.difficulty = { $eq: difficulty };
  }

  if (search) {
    filters.$or = [
      { title: { $containsi: search } },
      { content: { $containsi: search } },
    ];
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filters.tags = { $in: tagArray };
  }

  try {
    const response = await client.get<StrapiCollectionResponse<KnowledgeCardAttributes>>('/knowledge-cards', {
      query: {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: ['image', 'relatedCards', 'lessons'],
        sort: ['order:asc', 'createdAt:desc'],
        pagination: {
          page,
          pageSize,
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching knowledge cards:', error);
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch knowledge cards',
    });
  }
});
