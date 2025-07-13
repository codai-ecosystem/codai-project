import { NextRequest, NextResponse } from 'next/server';

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  services: {
    total: number;
    running: number;
    stopped: number;
    degraded: number;
  };
}

// Mock metrics data - in production this would come from monitoring systems
const generateMockMetrics = (): SystemMetrics => ({
  timestamp: new Date(),
  cpu: {
    usage: Math.floor(Math.random() * 80) + 10,
    cores: 8,
    frequency: 2.4,
  },
  memory: {
    used: Math.floor(Math.random() * 12) + 4,
    total: 16,
    free: 0,
    usage: 0,
  },
  disk: {
    used: Math.floor(Math.random() * 200) + 50,
    total: 500,
    free: 0,
    usage: 0,
  },
  network: {
    bytesIn: Math.floor(Math.random() * 1000000) + 100000,
    bytesOut: Math.floor(Math.random() * 800000) + 80000,
    packetsIn: Math.floor(Math.random() * 10000) + 1000,
    packetsOut: Math.floor(Math.random() * 8000) + 800,
  },
  services: {
    total: 8,
    running: 6,
    stopped: 1,
    degraded: 1,
  },
});

// Calculate derived values
const calculateDerivedMetrics = (metrics: SystemMetrics): SystemMetrics => {
  metrics.memory.free = metrics.memory.total - metrics.memory.used;
  metrics.memory.usage = Math.round(
    (metrics.memory.used / metrics.memory.total) * 100
  );

  metrics.disk.free = metrics.disk.total - metrics.disk.used;
  metrics.disk.usage = Math.round(
    (metrics.disk.used / metrics.disk.total) * 100
  );

  return metrics;
};

// Store recent metrics for time series data
const metricsHistory: SystemMetrics[] = [];
const MAX_HISTORY = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '1h';
    const interval = searchParams.get('interval') || '1m';

    // Generate current metrics
    const currentMetrics = calculateDerivedMetrics(generateMockMetrics());

    // Add to history
    metricsHistory.push(currentMetrics);
    if (metricsHistory.length > MAX_HISTORY) {
      metricsHistory.shift();
    }

    // Generate time series data based on request
    const timeSeriesData = generateTimeSeriesData(timeRange, interval);

    // Calculate health score
    const healthScore = calculateHealthScore(currentMetrics);

    // Generate alerts
    const alerts = generateAlerts(currentMetrics);

    return NextResponse.json({
      success: true,
      data: {
        current: currentMetrics,
        timeSeries: timeSeriesData,
        healthScore,
        alerts,
        summary: {
          systemHealth:
            healthScore >= 80
              ? 'healthy'
              : healthScore >= 60
                ? 'warning'
                : 'critical',
          uptime: '99.9%',
          totalRequests: Math.floor(Math.random() * 1000000) + 500000,
          avgResponseTime: Math.floor(Math.random() * 200) + 100,
          errorRate: Math.random() * 2,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

function generateTimeSeriesData(timeRange: string, interval: string) {
  const now = new Date();
  const dataPoints = [];

  // Determine number of points based on range and interval
  let points = 60; // Default to 60 points
  let intervalMs = 60000; // Default to 1 minute

  switch (timeRange) {
    case '1h':
      points = 60;
      intervalMs = 60000; // 1 minute
      break;
    case '6h':
      points = 72;
      intervalMs = 300000; // 5 minutes
      break;
    case '24h':
      points = 96;
      intervalMs = 900000; // 15 minutes
      break;
    case '7d':
      points = 168;
      intervalMs = 3600000; // 1 hour
      break;
  }

  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    const metrics = calculateDerivedMetrics(generateMockMetrics());
    dataPoints.push({
      timestamp,
      cpu: metrics.cpu.usage,
      memory: metrics.memory.usage,
      disk: metrics.disk.usage,
      networkIn: metrics.network.bytesIn,
      networkOut: metrics.network.bytesOut,
    });
  }

  return dataPoints;
}

function calculateHealthScore(metrics: SystemMetrics): number {
  let score = 100;

  // Deduct points for high resource usage
  if (metrics.cpu.usage > 80) score -= 20;
  else if (metrics.cpu.usage > 60) score -= 10;

  if (metrics.memory.usage > 85) score -= 20;
  else if (metrics.memory.usage > 70) score -= 10;

  if (metrics.disk.usage > 90) score -= 15;
  else if (metrics.disk.usage > 80) score -= 5;

  // Deduct points for service issues
  const serviceHealthRatio = metrics.services.running / metrics.services.total;
  if (serviceHealthRatio < 0.8) score -= 25;
  else if (serviceHealthRatio < 0.9) score -= 15;

  return Math.max(0, score);
}

function generateAlerts(metrics: SystemMetrics) {
  const alerts = [];

  if (metrics.cpu.usage > 80) {
    alerts.push({
      type: 'warning',
      title: 'High CPU Usage',
      message: `CPU usage is at ${metrics.cpu.usage}%`,
      timestamp: new Date(),
    });
  }

  if (metrics.memory.usage > 85) {
    alerts.push({
      type: 'error',
      title: 'High Memory Usage',
      message: `Memory usage is at ${metrics.memory.usage}%`,
      timestamp: new Date(),
    });
  }

  if (metrics.disk.usage > 90) {
    alerts.push({
      type: 'error',
      title: 'Disk Space Critical',
      message: `Disk usage is at ${metrics.disk.usage}%`,
      timestamp: new Date(),
    });
  }

  if (metrics.services.running < metrics.services.total) {
    alerts.push({
      type: 'warning',
      title: 'Service Degradation',
      message: `${metrics.services.total - metrics.services.running} services are not running`,
      timestamp: new Date(),
    });
  }

  return alerts;
}
