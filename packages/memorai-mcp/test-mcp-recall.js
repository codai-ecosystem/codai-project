#!/usr/bin/env node

/**
 * Test the enhanced MCP server recall functionality
 * Validates that the original failing query now works
 */

import { spawn } from 'child_process';

console.log('🔧 Testing Enhanced MCP Server Recall');
console.log('='.repeat(40));

function testMCPServer() {
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['enhanced-mcp-server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let responses = [];

        server.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const response = JSON.parse(line);
                        responses.push(response);
                        console.log('📨 Response:', JSON.stringify(response, null, 2));
                    } catch (e) {
                        // Ignore non-JSON lines
                    }
                }
            }
        });

        server.stderr.on('data', (data) => {
            console.log('📝 Server log:', data.toString());
        });

        // Wait for server to initialize
        setTimeout(() => {
            console.log('\n1️⃣ Testing tools/list...');
            server.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/list",
                id: 1
            }) + '\n');

            setTimeout(() => {
                console.log('\n2️⃣ Testing original failing recall query...');
                server.stdin.write(JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    params: {
                        name: "recall",
                        arguments: {
                            agentId: "romai_agi_agent",
                            query: "test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode"
                        }
                    },
                    id: 2
                }) + '\n');

                setTimeout(() => {
                    console.log('\n3️⃣ Testing debug info...');
                    server.stdin.write(JSON.stringify({
                        jsonrpc: "2.0",
                        method: "tools/call",
                        params: {
                            name: "debug_info",
                            arguments: {
                                agentId: "romai_agi_agent"
                            }
                        },
                        id: 3
                    }) + '\n');

                    setTimeout(() => {
                        server.kill();
                        resolve(responses);
                    }, 2000);
                }, 1000);
            }, 1000);
        }, 2000);

        server.on('error', reject);
    });
}

// Run the test
testMCPServer().then(responses => {
    console.log('\n🎯 Test Results Summary:');
    console.log('='.repeat(25));

    let success = false;

    for (const response of responses) {
        if (response.id === 2 && response.result) {
            // Check if recall returned memories
            const content = response.result.content?.[0]?.text || '';
            if (content.includes('Found') && !content.includes('No memories found')) {
                console.log('✅ SUCCESS: Original failing query now returns memories!');
                console.log(`📊 Response: ${content.substring(0, 200)}...`);
                success = true;
            }
        }
    }

    if (!success) {
        console.log('❌ FAILED: Query still not returning memories');
    }

    console.log(`\n📈 Total responses received: ${responses.length}`);

}).catch(error => {
    console.error('🚨 Test failed:', error.message);
});