/**
 * METU Service Discovery
 * 
 * Enables clients to discover METU server instances on the local network
 * using mDNS/Bonjour protocol for seamless device connectivity.
 * Updated to use bonjour-service for better Windows compatibility.
 */

import { EventEmitter } from 'events';
import { Bonjour } from 'bonjour-service';
import * as os from 'os';

export interface ServiceInfo {
    name: string;
    type: string;
    domain: string;
    host: string;
    port: number;
    fullname: string;
    txtRecord: Record<string, string>;
    addresses: string[];
}

export interface DiscoveryConfig {
    serviceName: string;
    serviceType: string;
    port: number;
    domain?: string;
    txtRecord?: Record<string, string>;
    interfaceFilter?: string[];
}

export class MetuServiceDiscovery extends EventEmitter {
    private config: DiscoveryConfig;
    private bonjour: Bonjour;
    private publishedService: any = null;
    private browser: any = null;
    private discoveredServices: Map<string, ServiceInfo> = new Map();
    private isAdvertising = false;
    private isBrowsing = false;

    constructor(config: DiscoveryConfig) {
        super();
        this.config = {
            domain: 'local',
            txtRecord: {},
            ...config
        };
        this.bonjour = new Bonjour();
    }

    /**
     * Start advertising the METU service
     */
    async startAdvertising(): Promise<void> {
        if (this.isAdvertising) {
            console.log('🔄 Service already advertising');
            return;
        }

        try {
            console.log(`📡 Starting METU service advertisement on port ${this.config.port}...`);

            // Get local network addresses
            const addresses = this.getLocalAddresses();

            // Publish service using bonjour-service
            this.publishedService = this.bonjour.publish({
                name: this.config.serviceName,
                type: this.config.serviceType,
                port: this.config.port,
                txt: this.config.txtRecord,
                host: addresses[0] // Use primary local address
            });

            this.publishedService.on('up', () => {
                this.isAdvertising = true;
                console.log(`✅ METU service advertised: ${this.config.serviceName} on ${this.config.serviceType}`);
                this.emit('advertising', {
                    name: this.config.serviceName,
                    type: this.config.serviceType,
                    port: this.config.port,
                    addresses
                });
            });

            this.publishedService.on('error', (error: any) => {
                console.error('❌ Service advertising error:', error);
                this.isAdvertising = false;
                this.emit('error', error);
            });

        } catch (error) {
            console.error('❌ Failed to start service advertising:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Stop advertising the service
     */
    async stopAdvertising(): Promise<void> {
        if (!this.isAdvertising || !this.publishedService) {
            console.log('🔄 Service not currently advertising');
            return;
        }

        try {
            console.log('🛑 Stopping METU service advertisement...');

            this.publishedService.stop();
            this.publishedService = null;
            this.isAdvertising = false;

            console.log('✅ Service advertisement stopped');
            this.emit('advertisingStopped');

        } catch (error) {
            console.error('❌ Failed to stop service advertising:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Start browsing for other METU services
     */
    async startBrowsing(): Promise<void> {
        if (this.isBrowsing) {
            console.log('🔄 Already browsing for services');
            return;
        }

        try {
            console.log(`🔍 Starting METU service discovery for ${this.config.serviceType}...`);

            // Start browsing for services
            this.browser = this.bonjour.find({ type: this.config.serviceType });

            this.browser.on('up', (service: any) => {
                console.log(`🆕 METU service discovered: ${service.name} at ${service.host}:${service.port}`);

                const serviceInfo: ServiceInfo = {
                    name: service.name,
                    type: service.type,
                    domain: 'local',
                    host: service.host,
                    port: service.port,
                    fullname: `${service.name}.${service.type}.local`,
                    txtRecord: service.txt || {},
                    addresses: service.addresses || [service.host]
                };

                this.discoveredServices.set(service.name, serviceInfo);
                this.emit('serviceUp', serviceInfo);
            });

            this.browser.on('down', (service: any) => {
                console.log(`🔻 METU service went down: ${service.name}`);

                const serviceInfo = this.discoveredServices.get(service.name);
                if (serviceInfo) {
                    this.discoveredServices.delete(service.name);
                    this.emit('serviceDown', serviceInfo);
                }
            });

            this.isBrowsing = true;
            console.log('✅ Service discovery started');
            this.emit('browsingStarted');

        } catch (error) {
            console.error('❌ Failed to start service browsing:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Stop browsing for services
     */
    async stopBrowsing(): Promise<void> {
        if (!this.isBrowsing || !this.browser) {
            console.log('🔄 Not currently browsing for services');
            return;
        }

        try {
            console.log('🛑 Stopping service discovery...');

            this.browser.stop();
            this.browser = null;
            this.isBrowsing = false;
            this.discoveredServices.clear();

            console.log('✅ Service discovery stopped');
            this.emit('browsingStopped');

        } catch (error) {
            console.error('❌ Failed to stop service browsing:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Get the current status of the service discovery
     */
    getStatus() {
        return {
            advertising: this.isAdvertising,
            browsing: this.isBrowsing,
            discoveredServices: this.discoveredServices.size,
            localAddresses: this.getLocalAddresses(),
            config: this.config
        };
    }

    /**
     * Get discovered services
     */
    getDiscoveredServices(): Map<string, ServiceInfo> {
        return new Map(this.discoveredServices);
    }

    /**
     * Get local network addresses
     */
    private getLocalAddresses(): string[] {
        const addresses: string[] = [];
        const interfaces = os.networkInterfaces();

        for (const name of Object.keys(interfaces)) {
            const networkInterface = interfaces[name];
            if (!networkInterface) continue;

            for (const addr of networkInterface) {
                // Skip internal (loopback) and non-IPv4 addresses
                if (!addr.internal && addr.family === 'IPv4') {
                    addresses.push(addr.address);
                }
            }
        }

        // Fallback to localhost if no addresses found
        if (addresses.length === 0) {
            addresses.push('127.0.0.1');
        }

        return addresses;
    }

    /**
     * Cleanup resources
     */
    async destroy(): Promise<void> {
        console.log('🧹 Cleaning up METU service discovery...');

        try {
            await this.stopAdvertising();
            await this.stopBrowsing();

            if (this.bonjour) {
                this.bonjour.destroy();
            }

            this.removeAllListeners();
            console.log('✅ Service discovery cleanup complete');

        } catch (error) {
            console.error('❌ Error during service discovery cleanup:', error);
            throw error;
        }
    }

    /**
     * Find a specific service by name
     */
    findService(serviceName: string): ServiceInfo | undefined {
        return this.discoveredServices.get(serviceName);
    }

    /**
     * Check if a service is available
     */
    isServiceAvailable(serviceName: string): boolean {
        return this.discoveredServices.has(serviceName);
    }

    /**
     * Get all services of a specific type
     */
    getServicesByType(serviceType: string): ServiceInfo[] {
        return Array.from(this.discoveredServices.values()).filter(
            service => service.type === serviceType
        );
    }

    /**
     * Update service TXT record (for advertising service)
     */
    async updateTxtRecord(txtRecord: Record<string, string>): Promise<void> {
        this.config.txtRecord = { ...this.config.txtRecord, ...txtRecord };

        if (this.isAdvertising) {
            // Restart advertising with updated TXT record
            await this.stopAdvertising();
            await this.startAdvertising();
        }
    }

    /**
     * Get service statistics
     */
    getStatistics() {
        const services = Array.from(this.discoveredServices.values());
        const serviceTypes = [...new Set(services.map(s => s.type))];

        return {
            totalServices: services.length,
            serviceTypes: serviceTypes.length,
            uniqueHosts: [...new Set(services.map(s => s.host))].length,
            isActive: this.isAdvertising || this.isBrowsing,
            uptime: this.isAdvertising ? Date.now() : 0
        };
    }
}

export default MetuServiceDiscovery;
