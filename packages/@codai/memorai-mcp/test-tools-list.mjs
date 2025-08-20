#!/usr/bin/env node

console.log('🧠 Testing MemorAI MCP v9.4.1 Tool List...');

import { ChildProcess, spawn } from 'child_process';

// Test the server's list_tools capability
const testToolList = () => {
    return new Promise((resolve, reject) => {
        const serverPath = './dist/server.js';
        console.log('Starting server for tool list test...');

        const server = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let toolsReceived = false;

        // Send list_tools request
        const listToolsRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
            params: {}
        };

        // Handle server output
        server.stdout.on('data', (data) => {
            const output = data.toString();

            try {
                const response = JSON.parse(output);
                if (response.id === 2 && !toolsReceived) {
                    toolsReceived = true;
                    console.log('✅ Tools list received!');
                    console.log(`📊 Total tools: ${response.result?.tools?.length || 0}`);

                    if (response.result?.tools?.length > 0) {
                        console.log('🛠️ Available tools:');
                        response.result.tools.forEach((tool, index) => {
                            console.log(`   ${index + 1}. ${tool.name}`);
                        });
                    }

                    server.kill();
                    resolve(response);
                }
            } catch (e) {
                // Not JSON, probably log output
            }
        });

        server.stderr.on('data', (data) => {
            const output = data.toString();
            if (output.includes('running successfully')) {
                // Server is ready, send the request
                setTimeout(() => {
                    console.log('Sending tools/list request...');
                    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
                }, 500);
            }
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            reject(error);
        });

        server.on('exit', (code) => {
            if (!toolsReceived) {
                reject(new Error(`Server exited with code ${code} before responding`));
            }
        });

        // Set timeout
        setTimeout(() => {
            if (!toolsReceived) {
                console.error('❌ Timeout waiting for tools list');
                server.kill();
                reject(new Error('Timeout waiting for tools list'));
            }
        }, 15000);
    });
};

try {
    const response = await testToolList();
    console.log('🏆 MemorAI MCP v9.4.1 tools verification complete!');
} catch (error) {
    console.error('❌ Tools verification failed:', error.message);
    process.exit(1);
}
