/**
 * WORLD CLASS MEMORY SYSTEM TYPES
 * 
 * Comprehensive type definitions for the unified memory engine
 * Supporting multi-agent coordination and real-time dashboard sync
 * 
 * Author: AGENT 2 - Core Infrastructure
 * Date: 2025-01-15
 * Version: 1.0.0-WORLD-CLASS
 */

export interface MemoryEntry {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  relevance: number;
  timestamp: string;
  vectorEmbedding?: number[];
  semanticTags?: string[];
}

export interface MemoryMetadata {
  agentId: string;
  entityType: string;
  importance: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
  updatedAt: number;
  lastAccessed?: number;
  accessCount: number;
  source?: string;
  category?: string;
  tags?: string[];
  emotional_weight?: number;
  context?: Record<string, any>;

  // Cross-agent sharing
  originalAgentId?: string;
  adoptedAt?: number;
  adoptedBy?: string;
  shareable?: boolean;

  // AI Enhancement
  aiAnalyzed?: boolean;
  aiConfidence?: number;
  aiSuggestions?: string[];

  // Persistence
  persistenceLevel?: 'temporary' | 'session' | 'permanent';
  encrypted?: boolean;
  compressed?: boolean;
}

export interface MemoryFilter {
  entityType?: string;
  agentId?: string;
  importance?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from: number;
    to: number;
  };
  tags?: string[];
  category?: string;
  accessCount?: {
    min?: number;
    max?: number;
  };
  searchQuery?: string;
  relevanceThreshold?: number;
  includeSharedMemories?: boolean;
}

export interface MemoryStats {
  totalMemories: number;
  memoryByType: Record<string, number>;
  memoryByAgent: Record<string, number>;
  averageRelevance: number;
  lastUpdate: number;
  storageUsed: number;
  compressionRatio: number;

  // Advanced analytics
  topCategories?: Array<{ category: string; count: number; }>;
  memoryGrowthRate?: number;
  averageImportance?: number;
  mostActiveAgents?: Array<{ agentId: string; activityScore: number; }>;
  aiAnalysisStats?: {
    totalAnalyzed: number;
    averageConfidence: number;
    successfulEnhancements: number;
  };
}

export interface SharedMemoryState {
  agentId: string;
  lastUpdate: number;
  memoryCount: number;
  importantMemories: MemoryEntry[];
  recentActivities: MemoryActivity[];
  coordinationData: AgentCoordinationData;

  // Sync status
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncAttempt?: number;
  syncErrors?: string[];
}

export interface MemoryActivity {
  operation: 'create' | 'update' | 'delete' | 'access' | 'share';
  memoryId: string;
  timestamp: number;
  content: string;
  agentId?: string;
  metadata?: Record<string, any>;
}

export interface AgentCoordinationData {
  currentTask?: string;
  taskContext?: Record<string, any>;
  capabilities?: string[];
  status?: 'active' | 'idle' | 'busy' | 'error';
  lastHeartbeat?: number;
  sharedObjectives?: string[];
  coordinationLevel?: 'independent' | 'collaborative' | 'coordinated';
}

// Search and Query Types
export interface MemoryQuery {
  query: string;
  filters?: MemoryFilter;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'importance' | 'access_count';
  sortOrder?: 'asc' | 'desc';
  includeVectorSearch?: boolean;
  semanticThreshold?: number;
}

export interface MemorySearchResult {
  memories: MemoryEntry[];
  totalCount: number;
  searchTime: number;
  searchMethod: 'text' | 'semantic' | 'hybrid';
  confidence: number;
  suggestions?: string[];
}

// AI Enhancement Types
export interface AIAnalysisResult {
  enhancedMetadata: MemoryMetadata;
  suggestedTags: string[];
  importanceScore: number;
  confidence: number;
  semanticSummary?: string;
  relatedConcepts?: string[];
  emotionalContext?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    emotions: string[];
    intensity: number;
  };
}

export interface AIInsights {
  insights: Array<{
    type: 'pattern' | 'trend' | 'anomaly' | 'opportunity';
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;
  }>;
  patterns: Array<{
    name: string;
    frequency: number;
    significance: number;
    relatedMemories: string[];
  }>;
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
  }>;
  memoryHealth: {
    score: number;
    issues: string[];
    strengths: string[];
  };
}

// Dashboard Sync Types
export interface DashboardSyncEvent {
  type: 'memory_create' | 'memory_update' | 'memory_delete' | 'state_sync' | 'agent_status';
  agentId: string;
  timestamp: number;
  data: any;
  syncId: string;
}

export interface DashboardSyncStatus {
  lastSync: number;
  syncCount: number;
  failedSyncs: number;
  pendingEvents: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  latency?: number;
}

// Persistence Types
export interface PersistenceConfig {
  enabled: boolean;
  storageType: 'memory' | 'file' | 'database' | 'advanced-hybrid';
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  backupEnabled?: boolean;
  retentionPolicy?: {
    maxAge?: number; // milliseconds
    maxEntries?: number;
    pruneStrategy?: 'fifo' | 'lru' | 'importance-based';
  };
}

export interface PersistenceStats {
  totalEntries: number;
  storageSize: number;
  compressionRatio: number;
  lastBackup?: number;
  diskUsage?: number;
  ioOperations?: {
    reads: number;
    writes: number;
    deletes: number;
  };
}

// Conflict Resolution Types
export interface ConflictResolutionStrategy {
  strategy: 'merge' | 'overwrite' | 'ignore' | 'ai-assisted' | 'user-prompt';
  preserveImportantMemories: boolean;
  mergeSimilarContent: boolean;
  confidenceThreshold?: number;
  maxConflicts?: number;
}

export interface MemoryConflict {
  conflictId: string;
  type: 'duplicate' | 'similar' | 'contradictory' | 'version_mismatch';
  memories: MemoryEntry[];
  confidence: number;
  suggestedResolution?: 'merge' | 'keep_both' | 'choose_one' | 'manual_review';
  resolutionData?: any;
}

// Event Types
export interface MemoryEngineEvent {
  type: string;
  data: any;
  timestamp: number;
  agentId: string;
}

// Configuration Types
export interface MemoryEngineConfig {
  agentId: string;
  maxMemorySize: number;
  persistence: PersistenceConfig;
  aiConfig: {
    enabled: boolean;
    provider: 'openai' | 'azure-openai' | 'anthropic' | 'local';
    model?: string;
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
  };
  syncConfig: {
    dashboardEnabled: boolean;
    realtimeEnabled: boolean;
    crossAgentEnabled: boolean;
    syncInterval: number;
  };
  conflictResolution: ConflictResolutionStrategy;
}

// Utility Types
export type MemoryOperationType = 'create' | 'read' | 'update' | 'delete' | 'search' | 'sync';

export type AgentRole = 'primary' | 'secondary' | 'coordinator' | 'specialist';

export type MemoryPriority = 'critical' | 'high' | 'medium' | 'low';

export type SyncDirection = 'upload' | 'download' | 'bidirectional';

// Export default configuration
export const DEFAULT_MEMORY_CONFIG: Partial<MemoryEngineConfig> = {
  maxMemorySize: 10000,
  persistence: {
    enabled: true,
    storageType: 'advanced-hybrid',
    encryptionEnabled: true,
    compressionEnabled: true,
    backupEnabled: true
  },
  aiConfig: {
    enabled: true,
    provider: 'azure-openai',
    analysisDepth: 'comprehensive'
  },
  syncConfig: {
    dashboardEnabled: true,
    realtimeEnabled: true,
    crossAgentEnabled: true,
    syncInterval: 5000
  },
  conflictResolution: {
    strategy: 'ai-assisted',
    preserveImportantMemories: true,
    mergeSimilarContent: true,
    confidenceThreshold: 0.8
  }
};
