/**
 * API Integration Unit Tests
 * Tests for API endpoint structures and response validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

interface APIEndpoint {
  service: string;
  port: number;
  endpoint: string;
  method: string;
  expectedStatus: number;
}

const apiEndpoints: APIEndpoint[] = [
  { service: 'Gateway', port: 4000, endpoint: '/api/v1/status', method: 'GET', expectedStatus: 200 },
  { service: 'CODAI', port: 4001, endpoint: '/api/health', method: 'GET', expectedStatus: 200 },
  { service: 'CODAI', port: 4001, endpoint: '/api/projects', method: 'GET', expectedStatus: 200 },
  { service: 'Admin', port: 4002, endpoint: '/api/health', method: 'GET', expectedStatus: 200 },
  { service: 'Admin', port: 4002, endpoint: '/api/admin/users', method: 'GET', expectedStatus: 200 },
  { service: 'Hub', port: 4003, endpoint: '/api/health', method: 'GET', expectedStatus: 200 },
  { service: 'Hub', port: 4003, endpoint: '/api/hub/agents', method: 'GET', expectedStatus: 200 },
  { service: 'ID', port: 4004, endpoint: '/api/health', method: 'GET', expectedStatus: 200 },
  { service: 'ID', port: 4004, endpoint: '/api/auth/validate', method: 'POST', expectedStatus: 400 },
  { service: 'BancAI', port: 4005, endpoint: '/api/health', method: 'GET', expectedStatus: 200 },
  { service: 'BancAI', port: 4005, endpoint: '/api/banking/accounts', method: 'GET', expectedStatus: 200 }
];

async function testAPIEndpoint(endpoint: APIEndpoint): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const url = `http://localhost:${endpoint.port}${endpoint.endpoint}`;
    const options: RequestInit = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (endpoint.method === 'POST' && endpoint.endpoint.includes('validate')) {
      options.body = JSON.stringify({ token: 'test-token' });
    }

    const response = await fetch(url, options);

    return {
      success: response.status === endpoint.expectedStatus,
      response: {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function validateAPIResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  // Check for required response structure
  if (typeof response.status !== 'number') {
    errors.push('Response status is not a number');
  }

  if (typeof response.ok !== 'boolean') {
    errors.push('Response ok is not a boolean');
  }

  if (!response.headers || typeof response.headers !== 'object') {
    errors.push('Response headers are missing or invalid');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

describe('API Integration Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('API Endpoint Testing', () => {
    it('should handle successful API responses', async () => {
      const mockResponse = {
        status: 200,
        ok: true,
        headers: new Map([
          ['content-type', 'application/json'],
          ['x-powered-by', 'Express']
        ])
      };
      mockFetch.mockResolvedValue(mockResponse);

      const endpoint = apiEndpoints[1]; // CODAI health endpoint
      const result = await testAPIEndpoint(endpoint);

      expect(result.success).toBe(true);
      expect(result.response?.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4001/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      );
    });

    it('should handle POST requests with body', async () => {
      const mockResponse = {
        status: 400,
        ok: false,
        headers: new Map([['content-type', 'application/json']])
      };
      mockFetch.mockResolvedValue(mockResponse);

      const endpoint = apiEndpoints.find(e => e.method === 'POST')!;
      const result = await testAPIEndpoint(endpoint);

      expect(result.success).toBe(true); // 400 is expected for this endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/validate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'test-token' })
        })
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const endpoint = apiEndpoints[0];
      const result = await testAPIEndpoint(endpoint);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle unexpected status codes', async () => {
      const mockResponse = {
        status: 500,
        ok: false,
        headers: new Map()
      };
      mockFetch.mockResolvedValue(mockResponse);

      const endpoint = apiEndpoints[1]; // Expects 200, gets 500
      const result = await testAPIEndpoint(endpoint);

      expect(result.success).toBe(false);
      expect(result.response?.status).toBe(500);
    });
  });

  describe('API Response Validation', () => {
    it('should validate correct response structure', () => {
      const validResponse = {
        status: 200,
        ok: true,
        headers: { 'content-type': 'application/json' }
      };

      const validation = validateAPIResponse(validResponse);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing status', () => {
      const invalidResponse = {
        ok: true,
        headers: { 'content-type': 'application/json' }
      };

      const validation = validateAPIResponse(invalidResponse);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Response status is not a number');
    });

    it('should detect missing ok field', () => {
      const invalidResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' }
      };

      const validation = validateAPIResponse(invalidResponse);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Response ok is not a boolean');
    });

    it('should detect missing headers', () => {
      const invalidResponse = {
        status: 200,
        ok: true
      };

      const validation = validateAPIResponse(invalidResponse);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Response headers are missing or invalid');
    });

    it('should handle null/undefined responses', () => {
      expect(validateAPIResponse(null).valid).toBe(false);
      expect(validateAPIResponse(undefined).valid).toBe(false);
      expect(validateAPIResponse(null).errors).toContain('Response is null or undefined');
    });
  });

  describe('API Endpoint Configuration', () => {
    it('should have valid endpoint configurations', () => {
      apiEndpoints.forEach(endpoint => {
        expect(endpoint.service).toBeTruthy();
        expect(endpoint.port).toBeGreaterThanOrEqual(4000);
        expect(endpoint.port).toBeLessThanOrEqual(4010);
        expect(endpoint.endpoint).toMatch(/^\/api/);
        expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(endpoint.method);
        expect(endpoint.expectedStatus).toBeGreaterThanOrEqual(200);
        expect(endpoint.expectedStatus).toBeLessThanOrEqual(599);
      });
    });

    it('should have health endpoints for all services', () => {
      const serviceNames = ['CODAI', 'Admin', 'Hub', 'ID', 'BancAI'];
      serviceNames.forEach(serviceName => {
        const healthEndpoint = apiEndpoints.find(
          e => e.service === serviceName && e.endpoint.includes('health')
        );
        expect(healthEndpoint).toBeDefined();
        expect(healthEndpoint?.method).toBe('GET');
        expect(healthEndpoint?.expectedStatus).toBe(200);
      });
    });

    it('should have unique port-endpoint combinations', () => {
      const combinations = apiEndpoints.map(e => `${e.port}:${e.endpoint}:${e.method}`);
      const uniqueCombinations = [...new Set(combinations)];
      expect(uniqueCombinations).toHaveLength(combinations.length);
    });
  });
});
