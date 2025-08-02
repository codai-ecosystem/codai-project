import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/api/analytics/route';
import { NextRequest } from 'next/server';

describe('Analytics API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns analytics data with 200 status code', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('metadata');
  });

  it('includes comprehensive analytics data', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const analyticsData = data.data;

    // Core metrics
    expect(analyticsData).toHaveProperty('dailyQueries');
    expect(analyticsData).toHaveProperty('activeUsers');
    expect(analyticsData).toHaveProperty('successRate');
    expect(analyticsData).toHaveProperty('totalRequests');
    expect(analyticsData).toHaveProperty('averageResponseTime');
    expect(analyticsData).toHaveProperty('uptime');

    // Romanian-specific data
    expect(analyticsData).toHaveProperty('regionalData');
    expect(Array.isArray(analyticsData.regionalData)).toBe(true);

    // Time-series data
    expect(analyticsData).toHaveProperty('hourlyStats');
    expect(Array.isArray(analyticsData.hourlyStats)).toBe(true);

    // Model usage
    expect(analyticsData).toHaveProperty('modelUsage');
    expect(typeof analyticsData.modelUsage).toBe('object');

    // Performance metrics
    expect(analyticsData).toHaveProperty('performance');
    expect(analyticsData).toHaveProperty('trends');
    expect(analyticsData).toHaveProperty('realTimeMetrics');
  });

  it('includes Romanian regional data', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const regionalData = data.data.regionalData;
    expect(Array.isArray(regionalData)).toBe(true);

    // Check for major Romanian cities
    const regions = regionalData.map((r: any) => r.region);
    expect(regions).toContain('București');
    expect(regions).toContain('Cluj-Napoca');
    expect(regions).toContain('Timișoara');
    expect(regions).toContain('Iași');
    expect(regions).toContain('Constanța');

    // Check regional data structure
    regionalData.forEach((region: any) => {
      expect(region).toHaveProperty('region');
      expect(region).toHaveProperty('percentage');
      expect(region).toHaveProperty('users');
      expect(region).toHaveProperty('growth');
      expect(typeof region.percentage).toBe('number');
      expect(typeof region.users).toBe('number');
      expect(typeof region.growth).toBe('string');
    });
  });

  it('includes hourly statistics', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const hourlyStats = data.data.hourlyStats;
    expect(Array.isArray(hourlyStats)).toBe(true);
    expect(hourlyStats.length).toBe(24); // 24 hours of data

    hourlyStats.forEach((stat: any) => {
      expect(stat).toHaveProperty('hour');
      expect(stat).toHaveProperty('requests');
      expect(stat).toHaveProperty('responseTime');
      expect(stat).toHaveProperty('errors');
      expect(typeof stat.hour).toBe('number');
      expect(typeof stat.requests).toBe('number');
      expect(typeof stat.responseTime).toBe('number');
      expect(typeof stat.errors).toBe('number');
    });
  });

  it('includes model usage statistics', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const modelUsage = data.data.modelUsage;
    expect(typeof modelUsage).toBe('object');

    // Check for common models
    expect(modelUsage).toHaveProperty('gpt-4o-chat');
    expect(modelUsage).toHaveProperty('gpt-4o-mini');
    expect(modelUsage).toHaveProperty('gpt-4-turbo');
    expect(modelUsage).toHaveProperty('dall-e-3');

    // Check model data structure
    Object.values(modelUsage).forEach((model: any) => {
      expect(model).toHaveProperty('requests');
      expect(model).toHaveProperty('percentage');
      expect(model).toHaveProperty('avgResponseTime');
      expect(typeof model.requests).toBe('number');
      expect(typeof model.percentage).toBe('number');
      expect(typeof model.avgResponseTime).toBe('number');
    });
  });

  it('includes performance metrics', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const performance = data.data.performance;
    expect(performance).toHaveProperty('responseTime');
    expect(performance).toHaveProperty('uptime');
    expect(performance).toHaveProperty('requestsPerMinute');
    expect(performance).toHaveProperty('errorRate');

    expect(typeof performance.responseTime).toBe('string');
    expect(typeof performance.uptime).toBe('string');
    expect(typeof performance.requestsPerMinute).toBe('number');
    expect(typeof performance.errorRate).toBe('string');
  });

  it('includes trend analysis', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const trends = data.data.trends;
    expect(trends).toHaveProperty('queriesGrowth');
    expect(trends).toHaveProperty('usersGrowth');
    expect(trends).toHaveProperty('performanceImprovement');
    expect(trends).toHaveProperty('uptimeImprovement');

    // All trends should be strings with percentage indicators
    Object.values(trends).forEach((trend: any) => {
      expect(typeof trend).toBe('string');
      expect(trend).toMatch(/[+-]\d+[%ms]/);
    });
  });

  it('includes real-time metrics', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const realTimeMetrics = data.data.realTimeMetrics;
    expect(realTimeMetrics).toHaveProperty('currentLoad');
    expect(realTimeMetrics).toHaveProperty('memoryUsage');
    expect(realTimeMetrics).toHaveProperty('cpuUsage');
    expect(realTimeMetrics).toHaveProperty('networkLatency');

    // All should be numbers
    Object.values(realTimeMetrics).forEach((metric: any) => {
      expect(typeof metric).toBe('number');
    });
  });

  it('includes proper metadata', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const metadata = data.metadata;
    expect(metadata).toHaveProperty('generatedAt');
    expect(metadata).toHaveProperty('source', 'RomAI Analytics Engine');
    expect(metadata).toHaveProperty('version', '1.0.0');

    // Check timestamp format
    expect(metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('returns consistent data types', async () => {
    const request = new NextRequest('http://localhost:6100/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    const analyticsData = data.data;

    expect(typeof analyticsData.dailyQueries).toBe('number');
    expect(typeof analyticsData.activeUsers).toBe('number');
    expect(typeof analyticsData.successRate).toBe('number');
    expect(typeof analyticsData.totalRequests).toBe('number');
    expect(typeof analyticsData.averageResponseTime).toBe('number');
    expect(typeof analyticsData.uptime).toBe('number');

    expect(analyticsData.successRate).toBeGreaterThan(0);
    expect(analyticsData.successRate).toBeLessThanOrEqual(100);
    expect(analyticsData.uptime).toBeGreaterThan(0);
    expect(analyticsData.uptime).toBeLessThanOrEqual(100);
  });

  it('handles different time ranges', async () => {
    // Test with timeRange query parameter
    const request = new NextRequest('http://localhost:6100/api/analytics?timeRange=7d');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveProperty('timeRange', '24h'); // Default to 24h for now
    expect(response.status).toBe(200);
  });
});
