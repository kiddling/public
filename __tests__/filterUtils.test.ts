import {
  parseFiltersFromQuery,
  stringifyFiltersToQuery,
  toggleFilterValue,
} from '@/lib/filterUtils';
import { StudentWorkFilters, Loop, Discipline } from '@/types/studentWork';

describe('filterUtils', () => {
  describe('parseFiltersFromQuery', () => {
    it('should parse loop filters correctly', () => {
      const params = new URLSearchParams('loop=1,2');
      const filters = parseFiltersFromQuery(params);
      expect(filters.loop).toEqual(['1', '2']);
    });

    it('should parse discipline filters correctly', () => {
      const params = new URLSearchParams('discipline=环艺,产品');
      const filters = parseFiltersFromQuery(params);
      expect(filters.discipline).toEqual(['环艺', '产品']);
    });

    it('should parse search query correctly', () => {
      const params = new URLSearchParams('search=test');
      const filters = parseFiltersFromQuery(params);
      expect(filters.search).toBe('test');
    });

    it('should parse grade filters correctly', () => {
      const params = new URLSearchParams('grade=大一,大二');
      const filters = parseFiltersFromQuery(params);
      expect(filters.grade).toEqual(['大一', '大二']);
    });

    it('should return empty filters for empty query', () => {
      const params = new URLSearchParams();
      const filters = parseFiltersFromQuery(params);
      expect(filters).toEqual({});
    });

    it('should filter out invalid loop values', () => {
      const params = new URLSearchParams('loop=1,invalid,2');
      const filters = parseFiltersFromQuery(params);
      expect(filters.loop).toEqual(['1', '2']);
    });
  });

  describe('stringifyFiltersToQuery', () => {
    it('should stringify loop filters correctly', () => {
      const filters: StudentWorkFilters = { loop: ['1', '2'] };
      const query = stringifyFiltersToQuery(filters);
      expect(query).toBe('loop=1%2C2');
    });

    it('should stringify multiple filters correctly', () => {
      const filters: StudentWorkFilters = {
        loop: ['1'],
        discipline: ['环艺'],
        search: 'test',
      };
      const query = stringifyFiltersToQuery(filters);
      expect(query).toContain('loop=1');
      expect(query).toContain('discipline=');
      expect(query).toContain('search=test');
    });

    it('should return empty string for empty filters', () => {
      const filters: StudentWorkFilters = {};
      const query = stringifyFiltersToQuery(filters);
      expect(query).toBe('');
    });

    it('should skip undefined or empty array values', () => {
      const filters: StudentWorkFilters = {
        loop: [],
        discipline: undefined,
      };
      const query = stringifyFiltersToQuery(filters);
      expect(query).toBe('');
    });
  });

  describe('toggleFilterValue', () => {
    it('should add value when not present', () => {
      const result = toggleFilterValue<Loop>(['1'], '2');
      expect(result).toEqual(['1', '2']);
    });

    it('should remove value when present', () => {
      const result = toggleFilterValue<Loop>(['1', '2'], '2');
      expect(result).toEqual(['1']);
    });

    it('should create array with value when undefined', () => {
      const result = toggleFilterValue<Loop>(undefined, '1');
      expect(result).toEqual(['1']);
    });

    it('should handle empty array', () => {
      const result = toggleFilterValue<Discipline>([], '环艺');
      expect(result).toEqual(['环艺']);
    });
  });
});
