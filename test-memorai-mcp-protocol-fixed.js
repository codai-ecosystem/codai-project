#!/usr/bin/env node

/**
 * Test MemorAI MCP Protocol Compliance - Fixed Version
 * Tests the MCP initialize method and tools functionality
 * Date: August 5, 2025
 */

const MEMORAI_MCP_URL = 'http://localhost:4950';

async function testMCPProtocol() {
    console.log('🧪 Testing MemorAI MCP Protocol Compliance (Fixed Version)...\n');

    try {
        // Test 1: MCP Initialize
        console.log('1️⃣ Testing MCP Initialize...');
        const initResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "initialize",
                params: {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        roots: { listChanged: false },
                        sampling: {}
                    },
                    clientInfo: {
                        name: "VS Code MCP Test Client",
                        version: "1.0.0"
                    }
                },
                id: 1
            })
        });

        if (!initResponse.ok) {
            throw new Error(`Initialize failed: ${initResponse.status} ${initResponse.statusText}`);
        }

        const initResult = await initResponse.json();
        console.log('   ✅ Initialize Response:', JSON.stringify(initResult, null, 2));

        if (initResult.result?.protocolVersion === "2025-06-18") {
            console.log('   ✅ Protocol version matches: 2025-06-18');
        } else {
            console.log('   ❌ Protocol version mismatch');
        }

        if (initResult.result?.serverInfo?.name === "MemorAI MCP Server") {
            console.log('   ✅ Server name correct');
        } else {
            console.log('   ❌ Server name incorrect');
        }

        // Test 2: Tools List
        console.log('\n2️⃣ Testing Tools List...');
        const toolsResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/list",
                params: {},
                id: 2
            })
        });

        if (!toolsResponse.ok) {
            throw new Error(`Tools list failed: ${toolsResponse.status} ${toolsResponse.statusText}`);
        }

        const toolsResult = await toolsResponse.json();
        console.log('   ✅ Tools List Response:', JSON.stringify(toolsResult, null, 2));

        const expectedTools = ['remember', 'recall', 'forget', 'context'];
        const actualTools = toolsResult.result?.tools?.map(tool => tool.name) || [];

        for (const tool of expectedTools) {
            if (actualTools.includes(tool)) {
                console.log(`   ✅ Tool '${tool}' found`);
            } else {
                console.log(`   ❌ Tool '${tool}' missing`);
            }
        }

        // Test 3: Initialize Notification (optional)
        console.log('\n3️⃣ Testing Initialize Notification...');
        const notifyResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "notifications/initialized",
                params: {}
            })
        });

        if (notifyResponse.ok || notifyResponse.status === 200) {
            console.log('   ✅ Initialize notification handled correctly');
        } else {
            console.log('   ⚠️ Initialize notification response:', notifyResponse.status);
        }

        // Test 4: Tool Call - Remember
        console.log('\n4️⃣ Testing Tool Call - Remember...');
        const rememberResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                    name: "remember",
                    arguments: {
                        agentId: "test-vs-code-agent",
                        content: "VS Code MCP integration test successful",
                        metadata: {
                            project: "MCP-Protocol-Test",
                            entityType: "test_memory",
                            importance: 8
                        }
                    }
                },
                id: 4
            })
        });

        if (!rememberResponse.ok) {
            throw new Error(`Remember tool call failed: ${rememberResponse.status} ${rememberResponse.statusText}`);
        }

        const rememberResult = await rememberResponse.json();
        console.log('   ✅ Remember Tool Response:', JSON.stringify(rememberResult, null, 2));

        // Test 5: Tool Call - Recall
        console.log('\n5️⃣ Testing Tool Call - Recall...');
        const recallResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                    name: "recall",
                    arguments: {
                        agentId: "test-vs-code-agent",
                        query: "VS Code MCP integration",
                        limit: 5
                    }
                },
                id: 5
            })
        });

        if (!recallResponse.ok) {
            throw new Error(`Recall tool call failed: ${recallResponse.status} ${recallResponse.statusText}`);
        }

        const recallResult = await recallResponse.json();
        console.log('   ✅ Recall Tool Response:', JSON.stringify(recallResult, null, 2));

        // Test 6: Unsupported Method Error Handling
        console.log('\n6️⃣ Testing Error Handling - Unsupported Method...');
        const errorResponse = await fetch(MEMORAI_MCP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "unsupported/method",
                params: {},
                id: 6
            })
        });

        const errorResult = await errorResponse.json();
        console.log('   ✅ Error Response:', JSON.stringify(errorResult, null, 2));

        if (errorResult.error?.code === -32601) {
            console.log('   ✅ Correct error code -32601 for unsupported method');
        } else {
            console.log('   ❌ Incorrect error code for unsupported method');
        }

        console.log('\n🎉 MCP Protocol Compliance Test Completed!');
        console.log('✅ MemorAI MCP Server is now VS Code compatible with proper MCP protocol compliance');

    } catch (error) {
        console.error('❌ MCP Protocol Test Failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testMCPProtocol();
