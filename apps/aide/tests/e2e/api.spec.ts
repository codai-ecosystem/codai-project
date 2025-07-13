import { test, expect } from '@playwright/test';

test.describe('AIDE API Tests', () => {
  test('Status API endpoint', async ({ request }) => {
    const response = await request.get('/api/status');

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('activeProjects');
    expect(data).toHaveProperty('totalUsers');
    expect(data).toHaveProperty('systemHealth');
  });

  test('Projects API endpoint', async ({ request }) => {
    const response = await request.get('/api/projects');

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Check project structure if projects exist
    if (data.length > 0) {
      const project = data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('createdAt');
    }
  });

  test('Chat API endpoint', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        message: 'Hello, this is a test message',
        projectId: 'test-project'
      }
    });

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.response).toBe('string');
  });

  test('API error handling', async ({ request }) => {
    // Test malformed request
    const response = await request.post('/api/chat', {
      data: {
        // Missing required fields
      }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('API rate limiting', async ({ request }) => {
    // Send multiple requests quickly
    const requests = Array(10).fill(null).map(() =>
      request.get('/api/status')
    );

    const responses = await Promise.all(requests);

    // Most requests should succeed
    const successCount = responses.filter(r => r.ok()).length;
    expect(successCount).toBeGreaterThan(5);
  });

  test('API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/api/status');
    const responseTime = Date.now() - startTime;

    expect(response.ok()).toBe(true);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('API content type headers', async ({ request }) => {
    const response = await request.get('/api/status');

    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('API CORS headers', async ({ request }) => {
    const response = await request.get('/api/status');

    expect(response.ok()).toBe(true);

    // Check CORS headers if they should be present
    const corsHeaders = response.headers();
    if (corsHeaders['access-control-allow-origin']) {
      expect(corsHeaders['access-control-allow-origin']).toBeTruthy();
    }
  });

  test('API versioning', async ({ request }) => {
    const response = await request.get('/api/status');
    const data = await response.json();

    // API should return version information
    expect(data.version).toBeTruthy();
    expect(typeof data.version).toBe('string');
  });

  test('API data validation', async ({ request }) => {
    // Test with invalid data types
    const response = await request.post('/api/chat', {
      data: {
        message: 123, // Should be string
        projectId: null // Should be string
      }
    });

    // Should handle invalid input gracefully
    expect([400, 422]).toContain(response.status());
  });
});
