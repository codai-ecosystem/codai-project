#!/usr/bin/env tsx
/**
 * METU Device Discovery Client Script
 * 
 * Standalone script for testing device discovery functionality.
 * Discovers METU devices on the local network and displays their information.
 */

import { MetuDeviceDiscovery } from './MetuDeviceDiscovery';
import { createDefaultDeviceConfig } from './MetuDeviceIntegration';

async function runDiscoveryClient() {
    console.log('🔍 Starting METU Device Discovery Client...');
    console.log('📡 Scanning for METU AI Assistant devices...');
    console.log('');

    const discovery = new MetuDeviceDiscovery();

    // Setup event handlers
    discovery.on('device-discovered', async (device) => {
        console.log(`📡 Device discovered: ${device.name}`);
        console.log(`   Host: ${device.host}:${device.port}`);
        console.log(`   ID: ${device.id}`);
        console.log(`   Capabilities: ${device.capabilities.join(', ')}`);
        console.log(`   Platform: ${device.platform || 'Unknown'}`);
        console.log(`   Version: ${device.version || 'Unknown'}`);
        console.log('');

        // Try to connect to the device
        try {
            console.log(`🔗 Connecting to ${device.name}...`);
            const connection = await discovery.connectToDevice(device.id);

            if (connection.isConnected) {
                console.log(`✅ Connected to ${device.name}`);

                // Test HTTP endpoints
                try {
                    const health = await discovery.sendHttpRequest(device.id, '/health');
                    console.log(`   Health: ${health.status} (uptime: ${Math.round(health.uptime)}s)`);

                    const deviceInfo = await discovery.sendHttpRequest(device.id, '/api/device/info');
                    console.log(`   Device Name: ${deviceInfo.name}`);
                    console.log(`   Device Type: ${deviceInfo.type}`);

                    const audioDevices = await discovery.sendHttpRequest(device.id, '/api/audio/devices');
                    console.log(`   Audio Input Devices: ${audioDevices.input.length}`);
                    console.log(`   Audio Output Devices: ${audioDevices.output.length}`);

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.log(`   ⚠️ HTTP request failed: ${errorMessage}`);
                }

                // Send a test WebSocket message
                try {
                    await discovery.sendWebSocketMessage(device.id, {
                        type: 'get-status',
                        requestId: 'test-' + Date.now()
                    });
                    console.log(`   📨 WebSocket test message sent`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.log(`   ⚠️ WebSocket message failed: ${errorMessage}`);
                }

            } else {
                console.log(`❌ Failed to connect to ${device.name}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Connection error for ${device.name}: ${errorMessage}`);
        }

        console.log('');
    });

    discovery.on('device-disappeared', (device) => {
        console.log(`📵 Device disappeared: ${device.name}`);
    });

    discovery.on('device-connected', (connection) => {
        console.log(`🔗 Successfully connected to: ${connection.device.name}`);
    });

    discovery.on('device-disconnected', (connection) => {
        console.log(`🔌 Disconnected from: ${connection.device.name}`);
    });

    discovery.on('websocket-message', (data) => {
        console.log(`📨 WebSocket message from ${data.device.name}:`, data.message.type);
    });

    discovery.on('voice-transcription', (data) => {
        console.log(`🗣️ Voice transcription from ${data.deviceId}: ${data.transcript}`);
    });

    discovery.on('voice-response-complete', (data) => {
        console.log(`🎤 Voice response complete from ${data.deviceId}`);
    });

    // Start discovery
    try {
        await discovery.startDiscovery('_metu-ai._tcp');
        console.log('✅ Device discovery started');
        console.log('💡 Waiting for device announcements...');
        console.log('');

        // Display periodic status updates
        const statusInterval = setInterval(() => {
            const status = discovery.getStatus();
            console.log(`📊 Status: ${status.devicesDiscovered} devices discovered, ${status.activeConnections} connected`);

            if (status.devices.length > 0) {
                console.log('   Devices:');
                status.devices.forEach(device => {
                    const reachable = device.isReachable ? '🟢' : '🔴';
                    console.log(`     ${reachable} ${device.name} (${device.host}:${device.port})`);
                });
            }
            console.log('');
        }, 30000); // Every 30 seconds

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down discovery client...');
            clearInterval(statusInterval);

            try {
                await discovery.cleanup();
                console.log('✅ Discovery client stopped gracefully');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });

        console.log('💡 Press Ctrl+C to stop discovery');
        console.log('');

        // Keep the process running
        await new Promise(() => { });

    } catch (error) {
        console.error('❌ Failed to start device discovery:', error);
        process.exit(1);
    }
}

// Run the discovery client
runDiscoveryClient().catch(console.error);
