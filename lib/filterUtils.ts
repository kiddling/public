import { StudentWorkFilters, Loop, Discipline } from '@/types/studentWork';

export function parseFiltersFromQuery(query: URLSearchParams): StudentWorkFilters {
  const filters: StudentWorkFilters = {};

  const loop = query.get('loop');
  if (loop) {
    filters.loop = loop.split(',').filter((l): l is Loop => 
      ['1', '2', '3'].includes(l)
    );
  }

  const discipline = query.get('discipline');
  if (discipline) {
    filters.discipline = discipline.split(',').filter((d): d is Discipline =>
      ['环艺', '产品', '视传', '数媒', '公艺'].includes(d)
    );
  }

  const grade = query.get('grade');
  if (grade) {
    filters.grade = grade.split(',');
  }

  const search = query.get('search');
  if (search) {
    filters.search = search;
  }

  return filters;
}

export function stringifyFiltersToQuery(filters: StudentWorkFilters): string {
  const params = new URLSearchParams();

  if (filters.loop && filters.loop.length > 0) {
    params.set('loop', filters.loop.join(','));
  }

  if (filters.discipline && filters.discipline.length > 0) {
    params.set('discipline', filters.discipline.join(','));
  }

  if (filters.grade && filters.grade.length > 0) {
    params.set('grade', filters.grade.join(','));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  return params.toString();
}

export function toggleFilterValue<T extends string>(
  currentValues: T[] | undefined,
  value: T
): T[] {
  if (!currentValues) {
    return [value];
  }

  if (currentValues.includes(value)) {
    return currentValues.filter((v) => v !== value);
  }

  return [...currentValues, value];
}
