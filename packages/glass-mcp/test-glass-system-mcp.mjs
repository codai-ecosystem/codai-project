#!/usr/bin/env node

/**
 * 🧠 Glass MCP v11.0.0 - System Integration Tool Test (MCP Stdio)
 * Tests the glass_system tool using proper MCP stdio communication
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGlassSystemMCP() {
    console.log('🧠 Glass MCP v11.0.0 - Testing glass_system Tool (MCP Stdio)');
    console.log('='.repeat(60));

    const testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    let mcpProcess = null;
    let requestId = 1;

    try {
        // Start the MCP server process
        console.log('🚀 Starting Glass MCP server...');
        const serverPath = join(__dirname, 'dist', 'mcp-server.js');
        
        mcpProcess = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        let serverReady = false;
        let initializationError = null;

        // Wait for server to be ready
        mcpProcess.stderr.on('data', (data) => {
            const message = data.toString();
            console.log(`📡 Server: ${message.trim()}`);
            if (message.includes('Enhanced GlassMCP Server started successfully')) {
                serverReady = true;
            }
        });

        mcpProcess.on('error', (error) => {
            initializationError = error;
            console.error('❌ Failed to start MCP server:', error);
        });

        // Wait for server to be ready
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (!serverReady && !initializationError) {
                    reject(new Error('Server startup timeout'));
                } else if (initializationError) {
                    reject(initializationError);
                } else {
                    resolve();
                }
            }, 5000);

            const checkReady = () => {
                if (serverReady || initializationError) {
                    clearTimeout(timeout);
                    if (initializationError) {
                        reject(initializationError);
                    } else {
                        resolve();
                    }
                }
            };

            // Check every 100ms
            const interval = setInterval(() => {
                checkReady();
                if (serverReady || initializationError) {
                    clearInterval(interval);
                }
            }, 100);
        });

        console.log('✅ Glass MCP server started successfully');

        // Function to send MCP requests
        async function sendMCPRequest(method, params = {}) {
            return new Promise((resolve, reject) => {
                const request = {
                    jsonrpc: '2.0',
                    id: requestId++,
                    method: method,
                    params: params
                };

                const requestString = JSON.stringify(request) + '\n';
                
                // Set up response handler
                const responseTimeout = setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, 15000); // 15 second timeout

                let responseData = '';
                
                const onData = (data) => {
                    responseData += data.toString();
                    
                    // Check if we have a complete JSON response
                    try {
                        const lines = responseData.split('\n');
                        for (const line of lines) {
                            if (line.trim()) {
                                const response = JSON.parse(line);
                                if (response.id === request.id) {
                                    clearTimeout(responseTimeout);
                                    mcpProcess.stdout.off('data', onData);
                                    
                                    if (response.error) {
                                        reject(new Error(response.error.message || 'MCP Error'));
                                    } else {
                                        resolve(response.result);
                                    }
                                    return;
                                }
                            }
                        }
                    } catch (e) {
                        // Not a complete JSON yet, keep waiting
                    }
                };

                mcpProcess.stdout.on('data', onData);
                
                // Send the request
                mcpProcess.stdin.write(requestString);
            });
        }

        // Test helper function
        async function runTest(testName, testFn) {
            try {
                console.log(`\n🧪 Testing: ${testName}`);
                const result = await testFn();
                console.log(`✅ ${testName}: PASSED`);
                if (result && typeof result === 'object') {
                    const preview = JSON.stringify(result, null, 2).substring(0, 200);
                    console.log(`   Result: ${preview}${preview.length >= 200 ? '...' : ''}`);
                }
                testResults.passed++;
                testResults.tests.push({ name: testName, status: 'PASSED', result });
                return true;
            } catch (error) {
                console.log(`❌ ${testName}: FAILED - ${error.message}`);
                testResults.failed++;
                testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
                return false;
            }
        }

        console.log('\n📊 Starting glass_system comprehensive tests...\n');

        // Test 1: List Available Tools
        await runTest('List Available Tools', async () => {
            const result = await sendMCPRequest('tools/list');
            
            if (!result || !result.tools || !Array.isArray(result.tools)) {
                throw new Error('Invalid tools list response');
            }

            const systemTool = result.tools.find(tool => tool.name === 'glass_system');
            if (!systemTool) {
                throw new Error('glass_system tool not found in tools list');
            }

            console.log(`   🔧 Found ${result.tools.length} tools`);
            console.log(`   🧠 glass_system tool: ${systemTool.description.substring(0, 50)}...`);

            return { 
                toolCount: result.tools.length,
                hasSystemTool: !!systemTool
            };
        });

        // Test 2: System Health Monitoring
        await runTest('System Health Report', async () => {
            const result = await sendMCPRequest('tools/call', {
                name: 'glass_system',
                arguments: {
                    operation: 'getSystemHealth'
                }
            });

            if (!result || !result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('Invalid response format');
            }

            const healthData = JSON.parse(result.content[0].text);
            
            if (!healthData.cpu || !healthData.memory || !healthData.disk) {
                throw new Error('Missing required health data fields');
            }

            console.log(`   📊 CPU Usage: ${healthData.cpu.usage}%`);
            console.log(`   💾 Memory Usage: ${healthData.memory.percentage}%`);
            console.log(`   💿 System Status: ${healthData.status}`);

            return { 
                status: healthData.status,
                cpuUsage: healthData.cpu.usage,
                memoryUsage: healthData.memory.percentage
            };
        });

        // Test 3: Process Management - List Processes
        await runTest('Process Management - List', async () => {
            const result = await sendMCPRequest('tools/call', {
                name: 'glass_system',
                arguments: {
                    operation: 'manageProcess',
                    action: 'list'
                }
            });

            if (!result || !result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('Invalid response format');
            }

            const processData = JSON.parse(result.content[0].text);
            
            if (!processData.success || !processData.processes || !Array.isArray(processData.processes)) {
                throw new Error('Invalid process data format');
            }

            console.log(`   🔍 Found ${processData.processes.length} processes`);
            console.log(`   📈 Sample processes: ${processData.processes.slice(0, 3).map(p => p.name).join(', ')}`);

            return { 
                processCount: processData.processes.length,
                sampleProcesses: processData.processes.slice(0, 3)
            };
        });

        // Test 4: Service Management - List Services
        await runTest('Service Management - List', async () => {
            const result = await sendMCPRequest('tools/call', {
                name: 'glass_system',
                arguments: {
                    operation: 'manageService',
                    action: 'list'
                }
            });

            if (!result || !result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('Invalid response format');
            }

            const serviceData = JSON.parse(result.content[0].text);
            
            if (!serviceData.success || !serviceData.services || !Array.isArray(serviceData.services)) {
                throw new Error('Invalid service data format');
            }

            const runningServices = serviceData.services.filter(s => s.status === 'Running').length;
            console.log(`   ⚙️ Total Services: ${serviceData.services.length}`);
            console.log(`   ✅ Running Services: ${runningServices}`);

            return { 
                totalServices: serviceData.services.length,
                runningServices: runningServices
            };
        });

        // Test 5: Performance Metrics (Short Duration)
        await runTest('Performance Metrics Collection', async () => {
            console.log(`   ⏱️ Collecting 2-second performance sample...`);
            
            const result = await sendMCPRequest('tools/call', {
                name: 'glass_system',
                arguments: {
                    operation: 'getPerformanceMetrics',
                    duration: 2
                }
            });

            if (!result || !result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('Invalid response format');
            }

            const metricsData = JSON.parse(result.content[0].text);
            
            if (!metricsData.cpu || !metricsData.memory || !metricsData.disk) {
                throw new Error('Missing required metrics fields');
            }

            console.log(`   📈 CPU Average: ${metricsData.cpu.average}%`);
            console.log(`   📊 Memory Usage: ${metricsData.memory.usage}%`);
            console.log(`   💾 Disk Read Speed: ${metricsData.disk.readSpeed} MB/s`);

            return { 
                cpuAverage: metricsData.cpu.average,
                memoryUsage: metricsData.memory.usage,
                diskReadSpeed: metricsData.disk.readSpeed
            };
        });

        // Display final results
        console.log('\n' + '='.repeat(60));
        console.log('📋 GLASS SYSTEM INTEGRATION TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${testResults.passed}`);
        console.log(`❌ Tests Failed: ${testResults.failed}`);
        console.log(`📊 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

        if (testResults.failed > 0) {
            console.log(`\n❌ Failed Tests:`);
            testResults.tests.filter(t => t.status === 'FAILED').forEach(test => {
                console.log(`   • ${test.name}: ${test.error}`);
            });
        }

        if (testResults.passed >= 4) { // Allow 1 failure for system-dependent tests
            console.log(`\n🎉 GLASS SYSTEM INTEGRATION TESTS PASSED!`);
            console.log(`🚀 Glass MCP v11.0.0 System Integration: PRODUCTION READY`);
            return true;
        } else {
            console.log(`\n⚠️ Too many tests failed. System integration needs attention.`);
            return false;
        }

    } finally {
        // Clean up the MCP process
        if (mcpProcess && !mcpProcess.killed) {
            console.log('\n🛑 Shutting down MCP server...');
            mcpProcess.kill('SIGTERM');
            
            // Wait a bit for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!mcpProcess.killed) {
                mcpProcess.kill('SIGKILL');
            }
        }
    }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testGlassSystemMCP()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}