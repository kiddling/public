export type CardType = 'Theory' | 'Case Study' | 'Student Work' | 'AI Prompt' | 'Extended Thinking';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface MediaAsset {
  type: 'image' | 'video' | 'pdf';
  url: string;
  alt?: string;
  thumbnail?: string;
  isChinaSafe?: boolean;
}

export interface ExternalLink {
  url: string;
  title: string;
  isAccessible: boolean;
  isChinaSafe?: boolean;
  fallbackText?: string;
}

export interface RelatedLesson {
  id: string;
  title: string;
  slug: string;
}

export interface DownloadableAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: string;
}

export interface KnowledgeCardData {
  id: string;
  title: string;
  type: CardType;
  description: string;
  tags: string[];
  loop?: string;
  difficulty: Difficulty;
  relevance?: number;
  media?: MediaAsset[];
  externalLinks?: ExternalLink[];
  relatedLessons?: RelatedLesson[];
  downloadableAssets?: DownloadableAsset[];
  aiPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  types: CardType[];
  tags: string[];
  loops: string[];
  difficulties: Difficulty[];
  search: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
