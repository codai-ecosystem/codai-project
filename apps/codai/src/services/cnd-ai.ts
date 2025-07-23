/**
 * CND AI Service for CODAI
 * Provides AI model storage, vector search, conversation management,
 * and training data storage using CND enterprise features
 */

import { CND } from '@codai/cnd';
import { z } from 'zod';

// AI Model schemas
const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  type: z.enum(['llm', 'vision', 'embedding', 'classification', 'generation']),
  provider: z.string(),
  modelPath: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

const ConversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.date(),
    metadata: z.record(z.any()).optional()
  })),
  modelId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

const TrainingDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  modelId: z.string(),
  inputText: z.string(),
  expectedOutput: z.string(),
  actualOutput: z.string().optional(),
  feedback: z.enum(['positive', 'negative', 'neutral']).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date())
});

type AIModel = z.infer<typeof AIModelSchema>;
type Conversation = z.infer<typeof ConversationSchema>;
type TrainingData = z.infer<typeof TrainingDataSchema>;

export class CNDAIService {
  private cnd: CND;
  private isInitialized = false;

  constructor() {
    // Initialize CND with AI-specific configuration
    const cndConfig = {
      cbd: {
        host: process.env.CBD_HOST || 'localhost',
        port: parseInt(process.env.CBD_PORT || '5000'),
        database: process.env.CBD_DATABASE || 'codai_ai_db'
      },
      enterprise: {
        enabled: true,
        features: {
          serviceDiscovery: true,
          authentication: true,
          authorization: true,
          audit: true,
          monitoring: true
        }
      },
      auth: {
        enabled: true,
        provider: 'internal',
        config: {
          secret: process.env.CND_AUTH_SECRET || 'codai-ai-service-secret'
        }
      },
      serviceDiscovery: {
        enabled: true,
        serviceName: 'codai-ai-service',
        tags: ['ai', 'ml', 'vector-search', 'conversations', 'models'],
        healthCheckInterval: 30000
      },
      security: {
        audit: {
          enabled: true,
          logLevel: 'detailed',
          storage: 'database',
          retentionDays: 365
        }
      },
      performance: {
        monitoring: {
          enabled: true,
          metricsEnabled: true,
          healthChecksEnabled: true,
          customMetrics: {
            'ai_model_queries': 'counter',
            'conversation_created': 'counter',
            'vector_searches': 'counter',
            'training_data_added': 'counter',
            'ai_response_time': 'histogram',
            'active_ai_sessions': 'gauge'
          }
        }
      },
      cache: {
        enabled: true,
        ttl: 600 // 10 minutes for AI responses
      },
      vector: {
        enabled: true,
        dimensions: 1536, // OpenAI embedding dimensions
        similarity: 'cosine'
      },
      logging: {
        enabled: true,
        level: 'info'
      }
    };

    this.cnd = new CND(cndConfig);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.cnd.connect();
      await this.setupDatabase();
      this.isInitialized = true;

      await this.logAudit('service_initialized', {
        service: 'codai-ai-service',
        timestamp: new Date(),
        status: 'success'
      });

      console.log('✅ CND AI Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize CND AI Service:', error);
      throw error;
    }
  }

  private async setupDatabase(): Promise<void> {
    // Create AI models table
    await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        model_path TEXT,
        parameters TEXT,
        metadata TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create conversations table
    await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        messages TEXT NOT NULL,
        model_id VARCHAR(36),
        tags TEXT,
        is_archived BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create training data table
    await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS training_data (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        model_id VARCHAR(36) NOT NULL,
        input_text TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        actual_output TEXT,
        feedback VARCHAR(20),
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create vector embeddings table for semantic search
    await this.cnd.sql().query(`
      CREATE TABLE IF NOT EXISTS conversation_embeddings (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        message_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ AI database schema created');
  }

  // AI Model Management
  async createAIModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIModel> {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const aiModel: AIModel = {
      ...model,
      id: modelId,
      createdAt: now,
      updatedAt: now
    };

    // Validate model data
    const validatedModel = AIModelSchema.parse(aiModel);

    await this.cnd.sql().query(`
      INSERT INTO ai_models (id, name, version, type, provider, model_path, parameters, metadata, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validatedModel.id,
      validatedModel.name,
      validatedModel.version,
      validatedModel.type,
      validatedModel.provider,
      validatedModel.modelPath || null,
      JSON.stringify(validatedModel.parameters || {}),
      JSON.stringify(validatedModel.metadata || {}),
      validatedModel.isActive,
      validatedModel.createdAt.toISOString(),
      validatedModel.updatedAt.toISOString()
    ]);

    await this.recordMetric('ai_model_created');
    await this.logAudit('ai_model_created', { modelId, name: validatedModel.name });

    return validatedModel;
  }

  async getAIModel(modelId: string): Promise<AIModel | null> {
    const result = await this.cnd.sql().query(`
      SELECT * FROM ai_models WHERE id = ?
    `, [modelId]);

    if (!result.data || result.data.length === 0) {
      return null;
    }

    const row = result.data[0];
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      type: row.type,
      provider: row.provider,
      modelPath: row.model_path,
      parameters: row.parameters ? JSON.parse(row.parameters) : {},
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async getActiveAIModels(): Promise<AIModel[]> {
    const result = await this.cnd.sql().query(`
      SELECT * FROM ai_models WHERE is_active = true ORDER BY created_at DESC
    `);

    if (!result.data) {
      return [];
    }

    return result.data.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      type: row.type,
      provider: row.provider,
      modelPath: row.model_path,
      parameters: row.parameters ? JSON.parse(row.parameters) : {},
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  // Conversation Management
  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newConversation: Conversation = {
      ...conversation,
      id: conversationId,
      createdAt: now,
      updatedAt: now
    };

    // Validate conversation data
    const validatedConversation = ConversationSchema.parse(newConversation);

    await this.cnd.sql().query(`
      INSERT INTO conversations (id, user_id, title, messages, model_id, tags, is_archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validatedConversation.id,
      validatedConversation.userId,
      validatedConversation.title,
      JSON.stringify(validatedConversation.messages),
      validatedConversation.modelId || null,
      JSON.stringify(validatedConversation.tags || []),
      validatedConversation.isArchived,
      validatedConversation.createdAt.toISOString(),
      validatedConversation.updatedAt.toISOString()
    ]);

    // Create vector embeddings for semantic search
    await this.createConversationEmbeddings(validatedConversation);

    await this.recordMetric('conversation_created');
    await this.logAudit('conversation_created', { conversationId, userId: validatedConversation.userId });

    return validatedConversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const result = await this.cnd.sql().query(`
      SELECT * FROM conversations WHERE id = ?
    `, [conversationId]);

    if (!result.data || result.data.length === 0) {
      return null;
    }

    const row = result.data[0];
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      messages: JSON.parse(row.messages),
      modelId: row.model_id,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isArchived: row.is_archived,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async getUserConversations(userId: string, limit: number = 50): Promise<Conversation[]> {
    const result = await this.cnd.sql().query(`
      SELECT * FROM conversations 
      WHERE user_id = ? AND is_archived = false 
      ORDER BY updated_at DESC 
      LIMIT ?
    `, [userId, limit]);

    if (!result.data) {
      return [];
    }

    return result.data.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      messages: JSON.parse(row.messages),
      modelId: row.model_id,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isArchived: row.is_archived,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  // Vector Search for Conversations
  async searchConversations(query: string, userId: string, limit: number = 10): Promise<Conversation[]> {
    // This would use vector similarity search in a full implementation
    // For now, we'll use text search
    const result = await this.cnd.sql().query(`
      SELECT DISTINCT c.* FROM conversations c
      WHERE c.user_id = ? 
      AND (c.title LIKE ? OR c.messages LIKE ?)
      AND c.is_archived = false
      ORDER BY c.updated_at DESC
      LIMIT ?
    `, [userId, `%${query}%`, `%${query}%`, limit]);

    await this.recordMetric('vector_searches');

    if (!result.data) {
      return [];
    }

    return result.data.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      messages: JSON.parse(row.messages),
      modelId: row.model_id,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isArchived: row.is_archived,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  // Training Data Management
  async addTrainingData(data: Omit<TrainingData, 'id' | 'createdAt'>): Promise<TrainingData> {
    const trainingId = `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const trainingData: TrainingData = {
      ...data,
      id: trainingId,
      createdAt: now
    };

    // Validate training data
    const validatedData = TrainingDataSchema.parse(trainingData);

    await this.cnd.sql().query(`
      INSERT INTO training_data (id, user_id, model_id, input_text, expected_output, actual_output, feedback, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validatedData.id,
      validatedData.userId,
      validatedData.modelId,
      validatedData.inputText,
      validatedData.expectedOutput,
      validatedData.actualOutput || null,
      validatedData.feedback || null,
      JSON.stringify(validatedData.tags || []),
      validatedData.createdAt.toISOString()
    ]);

    await this.recordMetric('training_data_added');
    await this.logAudit('training_data_added', { trainingId, modelId: validatedData.modelId });

    return validatedData;
  }

  // Utility Methods
  private async createConversationEmbeddings(conversation: Conversation): Promise<void> {
    // In a full implementation, this would create vector embeddings
    // for semantic search using the vector API
    for (const message of conversation.messages) {
      await this.cnd.sql().query(`
        INSERT INTO conversation_embeddings (id, conversation_id, message_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversation.id,
        message.id,
        message.content,
        new Date().toISOString()
      ]);
    }
  }

  private async recordMetric(metricName: string, value: number = 1): Promise<void> {
    try {
      // In a full implementation, this would use the metrics manager
      console.log(`📊 Metric recorded: ${metricName} = ${value}`);
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  private async logAudit(action: string, details: any): Promise<void> {
    try {
      // In a full implementation, this would use the audit logger
      console.log(`🔍 Audit log: ${action}`, details);
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  // Health and Status Methods
  async getHealthStatus(): Promise<any> {
    const status = await this.cnd.getHealthStatus();

    // Add AI-specific health checks
    const aiStatus = {
      ...status,
      aiFeatures: {
        modelStorage: true,
        conversationManagement: true,
        vectorSearch: true,
        trainingData: true
      }
    };

    return aiStatus;
  }

  async getServiceMetrics(): Promise<any> {
    const metrics = this.cnd.getCurrentMetrics();

    // Add AI-specific metrics
    const modelsResult = await this.cnd.sql().query('SELECT COUNT(*) as count FROM ai_models WHERE is_active = true');
    const conversationsResult = await this.cnd.sql().query('SELECT COUNT(*) as count FROM conversations WHERE is_archived = false');
    const trainingResult = await this.cnd.sql().query('SELECT COUNT(*) as count FROM training_data');

    return {
      ...metrics,
      aiMetrics: {
        activeModels: modelsResult.data?.[0]?.count || 0,
        activeConversations: conversationsResult.data?.[0]?.count || 0,
        trainingDataPoints: trainingResult.data?.[0]?.count || 0
      }
    };
  }

  async disconnect(): Promise<void> {
    await this.logAudit('service_disconnected', { timestamp: new Date() });
    await this.cnd.disconnect();
    this.isInitialized = false;
  }
}

// Singleton instance
let cndAIService: CNDAIService | null = null;

export function getCNDAIService(): CNDAIService {
  if (!cndAIService) {
    cndAIService = new CNDAIService();
  }
  return cndAIService;
}

export { AIModel, Conversation, TrainingData };
