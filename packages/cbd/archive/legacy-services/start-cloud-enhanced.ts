import { CBDCloudEnhancedService } from './universal/CBDCloudEnhancedService.js';
import dotenv from 'dotenv';
import { Server } from 'http';

// Load environment variables
dotenv.config();

class ModernCBDCloudServer {
  private service: CBDCloudEnhancedService;
  private server: Server | null = null;
  private isShuttingDown = false;

  constructor() {
    this.service = new CBDCloudEnhancedService();
    this.setupGracefulShutdown();
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting CBD Universal Database - Cloud Enhanced Service...');
      console.log('📋 Environment:', process.env.NODE_ENV || 'development');
      console.log('🔧 Node.js version:', process.version);
      
      // Display cloud configuration
      console.log('🌥️ Multi-Cloud Configuration:');
      console.log('   AWS Region:', process.env.AWS_REGION || 'us-east-1');
      console.log('   Azure Region:', process.env.AZURE_REGION || 'eastus');
      console.log('   GCP Region:', process.env.GCP_REGION || 'us-central1');
      
      // Initialize service
      this.service = new CBDCloudEnhancedService();
      const app = await this.service.initialize();

      // Configure server
      const port = process.env.PORT || 4180;
      this.server = app.listen(port, () => {
        console.log('✅ CBD Universal Cloud-Enhanced Service is running');
        console.log(`🌐 Server: http://localhost:${port}`);
        console.log('📊 Available Paradigms: 5 (Document, Vector, Graph, Key-Value, Time-Series)');
        console.log('🌥️ Cloud Features: Multi-Cloud Intelligence, Dynamic Selection, Performance Analytics');
        console.log('');
        console.log('📍 Key Endpoints:');
        console.log(`   Health Check: http://localhost:${port}/health`);
        console.log(`   Statistics:   http://localhost:${port}/stats`);
        console.log(`   Cloud Status: http://localhost:${port}/cloud/status`);
        console.log(`   Cloud Analytics: http://localhost:${port}/cloud/analytics`);
        console.log(`   Document API: http://localhost:${port}/document/*`);
        console.log(`   Vector API:   http://localhost:${port}/vector/*`);
        console.log(`   Graph API:    http://localhost:${port}/graph/*`);
        console.log(`   KV API:       http://localhost:${port}/kv/*`);
        console.log(`   TimeSeries:   http://localhost:${port}/timeseries/*`);
        console.log('');
        console.log('💡 Ready for multi-cloud operations. Press Ctrl+C to stop.');
      });

      // Set server timeout for long-running operations
      if (this.server) {
        this.server.timeout = 30000;
      }

      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start CBD Universal Cloud-Enhanced Service:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      
      try {
        console.log('🌥️ Disconnecting from cloud services...');
        // Cloud disconnection would happen here
        
        console.log('🗄️ Stopping CBD Universal Service...');
        if (this.server) {
          this.server.close(() => {
            console.log('✅ Server closed successfully');
          });
        } else {
          console.log('✅ Service shutdown complete');
        }
        
        console.log('✅ CBD Universal Cloud-Enhanced Service stopped gracefully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}

// Start the server
const server = new ModernCBDCloudServer();
server.start().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
