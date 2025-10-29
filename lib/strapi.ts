import axios from 'axios';
import qs from 'qs';
import { StudentWork, StudentWorkFilters, StrapiResponse } from '@/types/studentWork';
import { mockStudentWorks } from './mockData';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const strapiClient = axios.create({
  baseURL: `${strapiUrl}/api`,
  headers: strapiToken
    ? {
        Authorization: `Bearer ${strapiToken}`,
      }
    : {},
});

function filterMockData(filters?: StudentWorkFilters): StrapiResponse<StudentWork[]> {
  let filtered = [...mockStudentWorks];

  if (filters?.loop && filters.loop.length > 0) {
    filtered = filtered.filter((work) => filters.loop?.includes(work.attributes.loop));
  }

  if (filters?.discipline && filters.discipline.length > 0) {
    filtered = filtered.filter((work) =>
      filters.discipline?.includes(work.attributes.discipline)
    );
  }

  if (filters?.grade && filters.grade.length > 0) {
    filtered = filtered.filter((work) => filters.grade?.includes(work.attributes.grade));
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (work) =>
        work.attributes.title.toLowerCase().includes(searchLower) ||
        work.attributes.studentName.toLowerCase().includes(searchLower)
    );
  }

  return {
    data: filtered,
    meta: {
      pagination: {
        page: 1,
        pageSize: filtered.length,
        pageCount: 1,
        total: filtered.length,
      },
    },
  };
}

export async function fetchStudentWorks(
  filters?: StudentWorkFilters,
  page = 1,
  pageSize = 20
): Promise<StrapiResponse<StudentWork[]>> {
  if (useMockData) {
    return filterMockData(filters);
  }

  const query = qs.stringify(
    {
      filters: {
        ...(filters?.loop && filters.loop.length > 0 && {
          loop: { $in: filters.loop },
        }),
        ...(filters?.discipline && filters.discipline.length > 0 && {
          discipline: { $in: filters.discipline },
        }),
        ...(filters?.grade && filters.grade.length > 0 && {
          grade: { $in: filters.grade },
        }),
        ...(filters?.search && {
          $or: [
            { title: { $containsi: filters.search } },
            { studentName: { $containsi: filters.search } },
          ],
        }),
      },
      populate: {
        media: { populate: '*' },
        beforeImage: { populate: '*' },
        afterImage: { populate: '*' },
      },
      pagination: {
        page,
        pageSize,
      },
      sort: ['publishedAt:desc'],
    },
    { encodeValuesOnly: true }
  );

  const response = await strapiClient.get<StrapiResponse<StudentWork[]>>(
    `/student-works?${query}`
  );

  return response.data;
}

export async function fetchStudentWorkById(
  id: number
): Promise<StrapiResponse<StudentWork>> {
  if (useMockData) {
    const work = mockStudentWorks.find((w) => w.id === id);
    if (!work) {
      throw new Error('Work not found');
    }
    return {
      data: work,
      meta: {},
    };
  }

  const query = qs.stringify(
    {
      populate: {
        media: { populate: '*' },
        beforeImage: { populate: '*' },
        afterImage: { populate: '*' },
      },
    },
    { encodeValuesOnly: true }
  );

  const response = await strapiClient.get<StrapiResponse<StudentWork>>(
    `/student-works/${id}?${query}`
  );

  return response.data;
}

export function getStrapiMediaUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${strapiUrl}${url}`;
}
