// 🌐 CODAI ECOSYSTEM - SHARED SERVICES
// Central service layer for inter-app communication and ecosystem management

import type {
  CodAIApp,
  User,
  APIResponse,
  WebSocketMessage,
  Event,
  Memory,
  Transaction,
  Project
} from '@codai/shared-types'

// Import MEMORAI Service (commented out for now due to module resolution issues)
// import { memorai, MemoraiService } from '@codai/memorai'

// Placeholder for MemoraiService type
interface MemoraiService {
  // Add methods as needed
}

// Temporary type definitions for missing types
interface SocialPost {
  id?: string
  content?: string
  author?: string
  timestamp?: string
  likes?: number
}

interface Message {
  id?: string
  content?: string
  sender?: string
  channelId?: string
  timestamp?: string
}

// ==================== ECOSYSTEM SERVICE ====================

export class EcosystemService {
  private static instance: EcosystemService
  private apps: Map<string, CodAIApp> = new Map()
  private eventBus = new EventBus()

  static getInstance(): EcosystemService {
    if (!EcosystemService.instance) {
      EcosystemService.instance = new EcosystemService()
    }
    return EcosystemService.instance
  }

  // App Registry
  async registerApp(app: CodAIApp): Promise<void> {
    this.apps.set(app.id, app)
    this.eventBus.emit('app:registered', app)
  }

  async discoverApps(): Promise<CodAIApp[]> {
    const ports = [4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039, 4040, 4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049]
    const apps: CodAIApp[] = []

    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}/api/status`)
        if (response.ok) {
          const appInfo = await response.json() as any
          apps.push({
            id: appInfo?.name || `app-${port}`,
            name: appInfo?.name || `App ${port}`,
            displayName: appInfo?.displayName || appInfo?.name || `App ${port}`,
            port,
            status: 'online',
            version: appInfo?.version || '1.0.0',
            description: appInfo?.description || '',
            category: appInfo?.category || 'ai-platform',
            capabilities: appInfo?.capabilities || [],
            endpoints: appInfo.endpoints || []
          })
        }
      } catch (error) {
        apps.push({
          id: `app-${port}`,
          name: `App ${port}`,
          displayName: `App ${port}`,
          port,
          status: 'offline',
          version: '1.0.0',
          description: 'Offline application',
          category: 'ai-platform',
          capabilities: [],
          endpoints: []
        })
      }
    }

    return apps
  }

  getApp(id: string): CodAIApp | undefined {
    return this.apps.get(id)
  }

  getAllApps(): CodAIApp[] {
    return Array.from(this.apps.values())
  }

  // Inter-app Communication
  async callApp<T = unknown>(
    appId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<APIResponse<T>> {
    const app = this.getApp(appId)
    if (!app) {
      throw new Error(`App ${appId} not found`)
    }

    const url = `http://localhost:${app.port}${endpoint}`
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Source-App': 'ecosystem'
      },
      body: data ? JSON.stringify(data) : undefined
    })

    return response.json() as Promise<APIResponse<T>>
  }

  // Event System
  on(event: string, callback: (data: unknown) => void): void {
    this.eventBus.on(event, callback)
  }

  emit(event: string, data: unknown): void {
    this.eventBus.emit(event, data)
  }
}

// ==================== EVENT BUS ====================

class EventBus {
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: unknown) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  emit(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }
}

// ==================== AUTH SERVICE ====================

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private token: string | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json() as any
    if (data?.success) {
      this.currentUser = data.data?.user || null
      this.token = data.data?.token || null
      if (this.token) {
        localStorage.setItem('auth_token', this.token)
      }
      return this.currentUser!
    }

    throw new Error(data?.error || 'Login failed')
  }

  async logout(): Promise<void> {
    this.currentUser = null
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser
  }
}

// ==================== DATA SYNC SERVICE ====================

export class DataSyncService {
  private static instance: DataSyncService
  private ws: WebSocket | null = null
  private ecosystem = EcosystemService.getInstance()

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService()
    }
    return DataSyncService.instance
  }

  connect(): void {
    this.ws = new WebSocket('ws://localhost:8080/ecosystem')

    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.ecosystem.emit(message.type, message.data)
    }

    this.ws.onopen = () => {
      console.log('🔗 Connected to CodAI Ecosystem')
    }

    this.ws.onclose = () => {
      console.log('🔌 Disconnected from CodAI Ecosystem')
      setTimeout(() => this.connect(), 5000) // Reconnect after 5 seconds
    }
  }

  send(type: string, data: unknown, target?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString(),
        source: 'client',
        target
      }
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// ==================== FINANCIAL SERVICE ====================

export class FinancialService {
  private ecosystem = EcosystemService.getInstance()

  async getAccounts(userId: string): Promise<APIResponse> {
    return this.ecosystem.callApp('bancai', `/api/accounts?userId=${userId}`)
  }

  async getTransactions(accountId: string): Promise<APIResponse> {
    return this.ecosystem.callApp('bancai', `/api/transactions?accountId=${accountId}`)
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<APIResponse> {
    return this.ecosystem.callApp('bancai', '/api/transactions', 'POST', transaction)
  }

  async getWalletBalance(address: string): Promise<APIResponse> {
    return this.ecosystem.callApp('wallet', `/api/balance?address=${address}`)
  }

  async transfer(from: string, to: string, amount: number, currency: string): Promise<APIResponse> {
    const transferData = { from, to, amount, currency }

    // Try BancAI first for traditional transfers
    if (currency === 'RON' || currency === 'EUR') {
      return this.ecosystem.callApp('bancai', '/api/transfer', 'POST', transferData)
    }

    // Use Wallet for crypto transfers
    return this.ecosystem.callApp('wallet', '/api/transfer', 'POST', transferData)
  }
}

// ==================== ENHANCED MEMORY SERVICE ====================

export class MemoryService {
  private ecosystem = EcosystemService.getInstance()

  // Universal Database Operations
  async store<T = any>(table: string, data: T): Promise<APIResponse<T>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.insert(table, data)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', '/api/database/store', 'POST', { table, data })
    } catch (error) {
      console.error('Store operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Store operation failed',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  async find<T = any>(table: string, conditions?: Record<string, any>): Promise<APIResponse<T[]>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.find(table, conditions ? Object.entries(conditions).map(([field, value]) => ({
            field,
            operator: '=' as const,
            value
          })) : undefined)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', '/api/database/find', 'POST', { table, conditions })
    } catch (error) {
      console.error('Find operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Find operation failed',
        data: [],
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  // AI Memory Operations
  async storeMemory(memory: Partial<Memory>): Promise<APIResponse<Memory>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.storeMemory(memory)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', '/api/memories', 'POST', memory)
    } catch (error) {
      console.error('Store memory failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Store memory failed',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  async searchMemories(query: string, limit = 10): Promise<APIResponse<Memory[]>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          const result = await memorai.searchMemories({ text: query, limit })
          return {
            ...result,
            data: result.data?.map((r: any) => r.memory) || []
          }
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    } catch (error) {
      console.error('Search memories failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search memories failed',
        data: [],
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  // File Storage Operations
  async uploadFile(file: File | Buffer, filename: string, userId: string): Promise<APIResponse<any>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          const upload = {
            file,
            filename,
            mimeType: file instanceof File ? file.type : 'application/octet-stream',
            size: file instanceof File ? file.size : (file as Buffer).length
          }
          return await memorai.uploadFile(upload, userId)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API (would need FormData handling)
      return this.ecosystem.callApp('memorai', '/api/storage/upload', 'POST', {
        filename,
        userId
      })
    } catch (error) {
      console.error('Upload file failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload file failed',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  async getMemories(userId: string, type?: string): Promise<APIResponse<Memory[]>> {
    const conditions: Record<string, any> = { userId }
    if (type) conditions.type = type

    return this.find<Memory>('memories', conditions)
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<APIResponse<Memory>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.update('memories', id, updates)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', `/api/memories/${id}`, 'PUT', updates)
    } catch (error) {
      console.error('Update memory failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update memory failed',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  async deleteMemory(id: string): Promise<APIResponse<boolean>> {
    try {
      // Try MEMORAI package first
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.delete('memories', id)
        } catch (err) {
          console.log('MEMORAI not available, falling back to ecosystem call')
        }
      }

      // Fallback to MEMORAI app API
      return this.ecosystem.callApp('memorai', `/api/memories/${id}`, 'DELETE')
    } catch (error) {
      console.error('Delete memory failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete memory failed',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }
  }

  // Cache Operations
  async cacheGet<T = any>(key: string): Promise<T | null> {
    try {
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          return await memorai.cacheGet(key) as T | null
        } catch (err) {
          console.log('MEMORAI cache not available')
        }
      }
      return null
    } catch (error) {
      console.error('Cache get failed:', error)
      return null
    }
  }

  async cacheSet<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (typeof require !== 'undefined') {
        try {
          const { memorai } = require('@codai/memorai')
          await memorai.cacheSet(key, value, { ttl })
        } catch (err) {
          console.log('MEMORAI cache not available')
        }
      }
    } catch (error) {
      console.error('Cache set failed:', error)
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// ==================== PROJECT SERVICE ====================

export class ProjectService {
  private ecosystem = EcosystemService.getInstance()

  async getProjects(userId: string): Promise<APIResponse> {
    return this.ecosystem.callApp('codai', `/api/projects?userId=${userId}`)
  }

  async createProject(project: Partial<Project>): Promise<APIResponse> {
    return this.ecosystem.callApp('codai', '/api/projects', 'POST', project)
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<APIResponse> {
    return this.ecosystem.callApp('codai', `/api/projects/${id}`, 'PUT', updates)
  }

  async getProjectAnalytics(projectId: string): Promise<APIResponse> {
    return this.ecosystem.callApp('codai', `/api/analytics/projects/${projectId}`)
  }

  async deployProject(projectId: string, target: string): Promise<APIResponse> {
    return this.ecosystem.callApp('codai', `/api/projects/${projectId}/deploy`, 'POST', { target })
  }
}

// ==================== SOCIAL SERVICE ====================

export class SocialService {
  private ecosystem = EcosystemService.getInstance()

  async getPosts(userId?: string): Promise<APIResponse> {
    const params = userId ? `?userId=${userId}` : ''
    return this.ecosystem.callApp('sociai', `/api/posts${params}`)
  }

  async createPost(post: Partial<SocialPost>): Promise<APIResponse> {
    return this.ecosystem.callApp('sociai', '/api/posts', 'POST', post)
  }

  async getMessages(channelId: string): Promise<APIResponse> {
    return this.ecosystem.callApp('sociai', `/api/messages?channelId=${channelId}`)
  }

  async sendMessage(message: Partial<Message>): Promise<APIResponse> {
    return this.ecosystem.callApp('sociai', '/api/messages', 'POST', message)
  }
}

// ==================== EXPORT SERVICES ====================

export const ecosystemService = EcosystemService.getInstance()
export const authService = AuthService.getInstance()
export const dataSyncService = DataSyncService.getInstance()
export const financialService = new FinancialService()
export const memoryService = new MemoryService()
export const projectService = new ProjectService()
export const socialService = new SocialService()
