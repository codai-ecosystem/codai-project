import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { createClient } from 'redis';
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';
import validator from 'validator';
import { SecurityConfig, SecurityEvent, SecurityEventType, SecuritySeverity, ThreatPattern } from './types';
import { SecurityLogger } from './logger';
import { ThreatDetector } from './threat-detector';

export class SecurityMiddleware {
  private config: SecurityConfig;
  private logger: SecurityLogger;
  private threatDetector: ThreatDetector;
  private redisClient?: any;
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, number> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.logger = new SecurityLogger(config.monitoring.logging);
    this.threatDetector = new ThreatDetector(config.monitoring.threatDetection);

    // Initialize Redis for rate limiting if enabled
    if (config.rateLimit.redis?.enabled) {
      this.initializeRedis();
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisConfig = this.config.rateLimit.redis!;
      this.redisClient = createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port
        },
        password: redisConfig.password
      });

      await this.redisClient.connect();
      this.logger.info('Redis client connected for rate limiting');
    } catch (error) {
      this.logger.error('Failed to connect to Redis for rate limiting:', error);
    }
  }

  // Rate Limiting Middleware
  async registerRateLimiting(fastify: FastifyInstance): Promise<void> {
    if (!this.config.rateLimit.enabled) {
      return;
    }

    const rateLimitOptions: any = {
      max: this.config.rateLimit.maxRequests,
      timeWindow: this.config.rateLimit.windowMs,
      skipSuccessfulRequests: this.config.rateLimit.skipSuccessfulRequests,
      skipFailedRequests: this.config.rateLimit.skipFailedRequests,
      enableDraftSpec: this.config.rateLimit.standardHeaders,
      addHeadersOnExceeding: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true
      },
      errorResponseBuilder: (request: FastifyRequest, context: any) => {
        this.logSecurityEvent({
          type: SecurityEventType.RATE_LIMIT_EXCEEDED,
          severity: SecuritySeverity.MEDIUM,
          source: this.getClientIP(request),
          description: `Rate limit exceeded for ${request.url}`,
          metadata: {
            url: request.url,
            method: request.method,
            userAgent: request.headers['user-agent'],
            limit: context.max,
            remaining: context.remaining,
            resetTime: context.resetTime
          }
        });

        return {
          error: 'Too Many Requests',
          message: this.config.rateLimit.message,
          statusCode: this.config.rateLimit.statusCode,
          date: Date.now(),
          expiresIn: Math.round(context.resetTime - Date.now())
        };
      }
    };

    // Add Redis store if configured
    if (this.redisClient) {
      rateLimitOptions.redis = this.redisClient;
      rateLimitOptions.nameSpace = this.config.rateLimit.redis!.keyPrefix;
    }

    await fastify.register(rateLimit, rateLimitOptions);

    // Register custom rate limits for specific endpoints
    for (const [limitName, limitConfig] of Object.entries(this.config.rateLimit.customLimits)) {
      for (const endpoint of limitConfig.endpoints) {
        const customOptions = {
          ...rateLimitOptions,
          max: limitConfig.maxRequests,
          timeWindow: limitConfig.windowMs
        };

        if (limitConfig.methods) {
          for (const method of limitConfig.methods) {
            fastify.register(async (fastifyInstance) => {
              await fastifyInstance.register(rateLimit, customOptions);
              fastifyInstance.route({
                method: method as any,
                url: endpoint,
                preHandler: fastifyInstance.rateLimit(),
                handler: async (request, reply) => {
                  // This is handled by the actual route handler
                  reply.callNotFound();
                }
              });
            });
          }
        }
      }
    }

    this.logger.info('Rate limiting middleware registered');
  }

  // CORS Middleware
  async registerCORS(fastify: FastifyInstance): Promise<void> {
    if (!this.config.cors.enabled) {
      return;
    }

    await fastify.register(cors, {
      origin: this.config.cors.origin,
      credentials: this.config.cors.credentials,
      methods: this.config.cors.methods,
      allowedHeaders: this.config.cors.allowedHeaders,
      exposedHeaders: this.config.cors.exposedHeaders,
      maxAge: this.config.cors.maxAge,
      preflightContinue: this.config.cors.preflightContinue,
      optionsSuccessStatus: this.config.cors.optionsSuccessStatus
    });

    this.logger.info('CORS middleware registered');
  }

  // Security Headers Middleware
  async registerSecurityHeaders(fastify: FastifyInstance): Promise<void> {
    if (!this.config.headers.enabled) {
      return;
    }

    const helmetOptions: any = {
      contentSecurityPolicy: this.config.headers.contentSecurityPolicy.enabled ? {
        directives: this.config.headers.contentSecurityPolicy.directives,
        reportOnly: this.config.headers.contentSecurityPolicy.reportOnly
      } : false,
      hsts: this.config.headers.hsts.enabled ? {
        maxAge: this.config.headers.hsts.maxAge,
        includeSubDomains: this.config.headers.hsts.includeSubDomains,
        preload: this.config.headers.hsts.preload
      } : false,
      noSniff: this.config.headers.noSniff,
      frameguard: this.config.headers.frameOptions === 'DENY' ? { action: 'deny' } :
        this.config.headers.frameOptions === 'SAMEORIGIN' ? { action: 'sameorigin' } : false,
      referrerPolicy: { policy: this.config.headers.referrerPolicy as any },
      permissionsPolicy: this.parsePermissionsPolicy(this.config.headers.permissionsPolicy),
      crossOriginEmbedderPolicy: this.config.headers.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: this.config.headers.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: this.config.headers.crossOriginResourcePolicy ? { policy: 'cross-origin' } : false
    };

    await fastify.register(helmet, helmetOptions);

    // Add custom XSS Protection header
    if (this.config.headers.xssProtection) {
      fastify.addHook('onSend', async (request, reply) => {
        reply.header('X-XSS-Protection', '1; mode=block');
      });
    }

    this.logger.info('Security headers middleware registered');
  }

  // Input Validation and Sanitization Middleware
  registerInputSanitization(fastify: FastifyInstance): void {
    if (!this.config.validation.enabled) {
      return;
    }

    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const clientIP = this.getClientIP(request);

      // Check if IP is blocked
      if (this.blockedIPs.has(clientIP)) {
        this.logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: SecuritySeverity.HIGH,
          source: clientIP,
          description: 'Request from blocked IP address',
          metadata: {
            url: request.url,
            method: request.method,
            userAgent: request.headers['user-agent']
          }
        });

        reply.code(403).send({
          error: 'Forbidden',
          message: 'Access denied',
          statusCode: 403
        });
        return;
      }

      // Sanitize request body
      if (request.body && this.config.validation.sanitization.enabled) {
        request.body = this.sanitizeInput(request.body);
      }

      // Sanitize query parameters
      if (request.query && this.config.validation.sanitization.enabled) {
        request.query = this.sanitizeInput(request.query);
      }

      // Detect threats in request
      const threats = await this.threatDetector.analyzeRequest(request);
      if (threats.length > 0) {
        for (const threat of threats) {
          this.logSecurityEvent({
            type: threat.type,
            severity: threat.severity,
            source: clientIP,
            description: threat.description,
            metadata: {
              url: request.url,
              method: request.method,
              pattern: threat.pattern,
              userAgent: request.headers['user-agent']
            }
          });

          if (threat.action === 'block') {
            reply.code(400).send({
              error: 'Bad Request',
              message: 'Request contains malicious content',
              statusCode: 400
            });
            return;
          }
        }

        // Increase suspicion level for this IP
        this.suspiciousIPs.set(clientIP, (this.suspiciousIPs.get(clientIP) || 0) + threats.length);

        // Block IP if too many threats
        if ((this.suspiciousIPs.get(clientIP) || 0) > 5) {
          this.blockedIPs.add(clientIP);
          setTimeout(() => {
            this.blockedIPs.delete(clientIP);
            this.suspiciousIPs.delete(clientIP);
          }, 3600000); // Unblock after 1 hour
        }
      }
    });

    this.logger.info('Input sanitization middleware registered');
  }

  // Output Sanitization Middleware
  registerOutputSanitization(fastify: FastifyInstance): void {
    if (!this.config.validation.outputSanitization.enabled) {
      return;
    }

    fastify.addHook('onSend', async (request, reply, payload) => {
      if (typeof payload === 'string') {
        try {
          const parsedPayload = JSON.parse(payload);
          const sanitizedPayload = this.sanitizeOutput(parsedPayload);
          return JSON.stringify(sanitizedPayload);
        } catch {
          // Not JSON, sanitize as string
          return this.sanitizeString(payload);
        }
      }

      if (typeof payload === 'object') {
        return JSON.stringify(this.sanitizeOutput(payload));
      }

      return payload;
    });

    this.logger.info('Output sanitization middleware registered');
  }

  // Brute Force Protection Middleware
  registerBruteForceProtection(fastify: FastifyInstance): void {
    const bruteForceConfig = this.config.monitoring.threatDetection.bruteForceDetection;
    if (!bruteForceConfig.enabled) {
      return;
    }

    const attemptTracker = new Map<string, { attempts: number; lastAttempt: number; blocked: boolean }>();

    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const clientIP = this.getClientIP(request);
      const isTargetEndpoint = bruteForceConfig.endpoints.some(endpoint =>
        request.url?.startsWith(endpoint)
      );

      if (!isTargetEndpoint) {
        return;
      }

      const now = Date.now();
      const tracker = attemptTracker.get(clientIP);

      if (tracker) {
        if (tracker.blocked && (now - tracker.lastAttempt) < bruteForceConfig.blockDurationMs) {
          this.logSecurityEvent({
            type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
            severity: SecuritySeverity.HIGH,
            source: clientIP,
            description: 'Brute force attempt from blocked IP',
            metadata: {
              url: request.url,
              method: request.method,
              attempts: tracker.attempts,
              blockedAt: tracker.lastAttempt
            }
          });

          reply.code(429).send({
            error: 'Too Many Requests',
            message: 'Account temporarily locked due to too many failed attempts',
            statusCode: 429,
            retryAfter: Math.ceil((bruteForceConfig.blockDurationMs - (now - tracker.lastAttempt)) / 1000)
          });
          return;
        }

        if ((now - tracker.lastAttempt) > bruteForceConfig.windowMs) {
          // Reset attempts after window expires
          tracker.attempts = 0;
          tracker.blocked = false;
        }
      }
    });

    // Track failed authentication attempts
    fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      const clientIP = this.getClientIP(request);
      const isTargetEndpoint = bruteForceConfig.endpoints.some(endpoint =>
        request.url?.startsWith(endpoint)
      );

      if (!isTargetEndpoint) {
        return;
      }

      const now = Date.now();
      const isFailedAuth = reply.statusCode === 401 || reply.statusCode === 403;

      if (isFailedAuth) {
        const tracker = attemptTracker.get(clientIP) || { attempts: 0, lastAttempt: 0, blocked: false };
        tracker.attempts++;
        tracker.lastAttempt = now;

        if (tracker.attempts >= bruteForceConfig.maxAttempts) {
          tracker.blocked = true;

          this.logSecurityEvent({
            type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
            severity: SecuritySeverity.CRITICAL,
            source: clientIP,
            description: `Brute force attack detected - IP blocked after ${tracker.attempts} attempts`,
            metadata: {
              url: request.url,
              method: request.method,
              attempts: tracker.attempts,
              windowMs: bruteForceConfig.windowMs,
              blockDurationMs: bruteForceConfig.blockDurationMs
            }
          });
        }

        attemptTracker.set(clientIP, tracker);
      } else if (reply.statusCode === 200) {
        // Successful authentication, reset attempts
        attemptTracker.delete(clientIP);
      }
    });

    this.logger.info('Brute force protection middleware registered');
  }

  // Register all security middleware
  async registerAll(fastify: FastifyInstance): Promise<void> {
    await this.registerRateLimiting(fastify);
    await this.registerCORS(fastify);
    await this.registerSecurityHeaders(fastify);
    this.registerInputSanitization(fastify);
    this.registerOutputSanitization(fastify);
    this.registerBruteForceProtection(fastify);

    this.logger.info('All security middleware registered successfully');
  }

  // Utility methods
  private sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  private sanitizeString(input: string): string {
    let sanitized = input;

    if (this.config.validation.sanitization.htmlSanitization) {
      sanitized = sanitizeHtml(sanitized, {
        allowedTags: this.config.validation.sanitization.allowedTags,
        allowedAttributes: this.config.validation.sanitization.allowedAttributes
      });
    }

    if (this.config.validation.sanitization.xssProtection) {
      sanitized = xss(sanitized);
    }

    if (this.config.validation.sanitization.sqlInjectionPrevention) {
      // Basic SQL injection prevention
      sanitized = sanitized.replace(/['"\\;]/g, '');
    }

    return sanitized;
  }

  private sanitizeOutput(output: any): any {
    if (typeof output === 'string') {
      return this.config.validation.outputSanitization.htmlEscaping ?
        validator.escape(output) : output;
    }

    if (Array.isArray(output)) {
      return output.map(item => this.sanitizeOutput(item));
    }

    if (typeof output === 'object' && output !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(output)) {
        sanitized[key] = this.sanitizeOutput(value);
      }
      return sanitized;
    }

    return output;
  }

  private parsePermissionsPolicy(policy: string): any {
    const directives: any = {};
    const parts = policy.split(',').map(part => part.trim());

    for (const part of parts) {
      const [feature, allowlist] = part.split('=');
      if (feature && allowlist) {
        directives[feature.trim()] = allowlist.trim();
      }
    }

    return directives;
  }

  private getClientIP(request: FastifyRequest): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'correlationId'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      ...event
    };

    this.logger.logSecurityEvent(securityEvent);
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
    }
  }
}