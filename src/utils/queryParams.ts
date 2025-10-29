import { FilterState } from '../types';

export const parseFiltersFromQuery = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};

  const types = searchParams.get('types');
  if (types) {
    filters.types = types.split(',') as FilterState['types'];
  }

  const tags = searchParams.get('tags');
  if (tags) {
    filters.tags = tags.split(',');
  }

  const loops = searchParams.get('loops');
  if (loops) {
    filters.loops = loops.split(',');
  }

  const difficulties = searchParams.get('difficulties');
  if (difficulties) {
    filters.difficulties = difficulties.split(',') as FilterState['difficulties'];
  }

  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }

  return filters;
};

export const serializeFiltersToQuery = (filters: FilterState): string => {
  const params = new URLSearchParams();

  if (filters.types.length > 0) {
    params.set('types', filters.types.join(','));
  }

  if (filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }

  if (filters.loops.length > 0) {
    params.set('loops', filters.loops.join(','));
  }

  if (filters.difficulties.length > 0) {
    params.set('difficulties', filters.difficulties.join(','));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  return params.toString();
};
