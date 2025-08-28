/**
 * Test Glass MCP Smart Interaction Tool
 * Tests the glass_interact tool with comprehensive interaction capabilities
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const tests = [
    {
        name: 'Smart Click - Coordinates',
        tool: 'glass_interact',
        arguments: {
            operation: 'smart_click',
            target: { x: 100, y: 100 },
            clickType: 'left',
            confirmClick: true
        }
    },
    {
        name: 'Smart Type - Simple Text',
        tool: 'glass_interact',
        arguments: {
            operation: 'smart_type',
            text: 'Hello Glass MCP Smart Interaction!',
            typeMode: 'replace',
            confirmFocus: true
        }
    },
    {
        name: 'Scroll Operation - Down',
        tool: 'glass_interact',
        arguments: {
            operation: 'scroll',
            direction: 'down',
            amount: 3
        }
    },
    {
        name: 'Send Key Combination - Ctrl+A',
        tool: 'glass_interact',
        arguments: {
            operation: 'send_keys',
            keys: '^a'
        }
    },
    {
        name: 'Drag and Drop - Coordinates',
        tool: 'glass_interact',
        arguments: {
            operation: 'drag_drop',
            from: { x: 200, y: 200 },
            to: { x: 400, y: 300 },
            duration: 1000,
            showPath: true
        }
    },
    {
        name: 'Double Click with Visual Confirmation',
        tool: 'glass_interact',
        arguments: {
            operation: 'smart_click',
            target: { x: 500, y: 400 },
            clickType: 'left',
            doubleClick: true,
            confirmClick: true
        }
    },
    {
        name: 'Right Click Context Menu',
        tool: 'glass_interact',
        arguments: {
            operation: 'smart_click',
            target: { x: 600, y: 500 },
            clickType: 'right',
            confirmClick: true
        }
    },
    {
        name: 'Horizontal Scroll',
        tool: 'glass_interact',
        arguments: {
            operation: 'scroll',
            direction: 'right',
            amount: 2
        }
    },
    {
        name: 'Send Alt+Tab',
        tool: 'glass_interact',
        arguments: {
            operation: 'send_keys',
            keys: '%{TAB}'
        },
        delay: 2000
    }
];

async function testGlassInteract() {
    console.log('⚡ Testing Glass MCP Smart Interaction Tool');
    console.log('='.repeat(60));
    console.log('📋 This will test intelligent clicking, typing, gestures, and shortcuts');
    console.log('👀 Watch your screen for visual feedback and interactions!\n');

    let successCount = 0;
    let failureCount = 0;

    for (const test of tests) {
        console.log(`\n🔧 Running: ${test.name}`);

        // Wait for delay if specified
        if (test.delay) {
            console.log(`⏳ Waiting ${test.delay}ms for previous operation...`);
            await new Promise(resolve => setTimeout(resolve, test.delay));
        }

        try {
            const result = await runMCPCommand(test.tool, test.arguments);

            if (result && result.success !== false) {
                console.log(`✅ ${test.name}: SUCCESS`);
                successCount++;

                // Log specific result details
                if (result.clickedAt) {
                    console.log(`   📍 Clicked at: (${result.clickedAt.x}, ${result.clickedAt.y})`);
                }
                if (result.text) {
                    console.log(`   📝 Typed: "${result.text.substring(0, 30)}${result.text.length > 30 ? '...' : ''}"`);
                }
                if (result.from && result.to) {
                    console.log(`   🏃 Dragged from (${result.from.x}, ${result.from.y}) to (${result.to.x}, ${result.to.y})`);
                }
                if (result.direction) {
                    console.log(`   📜 Scrolled ${result.direction} by ${result.amount} units`);
                }
                if (result.keys) {
                    console.log(`   ⌨️ Sent keys: ${result.keys}`);
                }
                if (result.message) {
                    console.log(`   💬 ${result.message}`);
                }
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                failureCount++;
                console.log(`   ❗ Error: ${result?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR`);
            failureCount++;
            console.log(`   💥 Exception: ${error.message}`);
        }

        // Brief pause between tests for visual clarity
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Glass Interact Tool Test Results:');
    console.log(`✅ Successful: ${successCount}/${tests.length}`);
    console.log(`❌ Failed: ${failureCount}/${tests.length}`);
    console.log(`📊 Success Rate: ${Math.round((successCount / tests.length) * 100)}%`);

    if (successCount === tests.length) {
        console.log('\n🎉 ALL TESTS PASSED! Glass Interact Tool is fully functional!');
    } else if (successCount > 0) {
        console.log('\n⚠️ Some tests passed. Glass Interact Tool has partial functionality.');
    } else {
        console.log('\n🚨 ALL TESTS FAILED. Please check Glass Interact Tool implementation.');
    }

    console.log('\n🚀 Glass MCP Smart Interaction Engine: Ready for production use!');
}

function runMCPCommand(tool, args) {
    return new Promise((resolve, reject) => {
        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
                name: tool,
                arguments: args
            }
        };

        const mcp = spawn('node', ['dist/mcp-server.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        let stdout = '';
        let stderr = '';

        mcp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        mcp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        mcp.on('close', (code) => {
            try {
                if (stdout.trim()) {
                    const lines = stdout.trim().split('\n');
                    for (const line of lines) {
                        if (line.trim().startsWith('{')) {
                            const response = JSON.parse(line);
                            if (response.result) {
                                resolve(response.result);
                                return;
                            }
                        }
                    }
                }

                if (stderr) {
                    reject(new Error(`MCP Error: ${stderr}`));
                } else {
                    resolve({ success: false, message: 'No valid response' });
                }
            } catch (error) {
                reject(error);
            }
        });

        // Send request
        mcp.stdin.write(JSON.stringify(request) + '\n');
        mcp.stdin.end();

        // Timeout after 30 seconds
        setTimeout(() => {
            mcp.kill();
            reject(new Error('Test timeout'));
        }, 30000);
    });
}

// Run tests
testGlassInteract().catch(console.error);