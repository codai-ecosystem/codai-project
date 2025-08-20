import { Request, Response, NextFunction } from 'express';
import { monitoringSystem } from './MonitoringSystem';
import si from 'systeminformation';

/**
 * Comprehensive Health Checker for MemorAI Platform Services
 * 
 * Implements detailed health checks for:
 * - Database connectivity
 * - External APIs
 * - System resources
 * - Service dependencies
 * - Performance metrics
 */

interface HealthCheckResult {
    status: 'healthy' | 'warning' | 'unhealthy';
    details?: Record<string, any>;
    responseTime?: number;
    timestamp?: number;
}

interface ServiceHealthConfig {
    name: string;
    url?: string;
    timeout?: number;
    interval?: number;
    retries?: number;
    critical?: boolean;
}

class HealthChecker {
    private registeredChecks = new Map<string, ServiceHealthConfig>();
    private checkResults = new Map<string, HealthCheckResult>();
    private checkInterval?: NodeJS.Timeout;

    constructor() {
        this.registerDefaultChecks();
    }

    /**
     * Register default system health checks
     */
    private registerDefaultChecks(): void {
        // CBD Database Health Check
        monitoringSystem.registerHealthCheck('cbd-database', async () => {
            try {
                const startTime = Date.now();
                const response = await fetch('http://localhost:4180/health', {
                    method: 'GET',
                    timeout: 5000
                });

                const responseTime = Date.now() - startTime;

                if (response.ok) {
                    const data = await response.json();
                    return {
                        status: 'healthy',
                        details: {
                            responseTime,
                            version: data.version,
                            status: data.status,
                            uptime: data.uptime
                        }
                    };
                } else {
                    return {
                        status: 'unhealthy',
                        details: {
                            responseTime,
                            statusCode: response.status,
                            statusText: response.statusText
                        }
                    };
                }
            } catch (error) {
                monitoringSystem.log('error', 'HealthChecker', 'CBD Database health check failed', {}, error as Error);
                return {
                    status: 'unhealthy',
                    details: {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                };
            }
        });

        // MemorAI MCP Server Health Check
        monitoringSystem.registerHealthCheck('memorai-mcp', async () => {
            try {
                const startTime = Date.now();
                const response = await fetch('http://localhost:4950/health', {
                    method: 'GET',
                    timeout: 5000
                });

                const responseTime = Date.now() - startTime;

                if (response.ok) {
                    const data = await response.json();
                    return {
                        status: 'healthy',
                        details: {
                            responseTime,
                            version: data.version,
                            status: data.status,
                            features: data.features
                        }
                    };
                } else {
                    return {
                        status: 'unhealthy',
                        details: {
                            responseTime,
                            statusCode: response.status,
                            statusText: response.statusText
                        }
                    };
                }
            } catch (error) {
                monitoringSystem.log('error', 'HealthChecker', 'MemorAI MCP health check failed', {}, error as Error);
                return {
                    status: 'unhealthy',
                    details: {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                };
            }
        });

        // System Resource Health Check
        monitoringSystem.registerHealthCheck('system-resources', async () => {
            try {
                const [cpu, memory, disk] = await Promise.all([
                    si.currentLoad(),
                    si.mem(),
                    si.fsSize()
                ]);

                const cpuLoad = cpu.currentload;
                const memoryUsage = (memory.used / memory.total) * 100;
                const diskUsage = disk.length > 0 ? (disk[0].used / disk[0].size) * 100 : 0;

                let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';

                if (cpuLoad > 90 || memoryUsage > 95 || diskUsage > 95) {
                    status = 'unhealthy';
                } else if (cpuLoad > 70 || memoryUsage > 80 || diskUsage > 80) {
                    status = 'warning';
                }

                return {
                    status,
                    details: {
                        cpu: {
                            load: cpuLoad,
                            cores: cpu.cpus?.length || 0
                        },
                        memory: {
                            usage: memoryUsage,
                            total: memory.total,
                            free: memory.free
                        },
                        disk: {
                            usage: diskUsage,
                            total: disk[0]?.size || 0,
                            free: disk[0]?.available || 0
                        }
                    }
                };
            } catch (error) {
                monitoringSystem.log('error', 'HealthChecker', 'System resources health check failed', {}, error as Error);
                return {
                    status: 'unhealthy',
                    details: {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                };
            }
        });

        // Memory Leak Detection
        monitoringSystem.registerHealthCheck('memory-leak-detection', async () => {
            const usage = process.memoryUsage();
            const heapUsedMB = usage.heapUsed / 1024 / 1024;
            const heapTotalMB = usage.heapTotal / 1024 / 1024;
            const externalMB = usage.external / 1024 / 1024;

            let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';

            // Alert if heap usage exceeds 1GB
            if (heapUsedMB > 1024) {
                status = 'unhealthy';
            } else if (heapUsedMB > 512) {
                status = 'warning';
            }

            return {
                status,
                details: {
                    heapUsed: `${heapUsedMB.toFixed(2)} MB`,
                    heapTotal: `${heapTotalMB.toFixed(2)} MB`,
                    external: `${externalMB.toFixed(2)} MB`,
                    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
                    arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
                }
            };
        });

        // Process Health Check
        monitoringSystem.registerHealthCheck('process-health', async () => {
            const uptime = process.uptime();
            const pid = process.pid;
            const nodeVersion = process.version;
            const platform = process.platform;
            const arch = process.arch;

            let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';

            // Warning if uptime is very low (might indicate recent crashes)
            if (uptime < 60) {
                status = 'warning';
            }

            return {
                status,
                details: {
                    uptime: `${Math.floor(uptime)} seconds`,
                    pid,
                    nodeVersion,
                    platform,
                    arch,
                    title: process.title,
                    execPath: process.execPath
                }
            };
        });

        console.log('[HealthChecker] Default health checks registered');
    }

    /**
     * Express middleware for health check endpoint
     */
    healthCheckMiddleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const healthStatus = await monitoringSystem.getHealthStatus();

                // Set appropriate HTTP status
                let httpStatus = 200;
                if (healthStatus.overall === 'warning') {
                    httpStatus = 200; // Still operational
                } else if (healthStatus.overall === 'unhealthy') {
                    httpStatus = 503; // Service unavailable
                }

                res.status(httpStatus).json({
                    status: healthStatus.overall,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: process.env.npm_package_version || '1.0.0',
                    services: healthStatus.services.map(service => ({
                        name: service.name,
                        status: service.status,
                        responseTime: service.responseTime,
                        lastCheck: new Date(service.lastCheck).toISOString(),
                        details: service.details,
                        error: service.error
                    })),
                    system: {
                        platform: process.platform,
                        arch: process.arch,
                        nodeVersion: process.version,
                        pid: process.pid,
                        memory: process.memoryUsage(),
                        cpu: process.cpuUsage()
                    }
                });

                monitoringSystem.log('info', 'HealthChecker', 'Health check endpoint accessed', {
                    overall: healthStatus.overall,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });

            } catch (error) {
                monitoringSystem.log('error', 'HealthChecker', 'Health check endpoint error', {}, error as Error);

                res.status(500).json({
                    status: 'error',
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }

    /**
     * Detailed health check endpoint with more information
     */
    detailedHealthCheckMiddleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const [healthStatus, dashboardData] = await Promise.all([
                    monitoringSystem.getHealthStatus(),
                    monitoringSystem.getDashboardData()
                ]);

                const systemInfo = await this.getDetailedSystemInfo();

                res.json({
                    status: healthStatus.overall,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: process.env.npm_package_version || '1.0.0',
                    services: healthStatus.services,
                    system: systemInfo,
                    performance: dashboardData.performance,
                    alerts: dashboardData.alerts,
                    logs: {
                        recentErrors: dashboardData.logs.recent.filter(log => log.level === 'error').slice(0, 10),
                        errorCount: dashboardData.logs.errorCount,
                        warnCount: dashboardData.logs.warnCount
                    },
                    metrics: dashboardData.metrics
                });

            } catch (error) {
                monitoringSystem.log('error', 'HealthChecker', 'Detailed health check error', {}, error as Error);

                res.status(500).json({
                    status: 'error',
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }

    /**
     * Readiness check - specifically for Kubernetes/container orchestration
     */
    readinessCheckMiddleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const healthStatus = await monitoringSystem.getHealthStatus();

                // For readiness, we're stricter - any unhealthy service means not ready
                const isReady = healthStatus.overall === 'healthy';

                res.status(isReady ? 200 : 503).json({
                    ready: isReady,
                    timestamp: new Date().toISOString(),
                    status: healthStatus.overall,
                    services: healthStatus.services.map(s => ({
                        name: s.name,
                        ready: s.status === 'healthy'
                    }))
                });

            } catch (error) {
                res.status(503).json({
                    ready: false,
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }

    /**
     * Liveness check - basic service availability
     */
    livenessCheckMiddleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Basic liveness - just check if the process is responsive
                const isAlive = true; // If we can execute this, we're alive

                res.status(200).json({
                    alive: isAlive,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    pid: process.pid
                });

            } catch (error) {
                res.status(500).json({
                    alive: false,
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }

    /**
     * Get detailed system information
     */
    private async getDetailedSystemInfo(): Promise<Record<string, any>> {
        try {
            const [cpu, mem, osInfo, networkInterfaces] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.osInfo(),
                si.networkInterfaces()
            ]);

            return {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid,
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    cores: cpu.cores,
                    physicalCores: cpu.physicalCores,
                    speed: cpu.speed
                },
                memory: {
                    total: mem.total,
                    free: mem.free,
                    used: mem.used,
                    active: mem.active,
                    available: mem.available
                },
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    arch: osInfo.arch,
                    hostname: osInfo.hostname,
                    uptime: osInfo.uptime
                },
                process: {
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    uptime: process.uptime(),
                    title: process.title,
                    execPath: process.execPath,
                    argv: process.argv
                },
                network: networkInterfaces.filter(iface => !iface.internal).map(iface => ({
                    name: iface.iface,
                    ip4: iface.ip4,
                    ip6: iface.ip6,
                    mac: iface.mac,
                    speed: iface.speed
                }))
            };
        } catch (error) {
            monitoringSystem.log('warn', 'HealthChecker', 'Could not get detailed system info', {}, error as Error);
            return {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid,
                error: 'Detailed system info unavailable'
            };
        }
    }

    /**
     * Register a custom health check
     */
    registerCustomCheck(
        name: string,
        checkFn: () => Promise<HealthCheckResult>,
        config?: Partial<ServiceHealthConfig>
    ): void {
        monitoringSystem.registerHealthCheck(name, checkFn);

        if (config) {
            this.registeredChecks.set(name, {
                name,
                ...config
            });
        }

        console.log(`[HealthChecker] Custom health check registered: ${name}`);
    }

    /**
     * Get health check statistics
     */
    getHealthCheckStats(): {
        totalChecks: number;
        healthyChecks: number;
        warningChecks: number;
        unhealthyChecks: number;
        lastUpdate: number;
    } {
        const services = Array.from(monitoringSystem['healthChecks'].values());

        return {
            totalChecks: services.length,
            healthyChecks: services.filter(s => s.status === 'healthy').length,
            warningChecks: services.filter(s => s.status === 'warning').length,
            unhealthyChecks: services.filter(s => s.status === 'unhealthy').length,
            lastUpdate: Math.max(...services.map(s => s.lastCheck))
        };
    }
}

// Create singleton instance
export const healthChecker = new HealthChecker();

// Export class and types
export default HealthChecker;
export type { HealthCheckResult, ServiceHealthConfig };
