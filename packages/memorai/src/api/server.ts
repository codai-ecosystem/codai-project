/**
 * MEMORAI REST API Server
 * Provides HTTP endpoints for database, storage, memory, and sync operations
 */

import { EventEmitter } from 'events'
import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { MemoraiService } from '../services/MemoraiService'
import type { MemoraiConfig } from '../types'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    roles: string[]
  }
  tenant?: {
    id: string
    name: string
  }
}

export class MemoraiAPIServer extends EventEmitter {
  private app: Express
  private server?: any
  private _isRunning = false
  private config: MemoraiConfig
  private memoraiService: MemoraiService
  private upload: multer.Multer

  constructor(memoraiService: MemoraiService, config: MemoraiConfig) {
    super()

    this.memoraiService = memoraiService
    this.config = config
    this.app = express()

    // Configure multer for file uploads
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: config.storage.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (config.storage.allowedTypes.length === 0) {
          return cb(null, true)
        }

        const isAllowed = config.storage.allowedTypes.some(type =>
          file.mimetype.startsWith(type) || file.mimetype === type
        )

        if (isAllowed) {
          cb(null, true)
        } else {
          cb(new Error(`File type not allowed: ${file.mimetype}`))
        }
      }
    })

    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  // ==================== SERVER LIFECYCLE ====================

  async start(port = 3001, host = 'localhost'): Promise<void> {
    if (this._isRunning) {
      throw new Error('API server is already running')
    }

    try {
      // Ensure memorai service is initialized
      if (!this.memoraiService.isReady) {
        await this.memoraiService.initialize()
      }

      // Start HTTP server
      this.server = this.app.listen(port, host, () => {
        this._isRunning = true
        this.emit('started', { port, host })
        console.log(`🌐 MEMORAI API Server started on http://${host}:${port}`)
      })

    } catch (error) {
      console.error('Failed to start API server:', error)
      this.emit('error', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning) return

    try {
      if (this.server) {
        this.server.close(() => {
          this._isRunning = false
          this.emit('stopped')
          console.log('🌐 MEMORAI API Server stopped')
        })
      }

    } catch (error) {
      console.error('Error stopping API server:', error)
      this.emit('error', error)
      throw error
    }
  }

  // ==================== MIDDLEWARE SETUP ====================

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet())

    // CORS
    this.app.use(cors({
      origin: this.config.security.cors.origins,
      credentials: this.config.security.cors.credentials
    }))

    // Rate limiting
    if (this.config.security.rateLimit.enabled) {
      this.app.use(rateLimit({
        windowMs: this.config.security.rateLimit.windowMs,
        max: this.config.security.rateLimit.maxRequests,
        message: 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false
      }))
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`📥 ${req.method} ${req.path} - ${req.ip}`)
      next()
    })

    // Authentication middleware (mock for now)
    this.app.use((req: AuthRequest, res: Response, next: NextFunction) => {
      // TODO: Implement real authentication with @codai/auth
      req.user = {
        id: req.headers['x-user-id'] as string || 'anonymous',
        email: req.headers['x-user-email'] as string || 'anonymous@example.com',
        name: req.headers['x-user-name'] as string || 'Anonymous User',
        roles: ['user']
      }

      req.tenant = {
        id: req.headers['x-tenant-id'] as string || 'default',
        name: 'Default Tenant'
      }

      next()
    })
  }

  // ==================== ROUTES SETUP ====================

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', this.handleHealthCheck.bind(this))

    // API info
    this.app.get('/api/info', this.handleAPIInfo.bind(this))

    // Database routes
    this.app.post('/api/v1/database/:table', this.handleDatabaseCreate.bind(this))
    this.app.get('/api/v1/database/:table/:id', this.handleDatabaseGet.bind(this))
    this.app.get('/api/v1/database/:table', this.handleDatabaseFind.bind(this))
    this.app.put('/api/v1/database/:table/:id', this.handleDatabaseUpdate.bind(this))
    this.app.delete('/api/v1/database/:table/:id', this.handleDatabaseDelete.bind(this))
    this.app.post('/api/v1/database/query', this.handleDatabaseQuery.bind(this))

    // Storage routes
    this.app.post('/api/v1/storage/upload', this.upload.single('file'), this.handleStorageUpload.bind(this))
    this.app.get('/api/v1/storage/:path(*)', this.handleStorageDownload.bind(this))
    this.app.delete('/api/v1/storage/:path(*)', this.handleStorageDelete.bind(this))
    this.app.get('/api/v1/storage', this.handleStorageList.bind(this))

    // Memory routes
    this.app.post('/api/v1/memory', this.handleMemoryStore.bind(this))
    this.app.post('/api/v1/memory/search', this.handleMemorySearch.bind(this))
    this.app.get('/api/v1/memory/:id', this.handleMemoryGet.bind(this))
    this.app.put('/api/v1/memory/:id', this.handleMemoryUpdate.bind(this))
    this.app.delete('/api/v1/memory/:id', this.handleMemoryDelete.bind(this))

    // Analytics routes
    this.app.post('/api/v1/analytics/track', this.handleAnalyticsTrack.bind(this))
    this.app.post('/api/v1/analytics/query', this.handleAnalyticsQuery.bind(this))

    // Cache routes
    this.app.get('/api/v1/cache/:key', this.handleCacheGet.bind(this))
    this.app.put('/api/v1/cache/:key', this.handleCacheSet.bind(this))
    this.app.delete('/api/v1/cache/:key', this.handleCacheDelete.bind(this))

    // Sync routes
    this.app.get('/api/v1/sync/status', this.handleSyncStatus.bind(this))
    this.app.post('/api/v1/sync/resolve-conflict', this.handleSyncResolveConflict.bind(this))
  }

  // ==================== ROUTE HANDLERS ====================

  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.memoraiService.getHealth()
      res.json(health)
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async handleAPIInfo(req: Request, res: Response): Promise<void> {
    res.json({
      name: 'MEMORAI API',
      version: '1.0.0',
      description: 'Universal Database & Storage Service for CODAI Ecosystem',
      endpoints: {
        database: [
          'POST /api/v1/database/:table',
          'GET /api/v1/database/:table/:id',
          'GET /api/v1/database/:table',
          'PUT /api/v1/database/:table/:id',
          'DELETE /api/v1/database/:table/:id',
          'POST /api/v1/database/query'
        ],
        storage: [
          'POST /api/v1/storage/upload',
          'GET /api/v1/storage/:path',
          'DELETE /api/v1/storage/:path',
          'GET /api/v1/storage'
        ],
        memory: [
          'POST /api/v1/memory',
          'POST /api/v1/memory/search',
          'GET /api/v1/memory/:id',
          'PUT /api/v1/memory/:id',
          'DELETE /api/v1/memory/:id'
        ],
        analytics: [
          'POST /api/v1/analytics/track',
          'POST /api/v1/analytics/query'
        ],
        cache: [
          'GET /api/v1/cache/:key',
          'PUT /api/v1/cache/:key',
          'DELETE /api/v1/cache/:key'
        ],
        sync: [
          'GET /api/v1/sync/status',
          'POST /api/v1/sync/resolve-conflict'
        ]
      }
    })
  }

  // Database handlers
  private async handleDatabaseCreate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { table } = req.params
      const data = req.body

      const result = await this.memoraiService.insert(table, data)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database create failed'
      })
    }
  }

  private async handleDatabaseGet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { table, id } = req.params

      const result = await this.memoraiService.find(table, [
        { field: 'id', operator: '=', value: id }
      ])

      if (result.data && result.data.length > 0) {
        res.json({ success: true, data: result.data[0] })
      } else {
        res.status(404).json({ success: false, error: 'Record not found' })
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database get failed'
      })
    }
  }

  private async handleDatabaseFind(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { table } = req.params
      const { limit, offset, orderBy, ...filters } = req.query

      // Build conditions from query parameters
      const conditions = Object.entries(filters).map(([field, value]) => ({
        field,
        operator: '=' as const,
        value
      }))

      const options: any = {}
      if (limit) options.limit = parseInt(limit as string)
      if (offset) options.offset = parseInt(offset as string)
      if (orderBy) {
        options.orderBy = [{ field: orderBy as string, direction: 'ASC' }]
      }

      const result = await this.memoraiService.find(table, conditions, options)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database find failed'
      })
    }
  }

  private async handleDatabaseUpdate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { table, id } = req.params
      const data = req.body

      const result = await this.memoraiService.update(table, id, data)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database update failed'
      })
    }
  }

  private async handleDatabaseDelete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { table, id } = req.params

      const result = await this.memoraiService.delete(table, id)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database delete failed'
      })
    }
  }

  private async handleDatabaseQuery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.body

      const result = await this.memoraiService.query(query)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      })
    }
  }

  // Storage handlers
  private async handleStorageUpload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file provided'
        })
        return
      }

      const storageUpload = {
        file: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        isPublic: req.body.isPublic === 'true',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined
      }

      const result = await this.memoraiService.uploadFile(storageUpload, req.user!.id)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      })
    }
  }

  private async handleStorageDownload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filePath = req.params.path

      // Extract file ID from path (assuming format: /user/year/month/filename)
      const pathParts = filePath.split('/')
      const fileId = pathParts[pathParts.length - 1].split('.')[0]

      const result = await this.memoraiService.downloadFile(fileId, req.user!.id)

      if (result.success && result.data) {
        // Set appropriate headers
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${filePath}"`)
        res.send(result.data)
      } else {
        res.status(404).json({
          success: false,
          error: 'File not found'
        })
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'File download failed'
      })
    }
  }

  private async handleStorageDelete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filePath = req.params.path
      const pathParts = filePath.split('/')
      const fileId = pathParts[pathParts.length - 1].split('.')[0]

      const result = await this.memoraiService.deleteFile(fileId, req.user!.id)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'File deletion failed'
      })
    }
  }

  private async handleStorageList(req: AuthRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement file listing by user
      res.json({
        success: true,
        data: [],
        message: 'File listing not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'File listing failed'
      })
    }
  }

  // Memory handlers
  private async handleMemoryStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const memory = {
        ...req.body,
        userId: req.user!.id
      }

      const result = await this.memoraiService.storeMemory(memory)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Memory storage failed'
      })
    }
  }

  private async handleMemorySearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        ...req.body,
        userId: req.user!.id
      }

      const result = await this.memoraiService.searchMemories(query)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Memory search failed'
      })
    }
  }

  private async handleMemoryGet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.memoraiService.getMemory(id, req.user!.id)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Memory retrieval failed'
      })
    }
  }

  private async handleMemoryUpdate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updates = req.body

      // TODO: Implement memory update
      res.json({
        success: true,
        message: 'Memory update not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Memory update failed'
      })
    }
  }

  private async handleMemoryDelete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // TODO: Implement memory deletion
      res.json({
        success: true,
        message: 'Memory deletion not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Memory deletion failed'
      })
    }
  }

  // Analytics handlers
  private async handleAnalyticsTrack(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = {
        ...req.body,
        userId: req.user!.id,
        timestamp: new Date()
      }

      const result = await this.memoraiService.trackEvent(event)
      res.json(result)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Event tracking failed'
      })
    }
  }

  private async handleAnalyticsQuery(req: AuthRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement analytics querying
      res.json({
        success: true,
        data: [],
        message: 'Analytics querying not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Analytics query failed'
      })
    }
  }

  // Cache handlers
  private async handleCacheGet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params

      const value = await this.memoraiService.cacheGet(key)

      if (value !== null) {
        res.json({ success: true, data: value })
      } else {
        res.status(404).json({ success: false, error: 'Cache key not found' })
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Cache get failed'
      })
    }
  }

  private async handleCacheSet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params
      const { value, ttl, tags } = req.body

      await this.memoraiService.cacheSet(key, value, { ttl, tags })
      res.json({ success: true })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Cache set failed'
      })
    }
  }

  private async handleCacheDelete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { key } = req.params

      const deleted = await this.memoraiService.cacheDelete(key)
      res.json({ success: true, data: deleted })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Cache delete failed'
      })
    }
  }

  // Sync handlers
  private async handleSyncStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement sync status
      res.json({
        success: true,
        data: [],
        message: 'Sync status not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Sync status failed'
      })
    }
  }

  private async handleSyncResolveConflict(req: AuthRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement conflict resolution
      res.json({
        success: true,
        message: 'Conflict resolution not yet implemented'
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Conflict resolution failed'
      })
    }
  }

  // ==================== ERROR HANDLING ====================

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
      })
    })

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('API Error:', error)

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    })
  }

  // ==================== GETTERS ====================

  get isRunning(): boolean {
    return this._isRunning
  }

  get expressApp(): Express {
    return this.app
  }
}

// Export convenience function
export function createMemoraiAPIServer(memoraiService: MemoraiService, config: MemoraiConfig): MemoraiAPIServer {
  return new MemoraiAPIServer(memoraiService, config)
}
