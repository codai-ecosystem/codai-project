/**
 * Analytics API Endpoint
 * Handles performance metrics, error tracking, and user analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecurityValidator, globalRateLimiter } from '../../../lib/security';

interface AnalyticsData {
  type: 'performance' | 'error' | 'pageview' | 'event' | 'performance_report';
  data: any;
  timestamp: number;
}

// In-memory storage for demo (use database in production)
const analyticsStore = new Map<string, AnalyticsData[]>();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'anonymous';
    if (!globalRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data, timestamp }: AnalyticsData = body;

    // Validate input
    if (!type || !data || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize data
    const sanitizedData = typeof data === 'string' 
      ? SecurityValidator.sanitizeInput(data)
      : data;

    // Store analytics data
    const key = `${type}_${new Date().toISOString().split('T')[0]}`;
    if (!analyticsStore.has(key)) {
      analyticsStore.set(key, []);
    }

    const entries = analyticsStore.get(key)!;
    entries.push({
      type,
      data: sanitizedData,
      timestamp
    });

    // Keep only last 1000 entries per type per day
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000);
    }

    // Log analytics data (in production, send to analytics service)
    console.log(`📊 Analytics [${type}]:`, sanitizedData);

    // Process specific analytics types
    switch (type) {
      case 'performance_report':
        await processPerformanceReport(sanitizedData);
        break;
      case 'error':
        await processErrorReport(sanitizedData);
        break;
      case 'pageview':
        await processPageView(sanitizedData);
        break;
      case 'event':
        await processEvent(sanitizedData);
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'anonymous';
    if (!globalRateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get analytics data
    const key = type ? `${type}_${date}` : date;
    let data: AnalyticsData[] = [];

    if (type) {
      data = analyticsStore.get(key) || [];
    } else {
      // Get all data for the date
      for (const [storageKey, entries] of analyticsStore.entries()) {
        if (storageKey.endsWith(date)) {
          data.push(...entries);
        }
      }
    }

    // Generate summary statistics
    const summary = generateAnalyticsSummary(data, type);

    return NextResponse.json({
      data,
      summary,
      count: data.length
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for processing analytics data

async function processPerformanceReport(data: any) {
  const { fcp, lcp, fid, cls, ttfb } = data;
  
  console.log('🚀 Performance Metrics:', {
    'First Contentful Paint': `${fcp?.toFixed(2)}ms`,
    'Largest Contentful Paint': `${lcp?.toFixed(2)}ms`,
    'First Input Delay': `${fid?.toFixed(2)}ms`,
    'Cumulative Layout Shift': cls?.toFixed(3),
    'Time to First Byte': `${ttfb?.toFixed(2)}ms`
  });

  // Check for performance issues
  const issues = [];
  if (fcp > 1800) issues.push('FCP too slow');
  if (lcp > 2500) issues.push('LCP too slow');
  if (fid > 100) issues.push('FID too high');
  if (cls > 0.1) issues.push('CLS too high');
  if (ttfb > 600) issues.push('TTFB too slow');

  if (issues.length > 0) {
    console.warn('⚠️ Performance Issues:', issues);
  }
}

async function processErrorReport(data: any) {
  const { message, stack, url, userAgent, sessionId } = data;
  
  console.error('🚨 Error Report:', {
    message,
    url,
    sessionId,
    userAgent: userAgent?.substring(0, 100)
  });

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // await sendToErrorTrackingService(data);
}

async function processPageView(data: any) {
  const { pageView, sessionId, referrer } = data;
  
  console.log('📄 Page View:', {
    page: pageView,
    sessionId,
    referrer: referrer || 'direct'
  });

  // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
  // await sendToAnalyticsService('pageview', data);
}

async function processEvent(data: any) {
  const { event, data: eventData, sessionId } = data;
  
  console.log('🎯 Custom Event:', {
    event,
    data: eventData,
    sessionId
  });

  // In production, send to analytics service
  // await sendToAnalyticsService('event', data);
}

function generateAnalyticsSummary(data: AnalyticsData[], type?: string | null) {
  const summary: any = {
    totalEvents: data.length,
    timeRange: {
      start: data.length > 0 ? Math.min(...data.map(d => d.timestamp)) : 0,
      end: data.length > 0 ? Math.max(...data.map(d => d.timestamp)) : 0
    }
  };

  if (type === 'performance_report') {
    const perfData = data
      .filter(d => d.type === 'performance_report')
      .map(d => d.data);

    if (perfData.length > 0) {
      summary.performance = {
        averageFCP: perfData.reduce((acc, d) => acc + (d.fcp || 0), 0) / perfData.length,
        averageLCP: perfData.reduce((acc, d) => acc + (d.lcp || 0), 0) / perfData.length,
        averageFID: perfData.reduce((acc, d) => acc + (d.fid || 0), 0) / perfData.length,
        averageCLS: perfData.reduce((acc, d) => acc + (d.cls || 0), 0) / perfData.length,
        averageTTFB: perfData.reduce((acc, d) => acc + (d.ttfb || 0), 0) / perfData.length
      };
    }
  }

  if (type === 'pageview') {
    const pageViews = data
      .filter(d => d.type === 'pageview')
      .map(d => d.data.pageView);

    summary.topPages = Object.entries(
      pageViews.reduce((acc, page) => {
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);
  }

  if (type === 'error') {
    const errors = data
      .filter(d => d.type === 'error')
      .map(d => d.data.message);

    summary.topErrors = Object.entries(
      errors.reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);
  }

  return summary;
}
