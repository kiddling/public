import type { $Fetch, FetchOptions } from 'ofetch';
import type { StrapiQueryParams, StrapiErrorResponse } from '~/types/strapi';

export interface ApiClientOptions {
  baseURL: string;
  token?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiRequestOptions extends FetchOptions {
  query?: StrapiQueryParams;
}

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function createApiClient(options: ApiClientOptions) {
  const {
    baseURL,
    token,
    timeout = 15000,
    retries = 3,
    retryDelay = 1000,
  } = options;

  const client = $fetch.create({
    baseURL: `${baseURL}/api`,
    timeout,
    retry: retries,
    retryDelay,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    onRequest({ options }) {
      if (import.meta.dev) {
        console.log('[API Request]', options.method, options.baseURL + (options.path || ''));
      }
    },
    onRequestError({ error }) {
      console.error('[API Request Error]', error);
    },
    onResponse({ response }) {
      if (import.meta.dev) {
        console.log('[API Response]', response.status, response._data);
      }
    },
    onResponseError({ response }) {
      console.error('[API Response Error]', response.status, response._data);
      
      const errorData = response._data as StrapiErrorResponse | undefined;
      if (errorData?.error) {
        throw new ApiError(
          errorData.error.message,
          errorData.error.status,
          errorData.error.details
        );
      }
      
      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status,
        response._data
      );
    },
  });

  return {
    client: client as $Fetch,
    
    get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
      return client(path, {
        method: 'GET',
        ...options,
        query: options?.query ? buildQueryParams(options.query) : undefined,
      });
    },

    post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
      return client(path, {
        method: 'POST',
        body,
        ...options,
      });
    },

    put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
      return client(path, {
        method: 'PUT',
        body,
        ...options,
      });
    },

    delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
      return client(path, {
        method: 'DELETE',
        ...options,
      });
    },
  };
}

export function buildQueryParams(params: StrapiQueryParams): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (params.filters) {
    query['filters'] = params.filters;
  }

  if (params.populate) {
    query['populate'] = params.populate;
  }

  if (params.sort) {
    query['sort'] = params.sort;
  }

  if (params.pagination) {
    if (params.pagination.page !== undefined) {
      query['pagination[page]'] = params.pagination.page;
    }
    if (params.pagination.pageSize !== undefined) {
      query['pagination[pageSize]'] = params.pagination.pageSize;
    }
    if (params.pagination.start !== undefined) {
      query['pagination[start]'] = params.pagination.start;
    }
    if (params.pagination.limit !== undefined) {
      query['pagination[limit]'] = params.pagination.limit;
    }
  }

  if (params.fields) {
    query['fields'] = params.fields;
  }

  if (params.locale) {
    query['locale'] = params.locale;
  }

  if (params.publicationState) {
    query['publicationState'] = params.publicationState;
  }

  return query;
}

export function createFilterBuilder() {
  return {
    eq(field: string, value: unknown) {
      return { [field]: { $eq: value } };
    },
    
    ne(field: string, value: unknown) {
      return { [field]: { $ne: value } };
    },
    
    in(field: string, values: unknown[]) {
      return { [field]: { $in: values } };
    },
    
    notIn(field: string, values: unknown[]) {
      return { [field]: { $notIn: values } };
    },
    
    contains(field: string, value: string) {
      return { [field]: { $contains: value } };
    },
    
    notContains(field: string, value: string) {
      return { [field]: { $notContains: value } };
    },
    
    containsi(field: string, value: string) {
      return { [field]: { $containsi: value } };
    },
    
    notContainsi(field: string, value: string) {
      return { [field]: { $notContainsi: value } };
    },
    
    gt(field: string, value: number | string) {
      return { [field]: { $gt: value } };
    },
    
    gte(field: string, value: number | string) {
      return { [field]: { $gte: value } };
    },
    
    lt(field: string, value: number | string) {
      return { [field]: { $lt: value } };
    },
    
    lte(field: string, value: number | string) {
      return { [field]: { $lte: value } };
    },
    
    and(...filters: Record<string, unknown>[]) {
      return { $and: filters };
    },
    
    or(...filters: Record<string, unknown>[]) {
      return { $or: filters };
    },
    
    not(filter: Record<string, unknown>) {
      return { $not: filter };
    },
  };
}
