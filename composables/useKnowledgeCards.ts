import type { KnowledgeCard, StrapiCollectionResponse, StrapiResponse, KnowledgeCardAttributes } from '~/types/strapi';

export interface UseKnowledgeCardsOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
  tags?: string | string[];
  immediate?: boolean;
}

export interface UseKnowledgeCardOptions {
  immediate?: boolean;
}

export function useKnowledgeCards(options: UseKnowledgeCardsOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    category,
    difficulty,
    search,
    tags,
    immediate = true,
  } = options;

  const query: Record<string, unknown> = {
    page,
    pageSize,
  };

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (search) query.search = search;
  if (tags) query.tags = tags;

  const { data, pending, error, refresh } = useFetch<StrapiCollectionResponse<KnowledgeCardAttributes>>(
    '/api/knowledge-cards',
    {
      query,
      immediate,
      key: `knowledge-cards-${JSON.stringify(query)}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const knowledgeCards = computed(() => data.value?.data || []);
  const pagination = computed(() => data.value?.meta.pagination);

  return {
    knowledgeCards,
    pagination,
    pending,
    error,
    refresh,
  };
}

export function useKnowledgeCard(id: MaybeRef<string | number>, options: UseKnowledgeCardOptions = {}) {
  const { immediate = true } = options;
  const cardId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch<StrapiResponse<KnowledgeCardAttributes>>(
    () => `/api/knowledge-cards/${cardId.value}`,
    {
      immediate,
      key: () => `knowledge-card-${cardId.value}`,
      getCachedData(key) {
        const cached = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key];
        if (!cached) return;
        
        return cached;
      },
    }
  );

  const knowledgeCard = computed(() => data.value?.data);

  return {
    knowledgeCard,
    pending,
    error,
    refresh,
  };
}
