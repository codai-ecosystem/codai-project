/**
 * WORLD CLASS UNIFIED MEMORY ENGINE
 * 
 * Single Source of Truth for the entire CODAI ecosystem
 * Real-time synchronization with dashboard
 * Advanced AI-powered memory management
 * Multi-tier architecture with enterprise persistence
 * 
 * Author: AGENT 2 - Core Infrastructure
 * Date: 2025-01-15
 * Version: 1.0.0-WORLD-CLASS
 */

import { EventEmitter } from 'events';
import { MemoryEntry, MemoryFilter, MemoryStats, SharedMemoryState } from '../types/Memory';
import { DashboardSyncManager } from '../sync/DashboardSyncManager';
import { PersistenceLayer } from '../persistence/PersistenceLayer';
import { AIMemoryAnalyzer } from '../ai/AIMemoryAnalyzer';
import { ConflictResolver } from '../sync/ConflictResolver';

export interface WorldClassMemoryConfig {
  agentId: string;
  persistenceEnabled: boolean;
  aiAnalysisEnabled: boolean;
  dashboardSyncEnabled: boolean;
  realtimeSync: boolean;
  enableCrossAgentSharing: boolean;
  maxMemorySize: number;
  pruningStrategy: 'fifo' | 'lru' | 'smart' | 'ai-guided';
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export class WorldClassUnifiedMemoryEngine extends EventEmitter {
  private memories: Map<string, MemoryEntry> = new Map();
  private agentSharedMemories: Map<string, SharedMemoryState> = new Map();
  private config: WorldClassMemoryConfig;
  private dashboardSync!: DashboardSyncManager;
  private persistenceLayer!: PersistenceLayer;
  private aiAnalyzer!: AIMemoryAnalyzer;
  private conflictResolver!: ConflictResolver;
  private isInitialized: boolean = false;
  private lastSyncTimestamp: number = 0;
  private memoryStats: MemoryStats;

  constructor(config: WorldClassMemoryConfig) {
    super();
    this.config = config;
    this.memoryStats = {
      totalMemories: 0,
      memoryByType: {},
      memoryByAgent: {},
      averageRelevance: 0,
      lastUpdate: Date.now(),
      storageUsed: 0,
      compressionRatio: 1.0
    };

    this.initializeComponents();
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Initialize core components
      this.dashboardSync = new DashboardSyncManager({
        agentId: this.config.agentId,
        realtimeEnabled: this.config.realtimeSync,
        conflictStrategy: 'merge'
      });

      this.persistenceLayer = new PersistenceLayer({
        enabled: this.config.persistenceEnabled,
        storageType: 'advanced-hybrid',
        encryptionEnabled: this.config.encryptionEnabled,
        compressionEnabled: this.config.compressionEnabled
      });

      this.aiAnalyzer = new AIMemoryAnalyzer({
        enabled: this.config.aiAnalysisEnabled,
        modelProvider: 'azure-openai',
        analysisDepth: 'comprehensive'
      });

      this.conflictResolver = new ConflictResolver({
        strategy: 'ai-assisted',
        preserveImportantMemories: true,
        mergeSimilarContent: true
      });

      // Load persisted memories
      if (this.config.persistenceEnabled) {
        await this.loadPersistedMemories();
      }

      // Initialize shared memory state
      await this.initializeSharedMemoryState();

      // Start real-time synchronization
      if (this.config.realtimeSync) {
        this.startRealtimeSync();
      }

      this.isInitialized = true;
      this.emit('engine:initialized', {
        agentId: this.config.agentId,
        timestamp: Date.now(),
        memoryCount: this.memories.size
      });

      console.log(`🧠 WORLD CLASS MEMORY ENGINE INITIALIZED - Agent: ${this.config.agentId}`);
    } catch (error) {
      console.error('❌ Failed to initialize World Class Memory Engine:', error);
      this.emit('engine:error', { error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * CORE MEMORY OPERATIONS
   */

  async remember(content: string, metadata: any = {}): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Memory engine not initialized');
    }

    try {
      // Generate unique memory ID
      const memoryId = this.generateMemoryId();

      // AI Analysis if enabled
      let enhancedMetadata = metadata;
      if (this.config.aiAnalysisEnabled) {
        enhancedMetadata = await this.aiAnalyzer.enhanceMetadata(content, metadata);
      }

      // Create memory entry
      const memory: MemoryEntry = {
        id: memoryId,
        content,
        metadata: {
          ...enhancedMetadata,
          agentId: this.config.agentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          accessCount: 0,
          importance: enhancedMetadata.importance || 0.5,
          entityType: enhancedMetadata.entityType || 'general'
        },
        relevance: 1.0,
        timestamp: new Date().toISOString()
      };

      // Store in memory
      this.memories.set(memoryId, memory);

      // Update statistics
      this.updateMemoryStats();

      // Persist if enabled
      if (this.config.persistenceEnabled) {
        await this.persistenceLayer.store(memory);
      }

      // Sync with dashboard in real-time
      if (this.config.dashboardSyncEnabled) {
        await this.dashboardSync.syncMemory(memory, 'create');
      }

      // Update shared memory state
      await this.updateSharedMemoryState(memory, 'create');

      // Emit events
      this.emit('memory:created', memory);

      console.log(`✅ Memory stored: ${memoryId} - Agent: ${this.config.agentId}`);
      return memoryId;

    } catch (error) {
      console.error('❌ Failed to store memory:', error);
      this.emit('memory:error', { error, operation: 'remember' });
      throw error;
    }
  }

  async recall(query: string, limit: number = 10): Promise<MemoryEntry[]> {
    if (!this.isInitialized) {
      throw new Error('Memory engine not initialized');
    }

    try {
      let results: MemoryEntry[] = [];

      // AI-enhanced search if enabled
      if (this.config.aiAnalysisEnabled) {
        results = await this.aiAnalyzer.semanticSearch(query, Array.from(this.memories.values()), limit);
      } else {
        // Fallback to basic text search
        results = this.basicTextSearch(query, limit);
      }

      // Update access counts
      results.forEach(memory => {
        memory.metadata.accessCount = (memory.metadata.accessCount || 0) + 1;
        memory.metadata.lastAccessed = Date.now();
      });

      // Sync access statistics with dashboard
      if (this.config.dashboardSyncEnabled) {
        await this.dashboardSync.syncAccessStats(results.map(m => m.id));
      }

      this.emit('memory:recalled', { query, resultCount: results.length });

      console.log(`🔍 Memory recall: ${results.length} results for "${query}" - Agent: ${this.config.agentId}`);
      return results;

    } catch (error) {
      console.error('❌ Failed to recall memories:', error);
      this.emit('memory:error', { error, operation: 'recall' });
      throw error;
    }
  }

  async forget(memoryId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Memory engine not initialized');
    }

    try {
      const memory = this.memories.get(memoryId);
      if (!memory) {
        return false;
      }

      // Remove from memory
      this.memories.delete(memoryId);

      // Update statistics
      this.updateMemoryStats();

      // Remove from persistence
      if (this.config.persistenceEnabled) {
        await this.persistenceLayer.delete(memoryId);
      }

      // Sync deletion with dashboard
      if (this.config.dashboardSyncEnabled) {
        await this.dashboardSync.syncMemory(memory, 'delete');
      }

      // Update shared memory state
      await this.updateSharedMemoryState(memory, 'delete');

      this.emit('memory:deleted', { memoryId, memory });

      console.log(`🗑️ Memory deleted: ${memoryId} - Agent: ${this.config.agentId}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to delete memory:', error);
      this.emit('memory:error', { error, operation: 'forget' });
      throw error;
    }
  }

  /**
   * SHARED MEMORY OPERATIONS FOR MULTI-AGENT COORDINATION
   */

  async getSharedMemoryState(): Promise<SharedMemoryState> {
    const agentMemoryState = this.agentSharedMemories.get(this.config.agentId);
    if (!agentMemoryState) {
      return {
        agentId: this.config.agentId,
        lastUpdate: Date.now(),
        memoryCount: this.memories.size,
        importantMemories: [],
        recentActivities: [],
        coordinationData: {}
      };
    }
    return agentMemoryState;
  }

  async syncWithOtherAgents(): Promise<void> {
    if (!this.config.enableCrossAgentSharing) {
      return;
    }

    try {
      // Get shared memory states from all agents
      const allAgentStates = await this.dashboardSync.getAllAgentMemoryStates();

      // Resolve conflicts and merge important memories
      for (const [agentId, state] of Object.entries(allAgentStates)) {
        if (agentId !== this.config.agentId) {
          await this.processSharedMemoriesFromAgent(agentId, state as SharedMemoryState);
        }
      }

      this.emit('memory:sync_completed', {
        agentId: this.config.agentId,
        syncedAgents: Object.keys(allAgentStates).length
      });

    } catch (error) {
      console.error('❌ Failed to sync with other agents:', error);
      this.emit('memory:error', { error, operation: 'cross_agent_sync' });
    }
  }

  /**
   * ANALYTICS AND INSIGHTS
   */

  async getMemoryAnalytics(): Promise<MemoryStats> {
    return {
      ...this.memoryStats,
      lastUpdate: Date.now()
    };
  }

  async getMemoryInsights(): Promise<any> {
    if (!this.config.aiAnalysisEnabled) {
      return { insights: [], patterns: [], recommendations: [] };
    }

    return await this.aiAnalyzer.generateInsights(Array.from(this.memories.values()));
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private basicTextSearch(query: string, limit: number): MemoryEntry[] {
    const queryLower = query.toLowerCase();
    const results: MemoryEntry[] = [];

    for (const memory of this.memories.values()) {
      const contentMatch = memory.content.toLowerCase().includes(queryLower);
      const metadataMatch = JSON.stringify(memory.metadata).toLowerCase().includes(queryLower);

      if (contentMatch || metadataMatch) {
        // Calculate basic relevance score
        const contentScore = this.calculateContentRelevance(memory.content, query);
        memory.relevance = contentScore;
        results.push(memory);
      }
    }

    return results
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, limit);
  }

  private calculateContentRelevance(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');

    let score = 0;
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 1 / queryWords.length;
      }
    });

    return Math.min(score, 1.0);
  }

  private updateMemoryStats(): void {
    this.memoryStats = {
      totalMemories: this.memories.size,
      memoryByType: this.getMemoryCountByType(),
      memoryByAgent: { [this.config.agentId]: this.memories.size },
      averageRelevance: this.calculateAverageRelevance(),
      lastUpdate: Date.now(),
      storageUsed: this.calculateStorageUsed(),
      compressionRatio: 1.0 // Will be calculated by persistence layer
    };
  }

  private getMemoryCountByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const memory of this.memories.values()) {
      const type = memory.metadata.entityType || 'general';
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }

  private calculateAverageRelevance(): number {
    if (this.memories.size === 0) return 0;

    const total = Array.from(this.memories.values())
      .reduce((sum, memory) => sum + (memory.relevance || 0), 0);

    return total / this.memories.size;
  }

  private calculateStorageUsed(): number {
    return Array.from(this.memories.values())
      .reduce((total, memory) => {
        return total + JSON.stringify(memory).length;
      }, 0);
  }

  private async loadPersistedMemories(): Promise<void> {
    try {
      const persistedMemories = await this.persistenceLayer.loadAll();
      persistedMemories.forEach(memory => {
        this.memories.set(memory.id, memory);
      });
      console.log(`📁 Loaded ${persistedMemories.length} persisted memories`);
    } catch (error) {
      console.error('❌ Failed to load persisted memories:', error);
    }
  }

  private async initializeSharedMemoryState(): Promise<void> {
    const sharedState: SharedMemoryState = {
      agentId: this.config.agentId,
      lastUpdate: Date.now(),
      memoryCount: this.memories.size,
      importantMemories: this.getImportantMemories(),
      recentActivities: [],
      coordinationData: {}
    };

    this.agentSharedMemories.set(this.config.agentId, sharedState);
  }

  private async updateSharedMemoryState(memory: MemoryEntry, operation: 'create' | 'update' | 'delete'): Promise<void> {
    const currentState = this.agentSharedMemories.get(this.config.agentId);
    if (!currentState) return;

    currentState.lastUpdate = Date.now();
    currentState.memoryCount = this.memories.size;
    currentState.importantMemories = this.getImportantMemories();
    currentState.recentActivities.unshift({
      operation,
      memoryId: memory.id,
      timestamp: Date.now(),
      content: memory.content.substring(0, 100) + '...'
    });

    // Keep only last 10 activities
    if (currentState.recentActivities.length > 10) {
      currentState.recentActivities = currentState.recentActivities.slice(0, 10);
    }

    this.agentSharedMemories.set(this.config.agentId, currentState);

    // Sync with dashboard
    if (this.config.dashboardSyncEnabled) {
      await this.dashboardSync.syncSharedState(currentState);
    }
  }

  private getImportantMemories(): MemoryEntry[] {
    return Array.from(this.memories.values())
      .filter(memory => (memory.metadata.importance || 0) > 0.7)
      .sort((a, b) => (b.metadata.importance || 0) - (a.metadata.importance || 0))
      .slice(0, 5);
  }

  private async processSharedMemoriesFromAgent(agentId: string, state: SharedMemoryState): Promise<void> {
    // Process important memories from other agents
    for (const importantMemory of state.importantMemories) {
      // Check if we should adopt this memory
      const shouldAdopt = await this.conflictResolver.shouldAdoptMemory(
        importantMemory,
        Array.from(this.memories.values())
      );

      if (shouldAdopt) {
        // Create a copy with reference to original agent
        const adoptedMemory: MemoryEntry = {
          ...importantMemory,
          id: this.generateMemoryId(),
          metadata: {
            ...importantMemory.metadata,
            originalAgentId: agentId,
            adoptedAt: Date.now(),
            adoptedBy: this.config.agentId
          }
        };

        this.memories.set(adoptedMemory.id, adoptedMemory);
      }
    }
  }

  private startRealtimeSync(): void {
    setInterval(async () => {
      try {
        await this.syncWithOtherAgents();
        await this.dashboardSync.performPeriodicSync();
      } catch (error) {
        console.error('❌ Real-time sync error:', error);
      }
    }, 5000); // Sync every 5 seconds
  }

  /**
   * PUBLIC GETTERS
   */

  get isReady(): boolean {
    return this.isInitialized;
  }

  get memoryCount(): number {
    return this.memories.size;
  }

  get agentId(): string {
    return this.config.agentId;
  }
}
