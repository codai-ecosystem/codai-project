// Memory Service - Core business logic for AI memory management

import {
  MemoryEntity,
  MemoryStats,
  QueryRequest,
  QueryResponse,
  MemoryRequest,
  MemoryResponse,
  DatabaseConfig,
} from '../types';

export class MemoryService {
  private static instance: MemoryService;
  private memories: Map<string, MemoryEntity> = new Map();
  private stats: MemoryStats = {
    totalEntities: 0,
    totalSize: 0,
    activeConnections: 0,
    queryCount: 0,
    avgRelevance: 0,
    memoryUsage: 0,
    activeAgents: 0,
    mcpConnections: 0,
  };
  private dbConfig: DatabaseConfig | null = null;

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  private initializeMockData(): void {
    const mockMemories: MemoryEntity[] = [
      {
        id: '1',
        type: 'project',
        title: 'Codai Dashboard Implementation',
        content:
          'Implemented comprehensive service monitoring dashboard with real-time metrics, tier-based filtering, and modern responsive UI using Next.js and Tailwind CSS.',
        tags: ['dashboard', 'implementation', 'nextjs', 'tailwind'],
        created: '2025-06-23T10:00:00Z',
        updated: '2025-06-23T16:00:00Z',
        relevance: 0.95,
        connections: 8,
        size: 2.4,
        agentId: 'codai-agent',
        contextWindow: 5,
        metadata: { priority: 'high', tier: 'foundation' },
      },
      {
        id: '2',
        type: 'global',
        title: 'Dependency Update Strategy',
        content:
          'Updated all 11 Codai services to latest library versions while maintaining Tailwind CSS v3. Achieved Next.js 15.3.4, React 18.3.1, TypeScript 5.5.0+.',
        tags: ['dependencies', 'upgrade', 'libraries', 'maintenance'],
        created: '2025-06-23T12:00:00Z',
        updated: '2025-06-23T16:30:00Z',
        relevance: 0.88,
        connections: 12,
        size: 1.8,
        agentId: 'orchestrator-agent',
        contextWindow: 10,
        metadata: { type: 'maintenance', impact: 'ecosystem-wide' },
      },
      {
        id: '3',
        type: 'agent',
        title: 'MCP Server Implementation',
        content:
          'Implementing Model Context Protocol server for AI agent memory management. Supports multi-database backends, real-time sync, and enterprise security.',
        tags: ['mcp', 'protocol', 'ai-agents', 'memory'],
        created: '2025-06-23T14:00:00Z',
        updated: '2025-06-23T17:00:00Z',
        relevance: 0.92,
        connections: 15,
        size: 3.2,
        agentId: 'memorai-agent',
        contextWindow: 8,
        metadata: { priority: 'critical', tier: 'foundation' },
      },
      {
        id: '4',
        type: 'conversation',
        title: 'Ecosystem Integration Status',
        content:
          'Successfully integrated 11/11 Codai services into monorepo. All services have Next.js foundation, agent configs, and VS Code tasks. Ready for parallel development.',
        tags: ['integration', 'ecosystem', 'monorepo', 'status'],
        created: '2025-06-23T08:00:00Z',
        updated: '2025-06-23T15:00:00Z',
        relevance: 0.85,
        connections: 20,
        size: 4.1,
        agentId: 'orchestrator-agent',
        contextWindow: 15,
        metadata: { milestone: 'integration-complete', success: true },
      },
      {
        id: '5',
        type: 'personal',
        title: 'Business Logic Implementation Plan',
        content:
          'Phase 2 focus on foundation services: memorai (memory management), logai (authentication), x (API gateway). Each service needs comprehensive business logic.',
        tags: ['business-logic', 'foundation', 'planning', 'phase2'],
        created: '2025-06-23T16:00:00Z',
        updated: '2025-06-23T17:15:00Z',
        relevance: 0.9,
        connections: 6,
        size: 2.1,
        agentId: 'codai-orchestrator',
        contextWindow: 7,
        metadata: { phase: 'business-logic', priority: 'high' },
      },
    ];

    mockMemories.forEach(memory => {
      this.memories.set(memory.id, memory);
    });

    this.updateStats();
  }

  private updateStats(): void {
    const memoriesArray = Array.from(this.memories.values());
    this.stats = {
      totalEntities: memoriesArray.length,
      totalSize: memoriesArray.reduce((sum, m) => sum + m.size, 0) / 1024, // Convert to MB
      activeConnections: memoriesArray.filter(m => m.agentId).length,
      queryCount: Math.floor(Math.random() * 10000) + 5000, // Mock query count
      avgRelevance:
        memoriesArray.reduce((sum, m) => sum + m.relevance, 0) /
        memoriesArray.length,
      memoryUsage: Math.min(85, Math.floor(Math.random() * 40) + 60), // Mock memory usage
      activeAgents: new Set(memoriesArray.map(m => m.agentId).filter(Boolean))
        .size,
      mcpConnections: 3, // Mock MCP connections
    };
  }

  public async query(request: QueryRequest): Promise<QueryResponse> {
    const startTime = Date.now();

    let results = Array.from(this.memories.values());

    // Filter by agent if specified
    if (request.agentId !== 'all') {
      results = results.filter(m => m.agentId === request.agentId);
    }

    // Filter by type if specified
    if (request.type) {
      results = results.filter(m => m.type === request.type);
    }

    // Search in content and tags
    if (request.query) {
      const searchLower = request.query.toLowerCase();
      results = results.filter(
        m =>
          m.content.toLowerCase().includes(searchLower) ||
          m.title.toLowerCase().includes(searchLower) ||
          m.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Apply limit
    const limit = request.limit || 10;
    const limitedResults = results.slice(0, limit);

    const queryTime = Date.now() - startTime;
    this.stats.queryCount++;

    return {
      success: true,
      memories: limitedResults,
      totalFound: results.length,
      queryTime,
      relevanceThreshold: 0.7,
    };
  }

  public async remember(request: MemoryRequest): Promise<MemoryResponse> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const memory: MemoryEntity = {
      id,
      type: request.type,
      title: request.title || request.content.substring(0, 50) + '...',
      content: request.content,
      tags: request.tags || [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      relevance: 0.8, // Default relevance
      connections: 0,
      size: new Blob([request.content]).size / 1024, // Size in KB
      agentId: request.agentId,
      contextWindow: 5,
      metadata: request.metadata || {},
    };

    this.memories.set(id, memory);
    this.updateStats();

    return {
      success: true,
      memoryId: id,
      message: 'Memory stored successfully',
    };
  }

  public async forget(
    memoryId: string
  ): Promise<{ success: boolean; message: string }> {
    const deleted = this.memories.delete(memoryId);

    if (deleted) {
      this.updateStats();
      return {
        success: true,
        message: 'Memory deleted successfully',
      };
    }

    return {
      success: false,
      message: 'Memory not found',
    };
  }

  public getStats(): MemoryStats {
    return { ...this.stats };
  }

  public getAllMemories(): MemoryEntity[] {
    return Array.from(this.memories.values());
  }

  public getMemoryById(id: string): MemoryEntity | null {
    return this.memories.get(id) || null;
  }

  public async updateMemory(
    id: string,
    updates: Partial<MemoryEntity>
  ): Promise<{ success: boolean; message: string }> {
    const memory = this.memories.get(id);

    if (!memory) {
      return {
        success: false,
        message: 'Memory not found',
      };
    }

    const updated = {
      ...memory,
      ...updates,
      updated: new Date().toISOString(),
    };

    this.memories.set(id, updated);
    this.updateStats();

    return {
      success: true,
      message: 'Memory updated successfully',
    };
  }

  public configureDatabase(config: DatabaseConfig): void {
    this.dbConfig = config;
    // In production, this would initialize the actual database connection
    console.log('Database configured:', config.type);
  }

  public getActiveAgents(): string[] {
    const agents = new Set<string>();
    this.memories.forEach(memory => {
      if (memory.agentId) {
        agents.add(memory.agentId);
      }
    });
    return Array.from(agents);
  }
}
