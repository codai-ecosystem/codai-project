#!/usr/bin/env node

console.log('🧠 Testing MemorAI MCP Server with MCP Protocol...');

import { ChildProcess, spawn } from 'child_process';

// Test the server with MCP protocol handshake
const testMCPHandshake = () => {
    return new Promise((resolve, reject) => {
        const serverPath = './dist/server.js';
        console.log('Starting server:', serverPath);

        const server = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let initReceived = false;
        let timeoutId;

        // Send initialize request
        const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: {
                    roots: { listChanged: true },
                    sampling: {},
                    elicitation: {}
                },
                clientInfo: {
                    name: "MemorAI MCP Test Client",
                    version: "1.0.0"
                }
            }
        };

        // Handle server output
        server.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Server output:', output);

            try {
                const response = JSON.parse(output);
                if (response.id === 1 && !initReceived) {
                    initReceived = true;
                    clearTimeout(timeoutId);
                    console.log('✅ Initialize response received!');
                    server.kill();
                    resolve(response);
                }
            } catch (e) {
                // Not JSON, probably log output
            }
        });

        server.stderr.on('data', (data) => {
            console.log('Server stderr:', data.toString());
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            clearTimeout(timeoutId);
            reject(error);
        });

        server.on('exit', (code) => {
            console.log(`Server exited with code: ${code}`);
            if (!initReceived) {
                clearTimeout(timeoutId);
                reject(new Error(`Server exited with code ${code} before responding`));
            }
        });

        // Set timeout
        timeoutId = setTimeout(() => {
            console.error('❌ Timeout waiting for initialization response');
            server.kill();
            reject(new Error('Timeout waiting for initialization'));
        }, 10000);

        // Send the initialize request
        setTimeout(() => {
            console.log('Sending initialize request...');
            server.stdin.write(JSON.stringify(initRequest) + '\n');
        }, 2000);
    });
};

try {
    const response = await testMCPHandshake();
    console.log('🏆 MCP handshake successful!', response);
} catch (error) {
    console.error('❌ MCP handshake failed:', error.message);
    process.exit(1);
}
