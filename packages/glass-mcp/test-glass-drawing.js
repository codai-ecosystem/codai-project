/**
 * Test Glass MCP Drawing Tool
 * Tests the glass_drawing tool with comprehensive overlay capabilities
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const tests = [
    {
        name: 'Draw Rectangle Overlay',
        tool: 'glass_drawing',
        arguments: {
            operation: 'draw_overlay',
            overlayType: 'rectangle',
            bounds: { x: 100, y: 100, width: 200, height: 150 },
            style: { color: '#FF0000', thickness: 3, opacity: 0.8 },
            duration: 3
        }
    },
    {
        name: 'Highlight Element',
        tool: 'glass_drawing',
        arguments: {
            operation: 'highlight_element',
            bounds: { x: 300, y: 200, width: 150, height: 50 },
            highlightStyle: 'background',
            color: '#FFFF00',
            duration: 4,
            animation: false
        }
    },
    {
        name: 'Create Text Annotation',
        tool: 'glass_drawing',
        arguments: {
            operation: 'draw_annotation',
            targetPoint: { x: 500, y: 300 },
            text: 'Test annotation with arrow',
            position: 'auto',
            style: { 
                color: '#000000', 
                backgroundColor: '#FFFFE0',
                borderColor: '#808080',
                fontSize: 14
            },
            duration: 5
        }
    },
    {
        name: 'Clear All Overlays',
        tool: 'glass_drawing',
        arguments: {
            operation: 'clear_overlays'
        },
        delay: 8000 // Wait for previous overlays to be visible
    }
];

async function testGlassDrawing() {
    console.log('🎨 Testing Glass MCP Drawing Tool');
    console.log('='.repeat(50));
    
    for (const test of tests) {
        console.log(`\n📝 Running: ${test.name}`);
        
        // Wait for delay if specified
        if (test.delay) {
            console.log(`⏳ Waiting ${test.delay}ms for visual confirmation...`);
            await new Promise(resolve => setTimeout(resolve, test.delay));
        }
        
        try {
            const result = await runMCPCommand(test.tool, test.arguments);
            
            if (result && result.success !== false) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (result.overlayId) console.log(`   Overlay ID: ${result.overlayId}`);
                if (result.highlightId) console.log(`   Highlight ID: ${result.highlightId}`);
                if (result.annotationId) console.log(`   Annotation ID: ${result.annotationId}`);
                if (result.message) console.log(`   Message: ${result.message}`);
                if (result.cleared !== undefined) console.log(`   Cleared: ${result.cleared} overlays`);
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Error: ${result?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR`);
            console.log(`   Exception: ${error.message}`);
        }
        
        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎯 Glass Drawing Tool Test Complete!');
    console.log('Watch your screen for visual overlays and annotations.');
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
testGlassDrawing().catch(console.error);