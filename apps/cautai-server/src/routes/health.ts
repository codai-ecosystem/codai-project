/**
 * @fileoverview Health Check Routes
 * @author Cautai Team
 * @version 1.0.0
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  service: string;
  checks: {
    [key: string]: {
      status: 'ok' | 'error';
      message?: string;
    };
  };
}

const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Simple health check
  fastify.get('/health', async (): Promise<HealthResponse> => {
    // Mock health checks - replace with real checks
    const checks = {
      database: { status: 'ok' as const },
      cache: { status: 'ok' as const },
      search: { status: 'ok' as const },
    };
    
    const allHealthy = Object.values(checks).every(check => check.status === 'ok');
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'cautai-server',
      checks,
    };
  });
  
  // Detailed health check
  fastify.get('/health/detailed', async (): Promise<HealthResponse & { uptime: number }> => {
    const basicHealth = await fastify.inject({
      method: 'GET',
      url: '/health',
    });
    
    const health = JSON.parse(basicHealth.payload) as HealthResponse;
    
    return {
      ...health,
      uptime: process.uptime(),
    };
  });
  
  // Ready check (for k8s readiness probes)
  fastify.get('/ready', async () => {
    // Mock readiness check - replace with actual dependency checks
    return { status: 'ready' };
  });
};

export { healthRoutes };