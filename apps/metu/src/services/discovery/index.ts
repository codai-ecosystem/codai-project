/**
 * METU Device Integration Initialization
 * 
 * Main entry point for initializing the METU device server discovery architecture.
 * Provides a simple interface for starting the integrated system with proper
 * configuration and error handling.
 */

import { MetuDeviceIntegration, createDefaultDeviceConfig, DeviceIntegrationConfig } from './MetuDeviceIntegration';

export interface InitializationOptions {
    config?: Partial<DeviceIntegrationConfig>;
    autoStart?: boolean;
    verbose?: boolean;
}

class MetuDeviceManager {
    private integration: MetuDeviceIntegration | null = null;
    private isStarted = false;
    private verbose = false;

    /**
     * Initialize the METU device system
     */
    async initialize(options: InitializationOptions = {}): Promise<MetuDeviceIntegration> {
        if (this.integration) {
            this.log('⚠️ Device system already initialized');
            return this.integration;
        }

        this.verbose = options.verbose || false;
        this.log('🚀 Initializing METU Device System...');

        try {
            // Create configuration
            const config = createDefaultDeviceConfig(options.config);

            // Validate configuration
            this.validateConfiguration(config);

            // Create integration instance
            this.integration = new MetuDeviceIntegration(config);

            // Setup event handlers
            this.setupEventHandlers();

            // Auto-start if requested
            if (options.autoStart !== false) {
                await this.start();
            }

            this.log('✅ METU Device System initialized successfully');
            return this.integration;

        } catch (error) {
            console.error('❌ Failed to initialize METU Device System:', error);
            throw error;
        }
    }

    /**
     * Start the device system
     */
    async start(): Promise<void> {
        if (!this.integration) {
            throw new Error('Device system not initialized. Call initialize() first.');
        }

        if (this.isStarted) {
            this.log('⚠️ Device system already started');
            return;
        }

        this.log('▶️ Starting METU Device System...');

        try {
            await this.integration.initialize();
            this.isStarted = true;
            this.log('✅ METU Device System started successfully');

        } catch (error) {
            console.error('❌ Failed to start METU Device System:', error);
            throw error;
        }
    }

    /**
     * Stop the device system
     */
    async stop(): Promise<void> {
        if (!this.integration || !this.isStarted) {
            this.log('⚠️ Device system not running');
            return;
        }

        this.log('⏹️ Stopping METU Device System...');

        try {
            await this.integration.shutdown();
            this.isStarted = false;
            this.log('✅ METU Device System stopped successfully');

        } catch (error) {
            console.error('❌ Error stopping METU Device System:', error);
            throw error;
        }
    }

    /**
     * Restart the device system
     */
    async restart(): Promise<void> {
        this.log('🔄 Restarting METU Device System...');

        await this.stop();
        await this.start();

        this.log('✅ METU Device System restarted successfully');
    }

    /**
     * Get the integration instance
     */
    getIntegration(): MetuDeviceIntegration | null {
        return this.integration;
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isInitialized: this.integration !== null,
            isStarted: this.isStarted,
            deviceStatus: this.integration?.getDeviceStatus() || null,
            debugStatus: this.integration?.getDebugStatus() || null
        };
    }

    /**
     * Validate configuration
     */
    private validateConfiguration(config: DeviceIntegrationConfig): void {
        // Check Azure configuration if server is enabled
        if (config.server.enabled) {
            const azure = config.server.config.azure;

            if (!azure.apiKey) {
                throw new Error('Azure OpenAI API key is required when server is enabled');
            }

            if (!azure.endpoint) {
                throw new Error('Azure OpenAI endpoint is required when server is enabled');
            }

            this.log(`🔑 Azure OpenAI configured: ${azure.endpoint}`);
        }

        // Validate port availability
        if (config.server.enabled) {
            const port = config.server.config.port;
            if (port < 1024 || port > 65535) {
                throw new Error(`Invalid port number: ${port}. Must be between 1024 and 65535.`);
            }
            this.log(`🌐 Server will start on port: ${port}`);
        }

        // Validate mode
        if (!['server', 'client', 'hybrid'].includes(config.mode)) {
            throw new Error(`Invalid mode: ${config.mode}. Must be 'server', 'client', or 'hybrid'.`);
        }

        this.log(`🎯 Operating mode: ${config.mode}`);
    }

    /**
     * Setup event handlers for the integration
     */
    private setupEventHandlers(): void {
        if (!this.integration) return;

        this.integration.on('initialized', (data) => {
            this.log(`🎉 Device integration initialized in ${data.mode} mode`);
        });

        this.integration.on('device-discovered', (device) => {
            this.log(`📡 Device discovered: ${device.name} (${device.host}:${device.port})`);
        });

        this.integration.on('device-connected', (connection) => {
            this.log(`🔗 Connected to device: ${connection.device.name}`);
        });

        this.integration.on('device-disconnected', (connection) => {
            this.log(`🔌 Disconnected from device: ${connection.device.name}`);
        });

        this.integration.on('voice-transcription', (data) => {
            this.log(`🗣️ Voice transcription from ${data.deviceId}: ${data.transcript}`);
        });

        this.integration.on('voice-response-complete', (data) => {
            this.log(`🎤 Voice response complete from ${data.deviceId}`);
        });

        this.integration.on('mode-changed', (data) => {
            this.log(`🔄 Mode changed from ${data.oldMode} to ${data.newMode}`);
        });

        this.integration.on('shutdown', () => {
            this.log('🛑 Device integration shutdown');
        });
    }

    /**
     * Cleanup on app exit
     */
    private async cleanup(): Promise<void> {
        this.log('🧹 Cleaning up METU Device System...');

        try {
            if (this.integration) {
                await this.integration.cleanup();
                this.integration = null;
            }
            this.isStarted = false;
            this.log('✅ Cleanup complete');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }

    /**
     * Log with verbose control
     */
    private log(message: string): void {
        if (this.verbose) {
            console.log(`[METU Device Manager] ${message}`);
        }
    }

    /**
     * Setup Electron app event handlers (optional)
     */
    setupElectronHandlers(): void {
        try {
            // Try to import electron only if available
            const { app } = require('electron');

            // Handle app quit
            app.on('before-quit', async () => {
                await this.cleanup();
            });

            // Handle window close
            app.on('window-all-closed', async () => {
                if (process.platform !== 'darwin') {
                    await this.cleanup();
                }
            });

            // Handle app activation (macOS)
            app.on('activate', async () => {
                if (!this.isStarted && this.integration) {
                    await this.start();
                }
            });

            console.log('✅ Electron event handlers setup complete');
        } catch (error) {
            // Electron not available - skip handler setup
            console.log('ℹ️ Electron not available - skipping app event handlers');
        }
    }
}

// Create singleton instance
export const deviceManager = new MetuDeviceManager();

// Convenience functions
export async function initializeMetuDevices(options: InitializationOptions = {}): Promise<MetuDeviceIntegration> {
    return await deviceManager.initialize(options);
}

export async function startMetuDevices(): Promise<void> {
    return await deviceManager.start();
}

export async function stopMetuDevices(): Promise<void> {
    return await deviceManager.stop();
}

export async function restartMetuDevices(): Promise<void> {
    return await deviceManager.restart();
}

export function getMetuDeviceStatus() {
    return deviceManager.getStatus();
}

export function getMetuDeviceIntegration(): MetuDeviceIntegration | null {
    return deviceManager.getIntegration();
}

// Quick start function with sensible defaults
export async function quickStartMetuDevices(verbose = false): Promise<MetuDeviceIntegration> {
    console.log('🚀 Quick-starting METU Device System...');

    const integration = await initializeMetuDevices({
        verbose: verbose,
        autoStart: true,
        config: {
            mode: 'hybrid',
            fallbackToLocal: true,
            discovery: {
                enabled: true,
                autoConnect: false
            }
        }
    });

    console.log('✅ METU Device System is ready!');
    return integration;
}

// Export for debugging
export { deviceManager as debug };
