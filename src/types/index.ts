export interface DesignLogEntry {
  id: string;
  templateType: 'P-04' | 'P-05' | 'P-06';
  title: string;
  projectName: string;
  date: string;
  content: {
    problem?: string;
    context?: string;
    constraints?: string;
    ideas?: string[];
    solution?: string;
    reflection?: string;
    iterations?: DesignIteration[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DesignIteration {
  id: string;
  version: number;
  description: string;
  timestamp: string;
  changes: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  projectType: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  references: CaseStudyReference[];
  resources: CaseStudyResource[];
  timeline: TimelineEvent[];
  tags: string[];
}

export interface CaseStudyReference {
  id: string;
  type: 'lesson' | 'card' | 'external';
  title: string;
  url: string;
  description?: string;
  linkedAt: string;
}

export interface CaseStudyResource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'link';
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'update' | 'resource' | 'note';
}

export interface AIPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  versions: AIPromptVersion[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIPromptVersion {
  version: number;
  prompt: string;
  changelog?: string;
  createdAt: string;
}

export interface VideoEmbed {
  id: string;
  platform: 'bilibili' | 'tencent' | 'youtube' | 'vimeo';
  videoId: string;
  title: string;
  thumbnail?: string;
  duration?: string;
}

export interface DownloadableResource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  checksum?: string;
  offlineAvailable: boolean;
  strapiId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExportOptions {
  format: 'pdf' | 'print';
  includeImages: boolean;
  paperSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeMetadata: boolean;
}
