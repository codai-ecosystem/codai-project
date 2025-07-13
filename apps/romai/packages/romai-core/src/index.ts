import { OpenAI } from 'openai';
import { z } from 'zod';
import winston from 'winston';
import { randomUUID } from 'crypto';
import type {
  AIRequest,
  AIResponse,
  AIMessage,
  RomaiConfig,
  IntelligenceRequest,
  IntelligenceResponse,
} from '@codai/romai-types';

// Configuration validation schema
const configSchema = z.object({
  azure: z.object({
    apiKey: z.string().min(1),
    endpoint: z.string().url(),
    apiVersion: z.string().default('2024-12-01-preview'),
    deploymentName: z.string().default('gpt-4'),
  }),
  memory: z.object({
    provider: z.enum(['memorai', 'local', 'redis']).default('memorai'),
    config: z.record(z.unknown()).default({}),
  }),
  mcp: z.object({
    port: z.number().default(3001),
    name: z.string().default('romai-mcp'),
    version: z.string().default('0.1.0'),
    description: z.string().default('ROMAI MCP Server'),
  }),
  api: z.object({
    port: z.number().default(3000),
    cors: z
      .object({
        origin: z.union([z.string(), z.array(z.string())]).default('*'),
        credentials: z.boolean().default(true),
      })
      .default({}),
    rateLimit: z
      .object({
        windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
        max: z.number().default(100), // limit each IP to 100 requests per windowMs
      })
      .default({}),
    auth: z.object({
      jwtSecret: z.string().min(32),
      expiresIn: z.string().default('24h'),
    }),
  }),
});

// Logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'romai-core' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export class RomaiCore {
  private client: OpenAI;
  private config: RomaiConfig;
  private logger: winston.Logger;

  constructor(config: RomaiConfig) {
    this.logger = logger;
    this.config = this.validateConfig(config);

    this.client = new OpenAI({
      apiKey: this.config.azure.apiKey,
      baseURL: `${this.config.azure.endpoint}/openai/deployments/${this.config.azure.deploymentName}`,
      defaultQuery: { 'api-version': this.config.azure.apiVersion },
      defaultHeaders: {
        'api-key': this.config.azure.apiKey,
      },
    });

    this.logger.info('ROMAI Core initialized successfully', {
      endpoint: this.config.azure.endpoint,
      model: this.config.azure.deploymentName,
    });
  }

  private validateConfig(config: RomaiConfig): RomaiConfig {
    try {
      return configSchema.parse(config);
    } catch (error) {
      this.logger.error('Invalid configuration', { error });
      throw new Error(`Configuration validation failed: ${error}`);
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      this.logger.debug('Generating AI response', {
        messageCount: request.messages.length,
        model: request.model || this.config.azure.deploymentName,
      });

      const response = await this.client.chat.completions.create({
        model: request.model || this.config.azure.deploymentName || 'gpt-4',
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No response content generated');
      }

      const aiResponse: AIResponse = {
        message: {
          id: randomUUID(),
          role: 'assistant',
          content: choice.message.content,
          timestamp: new Date(),
          metadata: {
            model: request.model || this.config.azure.deploymentName,
            finishReason: choice.finish_reason,
          },
        },
        usage: response.usage
          ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
          : undefined,
        model: request.model || this.config.azure.deploymentName,
        finishReason: choice.finish_reason || undefined,
      };

      this.logger.info('AI response generated successfully', {
        responseLength: choice.message.content.length,
        tokensUsed: response.usage?.total_tokens || 0,
      });

      return aiResponse;
    } catch (error) {
      this.logger.error('Failed to generate AI response', { error });
      throw error;
    }
  }

  async processIntelligenceRequest(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    try {
      this.logger.debug('Processing intelligence request', {
        language: request.language,
        domain: request.domain,
        queryLength: request.query.length,
      });

      // Build context-aware prompt for Romanian AI
      const systemPrompt = this.buildSystemPrompt(request);
      const messages: AIMessage[] = [
        {
          id: randomUUID(),
          role: 'system',
          content: systemPrompt,
          timestamp: new Date(),
        },
        {
          id: randomUUID(),
          role: 'user',
          content: request.query,
          timestamp: new Date(),
        },
      ];

      // Add context if provided
      if (request.context) {
        messages.splice(1, 0, {
          id: randomUUID(),
          role: 'system',
          content: `Context: ${request.context}`,
          timestamp: new Date(),
        });
      }

      const aiResponse = await this.generateResponse({
        messages,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse the response to extract structured information
      const intelligenceResponse: IntelligenceResponse = {
        response: aiResponse.message.content,
        confidence: this.calculateConfidence(aiResponse),
        sources: [], // TODO: Implement source extraction
        relatedTopics: [], // TODO: Implement topic extraction
        suggestions: [], // TODO: Implement suggestion generation
      };

      this.logger.info('Intelligence request processed successfully', {
        confidence: intelligenceResponse.confidence,
        responseLength: intelligenceResponse.response.length,
      });

      return intelligenceResponse;
    } catch (error) {
      this.logger.error('Failed to process intelligence request', { error });
      throw error;
    }
  }

  private buildSystemPrompt(request: IntelligenceRequest): string {
    const language = request.language || 'ro';
    const domain = request.domain || 'general';

    let prompt = '';

    if (language === 'ro') {
      prompt = `Ești ROMAI, sistemul de inteligență artificială românesc central al ecosistemului CodAI. 
      Ești un expert în toate domeniile și poți rezolva orice problemă cu precizie și creativitate.
      
      Caracteristici importante:
      - Răspunzi întotdeauna în română, cu un stil natural și conversațional
      - Ești extrem de precis și detaliat în explicații
      - Oferi soluții practice și implementabile
      - Ai o cunoaștere profundă a culturii și contextului românesc
      - Ești capabil să lucrezi în orice domeniu: tehnologie, business, educație, știință, artă
      
      Domeniul curent: ${domain}
      
      Instrucțiuni:
      1. Analizează cererea cu atenție
      2. Oferă un răspuns complet și structurat
      3. Include exemple concrete când este relevant
      4. Sugerează pași următori dacă este cazul
      5. Menține un ton profesional dar prietenos`;
    } else {
      prompt = `You are ROMAI, the central Romanian AI intelligence system of the CodAI ecosystem.
      You are an expert in all domains and can solve any problem with precision and creativity.
      
      Important characteristics:
      - You provide accurate and detailed explanations
      - You offer practical and implementable solutions
      - You have deep knowledge across all domains
      - You can work in any field: technology, business, education, science, arts
      
      Current domain: ${domain}
      
      Instructions:
      1. Analyze the request carefully
      2. Provide a complete and structured response
      3. Include concrete examples when relevant
      4. Suggest next steps if applicable
      5. Maintain a professional but friendly tone`;
    }

    return prompt;
  }

  private calculateConfidence(response: AIResponse): number {
    // Simple confidence calculation based on response characteristics
    // TODO: Implement more sophisticated confidence scoring
    let confidence = 0.8; // Base confidence

    // Adjust based on response length (longer responses might be more confident)
    const responseLength = response.message.content.length;
    if (responseLength > 500) confidence += 0.1;
    if (responseLength < 100) confidence -= 0.2;

    // Adjust based on finish reason
    if (response.finishReason === 'stop') confidence += 0.1;
    if (response.finishReason === 'length') confidence -= 0.1;

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    details: Record<string, unknown>;
  }> {
    try {
      // Test Azure OpenAI connectivity
      await this.client.chat.completions.create({
        model: this.config.azure.deploymentName || 'gpt-4',
        messages: [{ role: 'user', content: 'Test connectivity' }],
        max_tokens: 10,
      });

      return {
        status: 'healthy',
        timestamp: new Date(),
        details: {
          azure: 'connected',
          model: this.config.azure.deploymentName,
          endpoint: this.config.azure.endpoint,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        details: {
          azure: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  getConfig(): RomaiConfig {
    return { ...this.config };
  }

  getLogger(): winston.Logger {
    return this.logger;
  }
}

// Utility functions
export function createRomaiCore(config: RomaiConfig): RomaiCore {
  return new RomaiCore(config);
}

export function loadConfigFromEnv(): RomaiConfig {
  const config: RomaiConfig = {
    azure: {
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
    },
    memory: {
      provider: (process.env.ROMAI_MEMORY_PROVIDER as 'memorai' | 'local' | 'redis') || 'memorai',
      config: {},
    },
    mcp: {
      port: parseInt(process.env.ROMAI_MCP_PORT || '3001'),
      name: process.env.ROMAI_MCP_NAME || 'romai-mcp',
      version: process.env.ROMAI_MCP_VERSION || '0.1.0',
      description: process.env.ROMAI_MCP_DESCRIPTION || 'ROMAI MCP Server',
    },
    api: {
      port: parseInt(process.env.ROMAI_API_PORT || '3000'),
      cors: {
        origin: process.env.ROMAI_CORS_ORIGIN || '*',
        credentials: process.env.ROMAI_CORS_CREDENTIALS === 'true',
      },
      rateLimit: {
        windowMs: parseInt(process.env.ROMAI_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        max: parseInt(process.env.ROMAI_RATE_LIMIT_MAX || '100'),
      },
      auth: {
        jwtSecret: process.env.ROMAI_JWT_SECRET || 'romai-secret-key-change-in-production',
        expiresIn: process.env.ROMAI_JWT_EXPIRES_IN || '24h',
      },
    },
  };

  return config;
}

// Export types and utilities
export type {
  RomaiConfig,
  AIRequest,
  AIResponse,
  IntelligenceRequest,
  IntelligenceResponse,
} from '@codai/romai-types';
