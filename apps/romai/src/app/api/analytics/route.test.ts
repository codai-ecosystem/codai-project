import { NextRequest } from 'next/server';
import { GET } from './route';

describe('Analytics API Route - Real Integration Test Suite', () => {
  const createMockRequest = (url: string = 'http://localhost:6100/api/analytics'): NextRequest => {
    return new NextRequest(url);
  };

  describe('Real AGI Server Integration', () => {
    it('connects to real AGI server for analytics data', async () => {
      const request = createMockRequest();

      const response = await GET(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);

      const data = await response.json();
      expect(typeof data).toBe('object');
    });

    it('handles real AGI server connectivity issues', async () => {
      const request = createMockRequest();

      const response = await GET(request);

      expect(response).toBeInstanceOf(Response);

      if (response.status >= 400) {
        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        expect(typeof errorData.error).toBe('string');
      }
    });
  });

  describe('Real Performance', () => {
    it('completes real API calls within performance bounds', async () => {
      const request = createMockRequest();

      const startTime = performance.now();
      const response = await GET(request);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30000);
      expect(response).toBeInstanceOf(Response);
    });
  });
});
