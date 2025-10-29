import { useRouter } from 'next/navigation';
import { StudentWorkFilters } from '@/types/studentWork';
import { stringifyFiltersToQuery } from '@/lib/filterUtils';

export function useDeepLink() {
  const router = useRouter();

  const navigateToWork = (
    workId: number,
    filters?: StudentWorkFilters
  ) => {
    const filterQuery = filters ? stringifyFiltersToQuery(filters) : '';
    const url = `/gallery?${filterQuery ? `${filterQuery}&` : ''}work=${workId}`;
    router.push(url);
  };

  const navigateToGallery = (filters?: StudentWorkFilters) => {
    const filterQuery = filters ? stringifyFiltersToQuery(filters) : '';
    const url = `/gallery${filterQuery ? `?${filterQuery}` : ''}`;
    router.push(url);
  };

  return {
    navigateToWork,
    navigateToGallery,
  };
}
