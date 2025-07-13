/**
 * Production Security Policy Enforcement
 * ROMAI Ultimate MCP Server - Environment-Specific Security Policies
 * 
 * Features:
 * - Environment-specific security configurations
 * - Policy validation and enforcement
 * - Security compliance monitoring
 * - Automated security updates
 * - Threat detection and response
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { SecurityConfig } from './production-config-manager';

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  environment: string;
  rules: SecurityRule[];
  compliance: ComplianceRequirement[];
  enforcement: EnforcementLevel;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  id: string;
  category: SecurityCategory;
  rule: string;
  required: boolean;
  severity: SecuritySeverity;
  action: SecurityAction;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface ComplianceRequirement {
  standard: string; // ISO27001, SOC2, PCI-DSS, GDPR, etc.
  requirement: string;
  description: string;
  mappedRules: string[];
  status: ComplianceStatus;
}

export enum SecurityCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ENCRYPTION = 'encryption',
  NETWORK = 'network',
  DATA_PROTECTION = 'data_protection',
  AUDIT = 'audit',
  ACCESS_CONTROL = 'access_control',
  INPUT_VALIDATION = 'input_validation',
  SESSION_MANAGEMENT = 'session_management',
  ERROR_HANDLING = 'error_handling'
}

export enum SecuritySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum SecurityAction {
  BLOCK = 'block',
  WARN = 'warn',
  LOG = 'log',
  MONITOR = 'monitor',
  QUARANTINE = 'quarantine'
}

export enum EnforcementLevel {
  STRICT = 'strict',
  STANDARD = 'standard',
  RELAXED = 'relaxed',
  DISABLED = 'disabled'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review',
  NOT_APPLICABLE = 'not_applicable'
}

export interface SecurityViolation {
  id: string;
  ruleId: string;
  severity: SecuritySeverity;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  remediation?: string;
}

export interface SecurityMetrics {
  totalRules: number;
  activeRules: number;
  violationsCount: number;
  complianceScore: number;
  lastAssessment: Date;
  threatLevel: SecuritySeverity;
  blockedAttempts: number;
  suspiciousActivity: number;
}

/**
 * Production Security Policy Manager
 * Enforces environment-specific security policies
 */
export class ProductionSecurityPolicyManager extends EventEmitter {
  private policies: Map<string, SecurityPolicy> = new Map();
  private violations: SecurityViolation[] = [];
  private metrics: SecurityMetrics;
  private environment: string;
  private enforcementLevel: EnforcementLevel;

  constructor(environment: string = process.env.NODE_ENV || 'development') {
    super();
    this.environment = environment;
    this.enforcementLevel = this.getEnforcementLevel(environment);
    this.metrics = this.initializeMetrics();
    this.loadDefaultPolicies();
  }

  /**
   * Load default security policies for environment
   */
  private loadDefaultPolicies(): void {
    const productionPolicy = this.createProductionSecurityPolicy();
    const developmentPolicy = this.createDevelopmentSecurityPolicy();
    const stagingPolicy = this.createStagingSecurityPolicy();

    this.policies.set('production', productionPolicy);
    this.policies.set('development', developmentPolicy);
    this.policies.set('staging', stagingPolicy);

    console.log(`[SecurityPolicy] Loaded ${this.policies.size} security policies`);
  }

  /**
   * Create production security policy
   */
  private createProductionSecurityPolicy(): SecurityPolicy {
    return {
      id: 'prod-policy-v1',
      name: 'Production Security Policy',
      description: 'Strict security policy for production environment',
      environment: 'production',
      enforcement: EnforcementLevel.STRICT,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: [
        {
          id: 'auth-001',
          category: SecurityCategory.AUTHENTICATION,
          rule: 'Strong password policy enforcement',
          required: true,
          severity: SecuritySeverity.CRITICAL,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            minLength: 12,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
            preventReuse: 12
          }
        },
        {
          id: 'auth-002',
          category: SecurityCategory.AUTHENTICATION,
          rule: 'JWT token security',
          required: true,
          severity: SecuritySeverity.CRITICAL,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            algorithm: 'HS256',
            expiresIn: '24h',
            issuer: 'romai-mcp-server',
            audience: 'romai-mcp-clients',
            secretMinLength: 64,
            rotationInterval: 30 * 24 * 60 * 60 * 1000 // 30 days
          }
        },
        {
          id: 'auth-003',
          category: SecurityCategory.AUTHENTICATION,
          rule: 'Rate limiting enforcement',
          required: true,
          severity: SecuritySeverity.HIGH,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 1000,
            blockDuration: 60 * 60 * 1000, // 1 hour
            skipSuccessfulRequests: false,
            skipFailedRequests: false
          }
        },
        {
          id: 'enc-001',
          category: SecurityCategory.ENCRYPTION,
          rule: 'TLS/SSL enforcement',
          required: true,
          severity: SecuritySeverity.CRITICAL,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            minTlsVersion: '1.2',
            preferredVersion: '1.3',
            allowHttp: false,
            hstsMaxAge: 31536000,
            includeSubdomains: true,
            preload: true
          }
        },
        {
          id: 'enc-002',
          category: SecurityCategory.ENCRYPTION,
          rule: 'Data encryption at rest',
          required: true,
          severity: SecuritySeverity.CRITICAL,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            algorithm: 'AES-256-GCM',
            keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
            encryptPII: true,
            encryptSecrets: true
          }
        },
        {
          id: 'net-001',
          category: SecurityCategory.NETWORK,
          rule: 'Network access control',
          required: true,
          severity: SecuritySeverity.HIGH,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            allowedOrigins: ['https://api.romai.dev', 'https://dashboard.romai.dev'],
            blockedIPs: [],
            whitelistedIPs: ['127.0.0.1', '::1'],
            maxConnectionsPerIP: 100,
            connectionTimeout: 30000
          }
        },
        {
          id: 'data-001',
          category: SecurityCategory.DATA_PROTECTION,
          rule: 'PII data protection',
          required: true,
          severity: SecuritySeverity.CRITICAL,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            encryptPII: true,
            maskPII: true,
            auditAccess: true,
            retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
            purgeAfterExpiry: true
          }
        },
        {
          id: 'audit-001',
          category: SecurityCategory.AUDIT,
          rule: 'Comprehensive audit logging',
          required: true,
          severity: SecuritySeverity.HIGH,
          action: SecurityAction.LOG,
          enabled: true,
          parameters: {
            logLevel: 'info',
            includeHeaders: false,
            includePII: false,
            retentionPeriod: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
            realTimeMonitoring: true
          }
        },
        {
          id: 'access-001',
          category: SecurityCategory.ACCESS_CONTROL,
          rule: 'Role-based access control',
          required: true,
          severity: SecuritySeverity.HIGH,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            enforceRBAC: true,
            principleOfLeastPrivilege: true,
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
            maxConcurrentSessions: 5
          }
        },
        {
          id: 'input-001',
          category: SecurityCategory.INPUT_VALIDATION,
          rule: 'Input validation and sanitization',
          required: true,
          severity: SecuritySeverity.HIGH,
          action: SecurityAction.BLOCK,
          enabled: true,
          parameters: {
            validateAllInputs: true,
            sanitizeInputs: true,
            maxInputSize: 1024 * 1024, // 1MB
            allowedContentTypes: ['application/json', 'text/plain'],
            blockScripts: true
          }
        }
      ],
      compliance: [
        {
          standard: 'ISO27001',
          requirement: 'A.9.4.2 - Secure log-on procedures',
          description: 'Access to systems and applications shall be controlled by a secure log-on procedure',
          mappedRules: ['auth-001', 'auth-002', 'access-001'],
          status: ComplianceStatus.COMPLIANT
        },
        {
          standard: 'SOC2',
          requirement: 'CC6.1 - Logical and physical access controls',
          description: 'The entity implements logical and physical access controls to meet the objectives',
          mappedRules: ['auth-001', 'auth-002', 'auth-003', 'access-001'],
          status: ComplianceStatus.COMPLIANT
        },
        {
          standard: 'GDPR',
          requirement: 'Article 32 - Security of processing',
          description: 'Appropriate technical and organisational measures to ensure security',
          mappedRules: ['enc-001', 'enc-002', 'data-001', 'audit-001'],
          status: ComplianceStatus.COMPLIANT
        }
      ]
    };
  }

  /**
   * Create development security policy (more relaxed)
   */
  private createDevelopmentSecurityPolicy(): SecurityPolicy {
    const prodPolicy = this.createProductionSecurityPolicy();
    return {
      ...prodPolicy,
      id: 'dev-policy-v1',
      name: 'Development Security Policy',
      description: 'Relaxed security policy for development environment',
      environment: 'development',
      enforcement: EnforcementLevel.RELAXED,
      rules: prodPolicy.rules.map(rule => ({
        ...rule,
        severity: rule.severity === SecuritySeverity.CRITICAL ? SecuritySeverity.HIGH : rule.severity,
        action: rule.action === SecurityAction.BLOCK ? SecurityAction.WARN : rule.action,
        parameters: {
          ...rule.parameters,
          // Relax password requirements for development
          ...(rule.id === 'auth-001' && {
            minLength: 8,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
          }),
          // Relax rate limiting for development
          ...(rule.id === 'auth-003' && {
            maxRequests: 10000,
            blockDuration: 5 * 60 * 1000 // 5 minutes
          }),
          // Allow HTTP in development
          ...(rule.id === 'enc-001' && {
            allowHttp: true
          })
        }
      }))
    };
  }

  /**
   * Create staging security policy (intermediate)
   */
  private createStagingSecurityPolicy(): SecurityPolicy {
    const prodPolicy = this.createProductionSecurityPolicy();
    return {
      ...prodPolicy,
      id: 'staging-policy-v1',
      name: 'Staging Security Policy',
      description: 'Intermediate security policy for staging environment',
      environment: 'staging',
      enforcement: EnforcementLevel.STANDARD,
      rules: prodPolicy.rules.map(rule => ({
        ...rule,
        parameters: {
          ...rule.parameters,
          // Moderate rate limiting for staging
          ...(rule.id === 'auth-003' && {
            maxRequests: 5000,
            blockDuration: 30 * 60 * 1000 // 30 minutes
          })
        }
      }))
    };
  }

  /**
   * Get enforcement level based on environment
   */
  private getEnforcementLevel(environment: string): EnforcementLevel {
    switch (environment) {
      case 'production':
        return EnforcementLevel.STRICT;
      case 'staging':
        return EnforcementLevel.STANDARD;
      case 'development':
        return EnforcementLevel.RELAXED;
      default:
        return EnforcementLevel.STANDARD;
    }
  }

  /**
   * Initialize security metrics
   */
  private initializeMetrics(): SecurityMetrics {
    return {
      totalRules: 0,
      activeRules: 0,
      violationsCount: 0,
      complianceScore: 100,
      lastAssessment: new Date(),
      threatLevel: SecuritySeverity.LOW,
      blockedAttempts: 0,
      suspiciousActivity: 0
    };
  }

  /**
   * Validate security configuration against policy
   */
  public validateSecurityConfig(config: SecurityConfig): SecurityViolation[] {
    const policy = this.policies.get(this.environment);
    if (!policy) {
      throw new Error(`No security policy found for environment: ${this.environment}`);
    }

    const violations: SecurityViolation[] = [];

    for (const rule of policy.rules) {
      if (!rule.enabled) continue;

      const violation = this.validateRule(rule, config);
      if (violation) {
        violations.push(violation);
        this.violations.push(violation);
      }
    }

    this.updateMetrics();
    this.emit('validationComplete', violations);

    return violations;
  }

  /**
   * Validate individual security rule
   */
  private validateRule(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    try {
      switch (rule.id) {
        case 'auth-001':
          return this.validatePasswordPolicy(rule, config);
        case 'auth-002':
          return this.validateJWTSecurity(rule, config);
        case 'auth-003':
          return this.validateRateLimiting(rule, config);
        case 'enc-001':
          return this.validateTLSSecurity(rule, config);
        case 'net-001':
          return this.validateNetworkSecurity(rule, config);
        default:
          return null;
      }
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        ruleId: rule.id,
        severity: SecuritySeverity.HIGH,
        message: `Rule validation failed: ${error}`,
        details: { rule, error: String(error) },
        timestamp: new Date(),
        resolved: false
      };
    }
  }

  /**
   * Validate password policy
   */
  private validatePasswordPolicy(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    const policy = config.passwordPolicy;
    const params = rule.parameters;

    if (policy.minLength < params.minLength) {
      return this.createViolation(rule, `Password minimum length ${policy.minLength} is below required ${params.minLength}`);
    }

    if (params.requireUppercase && !policy.requireUppercase) {
      return this.createViolation(rule, 'Password policy must require uppercase letters');
    }

    if (params.requireLowercase && !policy.requireLowercase) {
      return this.createViolation(rule, 'Password policy must require lowercase letters');
    }

    if (params.requireNumbers && !policy.requireNumbers) {
      return this.createViolation(rule, 'Password policy must require numbers');
    }

    if (params.requireSpecialChars && !policy.requireSpecialChars) {
      return this.createViolation(rule, 'Password policy must require special characters');
    }

    return null;
  }

  /**
   * Validate JWT security
   */
  private validateJWTSecurity(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    const jwt = config.jwt;
    const params = rule.parameters;

    if (jwt.algorithm !== params.algorithm) {
      return this.createViolation(rule, `JWT algorithm ${jwt.algorithm} does not match required ${params.algorithm}`);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < params.secretMinLength) {
      return this.createViolation(rule, `JWT secret length is below required ${params.secretMinLength} characters`);
    }

    return null;
  }

  /**
   * Validate rate limiting
   */
  private validateRateLimiting(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    const rateLimit = config.rateLimiting;
    const params = rule.parameters;

    if (!rateLimit.enabled) {
      return this.createViolation(rule, 'Rate limiting must be enabled');
    }

    if (rateLimit.maxRequests > params.maxRequests) {
      return this.createViolation(rule, `Rate limit ${rateLimit.maxRequests} exceeds maximum allowed ${params.maxRequests}`);
    }

    return null;
  }

  /**
   * Validate TLS security
   */
  private validateTLSSecurity(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    const params = rule.parameters;

    if (this.environment === 'production' && params.allowHttp === false) {
      // In production, ensure HTTPS is enforced
      if (process.env.FORCE_HTTPS !== 'true') {
        return this.createViolation(rule, 'HTTPS must be enforced in production');
      }
    }

    return null;
  }

  /**
   * Validate network security
   */
  private validateNetworkSecurity(rule: SecurityRule, config: SecurityConfig): SecurityViolation | null {
    const cors = config.cors;
    const params = rule.parameters;

    if (this.environment === 'production' && cors.origin === '*') {
      return this.createViolation(rule, 'CORS origin cannot be wildcard (*) in production');
    }

    return null;
  }

  /**
   * Create security violation
   */
  private createViolation(rule: SecurityRule, message: string): SecurityViolation {
    return {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      severity: rule.severity,
      message,
      details: { rule },
      timestamp: new Date(),
      resolved: false
    };
  }

  /**
   * Update security metrics
   */
  private updateMetrics(): void {
    const policy = this.policies.get(this.environment);
    if (!policy) return;

    this.metrics.totalRules = policy.rules.length;
    this.metrics.activeRules = policy.rules.filter(r => r.enabled).length;
    this.metrics.violationsCount = this.violations.filter(v => !v.resolved).length;
    this.metrics.lastAssessment = new Date();

    // Calculate compliance score
    const totalCriticalRules = policy.rules.filter(r => r.severity === SecuritySeverity.CRITICAL).length;
    const violatedCriticalRules = this.violations.filter(v =>
      !v.resolved && v.severity === SecuritySeverity.CRITICAL
    ).length;

    this.metrics.complianceScore = totalCriticalRules > 0
      ? Math.max(0, 100 - (violatedCriticalRules / totalCriticalRules * 100))
      : 100;

    // Determine threat level
    if (this.metrics.violationsCount === 0) {
      this.metrics.threatLevel = SecuritySeverity.LOW;
    } else if (violatedCriticalRules > 0) {
      this.metrics.threatLevel = SecuritySeverity.CRITICAL;
    } else {
      this.metrics.threatLevel = SecuritySeverity.MEDIUM;
    }
  }

  /**
   * Get security policy for environment
   */
  public getSecurityPolicy(environment?: string): SecurityPolicy | undefined {
    return this.policies.get(environment || this.environment);
  }

  /**
   * Get security metrics
   */
  public getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get unresolved violations
   */
  public getViolations(resolved: boolean = false): SecurityViolation[] {
    return this.violations.filter(v => v.resolved === resolved);
  }

  /**
   * Resolve security violation
   */
  public resolveViolation(violationId: string, remediation?: string): boolean {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      violation.remediation = remediation;
      this.updateMetrics();
      this.emit('violationResolved', violation);
      return true;
    }
    return false;
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(): any {
    const policy = this.policies.get(this.environment);
    if (!policy) return null;

    return {
      policy: {
        id: policy.id,
        name: policy.name,
        environment: policy.environment,
        version: policy.version
      },
      compliance: policy.compliance.map(req => ({
        standard: req.standard,
        requirement: req.requirement,
        status: req.status,
        mappedRules: req.mappedRules.length,
        violations: this.violations.filter(v =>
          !v.resolved && req.mappedRules.includes(v.ruleId)
        ).length
      })),
      metrics: this.metrics,
      violations: this.getViolations(),
      generatedAt: new Date()
    };
  }
}

// Export singleton instance
export const securityPolicyManager = new ProductionSecurityPolicyManager();

// Export convenience functions
export function validateSecurityConfiguration(config: SecurityConfig): SecurityViolation[] {
  return securityPolicyManager.validateSecurityConfig(config);
}

export function getSecurityMetrics(): SecurityMetrics {
  return securityPolicyManager.getSecurityMetrics();
}

export function generateComplianceReport(): any {
  return securityPolicyManager.generateComplianceReport();
}
