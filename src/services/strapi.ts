import { KnowledgeCardData, FilterState } from '../types';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export const fetchKnowledgeCards = async (
  filters: Partial<FilterState>,
  page = 1,
  pageSize = 12
): Promise<StrapiResponse<KnowledgeCardData[]>> => {
  const params = new URLSearchParams();

  params.set('pagination[page]', page.toString());
  params.set('pagination[pageSize]', pageSize.toString());
  params.set('populate', '*');

  if (filters.types && filters.types.length > 0) {
    filters.types.forEach(type => {
      params.append('filters[type][$in]', type);
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => {
      params.append('filters[tags][$contains]', tag);
    });
  }

  if (filters.loops && filters.loops.length > 0) {
    filters.loops.forEach(loop => {
      params.append('filters[loop][$in]', loop);
    });
  }

  if (filters.difficulties && filters.difficulties.length > 0) {
    filters.difficulties.forEach(difficulty => {
      params.append('filters[difficulty][$in]', difficulty);
    });
  }

  if (filters.search) {
    params.set('filters[$or][0][title][$containsi]', filters.search);
    params.set('filters[$or][1][description][$containsi]', filters.search);
  }

  const response = await fetch(`${STRAPI_URL}/api/knowledge-cards?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge cards: ${response.statusText}`);
  }

  return response.json();
};

export const fetchKnowledgeCardById = async (id: string): Promise<KnowledgeCardData> => {
  const params = new URLSearchParams();
  params.set('populate', '*');

  const response = await fetch(`${STRAPI_URL}/api/knowledge-cards/${id}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge card: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

export const fetchAvailableTags = async (): Promise<string[]> => {
  const response = await fetch(`${STRAPI_URL}/api/knowledge-cards?fields[0]=tags`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }

  const data = await response.json();
  const allTags = data.data.flatMap((card: { tags: string[] }) => card.tags || []);
  return [...new Set<string>(allTags)].sort();
};

export const fetchAvailableLoops = async (): Promise<string[]> => {
  const response = await fetch(`${STRAPI_URL}/api/knowledge-cards?fields[0]=loop`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch loops: ${response.statusText}`);
  }

  const data = await response.json();
  const allLoops = data.data
    .map((card: { loop?: string }) => card.loop)
    .filter((loop: string | undefined): loop is string => Boolean(loop));
  return [...new Set<string>(allLoops)].sort();
};
