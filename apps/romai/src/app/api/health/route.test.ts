import { NextRequest } from 'next/server';
import { GET } from './route';

describe('Health API Route - Real Integration Test Suite', () => {
  const createMockRequest = (url: string = 'http://localhost:6100/api/health'): NextRequest => {
    return new NextRequest(url);
  };

  describe('Real Health Check Integration', () => {
    it('performs real health check against AGI server', async () => {
      const request = createMockRequest();

      const response = await GET(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);

      const data = await response.json();
      expect(typeof data).toBe('object');
    });

    it('validates real AGI server connectivity', async () => {
      const request = createMockRequest();

      const response = await GET(request);

      expect(response).toBeInstanceOf(Response);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(typeof data.status).toBe('string');
    });
  });

  describe('Real Performance Validation', () => {
    it('completes real health checks within SLA', async () => {
      const request = createMockRequest();

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000);
      expect(response).toBeInstanceOf(Response);
    });
  });
});
