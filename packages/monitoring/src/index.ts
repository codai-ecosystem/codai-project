// Export all monitoring components
export { default as MonitoringSystem, monitoringSystem } from './MonitoringSystem';
export { default as HealthChecker, healthChecker } from './HealthChecker';
export { default as AlertManager, alertManager } from './AlertManager';

// Export types
export type {
    LogEntry,
    HealthCheck,
    SystemMetrics,
    Alert
} from './MonitoringSystem';

export type {
    HealthCheckResult,
    ServiceHealthConfig
} from './HealthChecker';

export type {
    AlertRule,
    NotificationChannel,
    AlertEscalation,
    AlertGroup
} from './AlertManager';

// Express middleware exports
export { healthChecker as healthCheckMiddleware } from './HealthChecker';

/**
 * Initialize complete monitoring stack
 */
export function initializeMonitoring(config?: {
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    enableHealthChecks?: boolean;
    enableAlerting?: boolean;
    healthCheckInterval?: number;
    metricsInterval?: number;
}) {
    console.log('[Monitoring] Initializing complete monitoring stack...');

    // Monitoring system is automatically initialized
    // Health checker is automatically initialized
    // Alert manager is automatically initialized

    console.log('[Monitoring] Complete monitoring stack initialized');

    return {
        monitoring: monitoringSystem,
        health: healthChecker,
        alerts: alertManager
    };
}

/**
 * Shutdown all monitoring components
 */
export function shutdownMonitoring() {
    console.log('[Monitoring] Shutting down monitoring stack...');

    monitoringSystem.stop();
    alertManager.stop();

    console.log('[Monitoring] Monitoring stack shutdown complete');
}
