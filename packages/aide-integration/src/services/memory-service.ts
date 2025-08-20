import { z } from 'zod';
import { EventBus } from '../event-bus';

export const MemoryServiceSchema = z.object({
  enabled: z.boolean().default(true),
  provider: z.enum(['memorai', 'redis', 'local']).default('memorai'),
  config: z.object({
    memorai: z.object({
      endpoint: z.string().default('localhost:8002'),
      agentId: z.string().default('aide_system'),
    }).optional(),
    redis: z.object({
      url: z.string().optional(),
      keyPrefix: z.string().default('aide:'),
    }).optional(),
    local: z.object({
      maxSize: z.number().default(1000),
    }).optional(),
  }),
});

export type MemoryServiceConfig = z.infer<typeof MemoryServiceSchema>;

export interface MemoryEntry {
  key: string;
  value: any;
  metadata?: {
    entityType?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    expireAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryQuery {
  query: string;
  entityType?: string;
  tags?: string[];
  limit?: number;
  minRelevance?: number;
}

export class MemoryService {
  private eventBus: EventBus;
  private config: MemoryServiceConfig;
  private initialized = false;
  private localCache = new Map<string, MemoryEntry>();

  constructor(config: MemoryServiceConfig, eventBus: EventBus) {
    this.config = MemoryServiceSchema.parse(config);
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🧠 Initializing Memory Service...');

    // Initialize memory provider
    switch (this.config.provider) {
      case 'memorai':
        await this.initializeMemoraiMCP();
        break;
      case 'redis':
        await this.initializeRedis();
        break;
      case 'local':
        await this.initializeLocal();
        break;
    }

    this.initialized = true;
    console.log('✅ Memory Service initialized');

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        action: 'memory_service_initialized',
        provider: this.config.provider,
      },
    });
  }

  private async initializeMemoraiMCP(): Promise<void> {
    console.log('Initializing MemoraiMCP integration...');
    // Integration with MemoraiMCP would go here
  }

  private async initializeRedis(): Promise<void> {
    console.log('Initializing Redis memory store...');
    // Redis integration would go here
  }

  private async initializeLocal(): Promise<void> {
    console.log('Initializing local memory store...');
    // Setup local memory cleanup
    this.setupLocalCleanup();
  }

  private setupLocalCleanup(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [key, entry] of this.localCache.entries()) {
        if (entry.metadata?.expireAt && now > entry.metadata.expireAt) {
          this.localCache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  async store(key: string, value: any, metadata?: MemoryEntry['metadata']): Promise<void> {
    const entry: MemoryEntry = {
      key,
      value,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.config.provider === 'local') {
      this.localCache.set(key, entry);

      // Enforce max size limit
      const maxSize = this.config.config?.local?.maxSize || 1000;
      if (this.localCache.size > maxSize) {
        // Remove oldest entries
        const entries = Array.from(this.localCache.entries())
          .sort(([, a], [, b]) => a.createdAt.getTime() - b.createdAt.getTime());

        for (let i = 0; i < entries.length - maxSize; i++) {
          this.localCache.delete(entries[i][0]);
        }
      }
    }

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        action: 'memory_stored',
        key,
        entityType: metadata?.entityType,
      },
    });
  }

  async retrieve(key: string): Promise<any> {
    if (this.config.provider === 'local') {
      const entry = this.localCache.get(key);
      if (!entry) return null;

      // Check expiration
      if (entry.metadata?.expireAt && new Date() > entry.metadata.expireAt) {
        this.localCache.delete(key);
        return null;
      }

      return entry.value;
    }

    // For other providers, implement actual retrieval
    return null;
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    if (this.config.provider === 'local') {
      const results: MemoryEntry[] = [];
      const searchTerm = query.query.toLowerCase();

      for (const entry of this.localCache.values()) {
        // Skip expired entries
        if (entry.metadata?.expireAt && new Date() > entry.metadata.expireAt) {
          continue;
        }

        // Filter by entity type
        if (query.entityType && entry.metadata?.entityType !== query.entityType) {
          continue;
        }

        // Filter by tags
        if (query.tags && query.tags.length > 0) {
          const entryTags = entry.metadata?.tags || [];
          const hasMatchingTag = query.tags.some(tag => entryTags.includes(tag));
          if (!hasMatchingTag) {
            continue;
          }
        }

        // Simple text matching
        const valueText = JSON.stringify(entry.value).toLowerCase();
        if (valueText.includes(searchTerm) || entry.key.toLowerCase().includes(searchTerm)) {
          results.push(entry);
        }
      }

      // Sort by relevance (simple: by creation date, newest first)
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply limit
      if (query.limit && query.limit > 0) {
        return results.slice(0, query.limit);
      }

      return results;
    }

    // For other providers, implement actual search
    return [];
  }

  async delete(key: string): Promise<boolean> {
    if (this.config.provider === 'local') {
      return this.localCache.delete(key);
    }

    // For other providers, implement actual deletion
    return false;
  }

  async clear(entityType?: string): Promise<number> {
    let count = 0;

    if (this.config.provider === 'local') {
      if (entityType) {
        // Clear specific entity type
        for (const [key, entry] of this.localCache.entries()) {
          if (entry.metadata?.entityType === entityType) {
            this.localCache.delete(key);
            count++;
          }
        }
      } else {
        // Clear all
        count = this.localCache.size;
        this.localCache.clear();
      }
    }

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        action: 'memory_cleared',
        count,
        entityType,
      },
    });

    return count;
  }

  async getStats(): Promise<{
    totalEntries: number;
    byEntityType: Record<string, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
  }> {
    const stats = {
      totalEntries: 0,
      byEntityType: {} as Record<string, number>,
      oldestEntry: undefined as Date | undefined,
      newestEntry: undefined as Date | undefined,
    };

    if (this.config.provider === 'local') {
      stats.totalEntries = this.localCache.size;

      for (const entry of this.localCache.values()) {
        const entityType = entry.metadata?.entityType || 'unknown';
        stats.byEntityType[entityType] = (stats.byEntityType[entityType] || 0) + 1;

        if (!stats.oldestEntry || entry.createdAt < stats.oldestEntry) {
          stats.oldestEntry = entry.createdAt;
        }

        if (!stats.newestEntry || entry.createdAt > stats.newestEntry) {
          stats.newestEntry = entry.createdAt;
        }
      }
    }

    return stats;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): MemoryServiceConfig {
    return this.config;
  }
}

export default MemoryService;
