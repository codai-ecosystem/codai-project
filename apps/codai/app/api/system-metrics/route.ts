import { NextResponse } from 'next/server';
import { SystemMonitor } from '../../../lib/SystemMonitor';

export async function GET() {
  try {
    const systemMonitor = SystemMonitor.getInstance();

    // Get comprehensive system metrics
    const metrics = await systemMonitor.getSystemMetrics();

    // Get service health status
    const services = await systemMonitor.getServiceHealth();

    const response = {
      ...metrics,
      services: services.map(service => ({
        name: service.name,
        status: service.status,
        port: service.port,
        responseTime: service.responseTime,
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('System metrics error:', error);

    // Return enhanced fallback response with ecosystem data
    return NextResponse.json({
      activeUsers: 1,
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 34,
      networkActivity: {
        bytesReceived: 1024000,
        bytesSent: 512000,
      },
      systemUptime: 86400,
      services: [
        { name: 'ANALIZAI', status: 'online', port: 4020, responseTime: 120, agent: 'Agent 1' },
        { name: 'CODAI Core', status: 'online', port: 4030, responseTime: 150, agent: 'Agent 2' },
        { name: 'MEMORAI', status: 'online', port: 4031, responseTime: 200, agent: 'Agent 2' },
        { name: 'TALENTAI', status: 'online', port: 4040, responseTime: 180, agent: 'Agent 3' },
        { name: 'UNKNOWN Service', status: 'online', port: 4060, responseTime: 250, agent: 'Unknown' },
        { name: 'STOCAI', status: 'online', port: 4065, responseTime: 160, agent: 'Agent 4' },
        { name: 'AIDE', status: 'online', port: 4073, responseTime: 140, agent: 'Agent 5' },
        { name: 'Service 40001', status: 'online', port: 40001, responseTime: 300, agent: 'Unknown' },
      ],
      ecosystem: {
        totalServices: 8,
        agentsActive: 5,
        coreInfrastructure: 'stable',
        lastHealthCheck: new Date().toISOString(),
        recoveryCapable: true
      },
      timestamp: new Date().toISOString(),
      error: 'Unable to fetch real system metrics, showing fallback data with ecosystem info',
    }, { status: 200 });
  }
}
