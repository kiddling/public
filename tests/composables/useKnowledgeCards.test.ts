import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockKnowledgeCard, mockKnowledgeCards } from '../mocks/strapi-data';

describe('useKnowledgeCards composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useKnowledgeCards', () => {
    it('should fetch knowledge cards successfully', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockKnowledgeCards);

      const { knowledgeCards, pagination, error } = useKnowledgeCards();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(knowledgeCards.value).toHaveLength(1);
      expect(knowledgeCards.value[0].attributes.title).toBe('Addition Basics');
      expect(pagination.value?.total).toBe(1);
      expect(error.value).toBeNull();
    });

    it('should apply category filter', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockKnowledgeCards);

      const { knowledgeCards } = useKnowledgeCards({
        category: 'math',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.$fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.objectContaining({
            category: 'math',
          }),
        })
      );
    });

    it('should apply difficulty filter', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockKnowledgeCards);

      const { knowledgeCards } = useKnowledgeCards({
        difficulty: 'beginner',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.$fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.objectContaining({
            difficulty: 'beginner',
          }),
        })
      );
    });

    it('should apply tags filter', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockKnowledgeCards);

      const { knowledgeCards } = useKnowledgeCards({
        tags: ['math', 'addition'],
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.$fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.objectContaining({
            tags: ['math', 'addition'],
          }),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { knowledgeCards, error } = useKnowledgeCards();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(knowledgeCards.value).toEqual([]);
    });
  });

  describe('useKnowledgeCard', () => {
    it('should fetch a single knowledge card successfully', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockKnowledgeCard);

      const { knowledgeCard, error } = useKnowledgeCard(1);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(knowledgeCard.value?.attributes.title).toBe('Addition Basics');
      expect(knowledgeCard.value?.attributes.difficulty).toBe('beginner');
      expect(error.value).toBeNull();
    });

    it('should handle not found', async () => {
      global.$fetch = vi.fn().mockResolvedValue({ data: null });

      const { knowledgeCard } = useKnowledgeCard(999);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(knowledgeCard.value).toBeNull();
    });
  });
});
