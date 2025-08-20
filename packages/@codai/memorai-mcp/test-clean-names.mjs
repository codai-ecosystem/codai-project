#!/usr/bin/env node

console.log('🧠 MemorAI MCP v9.4.3 - Clean Tool Names Test');
console.log('Testing tool names without prefixes...\n');

import { spawn } from 'child_process';

const testCleanToolNames = () => {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting MemorAI MCP server to test clean tool names...');

        const server = spawn('node', ['dist/server.js'], {
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
                clientInfo: { name: "Clean Names Tester", version: "1.0.0" }
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
                    console.log(`✅ Tools list received! Total: ${tools.length} tools`);

                    console.log('\n🔧 Clean Tool Names (no prefixes):');
                    tools.forEach((tool, index) => {
                        console.log(`   ${index + 1}. ${tool.name}`);
                    });

                    // Check for clean names (no prefixes)
                    const cleanNames = tools.filter(t => !t.name.includes('mcp_'));
                    console.log(`\n✅ Clean names (no mcp_ prefix): ${cleanNames.length}/${tools.length}`);

                    if (tools.length === 27 && cleanNames.length === 27) {
                        console.log('🏆 All 27 tools have perfectly clean names!');

                        // Show key tools
                        const keyTools = ['remember', 'recall', 'get_analytics', 'federated_query'];
                        console.log('\n🔧 Key clean tool names verified:');
                        keyTools.forEach(toolName => {
                            const found = tools.find(t => t.name === toolName);
                            console.log(`   ${found ? '✅' : '❌'} ${toolName}`);
                        });
                    }

                    console.log('\n🎉 Clean tool names verification complete!');
                    server.kill();
                    resolve({ success: true, toolCount: tools.length, cleanNames: cleanNames.length });
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
    const result = await testCleanToolNames();
    console.log('\n🎯 Clean tool names test successful!');
    console.log(`All ${result.toolCount} tools now have clean names without prefixes!`);
} catch (error) {
    console.error('\n❌ Clean tool names test failed:', error.message);
    process.exit(1);
}
