#!/usr/bin/env node
/**
 * MemorAI MCP Server Startup Script
 * Starts the HTTP/SSE MCP server for VS Code integration
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MemorAI MCP Server...');

const serverPath = path.join(__dirname, 'http-mcp-server.cjs');
const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: __dirname
});

server.on('error', (error) => {
    console.error('❌ Failed to start MemorAI MCP Server:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`🛑 MemorAI MCP Server exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MemorAI MCP Server...');
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down MemorAI MCP Server...');
    server.kill('SIGTERM');
});
