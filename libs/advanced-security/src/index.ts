/**
 * CODAI Advanced Security System
 * Enterprise-grade security framework with authentication, encryption, monitoring, and compliance
 */

// Import all security modules
import AuthenticationManager, {
  User,
  UserRole,
  Permission,
  AuthenticationResult,
  JWTPayload
} from './auth';

import EncryptionManager, {
  EncryptionOptions,
  EncryptedData,
  KeyPair,
  EncryptionKey,
  CryptoUtils
} from './encryption';

import SecurityMonitor, {
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  ThreatPattern,
  SecurityMetrics,
  AlertRule,
  SecurityReport
} from './monitoring';

import ComplianceManager, {
  ComplianceFramework,
  ComplianceRequirement,
  ComplianceControl,
  ComplianceAssessment,
  ComplianceFinding,
  ComplianceReport,
  ComplianceStatus,
  ComplianceSeverity
} from './compliance';

import * as crypto from 'crypto';

// Re-export all types and enums for easy access
export type {
  // Authentication types
  User,
  UserRole,
  Permission,
  AuthenticationResult,
  JWTPayload,

  // Encryption types
  EncryptionOptions,
  EncryptedData,
  KeyPair,
  EncryptionKey,

  // Monitoring types
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  ThreatPattern,
  SecurityMetrics,
  AlertRule,
  SecurityReport,

  // Compliance types
  ComplianceFramework,
  ComplianceRequirement,
  ComplianceControl,
  ComplianceAssessment,
  ComplianceFinding,
  ComplianceReport,
  ComplianceStatus,
  ComplianceSeverity
};

// Re-export CryptoUtils as value export since it's a class
export { CryptoUtils };

// Legacy interfaces for backward compatibility
export interface SecurityThreat {
  id: string
  type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'data_breach' | 'unauthorized_access' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  target: string
  timestamp: Date
  description: string
  evidence: any[]
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive'
  automaticResponse: boolean
  userAgent?: string
  ipAddress?: string
  geoLocation?: { country: string; city: string; lat: number; lon: number }
}

/**
 * Comprehensive Security System Configuration
 */
export interface SecurityConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  masterEncryptionKey: string;
  environment: 'development' | 'staging' | 'production';
  monitoring: {
    enabled: boolean;
    realTimeScanning: boolean;
    threatDetectionInterval: number;
  };
  compliance: {
    enabledFrameworks: string[];
    autoAssessment: boolean;
  };
}

/**
 * Advanced Security System - Main Class
 * Integrates all security components into a unified system
 */
export class AdvancedSecuritySystem {
  private authManager!: AuthenticationManager;
  private encryptionManager!: EncryptionManager;
  private securityMonitor!: SecurityMonitor;
  private complianceManager!: ComplianceManager;
  private config: SecurityConfig;
  private initialized: boolean = false;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      jwtSecret: config?.jwtSecret || this.generateSecureSecret(64),
      jwtRefreshSecret: config?.jwtRefreshSecret || this.generateSecureSecret(64),
      masterEncryptionKey: config?.masterEncryptionKey || this.generateSecureSecret(64),
      environment: config?.environment || 'development',
      monitoring: {
        enabled: config?.monitoring?.enabled ?? true,
        realTimeScanning: config?.monitoring?.realTimeScanning ?? true,
        threatDetectionInterval: config?.monitoring?.threatDetectionInterval ?? 5000
      },
      compliance: {
        enabledFrameworks: config?.compliance?.enabledFrameworks || ['gdpr', 'iso_27001'],
        autoAssessment: config?.compliance?.autoAssessment ?? false
      }
    };

    this.initializeComponents();
  }

  /**
   * Initialize all security components
   */
  private initializeComponents(): void {
    try {
      // Initialize authentication manager
      this.authManager = new AuthenticationManager(
        this.config.jwtSecret,
        this.config.jwtRefreshSecret
      );

      // Initialize encryption manager
      this.encryptionManager = new EncryptionManager(this.config.masterEncryptionKey);

      // Initialize security monitor
      this.securityMonitor = new SecurityMonitor();

      // Initialize compliance manager
      this.complianceManager = new ComplianceManager();

      // Setup real-time monitoring if enabled
      if (this.config.monitoring.enabled && this.config.monitoring.realTimeScanning) {
        this.startRealTimeMonitoring();
      }

      this.initialized = true;
      console.log('✅ CODAI Advanced Security System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Security System:', error);
      throw error;
    }
  }

  /**
   * Start real-time security monitoring
   */
  private startRealTimeMonitoring(): void {
    setInterval(() => {
      this.performSecurityScan();
    }, this.config.monitoring.threatDetectionInterval);

    console.log('🔍 Real-time security monitoring started');
  }

  /**
   * Perform comprehensive security scan
   */
  private performSecurityScan(): void {
    try {
      // Generate security metrics
      const metrics = this.securityMonitor.generateMetrics();

      // Log security events if needed
      if (metrics.activeThreats > 0) {
        this.securityMonitor.logEvent(
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          'SecurityScan',
          { activeThreats: metrics.activeThreats, securityScore: metrics.securityScore }
        );
      }
    } catch (error) {
      console.error('Security scan error:', error);
    }
  }

  /**
   * Authentication Methods
   */
  async registerUser(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const result = await this.authManager.registerUser(userData);

    if (result.success && result.user) {
      this.securityMonitor.logEvent(
        SecurityEventType.LOGIN_SUCCESS,
        'UserRegistration',
        { userId: result.user.id, email: result.user.email }
      );
    }

    return result;
  }

  async authenticateUser(
    email: string,
    password: string,
    deviceId: string,
    ipAddress: string
  ): Promise<AuthenticationResult> {
    const result = await this.authManager.authenticateUser(email, password, deviceId, ipAddress);

    // Log authentication attempt
    this.securityMonitor.logEvent(
      result.success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      'Authentication',
      { email, deviceId, success: result.success },
      result.user?.id,
      undefined,
      ipAddress
    );

    return result;
  }

  async verifyMFA(
    mfaToken: string,
    totpCode: string,
    deviceId: string,
    ipAddress: string
  ): Promise<AuthenticationResult> {
    const result = await this.authManager.verifyMFA(mfaToken, totpCode, deviceId, ipAddress);

    this.securityMonitor.logEvent(
      result.success ? SecurityEventType.MFA_SUCCESS : SecurityEventType.MFA_FAILURE,
      'MFAVerification',
      { deviceId, success: result.success },
      result.user?.id,
      undefined,
      ipAddress
    );

    return result;
  }

  validateToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    return this.authManager.validateToken(token);
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    return this.authManager.hasPermission(user, resource, action);
  }

  /**
   * Encryption Methods
   */
  encryptData(data: string | Buffer, options?: EncryptionOptions): EncryptedData {
    return this.encryptionManager.encrypt(data, undefined, options);
  }

  decryptData(encryptedData: EncryptedData): string {
    return this.encryptionManager.decrypt(encryptedData);
  }

  encryptWithPassword(data: string, password: string, options?: EncryptionOptions): EncryptedData {
    return this.encryptionManager.encryptWithPassword(data, password, options);
  }

  decryptWithPassword(encryptedData: EncryptedData, password: string, options?: EncryptionOptions): string {
    return this.encryptionManager.decryptWithPassword(encryptedData, password, options);
  }

  generateRSAKeyPair(keySize?: number): KeyPair {
    return this.encryptionManager.generateRSAKeyPair(keySize);
  }

  /**
   * Security Monitoring Methods
   */
  logSecurityEvent(
    type: SecurityEventType,
    source: string,
    details?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): SecurityEvent {
    return this.securityMonitor.logEvent(type, source, details, userId, sessionId, ipAddress, userAgent);
  }

  getSecurityMetrics(timeRange?: { start: Date; end: Date }): SecurityMetrics {
    return this.securityMonitor.generateMetrics(timeRange);
  }

  resolveSecurityEvent(eventId: string, resolvedBy: string, notes?: string): boolean {
    return this.securityMonitor.resolveEvent(eventId, resolvedBy, notes);
  }

  /**
   * Compliance Methods
   */
  async conductComplianceAssessment(
    frameworkId: string,
    assessmentType: 'self' | 'internal' | 'external',
    assessor: string
  ): Promise<ComplianceAssessment> {
    return await this.complianceManager.conductAssessment(frameworkId, assessmentType, assessor);
  }

  generateComplianceReport(
    type: any,
    frameworks: string[],
    period: { start: Date; end: Date }
  ): ComplianceReport {
    return this.complianceManager.generateComplianceReport(type, frameworks, period);
  }

  getAllFrameworks(): ComplianceFramework[] {
    return this.complianceManager.getAllFrameworks();
  }

  /**
   * Request Analysis for incoming requests
   */
  analyzeRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    userAgent: string;
    ipAddress: string;
  }): { allowed: boolean; threats: SecurityThreat[]; riskScore: number } {
    const threats: SecurityThreat[] = [];
    let riskScore = 0;

    // Convert to security events and analyze
    const content = `${request.url} ${request.body || ''} ${JSON.stringify(request.headers)}`;

    // Check for SQL injection patterns
    if (/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b|'|\"|;|--|\||&)/i.test(content)) {
      const threat = this.createLegacyThreat(
        'sql_injection',
        'high',
        request.ipAddress,
        request.url,
        'SQL injection pattern detected',
        { request, pattern: 'sql_injection' }
      );
      threats.push(threat);
      riskScore += 30;

      // Log as security event
      this.logSecurityEvent(
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        'RequestAnalysis',
        { url: request.url, pattern: 'sql_injection' },
        undefined,
        undefined,
        request.ipAddress,
        request.userAgent
      );
    }

    // Check for XSS patterns
    if (/<script|javascript:|onerror|onload|onclick|alert\(|document\.|window\.|eval\(/i.test(content)) {
      const threat = this.createLegacyThreat(
        'xss',
        'high',
        request.ipAddress,
        request.url,
        'XSS pattern detected',
        { request, pattern: 'xss' }
      );
      threats.push(threat);
      riskScore += 25;

      this.logSecurityEvent(
        SecurityEventType.XSS_ATTEMPT,
        'RequestAnalysis',
        { url: request.url, pattern: 'xss' },
        undefined,
        undefined,
        request.ipAddress,
        request.userAgent
      );
    }

    const allowed = threats.every(threat => threat.severity !== 'critical') && riskScore < 80;

    return { allowed, threats, riskScore: Math.min(100, riskScore) };
  }

  /**
   * Create legacy threat format for backward compatibility
   */
  private createLegacyThreat(
    type: SecurityThreat['type'],
    severity: SecurityThreat['severity'],
    source: string,
    target: string,
    description: string,
    evidence: any
  ): SecurityThreat {
    return {
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      source,
      target,
      timestamp: new Date(),
      description,
      evidence: [evidence],
      status: 'detected',
      automaticResponse: severity === 'critical' || severity === 'high',
      ipAddress: source
    };
  }

  /**
   * Get comprehensive security dashboard
   */
  getSecurityDashboard() {
    const metrics = this.getSecurityMetrics();
    const frameworks = this.getAllFrameworks();

    return {
      metrics,
      frameworks,
      recentEvents: [], // Would get from security monitor
      systemStatus: {
        authenticationSystem: this.initialized,
        encryptionSystem: this.initialized,
        monitoringSystem: this.initialized,
        complianceSystem: this.initialized
      },
      config: {
        environment: this.config.environment,
        monitoringEnabled: this.config.monitoring.enabled,
        enabledFrameworks: this.config.compliance.enabledFrameworks
      }
    };
  }

  /**
   * Utility method to generate secure secrets
   */
  private generateSecureSecret(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Shutdown security system
   */
  shutdown(): void {
    console.log('🔒 Shutting down Advanced Security System...');
    this.initialized = false;
  }
}

// Global security instance
let globalSecurity: AdvancedSecuritySystem | null = null;

/**
 * Initialize the global security system
 */
export function initializeSecurity(config?: Partial<SecurityConfig>): AdvancedSecuritySystem {
  if (!globalSecurity) {
    globalSecurity = new AdvancedSecuritySystem(config);
  }
  return globalSecurity;
}

/**
 * Get the global security instance
 */
export function getSecurity(): AdvancedSecuritySystem | null {
  return globalSecurity;
}

/**
 * Quick setup function for common scenarios
 */
export function setupSecurityForEnvironment(env: 'development' | 'staging' | 'production'): AdvancedSecuritySystem {
  const config: Partial<SecurityConfig> = {
    environment: env,
    monitoring: {
      enabled: true,
      realTimeScanning: env === 'production',
      threatDetectionInterval: env === 'production' ? 3000 : 10000
    },
    compliance: {
      enabledFrameworks: env === 'production' ? ['gdpr', 'iso_27001', 'sox'] : ['gdpr'],
      autoAssessment: env === 'production'
    }
  };

  return initializeSecurity(config);
}

// Export individual managers for advanced usage
export {
  AuthenticationManager,
  EncryptionManager,
  SecurityMonitor,
  ComplianceManager
};

// Export the main class as default
export default AdvancedSecuritySystem;
