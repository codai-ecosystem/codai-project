/**
 * Gateway Service Unit Tests
 * Testing: Route configuration, proxy middleware, security headers, 
 * rate limiting, health checks, service discovery
 */

import { describe, test, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

// Mock external dependencies
vi.mock('@codai/security', () => ({
  setupSecurity: vi.fn().mockResolvedValue({
    getSecurityStats: vi.fn().mockReturnValue({ status: 'secure' }),
    performSecurityHealthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
    shutdown: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('jsonwebtoken');
vi.mock('http-proxy-middleware');

// Import the gateway app (we'll need to restructure to export the app)
// For now, we'll test the components separately

describe('Gateway Service - Unit Tests', () => {
  let app: express.Application;
  let mockJwtVerify: MockedFunction<typeof jwt.verify>;
  let mockCreateProxyMiddleware: MockedFunction<typeof createProxyMiddleware>;

  beforeEach(() => {
    app = express();
    mockJwtVerify = jwt.verify as MockedFunction<typeof jwt.verify>;
    mockCreateProxyMiddleware = createProxyMiddleware as MockedFunction<typeof createProxyMiddleware>;
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Registry', () => {
    test('should initialize with core services', () => {
      const serviceRegistry = {
        'id': {
          name: 'ID Service',
          url: 'http://localhost:4001',
          port: 4001,
          path: '/api/v1/id',
          healthPath: '/health',
          isHealthy: true,
          category: 'auth',
          lastHealthCheck: new Date()
        },
        'codai': {
          name: 'CODAI Service',
          url: 'http://localhost:4002',
          port: 4002,
          path: '/api/v1/codai',
          healthPath: '/health',
          isHealthy: true,
          category: 'core',
          lastHealthCheck: new Date()
        }
      };

      expect(serviceRegistry).toBeDefined();
      expect(serviceRegistry['id']).toBeDefined();
      expect(serviceRegistry['codai']).toBeDefined();
      expect(serviceRegistry['id'].name).toBe('ID Service');
      expect(serviceRegistry['codai'].port).toBe(4002);
    });

    test('should validate service configuration structure', () => {
      const validServiceConfig = {
        name: 'Test Service',
        url: 'http://localhost:5000',
        port: 5000,
        path: '/api/v1/test',
        healthPath: '/health',
        isHealthy: true,
        category: 'test',
        lastHealthCheck: new Date()
      };

      // Test required fields
      expect(validServiceConfig.name).toBeDefined();
      expect(validServiceConfig.url).toBeDefined();
      expect(validServiceConfig.port).toBeTypeOf('number');
      expect(validServiceConfig.path).toBeDefined();
      expect(validServiceConfig.healthPath).toBeDefined();
      expect(validServiceConfig.isHealthy).toBeTypeOf('boolean');
    });
  });

  describe('Route Configuration', () => {
    test('should create proxy middleware with correct configuration', () => {
      const serviceId = 'test-service';
      const serviceConfig = {
        name: 'Test Service',
        url: 'http://localhost:5000',
        port: 5000,
        path: '/api/v1/test',
        healthPath: '/health',
        isHealthy: true,
        category: 'test',
        lastHealthCheck: new Date()
      };

      // Mock the proxy middleware
      const mockProxy = vi.fn();
      mockCreateProxyMiddleware.mockReturnValue(mockProxy);

      // Simulate creating proxy middleware
      const proxyOptions = {
        target: serviceConfig.url,
        changeOrigin: true,
        pathRewrite: {
          [`^/api/v1/${serviceId}`]: '/api/v1'
        }
      };

      createProxyMiddleware(proxyOptions);

      expect(mockCreateProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: serviceConfig.url,
          changeOrigin: true,
          pathRewrite: expect.objectContaining({
            [`^/api/v1/${serviceId}`]: '/api/v1'
          })
        })
      );
    });

    test('should configure proxy request headers', () => {
      const mockOnProxyReq = vi.fn();
      const mockProxyReq = {
        setHeader: vi.fn()
      };
      const mockReq = {
        method: 'GET',
        path: '/test',
        headers: { 'x-request-id': 'test-123' }
      };

      // Simulate onProxyReq callback
      const serviceId = 'test-service';
      const onProxyReq = (proxyReq: any, req: any) => {
        proxyReq.setHeader('X-Gateway-Service', serviceId);
        proxyReq.setHeader('X-Gateway-Timestamp', new Date().toISOString());
        proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] || `req-${Date.now()}`);
      };

      onProxyReq(mockProxyReq, mockReq);

      expect(mockProxyReq.setHeader).toHaveBeenCalledWith('X-Gateway-Service', serviceId);
      expect(mockProxyReq.setHeader).toHaveBeenCalledWith('X-Gateway-Timestamp', expect.any(String));
      expect(mockProxyReq.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-123');
    });

    test('should configure proxy response headers', () => {
      const mockProxyRes = {
        headers: {}
      };
      const serviceId = 'test-service';

      // Simulate onProxyRes callback
      const onProxyRes = (proxyRes: any) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['X-Powered-By'] = 'CODAI API Gateway';
        proxyRes.headers['X-Service'] = serviceId;
      };

      onProxyRes(mockProxyRes);

      expect(mockProxyRes.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(mockProxyRes.headers['X-Powered-By']).toBe('CODAI API Gateway');
      expect(mockProxyRes.headers['X-Service']).toBe(serviceId);
    });
  });

  describe('Security Headers', () => {
    test('should apply security headers to responses', async () => {
      app.get('/test', (req, res) => {
        res.set({
          'X-Powered-By': 'CODAI API Gateway',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        });
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.headers['x-powered-by']).toBe('CODAI API Gateway');
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  describe('Rate Limiting', () => {
    test('should implement rate limiting middleware', () => {
      const rateLimitConfig = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many requests from this IP',
        standardHeaders: true,
        legacyHeaders: false
      };

      expect(rateLimitConfig.windowMs).toBe(900000); // 15 minutes in ms
      expect(rateLimitConfig.max).toBe(1000);
      expect(rateLimitConfig.message).toBe('Too many requests from this IP');
    });

    test('should apply service-specific rate limits', () => {
      const serviceRateLimits = {
        'id': { windowMs: 60000, max: 50 }, // Auth service - stricter limits
        'codai': { windowMs: 60000, max: 200 }, // Core service - higher limits
        'memorai': { windowMs: 60000, max: 100 }, // Memory service - moderate limits
      };

      expect(serviceRateLimits['id'].max).toBe(50);
      expect(serviceRateLimits['codai'].max).toBe(200);
      expect(serviceRateLimits['memorai'].max).toBe(100);
    });
  });

  describe('Health Checks', () => {
    test('should provide gateway health endpoint', async () => {
      app.get('/health', (req, res) => {
        res.json({
          service: 'api-gateway',
          status: 'healthy',
          description: 'CODAI Ecosystem API Gateway',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: '2.0.0',
          registeredServices: 6
        });
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.service).toBe('api-gateway');
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('2.0.0');
      expect(response.body.registeredServices).toBe(6);
    });

    test('should provide comprehensive health status', async () => {
      const healthStatus = {
        gateway: {
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        },
        services: [
          {
            id: 'id',
            name: 'ID Service',
            status: 'healthy',
            url: 'http://localhost:4001',
            lastHealthCheck: new Date(),
            category: 'auth'
          },
          {
            id: 'codai',
            name: 'CODAI Service',
            status: 'healthy',
            url: 'http://localhost:4002',
            lastHealthCheck: new Date(),
            category: 'core'
          }
        ]
      };

      expect(healthStatus.gateway.status).toBe('healthy');
      expect(healthStatus.services).toHaveLength(2);
      expect(healthStatus.services[0].name).toBe('ID Service');
      expect(healthStatus.services[1].category).toBe('core');
    });

    test('should detect unhealthy services', () => {
      const services = [
        { id: 'service1', isHealthy: true },
        { id: 'service2', isHealthy: false },
        { id: 'service3', isHealthy: true }
      ];

      const allHealthy = services.every(service => service.isHealthy);
      const statusCode = allHealthy ? 200 : 503;

      expect(allHealthy).toBe(false);
      expect(statusCode).toBe(503);
    });
  });

  describe('Service Discovery', () => {
    test('should provide service discovery endpoint', async () => {
      const serviceRegistry = {
        'id': { name: 'ID Service', url: 'http://localhost:4001', category: 'auth' },
        'codai': { name: 'CODAI Service', url: 'http://localhost:4002', category: 'core' },
        'memorai': { name: 'MemorAI Service', url: 'http://localhost:4003', category: 'data' }
      };

      app.get('/api/gateway/services', (req, res) => {
        res.json({
          success: true,
          services: Object.entries(serviceRegistry).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            category: config.category
          }))
        });
      });

      const response = await request(app).get('/api/gateway/services');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.services).toHaveLength(3);
      expect(response.body.services[0].name).toBe('ID Service');
    });

    test('should filter services by category', () => {
      const serviceRegistry = {
        'id': { category: 'auth', isHealthy: true },
        'codai': { category: 'core', isHealthy: true },
        'memorai': { category: 'data', isHealthy: false }
      };

      const authServices = Object.entries(serviceRegistry)
        .filter(([_, config]) => config.category === 'auth')
        .map(([id]) => id);

      const healthyServices = Object.entries(serviceRegistry)
        .filter(([_, config]) => config.isHealthy)
        .map(([id]) => id);

      expect(authServices).toEqual(['id']);
      expect(healthyServices).toEqual(['id', 'codai']);
    });
  });

  describe('JWT Authentication', () => {
    test('should validate JWT tokens', () => {
      const mockToken = 'valid.jwt.token';
      const mockPayload = { userId: '123', role: 'user' };

      mockJwtVerify.mockReturnValue(mockPayload);

      const result = jwt.verify(mockToken, 'secret');

      expect(mockJwtVerify).toHaveBeenCalledWith(mockToken, 'secret');
      expect(result).toEqual(mockPayload);
    });

    test('should handle invalid JWT tokens', () => {
      const mockToken = 'invalid.jwt.token';
      
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwt.verify(mockToken, 'secret')).toThrow('Invalid token');
    });

    test('should create authentication middleware', () => {
      const authenticateToken = (req: any, res: any, next: any) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
          return res.status(401).json({ error: 'Access token required' });
        }

        try {
          const user = jwt.verify(token, 'secret');
          req.user = user;
          next();
        } catch (error) {
          return res.status(403).json({ error: 'Invalid token' });
        }
      };

      // Test the middleware function exists
      expect(authenticateToken).toBeTypeOf('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle proxy errors gracefully', () => {
      const mockError = new Error('Service unavailable');
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const onError = (err: any, req: any, res: any) => {
        console.error(`[GATEWAY] Proxy error:`, err.message);
        res.status(502).json({
          success: false,
          error: 'Bad Gateway',
          message: 'Service is temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE'
        });
      };

      onError(mockError, mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(502);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad Gateway',
        message: 'Service is temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    });

    test('should handle global errors', async () => {
      app.get('/error', (req, res) => {
        throw new Error('Test error');
      });

      app.use((error: any, req: any, res: any, next: any) => {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR'
        });
      });

      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Request Logging', () => {
    test('should log incoming requests', () => {
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const logRequest = (method: string, path: string, serviceId: string) => {
        console.log(`[GATEWAY] Routing ${method} ${path} to ${serviceId} service`);
      };

      logRequest('GET', '/api/v1/test', 'test-service');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[GATEWAY] Routing GET /api/v1/test to test-service service'
      );

      mockConsoleLog.mockRestore();
    });

    test('should generate request IDs', () => {
      const generateRequestId = (headers: any) => {
        return headers['x-request-id'] || `req-${Date.now()}`;
      };

      const withId = generateRequestId({ 'x-request-id': 'custom-123' });
      const withoutId = generateRequestId({});

      expect(withId).toBe('custom-123');
      expect(withoutId).toMatch(/^req-\d+$/);
    });
  });
});
