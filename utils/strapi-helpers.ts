import type { StrapiEntity, StrapiRelation, StrapiMedia } from '~/types/strapi';

export function getStrapiMediaUrl(media: StrapiRelation<StrapiMedia> | undefined, format?: string): string | null {
  if (!media?.data) return null;

  const mediaData = Array.isArray(media.data) ? media.data[0] : media.data;
  if (!mediaData) return null;

  const config = useRuntimeConfig();
  const baseUrl = config.public.strapi.url;

  if (format && mediaData.attributes.formats && mediaData.attributes.formats[format]) {
    return `${baseUrl}${mediaData.attributes.formats[format].url}`;
  }

  return `${baseUrl}${mediaData.attributes.url}`;
}

export function getStrapiMediaAlt(media: StrapiRelation<StrapiMedia> | undefined): string {
  if (!media?.data) return '';

  const mediaData = Array.isArray(media.data) ? media.data[0] : media.data;
  if (!mediaData) return '';

  return mediaData.attributes.alternativeText || mediaData.attributes.name || '';
}

export function getRelationIds<T>(relation: StrapiRelation<T> | undefined): number[] {
  if (!relation?.data) return [];

  const data = Array.isArray(relation.data) ? relation.data : [relation.data];
  return data.map((item) => item.id);
}

export function getRelationCount<T>(relation: StrapiRelation<T> | undefined): number {
  if (!relation?.data) return 0;

  return Array.isArray(relation.data) ? relation.data.length : 1;
}

export function hasRelation<T>(relation: StrapiRelation<T> | undefined): boolean {
  if (!relation?.data) return false;

  if (Array.isArray(relation.data)) {
    return relation.data.length > 0;
  }

  return relation.data !== null;
}

export function formatDate(dateString: string, locale: string = 'zh-CN'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string, locale: string = 'zh-CN'): string {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function getEntityUrl(entity: StrapiEntity<any>, type: string): string {
  return `/${type}/${entity.id}`;
}

export function getEntitySlugUrl(slug: string, type: string): string {
  return `/${type}/${slug}`;
}
