/**
 * Admin Service
 * Administrative operations and dashboard management
 */

import { CodeaiClient } from '../client/CodeaiClient';
import { HealthStatus } from '../types/common';
import {
    AdminDashboardData,
    SystemMetrics,
    Alert,
    LogEntry
} from '../types/services';

export class AdminService {
    constructor(private client: CodeaiClient) { }

    /**
     * Get Admin Service health status
     */
    async getHealth(): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: '/api/v1/admin/health'
        });
    }

    /**
     * Get dashboard data
     */
    async getDashboardData(): Promise<AdminDashboardData> {
        return this.client.request<AdminDashboardData>({
            method: 'GET',
            url: '/api/v1/admin/dashboard'
        });
    }

    /**
     * Get system metrics
     */
    async getSystemMetrics(): Promise<SystemMetrics> {
        return this.client.request<SystemMetrics>({
            method: 'GET',
            url: '/api/v1/admin/metrics'
        });
    }

    /**
     * Get system alerts
     */
    async getAlerts(): Promise<Alert[]> {
        return this.client.request<Alert[]>({
            method: 'GET',
            url: '/api/v1/admin/alerts'
        });
    }

    /**
     * Get system logs
     */
    async getLogs(limit?: number, service?: string): Promise<LogEntry[]> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (service) params.append('service', service);

        return this.client.request<LogEntry[]>({
            method: 'GET',
            url: `/api/v1/admin/logs?${params.toString()}`
        });
    }

    /**
     * Clear system alerts
     */
    async clearAlerts(): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: '/api/v1/admin/alerts'
        });
    }

    /**
     * Resolve specific alert
     */
    async resolveAlert(alertId: string): Promise<void> {
        await this.client.request({
            method: 'PUT',
            url: `/api/v1/admin/alerts/${alertId}/resolve`
        });
    }

    /**
     * Get service configuration
     */
    async getServiceConfig(serviceName: string): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: `/api/v1/admin/services/${serviceName}/config`
        });
    }

    /**
     * Update service configuration
     */
    async updateServiceConfig(serviceName: string, config: any): Promise<void> {
        await this.client.request({
            method: 'PUT',
            url: `/api/v1/admin/services/${serviceName}/config`,
            data: config
        });
    }

    /**
     * Restart service
     */
    async restartService(serviceName: string): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: `/api/v1/admin/services/${serviceName}/restart`
        });
    }

    /**
     * Get service status
     */
    async getServiceStatus(serviceName: string): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: `/api/v1/admin/services/${serviceName}/status`
        });
    }

    /**
     * Execute system maintenance
     */
    async runMaintenance(): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/admin/maintenance'
        });
    }

    /**
     * Get system backup status
     */
    async getBackupStatus(): Promise<any> {
        return this.client.request({
            method: 'GET',
            url: '/api/v1/admin/backup/status'
        });
    }

    /**
     * Create system backup
     */
    async createBackup(): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/admin/backup'
        });
    }

    /**
     * Restore from backup
     */
    async restoreBackup(backupId: string): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: `/api/v1/admin/backup/${backupId}/restore`
        });
    }
}
