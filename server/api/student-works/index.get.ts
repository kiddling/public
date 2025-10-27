import type { StrapiCollectionResponse, StudentWorkAttributes } from '~/types/strapi';

export default defineEventHandler(async (event) => {
  const client = useStrapiClient();
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const category = query.category as string | undefined;
  const featured = query.featured === 'true';
  const grade = query.grade as string | undefined;
  const search = query.search as string | undefined;

  const filters: Record<string, unknown> = {};

  if (category) {
    filters.category = { $eq: category };
  }

  if (featured) {
    filters.featured = { $eq: true };
  }

  if (grade) {
    filters.studentGrade = { $eq: grade };
  }

  if (search) {
    filters.$or = [
      { title: { $containsi: search } },
      { description: { $containsi: search } },
      { studentName: { $containsi: search } },
    ];
  }

  try {
    const response = await client.get<StrapiCollectionResponse<StudentWorkAttributes>>('/student-works', {
      query: {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: ['images', 'lesson'],
        sort: featured ? ['featured:desc', 'completionDate:desc'] : ['completionDate:desc'],
        pagination: {
          page,
          pageSize,
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching student works:', error);
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      message: error instanceof Error ? error.message : 'Failed to fetch student works',
    });
  }
});
