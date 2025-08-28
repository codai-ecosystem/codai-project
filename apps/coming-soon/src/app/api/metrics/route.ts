import { NextRequest, NextResponse } from 'next/server';

interface MetricsData {
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  errors: {
    count: number;
    rate: number;
    types: Record<string, number>;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    sessionDuration: number;
  };
  business: {
    conversionRate: number;
    signups: number;
    engagementScore: number;
  };
  timestamp: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const metrics: MetricsData = await request.json();

    // Validate required fields
    if (!metrics.timestamp || !metrics.url) {
      return NextResponse.json(
        { error: 'Missing required fields: timestamp, url' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Store metrics in a time-series database (InfluxDB, CloudWatch, etc.)
    // 2. Send to monitoring service (DataDog, New Relic, etc.)
    // 3. Trigger alerts based on thresholds

    console.log('📊 Metrics received:', {
      timestamp: metrics.timestamp,
      url: metrics.url,
      performance: {
        lcp: Math.round(metrics.performance.lcp),
        fid: Math.round(metrics.performance.fid),
        cls: Math.round(metrics.performance.cls * 1000) / 1000
      },
      errors: metrics.errors.count,
      traffic: metrics.traffic.pageViews,
      engagement: Math.round(metrics.business.engagementScore)
    });

    // Check for performance alerts
    const alerts = [];

    if (metrics.performance.lcp > 2500) {
      alerts.push({
        type: 'performance',
        metric: 'lcp',
        value: metrics.performance.lcp,
        threshold: 2500,
        severity: metrics.performance.lcp > 4000 ? 'critical' : 'warning'
      });
    }

    if (metrics.performance.fid > 100) {
      alerts.push({
        type: 'performance',
        metric: 'fid',
        value: metrics.performance.fid,
        threshold: 100,
        severity: metrics.performance.fid > 300 ? 'critical' : 'warning'
      });
    }

    if (metrics.performance.cls > 0.1) {
      alerts.push({
        type: 'performance',
        metric: 'cls',
        value: metrics.performance.cls,
        threshold: 0.1,
        severity: metrics.performance.cls > 0.25 ? 'critical' : 'warning'
      });
    }

    if (metrics.errors.rate > 10) {
      alerts.push({
        type: 'errors',
        metric: 'error_rate',
        value: metrics.errors.rate,
        threshold: 10,
        severity: metrics.errors.rate > 25 ? 'critical' : 'warning'
      });
    }

    // In production, send alerts to monitoring service
    if (alerts.length > 0 && process.env.NODE_ENV === 'production') {
      // await sendToMonitoringService(alerts);
      console.warn('🚨 Performance alerts triggered:', alerts);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alerts: alerts.length,
      message: 'Metrics processed successfully'
    });

  } catch (error) {
    console.error('Failed to process metrics:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return aggregated metrics for dashboard
  // In a real application, this would query your metrics database

  const mockMetrics = {
    summary: {
      totalPageViews: 1250,
      uniqueVisitors: 890,
      averageSessionDuration: 145000, // 2:25 minutes
      bounceRate: 0.32,
      conversionRate: 0.08
    },
    performance: {
      averageLCP: 1850,
      averageFID: 65,
      averageCLS: 0.05,
      performanceScore: 92
    },
    errors: {
      totalErrors: 12,
      errorRate: 0.96, // errors per 100 sessions
      topErrors: [
        { type: 'javascript', count: 8, percentage: 66.7 },
        { type: 'network', count: 3, percentage: 25.0 },
        { type: 'react', count: 1, percentage: 8.3 }
      ]
    },
    traffic: {
      hourlyPageViews: [
        { hour: '00:00', views: 15 },
        { hour: '01:00', views: 8 },
        { hour: '02:00', views: 12 },
        { hour: '03:00', views: 18 },
        // ... more hourly data
      ],
      topPages: [
        { page: '/', views: 850, percentage: 68.0 },
        { page: '/en', views: 250, percentage: 20.0 },
        { page: '/ro', views: 150, percentage: 12.0 }
      ],
      referrers: [
        { source: 'Direct', visitors: 445, percentage: 50.0 },
        { source: 'Google', visitors: 267, percentage: 30.0 },
        { source: 'Social Media', visitors: 178, percentage: 20.0 }
      ]
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(mockMetrics, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}