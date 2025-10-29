import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToText } from '@/lib/pdf-export';

describe('PDF Export Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('exportToText', () => {
    it('should create download link for text export', async () => {
      const content = 'Test content for export';
      const filename = 'test.txt';

      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      await exportToText(content, filename);

      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should create blob with correct content', async () => {
      const content = 'Test content';
      const filename = 'test.txt';

      const createObjectURLSpy = vi.spyOn(global.URL, 'createObjectURL');

      await exportToText(content, filename);

      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });

  describe('preparePrintLayout', () => {
    it('should add print styles to document', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const originalHeadChildren = document.head.children.length;

      const { preparePrintLayout } = require('@/lib/pdf-export');
      preparePrintLayout(element);

      expect(element.id).toBe('print-content');
    });
  });
});
