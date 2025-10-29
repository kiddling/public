export type Loop = '1' | '2' | '3';

export type Discipline = '环艺' | '产品' | '视传' | '数媒' | '公艺';

export interface StrapiMedia {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
    width: number;
    height: number;
  };
}

export interface StudentWork {
  id: number;
  attributes: {
    title: string;
    description?: string;
    studentName: string;
    loop: Loop;
    discipline: Discipline;
    grade: string;
    year?: number;
    media?: {
      data: StrapiMedia | StrapiMedia[];
    };
    beforeImage?: {
      data: StrapiMedia;
    };
    afterImage?: {
      data: StrapiMedia;
    };
    allowDownload?: boolean;
    allowShare?: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface StudentWorkFilters {
  loop?: Loop[];
  discipline?: Discipline[];
  grade?: string[];
  search?: string;
}

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
