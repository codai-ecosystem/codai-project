/**
 * CODAI AI Chatbot Core - Main Chatbot Engine
 * Intelligent conversational AI system with advanced context management
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatbotConfig,
  Conversation,
  Message,
  AIResponse,
  ConversationContext,
  ChatbotEvent,
  ChatbotEventType,
  UserPreferences,
  ConversationStatus,
  ChatbotError,
  MessageProcessor,
  ContextProvider
} from '../types';
import { ConversationManager } from '../conversation';
import { ContextManager } from '../context';
import { AIIntelligence } from '../intelligence';
import { SecurityValidator } from '../security';

export class AIChatbot extends EventEmitter {
  private config: ChatbotConfig;
  private conversationManager: ConversationManager;
  private contextManager: ContextManager;
  private aiIntelligence: AIIntelligence;
  private securityValidator: SecurityValidator;
  private initialized: boolean = false;
  private plugins: Map<string, any> = new Map();

  constructor(config: ChatbotConfig) {
    super();
    this.config = this.validateAndMergeConfig(config);
    this.initializeComponents();
  }

  /**
   * Initialize all chatbot components
   */
  private initializeComponents(): void {
    try {
      // Initialize core components
      this.conversationManager = new ConversationManager({
        maxConcurrentConversations: 1000,
        defaultTTL: this.config.memory.workingMemory.ttl,
        persistenceEnabled: this.config.memory.longTermMemory.enabled
      });

      this.contextManager = new ContextManager({
        maxContextWindow: this.config.memory.contextWindow,
        workingMemoryConfig: this.config.memory.workingMemory,
        longTermMemoryConfig: this.config.memory.longTermMemory
      });

      this.aiIntelligence = new AIIntelligence({
        modelConfig: this.config.aiModel,
        personalityConfig: this.config.personality,
        capabilities: this.config.capabilities
      });

      this.securityValidator = new SecurityValidator({
        enabled: this.config.security.enabled,
        contentFiltering: this.config.security.contentFiltering,
        rateLimiting: this.config.security.rateLimiting
      });

      // Set up event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log(`✅ CODAI AI Chatbot "${this.config.name}" initialized successfully`);
    } catch (error) {
      console.error('❌ Failed to initialize AI Chatbot:', error);
      throw error;
    }
  }

  /**
   * Set up cross-component event listeners
   */
  private setupEventListeners(): void {
    // Conversation events
    this.conversationManager.on('conversationStarted', (conversation: Conversation) => {
      this.emitEvent('conversation_started', conversation.id, conversation.userId, { conversation });
    });

    this.conversationManager.on('conversationEnded', (conversationId: string) => {
      this.emitEvent('conversation_ended', conversationId, undefined, { conversationId });
    });

    // AI Intelligence events
    this.aiIntelligence.on('intentClassified', (data: any) => {
      this.emitEvent('intent_classified', data.conversationId, data.userId, data);
    });

    this.aiIntelligence.on('entityExtracted', (data: any) => {
      this.emitEvent('entity_extracted', data.conversationId, data.userId, data);
    });

    // Context events
    this.contextManager.on('contextUpdated', (data: any) => {
      this.emitEvent('context_updated', data.conversationId, data.userId, data);
    });
  }

  /**
   * Start a new conversation
   */
  async startConversation(userId?: string, initialMessage?: string): Promise<Conversation> {
    this.ensureInitialized();

    try {
      // Create new conversation
      const conversation = await this.conversationManager.createConversation(userId, {
        title: this.generateConversationTitle(initialMessage),
        userPreferences: await this.getUserPreferences(userId)
      });

      // Initialize context
      await this.contextManager.initializeContext(conversation.id, userId);

      // Process initial message if provided
      if (initialMessage) {
        await this.processMessage(conversation.id, initialMessage, userId);
      }

      this.emitEvent('conversation_started', conversation.id, userId, { conversation });
      return conversation;
    } catch (error) {
      throw this.createError('Failed to start conversation', 'processing', error);
    }
  }

  /**
   * Process a user message and generate AI response
   */
  async processMessage(
    conversationId: string,
    content: string,
    userId?: string,
    metadata?: any
  ): Promise<AIResponse> {
    this.ensureInitialized();

    try {
      // Security validation
      const userMessage: Message = {
        id: uuidv4(),
        conversationId,
        userId,
        role: 'user',
        content,
        timestamp: new Date(),
        metadata
      };

      const isValid = await this.securityValidator.validateMessage(userMessage);
      if (!isValid) {
        throw this.createError('Message failed security validation', 'security');
      }

      // Get conversation context
      const context = await this.contextManager.getContext(conversationId, userId);

      // Add user message to conversation
      await this.conversationManager.addMessage(conversationId, userMessage);

      // Process with AI intelligence
      const aiResponse = await this.aiIntelligence.processMessage(userMessage, context);

      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        conversationId,
        userId,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          ...aiResponse.metadata,
          confidence: aiResponse.confidence,
          processingFlags: []
        },
        tokens: aiResponse.tokens.completion,
        processingTime: aiResponse.processingTime
      };

      // Add assistant message to conversation
      await this.conversationManager.addMessage(conversationId, assistantMessage);

      // Update context with new information
      await this.contextManager.updateContext(conversationId, {
        messages: [userMessage, assistantMessage],
        entities: aiResponse.metadata.entities,
        intent: aiResponse.metadata.intent,
        sentiment: aiResponse.metadata.sentiment
      });

      this.emitEvent('message_received', conversationId, userId, { message: userMessage });
      this.emitEvent('message_sent', conversationId, userId, { message: assistantMessage });

      return aiResponse;
    } catch (error) {
      this.emitEvent('error_occurred', conversationId, userId, { error });
      throw this.createError('Failed to process message', 'processing', error);
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    this.ensureInitialized();
    return await this.conversationManager.getConversation(conversationId);
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string, limit?: number): Promise<Conversation[]> {
    this.ensureInitialized();
    return await this.conversationManager.getUserConversations(userId, limit);
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<void> {
    this.ensureInitialized();
    await this.conversationManager.updateConversationStatus(conversationId, status);
  }

  /**
   * End conversation
   */
  async endConversation(conversationId: string): Promise<void> {
    this.ensureInitialized();

    await this.conversationManager.updateConversationStatus(conversationId, 'completed');
    await this.contextManager.clearContext(conversationId);

    this.emitEvent('conversation_ended', conversationId, undefined, { conversationId });
  }

  /**
   * Get chatbot status and metrics
   */
  async getStatus(): Promise<any> {
    return {
      initialized: this.initialized,
      name: this.config.name,
      version: '1.0.0',
      activeConversations: await this.conversationManager.getActiveConversationCount(),
      totalConversations: await this.conversationManager.getTotalConversationCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      config: {
        capabilities: this.config.capabilities,
        features: this.config.features,
        aiModel: {
          provider: this.config.aiModel.provider,
          model: this.config.aiModel.model
        }
      }
    };
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: any): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw this.createError(`Plugin ${plugin.id} already registered`, 'validation');
    }

    await plugin.initialize(this);
    this.plugins.set(plugin.id, plugin);

    console.log(`📦 Plugin "${plugin.name}" registered successfully`);
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw this.createError(`Plugin ${pluginId} not found`, 'validation');
    }

    if (plugin.cleanup) {
      await plugin.cleanup();
    }

    this.plugins.delete(pluginId);
    console.log(`📦 Plugin "${plugin.name}" unregistered successfully`);
  }

  /**
   * Shutdown chatbot gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down AI Chatbot...');

    // Cleanup plugins
    for (const [id, plugin] of this.plugins) {
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
    }
    this.plugins.clear();

    // Cleanup components
    if (this.conversationManager) {
      await this.conversationManager.shutdown();
    }
    if (this.contextManager) {
      await this.contextManager.shutdown();
    }

    this.initialized = false;
    console.log('✅ AI Chatbot shut down successfully');
  }

  /**
   * Private helper methods
   */
  private validateAndMergeConfig(config: ChatbotConfig): ChatbotConfig {
    // Apply defaults and validate configuration
    const defaultConfig: Partial<ChatbotConfig> = {
      capabilities: ['text_processing', 'context_awareness', 'multi_turn_conversation'],
      security: {
        enabled: true,
        contentFiltering: true,
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 60,
          tokensPerHour: 100000
        },
        dataRetention: {
          conversationTTL: 30,
          userDataTTL: 90,
          anonymization: true
        },
        auditLogging: true
      },
      memory: {
        workingMemory: {
          maxItems: 100,
          ttl: 3600 // 1 hour
        },
        longTermMemory: {
          enabled: true,
          maxItems: 1000,
          persistenceLevel: 'user'
        },
        contextWindow: 10
      },
      features: {
        multiLanguage: false,
        voiceSupport: false,
        fileProcessing: false,
        imageAnalysis: false,
        codeExecution: false,
        webSearch: false,
        integrations: []
      }
    };

    return { ...defaultConfig, ...config } as ChatbotConfig;
  }

  private generateConversationTitle(initialMessage?: string): string {
    if (!initialMessage) return 'New Conversation';

    const words = initialMessage.split(' ').slice(0, 5);
    return words.join(' ') + (words.length < initialMessage.split(' ').length ? '...' : '');
  }

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

  private emitEvent(
    type: ChatbotEventType,
    conversationId: string,
    userId?: string,
    data: any = {}
  ): void {
    const event: ChatbotEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date(),
      conversationId,
      userId,
      data
    };

    this.emit(type, event);
    this.emit('event', event);
  }

  private createError(message: string, type: ChatbotError['type'], originalError?: any): ChatbotError {
    const error = new Error(message) as ChatbotError;
    error.code = `CHATBOT_${type.toUpperCase()}`;
    error.type = type;
    error.recoverable = type !== 'system';
    error.metadata = originalError ? { originalError: originalError.message } : {};

    return error;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError('Chatbot not initialized', 'system');
    }
  }
}

export default AIChatbot;
