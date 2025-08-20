/**
 * Hub Service
 * Service discovery and routing operations
 */

import { CodeaiClient } from '../client/CodeaiClient';
import { HealthStatus } from '../types/common';
import { HubRoute, HubServiceRegistration } from '../types/services';

export class HubService {
    constructor(private client: CodeaiClient) { }

    /**
     * Get Hub Service health status
     */
    async getHealth(): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: '/api/v1/hub/health'
        });
    }

    /**
     * Get all registered services
     */
    async getServices(): Promise<HubServiceRegistration[]> {
        return this.client.request<HubServiceRegistration[]>({
            method: 'GET',
            url: '/api/v1/hub/services'
        });
    }

    /**
     * Register a new service
     */
    async registerService(service: HubServiceRegistration): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/hub/services',
            data: service
        });
    }

    /**
     * Unregister a service
     */
    async unregisterService(serviceName: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/hub/services/${serviceName}`
        });
    }

    /**
     * Get service discovery information
     */
    async getServiceDiscovery(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/hub/discovery'
        });
    }

    /**
     * Get all routes
     */
    async getRoutes(): Promise<HubRoute[]> {
        return this.client.request<HubRoute[]>({
            method: 'GET',
            url: '/api/v1/hub/routes'
        });
    }

    /**
     * Create a new route
     */
    async createRoute(route: Omit<HubRoute, 'id'>): Promise<HubRoute> {
        return this.client.request<HubRoute>({
            method: 'POST',
            url: '/api/v1/hub/routes',
            data: route
        });
    }

    /**
     * Update route
     */
    async updateRoute(routeId: string, updates: Partial<HubRoute>): Promise<HubRoute> {
        return this.client.request<HubRoute>({
            method: 'PUT',
            url: `/api/v1/hub/routes/${routeId}`,
            data: updates
        });
    }

    /**
     * Delete route
     */
    async deleteRoute(routeId: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/hub/routes/${routeId}`
        });
    }

    /**
     * Enable/disable route
     */
    async toggleRoute(routeId: string, enabled: boolean): Promise<void> {
        await this.client.request({
            method: 'PATCH',
            url: `/api/v1/hub/routes/${routeId}`,
            data: { enabled }
        });
    }

    /**
     * Test route health
     */
    async testRoute(routeId: string): Promise<any> {
        return this.client.request({
            method: 'POST',
            url: `/api/v1/hub/routes/${routeId}/test`
        });
    }

    /**
     * Get routing statistics
     */
    async getRoutingStats(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/hub/stats'
        });
    }

    /**
     * Get load balancing configuration
     */
    async getLoadBalancingConfig(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/hub/load-balancing'
        });
    }

    /**
     * Update load balancing configuration
     */
    async updateLoadBalancingConfig(config: any): Promise<void> {
        await this.client.request({
            method: 'PUT',
            url: '/api/v1/hub/load-balancing',
            data: config
        });
    }
}
