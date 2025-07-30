/**
 * METU Device Discovery Client
 * 
 * Discovers and connects to METU device servers on the local network using
 * Bonjour/mDNS service discovery. Provides a unified interface for interacting
 * with discovered devices.
 */

import { EventEmitter } from 'events';
import bonjourService, { Service, Browser } from 'bonjour-service';

export interface DiscoveredDevice {
    id: string;
    name: string;
    host: string;
    port: number;
    type: string;
    txt: Record<string, string>;
    addresses: string[];
    capabilities: string[];
    version?: string;
    platform?: string;
    arch?: string;
    deviceId?: string;
    discoveredAt: Date;
    lastSeen: Date;
    isReachable: boolean;
}

export interface ConnectionOptions {
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    preferredProtocol?: 'http' | 'ws';
}

export interface DeviceConnection {
    device: DiscoveredDevice;
    httpUrl: string;
    wsUrl: string;
    websocket?: WebSocket;
    isConnected: boolean;
    lastResponse?: Date;
    connectionOptions: ConnectionOptions;
}

export class MetuDeviceDiscovery extends EventEmitter {
    private bonjourService: any;
    private browser: Browser | null = null;
    private devices: Map<string, DiscoveredDevice> = new Map();
    private connections: Map<string, DeviceConnection> = new Map();
    private isScanning = false;
    private healthCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.bonjourService = new (bonjourService as any).Bonjour();
    }

    /**
     * Start device discovery
     */
    async startDiscovery(serviceType = '_metu-ai._tcp'): Promise<void> {
        if (this.isScanning) {
            console.warn('⚠️ Discovery already in progress');
            return;
        }

        console.log('🔍 Starting METU device discovery...');

        this.browser = this.bonjourService.find({ type: serviceType });

        if (this.browser) {
            this.browser.on('up', (service: Service) => {
                this.handleDeviceDiscovered(service);
            });

            this.browser.on('down', (service: Service) => {
                this.handleDeviceDisappeared(service);
            });
        } else {
            console.error('❌ Failed to create bonjour browser');
            return;
        }

        this.isScanning = true;

        // Start health check interval
        this.startHealthChecks();

        this.emit('discovery-started');
        console.log('✅ Device discovery started');
    }

    /**
     * Stop device discovery
     */
    async stopDiscovery(): Promise<void> {
        if (!this.isScanning) {
            return;
        }

        console.log('🛑 Stopping device discovery...');

        // Stop browser
        if (this.browser) {
            this.browser.stop();
            this.browser = null;
        }

        // Disconnect all connections
        for (const connection of this.connections.values()) {
            await this.disconnectDevice(connection.device.id);
        }

        // Stop health checks
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.isScanning = false;
        this.emit('discovery-stopped');
        console.log('✅ Device discovery stopped');
    }

    /**
     * Handle discovered device
     */
    private handleDeviceDiscovered(service: Service): void {
        const deviceId = this.generateDeviceId(service);

        const device: DiscoveredDevice = {
            id: deviceId,
            name: service.name,
            host: service.host || 'localhost',
            port: service.port,
            type: service.type,
            txt: service.txt || {},
            addresses: service.addresses || [],
            capabilities: this.parseCapabilities(service.txt?.capabilities),
            version: service.txt?.version,
            platform: service.txt?.platform,
            arch: service.txt?.arch,
            deviceId: service.txt?.deviceId,
            discoveredAt: this.devices.has(deviceId) ? this.devices.get(deviceId)!.discoveredAt : new Date(),
            lastSeen: new Date(),
            isReachable: true
        };

        const isNewDevice = !this.devices.has(deviceId);
        this.devices.set(deviceId, device);

        if (isNewDevice) {
            console.log(`🔍 Device discovered: ${device.name} (${device.host}:${device.port})`);
            this.emit('device-discovered', device);
        } else {
            console.log(`🔄 Device updated: ${device.name}`);
            this.emit('device-updated', device);
        }
    }

    /**
     * Handle device disappeared
     */
    private handleDeviceDisappeared(service: Service): void {
        const deviceId = this.generateDeviceId(service);
        const device = this.devices.get(deviceId);

        if (device) {
            device.isReachable = false;
            console.log(`📵 Device disappeared: ${device.name}`);
            this.emit('device-disappeared', device);

            // Disconnect if connected
            const connection = this.connections.get(deviceId);
            if (connection) {
                this.disconnectDevice(deviceId);
            }
        }
    }

    /**
     * Connect to a discovered device
     */
    async connectToDevice(deviceId: string, options: ConnectionOptions = {}): Promise<DeviceConnection> {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device not found: ${deviceId}`);
        }

        if (!device.isReachable) {
            throw new Error(`Device not reachable: ${device.name}`);
        }

        // Check if already connected
        const existingConnection = this.connections.get(deviceId);
        if (existingConnection && existingConnection.isConnected) {
            return existingConnection;
        }

        const connectionOptions: ConnectionOptions = {
            timeout: 5000,
            retryAttempts: 3,
            retryDelay: 1000,
            preferredProtocol: 'ws',
            ...options
        };

        const connection: DeviceConnection = {
            device: device,
            httpUrl: `http://${device.host}:${device.port}`,
            wsUrl: `ws://${device.host}:${device.port}`,
            isConnected: false,
            connectionOptions: connectionOptions
        };

        try {
            // Test HTTP connection first
            await this.testHttpConnection(connection);

            // Establish WebSocket connection if preferred
            if (connectionOptions.preferredProtocol === 'ws') {
                await this.establishWebSocketConnection(connection);
            }

            connection.isConnected = true;
            connection.lastResponse = new Date();
            this.connections.set(deviceId, connection);

            console.log(`🔗 Connected to device: ${device.name}`);
            this.emit('device-connected', connection);

            return connection;

        } catch (error) {
            console.error(`❌ Failed to connect to device ${device.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Connection failed: ${errorMessage}`);
        }
    }

    /**
     * Disconnect from a device
     */
    async disconnectDevice(deviceId: string): Promise<void> {
        const connection = this.connections.get(deviceId);
        if (!connection) {
            return;
        }

        try {
            // Close WebSocket connection
            if (connection.websocket) {
                connection.websocket.close();
                connection.websocket = undefined;
            }

            connection.isConnected = false;
            this.connections.delete(deviceId);

            console.log(`🔌 Disconnected from device: ${connection.device.name}`);
            this.emit('device-disconnected', connection);

        } catch (error) {
            console.error(`❌ Error disconnecting from device ${connection.device.name}:`, error);
        }
    }

    /**
     * Send HTTP request to device
     */
    async sendHttpRequest(deviceId: string, endpoint: string, options: RequestInit = {}): Promise<any> {
        const connection = this.connections.get(deviceId);
        if (!connection) {
            throw new Error(`Not connected to device: ${deviceId}`);
        }

        const url = `${connection.httpUrl}${endpoint}`;
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            connection.lastResponse = new Date();
            return await response.json();

        } catch (error) {
            console.error(`❌ HTTP request failed to ${connection.device.name}:`, error);
            throw error;
        }
    }

    /**
     * Send WebSocket message to device
     */
    async sendWebSocketMessage(deviceId: string, message: any): Promise<void> {
        const connection = this.connections.get(deviceId);
        if (!connection || !connection.websocket) {
            throw new Error(`No WebSocket connection to device: ${deviceId}`);
        }

        if (connection.websocket.readyState !== WebSocket.OPEN) {
            throw new Error(`WebSocket not open for device: ${deviceId}`);
        }

        try {
            connection.websocket.send(JSON.stringify(message));
            connection.lastResponse = new Date();

        } catch (error) {
            console.error(`❌ WebSocket message failed to ${connection.device.name}:`, error);
            throw error;
        }
    }

    /**
     * Test HTTP connection to device
     */
    private async testHttpConnection(connection: DeviceConnection): Promise<void> {
        const url = `${connection.httpUrl}/health`;
        const timeout = connection.connectionOptions.timeout || 5000;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const health = await response.json();
            console.log(`✅ HTTP connection test passed for ${connection.device.name}`);

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Connection timeout');
            }
            throw error;
        }
    }

    /**
     * Establish WebSocket connection
     */
    private async establishWebSocketConnection(connection: DeviceConnection): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(connection.wsUrl);
                const timeout = connection.connectionOptions.timeout || 5000;

                const timeoutId = setTimeout(() => {
                    ws.close();
                    reject(new Error('WebSocket connection timeout'));
                }, timeout);

                ws.onopen = () => {
                    clearTimeout(timeoutId);
                    console.log(`🔗 WebSocket connected to ${connection.device.name}`);

                    connection.websocket = ws;
                    resolve();
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleWebSocketMessage(connection.device.id, message);
                    } catch (error) {
                        console.error('❌ Error parsing WebSocket message:', error);
                    }
                };

                ws.onclose = () => {
                    console.log(`🔌 WebSocket disconnected from ${connection.device.name}`);
                    connection.websocket = undefined;
                    connection.isConnected = false;
                    this.emit('websocket-disconnected', connection);
                };

                ws.onerror = (error) => {
                    clearTimeout(timeoutId);
                    console.error(`❌ WebSocket error for ${connection.device.name}:`, error);
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Handle WebSocket message from device
     */
    private handleWebSocketMessage(deviceId: string, message: any): void {
        const connection = this.connections.get(deviceId);
        if (!connection) return;

        connection.lastResponse = new Date();

        console.log(`📨 WebSocket message from ${connection.device.name}:`, message.type);

        this.emit('websocket-message', {
            deviceId: deviceId,
            device: connection.device,
            message: message
        });

        // Handle specific message types
        switch (message.type) {
            case 'voice-transcription':
                this.emit('voice-transcription', {
                    deviceId: deviceId,
                    transcript: message.transcript
                });
                break;

            case 'voice-audio-delta':
                this.emit('voice-audio-delta', {
                    deviceId: deviceId,
                    audioData: message.audioData
                });
                break;

            case 'voice-response-complete':
                this.emit('voice-response-complete', {
                    deviceId: deviceId,
                    response: message.response
                });
                break;

            case 'device-control-result':
                this.emit('device-control-result', {
                    deviceId: deviceId,
                    result: message.result
                });
                break;
        }
    }

    /**
     * Start health checks for connected devices
     */
    private startHealthChecks(): void {
        this.healthCheckInterval = setInterval(async () => {
            for (const connection of this.connections.values()) {
                try {
                    await this.sendHttpRequest(connection.device.id, '/health');
                    connection.device.isReachable = true;
                    connection.device.lastSeen = new Date();
                } catch (error) {
                    console.warn(`⚠️ Health check failed for ${connection.device.name}`);
                    connection.device.isReachable = false;

                    // Emit device unreachable event
                    this.emit('device-unreachable', connection.device);
                }
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Parse capabilities from service TXT record
     */
    private parseCapabilities(capabilitiesString?: string): string[] {
        if (!capabilitiesString) return [];

        try {
            return JSON.parse(capabilitiesString);
        } catch {
            return capabilitiesString.split(',').map(c => c.trim());
        }
    }

    /**
     * Generate unique device ID from service
     */
    private generateDeviceId(service: Service): string {
        const host = service.host || 'unknown';
        const port = service.port || 0;
        const name = service.name || 'unnamed';
        return `${host}-${port}-${name}`.replace(/[^a-zA-Z0-9-]/g, '-');
    }

    /**
     * Get all discovered devices
     */
    getDiscoveredDevices(): DiscoveredDevice[] {
        return Array.from(this.devices.values());
    }

    /**
     * Get reachable devices only
     */
    getReachableDevices(): DiscoveredDevice[] {
        return Array.from(this.devices.values()).filter(device => device.isReachable);
    }

    /**
     * Get device by ID
     */
    getDevice(deviceId: string): DiscoveredDevice | undefined {
        return this.devices.get(deviceId);
    }

    /**
     * Get all active connections
     */
    getConnections(): DeviceConnection[] {
        return Array.from(this.connections.values());
    }

    /**
     * Get connection for specific device
     */
    getConnection(deviceId: string): DeviceConnection | undefined {
        return this.connections.get(deviceId);
    }

    /**
     * Check if device is connected
     */
    isDeviceConnected(deviceId: string): boolean {
        const connection = this.connections.get(deviceId);
        return connection ? connection.isConnected : false;
    }

    /**
     * Get discovery status
     */
    getStatus() {
        return {
            isScanning: this.isScanning,
            devicesDiscovered: this.devices.size,
            reachableDevices: this.getReachableDevices().length,
            activeConnections: this.connections.size,
            devices: Array.from(this.devices.values()),
            connections: Array.from(this.connections.values()).map(conn => ({
                deviceId: conn.device.id,
                deviceName: conn.device.name,
                isConnected: conn.isConnected,
                lastResponse: conn.lastResponse
            }))
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.stopDiscovery();
        this.bonjourService.destroy();
        this.removeAllListeners();
    }
}

// Export singleton instance
export const deviceDiscovery = new MetuDeviceDiscovery();
