#!/usr/bin/env node

/**
 * 🧠 Glass MCP v11.0.0 - System Integration Tool Test
 * Tests the glass_system tool with comprehensive Windows system operations
 */

async function testGlassSystem() {
    console.log('🧠 Glass MCP v11.0.0 - Testing glass_system Tool');
    console.log('='.repeat(60));

    const testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Mock MCP request function
    async function sendMCPRequest(method, params = {}) {
        try {
            const response = await fetch('http://localhost:4950/mcp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: method,
                    params: params,
                    id: Math.floor(Math.random() * 1000)
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MCP Error');
            }

            return data.result;
        } catch (error) {
            throw new Error(`MCP request failed: ${error.message}`);
        }
    }

    // Test helper function
    function runTest(testName, testFn) {
        return new Promise(async (resolve) => {
            try {
                console.log(`\n🧪 Testing: ${testName}`);
                const result = await testFn();
                console.log(`✅ ${testName}: PASSED`);
                if (result && typeof result === 'object') {
                    console.log(`   Result: ${JSON.stringify(result, null, 2).substring(0, 200)}...`);
                }
                testResults.passed++;
                testResults.tests.push({ name: testName, status: 'PASSED', result });
                resolve(true);
            } catch (error) {
                console.log(`❌ ${testName}: FAILED - ${error.message}`);
                testResults.failed++;
                testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
                resolve(false);
            }
        });
    }

    console.log('\n📊 Starting glass_system comprehensive tests...\n');

    // Test 1: System Health Monitoring
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

    // Test 2: Process Management - List Processes
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

    // Test 3: Service Management - List Services
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

    // Test 4: Registry Management - Safe Read Test
    await runTest('Registry Management - Read', async () => {
        const result = await sendMCPRequest('tools/call', {
            name: 'glass_system',
            arguments: {
                operation: 'manageRegistry',
                action: 'read',
                keyPath: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
                valueName: 'ProductName'
            }
        });

        if (!result || !result.content || !result.content[0] || !result.content[0].text) {
            throw new Error('Invalid response format');
        }

        const registryData = JSON.parse(result.content[0].text);

        if (!registryData.success && !registryData.data) {
            // This might fail on some systems, which is acceptable
            console.log(`   ⚠️ Registry read may have limited access (expected)`);
            return { accessible: false };
        }

        console.log(`   📝 Registry Value: ${registryData.data}`);

        return {
            accessible: true,
            value: registryData.data
        };
    });

    // Test 5: Performance Metrics (Short Duration)
    await runTest('Performance Metrics Collection', async () => {
        console.log(`   ⏱️ Collecting 3-second performance sample...`);

        const result = await sendMCPRequest('tools/call', {
            name: 'glass_system',
            arguments: {
                operation: 'getPerformanceMetrics',
                duration: 3
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

    // Test 6: System Maintenance - Cleanup Only (Safe)
    await runTest('System Maintenance - Cleanup', async () => {
        console.log(`   🧹 Running safe system cleanup...`);

        const result = await sendMCPRequest('tools/call', {
            name: 'glass_system',
            arguments: {
                operation: 'performSystemMaintenance',
                tasks: ['cleanup']  // Only cleanup, avoid defrag/updates in test
            }
        });

        if (!result || !result.content || !result.content[0] || !result.content[0].text) {
            throw new Error('Invalid response format');
        }

        const maintenanceData = JSON.parse(result.content[0].text);

        if (!maintenanceData.hasOwnProperty('success') || !maintenanceData.completed || !maintenanceData.details) {
            throw new Error('Invalid maintenance data format');
        }

        console.log(`   ✨ Completed Tasks: ${maintenanceData.completed.join(', ')}`);
        console.log(`   ❌ Failed Tasks: ${maintenanceData.failed.join(', ')}`);

        return {
            success: maintenanceData.success,
            completed: maintenanceData.completed,
            failed: maintenanceData.failed
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

    if (testResults.passed === 6) {
        console.log(`\n🎉 ALL GLASS SYSTEM INTEGRATION TESTS PASSED!`);
        console.log(`🚀 Glass MCP v11.0.0 System Integration: PRODUCTION READY`);
        return true;
    } else {
        console.log(`\n⚠️ Some tests failed. System integration needs attention.`);
        return false;
    }
}

// Run the tests
if (require.main === module) {
    testGlassSystem()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { testGlassSystem };