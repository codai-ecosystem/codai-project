/**
 * CODAI Universal SDK Basic Tests
 * Core functionality validation
 */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CodaiSDK, createCodaiSDK, getCodaiSDK, resetCodaiSDK } from '../index';
import type { CodaiConfig } from '../types';

// Basic mock configuration
const basicConfig: CodaiConfig = {
  appId: 'test-app',
  environment: 'development',
  apiVersion: 'v1',
  endpoints: {},
  authentication: { enabled: false },
  security: { encryption: { enabled: false } },
  compliance: { gdpr: false },
  timeout: 5000,
  retryAttempts: 1,
  retryDelay: 1000,
  debug: true,
  telemetry: false,
  healthCheckInterval: 30000
};

describe('CODAI Universal SDK - Basic Tests', () => {
  let sdk: CodaiSDK;

  beforeEach(async () => {
    await resetCodaiSDK();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (sdk) {
      await sdk.destroy();
    }
    await resetCodaiSDK();
  });

  describe('SDK Construction', () => {
    it('should create SDK instance', () => {
      sdk = new CodaiSDK(basicConfig);
      expect(sdk).toBeInstanceOf(CodaiSDK);
    });

    it('should have all service instances', () => {
      sdk = new CodaiSDK(basicConfig);

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
  });

  describe('Service Management', () => {
    beforeEach(() => {
      sdk = new CodaiSDK(basicConfig);
    });

    it('should list all services', () => {
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

    it('should check service existence', () => {
      expect(sdk.hasService('auth')).toBe(true);
      expect(sdk.hasService('nonexistent')).toBe(false);
    });

    it('should retrieve services by name', () => {
      const authService = sdk.getService('auth');
      expect(authService).toBeDefined();
      expect(authService).toBe(sdk.auth);
    });
  });

  describe('Configuration Management', () => {
    beforeEach(() => {
      sdk = new CodaiSDK(basicConfig);
    });

    it('should get configuration', () => {
      const config = sdk.getConfig();
      expect(config.appId).toBe('test-app');
      expect(config.environment).toBe('development');
    });

    it('should update configuration', () => {
      sdk.updateConfig({ timeout: 10000 });
      const config = sdk.getConfig();
      expect(config.timeout).toBe(10000);
    });
  });

  describe('Event System', () => {
    beforeEach(() => {
      sdk = new CodaiSDK(basicConfig);
    });

    it('should provide event bus', () => {
      const eventBus = sdk.getEventBus();
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.subscribe).toBe('function');
      expect(typeof eventBus.publish).toBe('function');
    });

    it('should handle event subscription', () => {
      const eventBus = sdk.getEventBus();
      let eventReceived = false;

      eventBus.subscribe('app:message', () => {
        eventReceived = true;
      });

      eventBus.sendMessage('test-target', { test: 'data' });
      expect(eventReceived).toBe(true);
    });
  });

  describe('Factory Functions', () => {
    it('should create SDK with createCodaiSDK', async () => {
      sdk = await createCodaiSDK(basicConfig);
      expect(sdk).toBeInstanceOf(CodaiSDK);
    });

    it('should work with singleton pattern', async () => {
      const sdk1 = await getCodaiSDK(basicConfig);
      const sdk2 = await getCodaiSDK();
      expect(sdk1).toBe(sdk2);
      sdk = sdk1; // For cleanup
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      sdk = new CodaiSDK(basicConfig);
      await sdk.initialize();
    });

    it('should return health status', async () => {
      const health = await sdk.getHealth();
      expect(health).toMatchObject({
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        version: '1.0.0',
        services: expect.any(Object),
        uptime: expect.any(Number),
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize without errors', async () => {
      sdk = new CodaiSDK(basicConfig);
      await expect(sdk.initialize()).resolves.not.toThrow();
    });

    it('should destroy without errors', async () => {
      sdk = new CodaiSDK(basicConfig);
      await sdk.initialize();
      await expect(sdk.destroy()).resolves.not.toThrow();
    });
  });
});
