// Use conditional import to handle systeminformation dependency
let si: any = null;

try {
    if (typeof window === 'undefined') {
        // Only import on server-side
        si = require('systeminformation');
    }
} catch (error) {
    // eslint-disable-next-line no-console
    console.warn('systeminformation package not available, using mock data');
}

export interface SystemMetrics {
    activeUsers: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkActivity: {
        bytesReceived: number;
        bytesSent: number;
    };
    systemUptime: number;
}

export interface ServiceHealth {
    name: string;
    port: number;
    status: 'online' | 'offline';
    responseTime?: number;
}

export class SystemMonitor {
    private static instance: SystemMonitor;
    private metricsCache: SystemMetrics | null = null;
    private servicesCache: ServiceHealth[] | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_DURATION = 30000; // 30 seconds

    public static getInstance(): SystemMonitor {
        if (!SystemMonitor.instance) {
            SystemMonitor.instance = new SystemMonitor();
        }
        return SystemMonitor.instance;
    }

    private isCacheValid(): boolean {
        return this.cacheExpiry > Date.now();
    }

    public async getSystemMetrics(): Promise<SystemMetrics> {
        if (this.metricsCache && this.isCacheValid()) {
            return this.metricsCache;
        }

        // If systeminformation is not available or we're on client-side, return mock data
        if (!si || typeof window !== 'undefined') {
            const mockMetrics: SystemMetrics = {
                activeUsers: 2 + Math.floor(Math.random() * 5),
                cpuUsage: 15 + Math.floor(Math.random() * 50),
                memoryUsage: 30 + Math.floor(Math.random() * 40),
                diskUsage: 20 + Math.floor(Math.random() * 30),
                networkActivity: {
                    bytesReceived: 1000000 + Math.floor(Math.random() * 5000000),
                    bytesSent: 500000 + Math.floor(Math.random() * 2000000),
                },
                systemUptime: Date.now() - Math.floor(Math.random() * 86400000), // Up to 24 hours
            };

            this.metricsCache = mockMetrics;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            return mockMetrics;
        }

        try {
            // Get CPU usage
            const cpu = await si.currentLoad();

            // Get memory usage
            const memory = await si.mem();

            // Get disk usage
            const diskLayout = await si.diskLayout();
            const fsSize = await si.fsSize();

            // Get network stats
            const networkStats = await si.networkStats();

            // Get system uptime
            const time = await si.time();

            // Get active user count (approximation)
            const processes = await si.processes();
            const activeUsers = new Set(
                processes.list
                    .filter((p: any) => p.user && p.user !== 'SYSTEM' && p.user !== 'NT AUTHORITY')
                    .map((p: any) => p.user)
            ).size;

            const metrics: SystemMetrics = {
                activeUsers: Math.max(1, activeUsers), // At least 1 active user
                cpuUsage: Math.round(cpu.currentLoad || 0),
                memoryUsage: Math.round((memory.used / memory.total) * 100),
                diskUsage: fsSize.length > 0 ? Math.round((fsSize[0].used / fsSize[0].size) * 100) : 0,
                networkActivity: {
                    bytesReceived: networkStats.length > 0 ? networkStats[0].rx_bytes || 0 : 0,
                    bytesSent: networkStats.length > 0 ? networkStats[0].tx_bytes || 0 : 0,
                },
                systemUptime: time.uptime || 0,
            };

            // Cache the results
            this.metricsCache = metrics;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            return metrics;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting system metrics:', error);

            // Return fallback mock data if real metrics fail
            return {
                activeUsers: 1,
                cpuUsage: Math.floor(Math.random() * 100),
                memoryUsage: Math.floor(Math.random() * 100),
                diskUsage: Math.floor(Math.random() * 100),
                networkActivity: {
                    bytesReceived: Math.floor(Math.random() * 1000000),
                    bytesSent: Math.floor(Math.random() * 1000000),
                },
                systemUptime: Math.floor(Math.random() * 1000000),
            };
        }
    }

    public async getServiceHealth(): Promise<ServiceHealth[]> {
        if (this.servicesCache && this.isCacheValid()) {
            return this.servicesCache;
        }

        const services = [
            { name: 'CODAI Core', port: 4030 },
            { name: 'MEMORAI', port: 4031 },
            { name: 'BANCAI', port: 4033 },
            { name: 'STOCAI', port: 4065 },
            { name: 'PREZENTAI', port: 4081 },
            { name: 'TALENTAI', port: 4040 },
            { name: 'Database', port: 5432 },
            { name: 'Redis', port: 6379 },
        ];

        const healthChecks = await Promise.all(
            services.map(async (service) => {
                const startTime = Date.now();
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(`http://localhost:${service.port}/health`, {
                        method: 'GET',
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);
                    const responseTime = Date.now() - startTime;

                    return {
                        name: service.name,
                        port: service.port,
                        status: response.ok ? 'online' : 'offline',
                        responseTime,
                    } as ServiceHealth;
                } catch (error) {
                    return {
                        name: service.name,
                        port: service.port,
                        status: 'offline',
                        responseTime: Date.now() - startTime,
                    } as ServiceHealth;
                }
            })
        );

        // Cache the results
        this.servicesCache = healthChecks;

        return healthChecks;
    }

    public async getActiveUsers(): Promise<number> {
        if (!si || typeof window !== 'undefined') {
            return 2 + Math.floor(Math.random() * 5); // Mock data
        }

        try {
            const processes = await si.processes();
            const activeUsers = new Set(
                processes.list
                    .filter((p: any) => p.user && p.user !== 'SYSTEM' && p.user !== 'NT AUTHORITY')
                    .map((p: any) => p.user)
            ).size;

            return Math.max(1, activeUsers);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting active users:', error);
            return 1; // Default to 1 active user
        }
    }

    public async getSystemPerformance(): Promise<{
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
    }> {
        if (!si || typeof window !== 'undefined') {
            return {
                cpuUsage: 15 + Math.floor(Math.random() * 50),
                memoryUsage: 30 + Math.floor(Math.random() * 40),
                diskUsage: 20 + Math.floor(Math.random() * 30),
            };
        }

        try {
            const [cpu, memory, fsSize] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
            ]);

            return {
                cpuUsage: Math.round(cpu.currentLoad || 0),
                memoryUsage: Math.round((memory.used / memory.total) * 100),
                diskUsage: fsSize.length > 0 ? Math.round((fsSize[0].used / fsSize[0].size) * 100) : 0,
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting system performance:', error);
            // Return fallback data
            return {
                cpuUsage: Math.floor(Math.random() * 100),
                memoryUsage: Math.floor(Math.random() * 100),
                diskUsage: Math.floor(Math.random() * 100),
            };
        }
    }

    public async getNetworkActivity(): Promise<{
        bytesReceived: number;
        bytesSent: number;
    }> {
        if (!si || typeof window !== 'undefined') {
            return {
                bytesReceived: 1000000 + Math.floor(Math.random() * 5000000),
                bytesSent: 500000 + Math.floor(Math.random() * 2000000),
            };
        }

        try {
            const networkStats = await si.networkStats();

            return {
                bytesReceived: networkStats.length > 0 ? networkStats[0].rx_bytes || 0 : 0,
                bytesSent: networkStats.length > 0 ? networkStats[0].tx_bytes || 0 : 0,
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting network activity:', error);
            // Return fallback data
            return {
                bytesReceived: Math.floor(Math.random() * 1000000),
                bytesSent: Math.floor(Math.random() * 1000000),
            };
        }
    }

    public clearCache(): void {
        this.metricsCache = null;
        this.servicesCache = null;
        this.cacheExpiry = 0;
    }
}
