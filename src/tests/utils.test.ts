import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatDate,
  formatFileSize,
  generateId,
  copyToClipboard,
  debounce,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/1/);
    });

    it('should handle Date object', () => {
      const date = new Date('2024-06-20');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      const result = formatFileSize(1536);
      expect(result).toContain('1.5');
      expect(result).toContain('KB');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      navigator.clipboard.writeText = async (text: string) => Promise.resolve();
    });

    it('should copy text to clipboard', async () => {
      const text = 'Test content';
      await expect(copyToClipboard(text)).resolves.toBeUndefined();
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let counter = 0;
      const debouncedFn = debounce(() => {
        counter++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(counter).toBe(1);
        done();
      }, 150);
    });
  });
});
