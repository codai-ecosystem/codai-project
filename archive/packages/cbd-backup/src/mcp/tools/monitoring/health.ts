/*!
 * CBD MCP Health Check Tool
 * Provides system health status and dependency checks
 */

import { CBDMemoryEngine } from '../../../memory/MemoryEngine.js';
import { HealthStatus } from '../../types.js';
import { CBDMCPConfig } from '../../config.js';

/**
 * Perform comprehensive health check of CBD MCP server
 */
export async function healthCheck(
    engine: CBDMemoryEngine,
    config: CBDMCPConfig
): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthStatus['checks'] = {};

    // Database connectivity check
    try {
        // Try a simple search to test the engine
        await engine.search_memory('health_check_test', 1);

        checks.database = {
            status: 'pass',
            message: `CBD Memory Engine is responsive`,
            timestamp: Date.now(),
        };
    } catch (error: any) {
        checks.database = {
            status: 'fail',
            message: `Database connection failed: ${error?.message || 'Unknown error'}`,
            timestamp: Date.now(),
        };
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memoryUsagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    checks.memory = {
        status: memoryUsagePercentage < 80 ? 'pass' : memoryUsagePercentage < 95 ? 'warn' : 'fail',
        message: `Heap usage: ${Math.round(memoryUsagePercentage)}% (${Math.round(memUsage.heapUsed / 1024 / 1024)}MB)`,
        timestamp: Date.now(),
    };

    // Performance check (simple response time)
    const perfStart = Date.now();
    try {
        await engine.search_memory('performance_test', 1);
        const responseTime = Date.now() - perfStart;

        checks.performance = {
            status: responseTime < 100 ? 'pass' : responseTime < 500 ? 'warn' : 'fail',
            message: `Response time: ${responseTime}ms`,
            timestamp: Date.now(),
        };
    } catch (error: any) {
        checks.performance = {
            status: 'fail',
            message: `Performance check failed: ${error?.message || 'Unknown error'}`,
            timestamp: Date.now(),
        };
    }

    // Configuration validation check
    try {
        const configErrors = validateHealthConfig(config);
        checks.configuration = {
            status: configErrors.length === 0 ? 'pass' : 'warn',
            message: configErrors.length === 0 ? 'Configuration valid' : `Configuration issues: ${configErrors.join(', ')}`,
            timestamp: Date.now(),
        };
    } catch (error: any) {
        checks.configuration = {
            status: 'fail',
            message: `Configuration check failed: ${error?.message || 'Unknown error'}`,
            timestamp: Date.now(),
        };
    }

    // Determine overall status
    const allChecks = Object.values(checks);
    const failedChecks = allChecks.filter((check: any) => check.status === 'fail');
    const warnChecks = allChecks.filter((check: any) => check.status === 'warn');

    let overallStatus: HealthStatus['status'];
    if (failedChecks.length > 0) {
        overallStatus = 'unhealthy';
    } else if (warnChecks.length > 0) {
        overallStatus = 'degraded';
    } else {
        overallStatus = 'healthy';
    }

    // Get database info for health status
    let dbStats = { totalExchanges: 0 };
    try {
        // Try a simple operation to test connectivity
        await engine.search_memory('stats_test', 1);
    } catch {
        dbStats = { totalExchanges: 0 };
    }

    return {
        status: overallStatus,
        version: config.server.version,
        uptime: Date.now() - startTime,
        database: {
            connected: checks.database.status !== 'fail',
            collections: 1, // CBD uses single collection model
            vectors: dbStats.totalExchanges || 0,
        },
        memory: {
            usage: memUsage.heapUsed,
            limit: memUsage.heapTotal,
            available: memUsage.heapTotal - memUsage.heapUsed > 50 * 1024 * 1024, // 50MB threshold
        },
        checks,
    };
}

/**
 * Validate health-related configuration
 */
function validateHealthConfig(config: CBDMCPConfig): string[] {
    const errors: string[] = [];

    if (!config.server.name) {
        errors.push('Server name not configured');
    }

    if (!config.server.version) {
        errors.push('Server version not configured');
    }

    if (config.server.timeout < 5000) {
        errors.push('Server timeout too low (recommended: >5000ms)');
    }

    if (config.performance.batchSize > 10000) {
        errors.push('Batch size too large (recommended: <10000)');
    }

    if (config.database.maxVectors && config.database.maxVectors < 1000) {
        errors.push('Max vectors too low (recommended: >1000)');
    }

    return errors;
}

/**
 * Get simple health check result for quick status
 */
export async function quickHealthCheck(engine: CBDMemoryEngine): Promise<{ status: string; message: string }> {
    try {
        // Try a simple search to test the engine
        await engine.search_memory('health_check_test', 1);
        return {
            status: 'healthy',
            message: 'CBD MCP server is operational',
        };
    } catch (error: any) {
        return {
            status: 'unhealthy',
            message: `Health check failed: ${error?.message || 'Unknown error'}`,
        };
    }
}
