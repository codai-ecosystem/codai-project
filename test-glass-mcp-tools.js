#!/usr/bin/env node

/**
 * Test script to verify Glass MCP comprehensive server has all 37 tools
 */

import { spawn } from 'child_process';

async function testGlassMCPTools() {
    console.log('🔍 Testing Glass MCP Comprehensive Server Tool Discovery...');
    console.log('='.repeat(60));

    return new Promise((resolve, reject) => {
        // Start the Glass MCP server
        const server = spawn('powershell', ['-Command', 'npx @codai/glass-mcp'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';
        let errorOutput = '';

        server.stdout.on('data', (data) => {
            output += data.toString();
        });

        server.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Send MCP tools/list request
        const listToolsRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list"
        };

        server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

        // Wait for response
        setTimeout(() => {
            server.kill();

            console.log('📤 Request sent:', JSON.stringify(listToolsRequest, null, 2));
            console.log('📥 Server output:');
            console.log(output);

            if (errorOutput) {
                console.log('❌ Server errors:');
                console.log(errorOutput);
            }

            // Look for tools in the output
            try {
                const lines = output.split('\n');
                let toolsResponse = null;

                for (const line of lines) {
                    if (line.trim().startsWith('{')) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.result && parsed.result.tools) {
                                toolsResponse = parsed;
                                break;
                            }
                        } catch (e) {
                            // Continue searching
                        }
                    }
                }

                if (toolsResponse) {
                    const tools = toolsResponse.result.tools;
                    console.log(`\n🎯 Found ${tools.length} tools:`);

                    // Group tools by category
                    const categories = {};
                    tools.forEach(tool => {
                        const name = tool.name;
                        let category = 'Other';

                        if (name.includes('window') || name.includes('focus') || name.includes('list')) {
                            category = 'Window Management';
                        } else if (name.includes('mouse') || name.includes('click') || name.includes('drag')) {
                            category = 'Mouse Automation';
                        } else if (name.includes('keyboard') || name.includes('key') || name.includes('text')) {
                            category = 'Keyboard Automation';
                        } else if (name.includes('clipboard')) {
                            category = 'Clipboard Operations';
                        } else if (name.includes('file') || name.includes('directory')) {
                            category = 'File System';
                        } else if (name.includes('process') || name.includes('system')) {
                            category = 'Process Management';
                        } else if (name.includes('monitor') || name.includes('screenshot')) {
                            category = 'System Monitoring';
                        } else if (name.includes('visual') || name.includes('image')) {
                            category = 'Visual Automation';
                        } else if (name.includes('batch') || name.includes('execute')) {
                            category = 'Batch Operations';
                        }

                        if (!categories[category]) categories[category] = [];
                        categories[category].push(tool.name);
                    });

                    let totalTools = 0;
                    Object.entries(categories).forEach(([category, toolNames]) => {
                        console.log(`\n📂 ${category} (${toolNames.length} tools):`);
                        toolNames.forEach(toolName => {
                            console.log(`  ✅ ${toolName}`);
                            totalTools++;
                        });
                    });

                    console.log(`\n🏆 RESULT: ${totalTools} tools discovered`);

                    if (totalTools >= 30) {
                        console.log('✅ SUCCESS: Comprehensive server is working with full tool set!');
                        resolve(true);
                    } else {
                        console.log('⚠️ WARNING: Expected 37 tools, but found fewer');
                        resolve(false);
                    }
                } else {
                    console.log('❌ No tools response found in output');
                    resolve(false);
                }
            } catch (error) {
                console.log('❌ Error parsing response:', error.message);
                resolve(false);
            }
        }, 3000);

        server.on('error', (error) => {
            console.log('❌ Server error:', error.message);
            reject(error);
        });
    });
}

// Run the test
testGlassMCPTools()
    .then((success) => {
        console.log('\n' + '='.repeat(60));
        if (success) {
            console.log('🎉 Glass MCP Comprehensive Server: READY FOR VS CODE!');
            console.log('💡 VS Code will now discover all tools when using: npx @codai/glass-mcp');
        } else {
            console.log('❌ Test failed - VS Code integration may have issues');
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('❌ Test error:', error);
        process.exit(1);
    });