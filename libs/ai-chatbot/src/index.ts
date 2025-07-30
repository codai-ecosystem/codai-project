/**
 * CODAI AI Chatbot Core Library
 * 
 * Intelligent conversational AI system with advanced context management,
 * natural language processing, and enterprise-grade security.
 * 
 * @version 1.0.0
 * @author CODAI Team
 */

// Core chatbot engine
export { AIChatbot as default, AIChatbot } from './core';

// Core components
export { ConversationManager } from './conversation';
export { ContextManager } from './context';
export { AIIntelligence } from './intelligence';
export { SecurityValidator } from './security';

// Type definitions
export * from './types';

// Re-export for convenience
export {
  // Core types
  type ChatbotConfig,
  type Conversation,
  type Message,
  type AIResponse,
  type ConversationContext,
  type UserPreferences,

  // Event types
  type ChatbotEvent,
  type ChatbotEventType,

  // Configuration types
  type AIModelConfig,
  type PersonalityConfig,
  type ChatbotCapability,

  // Status types
  type ConversationStatus,
  type MessageRole,

  // Error types
  type ChatbotError
} from './types';

// Version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

/**
 * Create a new AI Chatbot instance with default configuration
 */
export function createChatbot(config: Partial<import('./types').ChatbotConfig> = {}) {
  const { AIChatbot } = require('./core');

  const defaultConfig: import('./types').ChatbotConfig = {
    name: 'CODAI Assistant',
    description: 'Intelligent AI assistant powered by CODAI',
    version: '1.0.0',

    // AI Model Configuration
    aiModel: {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      timeout: 30000,
      retries: 3
    },

    // Personality Configuration
    personality: {
      name: 'CODAI Assistant',
      description: 'A helpful, knowledgeable, and friendly AI assistant',
      tone: 'professional',
      style: 'adaptive',
      expertiseLevel: 'advanced'
    },

    // Capabilities
    capabilities: [
      'text_processing',
      'context_awareness',
      'multi_turn_conversation',
      'intent_recognition',
      'entity_extraction',
      'sentiment_analysis'
    ],

    // Security Configuration
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

    // Memory Configuration
    memory: {
      workingMemory: {
        maxItems: 100,
        ttl: 3600 // 1 Hour
      },
      longTermMemory: {
        enabled: true,
        maxItems: 1000,
        persistenceLevel: 'user'
      },
      contextWindow: 10
    },

    // Feature Configuration
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

  const mergedConfig = { ...defaultConfig, ...config };
  return new AIChatbot(mergedConfig);
}

/**
 * Utility functions for chatbot development
 */
export const utils = {
  /**
   * Validate chatbot configuration
   */
  validateConfig(config: import('./types').ChatbotConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.name || config.name.length === 0) {
      errors.push('Chatbot name is required');
    }

    if (!config.aiModel.provider) {
      errors.push('AI model provider is required');
    }

    if (!config.aiModel.model) {
      errors.push('AI model name is required');
    }

    if (config.aiModel.maxTokens && config.aiModel.maxTokens < 1) {
      errors.push('Max tokens must be greater than 0');
    }

    if (config.aiModel.temperature && (config.aiModel.temperature < 0 || config.aiModel.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Create a message object
   */
  createMessage(
    conversationId: string,
    content: string,
    role: import('./types').MessageRole = 'user',
    userId?: string,
    metadata?: any
  ): import('./types').Message {
    return {
      id: require('uuid').v4(),
      conversationId,
      userId,
      role,
      content,
      timestamp: new Date(),
      metadata
    };
  },

  /**
   * Calculate message token count (rough estimation)
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  },

  /**
   * Generate conversation title from first message
   */
  generateConversationTitle(firstMessage: string, maxLength: number = 50): string {
    const words = firstMessage.split(' ').slice(0, 8);
    let title = words.join(' ');

    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return title || 'New Conversation';
  }
};

// Export library information
export const library = {
  name: 'CODAI AI Chatbot Core',
  version: VERSION,
  description: 'Intelligent conversational AI system with advanced context management',
  author: 'CODAI Team',
  license: 'MIT',
  repository: 'https://github.com/codai-project/ai-chatbot',
  documentation: 'https://docs.codai.dev/ai-chatbot',

  features: [
    'Advanced conversation management',
    'Context-aware responses',
    'Natural language processing',
    'Intent recognition and entity extraction',
    'Sentiment analysis',
    'Enterprise-grade security',
    'Rate limiting and content filtering',
    'Multi-model AI support',
    'Extensible plugin architecture',
    'TypeScript support'
  ],

  supportedProviders: [
    'OpenAI (GPT-3.5, GPT-4)',
    'Anthropic Claude',
    'Google PaLM',
    'Custom API endpoints'
  ],

  requirements: {
    node: '>=18.0.0',
    typescript: '>=4.9.0'
  }
};
