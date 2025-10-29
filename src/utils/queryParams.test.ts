import { describe, it, expect } from 'vitest';
import { parseFiltersFromQuery, serializeFiltersToQuery } from './queryParams';
import { FilterState } from '../types';

describe('queryParams', () => {
  describe('parseFiltersFromQuery', () => {
    it('parses empty query params', () => {
      const params = new URLSearchParams();
      const result = parseFiltersFromQuery(params);
      
      expect(result).toEqual({});
    });

    it('parses types from query', () => {
      const params = new URLSearchParams('types=Theory,Case Study');
      const result = parseFiltersFromQuery(params);
      
      expect(result.types).toEqual(['Theory', 'Case Study']);
    });

    it('parses tags from query', () => {
      const params = new URLSearchParams('tags=science,math');
      const result = parseFiltersFromQuery(params);
      
      expect(result.tags).toEqual(['science', 'math']);
    });

    it('parses loops from query', () => {
      const params = new URLSearchParams('loops=Loop 1,Loop 2');
      const result = parseFiltersFromQuery(params);
      
      expect(result.loops).toEqual(['Loop 1', 'Loop 2']);
    });

    it('parses difficulties from query', () => {
      const params = new URLSearchParams('difficulties=Beginner,Advanced');
      const result = parseFiltersFromQuery(params);
      
      expect(result.difficulties).toEqual(['Beginner', 'Advanced']);
    });

    it('parses search from query', () => {
      const params = new URLSearchParams('search=test query');
      const result = parseFiltersFromQuery(params);
      
      expect(result.search).toBe('test query');
    });

    it('parses all filters from query', () => {
      const params = new URLSearchParams(
        'types=Theory&tags=science&loops=Loop 1&difficulties=Beginner&search=test'
      );
      const result = parseFiltersFromQuery(params);
      
      expect(result).toEqual({
        types: ['Theory'],
        tags: ['science'],
        loops: ['Loop 1'],
        difficulties: ['Beginner'],
        search: 'test',
      });
    });
  });

  describe('serializeFiltersToQuery', () => {
    it('serializes empty filters', () => {
      const filters: FilterState = {
        types: [],
        tags: [],
        loops: [],
        difficulties: [],
        search: '',
      };
      const result = serializeFiltersToQuery(filters);
      
      expect(result).toBe('');
    });

    it('serializes types to query', () => {
      const filters: FilterState = {
        types: ['Theory', 'Case Study'],
        tags: [],
        loops: [],
        difficulties: [],
        search: '',
      };
      const result = serializeFiltersToQuery(filters);
      
      expect(result).toBe('types=Theory%2CCase+Study');
    });

    it('serializes all filters to query', () => {
      const filters: FilterState = {
        types: ['Theory'],
        tags: ['science'],
        loops: ['Loop 1'],
        difficulties: ['Beginner'],
        search: 'test',
      };
      const result = serializeFiltersToQuery(filters);
      const params = new URLSearchParams(result);
      
      expect(params.get('types')).toBe('Theory');
      expect(params.get('tags')).toBe('science');
      expect(params.get('loops')).toBe('Loop 1');
      expect(params.get('difficulties')).toBe('Beginner');
      expect(params.get('search')).toBe('test');
    });

    it('round-trip conversion works correctly', () => {
      const originalFilters: FilterState = {
        types: ['Theory', 'AI Prompt'],
        tags: ['science', 'math'],
        loops: ['Loop 1'],
        difficulties: ['Beginner', 'Advanced'],
        search: 'test query',
      };
      
      const queryString = serializeFiltersToQuery(originalFilters);
      const params = new URLSearchParams(queryString);
      const parsedFilters = parseFiltersFromQuery(params);
      
      expect(parsedFilters).toEqual(originalFilters);
    });
  });
});
