/**
 * METU Device Integration Layer
 * 
 * Provides a unified interface for managing device server and discovery client
 * interactions. Handles the coordination between server mode and client mode
 * operations for seamless cross-device AI assistant functionality.
 */

import { EventEmitter } from 'events';
import { MetuDeviceServer, DeviceServerConfig } from './MetuDeviceServer.minimal';
import { MetuDeviceDiscovery, DiscoveredDevice, DeviceConnection } from './MetuDeviceDiscovery';

export interface DeviceIntegrationConfig {
    server: {
        enabled: boolean;
        config: DeviceServerConfig;
    };
    discovery: {
        enabled: boolean;
        serviceType?: string;
        autoConnect?: boolean;
        preferredDevices?: string[];
    };
    mode: 'server' | 'client' | 'hybrid';
    fallbackToLocal: boolean;
}

export interface DeviceStatus {
    mode: 'server' | 'client' | 'hybrid';
    server: {
        isRunning: boolean;
        port?: number;
        clients: number;
    };
    discovery: {
        isScanning: boolean;
        devicesFound: number;
        connectedDevices: number;
    };
    capabilities: {
        canServe: boolean;
        canDiscover: boolean;
        canConnect: boolean;
    };
}

export class MetuDeviceIntegration extends EventEmitter {
    private server: MetuDeviceServer | null = null;
    private discovery: MetuDeviceDiscovery;
    private config: DeviceIntegrationConfig;
    private currentMode: 'server' | 'client' | 'hybrid' = 'hybrid';
    private isInitialized = false;

    constructor(config: DeviceIntegrationConfig) {
        super();
        this.config = config;
        this.discovery = new MetuDeviceDiscovery();
        this.setupEventHandlers();
    }

    /**
     * Initialize the device integration system
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.warn('⚠️ Device integration already initialized');
            return;
        }

        console.log('🚀 Initializing METU Device Integration...');

        try {
            // Initialize based on mode
            switch (this.config.mode) {
                case 'server':
                    await this.initializeServerMode();
                    break;

                case 'client':
                    await this.initializeClientMode();
                    break;

                case 'hybrid':
                    await this.initializeHybridMode();
                    break;

                default:
                    throw new Error(`Invalid mode: ${this.config.mode}`);
            }

            this.currentMode = this.config.mode;
            this.isInitialized = true;

            console.log(`✅ Device integration initialized in ${this.currentMode} mode`);
            this.emit('initialized', { mode: this.currentMode });

        } catch (error) {
            console.error('❌ Failed to initialize device integration:', error);
            throw error;
        }
    }

    /**
     * Initialize server mode
     */
    private async initializeServerMode(): Promise<void> {
        if (!this.config.server.enabled) {
            throw new Error('Server mode requested but server is disabled in config');
        }

        console.log('🌐 Starting device server...');

        this.server = new MetuDeviceServer(this.config.server.config);
        await this.server.start();

        // Also start discovery to find other devices
        if (this.config.discovery.enabled) {
            await this.discovery.startDiscovery(this.config.discovery.serviceType);
        }
    }

    /**
     * Initialize client mode
     */
    private async initializeClientMode(): Promise<void> {
        if (!this.config.discovery.enabled) {
            throw new Error('Client mode requested but discovery is disabled in config');
        }

        console.log('🔍 Starting device discovery...');

        await this.discovery.startDiscovery(this.config.discovery.serviceType);

        // Auto-connect to preferred devices if configured
        if (this.config.discovery.autoConnect && this.config.discovery.preferredDevices) {
            this.setupAutoConnect();
        }
    }

    /**
     * Initialize hybrid mode (both server and client)
     */
    private async initializeHybridMode(): Promise<void> {
        const tasks = [];

        // Start server if enabled
        if (this.config.server.enabled) {
            tasks.push(this.initializeServerMode());
        }

        // Start discovery if enabled
        if (this.config.discovery.enabled) {
            tasks.push(this.initializeClientMode());
        }

        if (tasks.length === 0) {
            throw new Error('Hybrid mode requested but both server and discovery are disabled');
        }

        await Promise.all(tasks);
    }

    /**
     * Setup automatic connection to preferred devices
     */
    private setupAutoConnect(): void {
        this.discovery.on('device-discovered', async (device: DiscoveredDevice) => {
            const preferredDevices = this.config.discovery.preferredDevices || [];

            // Check if this device is in our preferred list
            const isPreferred = preferredDevices.some(preferred =>
                device.name.includes(preferred) ||
                device.id.includes(preferred) ||
                device.deviceId === preferred
            );

            if (isPreferred) {
                try {
                    console.log(`🔗 Auto-connecting to preferred device: ${device.name}`);
                    await this.discovery.connectToDevice(device.id);
                } catch (error) {
                    console.error(`❌ Auto-connect failed for ${device.name}:`, error);
                }
            }
        });
    }

    /**
     * Setup event handlers for server and discovery
     */
    private setupEventHandlers(): void {
        // Discovery events
        this.discovery.on('device-discovered', (device) => {
            console.log(`📡 Device discovered: ${device.name}`);
            this.emit('device-discovered', device);
        });

        this.discovery.on('device-connected', (connection) => {
            console.log(`🔗 Connected to device: ${connection.device.name}`);
            this.emit('device-connected', connection);
        });

        this.discovery.on('device-disconnected', (connection) => {
            console.log(`🔌 Disconnected from device: ${connection.device.name}`);
            this.emit('device-disconnected', connection);
        });

        this.discovery.on('websocket-message', (data) => {
            this.emit('device-message', data);
        });

        this.discovery.on('voice-transcription', (data) => {
            this.emit('voice-transcription', data);
        });

        this.discovery.on('voice-response-complete', (data) => {
            this.emit('voice-response-complete', data);
        });
    }

    /**
     * Get list of discovered devices
     */
    getDiscoveredDevices(): DiscoveredDevice[] {
        return this.discovery.getDiscoveredDevices();
    }

    /**
     * Get list of reachable devices
     */
    getReachableDevices(): DiscoveredDevice[] {
        return this.discovery.getReachableDevices();
    }

    /**
     * Connect to a specific device
     */
    async connectToDevice(deviceId: string): Promise<DeviceConnection> {
        return await this.discovery.connectToDevice(deviceId);
    }

    /**
     * Disconnect from a specific device
     */
    async disconnectFromDevice(deviceId: string): Promise<void> {
        await this.discovery.disconnectDevice(deviceId);
    }

    /**
     * Send message to a connected device
     */
    async sendMessageToDevice(deviceId: string, message: any): Promise<void> {
        await this.discovery.sendWebSocketMessage(deviceId, message);
    }

    /**
     * Send HTTP request to a connected device
     */
    async sendHttpRequestToDevice(deviceId: string, endpoint: string, options?: RequestInit): Promise<any> {
        return await this.discovery.sendHttpRequest(deviceId, endpoint, options);
    }

    /**
     * Get device status information
     */
    getDeviceStatus(): DeviceStatus {
        const serverStatus = this.server?.getStatus();
        const discoveryStatus = this.discovery.getStatus();

        return {
            mode: this.currentMode,
            server: {
                isRunning: serverStatus?.isRunning || false,
                port: serverStatus?.config.port,
                clients: serverStatus?.clients || 0
            },
            discovery: {
                isScanning: discoveryStatus.isScanning,
                devicesFound: discoveryStatus.devicesDiscovered,
                connectedDevices: discoveryStatus.activeConnections
            },
            capabilities: {
                canServe: this.server !== null,
                canDiscover: this.discovery !== null,
                canConnect: discoveryStatus.activeConnections > 0
            }
        };
    }

    /**
     * Start voice session on local device (if server mode)
     */
    async startLocalVoiceSession(): Promise<void> {
        if (!this.server) {
            throw new Error('No local server available for voice session');
        }

        // This would trigger the server's voice session
        // Implementation depends on how the server exposes this functionality
        console.log('🎤 Starting local voice session...');
    }

    /**
     * Start voice session on remote device
     */
    async startRemoteVoiceSession(deviceId: string): Promise<void> {
        await this.sendHttpRequestToDevice(deviceId, '/api/voice/session/start', {
            method: 'POST'
        });

        console.log(`🎤 Started remote voice session on device: ${deviceId}`);
    }

    /**
     * Execute command on remote device
     */
    async executeRemoteCommand(deviceId: string, command: string): Promise<any> {
        return await this.sendHttpRequestToDevice(deviceId, '/api/voice/command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: command,
                language: 'en-US'
            })
        });
    }

    /**
     * Get audio devices from remote device
     */
    async getRemoteAudioDevices(deviceId: string): Promise<any> {
        return await this.sendHttpRequestToDevice(deviceId, '/api/audio/devices');
    }

    /**
     * Set audio device on remote device
     */
    async setRemoteAudioDevice(deviceId: string, type: 'input' | 'output', deviceId_: string): Promise<any> {
        return await this.sendHttpRequestToDevice(deviceId, '/api/audio/devices/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                deviceId: deviceId_
            })
        });
    }

    /**
     * Switch to different mode
     */
    async switchMode(newMode: 'server' | 'client' | 'hybrid'): Promise<void> {
        if (newMode === this.currentMode) {
            console.log(`Already in ${newMode} mode`);
            return;
        }

        console.log(`🔄 Switching from ${this.currentMode} to ${newMode} mode...`);

        // Stop current operations
        await this.shutdown();

        // Update config and reinitialize
        this.config.mode = newMode;
        this.isInitialized = false;

        await this.initialize();

        console.log(`✅ Successfully switched to ${newMode} mode`);
        this.emit('mode-changed', { oldMode: this.currentMode, newMode: newMode });
    }

    /**
     * Check if we can fall back to local mode
     */
    canFallbackToLocal(): boolean {
        return this.config.fallbackToLocal && this.config.server.enabled;
    }

    /**
     * Fallback to local server mode
     */
    async fallbackToLocal(): Promise<void> {
        if (!this.canFallbackToLocal()) {
            throw new Error('Local fallback not available');
        }

        console.log('🔄 Falling back to local server mode...');
        await this.switchMode('server');
    }

    /**
     * Get comprehensive status for debugging
     */
    getDebugStatus() {
        return {
            integration: {
                isInitialized: this.isInitialized,
                currentMode: this.currentMode,
                config: this.config
            },
            server: this.server?.getStatus() || null,
            discovery: this.discovery.getStatus(),
            devices: this.discovery.getDiscoveredDevices(),
            connections: this.discovery.getConnections()
        };
    }

    /**
     * Shutdown the integration system
     */
    async shutdown(): Promise<void> {
        console.log('🛑 Shutting down device integration...');

        try {
            // Stop server if running
            if (this.server) {
                await this.server.stop();
                this.server = null;
            }

            // Stop discovery
            await this.discovery.stopDiscovery();

            this.isInitialized = false;
            this.emit('shutdown');

            console.log('✅ Device integration shutdown complete');

        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            throw error;
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.shutdown();
        await this.discovery.cleanup();
        this.removeAllListeners();
    }
}

// Create default configuration
export function createDefaultDeviceConfig(overrides: Partial<DeviceIntegrationConfig> = {}): DeviceIntegrationConfig {
    return {
        server: {
            enabled: true,
            config: {
                port: 4001,
                host: '0.0.0.0',
                serviceName: 'METU AI Assistant',
                serviceType: '_metu-ai._tcp',
                corsOrigins: ['*'],
                enableRateLimit: true,
                maxRequestsPerWindow: 100,
                windowMs: 60000,
                azure: {
                    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
                    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
                    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-realtime-preview',
                    apiVersion: '2024-10-01-preview',
                    voice: 'alloy'
                }
            }
        },
        discovery: {
            enabled: true,
            serviceType: '_metu-ai._tcp',
            autoConnect: false,
            preferredDevices: []
        },
        mode: 'hybrid',
        fallbackToLocal: true,
        ...overrides
    };
}
