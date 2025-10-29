import { useState, useEffect } from 'react';
import { KnowledgeCardData, FilterState } from '../types';
import { fetchKnowledgeCards, StrapiResponse } from '../services/strapi';
import { useDebounce } from './useDebounce';

export const useKnowledgeCards = (filters: FilterState, page = 1, pageSize = 12) => {
  const [data, setData] = useState<StrapiResponse<KnowledgeCardData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const debouncedFilters = { ...filters, search: debouncedSearch };
        const result = await fetchKnowledgeCards(debouncedFilters, page, pageSize);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [filters, debouncedSearch, page, pageSize]);

  return { data, loading, error };
};
