import type { Resource, StrapiCollectionResponse, StrapiResponse, ResourceAttributes } from '~/types/strapi';

export interface UseResourcesOptions {
  page?: number;
  pageSize?: number;
  type?: 'document' | 'video' | 'image' | 'link' | 'other';
  category?: string;
  search?: string;
  tags?: string | string[];
  immediate?: boolean;
}

export interface UseResourceOptions {
  immediate?: boolean;
}

export function useResources(options: UseResourcesOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    type,
    category,
    search,
    tags,
    immediate = true,
  } = options;

  const query: Record<string, unknown> = {
    page,
    pageSize,
  };

  if (type) query.type = type;
  if (category) query.category = category;
  if (search) query.search = search;
  if (tags) query.tags = tags;

  const { data, pending, error, refresh } = useFetch<StrapiCollectionResponse<ResourceAttributes>>(
    '/api/resources',
    {
      query,
      immediate,
      key: `resources-${JSON.stringify(query)}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const resources = computed(() => data.value?.data || []);
  const pagination = computed(() => data.value?.meta.pagination);

  return {
    resources,
    pagination,
    pending,
    error,
    refresh,
  };
}

export function useResource(id: MaybeRef<string | number>, options: UseResourceOptions = {}) {
  const { immediate = true } = options;
  const resourceId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch<StrapiResponse<ResourceAttributes>>(
    () => `/api/resources/${resourceId.value}`,
    {
      immediate,
      key: () => `resource-${resourceId.value}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const resource = computed(() => data.value?.data);

  return {
    resource,
    pending,
    error,
    refresh,
  };
}
