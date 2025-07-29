#!/usr/bin/env tsx
/**
 * METU Device Server Standalone Script
 * 
 * Standalone script for running a METU device server in development mode.
 * Useful for testing device discovery and cross-device communication.
 */

import { quickStartMetuDevices } from './index';

async function startDeviceServer() {
    console.log('🚀 Starting METU Device Server...');
    console.log('📡 Service: METU AI Assistant');
    console.log('🌐 Port: 4001');
    console.log('🔍 Discovery: Enabled');
    console.log('');

    try {
        const integration = await quickStartMetuDevices(true);

        // Display status
        const status = integration.getDeviceStatus();
        console.log('✅ METU Device Server Status:');
        console.log(`   Mode: ${status.mode}`);
        console.log(`   Server Running: ${status.server.isRunning} (port ${status.server.port || 'N/A'})`);
        console.log(`   Discovery Active: ${status.discovery.isScanning}`);
        console.log(`   Connected Clients: ${status.server.clients}`);
        console.log(`   Discovered Devices: ${status.discovery.devicesFound}`);
        console.log('');

        // Log device events
        integration.on('device-discovered', (device) => {
            console.log(`📡 Device discovered: ${device.name} (${device.host}:${device.port})`);
        });

        integration.on('device-connected', (connection) => {
            console.log(`🔗 Client connected from: ${connection.device.name}`);
        });

        integration.on('device-disconnected', (connection) => {
            console.log(`🔌 Client disconnected: ${connection.device.name}`);
        });

        integration.on('voice-transcription', (data) => {
            console.log(`🗣️ Voice from ${data.deviceId}: ${data.transcript}`);
        });

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down METU Device Server...');
            try {
                await integration.cleanup();
                console.log('✅ Server stopped gracefully');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });

        console.log('💡 Press Ctrl+C to stop the server');
        console.log('🌐 Access server at: http://localhost:4001/health');
        console.log('📡 WebSocket endpoint: ws://localhost:4001');
        console.log('');

        // Keep the process running
        await new Promise(() => { });

    } catch (error) {
        console.error('❌ Failed to start METU Device Server:', error);
        process.exit(1);
    }
}

// Run the server
startDeviceServer().catch(console.error);
