#!/usr/bin/env node

/**
 * Enhanced METU Backend Server - Entry Point
 * 
 * Enhanced standalone server with Azure OpenAI GPT-4o and MCP integration
 * that can run independently from the Electron app and serve both desktop 
 * and web clients with real-time voice communication and advanced AI capabilities.
 */

// Load environment variables from project root
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (2 levels up from this file)
const envPath = path.join(process.cwd(), '..', '..', '.env');
dotenv.config({ path: envPath });

console.log('🔧 Environment loaded from:', envPath);
console.log('🔑 Azure OpenAI Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
console.log('🔑 Azure AI Foundry Endpoint:', process.env.AZURE_AI_FOUNDRY_ENDPOINT);
console.log('🔑 Azure Search Endpoint:', process.env.AZURE_SEARCH_ENDPOINT);

import { createEnhancedMetuServer, EnhancedServerConfig } from './enhanced-server';

// Enhanced server configuration with new Azure AI services
const config: Partial<EnhancedServerConfig> = {
    port: parseInt(process.env.METU_SERVER_PORT || '4402'),
    host: process.env.METU_SERVER_HOST || 'localhost',
    corsOrigins: [
        'http://localhost:3000',   // Next.js dev server
        'http://localhost:4400',   // METU web app
        'http://localhost:6388',   // Electron renderer
        'file://',                 // Electron file protocol
        ...(process.env.METU_CORS_ORIGINS?.split(',') || []),
    ],
    enableWebSocket: process.env.METU_DISABLE_WS !== 'true',
    enableRateLimit: process.env.NODE_ENV === 'production',
    maxRequestsPerWindow: parseInt(process.env.METU_RATE_LIMIT || '100'),
    windowMs: parseInt(process.env.METU_RATE_WINDOW || '900000'), // 15 minutes
    azure: {
        // Use new Azure AI services endpoints and keys
        apiKey: process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY || '',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT?.replace(/"/g, '') || '',
        deploymentName: process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
        // Additional Azure AI services
        foundryEndpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT?.replace(/"/g, '') || '',
        foundryKey: process.env.AZURE_AI_FOUNDRY_KEY || '',
        searchEndpoint: process.env.AZURE_SEARCH_ENDPOINT?.replace(/"/g, '') || '',
        searchKey: process.env.AZURE_SEARCH_KEY || '',
        whisperDeployment: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT || 'whisper',
    },
};

// Create and start enhanced server
const server = createEnhancedMetuServer(config);

// Graceful shutdown handling
const shutdown = async (signal: string) => {
    console.log(`\n📨 Received ${signal}, shutting down gracefully...`);

    try {
        await server.stop();
        console.log('✅ Server stopped successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
(async () => {
    try {
        console.log('🎬 Starting Enhanced METU Backend Server...');
        console.log('📋 Configuration:', {
            port: config.port,
            host: config.host,
            webSocket: config.enableWebSocket,
            rateLimit: config.enableRateLimit,
            environment: process.env.NODE_ENV || 'development',
            azureOpenAI: {
                endpoint: config.azure?.endpoint,
                deployment: config.azure?.deploymentName,
                apiVersion: config.azure?.apiVersion,
            },
        });

        await server.start();

        console.log('✅ Enhanced METU Backend Server is ready!');
        console.log('🔗 API endpoints available at /api/*');
        console.log('🎤 Azure OpenAI GPT-4o Realtime API integrated');
        console.log('🔧 MCP Tools Manager initialized');
        console.log('💾 Database service initialized');

        if (config.enableWebSocket) {
            console.log('🔌 WebSocket server ready for real-time voice communication');
        }

        console.log('\n🚀 Enhanced server is running with AI voice capabilities!');

    } catch (error) {
        console.error('💥 Failed to start Enhanced METU Backend Server:', error);
        process.exit(1);
    }
})();
