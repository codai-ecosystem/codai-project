// Additional types for the StocAI Storage SDK

export interface APIError {
  error: string
  code?: string
  details?: Record<string, any>
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FileFilters {
  type?: string
  size?: {
    min?: number
    max?: number
  }
  uploadedAt?: {
    from?: Date
    to?: Date
  }
  tags?: string[]
}

export interface BulkOperation {
  operation: 'delete' | 'update' | 'move'
  fileIds: string[]
  data?: Record<string, any>
}

export interface StorageQuota {
  used: number
  total: number
  percentage: number
  warning?: boolean
}

export interface FileVersion {
  id: string
  version: number
  size: number
  checksum: string
  createdAt: string
  isLatest: boolean
}

export interface FilePermissions {
  read: boolean
  write: boolean
  delete: boolean
  share: boolean
}

export interface ShareSettings {
  isPublic: boolean
  allowDownload: boolean
  password?: string
  expiresAt?: Date
  permissions: FilePermissions
}

export interface AIInsights {
  summary?: string
  keywords?: string[]
  category?: string
  language?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  entities?: Array<{
    name: string
    type: string
    confidence: number
  }>
}

export interface FileAnalytics {
  views: number
  downloads: number
  shares: number
  lastViewed: string
  topReferrers: Array<{
    source: string
    count: number
  }>
}

// Event types for webhooks
export type FileEventType =
  | 'file.uploaded'
  | 'file.downloaded'
  | 'file.updated'
  | 'file.deleted'
  | 'file.shared'
  | 'file.expired'

export interface FileEvent {
  type: FileEventType
  fileId: string
  userId: string
  timestamp: string
  data: Record<string, any>
}
