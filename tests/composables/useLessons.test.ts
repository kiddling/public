import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockLesson, mockLessons } from '../mocks/strapi-data';

describe('useLessons composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLessons', () => {
    it('should fetch lessons successfully', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLessons);

      const { lessons, pagination, pending, error } = useLessons();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lessons.value).toHaveLength(2);
      expect(lessons.value[0].attributes.title).toBe('Introduction to Math');
      expect(pagination.value?.total).toBe(2);
      expect(error.value).toBeNull();
    });

    it('should apply filters correctly', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLessons);

      const { lessons } = useLessons({
        grade: '1',
        subject: 'math',
        search: 'intro',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.$fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.objectContaining({
            grade: '1',
            subject: 'math',
            search: 'intro',
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLessons);

      const { pagination } = useLessons({
        page: 2,
        pageSize: 5,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.$fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.objectContaining({
            page: 2,
            pageSize: 5,
          }),
        })
      );
    });

    it('should handle errors', async () => {
      const errorMessage = 'Failed to fetch lessons';
      global.$fetch = vi.fn().mockRejectedValue(new Error(errorMessage));

      const { lessons, error } = useLessons();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lessons.value).toEqual([]);
    });
  });

  describe('useLesson', () => {
    it('should fetch a single lesson successfully', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLesson);

      const { lesson, pending, error } = useLesson(1);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lesson.value?.attributes.title).toBe('Introduction to Math');
      expect(error.value).toBeNull();
    });

    it('should handle lesson not found', async () => {
      global.$fetch = vi.fn().mockResolvedValue({ data: null });

      const { lesson } = useLesson(999);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lesson.value).toBeNull();
    });

    it('should work with reactive id', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLesson);

      const lessonId = ref(1);
      const { lesson } = useLesson(lessonId);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lesson.value?.id).toBe(1);

      lessonId.value = 2;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe('useLessonBySlug', () => {
    it('should fetch lesson by slug successfully', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLesson);

      const { lesson } = useLessonBySlug('intro-to-math');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lesson.value?.attributes.slug).toBe('intro-to-math');
    });

    it('should work with reactive slug', async () => {
      global.$fetch = vi.fn().mockResolvedValue(mockLesson);

      const slug = ref('intro-to-math');
      const { lesson } = useLessonBySlug(slug);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(lesson.value?.attributes.slug).toBe('intro-to-math');
    });
  });
});
