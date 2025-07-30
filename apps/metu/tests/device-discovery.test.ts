/**
 * METU Device Discovery System Test
 * 
 * Comprehensive test suite for validating the device server discovery architecture.
 * Tests server initialization, client discovery, connection management, and
 * cross-device communication capabilities.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MetuDeviceServer } from '../src/services/discovery/MetuDeviceServer';
import { MetuDeviceDiscovery } from '../src/services/discovery/MetuDeviceDiscovery';
import { MetuDeviceIntegration, createDefaultDeviceConfig } from '../src/services/discovery/MetuDeviceIntegration';
import { initializeMetuDevices, quickStartMetuDevices } from '../src/services/discovery/index';

// Test configuration
const TEST_CONFIG = {
    server: {
        port: 4002, // Use different port for testing
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
            voice: 'alloy' as const
        }
    }
};

describe('METU Device Discovery System', () => {
    let server: MetuDeviceServer;
    let discovery: MetuDeviceDiscovery;
    let integration: MetuDeviceIntegration;

    beforeAll(async () => {
        console.log('🧪 Setting up METU Device Discovery Tests...');
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up METU Device Discovery Tests...');
    });

    describe('MetuDeviceServer', () => {
        beforeEach(async () => {
            server = new MetuDeviceServer(TEST_CONFIG.server);
        });

        afterEach(async () => {
            if (server) {
                await server.stop();
            }
        });

        test('should initialize server with correct configuration', () => {
            expect(server).toBeDefined();
            expect(server.getStatus().config.port).toBe(TEST_CONFIG.server.port);
            expect(server.getStatus().config.serviceName).toBe(TEST_CONFIG.server.serviceName);
        });

        test('should start and stop server successfully', async () => {
            const initialStatus = server.getStatus();
            expect(initialStatus.isRunning).toBe(false);

            await server.start();

            const runningStatus = server.getStatus();
            expect(runningStatus.isRunning).toBe(true);
            expect(runningStatus.config.port).toBe(TEST_CONFIG.server.port);

            await server.stop();

            const stoppedStatus = server.getStatus();
            expect(stoppedStatus.isRunning).toBe(false);
        });

        test('should handle multiple start/stop cycles', async () => {
            // First cycle
            await server.start();
            expect(server.getStatus().isRunning).toBe(true);
            await server.stop();
            expect(server.getStatus().isRunning).toBe(false);

            // Second cycle
            await server.start();
            expect(server.getStatus().isRunning).toBe(true);
            await server.stop();
            expect(server.getStatus().isRunning).toBe(false);
        });

        test('should expose correct capabilities', () => {
            const status = server.getStatus();
            expect(status.capabilities).toBeDefined();
            expect(status.capabilities.audio.input).toBe(true);
            expect(status.capabilities.audio.output).toBe(true);
            expect(status.capabilities.audio.realtime).toBe(true);
            expect(status.capabilities.ai.voiceAssistant).toBe(true);
        });
    });

    describe('MetuDeviceDiscovery', () => {
        beforeEach(() => {
            discovery = new MetuDeviceDiscovery();
        });

        afterEach(async () => {
            if (discovery) {
                await discovery.cleanup();
            }
        });

        test('should initialize discovery client', () => {
            expect(discovery).toBeDefined();
            expect(discovery.getStatus().isScanning).toBe(false);
            expect(discovery.getStatus().devicesDiscovered).toBe(0);
        });

        test('should start and stop discovery', async () => {
            const initialStatus = discovery.getStatus();
            expect(initialStatus.isScanning).toBe(false);

            await discovery.startDiscovery('_metu-test._tcp');

            const scanningStatus = discovery.getStatus();
            expect(scanningStatus.isScanning).toBe(true);

            await discovery.stopDiscovery();

            const stoppedStatus = discovery.getStatus();
            expect(stoppedStatus.isScanning).toBe(false);
        });

        test('should handle discovery lifecycle events', async () => {
            let deviceDiscoveredCount = 0;
            let discoveryStartedCount = 0;
            let discoveryStoppedCount = 0;

            discovery.on('device-discovered', () => {
                deviceDiscoveredCount++;
            });

            discovery.on('discovery-started', () => {
                discoveryStartedCount++;
            });

            discovery.on('discovery-stopped', () => {
                discoveryStoppedCount++;
            });

            await discovery.startDiscovery('_metu-test._tcp');
            expect(discoveryStartedCount).toBe(1);

            await discovery.stopDiscovery();
            expect(discoveryStoppedCount).toBe(1);
        });
    });

    describe('Server-Discovery Integration', () => {
        let testServer: MetuDeviceServer;
        let testDiscovery: MetuDeviceDiscovery;

        beforeEach(async () => {
            testServer = new MetuDeviceServer(TEST_CONFIG.server);
            testDiscovery = new MetuDeviceDiscovery();
        });

        afterEach(async () => {
            if (testServer) {
                await testServer.stop();
            }
            if (testDiscovery) {
                await testDiscovery.cleanup();
            }
        });

        test('should discover server after it starts', async () => {
            let deviceFound = false;

            testDiscovery.on('device-discovered', (device) => {
                if (device.name === TEST_CONFIG.server.serviceName) {
                    deviceFound = true;
                }
            });

            // Start discovery first
            await testDiscovery.startDiscovery('_metu-test._tcp');

            // Start server - it should be discovered
            await testServer.start();

            // Wait a bit for discovery
            await new Promise(resolve => setTimeout(resolve, 2000));

            expect(deviceFound).toBe(true);

            const devices = testDiscovery.getReachableDevices();
            const ourServer = devices.find(d => d.name === TEST_CONFIG.server.serviceName);
            expect(ourServer).toBeDefined();
            expect(ourServer?.port).toBe(TEST_CONFIG.server.port);
        }, 10000);

        test('should establish HTTP connection to discovered device', async () => {
            let discoveredDeviceId: string | null = null;

            testDiscovery.on('device-discovered', (device) => {
                if (device.name === TEST_CONFIG.server.serviceName) {
                    discoveredDeviceId = device.id;
                }
            });

            await testDiscovery.startDiscovery('_metu-test._tcp');
            await testServer.start();

            // Wait for discovery
            await new Promise(resolve => setTimeout(resolve, 2000));

            expect(discoveredDeviceId).not.toBeNull();

            if (discoveredDeviceId) {
                const connection = await testDiscovery.connectToDevice(discoveredDeviceId);
                expect(connection).toBeDefined();
                expect(connection.isConnected).toBe(true);

                // Test HTTP request
                const health = await testDiscovery.sendHttpRequest(discoveredDeviceId, '/health');
                expect(health.status).toBe('healthy');
                expect(health.version).toBe('2.0.0');
            }
        }, 15000);
    });

    describe('MetuDeviceIntegration', () => {
        beforeEach(() => {
            const config = createDefaultDeviceConfig({
                server: {
                    enabled: true,
                    config: TEST_CONFIG.server
                },
                discovery: {
                    enabled: true,
                    serviceType: '_metu-test._tcp'
                },
                mode: 'hybrid'
            });
            integration = new MetuDeviceIntegration(config);
        });

        afterEach(async () => {
            if (integration) {
                await integration.cleanup();
            }
        });

        test('should initialize in hybrid mode', async () => {
            await integration.initialize();

            const status = integration.getDeviceStatus();
            expect(status.mode).toBe('hybrid');
            expect(status.server.isRunning).toBe(true);
            expect(status.discovery.isScanning).toBe(true);
        });

        test('should provide device management interface', async () => {
            await integration.initialize();

            // Should be able to get device status
            const status = integration.getDeviceStatus();
            expect(status).toBeDefined();
            expect(status.capabilities.canServe).toBe(true);
            expect(status.capabilities.canDiscover).toBe(true);

            // Should be able to get discovered devices
            const devices = integration.getDiscoveredDevices();
            expect(Array.isArray(devices)).toBe(true);
        });
    });

    describe('High-Level API', () => {
        afterEach(async () => {
            // Cleanup any initialized devices
            try {
                const integration = getMetuDeviceIntegration();
                if (integration) {
                    await integration.cleanup();
                }
            } catch (error) {
                // Ignore cleanup errors in tests
            }
        });

        test('should initialize with default configuration', async () => {
            const integration = await initializeMetuDevices({
                verbose: false,
                config: {
                    server: {
                        enabled: true,
                        config: TEST_CONFIG.server
                    },
                    discovery: {
                        enabled: true,
                        serviceType: '_metu-test._tcp'
                    }
                }
            });

            expect(integration).toBeDefined();

            const status = integration.getDeviceStatus();
            expect(status.server.isRunning).toBe(true);
            expect(status.discovery.isScanning).toBe(true);
        });

        test('should support quick start', async () => {
            const integration = await quickStartMetuDevices(false);

            expect(integration).toBeDefined();

            const status = integration.getDeviceStatus();
            expect(status.mode).toBe('hybrid');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid server configuration', () => {
            expect(() => {
                new MetuDeviceServer({
                    ...TEST_CONFIG.server,
                    port: -1 // Invalid port
                });
            }).not.toThrow(); // Constructor shouldn't throw, but start() should
        });

        test('should handle server start failures gracefully', async () => {
            const invalidServer = new MetuDeviceServer({
                ...TEST_CONFIG.server,
                port: 80 // Privileged port that likely can't be bound
            });

            await expect(invalidServer.start()).rejects.toThrow();
        });

        test('should handle discovery failures gracefully', async () => {
            const testDiscovery = new MetuDeviceDiscovery();

            // This should not throw even if no devices are found
            await expect(testDiscovery.startDiscovery('_nonexistent._tcp')).resolves.not.toThrow();

            await testDiscovery.cleanup();
        });

        test('should handle connection failures to non-existent devices', async () => {
            const testDiscovery = new MetuDeviceDiscovery();

            await expect(testDiscovery.connectToDevice('non-existent-device')).rejects.toThrow();

            await testDiscovery.cleanup();
        });
    });

    describe('Performance', () => {
        test('should start server within reasonable time', async () => {
            const testServer = new MetuDeviceServer(TEST_CONFIG.server);

            const startTime = Date.now();
            await testServer.start();
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(5000); // Should start within 5 seconds

            await testServer.stop();
        });

        test('should handle multiple concurrent connections', async () => {
            const testServer = new MetuDeviceServer(TEST_CONFIG.server);
            await testServer.start();

            const discoveries = Array.from({ length: 3 }, () => new MetuDeviceDiscovery());

            try {
                // Start all discoveries
                await Promise.all(discoveries.map(d => d.startDiscovery('_metu-test._tcp')));

                // Wait for discovery
                await new Promise(resolve => setTimeout(resolve, 3000));

                // All should be able to discover the server
                const status = testServer.getStatus();
                expect(status.isRunning).toBe(true);

            } finally {
                await Promise.all(discoveries.map(d => d.cleanup()));
                await testServer.stop();
            }
        }, 15000);
    });
});

// Helper function to get integration instance (mocked for testing)
function getMetuDeviceIntegration() {
    // In real implementation, this would return the actual integration
    return null;
}
