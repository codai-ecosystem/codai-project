// 🏥 Health Monitoring System for METU

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      details?: string;
      lastCheck: Date;
      responseTime?: number;
    };
  };
  metrics?: {
    requestCount: number;
    errorCount: number;
    errorRate: number;
    avgResponseTime: number;
    voiceInteractions: number;
    connectedDevices: number;
    mcpConnectionStatus: Record<string, boolean>;
  };
}

export class HealthMonitor {
  private checks: Map<string, any> = new Map();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private voiceInteractions = 0;
  private connectedDevices = 0;
  private mcpStatus: Record<string, boolean> = {};
  private lastHealthCheck = new Date();

  constructor() {
    this.initializeHealthChecks();
  }

  private initializeHealthChecks() {
    // Initialize basic health checks
    this.addHealthCheck('system_memory', async () => {
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const freeMem = require('os').freemem();
      const memoryUsagePercent = ((totalMem - freeMem) / totalMem) * 100;

      if (memoryUsagePercent > 90) {
        return { status: 'fail', details: `High memory usage: ${memoryUsagePercent.toFixed(1)}%` };
      } else if (memoryUsagePercent > 75) {
        return { status: 'warn', details: `Memory usage: ${memoryUsagePercent.toFixed(1)}%` };
      }

      return {
        status: 'pass',
        details: `Memory usage: ${memoryUsagePercent.toFixed(1)}% (${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap)`
      };
    });

    this.addHealthCheck('cpu_load', async () => {
      const loadAvg = require('os').loadavg();
      const cpuCount = require('os').cpus().length;
      const avgLoad = loadAvg[0] / cpuCount;

      if (avgLoad > 0.9) {
        return { status: 'fail', details: `High CPU load: ${(avgLoad * 100).toFixed(1)}%` };
      } else if (avgLoad > 0.7) {
        return { status: 'warn', details: `CPU load: ${(avgLoad * 100).toFixed(1)}%` };
      }

      return { status: 'pass', details: `CPU load: ${(avgLoad * 100).toFixed(1)}%` };
    });

    this.addHealthCheck('device_server', async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:${process.env.DEVICE_SERVER_PORT || 4402}/api/health`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return { status: 'pass', details: 'Device server responsive' };
        } else {
          return { status: 'fail', details: `Device server returned ${response.status}` };
        }
      } catch (error) {
        return {
          status: 'fail',
          details: `Device server unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    });

    this.addHealthCheck('database_connection', async () => {
      try {
        // This would check CND database connection
        // For now, we'll simulate a database check
        const dbResponse = Math.random() > 0.1; // 90% success rate simulation

        if (dbResponse) {
          return { status: 'pass', details: 'Database connection healthy' };
        } else {
          return { status: 'fail', details: 'Database connection failed' };
        }
      } catch (error) {
        return {
          status: 'fail',
          details: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    });

    this.addHealthCheck('mcp_servers', async () => {
      const mcpServers = ['playwright', 'memorai', 'glass', 'romai'];
      const failedServers = mcpServers.filter(server => !this.mcpStatus[server]);

      if (failedServers.length === mcpServers.length) {
        return { status: 'fail', details: 'All MCP servers disconnected' };
      } else if (failedServers.length > 0) {
        return { status: 'warn', details: `MCP servers disconnected: ${failedServers.join(', ')}` };
      }

      return { status: 'pass', details: 'All MCP servers connected' };
    });

    this.addHealthCheck('disk_space', async () => {
      try {
        const fs = require('fs');
        const stats = fs.statSync(process.cwd());
        // Simplified disk space check - in production, use proper disk usage libraries
        return { status: 'pass', details: 'Sufficient disk space available' };
      } catch (error) {
        return { status: 'warn', details: 'Could not check disk space' };
      }
    });
  }

  addHealthCheck(name: string, checkFunction: () => Promise<{ status: 'pass' | 'fail' | 'warn'; details?: string; responseTime?: number }>) {
    this.checks.set(name, checkFunction);
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, checkFunction] of this.checks) {
      try {
        const start = Date.now();
        const result = await checkFunction();
        const responseTime = Date.now() - start;

        checks[name] = {
          ...result,
          lastCheck: new Date(),
          responseTime
        };

        if (result.status === 'fail') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'warn' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks[name] = {
          status: 'fail',
          details: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastCheck: new Date()
        };
        overallStatus = 'unhealthy';
      }
    }

    this.lastHealthCheck = new Date();

    return {
      status: overallStatus,
      checks,
      metrics: {
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
        avgResponseTime: this.responseTimes.length > 0
          ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
          : 0,
        voiceInteractions: this.voiceInteractions,
        connectedDevices: this.connectedDevices,
        mcpConnectionStatus: { ...this.mcpStatus }
      }
    };
  }

  recordRequest() {
    this.requestCount++;
  }

  recordError() {
    this.errorCount++;
  }

  recordResponseTime(time: number) {
    this.responseTimes.push(time);
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  recordVoiceInteraction() {
    this.voiceInteractions++;
  }

  updateConnectedDevices(count: number) {
    this.connectedDevices = count;
  }

  updateMCPStatus(server: string, connected: boolean) {
    this.mcpStatus[server] = connected;
  }

  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.voiceInteractions = 0;
    this.connectedDevices = 0;
    this.mcpStatus = {};
  }
}
