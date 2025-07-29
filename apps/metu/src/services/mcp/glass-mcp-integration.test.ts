/**
 * Glass MCP Integration Test
 * 
 * Tests the Glass MCP functionality integrated into the METU device server.
 */

import { MetuDeviceServer } from '../discovery/MetuDeviceServer';
import { metuGlassMCPController } from '../mcp/MetuGlassMCPController';

interface TestResult {
    name: string;
    success: boolean;
    duration: number;
    error?: string;
    data?: any;
}

class GlassMCPIntegrationTester {
    private server: MetuDeviceServer;
    private testResults: TestResult[] = [];

    constructor() {
        this.server = new MetuDeviceServer({
            port: 4005,
            host: 'localhost',
            serviceName: 'METU Glass MCP Test',
            serviceType: 'metu-ai',
            azureConfig: undefined
        });
    }

    /**
     * Run a single test
     */
    private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
        const startTime = Date.now();
        console.log(`🧪 Running test: ${name}`);

        try {
            const result = await testFn();
            const duration = Date.now() - startTime;

            const testResult: TestResult = {
                name,
                success: true,
                duration,
                data: result
            };

            console.log(`✅ Test passed: ${name} (${duration}ms)`);
            this.testResults.push(testResult);
            return testResult;

        } catch (error) {
            const duration = Date.now() - startTime;
            const testResult: TestResult = {
                name,
                success: false,
                duration,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            console.log(`❌ Test failed: ${name} (${duration}ms)`);
            console.log(`   Error: ${testResult.error}`);
            this.testResults.push(testResult);
            return testResult;
        }
    }

    /**
     * Test Glass MCP controller initialization
     */
    private async testGlassMCPInitialization(): Promise<any> {
        const initialized = await metuGlassMCPController.initialize();

        if (!initialized) {
            throw new Error('Glass MCP controller failed to initialize');
        }

        const status = metuGlassMCPController.getStatus();

        return {
            initialized: true,
            status: status
        };
    }

    /**
     * Test device server with Glass MCP integration
     */
    private async testDeviceServerGlassMCPIntegration(): Promise<any> {
        // Start device server (which should initialize Glass MCP)
        await this.server.start();

        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if server is running
        if (!this.server.isRunning) {
            throw new Error('Device server failed to start');
        }

        // Test Glass MCP status endpoint
        const response = await fetch(`http://localhost:4005/api/mcp/status`);
        const statusData = await response.json();

        if (!statusData.success) {
            throw new Error('Glass MCP status endpoint failed');
        }

        return {
            serverRunning: true,
            glassMCPStatusEndpoint: statusData
        };
    }

    /**
     * Test Glass MCP window management
     */
    private async testWindowManagement(): Promise<any> {
        // Test getting window list
        const windowsResponse = await fetch(`http://localhost:4005/api/mcp/windows`);
        const windowsData = await windowsResponse.json();

        if (!windowsData.success) {
            throw new Error('Failed to get window list');
        }

        // Test focus window (this will be simulated)
        const focusResponse = await fetch(`http://localhost:4005/api/mcp/window/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                windowTitle: 'Visual Studio Code',
                exact: false
            })
        });

        const focusData = await focusResponse.json();

        return {
            windowList: windowsData.data,
            windowFocus: focusData
        };
    }

    /**
     * Test Glass MCP clipboard operations
     */
    private async testClipboardOperations(): Promise<any> {
        const testText = 'Hello from METU Glass MCP Integration Test!';

        // Test setting clipboard
        const setResponse = await fetch(`http://localhost:4005/api/mcp/clipboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testText })
        });

        const setData = await setResponse.json();

        if (!setData.success) {
            throw new Error('Failed to set clipboard text');
        }

        // Test getting clipboard
        const getResponse = await fetch(`http://localhost:4005/api/mcp/clipboard`);
        const getData = await getResponse.json();

        if (!getData.success) {
            throw new Error('Failed to get clipboard text');
        }

        return {
            setClipboard: setData,
            getClipboard: getData,
            testText: testText
        };
    }

    /**
     * Test Glass MCP automation workflow
     */
    private async testAutomationWorkflow(): Promise<any> {
        // Test predefined workflow
        const workflowResponse = await fetch(`http://localhost:4005/api/mcp/workflow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workflowName: 'copyWindowContentToClipboard',
                parameters: {
                    title: 'Visual Studio Code',
                    exact: false
                }
            })
        });

        const workflowData = await workflowResponse.json();

        return {
            workflow: workflowData
        };
    }

    /**
     * Test Glass MCP error handling
     */
    private async testErrorHandling(): Promise<any> {
        // Test invalid window focus
        const invalidResponse = await fetch(`http://localhost:4005/api/mcp/window/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Missing windowTitle
                exact: false
            })
        });

        const invalidData = await invalidResponse.json();

        // Should return 400 error
        if (invalidResponse.status !== 400) {
            throw new Error('Expected 400 error for invalid request');
        }

        return {
            errorHandling: invalidData
        };
    }

    /**
     * Run all Glass MCP integration tests
     */
    async runAllTests(): Promise<void> {
        console.log('🔧 METU Glass MCP Integration - Comprehensive Test Suite');
        console.log('===========================================================');
        console.log('');
        console.log('This test suite validates:');
        console.log('• Glass MCP controller initialization');
        console.log('• Device server Glass MCP integration');
        console.log('• Window management automation');
        console.log('• Clipboard operations');
        console.log('• Automation workflow execution');
        console.log('• Error handling and validation');
        console.log('');
        console.log('🚀 Starting METU Glass MCP Integration Tests');
        console.log('===========================================');
        console.log('');

        try {
            // Test 1: Glass MCP Controller Initialization
            await this.runTest('Glass MCP Controller Initialization',
                () => this.testGlassMCPInitialization());

            // Test 2: Device Server Glass MCP Integration
            await this.runTest('Device Server Glass MCP Integration',
                () => this.testDeviceServerGlassMCPIntegration());

            // Test 3: Window Management
            await this.runTest('Window Management Operations',
                () => this.testWindowManagement());

            // Test 4: Clipboard Operations
            await this.runTest('Clipboard Operations',
                () => this.testClipboardOperations());

            // Test 5: Automation Workflow
            await this.runTest('Automation Workflow Execution',
                () => this.testAutomationWorkflow());

            // Test 6: Error Handling
            await this.runTest('Error Handling and Validation',
                () => this.testErrorHandling());

        } finally {
            // Cleanup
            try {
                await this.server.stop();
                console.log('✅ Test server stopped');
            } catch (error) {
                console.warn('⚠️ Error stopping test server:', error);
            }
        }

        // Print test summary
        this.printTestSummary();
    }

    /**
     * Print test results summary
     */
    private printTestSummary(): void {
        console.log('');
        console.log('📊 Glass MCP Integration Test Results');
        console.log('=====================================');
        console.log('');

        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const totalTime = this.testResults.reduce((sum, r) => sum + r.duration, 0);

        console.log(`✅ Tests Passed: ${passed}`);
        console.log(`❌ Tests Failed: ${failed}`);
        console.log(`⏱️  Total Time: ${totalTime}ms`);
        console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
        console.log('');

        if (failed > 0) {
            console.log('❌ Failed Tests:');
            this.testResults
                .filter(r => !r.success)
                .forEach(result => {
                    console.log(`   • ${result.name}: ${result.error}`);
                });
            console.log('');
        }

        if (passed === this.testResults.length) {
            console.log('🎉 All Glass MCP Integration tests passed! Phase 3 implementation is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the errors above for details.');
        }
    }
}

/**
 * Run Glass MCP integration tests
 */
async function runGlassMCPIntegrationTests(): Promise<void> {
    const tester = new GlassMCPIntegrationTester();
    await tester.runAllTests();
}

// Export for use in other test files
export { GlassMCPIntegrationTester, runGlassMCPIntegrationTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runGlassMCPIntegrationTests().catch(console.error);
}
