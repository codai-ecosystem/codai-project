#!/usr/bin/env node

/**
 * Manual Test Suite for Glass MCP Consolidated Tools
 * This test suite validates the consolidated tools functionality
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PATH = join(__dirname, '../dist/mcp-server.js');

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    async runTest(name, testFn) {
        console.log(`\n🧪 Running: ${name}`);
        try {
            await testFn();
            this.passed++;
            this.results.push({ name, status: 'PASSED', error: null });
            console.log(`✅ PASSED: ${name}`);
        } catch (error) {
            this.failed++;
            this.results.push({ name, status: 'FAILED', error: error.message });
            console.log(`❌ FAILED: ${name}`);
            console.log(`   Error: ${error.message}`);
        }
    }

    async sendMCPRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            const server = spawn('node', [SERVER_PATH], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let serverReady = false;

            server.stderr.on('data', (data) => {
                const message = data.toString();
                if (message.includes('Enhanced GlassMCP Server started successfully')) {
                    serverReady = true;

                    // Send request
                    const request = JSON.stringify({
                        jsonrpc: '2.0',
                        method,
                        id: Date.now(),
                        params
                    });

                    server.stdin.write(request + '\n');
                }
            });

            server.stdout.on('data', (data) => {
                output += data.toString();
                try {
                    const response = JSON.parse(output);
                    server.kill();
                    resolve(response);
                } catch {
                    // Continue collecting data
                }
            });

            server.on('error', (error) => {
                server.kill();
                reject(error);
            });

            setTimeout(() => {
                server.kill();
                reject(new Error('Request timeout'));
            }, 10000);
        });
    }

    summary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        if (this.failed > 0) {
            console.log('\n💥 Failed Tests:');
            this.results.filter(r => r.status === 'FAILED').forEach(result => {
                console.log(`   - ${result.name}: ${result.error}`);
            });
        }

        console.log('\n🎯 Test Results:', this.failed === 0 ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
        return this.failed === 0;
    }
}

async function runConsolidatedToolsTests() {
    const runner = new TestRunner();

    console.log('🚀 Glass MCP Consolidated Tools Test Suite');
    console.log('==========================================');

    // Test 1: Tool Discovery
    await runner.runTest('Tool Discovery', async () => {
        const response = await runner.sendMCPRequest('tools/list');

        if (!response.result || !response.result.tools) {
            throw new Error('No tools found in response');
        }

        const tools = response.result.tools;
        const toolNames = tools.map(tool => tool.name);

        // Check for consolidated tools
        if (!toolNames.includes('glass_windows')) {
            throw new Error('glass_windows tool not found');
        }
        if (!toolNames.includes('glass_clipboard')) {
            throw new Error('glass_clipboard tool not found');
        }

        // Check for legacy tools
        if (!toolNames.includes('window_list')) {
            throw new Error('Legacy window_list tool not found');
        }

        console.log(`   Found ${tools.length} tools total`);
    });

    // Test 2: glass_windows list operation
    await runner.runTest('glass_windows list operation', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'glass_windows',
            arguments: {
                operation: 'list'
            }
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        const resultText = response.result.content[0].text;
        const windows = JSON.parse(resultText);

        if (!Array.isArray(windows)) {
            throw new Error('Windows result is not an array');
        }

        console.log(`   Found ${windows.length} windows`);
    });

    // Test 3: glass_clipboard get_text operation
    await runner.runTest('glass_clipboard get_text operation', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'glass_clipboard',
            arguments: {
                operation: 'get_text'
            }
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        const resultText = response.result.content[0].text;
        const clipboardData = JSON.parse(resultText);

        if (typeof clipboardData.text !== 'string') {
            throw new Error('Clipboard text is not a string');
        }

        console.log(`   Clipboard contains: "${clipboardData.text.substring(0, 50)}..."`);
    });

    // Test 4: Legacy tool with deprecation warning
    await runner.runTest('Legacy window_list with deprecation warning', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'window_list',
            arguments: {}
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        const resultText = response.result.content[0].text;

        if (!resultText.includes('[DEPRECATION WARNING]')) {
            throw new Error('Deprecation warning not found');
        }

        if (!resultText.includes('glass_windows')) {
            throw new Error('Migration guidance not found');
        }

        console.log('   Deprecation warning properly displayed');
    });

    // Test 5: Consolidated tool parameter validation
    await runner.runTest('Parameter validation for glass_windows', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'glass_windows',
            arguments: {
                operation: 'focus'
                // Missing required 'title' parameter
            }
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        const resultText = response.result.content[0].text;

        if (!response.result.isError) {
            throw new Error('Expected error response for missing parameter');
        }

        const errorData = JSON.parse(resultText);
        if (!errorData.error.includes('Missing required parameter: title')) {
            throw new Error('Expected parameter validation error');
        }

        console.log('   Parameter validation working correctly');
    });

    // Test 6: Unknown operation handling
    await runner.runTest('Unknown operation handling', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'glass_windows',
            arguments: {
                operation: 'invalid_operation'
            }
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        if (!response.result.isError) {
            throw new Error('Expected error response for invalid operation');
        }

        const errorData = JSON.parse(response.result.content[0].text);
        if (!errorData.error.includes('Unknown operation: invalid_operation')) {
            throw new Error('Expected unknown operation error');
        }

        console.log('   Unknown operation handling working correctly');
    });

    // Test 7: System info tool (non-consolidated)
    await runner.runTest('System info tool', async () => {
        const response = await runner.sendMCPRequest('tools/call', {
            name: 'system_info',
            arguments: {}
        });

        if (!response.result || !response.result.content) {
            throw new Error('No content in response');
        }

        const resultText = response.result.content[0].text;
        const systemInfo = JSON.parse(resultText);

        if (!systemInfo.computerName || !systemInfo.userName) {
            throw new Error('System info missing expected fields');
        }

        console.log(`   System: ${systemInfo.computerName} (${systemInfo.userName})`);
    });

    const success = runner.summary();
    process.exit(success ? 0 : 1);
}

runConsolidatedToolsTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
});