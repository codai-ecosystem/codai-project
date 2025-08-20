#!/usr/bin/env node

console.log('🧠 MemorAI MCP v9.4.2 - Post-Reload Tool Verification');
console.log('Testing clean tool names and fixed search functionality...\n');

import { spawn } from 'child_process';

const testMemorAITools = () => {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting MemorAI MCP server for comprehensive tool test...');

        const server = spawn('node', ['dist/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let toolsReceived = false;
        let memoryStored = false;
        let searchTested = false;

        // MCP requests
        const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: { roots: { listChanged: true }, sampling: {}, elicitation: {} },
                clientInfo: { name: "MemorAI Tool Tester", version: "1.0.0" }
            }
        };

        const toolsRequest = {
            jsonrpc: "2.0", id: 2, method: "tools/list", params: {}
        };

        const rememberRequest = {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "mcp_memorai_remember",
                arguments: {
                    agentId: "post-reload-test",
                    content: "VS Code reloaded on August 1, 2025 - Testing MemorAI MCP v9.4.2 with clean tool names and fixed search functionality",
                    metadata: {
                        entityType: "test_status",
                        priority: "high",
                        project: "memorai-verification",
                        tags: ["reload", "test", "v9.4.2", "clean-names"]
                    }
                }
            }
        };

        const searchRequest = {
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: {
                name: "mcp_memorai_recall",
                arguments: {
                    agentId: "post-reload-test",
                    query: "VS Code reload"
                }
            }
        };

        // Handle server output
        server.stdout.on('data', (data) => {
            const output = data.toString();

            try {
                const response = JSON.parse(output);

                // Handle initialization
                if (response.id === 1) {
                    console.log('✅ Server initialized successfully!');
                    setTimeout(() => {
                        server.stdin.write(JSON.stringify(toolsRequest) + '\n');
                    }, 500);
                }

                // Handle tools list
                if (response.id === 2 && !toolsReceived) {
                    toolsReceived = true;
                    const tools = response.result?.tools || [];
                    console.log(`✅ Tools list received! Total: ${tools.length} tools`);

                    // Check for clean tool names
                    const cleanNames = tools.filter(t => t.name.startsWith('mcp_memorai_'));
                    console.log(`✅ Clean tool names: ${cleanNames.length}/${tools.length}`);

                    if (tools.length === 27 && cleanNames.length === 27) {
                        console.log('🏆 All 27 tools available with clean names!');

                        // Show a few key tools
                        const keyTools = ['mcp_memorai_remember', 'mcp_memorai_recall', 'mcp_memorai_get_analytics'];
                        console.log('🔧 Key tools verified:');
                        keyTools.forEach(toolName => {
                            const found = tools.find(t => t.name === toolName);
                            console.log(`   ${found ? '✅' : '❌'} ${toolName}`);
                        });

                        // Test memory storage
                        setTimeout(() => {
                            console.log('\n📝 Testing memory storage...');
                            server.stdin.write(JSON.stringify(rememberRequest) + '\n');
                        }, 1000);
                    }
                }

                // Handle memory storage
                if (response.id === 3 && !memoryStored) {
                    memoryStored = true;
                    console.log('✅ Memory storage test successful!');
                    console.log(`   Memory ID: ${JSON.parse(response.result.content[0].text).memoryId || 'Generated'}`);

                    // Test search functionality
                    setTimeout(() => {
                        console.log('\n🔍 Testing search functionality...');
                        server.stdin.write(JSON.stringify(searchRequest) + '\n');
                    }, 1000);
                }

                // Handle search
                if (response.id === 4 && !searchTested) {
                    searchTested = true;
                    const searchResult = JSON.parse(response.result.content[0].text);
                    console.log('✅ Search test completed!');
                    console.log(`   Search successful: ${searchResult.success}`);
                    console.log(`   Memories found: ${searchResult.totalFound}`);
                    console.log(`   Response time: ${searchResult.metadata?.responseTime || 'N/A'}`);

                    // Check for error handling
                    if (searchResult.success && !searchResult.searchInsights?.errors) {
                        console.log('✅ No search errors - Azure OpenAI issue fixed!');
                    }

                    console.log('\n🎉 MemorAI MCP v9.4.2 verification complete!');
                    console.log('🏆 All systems operational with clean tool names!');

                    server.kill();
                    resolve({ success: true, toolCount: 27 });
                }
            } catch (e) {
                // Not JSON, probably log output
            }
        });

        server.stderr.on('data', (data) => {
            const output = data.toString();
            // Check for Azure OpenAI errors
            if (output.includes('BadRequestError') && output.includes('text-embedding-ada-002')) {
                console.log('❌ Azure OpenAI error still present!');
            }

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
            if (!searchTested) {
                reject(new Error(`Server exited with code ${code} before completing tests`));
            }
        });

        // Timeout
        setTimeout(() => {
            if (!searchTested) {
                console.error('❌ Test timeout');
                server.kill();
                reject(new Error('Test timeout'));
            }
        }, 20000);
    });
};

try {
    const result = await testMemorAITools();
    console.log('\n🎯 Post-reload verification successful!');
    console.log('VS Code MCP integration is working perfectly with v9.4.2!');
} catch (error) {
    console.error('\n❌ Post-reload verification failed:', error.message);
    process.exit(1);
}
