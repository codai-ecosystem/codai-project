export interface MemoryEntry {
  id: string
  content: string
  metadata: {
    type: 'conversation' | 'document' | 'code' | 'image' | 'structured'
    importance: number // 1-10 scale
    tags: string[]
    source?: string
    timestamp: Date
    embedding?: number[] // Vector embedding for AI search
  }
  agentId?: string
  userId?: string
  projectId?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseStats {
  totalMemories: number
  totalProjects: number
  totalUsers: number
  storageUsed: string
  apiCalls: number
  uptime: string
}

export interface MCPServer {
  id: string
  name: string
  status: 'online' | 'offline' | 'error'
  url: string
  lastPing: Date
  memoryCount: number
  version: string
}

export interface RealTimeData {
  activeConnections: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  timestamp: Date
}
