/**
 * Service Registration and Initialization
 * Handles startup registration with Codai ecosystem
 */

import { getCodaiService } from './services';
import type { ServiceInfo } from './services';

export async function initializeService(): Promise<void> {
  console.log('🚀 Initializing FabricAI service...');

  const serviceInfo: Omit<ServiceInfo, 'id'> = {
    name: 'FabricAI',
    domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005',
    port: 3005,
    status: 'online',
    version: '0.1.0',
    priority: 2,
  };

  try {
    // Register with Codai central platform
    const codaiService = getCodaiService();
    const result = await codaiService.registerService(serviceInfo);

    if (result.success) {
      console.log('✅ Service registered successfully with Codai platform');
      console.log(`   Service ID: ${result.serviceId}`);
    } else {
      console.warn('⚠️  Service registration failed:', result.error);
    }

    // Start health monitoring
    startHealthMonitoring();
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    // Continue startup even if registration fails
  }
}

function startHealthMonitoring(): void {
  // Send health updates every 30 seconds
  setInterval(async () => {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        console.warn('Health check endpoint returned error');
      }
    } catch (error) {
      console.warn('Health monitoring failed:', error);
    }
  }, 30000);

  console.log('📊 Health monitoring started');
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, shutting down gracefully...`);
    
    try {
      // Notify Codai platform about shutdown
      const codaiService = getCodaiService();
      await codaiService.sendHealthCheck({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to notify platform about shutdown:', error);
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
