#!/usr/bin/env tsx
/**
 * METU Device Discovery Test Script
 * 
 * Interactive test script for validating the device server discovery architecture.
 * Tests various scenarios including server startup, client discovery, and communication.
 */

import { setTimeout } from 'timers/promises';
import { quickStartMetuDevices } from './index';
import { MetuDeviceServer } from './MetuDeviceServer';
import { MetuDeviceDiscovery } from './MetuDeviceDiscovery';
import { createDefaultDeviceConfig } from './MetuDeviceIntegration';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}

class DeviceDiscoveryTester {
    private results: TestResult[] = [];

    async runTest(name: string, testFn: () => Promise<void>): Promise<boolean> {
        console.log(`🧪 Running test: ${name}`);
        const startTime = Date.now();

        try {
            await testFn();
            const duration = Date.now() - startTime;

            this.results.push({
                name,
                passed: true,
                duration
            });

            console.log(`✅ Test passed: ${name} (${duration}ms)`);
            return true;

        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            this.results.push({
                name,
                passed: false,
                error: errorMessage,
                duration
            });

            console.log(`❌ Test failed: ${name} (${duration}ms)`);
            console.log(`   Error: ${errorMessage}`);
            return false;
        }
    }

    async runAllTests(): Promise<void> {
        console.log('🚀 Starting METU Device Discovery Tests');
        console.log('=====================================');
        console.log('');

        // Test 1: Server Creation and Startup
        await this.runTest('Server Creation and Startup', async () => {
            const config = createDefaultDeviceConfig({
                server: {
                    enabled: true,
                    config: {
                        port: 4003, // Use different port for testing
                        host: 'localhost',
                        serviceName: 'METU Test Server',
                        serviceType: '_metu-test._tcp',
                        corsOrigins: ['*'],
                        enableRateLimit: false,
                        maxRequestsPerWindow: 1000,
                        windowMs: 60000,
                        azure: {
                            apiKey: process.env.AZURE_OPENAI_API_KEY || 'test-key',
                            endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://test.openai.azure.com/',
                            deployment: 'gpt-4o-realtime-preview',
                            apiVersion: '2024-10-01-preview',
                            voice: 'alloy'
                        }
                    }
                },
                discovery: {
                    enabled: false // Server only mode for this test
                },
                mode: 'server'
            });

            const server = new MetuDeviceServer(config.server.config);

            // Test server creation
            if (!server) {
                throw new Error('Failed to create server instance');
            }

            // Test server startup
            await server.start();

            const status = server.getStatus();
            if (!status.isRunning) {
                throw new Error('Server not running after start');
            }

            if (status.config.port !== 4003) {
                throw new Error(`Incorrect port: expected 4003, got ${status.config.port}`);
            }

            // Test server shutdown
            await server.stop();

            const stoppedStatus = server.getStatus();
            if (stoppedStatus.isRunning) {
                throw new Error('Server still running after stop');
            }
        });

        // Test 2: Discovery Client Creation
        await this.runTest('Discovery Client Creation', async () => {
            const discovery = new MetuDeviceDiscovery();

            if (!discovery) {
                throw new Error('Failed to create discovery instance');
            }

            const status = discovery.getStatus();
            if (status.isScanning) {
                throw new Error('Discovery should not be scanning initially');
            }

            if (status.devicesDiscovered !== 0) {
                throw new Error('Discovery should have 0 devices initially');
            }

            await discovery.cleanup();
        });

        // Test 3: Discovery Start/Stop
        await this.runTest('Discovery Start/Stop', async () => {
            const discovery = new MetuDeviceDiscovery();

            // Start discovery
            await discovery.startDiscovery('_metu-test._tcp');

            const scanningStatus = discovery.getStatus();
            if (!scanningStatus.isScanning) {
                throw new Error('Discovery should be scanning after start');
            }

            // Stop discovery
            await discovery.stopDiscovery();

            const stoppedStatus = discovery.getStatus();
            if (stoppedStatus.isScanning) {
                throw new Error('Discovery should not be scanning after stop');
            }

            await discovery.cleanup();
        });

        // Test 4: Server-Discovery Integration
        await this.runTest('Server-Discovery Integration', async () => {
            const serverConfig = {
                port: 4004,
                host: 'localhost',
                serviceName: 'METU Integration Test',
                serviceType: '_metu-integration._tcp',
                corsOrigins: ['*'],
                enableRateLimit: false,
                maxRequestsPerWindow: 1000,
                windowMs: 60000,
                azure: {
                    apiKey: 'test-key',
                    endpoint: 'https://test.openai.azure.com/',
                    deployment: 'gpt-4o-realtime-preview',
                    apiVersion: '2024-10-01-preview',
                    voice: 'alloy' as const
                }
            };

            const server = new MetuDeviceServer(serverConfig);
            const discovery = new MetuDeviceDiscovery();

            let deviceFound = false;
            const discoveryPromise = new Promise<void>((resolve) => {
                discovery.on('device-discovered', (device) => {
                    if (device.name === serverConfig.serviceName) {
                        console.log(`   📡 Found our server: ${device.name}`);
                        deviceFound = true;
                        resolve();
                    }
                });
            });

            try {
                // Start discovery first
                await discovery.startDiscovery('_metu-integration._tcp');

                // Start server
                await server.start();
                console.log(`   🌐 Server started on port ${serverConfig.port}`);

                // Wait for discovery (with timeout)
                await Promise.race([
                    discoveryPromise,
                    setTimeout(5000).then(() => {
                        throw new Error('Device discovery timeout');
                    })
                ]);

                if (!deviceFound) {
                    throw new Error('Server was not discovered by client');
                }

                // Test connection
                const devices = discovery.getReachableDevices();
                const ourDevice = devices.find(d => d.name === serverConfig.serviceName);

                if (!ourDevice) {
                    throw new Error('Server device not found in reachable devices');
                }

                console.log(`   🔗 Attempting connection to ${ourDevice.name}`);
                const connection = await discovery.connectToDevice(ourDevice.id);

                if (!connection.isConnected) {
                    throw new Error('Failed to establish connection to server');
                }

                // Test HTTP request
                console.log('   📡 Testing HTTP request...');
                const health = await discovery.sendHttpRequest(ourDevice.id, '/health');

                if (health.status !== 'healthy') {
                    throw new Error(`Unexpected health status: ${health.status}`);
                }

                console.log('   ✅ HTTP communication successful');

            } finally {
                await server.stop();
                await discovery.cleanup();
            }
        });

        // Test 5: Quick Start Integration
        await this.runTest('Quick Start Integration', async () => {
            process.env.AZURE_OPENAI_API_KEY = 'test-key';
            process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com/';

            const integration = await quickStartMetuDevices(false);

            if (!integration) {
                throw new Error('Quick start failed to return integration');
            }

            const status = integration.getDeviceStatus();

            if (status.mode !== 'hybrid') {
                throw new Error(`Expected hybrid mode, got ${status.mode}`);
            }

            if (!status.server.isRunning) {
                throw new Error('Server should be running in quick start');
            }

            if (!status.discovery.isScanning) {
                throw new Error('Discovery should be scanning in quick start');
            }

            await integration.cleanup();
        });

        // Test 6: Error Handling
        await this.runTest('Error Handling', async () => {
            // Test invalid port
            const invalidServer = new MetuDeviceServer({
                port: 80, // Privileged port
                host: 'localhost',
                serviceName: 'Invalid Test',
                serviceType: '_invalid._tcp',
                corsOrigins: ['*'],
                enableRateLimit: false,
                maxRequestsPerWindow: 100,
                windowMs: 60000,
                azure: {
                    apiKey: 'test',
                    endpoint: 'https://test.com',
                    deployment: 'test',
                    apiVersion: '2024-10-01-preview',
                    voice: 'alloy'
                }
            });

            let errorThrown = false;
            try {
                await invalidServer.start();
            } catch (error) {
                errorThrown = true;
                console.log('   ✅ Correctly caught server start error');
            }

            if (!errorThrown) {
                throw new Error('Invalid server should have thrown an error');
            }

            // Test connection to non-existent device
            const discovery = new MetuDeviceDiscovery();

            let connectionErrorThrown = false;
            try {
                await discovery.connectToDevice('non-existent-device');
            } catch (error) {
                connectionErrorThrown = true;
                console.log('   ✅ Correctly caught connection error');
            }

            if (!connectionErrorThrown) {
                throw new Error('Connection to non-existent device should have thrown an error');
            }

            await discovery.cleanup();
        });

        // Print results summary
        this.printResults();
    }

    private printResults(): void {
        console.log('');
        console.log('📊 Test Results Summary');
        console.log('======================');

        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        const total = this.results.length;

        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
        console.log('');

        if (failed > 0) {
            console.log('❌ Failed Tests:');
            this.results
                .filter(r => !r.passed)
                .forEach(result => {
                    console.log(`   • ${result.name}: ${result.error}`);
                });
            console.log('');
        }

        console.log('⏱️ Performance:');
        this.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${result.name}: ${result.duration}ms`);
        });

        console.log('');

        if (passed === total) {
            console.log('🎉 All tests passed! METU Device Discovery System is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please review the errors above.');
        }
    }
}

// Run the tests
async function runTests() {
    const tester = new DeviceDiscoveryTester();

    console.log('🔧 METU Device Discovery System - Comprehensive Test Suite');
    console.log('=========================================================');
    console.log('');
    console.log('This test suite validates:');
    console.log('• Server creation and lifecycle management');
    console.log('• Discovery client functionality');
    console.log('• Server-client communication');
    console.log('• Integration layer functionality');
    console.log('• Error handling and edge cases');
    console.log('');

    try {
        await tester.runAllTests();
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Test suite interrupted');
    process.exit(0);
});

// Run the tests
runTests().catch(console.error);
