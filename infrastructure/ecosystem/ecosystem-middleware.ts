/**
 * 🌐 CODAI Ecosystem Communication Middleware
 * Express.js middleware for inter-service communication
 */

import { Request, Response, NextFunction } from 'express';
import { EcosystemCommunicationClient, EcosystemConfig, ECOSYSTEM_SERVICES } from './service-communication-config';

// Extend Express Request to include ecosystem context
declare global {
  namespace Express {
    interface Request {
      ecosystem?: {
        serviceId: string;
        client: EcosystemCommunicationClient;
        callService: (targetService: string, endpoint: string, method?: string, data?: any) => Promise<any>;
        checkHealth: (service: string) => Promise<any>;
        isAuthenticated: boolean;
        sourceService?: string;
      };
    }
  }
}

export interface EcosystemMiddlewareOptions {
  serviceId: string;
  apiKey?: string;
  enableHealthChecks?: boolean;
  enableServiceDiscovery?: boolean;
  enableMetrics?: boolean;
}

/**
 * 🚀 Main Ecosystem Middleware
 */
export function ecosystemMiddleware(options: EcosystemMiddlewareOptions) {
  const { serviceId, apiKey, enableHealthChecks = true } = options;
  
  // Validate service ID
  if (!ECOSYSTEM_SERVICES[serviceId]) {
    throw new Error(`Invalid service ID: ${serviceId}. Must be one of: ${Object.keys(ECOSYSTEM_SERVICES).join(', ')}`);
  }

  const client = new EcosystemCommunicationClient(serviceId, apiKey);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Add ecosystem context to request
      req.ecosystem = {
        serviceId,
        client,
        callService: async (targetService: string, endpoint: string, method: string = 'GET', data?: any) => {
          return await client.callService(targetService, endpoint, method as any, data);
        },
        checkHealth: async (service: string) => {
          return await client.checkServiceHealth(service);
        },
        isAuthenticated: !!req.headers.authorization,
        sourceService: req.headers['x-ecosystem-source'] as string
      };

      // Add ecosystem headers to response
      res.setHeader('X-Ecosystem-Service', serviceId);
      res.setHeader('X-Ecosystem-Version', '1.0.0');
      res.setHeader('X-Ecosystem-Timestamp', new Date().toISOString());

      next();
    } catch (error) {
      console.error('🚨 Ecosystem middleware error:', error);
      res.status(500).json({
        error: 'Ecosystem communication error',
        message: error instanceof Error ? error.message : 'Unknown error',
        service: serviceId,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * 🛡️ Authentication Middleware for Ecosystem
 */
export function ecosystemAuthMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const ecosystemKey = req.headers['x-ecosystem-key'] as string;
      
      // Check for ecosystem API key
      if (ecosystemKey && ecosystemKey === process.env.ECOSYSTEM_API_KEY) {
        req.ecosystem = req.ecosystem || {} as any;
        req.ecosystem.isAuthenticated = true;
        return next();
      }

      // Check for Bearer token
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // For now, simple token validation
        // In production, validate against ID service
        if (token && token.length > 10) {
          req.ecosystem = req.ecosystem || {} as any;
          req.ecosystem.isAuthenticated = true;
          return next();
        }
      }

      // Check if authentication is required for this endpoint
      const publicEndpoints = ['/health', '/', '/status', '/metrics'];
      if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        return next();
      }

      res.status(401).json({
        error: 'Authentication required',
        message: 'Valid ecosystem API key or Bearer token required',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('🚨 Ecosystem auth error:', error);
      res.status(500).json({
        error: 'Authentication error',
        message: 'Failed to validate ecosystem authentication',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * 🔍 Service Discovery Middleware
 */
export function serviceDiscoveryMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/ecosystem/discover' && req.method === 'GET') {
      try {
        if (!req.ecosystem) {
          return res.status(500).json({ error: 'Ecosystem middleware not initialized' });
        }

        const discovery = await req.ecosystem.client.discoverServices();
        
        res.json({
          success: true,
          ecosystem: 'codai-ecosystem',
          timestamp: new Date().toISOString(),
          discovery
        });
        return;
      } catch (error) {
        res.status(500).json({
          error: 'Service discovery failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    
    next();
  };
}

/**
 * 🏥 Health Check Middleware with Ecosystem Status
 */
export function ecosystemHealthMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health' && req.method === 'GET') {
      try {
        const serviceId = req.ecosystem?.serviceId || 'unknown';
        const service = ECOSYSTEM_SERVICES[serviceId];
        
        const health = {
          service: service?.name || serviceId,
          status: 'healthy',
          ecosystem: 'codai-ecosystem',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          capabilities: service?.capabilities || [],
          endpoints: {
            health: '/health',
            api: service?.apiPath || '/api',
            ecosystem: '/ecosystem'
          }
        };

        // Add ecosystem connectivity status if client is available
        if (req.ecosystem?.client) {
          try {
            const discovery = await req.ecosystem.client.discoverServices();
            health.ecosystem = {
              connected: true,
              totalServices: discovery.totalServices,
              healthyServices: discovery.healthyServices,
              connectivity: `${discovery.healthyServices}/${discovery.totalServices}`
            } as any;
          } catch (error) {
            health.ecosystem = {
              connected: false,
              error: 'Failed to connect to ecosystem services'
            } as any;
          }
        }

        res.json(health);
        return;
      } catch (error) {
        res.status(500).json({
          service: req.ecosystem?.serviceId || 'unknown',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    
    next();
  };
}

/**
 * 📊 Metrics Collection Middleware
 */
export function ecosystemMetricsMiddleware() {
  const metrics = {
    requests: 0,
    errors: 0,
    serviceCallsOut: 0,
    serviceCallsIn: 0,
    startTime: Date.now()
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    metrics.requests++;

    // Track incoming service calls
    if (req.headers['x-ecosystem-source']) {
      metrics.serviceCallsIn++;
    }

    // Override res.json to track service calls
    const originalJson = res.json;
    res.json = function(data: any) {
      const duration = Date.now() - startTime;
      
      // Track errors
      if (res.statusCode >= 400) {
        metrics.errors++;
      }

      return originalJson.call(this, data);
    };

    // Add metrics endpoint
    if (req.path === '/ecosystem/metrics' && req.method === 'GET') {
      const uptime = Date.now() - metrics.startTime;
      
      res.json({
        service: req.ecosystem?.serviceId || 'unknown',
        ecosystem: 'codai-ecosystem',
        metrics: {
          ...metrics,
          uptime,
          requestsPerSecond: metrics.requests / (uptime / 1000),
          errorRate: metrics.errors / metrics.requests,
          avgResponseTime: uptime / metrics.requests
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
}

/**
 * 🚨 Error Handling Middleware for Ecosystem
 */
export function ecosystemErrorMiddleware() {
  return (error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('🚨 Ecosystem error:', {
      service: req.ecosystem?.serviceId,
      path: req.path,
      method: req.method,
      error: error.message,
      stack: error.stack
    });

    res.status(error.status || 500).json({
      error: 'Internal Server Error',
      message: error.message,
      service: req.ecosystem?.serviceId || 'unknown',
      ecosystem: 'codai-ecosystem',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  };
}

/**
 * 🔧 Complete Ecosystem Middleware Setup
 */
export function setupEcosystemMiddleware(app: any, options: EcosystemMiddlewareOptions) {
  // Core ecosystem middleware
  app.use(ecosystemMiddleware(options));
  
  // Authentication middleware
  app.use(ecosystemAuthMiddleware());
  
  // Health check with ecosystem status
  app.use(ecosystemHealthMiddleware());
  
  // Service discovery
  app.use(serviceDiscoveryMiddleware());
  
  // Metrics collection
  app.use(ecosystemMetricsMiddleware());
  
  // Error handling (should be last)
  app.use(ecosystemErrorMiddleware());

  console.log(`🌐 Ecosystem middleware initialized for service: ${options.serviceId}`);
  console.log(`📡 Service registered in CODAI ecosystem`);
  console.log(`🔗 Inter-service communication enabled`);
}

export default {
  ecosystemMiddleware,
  ecosystemAuthMiddleware,
  serviceDiscoveryMiddleware,
  ecosystemHealthMiddleware,
  ecosystemMetricsMiddleware,
  ecosystemErrorMiddleware,
  setupEcosystemMiddleware
};
