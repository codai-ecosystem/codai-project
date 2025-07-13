import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import winston from 'winston';
import { RomaiCore, loadConfigFromEnv } from '@codai/romai-core';
import type {
  RomaiConfig,
  IntelligenceRequest,
  IntelligenceResponse,
  AIRequest,
  AIResponse,
} from '@codai/romai-types';

// API Request/Response schemas
const IntelligenceRequestSchema = z.object({
  query: z.string().min(1).max(10000),
  language: z.enum(['ro', 'en']).default('ro'),
  domain: z.string().optional(),
  context: z.string().optional(),
});

const AIRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

const AuthRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// API Error class
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RomaiApiServer {
  private app: FastifyInstance;
  private romaiCore: RomaiCore;
  private config: RomaiConfig;
  private logger: winston.Logger;

  constructor(config?: RomaiConfig) {
    this.config = config || loadConfigFromEnv();
    this.romaiCore = new RomaiCore(this.config);

    // Initialize logger
    this.logger = winston.createLogger({
      level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'romai-api' },
      transports: [
        new winston.transports.File({ filename: 'logs/api-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/api-combined.log' }),
      ],
    });

    if (process.env['NODE_ENV'] !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
      );
    }

    // Initialize Fastify
    this.app = Fastify({
      logger: {
        level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
      },
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private async setupMiddleware(): Promise<void> {
    // Security headers
    await this.app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    });

    // CORS
    await this.app.register(cors, {
      origin: this.config.api.cors.origin,
      credentials: this.config.api.cors.credentials,
    });

    // Rate limiting
    await this.app.register(rateLimit, {
      max: this.config.api.rateLimit.max,
      timeWindow: this.config.api.rateLimit.windowMs,
    });

    // JWT authentication
    await this.app.register(jwt, {
      secret: this.config.api.auth.jwtSecret,
    });

    // OpenAPI documentation
    await this.app.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'ROMAI API',
          description: 'Romanian AI Central Intelligence System REST API',
          version: '0.1.0',
          contact: {
            name: 'CodAI Team',
            email: 'team@codai.ro',
            url: 'https://codai.ro',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
        servers: [
          {
            url: `http://localhost:${this.config.api.port}`,
            description: 'Development server',
          },
        ],
        tags: [
          {
            name: 'Intelligence',
            description: 'AI intelligence and problem-solving endpoints',
          },
          {
            name: 'Chat',
            description: 'Direct AI chat endpoints',
          },
          {
            name: 'Health',
            description: 'Health check and system status endpoints',
          },
          {
            name: 'Auth',
            description: 'Authentication endpoints',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await this.app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header: string) => header,
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const health = await this.romaiCore.healthCheck();
        return reply.send(health);
      } catch (error) {
        this.logger.error('Health check failed', { error });
        return reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date(),
          error: 'Health check failed',
        });
      }
    });

    // Authentication endpoint
    this.app.post('/auth/login', {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate and get JWT token',
        body: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['username', 'password'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              expiresIn: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { username, password } = AuthRequestSchema.parse(request.body);

        // Simple authentication (replace with proper auth system)
        if (username === 'romai' && password === 'romai2025') {
          const token = this.app.jwt.sign(
            { username, role: 'user' },
            { expiresIn: this.config.api.auth.expiresIn }
          );

          return reply.send({
            token,
            expiresIn: this.config.api.auth.expiresIn,
          });
        } else {
          return reply.status(401).send({ error: 'Invalid credentials' });
        }
      } catch (error) {
        this.logger.error('Authentication failed', { error });
        return reply.status(400).send({ error: 'Invalid request' });
      }
    });

    // Intelligence endpoint
    this.app.post('/intelligence', {
      schema: {
        tags: ['Intelligence'],
        summary: 'Process intelligence request',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1, maxLength: 10000 },
            language: { type: 'string', enum: ['ro', 'en'], default: 'ro' },
            domain: { type: 'string' },
            context: { type: 'string' },
          },
          required: ['query'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              response: { type: 'string' },
              confidence: { type: 'number' },
              sources: { type: 'array', items: { type: 'string' } },
              relatedTopics: { type: 'array', items: { type: 'string' } },
              suggestions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.send(err);
        }
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parsedRequest = IntelligenceRequestSchema.parse(request.body);

        this.logger.info('Processing intelligence request', {
          query: parsedRequest.query.substring(0, 100),
          language: parsedRequest.language,
          domain: parsedRequest.domain,
        });

        const intelligenceRequest: IntelligenceRequest = {
          query: parsedRequest.query,
          language: parsedRequest.language,
          domain: parsedRequest.domain,
          context: parsedRequest.context,
        };

        const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

        this.logger.info('Intelligence request processed successfully', {
          confidence: response.confidence,
        });

        return reply.send(response);
      } catch (error) {
        this.logger.error('Intelligence request failed', { error });

        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request format',
            details: (error as z.ZodError).errors,
          });
        }

        return reply.status(500).send({
          error: 'Internal server error',
        });
      }
    });

    // Chat endpoint
    this.app.post('/chat', {
      schema: {
        tags: ['Chat'],
        summary: 'Direct chat with AI',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                  content: { type: 'string' },
                },
                required: ['role', 'content'],
              },
            },
            model: { type: 'string' },
            temperature: { type: 'number', minimum: 0, maximum: 2 },
            maxTokens: { type: 'number', minimum: 1, maximum: 4000 },
          },
          required: ['messages'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  role: { type: 'string' },
                  content: { type: 'string' },
                  timestamp: { type: 'string' },
                },
              },
              usage: {
                type: 'object',
                properties: {
                  promptTokens: { type: 'number' },
                  completionTokens: { type: 'number' },
                  totalTokens: { type: 'number' },
                },
              },
            },
          },
        },
      },
      preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.send(err);
        }
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const aiRequest = AIRequestSchema.parse(request.body);

        this.logger.info('Processing chat request', {
          messageCount: aiRequest.messages.length,
          model: aiRequest.model,
        });

        // Convert to AIRequest format
        const convertedRequest: AIRequest = {
          messages: aiRequest.messages.map((msg: any, index: number) => ({
            id: `msg-${index}`,
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(),
          })),
          model: aiRequest.model || undefined,
          temperature: aiRequest.temperature,
          maxTokens: aiRequest.maxTokens,
        };

        const response = await this.romaiCore.generateResponse(convertedRequest);

        this.logger.info('Chat request processed successfully', {
          responseLength: response.message.content.length,
        });

        return reply.send(response);
      } catch (error) {
        this.logger.error('Chat request failed', { error });

        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request format',
            details: (error as z.ZodError).errors,
          });
        }

        return reply.status(500).send({
          error: 'Internal server error',
        });
      }
    });

    // Romanian expert endpoint
    this.app.post('/romanian-expert', {
      schema: {
        tags: ['Intelligence'],
        summary: 'Get Romanian culture and context expertise',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1 },
            category: {
              type: 'string',
              enum: ['culture', 'business', 'language', 'history', 'travel', 'legal', 'education'],
              default: 'general',
            },
          },
          required: ['query'],
        },
      },
      preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.send(err);
        }
      },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { query, category = 'general' } = request.body as any;

        const expertPrompt = `Ca expert în cultura și contextul românesc, răspunde la următoarea întrebare în categoria "${category}": ${query}`;

        const intelligenceRequest: IntelligenceRequest = {
          query: expertPrompt,
          language: 'ro',
          domain: 'romanian_culture',
          context: `Romanian expertise - Category: ${category}`,
        };

        const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);
        return reply.send(response);
      } catch (error) {
        this.logger.error('Romanian expert request failed', { error });
        return reply.status(500).send({ error: 'Internal server error' });
      }
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.setErrorHandler((error, request, reply) => {
      this.logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
      });

      if (error instanceof APIError) {
        return reply.status(error.statusCode).send({
          error: error.message,
          code: error.code,
        });
      }

      // Default error response
      return reply.status(500).send({
        error: 'Internal Server Error',
      });
    });

    // 404 handler
    this.app.setNotFoundHandler((request, reply) => {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
      });
    });
  }

  async start(): Promise<void> {
    try {
      const address = await this.app.listen({
        port: this.config.api.port,
        host: '0.0.0.0',
      });

      this.logger.info(`🚀 ROMAI API Server started successfully`, {
        address,
        port: this.config.api.port,
        docs: `http://localhost:${this.config.api.port}/docs`,
      });

      console.log(`🚀 ROMAI API Server running on ${address}`);
      console.log(`📚 API Documentation: http://localhost:${this.config.api.port}/docs`);
    } catch (error) {
      this.logger.error('Failed to start API server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.app.close();
      this.logger.info('ROMAI API Server stopped');
    } catch (error) {
      this.logger.error('Error stopping API server', { error });
      throw error;
    }
  }

  getApp(): FastifyInstance {
    return this.app;
  }
}

export { RomaiApiServer as default };
export type { RomaiConfig, IntelligenceRequest, IntelligenceResponse, AIRequest, AIResponse };
