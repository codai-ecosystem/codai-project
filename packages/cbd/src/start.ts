#!/usr/bin/env tsx

/**
 * CBD Universal Database - Modern Express.js Startup
 * Based on Microsoft Azure best practices and Express.js 5.x patterns
 * 
 * Features:
 * - Proper graceful shutdown handling
 * - Process lifecycle management 
 * - Production-ready error handling
 * - Modern TypeScript with Express.js 5.x compatibility
 * - Fast reload capability (touched for reload)
 */

import { CBDUniversalServiceSimple } from './CBDUniversalService.js';

class ModernCBDServer {
    private service: CBDUniversalServiceSimple | null = null;
    private server: any = null;
    private isShuttingDown = false;

    async start(): Promise<void> {
        try {
            console.log('🚀 Starting CBD Universal Database Service...');
            console.log('📋 Environment:', process.env.NODE_ENV || 'development');
            console.log('🔧 Node.js version:', process.version);

            // Initialize service
            this.service = new CBDUniversalServiceSimple();
            const app = await this.service.initialize();

            // Configure server
            const port = process.env.PORT || 4180;
            this.server = app.listen(port, () => {
                console.log('✅ CBD Universal Database Service is running');
                console.log(`🌐 Server: http://localhost:${port}`);
                console.log('📊 Available Paradigms: 6 (Document, Vector, Graph, Key-Value, Time-Series, File Storage)');
                console.log('');
                console.log('📍 Key Endpoints:');
                console.log(`   Health Check: http://localhost:${port}/health`);
                console.log(`   Statistics:   http://localhost:${port}/stats`);
                console.log(`   Document API: http://localhost:${port}/document/*`);
                console.log(`   Vector API:   http://localhost:${port}/vector/*`);
                console.log(`   Graph API:    http://localhost:${port}/graph/*`);
                console.log(`   KV API:       http://localhost:${port}/kv/*`);
                console.log(`   TimeSeries:   http://localhost:${port}/timeseries/*`);
                console.log(`   Files API:    http://localhost:${port}/files/*`);
                console.log('');
                console.log('💡 Ready to handle requests. Press Ctrl+C to stop.');
            });

            // Set server timeout for long-running operations
            this.server.timeout = 30000;

            // Setup graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('❌ Failed to start CBD service:', error);
            process.exit(1);
        }
    }

    private setupGracefulShutdown(): void {
        // Handle termination signals properly
        const shutdown = async (signal: string) => {
            if (this.isShuttingDown) {
                console.log('🔄 Shutdown already in progress...');
                return;
            }

            this.isShuttingDown = true;
            console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

            try {
                // Stop accepting new connections
                if (this.server) {
                    console.log('🔒 Closing HTTP server...');
                    await new Promise<void>((resolve, reject) => {
                        this.server.close((err: any) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                // Cleanup service resources
                if (this.service) {
                    console.log('🧹 Cleaning up service resources...');
                    // Note: Add service cleanup method if available
                    // await this.service.cleanup();
                }

                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        // Register signal handlers
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown('UNHANDLED_REJECTION');
        });
    }
}

// Start the server
const server = new ModernCBDServer();
server.start().catch((error) => {
    console.error('💥 Fatal startup error:', error);
    process.exit(1);
});
