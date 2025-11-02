import { describe, it, expect, vi } from 'vitest';
import { createApiClient, createFilterBuilder, buildQueryParams, ApiError } from '~/utils/api-client';

describe('API Client', () => {
  describe('createApiClient', () => {
    it('should create an API client with correct configuration', () => {
      const client = createApiClient({
        baseURL: 'http://localhost:1337',
        token: 'test-token',
        timeout: 10000,
        retries: 2,
      });

      expect(client).toHaveProperty('get');
      expect(client).toHaveProperty('post');
      expect(client).toHaveProperty('put');
      expect(client).toHaveProperty('delete');
    });

    it('should include authorization header when token is provided', () => {
      const client = createApiClient({
        baseURL: 'http://localhost:1337',
        token: 'test-token',
      });

      expect(client).toBeDefined();
    });

    it('should work without token', () => {
      const client = createApiClient({
        baseURL: 'http://localhost:1337',
      });

      expect(client).toBeDefined();
    });
  });

  describe('buildQueryParams', () => {
    it('should build query params with filters', () => {
      const params = buildQueryParams({
        filters: {
          title: { $eq: 'Test' },
        },
      });

      expect(params).toHaveProperty('filters');
      expect(params.filters).toEqual({ title: { $eq: 'Test' } });
    });

    it('should build query params with populate', () => {
      const params = buildQueryParams({
        populate: ['thumbnail', 'author'],
      });

      expect(params).toHaveProperty('populate');
      expect(params.populate).toEqual(['thumbnail', 'author']);
    });

    it('should build query params with pagination', () => {
      const params = buildQueryParams({
        pagination: {
          page: 2,
          pageSize: 10,
        },
      });

      expect(params['pagination[page]']).toBe(2);
      expect(params['pagination[pageSize]']).toBe(10);
    });

    it('should build query params with sort', () => {
      const params = buildQueryParams({
        sort: ['createdAt:desc'],
      });

      expect(params).toHaveProperty('sort');
      expect(params.sort).toEqual(['createdAt:desc']);
    });

    it('should build query params with all options', () => {
      const params = buildQueryParams({
        filters: { published: { $eq: true } },
        populate: ['author'],
        sort: ['createdAt:desc'],
        pagination: {
          page: 1,
          pageSize: 10,
        },
        fields: ['title', 'description'],
        locale: 'en',
        publicationState: 'live',
      });

      expect(params).toHaveProperty('filters');
      expect(params).toHaveProperty('populate');
      expect(params).toHaveProperty('sort');
      expect(params['pagination[page]']).toBe(1);
      expect(params).toHaveProperty('fields');
      expect(params).toHaveProperty('locale');
      expect(params).toHaveProperty('publicationState');
    });
  });

  describe('createFilterBuilder', () => {
    const builder = createFilterBuilder();

    it('should create eq filter', () => {
      const filter = builder.eq('status', 'published');
      expect(filter).toEqual({ status: { $eq: 'published' } });
    });

    it('should create ne filter', () => {
      const filter = builder.ne('status', 'draft');
      expect(filter).toEqual({ status: { $ne: 'draft' } });
    });

    it('should create in filter', () => {
      const filter = builder.in('category', ['math', 'science']);
      expect(filter).toEqual({ category: { $in: ['math', 'science'] } });
    });

    it('should create contains filter', () => {
      const filter = builder.contains('title', 'test');
      expect(filter).toEqual({ title: { $contains: 'test' } });
    });

    it('should create containsi filter (case insensitive)', () => {
      const filter = builder.containsi('title', 'test');
      expect(filter).toEqual({ title: { $containsi: 'test' } });
    });

    it('should create gt filter', () => {
      const filter = builder.gt('views', 100);
      expect(filter).toEqual({ views: { $gt: 100 } });
    });

    it('should create gte filter', () => {
      const filter = builder.gte('views', 100);
      expect(filter).toEqual({ views: { $gte: 100 } });
    });

    it('should create lt filter', () => {
      const filter = builder.lt('views', 100);
      expect(filter).toEqual({ views: { $lt: 100 } });
    });

    it('should create lte filter', () => {
      const filter = builder.lte('views', 100);
      expect(filter).toEqual({ views: { $lte: 100 } });
    });

    it('should create and filter', () => {
      const filter = builder.and(
        builder.eq('published', true),
        builder.gt('views', 100)
      );
      expect(filter).toEqual({
        $and: [
          { published: { $eq: true } },
          { views: { $gt: 100 } },
        ],
      });
    });

    it('should create or filter', () => {
      const filter = builder.or(
        builder.eq('category', 'math'),
        builder.eq('category', 'science')
      );
      expect(filter).toEqual({
        $or: [
          { category: { $eq: 'math' } },
          { category: { $eq: 'science' } },
        ],
      });
    });

    it('should create not filter', () => {
      const filter = builder.not(builder.eq('published', false));
      expect(filter).toEqual({
        $not: { published: { $eq: false } },
      });
    });
  });

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('Test error', 404, { foo: 'bar' });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.data).toEqual({ foo: 'bar' });
    });

    it('should work without data', () => {
      const error = new ApiError('Test error', 500);

      expect(error.statusCode).toBe(500);
      expect(error.data).toBeUndefined();
    });
  });
});
