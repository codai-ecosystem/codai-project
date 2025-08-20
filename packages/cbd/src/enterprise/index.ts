/**
 * CBD Enterprise Module Exports
 * 
 * Main entry point for all CBD enterprise features
 */

export { CBDClusterManager } from './cluster.js';
export type { ClusterConfig, ClusterNode, ClusterState } from './cluster.js';

export { CBDSecurityManager } from './security.js';
export type {
    SecurityConfig,
    AuthToken,
    User,
    SecurityContext
} from './security.js';

export { CBDEnterpriseServer } from './server.js';
export type {
    ServerConfig,
    ServerStats,
    HealthCheck
} from './server.js';

// Import for local use
import { CBDClusterManager, ClusterConfig } from './cluster.js';
import { CBDSecurityManager, SecurityConfig } from './security.js';
import { CBDEnterpriseServer, ServerConfig } from './server.js';

/**
 * CBD Enterprise Suite
 * 
 * Combined enterprise functionality for clustering, security, and high-performance server
 */
export class CBDEnterprise {
    public cluster?: CBDClusterManager;
    public security?: CBDSecurityManager;
    public server?: CBDEnterpriseServer;

    private isInitialized = false;

    /**
     * Initialize CBD Enterprise with configuration
     */
    async initialize(config: {
        cluster?: ClusterConfig;
        security?: SecurityConfig;
        server?: ServerConfig;
    }): Promise<void> {
        if (this.isInitialized) {
            throw new Error('CBD Enterprise already initialized');
        }

        console.log('Initializing CBD Enterprise Suite');

        // Initialize security first (required for other components)
        if (config.security) {
            this.security = new CBDSecurityManager(config.security);
            await this.security.initialize();
            console.log('✓ Security manager initialized');
        }

        // Initialize cluster manager
        if (config.cluster) {
            this.cluster = new CBDClusterManager(config.cluster);
            await this.cluster.initialize();
            console.log('✓ Cluster manager initialized');
        }

        // Initialize enterprise server
        if (config.server) {
            this.server = new CBDEnterpriseServer(config.server);
            console.log('✓ Enterprise server configured');
        }

        this.isInitialized = true;
        console.log('CBD Enterprise Suite initialization complete');
    }

    /**
     * Start all enterprise services
     */
    async start(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('CBD Enterprise not initialized');
        }

        console.log('Starting CBD Enterprise services');

        // Start cluster first
        if (this.cluster) {
            // Cluster is started during initialization
            console.log('✓ Cluster service active');
        }

        // Start enterprise server
        if (this.server) {
            await this.server.start();
            console.log('✓ Enterprise server started');
        }

        console.log('All CBD Enterprise services started successfully');
    }

    /**
     * Stop all enterprise services
     */
    async stop(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        console.log('Stopping CBD Enterprise services');

        // Stop server first
        if (this.server) {
            await this.server.stop();
            console.log('✓ Enterprise server stopped');
        }

        // Leave cluster
        if (this.cluster) {
            await this.cluster.leaveCluster();
            console.log('✓ Left cluster');
        }

        console.log('All CBD Enterprise services stopped');
    }

    /**
     * Get comprehensive health status
     */
    async getHealth(): Promise<{
        overall: 'healthy' | 'degraded' | 'unhealthy';
        components: {
            cluster?: { healthy: boolean; details: string[] };
            security?: { healthy: boolean; details: string[] };
            server?: { healthy: boolean; details: string[] };
        };
    }> {
        const components: any = {};

        // Check cluster health
        if (this.cluster) {
            try {
                const health = await this.cluster.getHealth();
                components.cluster = health;
            } catch (error) {
                components.cluster = { healthy: false, details: [`Error: ${error}`] };
            }
        }

        // Check security health
        if (this.security) {
            // Security manager doesn't have health check yet, assume healthy if initialized
            components.security = { healthy: true, details: ['Security manager operational'] };
        }

        // Check server health
        if (this.server) {
            try {
                const health = await this.server.healthCheck();
                components.server = {
                    healthy: health.status === 'healthy',
                    details: health.details
                };
            } catch (error) {
                components.server = { healthy: false, details: [`Error: ${error}`] };
            }
        }

        // Determine overall health
        const allHealthy = Object.values(components).every((comp: any) => comp.healthy);
        const anyHealthy = Object.values(components).some((comp: any) => comp.healthy);

        const overall = allHealthy ? 'healthy' : (anyHealthy ? 'degraded' : 'unhealthy');

        return { overall, components };
    }

    /**
     * Check if enterprise suite is ready
     */
    isReady(): boolean {
        return this.isInitialized &&
            (!this.server || this.server.isHealthy());
    }
}

export default CBDEnterprise;
