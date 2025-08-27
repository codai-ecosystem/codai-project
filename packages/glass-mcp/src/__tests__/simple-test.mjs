#!/usr/bin/env node

/**
 * Simple MCP Server Test
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
    console.log('🧪 Testing MCP Server Communication...');
    
    const server = spawn('node', [join(__dirname, '../dist/mcp-server.js')], {
        stdio: ['pipe', 'pipe', 'inherit']
    });

    // Send initialize request
    const initRequest = {
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1,
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {}
            },
            clientInfo: {
                name: 'test-client',
                version: '1.0.0'
            }
        }
    };

    let responseData = '';

    server.stdout.on('data', (data) => {
        responseData += data.toString();
        console.log('📨 Raw Response:', data.toString().trim());
        
        try {
            const lines = responseData.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const response = JSON.parse(lastLine);
            
            if (response.id === 1) {
                console.log('✅ Initialize Response:', JSON.stringify(response, null, 2));
                
                // Send tools/list request
                const toolsRequest = {
                    jsonrpc: '2.0',
                    method: 'tools/list',
                    id: 2,
                    params: {}
                };
                
                server.stdin.write(JSON.stringify(toolsRequest) + '\n');
            } else if (response.id === 2) {
                console.log('✅ Tools List Response:', JSON.stringify(response, null, 2));
                
                // Check for our consolidated tools
                const tools = response.result?.tools || [];
                const hasGlassWindows = tools.some(t => t.name === 'glass_windows');
                const hasGlassClipboard = tools.some(t => t.name === 'glass_clipboard');
                const hasLegacyTools = tools.some(t => t.name === 'window_list');
                
                console.log(`\n📊 Tool Analysis:`);
                console.log(`   Total tools: ${tools.length}`);
                console.log(`   glass_windows: ${hasGlassWindows ? '✅' : '❌'}`);
                console.log(`   glass_clipboard: ${hasGlassClipboard ? '✅' : '❌'}`);
                console.log(`   Legacy tools: ${hasLegacyTools ? '✅' : '❌'}`);
                
                server.kill();
                
                if (hasGlassWindows && hasGlassClipboard && hasLegacyTools) {
                    console.log('\n🎉 SUCCESS: All expected tools found!');
                    process.exit(0);
                } else {
                    console.log('\n❌ FAILURE: Missing expected tools');
                    process.exit(1);
                }
            }
        } catch (e) {
            // Not valid JSON yet, continue collecting
        }
    });

    server.on('error', (error) => {
        console.error('❌ Server error:', error);
        process.exit(1);
    });

    // Send initialize request
    console.log('📤 Sending initialize request...');
    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // Timeout after 10 seconds
    setTimeout(() => {
        console.log('⏰ Test timeout');
        server.kill();
        process.exit(1);
    }, 10000);
}

testMCPServer().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});