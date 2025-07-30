/**
 * CODAI Advanced Security System Tests
 * Basic validation tests for the integrated security framework
 */

import { AdvancedSecuritySystem } from '../index';

describe('AdvancedSecuritySystem', () => {
  let securitySystem: AdvancedSecuritySystem;

  beforeEach(() => {
    securitySystem = new AdvancedSecuritySystem({
      jwtSecret: 'test-secret-key-for-testing',
      environment: 'development',
      monitoring: {
        enabled: true,
        realTimeScanning: false,
        threatDetectionInterval: 10000
      },
      compliance: {
        enabledFrameworks: ['gdpr'],
        autoAssessment: false
      }
    });
  });

  afterEach(() => {
    securitySystem.shutdown();
  });

  describe('System Initialization', () => {
    test('should initialize successfully', () => {
      expect(securitySystem).toBeDefined();
    });

    test('should return system status', async () => {
      const status = await securitySystem.getSystemStatus();
      expect(status).toHaveProperty('authenticationSystem', true);
      expect(status).toHaveProperty('encryptionSystem', true);
      expect(status).toHaveProperty('monitoringSystem', true);
      expect(status).toHaveProperty('complianceSystem', true);
      expect(status).toHaveProperty('version', '1.0.0');
    });
  });

  describe('Encryption Operations', () => {
    test('should encrypt and decrypt data', () => {
      const testData = 'Hello, CODAI Security!';

      const encrypted = securitySystem.encryptData(testData);
      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('aes-256-gcm');

      const decrypted = securitySystem.decryptData(encrypted);
      expect(decrypted).toBe(testData);
    });

    test('should handle password-based encryption', () => {
      const testData = 'Sensitive information';
      const password = 'secure-password-123';

      const encrypted = securitySystem.encryptWithPassword(testData, password);
      expect(encrypted).toBeDefined();
      expect(encrypted.salt).toBeDefined();

      const decrypted = securitySystem.decryptWithPassword(encrypted, password);
      expect(decrypted).toBe(testData);
    });
  });

  describe('Authentication System', () => {
    test('should register a new user', async () => {
      const userData = {
        email: 'test@codai.dev',
        username: 'testuser',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await securitySystem.registerUser(userData);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(userData.email);
    });

    test('should validate password requirements', async () => {
      const userData = {
        email: 'test2@codai.dev',
        username: 'testuser2',
        password: 'weak', // Intentionally weak password
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await securitySystem.registerUser(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be at least 8 characters');
    });
  });

  describe('Security Monitoring', () => {
    test('should log security events', () => {
      const event = securitySystem.logSecurityEvent(
        'LOGIN_SUCCESS',
        'TestSuite',
        { userId: 'test-user-123' },
        'test-user-123',
        'test-session-456',
        '127.0.0.1',
        'Mozilla/5.0'
      );

      expect(event).toBeDefined();
      expect(event.type).toBe('LOGIN_SUCCESS');
      expect(event.source).toBe('TestSuite');
      expect(event.userId).toBe('test-user-123');
    });

    test('should generate security metrics', () => {
      // Log a few events
      securitySystem.logSecurityEvent('LOGIN_SUCCESS', 'Test', {});
      securitySystem.logSecurityEvent('LOGIN_FAILURE', 'Test', {});
      securitySystem.logSecurityEvent('DATA_ACCESS', 'Test', {});

      const metrics = securitySystem.getSecurityMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalEvents).toBeGreaterThan(0);
      expect(metrics.eventsByType).toBeDefined();
    });
  });

  describe('Request Analysis', () => {
    test('should detect SQL injection attempts', () => {
      const maliciousRequest = {
        url: '/api/users',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "'; DROP TABLE users; --" }),
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.100'
      };

      const analysis = securitySystem.analyzeRequest(maliciousRequest);
      expect(analysis.allowed).toBe(false);
      expect(analysis.threats.length).toBeGreaterThan(0);
      expect(analysis.threats[0].type).toBe('sql_injection');
      expect(analysis.riskScore).toBeGreaterThan(0);
    });

    test('should allow legitimate requests', () => {
      const legitimateRequest = {
        url: '/api/profile',
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' },
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.100'
      };

      const analysis = securitySystem.analyzeRequest(legitimateRequest);
      expect(analysis.allowed).toBe(true);
      expect(analysis.threats.length).toBe(0);
      expect(analysis.riskScore).toBe(0);
    });
  });

  describe('Compliance Framework', () => {
    test('should generate compliance reports', () => {
      const report = securitySystem.generateComplianceReport('summary', ['gdpr'], {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: new Date()
      });

      expect(report).toBeDefined();
      expect(report.type).toBe('summary');
      expect(report.frameworks).toContain('gdpr');
    });

    test('should get all available frameworks', () => {
      const frameworks = securitySystem.getAllFrameworks();
      expect(frameworks).toBeDefined();
      expect(frameworks.length).toBeGreaterThan(0);
      expect(frameworks.some(f => f.id === 'gdpr')).toBe(true);
    });
  });

  describe('Security Dashboard', () => {
    test('should provide comprehensive dashboard data', () => {
      const dashboard = securitySystem.getSecurityDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.metrics).toBeDefined();
      expect(dashboard.frameworks).toBeDefined();
      expect(dashboard.systemStatus).toBeDefined();
      expect(dashboard.config).toBeDefined();

      expect(dashboard.systemStatus.authenticationSystem).toBe(true);
      expect(dashboard.systemStatus.encryptionSystem).toBe(true);
      expect(dashboard.systemStatus.monitoringSystem).toBe(true);
      expect(dashboard.systemStatus.complianceSystem).toBe(true);
    });
  });
});
