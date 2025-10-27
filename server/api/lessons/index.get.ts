import type { StrapiCollectionResponse, LessonAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const grade = query.grade as string | undefined;
  const subject = query.subject as string | undefined;
  const search = query.search as string | undefined;

  const filters: Record<string, unknown> = {};

  if (grade) {
    filters.grade = { $eq: grade };
  }

  if (subject) {
    filters.subject = { $eq: subject };
  }

  if (search) {
    filters.$or = [
      { title: { $containsi: search } },
      { description: { $containsi: search } },
    ];
  }

  try {
    const response = await client.get<StrapiCollectionResponse<LessonAttributes>>('/lessons', {
      query: {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: ['thumbnail', 'knowledgeCards', 'resources'],
        sort: ['order:asc', 'createdAt:desc'],
        pagination: {
          page,
          pageSize,
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch lessons',
    });
  }
});
