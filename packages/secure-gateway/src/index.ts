import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import winston from 'winston';
import { body, validationResult } from 'express-validator';
import fetch from 'node-fetch';
import Redis from 'redis';

// Types
interface ApiKeyConfig {
  key: string;
  projectId: string;
  permissions: string[];
  rateLimit: { requests: number; window: string };
  createdAt: Date;
  status: 'active' | 'suspended' | 'expired';
  hashedKey?: string;
}

interface ProjectConfig {
  id: string;
  name: string;
  type: 'administrative' | 'user';
  permissions: string[];
  createdAt: Date;
  owner: string;
  status: 'active' | 'suspended';
  metadata?: Record<string, any>;
}

interface ServiceToken {
  token: string;
  service: string;
  permissions: string[];
  createdAt: Date;
}

class SecureAPIGateway {
  private app: express.Application;
  private apiKeys: Map<string, ApiKeyConfig>;
  private projects: Map<string, ProjectConfig>;
  private serviceTokens: Map<string, ServiceToken>;
  private logger!: winston.Logger;
  private redis: any;
  private masterApiKey: string;

  constructor() {
    this.app = express();
    this.apiKeys = new Map();
    this.projects = new Map();
    this.serviceTokens = new Map();
    this.masterApiKey = '';
    this.setupLogger();
    this.setupRedis();
    this.setupMiddleware();
    this.setupRoutes();
    this.createMasterAdminProject();
    this.generateServiceTokens();
  }

  private setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: '/var/log/gateway-error.log', level: 'error' }),
        new winston.transports.File({ filename: '/var/log/gateway-combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  private async setupRedis() {
    try {
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redis.connect();
      this.logger.info('Redis connected successfully');
    } catch (error) {
      this.logger.error('Redis connection failed:', error);
      // Continue without Redis for now
    }
  }

  private setupMiddleware() {
    // Security headers
    this.app.use(helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'same-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }));

    // Compression
    this.app.use(compression());

    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
          'https://codai.ro',
          'https://api.codai.ro',
          'https://admin.codai.ro',
          'https://apps.codai.ro',
          'https://docs.codai.ro'
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'X-API-Key',
        'X-Project-ID',
        'X-Request-ID',
        'Accept',
        'Origin'
      ]
    }));

    // Rate limiting with Redis support
    const rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: async (req) => {
        const apiKey = req.headers['x-api-key'] as string;
        if (apiKey && this.apiKeys.has(apiKey)) {
          const config = this.apiKeys.get(apiKey)!;
          return config.rateLimit.requests;
        }
        return 100; // Default limit for non-authenticated requests
      },
      message: {
        error: 'Too many requests from this IP or API key',
        retryAfter: 15 * 60 // 15 minutes in seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new (require('rate-limit-redis'))({
        sendCommand: (...args: any[]) => this.redis.sendCommand(args),
      }) : undefined
    });
    this.app.use(rateLimiter);

    // Body parsing with size limits
    this.app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        (req as any).rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const requestId = uuidv4();
      req.headers['x-request-id'] = requestId;

      this.logger.info('Request received', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        apiKey: req.headers['x-api-key'] ? 'present' : 'missing'
      });

      next();
    });
  }

  private async createMasterAdminProject() {
    const masterProjectId = 'codai-master-admin';
    this.masterApiKey = this.generateSecureApiKey();

    // Create master admin project
    const masterProject: ProjectConfig = {
      id: masterProjectId,
      name: 'CODAI Master Administration',
      type: 'administrative',
      permissions: ['*'], // Full permissions
      createdAt: new Date(),
      owner: 'system',
      status: 'active',
      metadata: {
        description: 'Master administrative project with full system access',
        systemGenerated: true
      }
    };

    // Create master admin API key with hashed storage
    const hashedKey = await bcrypt.hash(this.masterApiKey, 12);
    const masterKeyConfig: ApiKeyConfig = {
      key: this.masterApiKey.substring(0, 8) + '...', // Store truncated version
      hashedKey,
      projectId: masterProjectId,
      permissions: ['admin:*', 'project:*', 'service:*', 'system:*'],
      rateLimit: { requests: 10000, window: '1h' },
      createdAt: new Date(),
      status: 'active'
    };

    this.projects.set(masterProjectId, masterProject);
    this.apiKeys.set(this.masterApiKey, masterKeyConfig);

    this.logger.info('Master admin project created', {
      projectId: masterProjectId,
      apiKeyPrefix: this.masterApiKey.substring(0, 8)
    });

    // Store in Redis if available
    if (this.redis) {
      await this.redis.hSet('projects', masterProjectId, JSON.stringify(masterProject));
      await this.redis.hSet('api_keys', this.masterApiKey, JSON.stringify(masterKeyConfig));
    }

    console.log(`🔑 Master Admin API Key: ${this.masterApiKey}`);
    console.log(`📋 Master Project ID: ${masterProjectId}`);
  }

  private generateSecureApiKey(): string {
    const prefix = 'codai';
    const timestamp = Date.now().toString(36);
    const random = uuidv4().replace(/-/g, '');
    return `${prefix}_${timestamp}_${random}`;
  }

  private generateServiceTokens() {
    const services = ['gateway', 'memorai-mcp', 'cbd-database', 'websocket-service', 'ssl-proxy'];

    services.forEach(service => {
      const token = jwt.sign(
        {
          service,
          permissions: this.getServicePermissions(service),
          type: 'service',
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'default-secret-change-in-production',
        { expiresIn: '30d' }
      );

      this.serviceTokens.set(service, {
        token,
        service,
        permissions: this.getServicePermissions(service),
        createdAt: new Date()
      });

      this.logger.info(`Service token generated for ${service}`);
      console.log(`🔑 Service Token for ${service}: ${token}`);
    });
  }

  private getServicePermissions(service: string): string[] {
    const permissionMap: Record<string, string[]> = {
      'gateway': ['service:*', 'route:*', 'proxy:*'],
      'memorai-mcp': ['memory:*', 'context:*', 'mcp:*'],
      'cbd-database': ['database:*', 'storage:*', 'data:*'],
      'websocket-service': ['websocket:*', 'realtime:*', 'events:*'],
      'ssl-proxy': ['proxy:*', 'ssl:*', 'security:*']
    };

    return permissionMap[service] || ['service:basic'];
  }

  // API Key authentication middleware
  private authenticateApiKey = async (req: any, res: any, next: any) => {
    try {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          code: 'MISSING_API_KEY'
        });
      }

      const keyConfig = this.apiKeys.get(apiKey);
      if (!keyConfig || keyConfig.status !== 'active') {
        // Try to verify against hashed keys
        let foundKey = false;
        for (const [key, config] of this.apiKeys.entries()) {
          if (config.hashedKey && await bcrypt.compare(apiKey, config.hashedKey)) {
            req.apiKey = config;
            req.project = this.projects.get(config.projectId);
            foundKey = true;
            break;
          }
        }

        if (!foundKey) {
          return res.status(401).json({
            error: 'Invalid API key',
            code: 'INVALID_API_KEY'
          });
        }
      } else {
        req.apiKey = keyConfig;
        req.project = this.projects.get(keyConfig.projectId);
      }

      // Log API key usage
      this.logger.info('API key authenticated', {
        projectId: req.project?.id,
        keyPrefix: apiKey.substring(0, 8),
        requestId: req.headers['x-request-id']
      });

      next();
    } catch (error) {
      this.logger.error('API key authentication error:', error);
      res.status(500).json({
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
  };

  // Permission check middleware
  private checkPermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      const userPermissions = req.apiKey?.permissions || [];

      if (userPermissions.includes('*') ||
        userPermissions.includes(permission) ||
        userPermissions.some((p: string) => p.endsWith('*') && permission.startsWith(p.slice(0, -1)))) {
        next();
      } else {
        this.logger.warn('Permission denied', {
          permission,
          userPermissions,
          projectId: req.project?.id,
          requestId: req.headers['x-request-id']
        });

        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission
        });
      }
    };
  };

  private setupRoutes() {
    // Health check (public)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          redis: this.redis ? 'connected' : 'disconnected',
          gateway: 'operational'
        }
      });
    });

    // API documentation endpoint
    this.app.get('/api/docs', (req, res) => {
      res.json({
        name: 'CODAI Secure API Gateway',
        version: '1.0.0',
        endpoints: {
          authentication: '/api/auth',
          admin: '/admin/*',
          services: '/api/*'
        },
        documentation: 'https://docs.codai.ro'
      });
    });

    // Admin routes (master admin only)
    this.app.post('/admin/projects',
      [
        body('name').isLength({ min: 1, max: 100 }).trim(),
        body('type').isIn(['administrative', 'user']),
        body('permissions').isArray().optional()
      ],
      this.authenticateApiKey,
      this.checkPermission('admin:projects:create'),
      this.createProject.bind(this)
    );

    this.app.get('/admin/projects',
      this.authenticateApiKey,
      this.checkPermission('admin:projects:read'),
      this.listProjects.bind(this)
    );

    this.app.post('/admin/api-keys',
      [
        body('projectId').isLength({ min: 1 }),
        body('permissions').isArray(),
        body('rateLimit.requests').isInt({ min: 1 }).optional(),
        body('rateLimit.window').isLength({ min: 1 }).optional()
      ],
      this.authenticateApiKey,
      this.checkPermission('admin:keys:create'),
      this.createApiKey.bind(this)
    );

    this.app.get('/admin/api-keys',
      this.authenticateApiKey,
      this.checkPermission('admin:keys:read'),
      this.listApiKeys.bind(this)
    );

    // Service routes (authenticated)
    this.app.use('/api/gateway',
      this.authenticateApiKey,
      this.checkPermission('service:gateway'),
      this.proxyToService('gateway')
    );

    this.app.use('/api/memorai',
      this.authenticateApiKey,
      this.checkPermission('service:memorai'),
      this.proxyToService('memorai-mcp')
    );

    this.app.use('/api/cbd',
      this.authenticateApiKey,
      this.checkPermission('service:cbd'),
      this.proxyToService('cbd-database')
    );

    this.app.use('/api/websocket',
      this.authenticateApiKey,
      this.checkPermission('service:websocket'),
      this.proxyToService('websocket-service')
    );

    this.app.use('/api/ssl',
      this.authenticateApiKey,
      this.checkPermission('service:ssl'),
      this.proxyToService('ssl-proxy')
    );

    // Error handling middleware
    this.app.use((error: any, req: any, res: any, next: any) => {
      this.logger.error('Application error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        requestId: req.headers['x-request-id']
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.originalUrl
      });
    });
  }

  private async createProject(req: any, res: any) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, type = 'user', permissions = [] } = req.body;
      const projectId = `project_${uuidv4()}`;

      const project: ProjectConfig = {
        id: projectId,
        name,
        type,
        permissions,
        createdAt: new Date(),
        owner: req.apiKey.projectId,
        status: 'active',
        metadata: {
          createdBy: req.project?.name || 'Unknown'
        }
      };

      this.projects.set(projectId, project);

      // Store in Redis if available
      if (this.redis) {
        await this.redis.hSet('projects', projectId, JSON.stringify(project));
      }

      this.logger.info('Project created', {
        projectId,
        name,
        type,
        createdBy: req.project?.id
      });

      res.status(201).json({
        success: true,
        project: {
          id: projectId,
          name: project.name,
          type: project.type,
          createdAt: project.createdAt,
          status: project.status
        }
      });
    } catch (error) {
      this.logger.error('Create project error:', error);
      res.status(500).json({
        error: 'Failed to create project',
        code: 'CREATE_PROJECT_ERROR'
      });
    }
  }

  private async listProjects(req: any, res: any) {
    try {
      const projects = Array.from(this.projects.values()).map(project => ({
        id: project.id,
        name: project.name,
        type: project.type,
        status: project.status,
        createdAt: project.createdAt,
        owner: project.owner
      }));

      res.json({
        success: true,
        projects,
        total: projects.length
      });
    } catch (error) {
      this.logger.error('List projects error:', error);
      res.status(500).json({
        error: 'Failed to list projects',
        code: 'LIST_PROJECTS_ERROR'
      });
    }
  }

  private async createApiKey(req: any, res: any) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { projectId, permissions = [], rateLimit } = req.body;

      if (!this.projects.has(projectId)) {
        return res.status(404).json({
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      const apiKey = this.generateSecureApiKey();
      const hashedKey = await bcrypt.hash(apiKey, 12);

      const keyConfig: ApiKeyConfig = {
        key: apiKey.substring(0, 8) + '...', // Store truncated version
        hashedKey,
        projectId,
        permissions,
        rateLimit: rateLimit || { requests: 1000, window: '1h' },
        createdAt: new Date(),
        status: 'active'
      };

      this.apiKeys.set(apiKey, keyConfig);

      // Store in Redis if available
      if (this.redis) {
        await this.redis.hSet('api_keys', apiKey, JSON.stringify(keyConfig));
      }

      this.logger.info('API key created', {
        projectId,
        keyPrefix: apiKey.substring(0, 8),
        permissions
      });

      res.status(201).json({
        success: true,
        apiKey,
        projectId,
        permissions,
        rateLimit: keyConfig.rateLimit,
        createdAt: keyConfig.createdAt
      });
    } catch (error) {
      this.logger.error('Create API key error:', error);
      res.status(500).json({
        error: 'Failed to create API key',
        code: 'CREATE_API_KEY_ERROR'
      });
    }
  }

  private async listApiKeys(req: any, res: any) {
    try {
      const keys = Array.from(this.apiKeys.values()).map(key => ({
        keyPrefix: key.key,
        projectId: key.projectId,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        status: key.status,
        createdAt: key.createdAt
      }));

      res.json({
        success: true,
        apiKeys: keys,
        total: keys.length
      });
    } catch (error) {
      this.logger.error('List API keys error:', error);
      res.status(500).json({
        error: 'Failed to list API keys',
        code: 'LIST_API_KEYS_ERROR'
      });
    }
  }

  private proxyToService(serviceName: string) {
    return async (req: any, res: any) => {
      try {
        // Get service endpoint from ECS service discovery
        const serviceUrl = await this.getServiceEndpoint(serviceName);
        const targetUrl = `${serviceUrl}${req.path}`;

        // Prepare headers for service call
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Project-ID': req.project.id,
          'X-API-Key-ID': req.apiKey.key.substring(0, 8),
          'X-Request-ID': req.headers['x-request-id'],
          'X-User-Agent': req.headers['user-agent'] || 'CODAI-Gateway/1.0'
        };

        // Add service token for authentication
        const serviceToken = this.serviceTokens.get(serviceName);
        if (serviceToken) {
          headers['Authorization'] = `Bearer ${serviceToken.token}`;
        }

        // Make request to service
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const contentType = response.headers.get('content-type');
          let data;

          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          // Log service call
          this.logger.info('Service proxy call', {
            service: serviceName,
            method: req.method,
            path: req.path,
            status: response.status,
            projectId: req.project.id,
            requestId: req.headers['x-request-id']
          });

          res.status(response.status);

          // Forward relevant headers
          const headersToForward = ['content-type', 'cache-control', 'etag'];
          headersToForward.forEach(header => {
            const value = response.headers.get(header);
            if (value) {
              res.set(header, value);
            }
          });

          res.json(data);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        this.logger.error('Service proxy error:', {
          service: serviceName,
          error: error instanceof Error ? error.message : String(error),
          requestId: req.headers['x-request-id']
        });

        res.status(502).json({
          error: 'Service unavailable',
          code: 'SERVICE_UNAVAILABLE',
          service: serviceName
        });
      }
    };
  }

  private async getServiceEndpoint(serviceName: string): Promise<string> {
    // ECS service discovery - using internal load balancer
    const serviceMap: Record<string, string> = {
      'gateway': 'http://codai-gateway-prod.codai-cluster-prod.local:3000',
      'memorai-mcp': 'http://codai-memorai-mcp-prod.codai-cluster-prod.local:4950',
      'cbd-database': 'http://codai-cbd-database-prod.codai-cluster-prod.local:5000',
      'websocket-service': 'http://codai-websocket-service-prod.codai-cluster-prod.local:3001',
      'ssl-proxy': 'http://codai-ssl-proxy-prod.codai-cluster-prod.local:8080'
    };

    return serviceMap[serviceName] || `http://codai-${serviceName}-prod.codai-cluster-prod.local:3000`;
  }

  public async start(port: number = 3000) {
    try {
      this.app.listen(port, '0.0.0.0', () => {
        this.logger.info(`Secure API Gateway started on port ${port}`);
        console.log(`🚀 Secure API Gateway running on port ${port}`);
        console.log(`🔑 Master Admin API Key: ${this.masterApiKey}`);
        console.log(`📋 Health check: http://localhost:${port}/health`);
      });
    } catch (error) {
      this.logger.error('Failed to start gateway:', error);
      process.exit(1);
    }
  }

  public getMasterApiKey(): string {
    return this.masterApiKey;
  }
}

// Start the gateway
const gateway = new SecureAPIGateway();
const port = parseInt(process.env.PORT || '3000');
gateway.start(port);

export default SecureAPIGateway;
