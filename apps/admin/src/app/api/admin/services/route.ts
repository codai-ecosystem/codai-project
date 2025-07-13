import { NextRequest, NextResponse } from 'next/server';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: string;
  lastChecked: Date;
  responseTime: number;
  version: string;
  url: string;
  healthScore: number;
}

interface SystemStats {
  totalServices: number;
  onlineServices: number;
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  systemUptime: string;
}

// Mock data - in production, these would be real service checks
const generateServiceHealth = (): ServiceHealth[] => [
  {
    id: 'logai',
    name: 'LogAI (Authentication)',
    status: Math.random() > 0.1 ? 'online' : 'degraded',
    uptime: '99.9%',
    lastChecked: new Date(),
    responseTime: Math.floor(Math.random() * 100) + 20,
    version: '1.2.4',
    url: 'https://logai.ro',
    healthScore: Math.floor(Math.random() * 20) + 80,
  },
  {
    id: 'codai',
    name: 'CODAI (Central Platform)',
    status: Math.random() > 0.05 ? 'online' : 'degraded',
    uptime: '99.8%',
    lastChecked: new Date(Date.now() - Math.random() * 300000),
    responseTime: Math.floor(Math.random() * 150) + 30,
    version: '2.1.0',
    url: 'https://codai.ro',
    healthScore: Math.floor(Math.random() * 25) + 75,
  },
  {
    id: 'memorai',
    name: 'MemorAI (Memory Core)',
    status: 'online',
    uptime: '99.9%',
    lastChecked: new Date(Date.now() - Math.random() * 60000),
    responseTime: Math.floor(Math.random() * 50) + 15,
    version: '2.0.18',
    url: 'https://memorai.ro',
    healthScore: Math.floor(Math.random() * 10) + 90,
  },
  {
    id: 'bancai',
    name: 'BancAI (Financial)',
    status: Math.random() > 0.2 ? 'online' : 'degraded',
    uptime: '99.7%',
    lastChecked: new Date(Date.now() - Math.random() * 120000),
    responseTime: Math.floor(Math.random() * 300) + 50,
    version: '1.4.2',
    url: 'https://bancai.ro',
    healthScore: Math.floor(Math.random() * 30) + 70,
  },
  {
    id: 'fabricai',
    name: 'FabricAI (AI Services)',
    status: Math.random() > 0.3 ? 'online' : 'degraded',
    uptime: '98.2%',
    lastChecked: new Date(Date.now() - Math.random() * 300000),
    responseTime: Math.floor(Math.random() * 500) + 100,
    version: '1.1.8',
    url: 'https://fabricai.ro',
    healthScore: Math.floor(Math.random() * 40) + 60,
  },
  {
    id: 'wallet',
    name: 'Wallet (Multi-Chain)',
    status: Math.random() > 0.15 ? 'online' : 'degraded',
    uptime: '99.5%',
    lastChecked: new Date(Date.now() - Math.random() * 180000),
    responseTime: Math.floor(Math.random() * 200) + 80,
    version: '1.0.9',
    url: 'https://wallet.bancai.ro',
    healthScore: Math.floor(Math.random() * 25) + 75,
  },
  {
    id: 'explorer',
    name: 'Explorer (Blockchain)',
    status:
      Math.random() > 0.4
        ? 'online'
        : Math.random() > 0.5
          ? 'degraded'
          : 'maintenance',
    uptime: '95.4%',
    lastChecked: new Date(Date.now() - Math.random() * 1800000),
    responseTime: Math.floor(Math.random() * 1000) + 200,
    version: '0.8.3',
    url: 'https://explorer.codai.ro',
    healthScore: Math.floor(Math.random() * 60) + 40,
  },
  {
    id: 'hub',
    name: 'Hub (Service Management)',
    status: Math.random() > 0.1 ? 'online' : 'degraded',
    uptime: '99.6%',
    lastChecked: new Date(Date.now() - Math.random() * 150000),
    responseTime: Math.floor(Math.random() * 120) + 40,
    version: '1.3.1',
    url: 'https://hub.codai.ro',
    healthScore: Math.floor(Math.random() * 20) + 80,
  },
];

const generateSystemStats = (services: ServiceHealth[]): SystemStats => {
  const onlineServices = services.filter(s => s.status === 'online').length;

  return {
    totalServices: services.length,
    onlineServices: onlineServices,
    totalUsers: 15847 + Math.floor(Math.random() * 100),
    activeUsers: 2341 + Math.floor(Math.random() * 50),
    totalRequests: 8750432 + Math.floor(Math.random() * 10000),
    errorRate: Math.random() * 0.5,
    avgResponseTime: Math.floor(
      services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
    ),
    systemUptime: '99.7%',
  };
};

export async function GET(request: NextRequest) {
  try {
    const services = generateServiceHealth();
    const stats = generateSystemStats(services);

    return NextResponse.json({
      success: true,
      data: {
        services,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching service data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, serviceId } = await request.json();

    switch (action) {
      case 'restart':
        // Simulate service restart
        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({
          success: true,
          message: `Service ${serviceId} restarted successfully`,
        });

      case 'stop':
        // Simulate service stop
        return NextResponse.json({
          success: true,
          message: `Service ${serviceId} stopped successfully`,
        });

      case 'start':
        // Simulate service start
        return NextResponse.json({
          success: true,
          message: `Service ${serviceId} started successfully`,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing service action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform service action' },
      { status: 500 }
    );
  }
}
