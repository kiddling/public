import { describe, it, expect } from 'vitest';
import {
  getRelationIds,
  getRelationCount,
  hasRelation,
  formatDate,
  stripHtml,
  truncateText,
  getEntityUrl,
  getEntitySlugUrl,
} from '~/utils/strapi-helpers';

describe('Strapi Helpers', () => {
  describe('getRelationIds', () => {
    it('should return empty array for undefined relation', () => {
      expect(getRelationIds(undefined)).toEqual([]);
    });

    it('should return empty array for null data', () => {
      expect(getRelationIds({ data: null })).toEqual([]);
    });

    it('should return single id for single relation', () => {
      const relation = {
        data: {
          id: 1,
          attributes: { title: 'Test' },
        },
      };
      expect(getRelationIds(relation)).toEqual([1]);
    });

    it('should return multiple ids for array relation', () => {
      const relation = {
        data: [
          { id: 1, attributes: { title: 'Test 1' } },
          { id: 2, attributes: { title: 'Test 2' } },
        ],
      };
      expect(getRelationIds(relation)).toEqual([1, 2]);
    });
  });

  describe('getRelationCount', () => {
    it('should return 0 for undefined relation', () => {
      expect(getRelationCount(undefined)).toBe(0);
    });

    it('should return 0 for null data', () => {
      expect(getRelationCount({ data: null })).toBe(0);
    });

    it('should return 1 for single relation', () => {
      const relation = {
        data: {
          id: 1,
          attributes: { title: 'Test' },
        },
      };
      expect(getRelationCount(relation)).toBe(1);
    });

    it('should return correct count for array relation', () => {
      const relation = {
        data: [
          { id: 1, attributes: { title: 'Test 1' } },
          { id: 2, attributes: { title: 'Test 2' } },
          { id: 3, attributes: { title: 'Test 3' } },
        ],
      };
      expect(getRelationCount(relation)).toBe(3);
    });
  });

  describe('hasRelation', () => {
    it('should return false for undefined relation', () => {
      expect(hasRelation(undefined)).toBe(false);
    });

    it('should return false for null data', () => {
      expect(hasRelation({ data: null })).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(hasRelation({ data: [] })).toBe(false);
    });

    it('should return true for single relation', () => {
      const relation = {
        data: {
          id: 1,
          attributes: { title: 'Test' },
        },
      };
      expect(hasRelation(relation)).toBe(true);
    });

    it('should return true for non-empty array', () => {
      const relation = {
        data: [
          { id: 1, attributes: { title: 'Test' } },
        ],
      };
      expect(hasRelation(relation)).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15T10:30:00.000Z');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      expect(stripHtml(html)).toBe('Hello World');
    });

    it('should handle text without HTML', () => {
      const text = 'Plain text';
      expect(stripHtml(text)).toBe('Plain text');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });

    it('should truncate long text', () => {
      const text = 'This is a very long text that needs truncation';
      const result = truncateText(text, 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should use custom suffix', () => {
      const text = 'This is a very long text';
      const result = truncateText(text, 15, '→');
      expect(result.endsWith('→')).toBe(true);
    });
  });

  describe('getEntityUrl', () => {
    it('should generate correct URL', () => {
      const entity = {
        id: 123,
        attributes: { title: 'Test' },
      };
      expect(getEntityUrl(entity, 'lessons')).toBe('/lessons/123');
    });
  });

  describe('getEntitySlugUrl', () => {
    it('should generate correct slug URL', () => {
      expect(getEntitySlugUrl('test-slug', 'lessons')).toBe('/lessons/test-slug');
    });
  });
});
