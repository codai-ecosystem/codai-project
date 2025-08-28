/**
 * Glass MCP v9.0.1 Main Entry Point (Lite)
 * 
 * Simplified entry point for Glass MCP server with core functionality.
 * This serves as the main executable for the npm package.
 * 
 * @version 9.0.1
 * @author Glass MCP Vision Team
 */

import { GlassMCPServer } from './mcp-server-core.js';
import { ConfigurationManager } from './configuration-manager.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { createGlassMCPIntegrationOptimizer } from './integration-optimizer.js';

/**
 * Glass MCP Server launcher
 */
export class GlassMCPLauncher {
    private server?: GlassMCPServer;
    private configManager?: ConfigurationManager;
    private performanceMonitor?: PerformanceMonitor;
    private isRunning: boolean = false;

    /**
     * Initialize and start the Glass MCP server
     */
    public async start(): Promise<void> {
        try {
            console.log('🚀 Starting Glass MCP v9.0.0...');

            // Initialize configuration manager
            this.configManager = new ConfigurationManager();
            await this.configManager.initialize();
            console.log('✅ Configuration Manager initialized');

            // Initialize performance monitor
            this.performanceMonitor = new PerformanceMonitor();
            await this.performanceMonitor.initialize();
            console.log('✅ Performance Monitor initialized');

            // Initialize MCP server
            this.server = new GlassMCPServer();
            await this.server.initialize();
            console.log('✅ MCP Server initialized');

            // Start the server
            await this.server.start();
            this.isRunning = true;

            console.log('🎉 Glass MCP v9.0.0 started successfully!');
            console.log('🔗 Server listening on configured port');
            console.log('📊 Performance monitoring active');
            console.log('⚙️  Configuration hot-reload enabled');

            // Setup graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('❌ Failed to start Glass MCP:', error);
            await this.shutdown();
            process.exit(1);
        }
    }

    /**
     * Stop the Glass MCP server
     */
    public async shutdown(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        console.log('🛑 Shutting down Glass MCP v9.0.0...');

        try {
            // Shutdown components in reverse order
            if (this.server) {
                await this.server.shutdown();
                console.log('✅ MCP Server shutdown complete');
            }

            if (this.performanceMonitor) {
                await this.performanceMonitor.shutdown();
                console.log('✅ Performance Monitor shutdown complete');
            }

            if (this.configManager) {
                await this.configManager.shutdown();
                console.log('✅ Configuration Manager shutdown complete');
            }

            this.isRunning = false;
            console.log('✅ Glass MCP shutdown complete');

        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown(): void {
        const shutdownHandler = async (signal: string) => {
            console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
            await this.shutdown();
            process.exit(0);
        };

        process.on('SIGINT', () => shutdownHandler('SIGINT'));
        process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
        process.on('SIGUSR2', () => shutdownHandler('SIGUSR2')); // For nodemon

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            console.error('💥 Uncaught Exception:', error);
            await this.shutdown();
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            await this.shutdown();
            process.exit(1);
        });
    }

    /**
     * Get server status
     */
    public getStatus(): {
        isRunning: boolean;
        uptime: number;
        serverStatus: string;
        componentsLoaded: number;
    } {
        return {
            isRunning: this.isRunning,
            uptime: this.isRunning ? process.uptime() : 0,
            serverStatus: this.isRunning ? 'active' : 'stopped',
            componentsLoaded: 3 // server, config, performance
        };
    }
}

/**
 * Create and start Glass MCP launcher
 */
export async function createGlassMCPLauncher(): Promise<GlassMCPLauncher> {
    const launcher = new GlassMCPLauncher();
    await launcher.start();
    return launcher;
}

/**
 * Main entry point when run directly
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const showHelp = args.includes('--help') || args.includes('-h');
    const showVersion = args.includes('--version') || args.includes('-v');
    const showStatus = args.includes('--status');

    if (showHelp) {
        console.log(`
Glass MCP v9.0.0 - AI-Powered Windows Automation with Complete Visual Intelligence

Usage:
  glass-mcp-server [options]

Options:
  --help, -h       Show this help message
  --version, -v    Show version information
  --status         Show server status (if running)

Environment Variables:
  GLASS_MCP_PORT          Server port (default: 4950)
  GLASS_MCP_HOST          Server host (default: localhost)  
  GLASS_MCP_LOG_LEVEL     Log level (default: info)
  GLASS_MCP_CONFIG_FILE   Custom config file path

Examples:
  glass-mcp-server                    # Start with default settings
  GLASS_MCP_PORT=5000 glass-mcp-server # Start on port 5000
  glass-mcp-server --status           # Check server status

For more information, visit: https://github.com/glass-ai/mcp-vision
        `);
        return;
    }

    if (showVersion) {
        console.log('Glass MCP v9.0.0');
        console.log('AI-Powered Windows Automation with Complete Visual Intelligence');
        console.log('Copyright (c) 2025 Glass AI Team');
        return;
    }

    if (showStatus) {
        console.log('🔍 Checking Glass MCP status...');
        // TODO: Implement status check for running server
        console.log('ℹ️  Status checking not yet implemented');
        return;
    }

    // Start the server
    try {
        const launcher = await createGlassMCPLauncher();
        
        // Keep the process running
        console.log('🔄 Glass MCP is running. Press Ctrl+C to stop.');
        
        // Wait for shutdown signal
        await new Promise((resolve) => {
            process.on('SIGINT', resolve);
            process.on('SIGTERM', resolve);
        });

    } catch (error) {
        console.error('💥 Failed to start Glass MCP:', error);
        process.exit(1);
    }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
    main().catch((error) => {
        console.error('💥 Unhandled error in Glass MCP launcher:', error);
        process.exit(1);
    });
}