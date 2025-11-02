export interface StrapiBaseAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiEntity<T = unknown> {
  id: number;
  attributes: T & StrapiBaseAttributes;
}

export interface StrapiResponse<T = unknown> {
  data: StrapiEntity<T> | null;
  meta?: Record<string, unknown>;
}

export interface StrapiCollectionResponse<T = unknown> {
  data: StrapiEntity<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiRelation<T = unknown> {
  data: StrapiEntity<T> | StrapiEntity<T>[] | null;
}

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, {
    url: string;
    width: number;
    height: number;
  }>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonAttributes {
  title: string;
  description?: string;
  content?: string;
  slug: string;
  grade?: string;
  subject?: string;
  order?: number;
  duration?: number;
  objectives?: string[];
  materials?: string[];
  thumbnail?: StrapiRelation<StrapiMedia>;
  knowledgeCards?: StrapiRelation<KnowledgeCardAttributes>;
  resources?: StrapiRelation<ResourceAttributes>;
}

export interface KnowledgeCardAttributes {
  title: string;
  content: string;
  slug: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  order?: number;
  image?: StrapiRelation<StrapiMedia>;
  relatedCards?: StrapiRelation<KnowledgeCardAttributes>;
  lessons?: StrapiRelation<LessonAttributes>;
}

export interface StudentWorkAttributes {
  title: string;
  description?: string;
  slug: string;
  studentName?: string;
  studentGrade?: string;
  completionDate?: string;
  category?: string;
  featured?: boolean;
  images?: StrapiRelation<StrapiMedia>;
  lesson?: StrapiRelation<LessonAttributes>;
}

export interface ResourceAttributes {
  title: string;
  description?: string;
  type: 'document' | 'video' | 'image' | 'link' | 'other';
  url?: string;
  slug: string;
  category?: string;
  tags?: string[];
  file?: StrapiRelation<StrapiMedia>;
  lessons?: StrapiRelation<LessonAttributes>;
}

export type Lesson = StrapiEntity<LessonAttributes>;
export type KnowledgeCard = StrapiEntity<KnowledgeCardAttributes>;
export type StudentWork = StrapiEntity<StudentWorkAttributes>;
export type Resource = StrapiEntity<ResourceAttributes>;

export interface StrapiQueryParams {
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

export interface ApiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface StrapiErrorResponse {
  data: null;
  error: ApiError;
}
