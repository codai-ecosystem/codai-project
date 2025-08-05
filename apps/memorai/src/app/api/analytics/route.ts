// Analytics API Route - Comprehensive memory analytics and insights
// GET /api/analytics - Generate and return memory analytics data

import { NextRequest, NextResponse } from 'next/server';
import { MemoryAnalyticsEngine, AnalyticsFilter } from '@/lib/analytics-engine';

const analyticsEngine = new MemoryAnalyticsEngine();

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // For demo purposes, using a default user ID
    const userId = 'demo-user-123';

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const dateRange = {
      start: searchParams.get('start')
        ? new Date(searchParams.get('start')!)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: searchParams.get('end')
        ? new Date(searchParams.get('end')!)
        : new Date()
    };

    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const exportFormat = searchParams.get('export') as 'json' | 'csv' | 'pdf' | null;
    const realtime = searchParams.get('realtime') === 'true';

    const filter: AnalyticsFilter = {
      dateRange,
      categories,
      tags,
      userId: userId
    };

    // Handle real-time metrics request
    if (realtime) {
      const realtimeMetrics = await analyticsEngine.getRealTimeMetrics(userId);

      return NextResponse.json({
        success: true,
        data: realtimeMetrics,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // Handle export request
    if (exportFormat) {
      const exportData = await analyticsEngine.exportAnalytics(
        userId,
        exportFormat,
        filter
      );

      return new NextResponse(exportData.data, {
        status: 200,
        headers: {
          'Content-Type': exportData.mimeType,
          'Content-Disposition': `attachment; filename="${exportData.filename}"`
        }
      });
    }

    // Generate comprehensive analytics
    const analytics = await analyticsEngine.generateAnalytics(userId, filter);

    // Add metadata
    const response = {
      success: true,
      data: analytics,
      metadata: {
        userId: userId,
        filter: {
          dateRange: {
            start: filter.dateRange.start.toISOString(),
            end: filter.dateRange.end.toISOString()
          },
          categories: filter.categories || [],
          tags: filter.tags || []
        },
        generated: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analytics API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // For demo purposes, using a default user ID
    const userId = 'demo-user-123';

    const body = await request.json();
    const { metric, period } = body;

    if (!metric || !period) {
      return NextResponse.json(
        { error: 'Missing required parameters: metric, period' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validMetrics = ['memories', 'searches', 'performance'];
    const validPeriods = ['24h', '7d', '30d', '90d'];

    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    // Get time series data
    const timeSeriesData = await analyticsEngine.getTimeSeriesData(
      userId,
      metric,
      period
    );

    return NextResponse.json({
      success: true,
      data: {
        metric,
        period,
        timeSeries: timeSeriesData,
        summary: {
          totalDataPoints: timeSeriesData.length,
          dateRange: {
            start: timeSeriesData[0]?.timestamp.toISOString(),
            end: timeSeriesData[timeSeriesData.length - 1]?.timestamp.toISOString()
          }
        }
      },
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Time series analytics error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate time series data',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}
