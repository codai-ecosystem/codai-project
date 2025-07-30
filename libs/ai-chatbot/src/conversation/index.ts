/**
 * CODAI AI Chatbot Core - Conversation Management System
 * Handles conversation lifecycle, message storage, and conversation state
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  Conversation,
  Message,
  ConversationStatus,
  UserPreferences,
  ConversationMetadata
} from '../types';

export interface ConversationManagerConfig {
  maxConcurrentConversations: number;
  defaultTTL: number;
  persistenceEnabled: boolean;
}

export class ConversationManager extends EventEmitter {
  private config: ConversationManagerConfig;
  private conversations: Map<string, Conversation> = new Map();
  private userConversations: Map<string, Set<string>> = new Map();
  private messageStore: Map<string, Message[]> = new Map();

  constructor(config: ConversationManagerConfig) {
    super();
    this.config = config;
    this.setupCleanupTimer();
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    userId?: string,
    options: {
      title?: string;
      userPreferences?: UserPreferences;
      metadata?: ConversationMetadata;
    } = {}
  ): Promise<Conversation> {
    const conversationId = uuidv4();
    const now = new Date();

    const conversation: Conversation = {
      id: conversationId,
      userId,
      title: options.title || 'New Conversation',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastActivity: now,
      messageCount: 0,
      metadata: {
        tags: [],
        priority: 'normal',
        category: 'general',
        source: 'chat',
        ...options.metadata
      },
      userPreferences: options.userPreferences
    };

    // Store conversation
    this.conversations.set(conversationId, conversation);
    this.messageStore.set(conversationId, []);

    // Track user conversations
    if (userId) {
      if (!this.userConversations.has(userId)) {
        this.userConversations.set(userId, new Set());
      }
      this.userConversations.get(userId)!.add(conversationId);
    }

    this.emit('conversationStarted', conversation);
    console.log(`💬 New conversation created: ${conversationId}`);

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string, limit?: number): Promise<Conversation[]> {
    const userConvIds = this.userConversations.get(userId);
    if (!userConvIds) return [];

    const conversations = Array.from(userConvIds)
      .map(id => this.conversations.get(id))
      .filter((conv): conv is Conversation => conv !== undefined)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    return limit ? conversations.slice(0, limit) : conversations;
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId: string, message: Message): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Store message
    const messages = this.messageStore.get(conversationId) || [];
    messages.push(message);
    this.messageStore.set(conversationId, messages);

    // Update conversation
    conversation.messageCount++;
    conversation.lastActivity = new Date();
    conversation.updatedAt = new Date();

    this.emit('messageAdded', { conversationId, message });
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]> {
    const messages = this.messageStore.get(conversationId) || [];

    if (offset || limit) {
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      return messages.slice(start, end);
    }

    return messages;
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const oldStatus = conversation.status;
    conversation.status = status;
    conversation.updatedAt = new Date();

    this.emit('conversationStatusChanged', { conversationId, oldStatus, newStatus: status });

    if (status === 'completed' || status === 'archived') {
      this.emit('conversationEnded', conversationId);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    // Remove from user conversations
    if (conversation.userId) {
      const userConvs = this.userConversations.get(conversation.userId);
      if (userConvs) {
        userConvs.delete(conversationId);
        if (userConvs.size === 0) {
          this.userConversations.delete(conversation.userId);
        }
      }
    }

    // Remove conversation and messages
    this.conversations.delete(conversationId);
    this.messageStore.delete(conversationId);

    this.emit('conversationDeleted', conversationId);
  }

  /**
   * Update conversation metadata
   */
  async updateConversationMetadata(
    conversationId: string,
    metadata: Partial<ConversationMetadata>
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.metadata = { ...conversation.metadata, ...metadata };
    conversation.updatedAt = new Date();

    this.emit('conversationUpdated', conversation);
  }

  /**
   * Search conversations
   */
  async searchConversations(
    query: string,
    userId?: string,
    filters?: {
      status?: ConversationStatus[];
      dateRange?: { start: Date; end: Date };
      tags?: string[];
    }
  ): Promise<Conversation[]> {
    let conversations: Conversation[];

    if (userId) {
      conversations = await this.getUserConversations(userId);
    } else {
      conversations = Array.from(this.conversations.values());
    }

    // Apply filters
    if (filters) {
      conversations = conversations.filter(conv => {
        if (filters.status && !filters.status.includes(conv.status)) return false;
        if (filters.dateRange) {
          const createdAt = conv.createdAt.getTime();
          if (createdAt < filters.dateRange.start.getTime() ||
            createdAt > filters.dateRange.end.getTime()) return false;
        }
        if (filters.tags && !filters.tags.some(tag => conv.metadata.tags.includes(tag))) return false;
        return true;
      });
    }

    // Search in title and messages
    const searchResults = conversations.filter(conv => {
      const titleMatch = conv.title.toLowerCase().includes(query.toLowerCase());
      if (titleMatch) return true;

      // Search in messages
      const messages = this.messageStore.get(conv.id) || [];
      return messages.some(msg =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
    });

    return searchResults.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get active conversation count
   */
  async getActiveConversationCount(): Promise<number> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.status === 'active').length;
  }

  /**
   * Get total conversation count
   */
  async getTotalConversationCount(): Promise<number> {
    return this.conversations.size;
  }

  /**
   * Get conversation statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    completed: number;
    archived: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }> {
    const conversations = Array.from(this.conversations.values());
    const totalMessages = Array.from(this.messageStore.values())
      .reduce((sum, messages) => sum + messages.length, 0);

    return {
      total: conversations.length,
      active: conversations.filter(c => c.status === 'active').length,
      completed: conversations.filter(c => c.status === 'completed').length,
      archived: conversations.filter(c => c.status === 'archived').length,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0 ? totalMessages / conversations.length : 0
    };
  }

  /**
   * Cleanup expired conversations
   */
  private setupCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredConversations();
    }, 60000); // Check every minute
  }

  private async cleanupExpiredConversations(): Promise<void> {
    const now = new Date();
    const expiredConversations: string[] = [];

    for (const [id, conversation] of this.conversations) {
      if (conversation.status === 'completed' || conversation.status === 'archived') {
        const timeSinceLastActivity = now.getTime() - conversation.lastActivity.getTime();
        const ttlMs = this.config.defaultTTL * 1000;

        if (timeSinceLastActivity > ttlMs) {
          expiredConversations.push(id);
        }
      }
    }

    // Delete expired conversations
    for (const id of expiredConversations) {
      await this.deleteConversation(id);
    }

    if (expiredConversations.length > 0) {
      console.log(`🧹 Cleaned up ${expiredConversations.length} expired conversations`);
    }
  }

  /**
   * Shutdown conversation manager
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Conversation Manager...');

    // In a real implementation, this would persist conversations to database
    if (this.config.persistenceEnabled) {
      console.log('💾 Persisting conversations to storage...');
      // await this.persistConversations();
    }

    this.conversations.clear();
    this.userConversations.clear();
    this.messageStore.clear();

    console.log('✅ Conversation Manager shut down successfully');
  }
}

export default ConversationManager;
