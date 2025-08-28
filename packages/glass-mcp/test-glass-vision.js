#!/usr/bin/env node

// Test script for glass_vision tool
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'mcp-server.js');

console.log('🧪 Testing Glass MCP v11.0 with glass_vision tool...');
console.log('📁 Server path:', serverPath);

// Start the MCP server
const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: false
});

let serverReady = false;
let toolsList = [];

server.stderr.on('data', (data) => {
    const message = data.toString();
    console.log('🖥️ Server:', message.trim());

    if (message.includes('Enhanced GlassMCP Server started successfully')) {
        serverReady = true;
        console.log('✅ Server started successfully, testing tools...');
        testTools();
    }
});

server.stdout.on('data', (data) => {
    const message = data.toString();
    console.log('📤 Server Output:', message.trim());

    // Try to parse JSON responses
    try {
        const lines = message.trim().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                const parsed = JSON.parse(line);
                if (parsed.result && parsed.result.tools) {
                    toolsList = parsed.result.tools;
                    console.log('🛠️ Available tools:', toolsList.map(t => t.name).join(', '));

                    // Find glass_vision tool
                    const glassVision = toolsList.find(t => t.name === 'glass_vision');
                    if (glassVision) {
                        console.log('🎯 glass_vision tool found!');
                        console.log('📋 Operations:', glassVision.description);
                        testGlassVision();
                    } else {
                        console.log('❌ glass_vision tool not found in tools list');
                        process.exit(1);
                    }
                }
            }
        }
    } catch (e) {
        // Ignore non-JSON responses
    }
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

function testTools() {
    console.log('📋 Requesting tools list...');
    const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
    };

    server.stdin.write(JSON.stringify(request) + '\n');
}

function testGlassVision() {
    console.log('🎯 Testing glass_vision capture_screen operation...');

    const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
            name: 'glass_vision',
            arguments: {
                operation: 'capture_screen'
            }
        }
    };

    server.stdin.write(JSON.stringify(request) + '\n');

    // Test analyze_screen after a delay
    setTimeout(() => {
        console.log('🔍 Testing glass_vision analyze_screen operation...');

        const analyzeRequest = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'glass_vision',
                arguments: {
                    operation: 'analyze_screen',
                    includeScreenCapture: true,
                    includeOCR: false,  // Skip OCR for faster test
                    includeUIElements: true
                }
            }
        };

        server.stdin.write(JSON.stringify(analyzeRequest) + '\n');

        // End test after analysis
        setTimeout(() => {
            console.log('✅ Glass Vision testing complete!');
            server.kill();
            process.exit(0);
        }, 5000);

    }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Shutting down test...');
    server.kill();
    process.exit(0);
});

console.log('⏳ Starting MCP server...');