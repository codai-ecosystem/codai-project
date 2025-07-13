import { NextRequest, NextResponse } from 'next/server';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  url: string;
  port: number;
  priority: 1 | 2 | 3 | 4;
  responseTime: number;
  uptime: number;
  version: string;
  lastCheck: Date;
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

// Mock service data - in production this would come from actual health checks
const services: ServiceStatus[] = [
  {
    name: 'LogAI',
    status: 'online',
    url: 'https://logai.ro',
    port: 3002,
    priority: 1,
    responseTime: 125,
    uptime: 99.9,
    version: '1.0.0',
    lastCheck: new Date(),
    metrics: { cpu: 45, memory: 62, requests: 1250, errors: 2 },
  },
  {
    name: 'CODAI',
    status: 'online',
    url: 'https://codai.ro',
    port: 3001,
    priority: 1,
    responseTime: 98,
    uptime: 99.95,
    version: '2.1.0',
    lastCheck: new Date(),
    metrics: { cpu: 32, memory: 48, requests: 2850, errors: 1 },
  },
  {
    name: 'MemorAI',
    status: 'online',
    url: 'https://memorai.ro',
    port: 6367,
    priority: 1,
    responseTime: 67,
    uptime: 99.98,
    version: '2.0.18',
    lastCheck: new Date(),
    metrics: { cpu: 28, memory: 55, requests: 5420, errors: 0 },
  },
  {
    name: 'BancAI',
    status: 'online',
    url: 'https://bancai.ro',
    port: 3003,
    priority: 2,
    responseTime: 156,
    uptime: 99.7,
    version: '1.2.0',
    lastCheck: new Date(),
    metrics: { cpu: 65, memory: 72, requests: 1850, errors: 5 },
  },
  {
    name: 'FabricAI',
    status: 'online',
    url: 'https://fabricai.ro',
    port: 3004,
    priority: 2,
    responseTime: 134,
    uptime: 99.5,
    version: '1.1.0',
    lastCheck: new Date(),
    metrics: { cpu: 58, memory: 68, requests: 980, errors: 3 },
  },
  {
    name: 'Wallet',
    status: 'online',
    url: 'https://wallet.bancai.ro',
    port: 3005,
    priority: 2,
    responseTime: 89,
    uptime: 99.8,
    version: '1.0.5',
    lastCheck: new Date(),
    metrics: { cpu: 42, memory: 51, requests: 650, errors: 1 },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('service');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    let filteredServices = [...services];

    // Filter by service name
    if (serviceName) {
      filteredServices = filteredServices.filter(s =>
        s.name.toLowerCase().includes(serviceName.toLowerCase())
      );
    }

    // Filter by priority
    if (priority) {
      const priorityNum = parseInt(priority);
      filteredServices = filteredServices.filter(
        s => s.priority === priorityNum
      );
    }

    // Filter by status
    if (status) {
      filteredServices = filteredServices.filter(s => s.status === status);
    }

    // Calculate aggregate metrics
    const totalServices = filteredServices.length;
    const onlineServices = filteredServices.filter(
      s => s.status === 'online'
    ).length;
    const avgResponseTime = Math.round(
      filteredServices.reduce((sum, s) => sum + s.responseTime, 0) /
        totalServices
    );
    const totalRequests = filteredServices.reduce(
      (sum, s) => sum + s.metrics.requests,
      0
    );
    const totalErrors = filteredServices.reduce(
      (sum, s) => sum + s.metrics.errors,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        services: filteredServices,
        summary: {
          totalServices,
          onlineServices,
          avgResponseTime,
          totalRequests,
          totalErrors,
          overallHealth:
            onlineServices / totalServices >= 0.9 ? 'healthy' : 'degraded',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serviceName } = body;

    if (!action || !serviceName) {
      return NextResponse.json(
        { success: false, error: 'Action and service name are required' },
        { status: 400 }
      );
    }

    const service = services.find(s => s.name === serviceName);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Simulate service actions
    switch (action) {
      case 'restart':
        // Simulate restart - temporarily set to maintenance, then back to online
        service.status = 'maintenance';
        setTimeout(() => {
          service.status = 'online';
          service.lastCheck = new Date();
        }, 2000);
        break;

      case 'stop':
        service.status = 'offline';
        service.lastCheck = new Date();
        break;

      case 'start':
        service.status = 'online';
        service.lastCheck = new Date();
        break;

      case 'health-check':
        // Simulate health check
        service.lastCheck = new Date();
        service.responseTime = Math.floor(Math.random() * 200) + 50;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} initiated for ${serviceName}`,
      service,
    });
  } catch (error) {
    console.error('Error performing service action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
