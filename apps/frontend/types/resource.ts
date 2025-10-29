export type ResourceCategory = 
  | 'video-tutorials'
  | 'tool-links'
  | 'case-databases'
  | 'readings'
  | 'pbr-libraries'

export type ResourceMedium = 
  | 'video'
  | 'link'
  | 'pdf'
  | 'document'
  | 'interactive'
  | 'download'

export type AccessibilityStatus = 
  | 'verified'      // 已验证
  | 'needs-attention' // 需关注
  | 'unknown'       // 未知

export interface Resource {
  id: number
  title: string
  description: string
  shortDescription?: string
  category: ResourceCategory
  medium: ResourceMedium
  disciplines?: string[]
  url?: string
  attachmentUrl?: string
  accessibilityStatus: AccessibilityStatus
  lastChecked?: string
  icon?: string
  tags?: string[]
  offlineInstructions?: string
  createdAt: string
  updatedAt: string
}

export interface ResourceFilters {
  category?: ResourceCategory | 'all'
  discipline?: string | 'all'
  medium?: ResourceMedium | 'all'
  search?: string
}

export interface ResourcesResponse {
  data: Resource[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
