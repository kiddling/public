export type EventType =
  | 'page_view'
  | 'course_browse'
  | 'difficulty_switch'
  | 'progress_mark'
  | 'search'
  | 'download'
  | 'expand'
  | 'filter'
  | 'navigation_click'
  | 'resource_view'
  | 'knowledge_card_view'
  | 'student_work_view'
  | 'session_start'
  | 'session_end'

export interface BaseEvent {
  eventType: EventType
  timestamp: number
  sessionId: string
  userId?: string
  url: string
  referrer?: string
  userAgent?: string
}

export interface PageViewEvent extends BaseEvent {
  eventType: 'page_view'
  pageTitle: string
  pagePath: string
  dwellTime?: number
}

export interface CourseBrowseEvent extends BaseEvent {
  eventType: 'course_browse'
  courseId: string
  courseTitle?: string
  lessonId?: string
  lessonTitle?: string
}

export interface DifficultySwitchEvent extends BaseEvent {
  eventType: 'difficulty_switch'
  lessonId: string
  fromDifficulty: string
  toDifficulty: string
}

export interface ProgressMarkEvent extends BaseEvent {
  eventType: 'progress_mark'
  lessonId: string
  lessonTitle?: string
  completed: boolean
}

export interface SearchEvent extends BaseEvent {
  eventType: 'search'
  query: string
  resultsCount?: number
  selectedResultIndex?: number
  selectedResultId?: string
}

export interface DownloadEvent extends BaseEvent {
  eventType: 'download'
  resourceId: string
  resourceName: string
  resourceType: string
  fileFormat?: string
}

export interface InteractionEvent extends BaseEvent {
  eventType: 'expand' | 'filter' | 'navigation_click'
  elementId?: string
  elementType?: string
  action?: string
  metadata?: Record<string, any>
}

export interface ResourceViewEvent extends BaseEvent {
  eventType: 'resource_view'
  resourceId: string
  resourceType: string
  resourceTitle?: string
}

export interface KnowledgeCardViewEvent extends BaseEvent {
  eventType: 'knowledge_card_view'
  cardId: string
  cardTitle?: string
  category?: string
}

export interface StudentWorkViewEvent extends BaseEvent {
  eventType: 'student_work_view'
  workId: string
  workTitle?: string
  workType?: string
}

export interface SessionEvent extends BaseEvent {
  eventType: 'session_start' | 'session_end'
  sessionDuration?: number
}

export type AnalyticsEvent =
  | PageViewEvent
  | CourseBrowseEvent
  | DifficultySwitchEvent
  | ProgressMarkEvent
  | SearchEvent
  | DownloadEvent
  | InteractionEvent
  | ResourceViewEvent
  | KnowledgeCardViewEvent
  | StudentWorkViewEvent
  | SessionEvent

export interface AnalyticsEventBatch {
  events: AnalyticsEvent[]
  batchId: string
  timestamp: number
}

export interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  batchSize: number
  batchInterval: number
  offlineStorage: boolean
  respectDoNotTrack: boolean
  anonymizeIp: boolean
  cookieConsent: boolean
}

export interface AnalyticsStats {
  totalEvents: number
  totalSessions: number
  uniqueUsers: number
  avgSessionDuration: number
  popularPages: Array<{
    path: string
    views: number
    avgDwellTime: number
  }>
  popularCourses: Array<{
    id: string
    title: string
    views: number
  }>
  searchQueries: Array<{
    query: string
    count: number
  }>
  downloads: Array<{
    resourceName: string
    count: number
  }>
}

export interface LearningPath {
  userId?: string
  sessionId: string
  path: Array<{
    lessonId: string
    timestamp: number
    dwellTime?: number
  }>
  completedLessons: string[]
  difficultPoints: Array<{
    lessonId: string
    switchCount: number
  }>
}
