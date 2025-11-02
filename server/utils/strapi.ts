import { createApiClient } from '~/utils/api-client';

let apiClient: ReturnType<typeof createApiClient> | null = null;

export function useStrapiClient() {
  if (!apiClient) {
    const config = useRuntimeConfig();
    
    apiClient = createApiClient({
      baseURL: config.strapi.url,
      token: config.strapi.token,
      timeout: 15000,
      retries: 3,
      retryDelay: 1000,
    });
  }

  return apiClient;
}
