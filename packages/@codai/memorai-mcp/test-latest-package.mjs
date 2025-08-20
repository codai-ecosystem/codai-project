#!/usr/bin/env node

console.log('🧠 Testing MemorAI MCP latest package tool names...');

import { spawn } from 'child_process';

const testLatestPackage = () => {
    return new Promise((resolve, reject) => {
        console.log('📦 Starting latest @codai/memorai-mcp package...');

        const server = spawn('npx', ['-y', '@codai/memorai-mcp'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let toolsReceived = false;

        const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: { roots: { listChanged: true }, sampling: {}, elicitation: {} },
                clientInfo: { name: "Latest Package Tester", "version": "1.0.0" }
            }
        };

        const toolsRequest = {
            jsonrpc: "2.0", id: 2, method: "tools/list", params: {}
        };

        // Handle server output
        server.stdout.on('data', (data) => {
            const output = data.toString();

            try {
                const response = JSON.parse(output);

                if (response.id === 1) {
                    console.log('✅ Server initialized successfully!');
                    setTimeout(() => {
                        server.stdin.write(JSON.stringify(toolsRequest) + '\n');
                    }, 500);
                }

                if (response.id === 2 && !toolsReceived) {
                    toolsReceived = true;
                    const tools = response.result?.tools || [];
                    console.log(`📋 Tools found: ${tools.length}`);

                    console.log('\n🔧 Tool Names:');
                    tools.slice(0, 10).forEach((tool, index) => {
                        console.log(`   ${index + 1}. ${tool.name}`);
                    });

                    // Check for clean vs prefixed names
                    const cleanNames = tools.filter(t => !t.name.includes('mcp_'));
                    const prefixedNames = tools.filter(t => t.name.includes('mcp_'));

                    console.log(`\n📊 Clean names: ${cleanNames.length}, Prefixed names: ${prefixedNames.length}`);

                    if (cleanNames.length > 0) {
                        console.log('✅ Clean tool names are working!');
                    } else {
                        console.log('❌ Still using prefixed tool names');
                    }

                    server.kill();
                    resolve({ cleanNames: cleanNames.length, prefixedNames: prefixedNames.length });
                }
            } catch (e) {
                // Not JSON, probably log output
            }
        });

        server.stderr.on('data', (data) => {
            const output = data.toString();
            if (output.includes('running successfully')) {
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
    const result = await testLatestPackage();
    console.log(`\n🎯 Result: ${result.cleanNames} clean, ${result.prefixedNames} prefixed`);
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
}
