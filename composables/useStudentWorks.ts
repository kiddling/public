import type { StudentWork, StrapiCollectionResponse, StrapiResponse, StudentWorkAttributes } from '~/types/strapi';

export interface UseStudentWorksOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  grade?: string;
  search?: string;
  immediate?: boolean;
}

export interface UseStudentWorkOptions {
  immediate?: boolean;
}

export function useStudentWorks(options: UseStudentWorksOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    category,
    featured,
    grade,
    search,
    immediate = true,
  } = options;

  const query: Record<string, unknown> = {
    page,
    pageSize,
  };

  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured ? 'true' : 'false';
  if (grade) query.grade = grade;
  if (search) query.search = search;

  const { data, pending, error, refresh } = useFetch<StrapiCollectionResponse<StudentWorkAttributes>>(
    '/api/student-works',
    {
      query,
      immediate,
      key: `student-works-${JSON.stringify(query)}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const studentWorks = computed(() => data.value?.data || []);
  const pagination = computed(() => data.value?.meta.pagination);

  return {
    studentWorks,
    pagination,
    pending,
    error,
    refresh,
  };
}

export function useStudentWork(id: MaybeRef<string | number>, options: UseStudentWorkOptions = {}) {
  const { immediate = true } = options;
  const workId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch<StrapiResponse<StudentWorkAttributes>>(
    () => `/api/student-works/${workId.value}`,
    {
      immediate,
      key: () => `student-work-${workId.value}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const studentWork = computed(() => data.value?.data);

  return {
    studentWork,
    pending,
    error,
    refresh,
  };
}
