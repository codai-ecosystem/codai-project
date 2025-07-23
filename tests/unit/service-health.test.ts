/**
 * Service Health Unit Tests
 * Tests for the service health checking functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

interface ServiceConfig {
  name: string;
  port: number;
  path: string;
}

const services: ServiceConfig[] = [
  { name: 'Gateway', port: 4000, path: '/' },
  { name: 'CODAI', port: 4001, path: '/' },
  { name: 'Admin', port: 4002, path: '/' },
  { name: 'Hub', port: 4003, path: '/' },
  { name: 'ID', port: 4004, path: '/' },
  { name: 'BancAI', port: 4005, path: '/' }
];

async function testService(service: ServiceConfig): Promise<boolean> {
  try {
    const url = `http://localhost:${service.port}${service.path}`;
    const response = await fetch(url);
    const status = response.status;

    // Special handling for Gateway service - 404 with structured response is healthy
    if (service.name === 'Gateway' && status === 404) {
      try {
        const body = await response.text();
        const data = JSON.parse(body);
        if (data.availableServices && Array.isArray(data.availableServices)) {
          return true;
        }
      } catch (parseError) {
        return false;
      }
    }

    return status === 200;
  } catch (error) {
    return false;
  }
}

describe('Service Health Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('testService function', () => {
    it('should return true for 200 OK responses', async () => {
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue('OK')
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await testService(services[1]); // CODAI service
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4001/');
    });

    it('should return true for Gateway service with valid 404 response', async () => {
      const gatewayResponse = {
        availableServices: ['id', 'memorai', 'hub', 'logai', 'admin', 'codai', 'bancai'],
        success: false,
        error: 'Not Found'
      };

      const mockResponse = {
        status: 404,
        text: vi.fn().mockResolvedValue(JSON.stringify(gatewayResponse))
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await testService(services[0]); // Gateway service
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/');
    });

    it('should return false for Gateway service with malformed 404 response', async () => {
      const mockResponse = {
        status: 404,
        text: vi.fn().mockResolvedValue('Invalid JSON')
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await testService(services[0]); // Gateway service
      expect(result).toBe(false);
    });

    it('should return false for non-200 status codes (except Gateway 404)', async () => {
      const mockResponse = {
        status: 500,
        text: vi.fn().mockResolvedValue('Internal Server Error')
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await testService(services[1]); // CODAI service
      expect(result).toBe(false);
    });

    it('should return false when fetch throws an error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await testService(services[1]); // CODAI service
      expect(result).toBe(false);
    });

    it('should handle all service configurations correctly', async () => {
      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue('OK')
      };
      mockFetch.mockResolvedValue(mockResponse);

      for (const service of services.slice(1)) { // Skip Gateway for this test
        const result = await testService(service);
        expect(result).toBe(true);
      }

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('Service Configuration', () => {
    it('should have correct service configurations', () => {
      expect(services).toHaveLength(6);
      expect(services[0]).toEqual({ name: 'Gateway', port: 4000, path: '/' });
      expect(services[1]).toEqual({ name: 'CODAI', port: 4001, path: '/' });
      expect(services[2]).toEqual({ name: 'Admin', port: 4002, path: '/' });
      expect(services[3]).toEqual({ name: 'Hub', port: 4003, path: '/' });
      expect(services[4]).toEqual({ name: 'ID', port: 4004, path: '/' });
      expect(services[5]).toEqual({ name: 'BancAI', port: 4005, path: '/' });
    });

    it('should have unique ports for all services', () => {
      const ports = services.map(s => s.port);
      const uniquePorts = [...new Set(ports)];
      expect(uniquePorts).toHaveLength(ports.length);
    });

    it('should have valid port ranges', () => {
      services.forEach(service => {
        expect(service.port).toBeGreaterThanOrEqual(4000);
        expect(service.port).toBeLessThanOrEqual(4010);
      });
    });
  });
});
