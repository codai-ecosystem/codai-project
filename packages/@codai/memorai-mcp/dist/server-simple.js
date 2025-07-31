#!/usr/bin/env node
/**
 * MemorAI MCP Server - Simplified Workiconst azureEnvConfig = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT
};

const azureConfig = azureEnvConfig.endpoint && azureEnvConfig.apiKey && azureEnvConfig.embeddingDeployment ? {
    endpoint: azureEnvConfig.endpoint,
    apiKey: azureEnvConfig.apiKey,
    apiVersion: azureEnvConfig.apiVersion || '2024-02-01',
    embeddingDeployment: azureEnvConfig.embeddingDeployment,
    embeddingModel: 'text-embedding-ada-002'
} : undefined;sion
 * Based on the production server that was working correctly
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { MemorAIAdvancedServer } from './cbd-server.js';
// Use console.error for all logging (goes to stderr, visible in VS Code MCP logs)
console.error('🚀 MemorAI MCP Server starting...');
// Check for help/version first
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
    console.log('@codai/memorai-mcp version 8.0.11');
    process.exit(0);
}
// Simple environment configuration
console.error('[INIT] Configuring environment...');
const envPath = process.env.DOTENV_CONFIG_PATH;
if (envPath && existsSync(envPath)) {
    console.error(`[INIT] Loading .env from: ${envPath}`);
    config({ path: envPath });
}
else {
    console.error('[INIT] Loading default .env...');
    config();
}
// Build configuration
console.error('[INIT] Building server configuration...');
const memoraiCbdPath = process.env.MEMORAI_CBD_PATH || resolve(process.cwd(), 'memorai-cbd-data');
const azureConfig = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_ADA_DEPLOYMENT
};
const serverConfig = {
    serverName: 'MemorAI-CBD-MCP',
    version: '8.0.14',
    cbdPath: memoraiCbdPath,
    logLevel: 'debug',
    enableSemanticSearch: true,
    enablePerformanceTracking: true,
    enableHybridStorage: true,
    azureOpenAI: azureConfig.endpoint && azureConfig.apiKey ? azureConfig : undefined,
    fallbackStorage: 'json',
    embeddingModel: 'text-embedding-ada-002',
    dimensions: 1536,
    cacheSize: 10000,
    maxMemories: 100000,
    nodeEnv: 'production'
};
console.error(`[INIT] Server configured - CBD path: ${memoraiCbdPath}`);
// Start the server immediately
async function start() {
    try {
        console.error('[INIT] Creating server instance...');
        const server = new MemorAIAdvancedServer(serverConfig);
        console.error('[INIT] Starting MCP server...');
        await server.start();
        console.error('✅ MemorAI MCP Server running successfully!');
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.error('[SHUTDOWN] Graceful shutdown initiated...');
            await server.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.error('[SHUTDOWN] Graceful shutdown initiated...');
            await server.stop();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Start immediately if this file is being executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}
//# sourceMappingURL=server-simple.js.map