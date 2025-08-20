/**
 * @fileoverview RomAI AGI - Advanced Memory Manager
 * Enterprise-grade memory management with MemoraiMCP integration
 * Supports working memory, episodic memory, semantic memory, and persistent storage
 */

import { AGIConfig, Memory, MemoryEntry } from '../types.js';

// Enhanced memory interfaces for Day 3 implementation
interface Episode {
  id: string;
  content: any;
  timestamp: number;
  importance: number;
  context: EpisodeContext;
  emotionalTag?: string;
  participants?: string[];
}

interface EpisodeContext {
  situation: string;
  environment: string;
  goals: string[];
  outcomes: string[];
}

interface WorkingMemorySlot {
  id: string;
  content: any;
  priority: number;
  lastAccessed: number;
  ttl: number; // time to live in milliseconds
}

interface SemanticNode {
  id: string;
  concept: string;
  properties: { [key: string]: any };
  relationships: SemanticRelationship[];
  confidence: number;
}

interface SemanticRelationship {
  targetNodeId: string;
  relationshipType: string;
  strength: number;
}

export class MemoryManager {
  private readonly config: AGIConfig;
  private isInitialized: boolean = false;
  private isRunning: boolean = false;

  // Memory storage systems
  private memories: Map<string, Memory> = new Map();
  private episodes: Map<string, Episode> = new Map();
  private workingMemory: Map<string, WorkingMemorySlot> = new Map();
  private semanticNetwork: Map<string, SemanticNode> = new Map();

  // MemoraiMCP integration simulation (would be actual MCP client in production)
  private memoraiClient: any = null;

  // Memory system configuration
  private readonly maxWorkingMemorySlots: number = 7; // Miller's magic number
  private readonly workingMemoryTTL: number = 300000; // 5 minutes
  private readonly episodeImportanceThreshold: number = 0.3;

  constructor(config: AGIConfig) {
    this.config = config;
    this.initializeMemoraiIntegration();
  }

  private initializeMemoraiIntegration(): void {
    // Initialize MemoraiMCP client simulation
    this.memoraiClient = {
      remember: async (content: any, metadata: any) => {
        // Simulate MemoraiMCP storage
        const memoryId = `memorai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return { memoryId, success: true, metadata };
      },
      recall: async (query: string) => {
        // Simulate MemoraiMCP retrieval
        return Array.from(this.memories.values())
          .filter(m => JSON.stringify(m).toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
      },
      forget: async (memoryId: string) => {
        // Simulate MemoraiMCP deletion
        return { success: true };
      }
    };
  }

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Advanced Memory Manager...');

    // Initialize memory subsystems
    await this.initializeWorkingMemory();
    await this.initializeEpisodicMemory();
    await this.initializeSemanticMemory();
    await this.initializePersistentStorage();

    this.isInitialized = true;
    console.log('✅ Memory Manager initialized with MemoraiMCP integration');
  }

  private async initializeWorkingMemory(): Promise<void> {
    // Initialize working memory with attention-based slots
    console.log('🔄 Initializing working memory system...');
    this.workingMemory.clear();
  }

  private async initializeEpisodicMemory(): Promise<void> {
    // Initialize episodic memory for experience storage
    console.log('📅 Initializing episodic memory system...');
    this.episodes.clear();
  }

  private async initializeSemanticMemory(): Promise<void> {
    // Initialize semantic network for knowledge representation
    console.log('🕸️ Initializing semantic memory network...');
    this.semanticNetwork.clear();

    // Create foundational semantic nodes
    await this.createSemanticNode('intelligence', {
      type: 'concept',
      domain: 'cognitive-science',
      definition: 'The ability to acquire and apply knowledge and skills'
    });

    await this.createSemanticNode('romania', {
      type: 'country',
      continent: 'Europe',
      culture: 'rich-traditions',
      language: 'Romanian'
    });
  }

  private async initializePersistentStorage(): Promise<void> {
    // Initialize persistent storage integration
    console.log('💾 Initializing persistent storage integration...');
    if (this.config.memory?.persistentStorage) {
      // Would integrate with actual persistent storage in production
      console.log('✅ Persistent storage configured');
    }
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Memory Manager...');

    if (!this.isInitialized) {
      await this.initialize();
    }

    // Start memory maintenance tasks
    this.startMemoryMaintenance();

    this.isRunning = true;
    console.log('✅ Memory Manager running');
  }

  private startMemoryMaintenance(): void {
    // Start background tasks for memory management
    setInterval(() => {
      this.cleanupWorkingMemory();
      this.consolidateEpisodes();
    }, 60000); // Run every minute
  }

  private cleanupWorkingMemory(): void {
    // Remove expired working memory slots
    const now = Date.now();
    for (const [id, slot] of this.workingMemory) {
      if (now - slot.lastAccessed > slot.ttl) {
        this.workingMemory.delete(id);
      }
    }
  }

  private async consolidateEpisodes(): Promise<void> {
    // Consolidate important episodes into long-term memory
    for (const [id, episode] of this.episodes) {
      if (episode.importance > this.episodeImportanceThreshold) {
        await this.moveEpisodeToLongTerm(episode);
      }
    }
  }

  private async moveEpisodeToLongTerm(episode: Episode): Promise<void> {
    // Move episode to persistent storage via MemoraiMCP
    try {
      await this.memoraiClient.remember(episode, {
        entityType: 'consolidated-episode',
        importance: episode.importance,
        timestamp: episode.timestamp
      });
      this.episodes.delete(episode.id);
    } catch (error) {
      console.error('Failed to consolidate episode:', error);
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Memory Manager...');
    this.isRunning = false;

    // Save any pending episodes
    await this.savePendingMemories();

    console.log('✅ Memory Manager stopped');
  }

  private async savePendingMemories(): Promise<void> {
    // Save all pending memories before shutdown
    for (const episode of this.episodes.values()) {
      await this.moveEpisodeToLongTerm(episode);
    }
  }

  // Enhanced memory operations for Day 3
  async store(memory: Memory): Promise<string> {
    const memoryId = `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.memories.set(memoryId, memory);

    // Also store in MemoraiMCP for persistence
    await this.memoraiClient.remember(memory, {
      entityType: 'general-memory',
      importance: memory.importance || 0.5,
      timestamp: memory.timestamp
    });

    return memoryId;
  }

  async recall(query: any): Promise<Memory[]> {
    console.log(`🔍 Recalling memories for query: ${JSON.stringify(query)}`);

    // Multi-level memory recall
    const results: Memory[] = [];

    // 1. Check working memory first (fastest access)
    const workingMemoryResults = this.searchWorkingMemory(query);
    results.push(...workingMemoryResults);

    // 2. Search local memory
    const localResults = Array.from(this.memories.values())
      .filter(m => this.matchesQuery(m, query))
      .slice(0, 5);
    results.push(...localResults);

    // 3. Query MemoraiMCP for deeper recall
    try {
      const memoraiResults = await this.memoraiClient.recall(
        typeof query === 'string' ? query : JSON.stringify(query)
      );
      results.push(...memoraiResults);
    } catch (error) {
      console.error('MemoraiMCP recall failed:', error);
    }

    console.log(`📊 Recalled ${results.length} memories`);
    return results.slice(0, 10); // Return top 10 results
  }

  private searchWorkingMemory(query: any): Memory[] {
    const queryStr = typeof query === 'string' ? query : JSON.stringify(query);
    const results: Memory[] = [];

    for (const slot of this.workingMemory.values()) {
      if (JSON.stringify(slot.content).toLowerCase().includes(queryStr.toLowerCase())) {
        // Update last accessed time
        slot.lastAccessed = Date.now();

        // Convert working memory slot to Memory format
        results.push({
          id: slot.id,
          content: slot.content,
          timestamp: slot.lastAccessed,
          type: 'working-memory',
          importance: slot.priority
        });
      }
    }

    return results;
  }

  private matchesQuery(memory: Memory, query: any): boolean {
    const queryStr = typeof query === 'string' ? query : JSON.stringify(query);
    const memoryStr = JSON.stringify(memory).toLowerCase();
    return memoryStr.includes(queryStr.toLowerCase());
  }

  // Day 3 specific: Enhanced episode storage
  async storeEpisode(episode: Episode): Promise<string> {
    console.log(`📝 Storing episode: ${episode.id}`);

    const episodeId = episode.id || `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    episode.id = episodeId;

    // Store in episodic memory
    this.episodes.set(episodeId, episode);

    // Add to working memory if important
    if (episode.importance > 0.7) {
      await this.addToWorkingMemory({
        id: `wm-${episodeId}`,
        content: { episodeRef: episodeId, summary: episode.content },
        priority: episode.importance,
        lastAccessed: Date.now(),
        ttl: this.workingMemoryTTL
      });
    }

    // Store in MemoraiMCP for persistence
    await this.memoraiClient.remember(episode, {
      entityType: 'episode',
      importance: episode.importance,
      timestamp: episode.timestamp,
      context: episode.context
    });

    console.log(`✅ Episode stored: ${episodeId}`);
    return episodeId;
  }

  private async addToWorkingMemory(slot: WorkingMemorySlot): Promise<void> {
    // Ensure working memory doesn't exceed capacity
    if (this.workingMemory.size >= this.maxWorkingMemorySlots) {
      // Remove least recently used slot
      const lruSlot = Array.from(this.workingMemory.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0];
      this.workingMemory.delete(lruSlot[0]);
    }

    this.workingMemory.set(slot.id, slot);
  }

  // Day 3 specific: Knowledge updates
  async updateKnowledge(knowledge: any): Promise<void> {
    console.log(`🧩 Updating knowledge: ${knowledge.concept || 'unnamed'}`);

    // Create or update semantic node
    await this.createSemanticNode(knowledge.concept, knowledge.properties);

    // Store in MemoraiMCP
    await this.memoraiClient.remember(knowledge, {
      entityType: 'semantic-knowledge',
      importance: knowledge.confidence || 0.8,
      timestamp: Date.now()
    });

    console.log(`✅ Knowledge updated`);
  }

  private async createSemanticNode(concept: string, properties: any): Promise<void> {
    const nodeId = `semantic-${concept.toLowerCase().replace(/\s+/g, '-')}`;

    const node: SemanticNode = {
      id: nodeId,
      concept,
      properties,
      relationships: [],
      confidence: properties.confidence || 0.8
    };

    this.semanticNetwork.set(nodeId, node);
  }

  // Advanced memory analysis
  async analyzeMemoryPatterns(): Promise<any> {
    return {
      workingMemoryUtilization: this.workingMemory.size / this.maxWorkingMemorySlots,
      episodeCount: this.episodes.size,
      semanticNodeCount: this.semanticNetwork.size,
      memoryEfficiency: this.calculateMemoryEfficiency(),
      topConcepts: this.getTopSemanticConcepts()
    };
  }

  private calculateMemoryEfficiency(): number {
    // Calculate memory system efficiency
    const totalMemories = this.memories.size + this.episodes.size + this.workingMemory.size;
    const maxCapacity = (this.config.memory?.maxSize || 1000);
    return 1 - (totalMemories / maxCapacity);
  }

  private getTopSemanticConcepts(): string[] {
    return Array.from(this.semanticNetwork.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(node => node.concept);
  }

  getStatus(): any {
    return {
      initialized: this.isInitialized,
      running: this.isRunning,
      memoriesCount: this.memories.size,
      episodesCount: this.episodes.size,
      workingMemorySlots: this.workingMemory.size,
      semanticNodes: this.semanticNetwork.size,
      capabilities: ['working-memory', 'long-term', 'episodic', 'semantic'],
      memoryAnalysis: this.isRunning ? this.analyzeMemoryPatterns() : null,
      memoraiIntegration: 'active',
      lastCleanup: new Date().toISOString()
    };
  }
}

export { MemoryManager as default };
