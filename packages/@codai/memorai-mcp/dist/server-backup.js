#!/usr/bin/env node
/**
 * MemorAI MCP Server - CBD Integration Fixed
 *
 * FIXES APPLIED:
 * - Enhanced CBD integration for proper memory persistence
 * - Fixed structured key generation to avoid duplicates
 * - Improved error handling and logging
 * - Optimized for production use with @codai/memorai-mcp package
 *
 * Date: July 30, 2025
 */
/**
 * MemorAI CBD-based MCP Server - Published Package Entry Point
 *
 * This is the published package version that works with:
 * npx -y @codai/memorai-mcp@latest
 *
 * Environment Configuration:
 * - DOTENV_CONFIG_PATH: Path to .env file (e.g., "E:\\GitHub\\workspace-ai\\.env")
 * - MEMORAI_CBD_PATH: Path to CBD data directory
 * - OPENAI_API_KEY: OpenAI API key for embeddings
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { MemorAIAdvancedServer } from './cbd-server.js';
// Simple startup logging to stderr (visible in VS Code MCP logs)
console.error('🚀 MemorAI MCP Server starting...');
console.error(`Node.js version: ${process.version}`);
console.error(`Working directory: ${process.cwd()}`);
// Configure environment variables
function configureEnvironment() {
    console.error('[INIT] Configuring environment...');
    // Use DOTENV_CONFIG_PATH if provided (VS Code MCP configuration)
    const envPath = process.env.DOTENV_CONFIG_PATH;
    console.error(`[INIT] DOTENV_CONFIG_PATH: ${envPath}`);
    if (envPath && existsSync(envPath)) {
        console.error(`[INIT] Loading environment from: ${envPath}`);
        config({ path: envPath });
    }
    else if (envPath) {
        console.error(`[INIT] Environment file not found: ${envPath}`);
        console.error('[INIT] Falling back to default .env loading...');
        config(); // Load default .env
    }
    else {
        console.error('[INIT] Loading default .env file...');
        config(); // Load default .env
    }
    console.error('[INIT] Environment configuration completed');
}
if (envPath && existsSync(envPath)) {
    console.log(`[DEBUG] Loading environment from: ${envPath}`);
    config({ path: envPath });
}
else if (envPath) {
    console.warn(`[DEBUG] Environment file not found: ${envPath}`);
    console.log('[DEBUG] Falling back to default .env loading...');
    config(); // Load default .env
}
else {
    console.log('[DEBUG] Loading default .env file...');
    config(); // Load default .env
}
console.log('[DEBUG] Checking required environment variables...');
// Validate required environment variables
const requiredEnvVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_KEY',
    'AZURE_OPENAI_API_VERSION',
    'AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT'
];
const missingVars = requiredEnvVars.filter(varName => {
    const exists = !!process.env[varName];
    console.log(`[DEBUG] ${varName}: ${exists ? 'SET' : 'MISSING'}`);
    return !exists;
});
if (missingVars.length > 0) {
    console.error('[ERROR] Required Azure OpenAI environment variables are missing:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('   Please ensure your .env file contains all Azure OpenAI configuration');
    process.exit(1);
}
console.log('[DEBUG] Environment configuration completed successfully');
// Get server configuration
function getServerConfig() {
    return {
        // CBD Configuration
        cbdPath: process.env.MEMORAI_CBD_PATH || './memorai-cbd-data',
        // Azure OpenAI Configuration
        azureOpenAI: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            apiKey: process.env.AZURE_OPENAI_KEY || '',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview',
            embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT || 'text-embedding-ada-002',
            embeddingModel: process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        },
        // Legacy OpenAI (fallback)
        openaiApiKey: process.env.OPENAI_API_KEY,
        embeddingModel: process.env.MEMORAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        dimensions: parseInt(process.env.MEMORAI_DIMENSIONS || '1536'),
        // Performance Configuration
        cacheSize: parseInt(process.env.MEMORAI_CACHE_SIZE || '10000'),
        maxMemories: parseInt(process.env.MEMORAI_MAX_MEMORIES || '100000'),
        // Logging Configuration
        logLevel: process.env.MEMORAI_LOG_LEVEL || 'info',
        // Server Configuration
        serverName: 'MemorAI Advanced MCP Server (Azure OpenAI)',
        version: '8.0.0-advanced',
        // Environment
        nodeEnv: process.env.NODE_ENV || 'production',
        // Advanced Features
        enableSemanticSearch: process.env.MEMORAI_ENABLE_SEMANTIC_SEARCH?.toLowerCase() !== 'false',
        enablePerformanceTracking: process.env.MEMORAI_ENABLE_PERFORMANCE_TRACKING?.toLowerCase() !== 'false',
        enableHybridStorage: process.env.MEMORAI_ENABLE_HYBRID_STORAGE?.toLowerCase() !== 'false',
        fallbackStorage: process.env.MEMORAI_FALLBACK_STORAGE || 'json'
    };
}
// Main server startup for MCP stdio transport
export async function main() {
    process.stderr.write('[DEBUG] ========== MEMORAI MCP SERVER STARTUP ==========\n');
    console.log('[DEBUG] ========== MEMORAI MCP SERVER STARTUP ==========');
    process.stderr.write(`[DEBUG] Node.js version: ${process.version}\n`);
    console.log(`[DEBUG] Node.js version: ${process.version}`);
    process.stderr.write(`[DEBUG] Platform: ${process.platform}\n`);
    console.log(`[DEBUG] Platform: ${process.platform}`);
    process.stderr.write(`[DEBUG] Working directory: ${process.cwd()}\n`);
    console.log(`[DEBUG] Working directory: ${process.cwd()}`);
    process.stderr.write(`[DEBUG] Process arguments: ${JSON.stringify(process.argv)}\n`);
    console.log(`[DEBUG] Process arguments: ${JSON.stringify(process.argv)}`);
    try {
        console.log('[DEBUG] Step 1: Configure environment');
        // Configure environment
        configureEnvironment();
        console.log('[DEBUG] Step 2: Get server configuration');
        // Get server configuration
        const config = getServerConfig();
        console.log(`[DEBUG] Server config loaded:`);
        console.log(`[DEBUG]   Server Name: ${config.serverName}`);
        console.log(`[DEBUG]   Data Path: ${config.cbdPath}`);
        console.log(`[DEBUG]   Azure OpenAI Endpoint: ${config.azureOpenAI.endpoint ? 'configured' : 'not configured'}`);
        console.log(`[DEBUG]   Log Level: ${config.logLevel}`);
        console.log('[DEBUG] Step 3: Create MCP server instance');
        // Create and start MCP server with stdio transport
        const server = new MemorAIAdvancedServer(config);
        console.log('[DEBUG] MCP server instance created successfully');
        console.log('[DEBUG] Step 4: Starting MCP server...');
        await server.start();
        console.log('[DEBUG] MCP server started successfully');
        console.log('[DEBUG] Step 5: Setting up signal handlers...');
        // Handle graceful shutdown
        const shutdown = async (signal) => {
            console.log(`[DEBUG] Shutdown signal received: ${signal}`);
            try {
                await server.stop();
                console.log('[DEBUG] Server stopped successfully');
                process.exit(0);
            }
            catch (error) {
                console.error(`[ERROR] Error during shutdown: ${error}`);
                process.exit(1);
            }
        };
        console.log('[DEBUG] Step 4: Setup signal handlers');
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('[ERROR] Uncaught Exception:', error);
            console.error('[ERROR] Stack:', error.stack);
            shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[ERROR] Unhandled Rejection at:', promise);
            console.error('[ERROR] Reason:', reason);
            shutdown('unhandledRejection');
        });
        console.log('[DEBUG] Step 5: Start MCP server with stdio transport');
        // Start the MCP server with stdio transport
        await server.start();
        console.log('[DEBUG] MCP server started successfully and listening on stdio');
        console.log('[DEBUG] Step 6: Setup stdin listener');
        // Keep the process alive by listening to stdin
        process.stdin.on('data', (data) => {
            console.log(`[DEBUG] Received stdin data: ${data.toString().substring(0, 100)}...`);
            // VS Code will send JSON-RPC messages via stdin
            // The MCP server handles this internally
        });
        console.log('[DEBUG] ========== SERVER STARTUP COMPLETED ==========');
        console.log('[DEBUG] Server is ready and waiting for MCP requests via stdio');
    }
    catch (error) {
        console.error('[ERROR] ========== SERVER STARTUP FAILED ==========');
        console.error('[ERROR] Failed to start MCP server:', error);
        if (error instanceof Error) {
            console.error('[ERROR] Error message:', error.message);
            console.error('[ERROR] Stack trace:', error.stack);
        }
        console.error('[ERROR] ===============================================');
        process.exit(1);
    }
}
// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
MemorAI CBD MCP Server - Published Package

Usage:
  npx -y @codai/memorai-mcp@latest
  
Environment Variables:
  DOTENV_CONFIG_PATH           Path to .env file (default: .env)
  AZURE_OPENAI_ENDPOINT        Azure OpenAI endpoint (required)
  AZURE_OPENAI_KEY             Azure OpenAI API key (required)
  AZURE_OPENAI_API_VERSION     Azure OpenAI API version (required)
  AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT  Embedding deployment name (required)
  MEMORAI_CBD_PATH             CBD data directory (default: ./memorai-cbd-data)
  MEMORAI_LOG_LEVEL            Log level (default: info)
  MEMORAI_CACHE_SIZE           Memory cache size (default: 10000)
  MEMORAI_DIMENSIONS           Embedding dimensions (default: 1536)
  
Options:
  --help, -h             Show this help message
  --version, -v          Show version information
  
Examples:
  # Use with custom .env file
  DOTENV_CONFIG_PATH="/path/to/.env" npx @codai/memorai-mcp@latest
  
  # Use with custom CBD path
  MEMORAI_CBD_PATH="/path/to/data" npx @codai/memorai-mcp@latest
`);
    process.exit(0);
}
if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log('@codai/memorai-mcp version 8.0.0-cbd');
    process.exit(0);
}
// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server-backup.js.map