/**
 * Gateway Service
 * Interface for CODAI API Gateway operations
 */

import { CodeaiClient } from '../client/CodeaiClient';
import { HealthStatus, ServiceInfo } from '../types/common';

export class GatewayService {
    constructor(private client: CodeaiClient) { }

    /**
     * Get Gateway health status
     */
    async getHealth(): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: '/health'
        });
    }

    /**
     * Get registered services
     */
    async getServices(): Promise<ServiceInfo[]> {
        return this.client.request<ServiceInfo[]>({
            method: 'GET',
            url: '/services'
        });
    }

    /**
     * Get Gateway statistics
     */
    async getStats(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/stats'
        });
    }

    /**
     * Test routing to a specific service
     */
    async testRouting(serviceName: string): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: `/api/v1/${serviceName}/health`
        });
    }

    /**
     * Get Gateway configuration
     */
    async getConfig(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/config'
        });
    }
}
