/**
 * Universal Types for MEMORAI Database & Storage Service
 */

// ==================== CORE CONFIGURATION ====================

export interface MemoraiConfig {
  // Database Configuration
  database: {
    url: string
    type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb'
    provider?: string
    maxConnections: number
    connectionTimeout: number
    queryTimeout: number
    ssl?: boolean
    logging?: boolean
    migrations?: {
      auto: boolean
      directory: string
    }
  }

  // Vector Database Configuration
  vectorDB: {
    url: string
    type: 'pinecone' | 'weaviate' | 'qdrant' | 'chroma' | 'local'
    apiKey?: string
    dimensions: number
    metric: 'cosine' | 'euclidean' | 'dotproduct'
    indexName: string
  }

  // Storage Configuration  
  storage: {
    provider: 'local' | 'aws-s3' | 'cloudflare-r2' | 'supabase' | 'vercel-blob'
    bucket: string
    region?: string
    accessKey?: string
    secretKey?: string
    publicUrl?: string
    maxFileSize: number
    allowedTypes: string[]
    enableCDN: boolean
  }

  // Cache Configuration
  cache: {
    provider: 'redis' | 'memory' | 'upstash'
    url?: string
    password?: string
    ttl: number
    maxSize: number
  }

  // AI Configuration
  ai: {
    provider: 'openai' | 'anthropic' | 'local'
    apiKey?: string
    model: string
    embeddingModel: string
    maxTokens: number
  }

  // Real-time Configuration
  realtime: {
    enabled: boolean
    provider: 'socket.io' | 'supabase' | 'pusher'
    url?: string
    apiKey?: string
    secret?: string
  }

  // Security Configuration
  security: {
    encryption: {
      enabled: boolean
      algorithm: string
      key?: string
    }
    rateLimit: {
      enabled: boolean
      windowMs: number
      maxRequests: number
    }
    cors: {
      origins: string[]
      credentials: boolean
    }
  }

  // Performance Configuration
  performance: {
    queryOptimization: boolean
    indexOptimization: boolean
    compressionEnabled: boolean
    batchSize: number
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative'
  }
}

// ==================== CORE TYPES ====================

export interface MemoraiEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  version: number
  metadata?: Record<string, any>
}

export interface User extends MemoraiEntity {
  email: string
  name: string
  avatar?: string
  preferences: UserPreferences
  subscription?: Subscription
  storageUsed: number
  storageLimit: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  digest: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

export interface PrivacySettings {
  shareData: boolean
  allowAnalytics: boolean
  publicProfile: boolean
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  startDate: Date
  endDate?: Date
  features: string[]
}

// ==================== DATABASE TYPES ====================

export interface DatabaseRecord extends MemoraiEntity {
  table: string
  data: Record<string, any>
  schema?: string
  indexes: string[]
  relations: DatabaseRelation[]
}

export interface DatabaseRelation {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  target: string
  foreignKey: string
  references: string
}

export interface DatabaseQuery {
  table: string
  operation: 'select' | 'insert' | 'update' | 'delete'
  conditions?: QueryCondition[]
  fields?: string[]
  data?: Record<string, any>
  limit?: number
  offset?: number
  orderBy?: OrderBy[]
  joins?: Join[]
}

export interface QueryCondition {
  field: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'NOT IN' | 'LIKE' | 'NOT LIKE' | 'IS NULL' | 'IS NOT NULL'
  value: any
  connector?: 'AND' | 'OR'
}

export interface OrderBy {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface Join {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  table: string
  condition: string
}

// ==================== STORAGE TYPES ====================

export interface StorageFile extends MemoraiEntity {
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  hash: string
  userId: string
  tags: string[]
  isPublic: boolean
  downloadCount: number
  expiresAt?: Date
}

export interface StorageUpload {
  file: Buffer | ReadableStream
  filename: string
  mimeType: string
  size?: number
  isPublic?: boolean
  tags?: string[]
  expiresAt?: Date
}

export interface StorageProvider {
  upload(file: StorageUpload, path: string): Promise<StorageFile>
  download(path: string): Promise<Buffer>
  delete(path: string): Promise<boolean>
  getUrl(path: string, expiresIn?: number): Promise<string>
  list(prefix?: string): Promise<StorageFile[]>
  copy(fromPath: string, toPath: string): Promise<boolean>
  move(fromPath: string, toPath: string): Promise<boolean>
}

// ==================== AI MEMORY TYPES ====================

export interface Memory extends MemoraiEntity {
  userId: string
  appId: string
  content: string
  type: 'episodic' | 'semantic' | 'procedural' | 'working' | 'autobiographical'
  importance: number // 0-1
  confidence: number // 0-1
  context: MemoryContext
  embeddings: number[]
  relationships: MemoryRelationship[]
  accessHistory: MemoryAccess[]
  tags: string[]
  isShared: boolean
  sharedWith: string[]
  expiresAt?: Date
}

export interface MemoryContext {
  sessionId?: string
  conversationId?: string
  taskId?: string
  location?: string
  temporalContext: TemporalContext
  emotionalState?: EmotionalState
  cognitiveLoad?: number
  environmentalFactors: Record<string, any>
}

export interface TemporalContext {
  timeOfDay: string
  dayOfWeek: string
  season: string
  timeZone: string
  relativeTime: 'recent' | 'medium' | 'distant'
}

export interface EmotionalState {
  valence: number // -1 to 1
  arousal: number // 0 to 1
  dominance: number // 0 to 1
  emotions: string[]
}

export interface MemoryRelationship {
  id: string
  relatedMemoryId: string
  type: 'causal' | 'temporal' | 'semantic' | 'contextual' | 'associative'
  strength: number // 0-1
  direction: 'bidirectional' | 'unidirectional'
  createdAt: Date
  lastReinforced: Date
}

export interface MemoryAccess {
  timestamp: Date
  accessType: 'read' | 'update' | 'link' | 'consolidate'
  userId: string
  appId: string
  context: string
  reinforcement: number
}

export interface MemoryQuery {
  text?: string
  embeddings?: number[]
  type?: Memory['type']
  userId?: string
  appId?: string
  timeRange?: { start: Date; end: Date }
  importance?: { min: number; max: number }
  confidence?: { min: number; max: number }
  tags?: string[]
  limit?: number
  includeRelated?: boolean
  semanticThreshold?: number
}

export interface MemorySearchResult {
  memory: Memory
  similarity: number
  relevanceScore: number
  contextMatch: number
  explanation: string
}

// ==================== VECTOR TYPES ====================

export interface VectorDocument extends MemoraiEntity {
  documentId: string
  content: string
  embeddings: number[]
  metadata: DocumentMetadata
  chunks: VectorChunk[]
  lastIndexed: Date
}

export interface DocumentMetadata {
  title?: string
  author?: string
  source?: string
  language?: string
  contentType: string
  size: number
  tags: string[]
  customFields: Record<string, any>
}

export interface VectorChunk {
  id: string
  content: string
  embeddings: number[]
  startIndex: number
  endIndex: number
  metadata: Record<string, any>
}

export interface VectorSearchQuery {
  query: string
  embeddings?: number[]
  limit?: number
  threshold?: number
  filters?: Record<string, any>
  includeMetadata?: boolean
  includeContent?: boolean
}

export interface VectorSearchResult {
  document: VectorDocument
  chunk?: VectorChunk
  score: number
  distance: number
  metadata: Record<string, any>
}

// ==================== SYNC TYPES ====================

export interface SyncOperation extends MemoraiEntity {
  userId: string
  appId: string
  operation: 'insert' | 'update' | 'delete'
  table: string
  recordId: string
  data?: Record<string, any>
  previousData?: Record<string, any>
  status: 'pending' | 'synced' | 'failed' | 'conflict'
  syncedAt?: Date
  retryCount: number
  error?: string
  priority: number
}

export interface SyncConflict extends MemoraiEntity {
  syncOperationId: string
  conflictType: 'concurrent_update' | 'deleted_record' | 'schema_mismatch'
  localData: Record<string, any>
  remoteData: Record<string, any>
  resolution?: 'use_local' | 'use_remote' | 'merge' | 'manual'
  resolvedData?: Record<string, any>
  resolvedAt?: Date
  resolvedBy?: string
}

export interface SyncStatus {
  appId: string
  lastSync: Date
  pendingOperations: number
  failedOperations: number
  conflicts: number
  isOnline: boolean
  syncInProgress: boolean
}

// ==================== CACHE TYPES ====================

export interface CacheEntry<T = any> {
  key: string
  value: T
  expiresAt: Date
  tags: string[]
  version: number
  metadata?: Record<string, any>
}

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  compression?: boolean
  encryption?: boolean
  metadata?: Record<string, any>
}

export interface CacheStats {
  totalKeys: number
  memoryUsage: number
  hitRate: number
  missRate: number
  evictionCount: number
  expiredCount: number
}

// ==================== EVENT TYPES ====================

export interface MemoraiEvent {
  id: string
  type: string
  source: string
  data: Record<string, any>
  timestamp: Date
  userId?: string
  appId?: string
  metadata?: Record<string, any>
}

export interface EventSubscription {
  id: string
  userId: string
  appId: string
  eventTypes: string[]
  endpoint: string
  isActive: boolean
  lastDelivery?: Date
  failureCount: number
}

// ==================== API TYPES ====================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
  requestId: string
  metadata?: Record<string, any>
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface BatchOperation<T = any> {
  operation: 'insert' | 'update' | 'delete'
  data: T
  id?: string
}

export interface BatchResponse<T = any> {
  success: boolean
  results: BatchOperationResult<T>[]
  summary: {
    total: number
    successful: number
    failed: number
    skipped: number
  }
}

export interface BatchOperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  operation: BatchOperation<T>
}

// ==================== ANALYTICS TYPES ====================

export interface AnalyticsEvent {
  eventName: string
  userId?: string
  appId: string
  properties: Record<string, any>
  timestamp: Date
  sessionId?: string
  deviceId?: string
  userAgent?: string
  ipAddress?: string
}

export interface AnalyticsQuery {
  eventName?: string
  userId?: string
  appId?: string
  startDate: Date
  endDate: Date
  groupBy?: string[]
  filters?: Record<string, any>
  aggregations?: AnalyticsAggregation[]
}

export interface AnalyticsAggregation {
  field: string
  operation: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct'
}

export interface AnalyticsResult {
  data: Record<string, any>[]
  summary: {
    totalEvents: number
    uniqueUsers: number
    dateRange: { start: Date; end: Date }
    aggregations: Record<string, number>
  }
}

// ==================== UTILITY TYPES ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Timestamp = Date | string | number

export type UUID = string

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray

export interface JSONObject {
  [key: string]: JSONValue
}

export interface JSONArray extends Array<JSONValue> { }

// ==================== ERROR TYPES ====================

export interface MemoraiError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
  timestamp: Date
  requestId?: string
  userId?: string
  appId?: string
}

export class MemoraiException extends Error {
  public readonly code: string
  public readonly details?: Record<string, any>
  public readonly timestamp: Date
  public readonly requestId?: string
  public readonly userId?: string
  public readonly appId?: string

  constructor(
    code: string,
    message: string,
    details?: Record<string, any>,
    requestId?: string,
    userId?: string,
    appId?: string
  ) {
    super(message)
    this.name = 'MemoraiException'
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.requestId = requestId
    this.userId = userId
    this.appId = appId
  }

  toJSON(): MemoraiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId,
      appId: this.appId
    }
  }
}
