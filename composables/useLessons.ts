import type { Lesson, StrapiCollectionResponse, StrapiResponse, LessonAttributes } from '~/types/strapi';

export interface UseLessonsOptions {
  page?: number;
  pageSize?: number;
  grade?: string;
  subject?: string;
  search?: string;
  immediate?: boolean;
}

export interface UseLessonOptions {
  immediate?: boolean;
}

export function useLessons(options: UseLessonsOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    grade,
    subject,
    search,
    immediate = true,
  } = options;

  const query: Record<string, unknown> = {
    page,
    pageSize,
  };

  if (grade) query.grade = grade;
  if (subject) query.subject = subject;
  if (search) query.search = search;

  const { data, pending, error, refresh } = useFetch<StrapiCollectionResponse<LessonAttributes>>(
    '/api/lessons',
    {
      query,
      immediate,
      key: `lessons-${JSON.stringify(query)}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const lessons = computed(() => data.value?.data || []);
  const pagination = computed(() => data.value?.meta.pagination);

  return {
    lessons,
    pagination,
    pending,
    error,
    refresh,
  };
}

export function useLesson(id: MaybeRef<string | number>, options: UseLessonOptions = {}) {
  const { immediate = true } = options;
  const lessonId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch<StrapiResponse<LessonAttributes>>(
    () => `/api/lessons/${lessonId.value}`,
    {
      immediate,
      key: () => `lesson-${lessonId.value}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const lesson = computed(() => data.value?.data);

  return {
    lesson,
    pending,
    error,
    refresh,
  };
}

export function useLessonBySlug(slug: MaybeRef<string>, options: UseLessonOptions = {}) {
  const { immediate = true } = options;
  const lessonSlug = computed(() => unref(slug));

  const { data, pending, error, refresh } = useFetch<StrapiResponse<LessonAttributes>>(
    () => `/api/lessons/slug/${lessonSlug.value}`,
    {
      immediate,
      key: () => `lesson-slug-${lessonSlug.value}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const lesson = computed(() => data.value?.data);

  return {
    lesson,
    pending,
    error,
    refresh,
  };
}
