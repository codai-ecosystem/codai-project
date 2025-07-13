/**
 * CODAI Universal SDK Integration Tests
 * Comprehensive testing for all SDK functionality
 */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CodaiSDK, createCodaiSDK, getCodaiSDK, resetCodaiSDK } from '../index';
import type { CodaiConfig } from '../types';

// Mock configuration for testing
const mockConfig: CodaiConfig = {
  appId: 'test-app',
  environment: 'development',
  apiVersion: 'v1',
  endpoints: {
    auth: 'https://test-logai.ro/api',
    storage: 'https://test-stocai.ro/api',
    memory: 'https://test-memorai.ro/api',
    analytics: 'https://test-analizai.ro/api',
    wallet: 'https://test-bancai.ro/api',
    marketplace: 'https://test-marketai.ro/api',
    legal: 'https://test-legalizai.ro/api',
    support: 'https://test-ajutai.ro/api',
    identity: 'https://test-id.codai.ro/api',
    gateway: 'https://test-api.codai.ro'
  },
  authentication: {
    enabled: true,
    ssoEnabled: false,
    sessionTimeout: 3600000, // 1 hour for testing
    storage: 'memory'
  },
  security: {
    encryption: { enabled: false }, // Disable for testing
    rateLimiting: { enabled: false }
  },
  compliance: {
    gdpr: true,
    auditLogging: false // Disable for testing
  },
  timeout: 5000,
  retryAttempts: 1,
  retryDelay: 1000,
  debug: true,
  telemetry: false,
  healthCheckInterval: 30000
};

describe('CODAI Universal SDK', () => {
  let sdk: CodaiSDK;

  beforeEach(async () => {
    // Reset any existing SDK instance
    await resetCodaiSDK();

    // Mock fetch for HTTP requests
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve('{"success": true}'),
        headers: new Headers(),
        statusText: 'OK'
      } as Response)
    );
  });

  afterEach(async () => {
    if (sdk) {
      await sdk.destroy();
    }
    await resetCodaiSDK();
    vi.clearAllMocks();
  });

  describe('SDK Initialization', () => {
    it('should create SDK instance with valid configuration', () => {
      sdk = new CodaiSDK(mockConfig);

      expect(sdk).toBeInstanceOf(CodaiSDK);
      expect(sdk.auth).toBeDefined();
      expect(sdk.storage).toBeDefined();
      expect(sdk.memory).toBeDefined();
      expect(sdk.analytics).toBeDefined();
      expect(sdk.wallet).toBeDefined();
      expect(sdk.marketplace).toBeDefined();
      expect(sdk.legal).toBeDefined();
      expect(sdk.support).toBeDefined();
      expect(sdk.identity).toBeDefined();
    });

    it('should initialize all services successfully', async () => {
      sdk = new CodaiSDK(mockConfig);

      await expect(sdk.initialize()).resolves.not.toThrow();

      const health = await sdk.getHealth();
      expect(health.status).toBeDefined();
      expect(health.version).toBe('1.0.0');
      expect(health.services).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig = {
        ...mockConfig,
        endpoints: {}
      } as CodaiConfig;

      sdk = new CodaiSDK(invalidConfig);

      // Should not throw, but may have degraded health
      await expect(sdk.initialize()).resolves.not.toThrow();
    });
  });

  describe('Service Management', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();
    });

    it('should list all available services', () => {
      const services = sdk.listServices();

      expect(services).toContain('auth');
      expect(services).toContain('storage');
      expect(services).toContain('memory');
      expect(services).toContain('analytics');
      expect(services).toContain('wallet');
      expect(services).toContain('marketplace');
      expect(services).toContain('legal');
      expect(services).toContain('support');
      expect(services).toContain('identity');
    });

    it('should check if services exist', () => {
      expect(sdk.hasService('auth')).toBe(true);
      expect(sdk.hasService('nonexistent')).toBe(false);
    });

    it('should retrieve services by name', () => {
      const authService = sdk.getService('auth');
      expect(authService).toBeDefined();
      expect(authService).toBe(sdk.auth);

      const nonexistentService = sdk.getService('nonexistent');
      expect(nonexistentService).toBeUndefined();
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();
    });

    it('should return comprehensive health status', async () => {
      const health = await sdk.getHealth();

      expect(health).toMatchObject({
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        version: '1.0.0',
        services: expect.any(Object),
        uptime: expect.any(Number),
        timestamp: expect.any(Date)
      });
    });

    it('should track service response times', async () => {
      const health = await sdk.getHealth();

      Object.values(health.services).forEach(serviceHealth => {
        expect(serviceHealth).toMatchObject({
          status: expect.stringMatching(/^(online|offline|error)$/),
          lastCheck: expect.any(Date)
        });

        if (serviceHealth.status === 'online') {
          expect(serviceHealth.responseTime).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();
    });

    it('should retrieve current configuration', () => {
      const config = sdk.getConfig();

      expect(config.appId).toBe(mockConfig.appId);
      expect(config.environment).toBe(mockConfig.environment);
      expect(config.debug).toBe(true);
    });

    it('should update configuration', () => {
      const updates = {
        timeout: 10000,
        debug: false
      };

      sdk.updateConfig(updates);

      const config = sdk.getConfig();
      expect(config.timeout).toBe(10000);
      expect(config.debug).toBe(false);
    });

    it('should emit config update events', (done) => {
      const eventBus = sdk.getEventBus();

      eventBus.subscribe('sdk:config:updated', (data) => {
        expect(data.updates).toEqual({ timeout: 15000 });
        expect(data.timestamp).toBeInstanceOf(Date);
        done();
      });

      sdk.updateConfig({ timeout: 15000 });
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();
    });

    it('should provide access to event bus', () => {
      const eventBus = sdk.getEventBus();
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.subscribe).toBe('function');
      expect(typeof eventBus.publish).toBe('function');
    });

    it('should emit initialization events', (done) => {
      let eventsReceived = 0;
      const expectedEvents = 2; // init:start and init:complete

      const eventBus = sdk.getEventBus();

      eventBus.subscribe('sdk:init:start', (data) => {
        expect(data.version).toBe('1.0.0');
        eventsReceived++;
        if (eventsReceived === expectedEvents) done();
      });

      eventBus.subscribe('sdk:init:complete', (data) => {
        expect(data.successful).toBeGreaterThanOrEqual(0);
        expect(data.failed).toBeGreaterThanOrEqual(0);
        eventsReceived++;
        if (eventsReceived === expectedEvents) done();
      });

      // Re-initialize to trigger events
      sdk.initialize();
    });
  });

  describe('Service Integration', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();
    });

    it('should access authentication service', () => {
      expect(sdk.auth).toBeDefined();
      expect(typeof sdk.auth.login).toBe('function');
      expect(typeof sdk.auth.logout).toBe('function');
      expect(typeof sdk.auth.getCurrentUser).toBe('function');
    });

    it('should access storage service', () => {
      expect(sdk.storage).toBeDefined();
      expect(typeof sdk.storage.uploadFile).toBe('function');
      expect(typeof sdk.storage.downloadFile).toBe('function');
      expect(typeof sdk.storage.deleteFile).toBe('function');
    });

    it('should access memory service', () => {
      expect(sdk.memory).toBeDefined();
      expect(typeof sdk.memory.store).toBe('function');
      expect(typeof sdk.memory.recall).toBe('function');
      expect(typeof sdk.memory.forget).toBe('function');
    });

    it('should access analytics service', () => {
      expect(sdk.analytics).toBeDefined();
      expect(typeof sdk.analytics.track).toBe('function');
      expect(typeof sdk.analytics.getMetrics).toBe('function');
      expect(typeof sdk.analytics.createDashboard).toBe('function');
    });

    it('should access wallet service', () => {
      expect(sdk.wallet).toBeDefined();
      expect(typeof sdk.wallet.createWallet).toBe('function');
      expect(typeof sdk.wallet.getBalance).toBe('function');
      expect(typeof sdk.wallet.sendPayment).toBe('function');
    });

    it('should access marketplace service', () => {
      expect(sdk.marketplace).toBeDefined();
      expect(typeof sdk.marketplace.createProduct).toBe('function');
      expect(typeof sdk.marketplace.searchProducts).toBe('function');
      expect(typeof sdk.marketplace.createOrder).toBe('function');
    });

    it('should access legal service', () => {
      expect(sdk.legal).toBeDefined();
      expect(typeof sdk.legal.createDocument).toBe('function');
      expect(typeof sdk.legal.getTemplates).toBe('function');
      expect(typeof sdk.legal.scheduleConsultation).toBe('function');
    });

    it('should access support service', () => {
      expect(sdk.support).toBeDefined();
      expect(typeof sdk.support.createTicket).toBe('function');
      expect(typeof sdk.support.searchKnowledgeBase).toBe('function');
      expect(typeof sdk.support.startLiveChat).toBe('function');
    });

    it('should access identity service', () => {
      expect(sdk.identity).toBeDefined();
      expect(typeof sdk.identity.verifyIdentity).toBe('function');
      expect(typeof sdk.identity.uploadDocument).toBe('function');
      expect(typeof sdk.identity.getTrustScore).toBe('function');
    });
  });

  describe('Factory Functions', () => {
    it('should create SDK instance with createCodaiSDK', async () => {
      sdk = await createCodaiSDK(mockConfig);

      expect(sdk).toBeInstanceOf(CodaiSDK);

      const health = await sdk.getHealth();
      expect(health.status).toBeDefined();
    });

    it('should manage singleton instance with getCodaiSDK', async () => {
      const sdk1 = await getCodaiSDK(mockConfig);
      const sdk2 = await getCodaiSDK();

      expect(sdk1).toBe(sdk2);

      sdk = sdk1; // For cleanup
    });

    it('should reset singleton instance', async () => {
      const sdk1 = await getCodaiSDK(mockConfig);
      await resetCodaiSDK();

      await expect(getCodaiSDK()).rejects.toThrow('SDK not initialized');
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization failures gracefully', async () => {
      // Mock fetch to simulate network errors
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      sdk = new CodaiSDK(mockConfig);

      // Should not throw during initialization
      await expect(sdk.initialize()).resolves.not.toThrow();

      const health = await sdk.getHealth();
      // Some services may be in error state
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
    });

    it('should handle cleanup errors gracefully', async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();

      // Mock service cleanup to throw error
      jest.spyOn(sdk.auth, 'destroy' as any).mockImplementation(() => {
        throw new Error('Cleanup error');
      });

      // Should not throw during cleanup
      await expect(sdk.destroy()).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should initialize within reasonable time', async () => {
      const startTime = Date.now();

      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();

      const initTime = Date.now() - startTime;
      expect(initTime).toBeLessThan(5000); // Should initialize within 5 seconds
    });

    it('should perform health checks efficiently', async () => {
      sdk = new CodaiSDK(mockConfig);
      await sdk.initialize();

      const startTime = Date.now();
      await sdk.getHealth();
      const healthCheckTime = Date.now() - startTime;

      expect(healthCheckTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

describe('Service-Specific Tests', () => {
  let sdk: CodaiSDK;

  beforeEach(async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve('{"success": true}'),
        headers: new Headers(),
        statusText: 'OK'
      } as Response)
    );

    sdk = new CodaiSDK(mockConfig);
    await sdk.initialize();
  });

  afterEach(async () => {
    await sdk.destroy();
    jest.clearAllMocks();
  });

  describe('Authentication Service Integration', () => {
    it('should handle login flow', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock successful login response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          user: { id: '123', email: 'test@example.com' },
          token: 'mock-token'
        })
      });

      const result = await sdk.auth.login(loginData);
      expect(result).toBeDefined();
    });
  });

  describe('Storage Service Integration', () => {
    it('should handle file operations', () => {
      // Basic file operation tests
      expect(sdk.storage.listFiles).toBeDefined();
      expect(sdk.storage.uploadFile).toBeDefined();
      expect(sdk.storage.downloadFile).toBeDefined();
    });
  });

  describe('Cross-Service Communication', () => {
    it('should enable communication between services', async () => {
      const eventBus = sdk.getEventBus();
      let messageReceived = false;

      eventBus.subscribe('app:message', (data) => {
        messageReceived = true;
        expect(data.from).toBe('test-app');
        expect(data.data).toEqual({ test: 'message' });
      });

      eventBus.sendMessage('target-app', { test: 'message' });

      // Give event loop time to process
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(messageReceived).toBe(true);
    });
  });
});
