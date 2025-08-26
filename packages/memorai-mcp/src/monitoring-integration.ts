/**
 * Production Monitoring Integration for MemorAI MCP Server
 * 
 * This module provides production monitoring capabilities that can be
 * integrated into the existing MCP server without major refactoring.
 * 
 * Features:
 * - Health check endpoint enhancement
 * - Performance metrics collection
 * - Error monitoring and alerting
 * - Graceful shutdown handling
 * 
 * @version 2.0.0
 * @author MemorAI Development Team
 */

import { ProductionMonitoringSystem, DEFAULT_MONITORING_CONFIG } from './production-monitoring.js';
import { randomUUID } from 'crypto';

/**
 * Production monitoring integration class
 */
export class MCPProductionMonitoring {
    private monitoringSystem: ProductionMonitoringSystem;
    private isEnabled: boolean;

    constructor() {
        this.isEnabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_MONITORING === 'true';

        if (this.isEnabled) {
            this.monitoringSystem = new ProductionMonitoringSystem(DEFAULT_MONITORING_CONFIG);
            console.log('[MemorAI MCP] ✅ Production monitoring enabled');
        } else {
            // Create minimal monitoring for development
            this.monitoringSystem = new ProductionMonitoringSystem({
                ...DEFAULT_MONITORING_CONFIG,
                performanceCollection: { ...DEFAULT_MONITORING_CONFIG.performanceCollection, enabled: false },
                healthChecks: { ...DEFAULT_MONITORING_CONFIG.healthChecks, enabled: false }
            });
            console.log('[MemorAI MCP] ✅ Development monitoring enabled');
        }
    }

    /**
     * Get enhanced health status
     */
    public getHealthStatus() {
        const systemStatus = this.monitoringSystem.getSystemStatus();
        const correlationId = randomUUID();

        return {
            status: systemStatus.status,
            service: 'enhanced-memorai-mcp-server',
            version: '2.0.0',
            uptime: systemStatus.uptime,
            correlationId,
            monitoring: {
                enabled: this.isEnabled,
                metrics: systemStatus.metrics,
                healthChecks: systemStatus.healthChecks,
                circuitBreakers: systemStatus.circuitBreakers
            }
        };
    }

    /**
     * Record a request with monitoring
     */
    public recordRequest(responseTime: number, success: boolean, correlationId?: string): void {
        if (this.isEnabled) {
            this.monitoringSystem.recordRequest(responseTime, success, correlationId);
        }
    }

    /**
     * Execute operation with monitoring
     */
    public async executeWithMonitoring<T>(
        operation: string,
        fn: () => Promise<T>,
        correlationId?: string
    ): Promise<T> {
        if (this.isEnabled) {
            return this.monitoringSystem.executeWithCircuitBreaker(operation, fn, correlationId);
        } else {
            return fn();
        }
    }

    /**
     * Log with structured logging
     */
    public log(level: 'error' | 'warn' | 'info' | 'debug', message: string, context?: Record<string, any>): void {
        this.monitoringSystem.log(level, message, context);
    }

    /**
     * Get Prometheus metrics
     */
    public getPrometheusMetrics(): string {
        return this.monitoringSystem.exportMetrics();
    }

    /**
     * Graceful shutdown
     */
    public async shutdown(): Promise<void> {
        if (this.isEnabled) {
            await this.monitoringSystem.shutdown();
        }
    }
}

// Singleton instance for easy integration
export const productionMonitoring = new MCPProductionMonitoring();