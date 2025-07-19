/**
 * MemoraiService - Universal Database & Storage Service
 * 
 * Main service class that orchestrates all MEMORAI functionality:
 * - Database operations (SQL, NoSQL, Vector)
 * - File & Blob storage
 * - AI Memory management
 * - Real-time synchronization
 * - Cross-app data sharing
 */

import { EventEmitter } from 'events'
import type {
  MemoraiConfig,
  Memory,
  MemoryQuery,
  MemorySearchResult,
  StorageFile,
  StorageUpload,
  DatabaseQuery,
  SyncOperation,
  APIResponse,
  PaginatedResponse,
  AnalyticsEvent,
  CacheEntry,
  CacheOptions
} from '../types'
import { DEFAULT_CONFIG, createMemoraiConfig } from '../config'
import { DatabaseService } from './DatabaseService'
import { StorageService } from './StorageService'
import { MemoryService } from './MemoryService'
import { SyncService } from './SyncService'
import { CacheService } from './CacheService'
import { AnalyticsService } from './AnalyticsService'

export class MemoraiService extends EventEmitter {
  private static instance: MemoraiService
  private config: MemoraiConfig
  private isInitialized = false

  // Core Services
  public readonly database: DatabaseService
  public readonly storage: StorageService
  public readonly memory: MemoryService
  public readonly sync: SyncService
  public readonly cache: CacheService
  public readonly analytics: AnalyticsService

  private constructor(config: Partial<MemoraiConfig> = {}) {
    super()

    // Create complete configuration
    this.config = createMemoraiConfig(
      config,
      process.env.NODE_ENV as 'development' | 'production' | 'test'
    )

    // Initialize services
    this.database = new DatabaseService(this.config.database)
    this.storage = new StorageService(this.config.storage)
    this.memory = new MemoryService(this.config.vectorDB, this.config.ai)
    this.sync = new SyncService(this.config.realtime)
    this.cache = new CacheService(this.config.cache)
    this.analytics = new AnalyticsService()

    this.setupEventHandlers()
  }

  // ==================== SINGLETON PATTERN ====================

  static getInstance(config?: Partial<MemoraiConfig>): MemoraiService {
    if (!MemoraiService.instance) {
      MemoraiService.instance = new MemoraiService(config)
    }
    return MemoraiService.instance
  }

  static async create(config?: Partial<MemoraiConfig>): Promise<MemoraiService> {
    const instance = MemoraiService.getInstance(config)
    await instance.initialize()
    return instance
  }

  // ==================== INITIALIZATION ====================

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize services in order
      await this.database.initialize()
      await this.storage.initialize()
      await this.memory.initialize()
      await this.sync.initialize()
      await this.cache.initialize()
      await this.analytics.initialize()

      this.isInitialized = true
      this.emit('initialized', { timestamp: new Date() })

      console.log('🧠 MEMORAI Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize MEMORAI Service:', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return

    try {
      // Shutdown services in reverse order
      await this.analytics.shutdown()
      await this.cache.shutdown()
      await this.sync.shutdown()
      await this.memory.shutdown()
      await this.storage.shutdown()
      await this.database.shutdown()

      this.isInitialized = false
      this.emit('shutdown', { timestamp: new Date() })

      console.log('🔌 MEMORAI Service shutdown completed')
    } catch (error) {
      console.error('❌ Error during MEMORAI Service shutdown:', error)
      throw error
    }
  }

  // ==================== DATABASE OPERATIONS ====================

  async query<T = any>(query: DatabaseQuery): Promise<APIResponse<T[]>> {
    try {
      const results = await this.database.execute(query)

      // Cache results if cacheable
      if (query.operation === 'select' && results.length > 0) {
        const cacheKey = this.generateQueryCacheKey(query)
        await this.cache.set(cacheKey, results, { ttl: 300 }) // 5 minutes
      }

      this.emit('database:query', { query, resultCount: results.length })

      return {
        success: true,
        data: results,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Database query error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  async insert<T = any>(table: string, data: Partial<T>): Promise<APIResponse<T>> {
    return this.query({
      table,
      operation: 'insert',
      data: data as Record<string, any>
    }) as Promise<APIResponse<T>>
  }

  async update<T = any>(table: string, id: string, data: Partial<T>): Promise<APIResponse<T>> {
    return this.query({
      table,
      operation: 'update',
      conditions: [{ field: 'id', operator: '=', value: id }],
      data: data as Record<string, any>
    }) as Promise<APIResponse<T>>
  }

  async delete(table: string, id: string): Promise<APIResponse<boolean>> {
    const result = await this.query({
      table,
      operation: 'delete',
      conditions: [{ field: 'id', operator: '=', value: id }]
    })

    return {
      ...result,
      data: result.success
    }
  }

  async find<T = any>(
    table: string,
    conditions?: DatabaseQuery['conditions'],
    options?: { limit?: number; offset?: number; orderBy?: DatabaseQuery['orderBy'] }
  ): Promise<PaginatedResponse<T>> {
    try {
      // Check cache first
      const cacheKey = this.generateFindCacheKey(table, conditions, options)
      const cachedResult = await this.cache.get<T[]>(cacheKey)

      if (cachedResult) {
        this.emit('cache:hit', { key: cacheKey })
        return {
          success: true,
          data: cachedResult,
          pagination: await this.calculatePagination(table, options?.limit, options?.offset),
          timestamp: new Date(),
          requestId: this.generateRequestId()
        }
      }

      const results = await this.database.execute({
        table,
        operation: 'select',
        conditions,
        limit: options?.limit,
        offset: options?.offset,
        orderBy: options?.orderBy
      })

      // Cache results
      await this.cache.set(cacheKey, results, { ttl: 300 })

      return {
        success: true,
        data: results,
        pagination: await this.calculatePagination(table, options?.limit, options?.offset),
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Find operation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Find operation failed',
        data: [],
        pagination: {
          page: 1,
          limit: options?.limit || 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  // ==================== MEMORY OPERATIONS ====================

  async storeMemory(memory: Partial<Memory>): Promise<APIResponse<Memory>> {
    try {
      const storedMemory = await this.memory.create(memory)

      // Sync to other apps if needed
      if (storedMemory.isShared) {
        const syncOp: Partial<SyncOperation> = {
          userId: storedMemory.userId,
          appId: storedMemory.appId,
          operation: 'insert',
          table: 'memories',
          recordId: storedMemory.id,
          data: storedMemory,
          status: 'pending',
          retryCount: 0,
          priority: storedMemory.importance * 10
        }
        await this.sync.scheduleOperation(syncOp as SyncOperation)
      }

      this.emit('memory:stored', { memory: storedMemory })

      return {
        success: true,
        data: storedMemory,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Store memory error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store memory',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  async searchMemories(query: MemoryQuery): Promise<APIResponse<MemorySearchResult[]>> {
    try {
      const results = await this.memory.search(query)

      this.emit('memory:searched', { query, resultCount: results.length })

      return {
        success: true,
        data: results,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Search memories error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Memory search failed',
        data: [],
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  async getMemory(id: string, userId: string): Promise<APIResponse<Memory | null>> {
    try {
      const memory = await this.memory.get(id, userId)

      if (memory) {
        this.emit('memory:accessed', { memoryId: id, userId })
      }

      return {
        success: true,
        data: memory,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Get memory error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get memory',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  // ==================== STORAGE OPERATIONS ====================

  async uploadFile(file: StorageUpload, userId: string): Promise<APIResponse<StorageFile>> {
    try {
      // Generate path based on user and date
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const path = `uploads/${userId}/${year}/${month}/${file.filename}`

      const uploadedFile = await this.storage.upload(file, path)

      // Store file metadata in database
      await this.database.execute({
        table: 'storage_files',
        operation: 'insert',
        data: {
          ...uploadedFile,
          userId
        }
      })

      this.emit('storage:uploaded', { file: uploadedFile, userId })

      return {
        success: true,
        data: uploadedFile,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Upload file error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  async downloadFile(fileId: string, userId: string): Promise<APIResponse<Buffer>> {
    try {
      // Get file metadata
      const fileResult = await this.find<StorageFile>('storage_files', [
        { field: 'id', operator: '=', value: fileId },
        { field: 'userId', operator: '=', value: userId }
      ])

      if (!fileResult.success || !fileResult.data || fileResult.data.length === 0) {
        return {
          success: false,
          error: 'File not found or access denied',
          timestamp: new Date(),
          requestId: this.generateRequestId()
        }
      }

      const file = fileResult.data[0]
      const buffer = await this.storage.download(file.path)

      // Update download count
      await this.update('storage_files', fileId, {
        downloadCount: file.downloadCount + 1
      })

      this.emit('storage:downloaded', { fileId, userId })

      return {
        success: true,
        data: buffer,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Download file error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File download failed',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<APIResponse<boolean>> {
    try {
      // Get file metadata
      const fileResult = await this.find<StorageFile>('storage_files', [
        { field: 'id', operator: '=', value: fileId },
        { field: 'userId', operator: '=', value: userId }
      ])

      if (!fileResult.success || !fileResult.data || fileResult.data.length === 0) {
        return {
          success: false,
          error: 'File not found or access denied',
          timestamp: new Date(),
          requestId: this.generateRequestId()
        }
      }

      const file = fileResult.data[0]

      // Delete from storage provider
      await this.storage.delete(file.path)

      // Delete from database
      await this.delete('storage_files', fileId)

      this.emit('storage:deleted', { fileId, userId })

      return {
        success: true,
        data: true,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Delete file error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File deletion failed',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  // ==================== ANALYTICS OPERATIONS ====================

  async trackEvent(event: AnalyticsEvent): Promise<APIResponse<boolean>> {
    try {
      await this.analytics.track(event)
      this.emit('analytics:tracked', { event })

      return {
        success: true,
        data: true,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    } catch (error) {
      console.error('Track event error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Event tracking failed',
        timestamp: new Date(),
        requestId: this.generateRequestId()
      }
    }
  }

  // ==================== CACHE OPERATIONS ====================

  async cacheGet<T = any>(key: string): Promise<T | null> {
    return this.cache.get<T>(key)
  }

  async cacheSet<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    return this.cache.set(key, value, options)
  }

  async cacheDelete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async cacheClear(pattern?: string): Promise<number> {
    return this.cache.clear(pattern)
  }

  // ==================== SERVICE HEALTH ====================

  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: Record<string, { status: string; latency?: number; error?: string }>
    timestamp: Date
  }> {
    const services: Record<string, { status: string; latency?: number; error?: string }> = {}

    // Check each service
    const serviceChecks = [
      { name: 'database', service: this.database },
      { name: 'storage', service: this.storage },
      { name: 'memory', service: this.memory },
      { name: 'sync', service: this.sync },
      { name: 'cache', service: this.cache },
      { name: 'analytics', service: this.analytics }
    ]

    for (const { name, service } of serviceChecks) {
      try {
        const start = Date.now()
        const health = await (service as any).getHealth?.() || { status: 'unknown' }
        const latency = Date.now() - start

        services[name] = {
          status: health.status || 'unknown',
          latency
        }
      } catch (error) {
        services[name] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Determine overall status
    const statuses = Object.values(services).map(s => s.status)
    const overallStatus = statuses.includes('error') || statuses.includes('unhealthy')
      ? 'unhealthy'
      : statuses.includes('degraded')
        ? 'degraded'
        : 'healthy'

    return {
      status: overallStatus,
      services,
      timestamp: new Date()
    }
  }

  // ==================== PRIVATE METHODS ====================

  private setupEventHandlers(): void {
    // Forward service events
    const services = [this.database, this.storage, this.memory, this.sync, this.cache, this.analytics]

    services.forEach(service => {
      if (service && typeof service.on === 'function') {
        service.on('error', (error: any) => this.emit('service:error', { service: service.constructor.name, error }))
        service.on('warning', (warning: any) => this.emit('service:warning', { service: service.constructor.name, warning }))
      }
    })
  }

  private generateQueryCacheKey(query: DatabaseQuery): string {
    const key = `query:${query.table}:${query.operation}:${JSON.stringify({
      conditions: query.conditions,
      fields: query.fields,
      limit: query.limit,
      offset: query.offset,
      orderBy: query.orderBy
    })}`

    return Buffer.from(key).toString('base64')
  }

  private generateFindCacheKey(
    table: string,
    conditions?: DatabaseQuery['conditions'],
    options?: { limit?: number; offset?: number; orderBy?: DatabaseQuery['orderBy'] }
  ): string {
    const key = `find:${table}:${JSON.stringify({ conditions, options })}`
    return Buffer.from(key).toString('base64')
  }

  private async calculatePagination(
    table: string,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<any>['pagination']> {
    const pageLimit = limit || 10
    const pageOffset = offset || 0
    const currentPage = Math.floor(pageOffset / pageLimit) + 1

    // Get total count (this should be optimized with a separate count query)
    const countResult = await this.database.execute({
      table,
      operation: 'select',
      fields: ['COUNT(*) as count']
    })

    const total = countResult[0]?.count || 0
    const totalPages = Math.ceil(total / pageLimit)

    return {
      page: currentPage,
      limit: pageLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // ==================== GETTERS ====================

  get isReady(): boolean {
    return this.isInitialized
  }

  get configuration(): MemoraiConfig {
    return { ...this.config } // Return copy to prevent mutation
  }
}

// Export singleton instance
export const memorai = MemoraiService.getInstance()

export default MemoraiService
