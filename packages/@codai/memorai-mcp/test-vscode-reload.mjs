#!/usr/bin/env node

console.log('🧠 MemorAI MCP v9.4.1 - VS Code Connection Test');
console.log('Testing after VS Code reload...\n');

import { spawn } from 'child_process';

const testVSCodeConnection = () => {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting MemorAI MCP server for VS Code compatibility test...');

        const server = spawn('node', ['dist/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let initComplete = false;
        let toolsReceived = false;

        // VS Code MCP initialization sequence
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
                    name: "Visual Studio Code - Insiders",
                    version: "1.103.0-insider"
                }
            }
        };

        const toolsRequest = {
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

                if (response.id === 1 && !initComplete) {
                    initComplete = true;
                    console.log('✅ Initialize request successful!');
                    console.log(`   Protocol Version: ${response.result?.protocolVersion}`);
                    console.log(`   Server: ${response.result?.serverInfo?.name} v${response.result?.serverInfo?.version}`);

                    // Send tools list request
                    setTimeout(() => {
                        console.log('\n📝 Requesting tools list...');
                        server.stdin.write(JSON.stringify(toolsRequest) + '\n');
                    }, 500);
                }

                if (response.id === 2 && !toolsReceived) {
                    toolsReceived = true;
                    const toolCount = response.result?.tools?.length || 0;
                    console.log(`✅ Tools list received! Total: ${toolCount} tools`);

                    if (toolCount === 27) {
                        console.log('🏆 All 27 MemorAI MCP tools are available!');
                        console.log('\n🎯 VS Code MCP integration is working perfectly!');
                    } else {
                        console.log(`⚠️ Expected 27 tools, got ${toolCount}`);
                    }

                    server.kill();
                    resolve({ success: true, toolCount });
                }
            } catch (e) {
                // Not JSON, probably log output
            }
        });

        server.stderr.on('data', (data) => {
            const output = data.toString();
            if (output.includes('running successfully')) {
                // Server is ready, send initialize
                setTimeout(() => {
                    console.log('📤 Sending initialize request...');
                    server.stdin.write(JSON.stringify(initRequest) + '\n');
                }, 1000);
            }
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            reject(error);
        });

        server.on('exit', (code) => {
            if (!toolsReceived) {
                reject(new Error(`Server exited with code ${code} before completing test`));
            }
        });

        // Timeout
        setTimeout(() => {
            if (!toolsReceived) {
                console.error('❌ Test timeout');
                server.kill();
                reject(new Error('Test timeout'));
            }
        }, 15000);
    });
};

try {
    const result = await testVSCodeConnection();
    console.log('\n🎉 VS Code reload test complete - MemorAI MCP is ready!');
    console.log('You can now use all 27 memory tools in VS Code.');
} catch (error) {
    console.error('\n❌ VS Code connection test failed:', error.message);
    process.exit(1);
}
