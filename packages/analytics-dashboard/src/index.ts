// Main Analytics Dashboard Application Entry Point
import { analyticsConfig } from './config.js';
import { AnalyticsWebSocketServer } from './server/websocket-server.js';

export * from './types.js';
export * from './config.js';
export * from './collectors/metrics-collector.js';
export * from './server/websocket-server.js';

class AnalyticsDashboardApp {
  private server: AnalyticsWebSocketServer;
  private isRunning = false;

  constructor() {
    this.server = new AnalyticsWebSocketServer(analyticsConfig);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('📊 Analytics Dashboard is already running');
      return;
    }

    try {
      console.log('🚀 Starting CodAI Analytics Dashboard...');
      console.log('📋 Configuration:', {
        websocketPort: analyticsConfig.websocket.port,
        enableAuth: analyticsConfig.security.enableAuth,
        services: Object.keys(analyticsConfig.services).length,
        metricsRetention: analyticsConfig.metrics.retention,
      });

      await this.server.start();
      this.isRunning = true;

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log('✅ Analytics Dashboard started successfully!');
      console.log(`📊 WebSocket: ws://localhost:${analyticsConfig.websocket.port}/ws`);
      console.log(`🌐 HTTP API: http://localhost:${analyticsConfig.websocket.port}/api`);
      console.log(`💻 Health Check: http://localhost:${analyticsConfig.websocket.port}/health`);

    } catch (error) {
      console.error('❌ Failed to start Analytics Dashboard:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('📊 Analytics Dashboard is not running');
      return;
    }

    try {
      console.log('🛑 Stopping CodAI Analytics Dashboard...');
      await this.server.stop();
      this.isRunning = false;
      console.log('✅ Analytics Dashboard stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping Analytics Dashboard:', error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`📊 Received ${signal}, shutting down gracefully...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  getStats() {
    return this.server.getStats();
  }

  isHealthy(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const analyticsDashboard = new AnalyticsDashboardApp();

// Auto-start if this module is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyticsDashboard.start().catch((error) => {
    console.error('Failed to start Analytics Dashboard:', error);
    process.exit(1);
  });
}