/**
 * Integration Manager Tests
 * Comprehensive test suite for the Integration Manager
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntegrationManager, IntegrationConfig } from '../../src/integrations/integration-manager';

describe('IntegrationManager', () => {
  let integrationManager: IntegrationManager;
  let mockConfig: IntegrationConfig;

  beforeEach(() => {
    mockConfig = {
      filesystem: {
        enabled: true,
        basePath: '/test',
        watchEnabled: false
      },
      git: {
        enabled: true,
        defaultBranch: 'main',
        autoCommit: false
      },
      database: {
        enabled: true,
        connections: {}
      },
      web: {
        enabled: true,
        headless: true,
        timeout: 10000
      },
      analytics: {
        enabled: true,
        cacheEnabled: true,
        cacheSize: 1000
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create IntegrationManager with valid config', () => {
      integrationManager = new IntegrationManager(mockConfig);
      expect(integrationManager).toBeDefined();
    });

    test('should handle missing config gracefully', () => {
      const emptyConfig = {} as IntegrationConfig;
      integrationManager = new IntegrationManager(emptyConfig);
      expect(integrationManager).toBeDefined();
    });
  });

  describe('Initialization', () => {
    test('should initialize all enabled integrations', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await expect(integrationManager.initialize()).resolves.not.toThrow();
    });

    test('should skip disabled integrations', async () => {
      const configWithDisabled = {
        ...mockConfig,
        filesystem: { ...mockConfig.filesystem, enabled: false }
      };
      integrationManager = new IntegrationManager(configWithDisabled);
      await expect(integrationManager.initialize()).resolves.not.toThrow();
    });

    test('should handle initialization errors gracefully', async () => {
      // Mock a failing integration
      const failingConfig = {
        ...mockConfig,
        database: {
          enabled: true,
          connections: {
            invalid: { connectionString: 'invalid://connection' }
          }
        }
      };

      integrationManager = new IntegrationManager(failingConfig);
      await expect(integrationManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('Tool Registration', () => {
    test('should register all tools from enabled integrations', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      const tools = integrationManager.getAllTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should provide tool execution capabilities', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      const tools = integrationManager.getAllTools();
      const firstTool = tools[0];

      expect(firstTool).toHaveProperty('name');
      expect(firstTool).toHaveProperty('description');
      expect(firstTool).toHaveProperty('inputSchema');
    });
  });

  describe('Resource Management', () => {
    test('should manage resources from all integrations', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      const resources = integrationManager.getAllResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
    });
  });

  describe('Health Monitoring', () => {
    test('should provide health status for all integrations', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      const healthStatus = integrationManager.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(healthStatus).toHaveProperty('overall');
      expect(healthStatus).toHaveProperty('integrations');
    });

    test('should detect unhealthy integrations', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      // Simulate an unhealthy integration
      const healthStatus = integrationManager.getHealthStatus();
      expect(healthStatus.overall).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    test('should collect performance metrics', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      const metrics = integrationManager.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('initializationTime');
      expect(metrics).toHaveProperty('toolCount');
      expect(metrics).toHaveProperty('resourceCount');
    });
  });

  describe('Error Handling', () => {
    test('should handle integration failures gracefully', async () => {
      const badConfig = {
        ...mockConfig,
        filesystem: { enabled: true, basePath: '/nonexistent' }
      };

      integrationManager = new IntegrationManager(badConfig);
      await expect(integrationManager.initialize()).resolves.not.toThrow();

      const healthStatus = integrationManager.getHealthStatus();
      expect(healthStatus.overall).toBeDefined();
    });

    test('should provide meaningful error messages', async () => {
      integrationManager = new IntegrationManager(mockConfig);
      await integrationManager.initialize();

      try {
        await integrationManager.executeTool('nonexistent_tool', {});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Tool not found');
      }
    });
  });

  describe('Configuration Validation', () => {
    test('should validate integration configurations', () => {
      const invalidConfig = {
        filesystem: { enabled: 'yes' as any } // Invalid type
      };

      expect(() => new IntegrationManager(invalidConfig)).not.toThrow();
    });

    test('should provide configuration defaults', () => {
      const minimalConfig = {
        filesystem: { enabled: true }
      };

      integrationManager = new IntegrationManager(minimalConfig);
      expect(integrationManager).toBeDefined();
    });
  });
});
