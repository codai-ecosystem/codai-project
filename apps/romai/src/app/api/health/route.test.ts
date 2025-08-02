import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../app/api/health/route';
import { NextRequest } from 'next/server';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    AZURE_OPENAI_API_KEY: 'test-key',
    AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com/',
    AZURE_OPENAI_DEPLOYMENT_NAME: 'test-deployment',
    NODE_ENV: 'test'
  }
}));

// Mock fetch for external API calls
global.fetch = vi.fn();

describe('Health API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock successful responses for health checks
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('romcp.ro')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'ok' })
        });
      }

      if (url.includes('openai.azure.com')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not Found' })
        });
      }

      if (url.includes('vercel')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'operational' })
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'ok' })
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns health status with 200 status code', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('responseTime');
    expect(data).toHaveProperty('services');
    expect(data).toHaveProperty('metrics');
  });

  it('includes all required service checks', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.services).toHaveProperty('frontend');
    expect(data.services).toHaveProperty('azureOpenAI');
    expect(data.services).toHaveProperty('database');
    expect(data.services).toHaveProperty('external');

    expect(data.services.external).toHaveProperty('vercel');
    expect(data.services.external).toHaveProperty('aws');
    expect(data.services.external).toHaveProperty('cbd');
  });

  it('includes system metrics', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.metrics).toHaveProperty('uptime');
    expect(data.metrics).toHaveProperty('memoryUsage');
    expect(data.metrics).toHaveProperty('nodeVersion');
    expect(data.metrics).toHaveProperty('platform');

    expect(data.metrics.memoryUsage).toHaveProperty('rss');
    expect(data.metrics.memoryUsage).toHaveProperty('heapTotal');
    expect(data.metrics.memoryUsage).toHaveProperty('heapUsed');
  });

  it('handles degraded services correctly', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    // Azure OpenAI should be degraded due to 404 mock response
    expect(data.services.azureOpenAI.status).toBe('degraded');
    expect(data.services.azureOpenAI).toHaveProperty('error');
  });

  it('includes response time measurements', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.responseTime).toMatch(/^\d+ms$/);
    expect(data.services.frontend).toHaveProperty('responseTime');
    expect(data.services.azureOpenAI).toHaveProperty('responseTime');
  });

  it('handles network errors gracefully', async () => {
    // Mock network errors
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200); // Should still return 200 but with degraded status
    expect(data.status).toBeDefined();
  });

  it('includes proper timestamp format', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });

  it('returns consistent data structure', async () => {
    const request = new NextRequest('http://localhost:6100/api/health');
    const response = await GET(request);
    const data = await response.json();

    // Check required top-level properties
    const requiredProps = ['status', 'timestamp', 'version', 'environment', 'responseTime', 'services', 'metrics'];
    requiredProps.forEach(prop => {
      expect(data).toHaveProperty(prop);
    });

    // Check services structure
    expect(typeof data.services).toBe('object');
    expect(typeof data.metrics).toBe('object');
  });
});
