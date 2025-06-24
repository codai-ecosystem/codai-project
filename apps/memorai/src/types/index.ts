// Memory Management Types for Memorai Service

export interface MemoryEntity {
    id: string
    type: 'personal' | 'project' | 'global' | 'conversation' | 'agent'
    title: string
    content: string
    tags: string[]
    created: string
    updated: string
    relevance: number
    connections: number
    size: number // in KB
    agentId?: string
    contextWindow?: number
    metadata?: Record<string, any>
}

export interface MemoryStats {
    totalEntities: number
    totalSize: number // in MB
    activeConnections: number
    queryCount: number
    avgRelevance: number
    memoryUsage: number
    activeAgents: number
    mcpConnections: number
}

export interface MCPConnection {
    id: string
    agentId: string
    status: 'connected' | 'disconnected' | 'error'
    lastActivity: string
    queryCount: number
    endpoint: string
}

export interface DatabaseConfig {
    type: 'firebase' | 'postgresql' | 'mongodb' | 'redis'
    connectionString: string
    maxConnections: number
    timeout: number
}

export interface QueryRequest {
    agentId: string
    query: string
    limit?: number
    contextSize?: number
    type?: MemoryEntity['type']
    metadata?: Record<string, any>
}

export interface QueryResponse {
    success: boolean
    memories: MemoryEntity[]
    totalFound: number
    queryTime: number
    relevanceThreshold: number
}

export interface MemoryRequest {
    agentId: string
    content: string
    type: MemoryEntity['type']
    title?: string
    tags?: string[]
    metadata?: Record<string, any>
}

export interface MemoryResponse {
    success: boolean
    memoryId: string
    message: string
}
