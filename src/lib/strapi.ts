import axios from 'axios';

const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const strapiClient = axios.create({
  baseURL: `${STRAPI_API_URL}/api`,
  headers: {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function fetchDownloadableResources(): Promise<any[]> {
  try {
    const response = await strapiClient.get<StrapiResponse<any[]>>('/downloadable-resources', {
      params: {
        populate: '*',
        pagination: {
          pageSize: 100,
        },
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching downloadable resources:', error);
    return [];
  }
}

export async function fetchAIPromptVersions(promptId: string): Promise<any[]> {
  try {
    const response = await strapiClient.get<StrapiResponse<any[]>>(`/ai-prompts/${promptId}`, {
      params: {
        populate: 'versions',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching AI prompt versions:', error);
    return [];
  }
}

export async function fetchMediaFile(fileId: string): Promise<string> {
  try {
    const response = await strapiClient.get(`/upload/files/${fileId}`);
    return `${STRAPI_API_URL}${response.data.url}`;
  } catch (error) {
    console.error('Error fetching media file:', error);
    throw error;
  }
}

export function getStrapiMediaUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${STRAPI_API_URL}${path}`;
}

export { strapiClient };
