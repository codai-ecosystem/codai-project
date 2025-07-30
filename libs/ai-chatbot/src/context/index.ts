/**
 * CODAI AI Chatbot Core - Context Management System
 * Manages conversation context, working memory, and long-term memory
 */

import { EventEmitter } from 'events';
import {
  ConversationContext,
  WorkingMemoryItem,
  LongTermMemoryItem,
  UserPreferences
} from '../types';

export interface ContextManagerConfig {
  maxContextWindow: number;
  workingMemoryConfig: {
    maxItems: number;
    ttl: number;
  };
  longTermMemoryConfig: {
    enabled: boolean;
    maxItems: number;
    persistenceLevel: 'session' | 'user' | 'global';
  };
}

export class ContextManager extends EventEmitter {
  private config: ContextManagerConfig;
  private contexts: Map<string, ConversationContext> = new Map();
  private workingMemoryCleanupTimer?: NodeJS.Timeout;

  constructor(config: ContextManagerConfig) {
    super();
    this.config = config;
    this.setupMemoryCleanup();
  }

  /**
   * Initialize context for a new conversation
   */
  async initializeContext(conversationId: string, userId?: string): Promise<ConversationContext> {
    const userPreferences = await this.getUserPreferences(userId);

    const context: ConversationContext = {
      currentTopic: undefined,
      previousTopics: [],
      userPreferences,
      sessionData: {},
      workingMemory: [],
      longTermMemory: await this.loadLongTermMemory(userId)
    };

    this.contexts.set(conversationId, context);
    this.emit('contextInitialized', { conversationId, context });

    return context;
  }

  /**
   * Get context for a conversation
   */
  async getContext(conversationId: string, userId?: string): Promise<ConversationContext> {
    let context = this.contexts.get(conversationId);

    if (!context) {
      context = await this.initializeContext(conversationId, userId);
    }

    return { ...context }; // Return a copy to prevent external mutations
  }

  /**
   * Update context with new information
   */
  async updateContext(conversationId: string, updates: {
    messages?: any[];
    entities?: any[];
    intent?: string;
    sentiment?: any;
    topic?: string;
    sessionData?: Record<string, any>;
  }): Promise<void> {
    const context = this.contexts.get(conversationId);
    if (!context) {
      throw new Error(`Context not found for conversation ${conversationId}`);
    }

    // Update current topic
    if (updates.topic && updates.topic !== context.currentTopic) {
      if (context.currentTopic) {
        context.previousTopics.push(context.currentTopic);
      }
      context.currentTopic = updates.topic;
    }

    // Update session data
    if (updates.sessionData) {
      context.sessionData = { ...context.sessionData, ...updates.sessionData };
    }

    // Update working memory with new entities and insights
    if (updates.entities) {
      await this.updateWorkingMemory(conversationId, updates.entities);
    }

    // Store important information in long-term memory
    if (updates.intent || updates.sentiment) {
      await this.updateLongTermMemory(conversationId, {
        intent: updates.intent,
        sentiment: updates.sentiment,
        topic: updates.topic
      });
    }

    this.emit('contextUpdated', { conversationId, updates });
  }

  /**
   * Update working memory with new information
   */
  async updateWorkingMemory(conversationId: string, entities: any[]): Promise<void> {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    const now = new Date();

    // Add new entities to working memory
    for (const entity of entities) {
      const memoryItem: WorkingMemoryItem = {
        key: `entity_${entity.type}_${entity.value}`,
        value: entity,
        timestamp: now,
        relevanceScore: this.calculateRelevanceScore(entity),
        ttl: this.config.workingMemoryConfig.ttl
      };

      // Remove existing item with same key
      context.workingMemory = context.workingMemory.filter(item => item.key !== memoryItem.key);

      // Add new item
      context.workingMemory.push(memoryItem);
    }

    // Cleanup expired items
    await this.cleanupWorkingMemory(conversationId);

    // Limit working memory size
    if (context.workingMemory.length > this.config.workingMemoryConfig.maxItems) {
      context.workingMemory = context.workingMemory
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, this.config.workingMemoryConfig.maxItems);
    }
  }

  /**
   * Update long-term memory with important information
   */
  async updateLongTermMemory(conversationId: string, data: {
    intent?: string;
    sentiment?: any;
    topic?: string;
  }): Promise<void> {
    if (!this.config.longTermMemoryConfig.enabled) return;

    const context = this.contexts.get(conversationId);
    if (!context) return;

    const now = new Date();

    // Store intent patterns
    if (data.intent) {
      const memoryItem: LongTermMemoryItem = {
        key: `intent_${data.intent}`,
        type: 'pattern',
        content: `User frequently expresses intent: ${data.intent}`,
        confidence: 0.7,
        lastAccessed: now,
        accessCount: 1,
        tags: ['intent', data.intent]
      };

      this.addToLongTermMemory(context, memoryItem);
    }

    // Store topic preferences
    if (data.topic) {
      const memoryItem: LongTermMemoryItem = {
        key: `topic_${data.topic}`,
        type: 'preference',
        content: `User shows interest in topic: ${data.topic}`,
        confidence: 0.6,
        lastAccessed: now,
        accessCount: 1,
        tags: ['topic', data.topic]
      };

      this.addToLongTermMemory(context, memoryItem);
    }

    // Store sentiment patterns
    if (data.sentiment && data.sentiment.score !== undefined) {
      const sentimentType = data.sentiment.score > 0.1 ? 'positive' :
        data.sentiment.score < -0.1 ? 'negative' : 'neutral';

      const memoryItem: LongTermMemoryItem = {
        key: `sentiment_pattern`,
        type: 'pattern',
        content: `User sentiment trend: ${sentimentType} (${data.sentiment.score})`,
        confidence: Math.abs(data.sentiment.score),
        lastAccessed: now,
        accessCount: 1,
        tags: ['sentiment', sentimentType]
      };

      this.addToLongTermMemory(context, memoryItem);
    }
  }

  /**
   * Get relevant context for AI processing
   */
  async getRelevantContext(conversationId: string, query: string): Promise<{
    workingMemory: WorkingMemoryItem[];
    longTermMemory: LongTermMemoryItem[];
    recentTopics: string[];
    userPreferences: UserPreferences;
  }> {
    const context = await this.getContext(conversationId);

    // Get most relevant working memory items
    const relevantWorkingMemory = context.workingMemory
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    // Get relevant long-term memory based on query
    const relevantLongTermMemory = context.longTermMemory
      .filter(item => this.isRelevantToQuery(item, query))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    // Get recent topics
    const recentTopics = context.previousTopics.slice(-3);
    if (context.currentTopic) {
      recentTopics.push(context.currentTopic);
    }

    return {
      workingMemory: relevantWorkingMemory,
      longTermMemory: relevantLongTermMemory,
      recentTopics,
      userPreferences: context.userPreferences
    };
  }

  /**
   * Clear context for a conversation
   */
  async clearContext(conversationId: string): Promise<void> {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    // Optionally persist important long-term memory items
    if (this.config.longTermMemoryConfig.persistenceLevel === 'user') {
      // In a real implementation, save to database
      console.log(`💾 Persisting long-term memory for conversation ${conversationId}`);
    }

    this.contexts.delete(conversationId);
    this.emit('contextCleared', { conversationId });
  }

  /**
   * Get context statistics
   */
  async getStatistics(): Promise<{
    activeContexts: number;
    totalWorkingMemoryItems: number;
    totalLongTermMemoryItems: number;
    averageContextSize: number;
  }> {
    const contexts = Array.from(this.contexts.values());
    const totalWorkingMemory = contexts.reduce((sum, ctx) => sum + ctx.workingMemory.length, 0);
    const totalLongTermMemory = contexts.reduce((sum, ctx) => sum + ctx.longTermMemory.length, 0);

    return {
      activeContexts: contexts.length,
      totalWorkingMemoryItems: totalWorkingMemory,
      totalLongTermMemoryItems: totalLongTermMemory,
      averageContextSize: contexts.length > 0 ?
        (totalWorkingMemory + totalLongTermMemory) / contexts.length : 0
    };
  }

  /**
   * Private helper methods
   */
  private async getUserPreferences(userId?: string): Promise<UserPreferences> {
    // Default preferences - in real implementation, fetch from user service
    return {
      language: 'en',
      communicationStyle: 'friendly',
      responseLength: 'adaptive',
      expertise: {},
      interests: [],
      timezone: 'UTC',
      notifications: {
        enabled: false,
        channels: [],
        frequency: 'immediate',
        types: []
      }
    };
  }

  private async loadLongTermMemory(userId?: string): Promise<LongTermMemoryItem[]> {
    if (!this.config.longTermMemoryConfig.enabled || !userId) return [];

    // In a real implementation, load from database
    return [];
  }

  private calculateRelevanceScore(entity: any): number {
    // Simple relevance scoring - can be enhanced with ML
    let score = 0.5;

    if (entity.confidence) {
      score += entity.confidence * 0.3;
    }

    if (entity.frequency) {
      score += Math.min(entity.frequency / 10, 0.2);
    }

    return Math.min(score, 1.0);
  }

  private addToLongTermMemory(context: ConversationContext, item: LongTermMemoryItem): void {
    // Check if item already exists
    const existingIndex = context.longTermMemory.findIndex(memory => memory.key === item.key);

    if (existingIndex >= 0) {
      // Update existing item
      const existing = context.longTermMemory[existingIndex];
      existing.accessCount++;
      existing.lastAccessed = new Date();
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
    } else {
      // Add new item
      context.longTermMemory.push(item);

      // Limit long-term memory size
      if (context.longTermMemory.length > this.config.longTermMemoryConfig.maxItems) {
        context.longTermMemory = context.longTermMemory
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, this.config.longTermMemoryConfig.maxItems);
      }
    }
  }

  private isRelevantToQuery(item: LongTermMemoryItem, query: string): boolean {
    const queryLower = query.toLowerCase();
    const contentLower = item.content.toLowerCase();

    // Check if query contains any of the item's tags
    const tagMatch = item.tags.some(tag => queryLower.includes(tag.toLowerCase()));

    // Check if content is relevant
    const contentMatch = contentLower.includes(queryLower) ||
      queryLower.includes(contentLower);

    return tagMatch || contentMatch;
  }

  private async cleanupWorkingMemory(conversationId: string): Promise<void> {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    const now = new Date();

    context.workingMemory = context.workingMemory.filter(item => {
      const age = now.getTime() - item.timestamp.getTime();
      return age < (item.ttl * 1000);
    });
  }

  private setupMemoryCleanup(): void {
    this.workingMemoryCleanupTimer = setInterval(async () => {
      for (const conversationId of this.contexts.keys()) {
        await this.cleanupWorkingMemory(conversationId);
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Shutdown context manager
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Context Manager...');

    if (this.workingMemoryCleanupTimer) {
      clearInterval(this.workingMemoryCleanupTimer);
    }

    // Persist important context data
    if (this.config.longTermMemoryConfig.persistenceLevel !== 'session') {
      console.log('💾 Persisting context data...');
      // In a real implementation, save to database
    }

    this.contexts.clear();
    console.log('✅ Context Manager shut down successfully');
  }
}

export default ContextManager;
