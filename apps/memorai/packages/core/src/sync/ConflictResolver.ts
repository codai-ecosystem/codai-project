/**
 * WORLD CLASS CONFLICT RESOLVER
 * 
 * Intelligent conflict resolution for multi-agent memory systems
 * AI-assisted decision making and automatic conflict resolution
 * 
 * Author: AGENT 2 - Core Infrastructure
 * Date: 2025-01-15
 * Version: 1.0.0-WORLD-CLASS
 */

import { EventEmitter } from 'events';
import { MemoryEntry, MemoryConflict, ConflictResolutionStrategy } from '../types/Memory';

export interface ConflictResolverConfig {
  strategy: 'merge' | 'overwrite' | 'ignore' | 'ai-assisted' | 'user-prompt';
  preserveImportantMemories: boolean;
  mergeSimilarContent: boolean;
  confidenceThreshold?: number;
  maxConflicts?: number;
  similarityThreshold?: number;
}

export class ConflictResolver extends EventEmitter {
  private config: ConflictResolverConfig;
  private conflictHistory: Map<string, MemoryConflict> = new Map();
  private resolutionStats = {
    totalConflicts: 0,
    resolvedConflicts: 0,
    autoResolved: 0,
    manualResolved: 0,
    averageResolutionTime: 0
  };

  constructor(config: ConflictResolverConfig) {
    super();
    this.config = {
      confidenceThreshold: 0.8,
      maxConflicts: 100,
      similarityThreshold: 0.85,
      ...config
    };

    console.log(`⚖️ Conflict Resolver initialized - Strategy: ${this.config.strategy}`);
  }

  /**
   * CONFLICT DETECTION
   */

  async detectConflicts(newMemory: MemoryEntry, existingMemories: MemoryEntry[]): Promise<MemoryConflict[]> {
    const conflicts: MemoryConflict[] = [];

    try {
      for (const existing of existingMemories) {
        const conflict = await this.analyzeMemoryConflict(newMemory, existing);
        if (conflict) {
          conflicts.push(conflict);
        }
      }

      if (conflicts.length > 0) {
        this.resolutionStats.totalConflicts += conflicts.length;
        this.emit('conflicts:detected', {
          newMemoryId: newMemory.id,
          conflictCount: conflicts.length,
          conflicts
        });
      }

      return conflicts;

    } catch (error) {
      console.error('❌ Error detecting conflicts:', error);
      this.emit('conflicts:error', { error, operation: 'detect' });
      return [];
    }
  }

  private async analyzeMemoryConflict(memory1: MemoryEntry, memory2: MemoryEntry): Promise<MemoryConflict | null> {
    // Check for various types of conflicts
    const similarity = this.calculateContentSimilarity(memory1.content, memory2.content);

    // Duplicate detection
    if (similarity > (this.config.similarityThreshold || 0.85)) {
      return {
        conflictId: this.generateConflictId(),
        type: 'duplicate',
        memories: [memory1, memory2],
        confidence: similarity,
        suggestedResolution: 'merge',
        resolutionData: {
          similarity,
          reason: 'High content similarity detected'
        }
      };
    }

    // Similar content detection
    if (similarity > 0.7 && this.config.mergeSimilarContent) {
      return {
        conflictId: this.generateConflictId(),
        type: 'similar',
        memories: [memory1, memory2],
        confidence: similarity,
        suggestedResolution: 'merge',
        resolutionData: {
          similarity,
          reason: 'Similar content that could be merged'
        }
      };
    }

    // Contradictory information
    if (this.detectContradiction(memory1, memory2)) {
      return {
        conflictId: this.generateConflictId(),
        type: 'contradictory',
        memories: [memory1, memory2],
        confidence: 0.8,
        suggestedResolution: 'manual_review',
        resolutionData: {
          reason: 'Contradictory information detected'
        }
      };
    }

    // Version mismatch (same entity, different versions)
    if (this.detectVersionMismatch(memory1, memory2)) {
      return {
        conflictId: this.generateConflictId(),
        type: 'version_mismatch',
        memories: [memory1, memory2],
        confidence: 0.9,
        suggestedResolution: 'keep_both',
        resolutionData: {
          reason: 'Different versions of the same entity'
        }
      };
    }

    return null;
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private detectContradiction(memory1: MemoryEntry, memory2: MemoryEntry): boolean {
    // Look for contradictory keywords
    const contradictoryPairs = [
      ['success', 'failure'],
      ['complete', 'incomplete'],
      ['working', 'broken'],
      ['enabled', 'disabled'],
      ['true', 'false'],
      ['yes', 'no']
    ];

    const content1 = memory1.content.toLowerCase();
    const content2 = memory2.content.toLowerCase();

    return contradictoryPairs.some(([word1, word2]) =>
      (content1.includes(word1) && content2.includes(word2)) ||
      (content1.includes(word2) && content2.includes(word1))
    );
  }

  private detectVersionMismatch(memory1: MemoryEntry, memory2: MemoryEntry): boolean {
    // Check if memories refer to the same entity but with different versions
    const entityMatch = memory1.metadata.entityType === memory2.metadata.entityType &&
      memory1.metadata.entityType !== 'general';

    const timeGap = Math.abs(memory1.metadata.createdAt - memory2.metadata.createdAt);
    const significantTimeGap = timeGap > 60000; // 1 minute

    return entityMatch && significantTimeGap;
  }

  /**
   * CONFLICT RESOLUTION
   */

  async resolveConflict(conflict: MemoryConflict): Promise<MemoryEntry[]> {
    const startTime = Date.now();

    try {
      let resolvedMemories: MemoryEntry[] = [];

      switch (this.config.strategy) {
        case 'merge':
          resolvedMemories = await this.mergeMemories(conflict);
          break;

        case 'overwrite':
          resolvedMemories = await this.overwriteMemories(conflict);
          break;

        case 'ignore':
          resolvedMemories = conflict.memories;
          break;

        case 'ai-assisted':
          resolvedMemories = await this.aiAssistedResolution(conflict);
          break;

        case 'user-prompt':
          resolvedMemories = await this.userPromptResolution(conflict);
          break;

        default:
          resolvedMemories = conflict.memories;
      }

      // Update statistics
      this.resolutionStats.resolvedConflicts++;
      if (this.config.strategy !== 'user-prompt') {
        this.resolutionStats.autoResolved++;
      } else {
        this.resolutionStats.manualResolved++;
      }

      const resolutionTime = Date.now() - startTime;
      this.resolutionStats.averageResolutionTime =
        (this.resolutionStats.averageResolutionTime + resolutionTime) / 2;

      // Store resolution in history
      this.conflictHistory.set(conflict.conflictId, {
        ...conflict,
        resolutionData: {
          ...conflict.resolutionData,
          resolvedAt: Date.now(),
          resolutionTime,
          resolvedMemories: resolvedMemories.map(m => m.id)
        }
      });

      this.emit('conflicts:resolved', {
        conflictId: conflict.conflictId,
        resolutionStrategy: this.config.strategy,
        originalCount: conflict.memories.length,
        resolvedCount: resolvedMemories.length,
        resolutionTime
      });

      return resolvedMemories;

    } catch (error) {
      console.error('❌ Error resolving conflict:', error);
      this.emit('conflicts:error', { error, operation: 'resolve', conflictId: conflict.conflictId });
      return conflict.memories; // Return original memories on error
    }
  }

  private async mergeMemories(conflict: MemoryConflict): Promise<MemoryEntry[]> {
    if (conflict.memories.length < 2) return conflict.memories;

    const [primary, secondary] = conflict.memories;

    // Create merged memory
    const mergedMemory: MemoryEntry = {
      id: this.generateMergedId(primary.id, secondary.id),
      content: this.mergeContent(primary.content, secondary.content),
      metadata: {
        ...primary.metadata,
        importance: Math.max(primary.metadata.importance, secondary.metadata.importance),
        tags: [...new Set([...(primary.metadata.tags || []), ...(secondary.metadata.tags || [])])],
        accessCount: primary.metadata.accessCount + secondary.metadata.accessCount,
        updatedAt: Date.now()
      },
      relevance: Math.max(primary.relevance, secondary.relevance),
      timestamp: new Date().toISOString()
    };

    return [mergedMemory];
  }

  private mergeContent(content1: string, content2: string): string {
    // Simple content merging - in production, this could use AI for better merging
    if (content1.length > content2.length) {
      return `${content1}\n\n[Merged with: ${content2.substring(0, 100)}...]`;
    } else {
      return `${content2}\n\n[Merged with: ${content1.substring(0, 100)}...]`;
    }
  }

  private async overwriteMemories(conflict: MemoryConflict): Promise<MemoryEntry[]> {
    // Keep the most important or most recent memory
    return conflict.memories
      .sort((a, b) => {
        // First sort by importance
        const importanceDiff = b.metadata.importance - a.metadata.importance;
        if (Math.abs(importanceDiff) > 0.1) return importanceDiff;

        // Then by recency
        return b.metadata.createdAt - a.metadata.createdAt;
      })
      .slice(0, 1);
  }

  private async aiAssistedResolution(conflict: MemoryConflict): Promise<MemoryEntry[]> {
    // AI-assisted resolution based on conflict type and content analysis
    switch (conflict.type) {
      case 'duplicate':
        return await this.mergeMemories(conflict);

      case 'similar':
        if (conflict.confidence > 0.8) {
          return await this.mergeMemories(conflict);
        } else {
          return conflict.memories; // Keep both
        }

      case 'contradictory':
        // For contradictions, prefer the more recent and more important memory
        return await this.overwriteMemories(conflict);

      case 'version_mismatch':
        // For version mismatches, keep both but mark appropriately
        return conflict.memories.map(memory => ({
          ...memory,
          metadata: {
            ...memory.metadata,
            tags: [...(memory.metadata.tags || []), 'version-controlled']
          }
        }));

      default:
        return conflict.memories;
    }
  }

  private async userPromptResolution(conflict: MemoryConflict): Promise<MemoryEntry[]> {
    // In a real implementation, this would present the conflict to the user for resolution
    console.log(`👤 User prompt required for conflict: ${conflict.conflictId}`);
    console.log(`Conflict type: ${conflict.type}`);
    console.log(`Memories involved: ${conflict.memories.length}`);

    // For now, fall back to AI-assisted resolution
    return await this.aiAssistedResolution(conflict);
  }

  /**
   * MEMORY ADOPTION LOGIC
   */

  async shouldAdoptMemory(candidateMemory: MemoryEntry, existingMemories: MemoryEntry[]): Promise<boolean> {
    try {
      // Check if memory is important enough to adopt
      if (candidateMemory.metadata.importance < 0.5) {
        return false;
      }

      // Check for conflicts
      const conflicts = await this.detectConflicts(candidateMemory, existingMemories);

      // If no conflicts, adopt the memory
      if (conflicts.length === 0) {
        return true;
      }

      // Analyze conflicts to determine adoption
      const hasHighImportanceConflicts = conflicts.some(
        conflict => conflict.confidence > (this.config.confidenceThreshold || 0.8)
      );

      if (!hasHighImportanceConflicts) {
        return true;
      }

      // For high-confidence conflicts, check if the candidate is significantly better
      const avgExistingImportance = existingMemories
        .reduce((sum, mem) => sum + mem.metadata.importance, 0) / existingMemories.length;

      return candidateMemory.metadata.importance > avgExistingImportance + 0.2;

    } catch (error) {
      console.error('❌ Error in adoption decision:', error);
      return false;
    }
  }

  /**
   * UTILITY METHODS
   */

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMergedId(id1: string, id2: string): string {
    return `merged_${Date.now()}_${id1.substr(-4)}_${id2.substr(-4)}`;
  }

  /**
   * PUBLIC API
   */

  getResolutionStats(): typeof this.resolutionStats {
    return { ...this.resolutionStats };
  }

  getConflictHistory(): MemoryConflict[] {
    return Array.from(this.conflictHistory.values());
  }

  clearHistory(): void {
    this.conflictHistory.clear();
    console.log('🧹 Conflict history cleared');
  }

  updateStrategy(newStrategy: ConflictResolverConfig): void {
    this.config = { ...this.config, ...newStrategy };
    console.log(`⚖️ Conflict resolution strategy updated: ${this.config.strategy}`);
    this.emit('conflicts:strategy_updated', { newStrategy: this.config });
  }

  async shutdown(): Promise<void> {
    console.log('⚖️ Conflict Resolver shutdown complete');
    console.log(`📊 Final stats: ${this.resolutionStats.resolvedConflicts} conflicts resolved`);
    this.emit('conflicts:shutdown', { stats: this.resolutionStats });
  }
}
