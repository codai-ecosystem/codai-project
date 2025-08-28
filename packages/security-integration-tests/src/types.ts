/**
 * Security Integration Testing Types
 * Comprehensive type definitions for Essential CodAI Services security testing
 */

// Essential CodAI Services Configuration
export interface EssentialService {
  id: string;
  name: string;
  port: number;
  baseUrl: string;
  healthEndpoint: string;
  apiEndpoints: string[];
  authRequired: boolean;
  rateLimit: RateLimitConfig;
  securityProfile: SecurityProfile;
  testScenarios: TestScenario[];
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  keyGenerator: 'ip' | 'user' | 'session';
  message: string;
}

export interface SecurityProfile {
  cors: CorsConfig;
  helmet: HelmetConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  inputValidation: InputValidationConfig;
  dataProtection: DataProtectionConfig;
}

export interface CorsConfig {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

export interface HelmetConfig {
  contentSecurityPolicy: boolean;
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: boolean;
  crossOriginResourcePolicy: boolean;
  dnsPrefetchControl: boolean;
  frameguard: boolean;
  hidePoweredBy: boolean;
  hsts: boolean;
  ieNoOpen: boolean;
  noSniff: boolean;
  originAgentCluster: boolean;
  permittedCrossDomainPolicies: boolean;
  referrerPolicy: boolean;
  xssFilter: boolean;
}

export interface AuthenticationConfig {
  required: boolean;
  methods: ('jwt' | 'oauth2' | 'basic' | 'bearer')[];
  tokenExpiration: number;
  refreshTokenEnabled: boolean;
  mfaEnabled: boolean;
  passwordPolicy: PasswordPolicy;
}

export interface AuthorizationConfig {
  enabled: boolean;
  type: 'rbac' | 'abac' | 'acl';
  roles: string[];
  permissions: string[];
  resourceBased: boolean;
}

export interface InputValidationConfig {
  sanitization: boolean;
  xssProtection: boolean;
  sqlInjectionProtection: boolean;
  htmlEscaping: boolean;
  maxInputSize: number;
  allowedFileTypes: string[];
}

export interface DataProtectionConfig {
  encryption: EncryptionConfig;
  gdprCompliance: boolean;
  dataRetention: DataRetentionConfig;
  auditLogging: boolean;
  sensitiveDataMasking: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  saltRounds: number;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
}

export interface DataRetentionConfig {
  enabled: boolean;
  defaultRetentionPeriod: number;
  categories: RetentionCategory[];
  autoCleanup: boolean;
  notificationEnabled: boolean;
}

export interface RetentionCategory {
  name: string;
  retentionPeriod: number;
  dataTypes: string[];
  legalBasis: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
  maxAge: number;
}

// Test Configuration and Scenarios
export interface TestScenario {
  id: string;
  name: string;
  category: TestCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  prerequisites: string[];
  timeout: number;
  retryCount: number;
}

export type TestCategory =
  | 'rate-limiting'
  | 'authentication'
  | 'authorization'
  | 'input-validation'
  | 'xss-protection'
  | 'sql-injection'
  | 'csrf-protection'
  | 'security-headers'
  | 'cors'
  | 'vulnerability-scan'
  | 'threat-detection'
  | 'performance-impact'
  | 'data-protection'
  | 'session-security'
  | 'file-upload'
  | 'api-security';

export interface TestStep {
  id: string;
  action: TestAction;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  endpoint: string;
  headers?: Record<string, string>;
  payload?: any;
  delay?: number;
  validation?: ValidationRule[];
}

export type TestAction =
  | 'http-request'
  | 'authentication'
  | 'rate-limit-test'
  | 'payload-injection'
  | 'header-manipulation'
  | 'session-hijacking'
  | 'brute-force'
  | 'vulnerability-scan'
  | 'performance-test';

export interface ValidationRule {
  type: 'status-code' | 'response-time' | 'header-present' | 'body-contains' | 'security-header';
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'regex';
  value: any;
  required: boolean;
}

export interface ExpectedResult {
  type: 'success' | 'failure' | 'warning';
  condition: string;
  message: string;
  securityImplication: string;
}

// Test Execution and Results
export interface SecurityTestConfig {
  services: EssentialService[];
  testSuites: TestSuite[];
  reporting: ReportingConfig;
  monitoring: MonitoringConfig;
  automation: AutomationConfig;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  scenarios: TestScenario[];
  parallel: boolean;
  timeout: number;
  continueOnFailure: boolean;
}

export interface TestExecution {
  id: string;
  suiteId: string;
  scenarioId: string;
  serviceId: string;
  startTime: Date;
  endTime?: Date;
  status: TestStatus;
  results: TestResult[];
  metrics: TestMetrics;
  errors: TestError[];
}

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'timeout';

export interface TestResult {
  stepId: string;
  status: TestStatus;
  responseTime: number;
  statusCode?: number;
  headers?: Record<string, string | string[]>;
  body?: any;
  validations: ValidationResult[];
  securityFindings: SecurityFinding[];
}

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  actualValue: any;
  expectedValue: any;
  message: string;
}

export interface SecurityFinding {
  id: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  cweId?: string;
  cvssScore?: number;
  evidence: any;
}

export interface TestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
  securityScore: number;
}

export interface TestError {
  code: string;
  message: string;
  stack?: string;
  timestamp: Date;
  context: any;
}

// Reporting and Monitoring
export interface ReportingConfig {
  enabled: boolean;
  formats: ('html' | 'json' | 'xml' | 'pdf')[];
  outputDir: string;
  includeMetrics: boolean;
  includeScreenshots: boolean;
  includeEvidence: boolean;
  template: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  realTime: boolean;
  webhooks: WebhookConfig[];
  notifications: NotificationConfig[];
  dashboardUrl?: string;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  events: string[];
  retryCount: number;
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'teams' | 'sms';
  recipients: string[];
  template: string;
  severity: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface AutomationConfig {
  enabled: boolean;
  schedule: string;
  parallel: boolean;
  maxConcurrency: number;
  retryFailedTests: boolean;
  generateReports: boolean;
  sendNotifications: boolean;
}

// Essential CodAI Services Configuration
export const ESSENTIAL_CODAI_SERVICES: EssentialService[] = [
  {
    id: 'codai-auth-api',
    name: 'CodAI Authentication API',
    port: 8100,
    baseUrl: 'http://localhost:8100',
    healthEndpoint: '/health',
    apiEndpoints: ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/profile'],
    authRequired: false,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
      skipSuccessfulRequests: false,
      keyGenerator: 'ip',
      message: 'Too many requests from this IP'
    },
    securityProfile: {
      cors: {
        origins: ['http://localhost:3000', 'http://localhost:8006'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: true,
        methods: ['jwt', 'oauth2'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: true,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          preventReuse: 5,
          maxAge: 90
        }
      },
      authorization: {
        enabled: true,
        type: 'rbac',
        roles: ['admin', 'user', 'guest'],
        permissions: ['read', 'write', 'delete', 'admin'],
        resourceBased: true
      },
      inputValidation: {
        sanitization: true,
        xssProtection: true,
        sqlInjectionProtection: true,
        htmlEscaping: true,
        maxInputSize: 1024,
        allowedFileTypes: ['jpg', 'png', 'pdf']
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: true,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 365,
          categories: [
            { name: 'user-data', retentionPeriod: 365, dataTypes: ['profile', 'preferences'], legalBasis: 'consent' },
            { name: 'audit-logs', retentionPeriod: 2555, dataTypes: ['security-events'], legalBasis: 'legitimate-interest' }
          ],
          autoCleanup: true,
          notificationEnabled: true
        },
        auditLogging: true,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  },
  {
    id: 'codai-gateway-api',
    name: 'CodAI API Gateway',
    port: 8010,
    baseUrl: 'http://localhost:8010',
    healthEndpoint: '/health',
    apiEndpoints: ['/api/v1/*', '/proxy/*', '/routing/*'],
    authRequired: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 1000,
      skipSuccessfulRequests: false,
      keyGenerator: 'user',
      message: 'Rate limit exceeded'
    },
    securityProfile: {
      cors: {
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['*'],
        credentials: true,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: false,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: true,
        methods: ['jwt', 'bearer'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 0,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          preventReuse: 0,
          maxAge: 0
        }
      },
      authorization: {
        enabled: true,
        type: 'rbac',
        roles: ['admin', 'service', 'user'],
        permissions: ['proxy', 'route', 'admin'],
        resourceBased: true
      },
      inputValidation: {
        sanitization: true,
        xssProtection: true,
        sqlInjectionProtection: true,
        htmlEscaping: false,
        maxInputSize: 10240,
        allowedFileTypes: []
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: false,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 90,
          categories: [
            { name: 'request-logs', retentionPeriod: 90, dataTypes: ['access-logs'], legalBasis: 'legitimate-interest' }
          ],
          autoCleanup: true,
          notificationEnabled: false
        },
        auditLogging: true,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  },
  {
    id: 'codai-hub-api',
    name: 'CodAI Hub API',
    port: 8110,
    baseUrl: 'http://localhost:8110',
    healthEndpoint: '/health',
    apiEndpoints: ['/hub/*', '/conversations/*', '/memory/*'],
    authRequired: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 500,
      skipSuccessfulRequests: true,
      keyGenerator: 'user',
      message: 'Too many requests'
    },
    securityProfile: {
      cors: {
        origins: ['http://localhost:8006', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization', 'X-Request-ID'],
        credentials: true,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: true,
        methods: ['jwt'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 0,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          preventReuse: 0,
          maxAge: 0
        }
      },
      authorization: {
        enabled: true,
        type: 'rbac',
        roles: ['admin', 'user'],
        permissions: ['read', 'write', 'delete'],
        resourceBased: true
      },
      inputValidation: {
        sanitization: true,
        xssProtection: true,
        sqlInjectionProtection: true,
        htmlEscaping: true,
        maxInputSize: 4096,
        allowedFileTypes: ['txt', 'md', 'json']
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: true,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 1825,
          categories: [
            { name: 'conversations', retentionPeriod: 1825, dataTypes: ['messages', 'metadata'], legalBasis: 'consent' },
            { name: 'memory-data', retentionPeriod: 365, dataTypes: ['user-preferences'], legalBasis: 'consent' }
          ],
          autoCleanup: true,
          notificationEnabled: true
        },
        auditLogging: true,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  },
  {
    id: 'codai-memorai-mcp',
    name: 'CodAI MemorAI MCP Service',
    port: 4950,
    baseUrl: 'http://localhost:4950',
    healthEndpoint: '/health',
    apiEndpoints: ['/mcp', '/memory/*', '/recall/*', '/remember/*'],
    authRequired: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 200,
      skipSuccessfulRequests: true,
      keyGenerator: 'user',
      message: 'Memory service rate limit exceeded'
    },
    securityProfile: {
      cors: {
        origins: ['http://localhost:8006', 'http://localhost:8110'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
        credentials: true,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: true,
        methods: ['jwt'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 0,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          preventReuse: 0,
          maxAge: 0
        }
      },
      authorization: {
        enabled: true,
        type: 'rbac',
        roles: ['admin', 'user', 'agent'],
        permissions: ['recall', 'remember', 'forget', 'admin'],
        resourceBased: true
      },
      inputValidation: {
        sanitization: true,
        xssProtection: true,
        sqlInjectionProtection: true,
        htmlEscaping: true,
        maxInputSize: 8192,
        allowedFileTypes: []
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: true,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 2555,
          categories: [
            { name: 'memory-entries', retentionPeriod: 2555, dataTypes: ['memories', 'context'], legalBasis: 'consent' },
            { name: 'agent-interactions', retentionPeriod: 365, dataTypes: ['agent-logs'], legalBasis: 'legitimate-interest' }
          ],
          autoCleanup: true,
          notificationEnabled: true
        },
        auditLogging: true,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  },
  {
    id: 'codai-cbd-database',
    name: 'CodAI CBD Database Service',
    port: 8180,
    baseUrl: 'http://localhost:8180',
    healthEndpoint: '/health',
    apiEndpoints: ['/graph/*', '/query/*', '/schema/*'],
    authRequired: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 300,
      skipSuccessfulRequests: true,
      keyGenerator: 'user',
      message: 'Database service rate limit exceeded'
    },
    securityProfile: {
      cors: {
        origins: ['http://localhost:4950', 'http://localhost:8110'],
        methods: ['GET', 'POST'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: true,
        methods: ['jwt'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 0,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          preventReuse: 0,
          maxAge: 0
        }
      },
      authorization: {
        enabled: true,
        type: 'rbac',
        roles: ['admin', 'service', 'readonly'],
        permissions: ['query', 'write', 'schema', 'admin'],
        resourceBased: true
      },
      inputValidation: {
        sanitization: true,
        xssProtection: false,
        sqlInjectionProtection: true,
        htmlEscaping: false,
        maxInputSize: 16384,
        allowedFileTypes: []
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: true,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 2555,
          categories: [
            { name: 'knowledge-graph', retentionPeriod: 2555, dataTypes: ['entities', 'relationships'], legalBasis: 'legitimate-interest' },
            { name: 'query-logs', retentionPeriod: 90, dataTypes: ['access-logs'], legalBasis: 'legitimate-interest' }
          ],
          autoCleanup: true,
          notificationEnabled: false
        },
        auditLogging: true,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  },
  {
    id: 'codai-memorai-frontend',
    name: 'CodAI MemorAI Frontend',
    port: 8006,
    baseUrl: 'http://localhost:8006',
    healthEndpoint: '/api/health',
    apiEndpoints: ['/api/*', '/_next/*'],
    authRequired: false,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 1000,
      skipSuccessfulRequests: true,
      keyGenerator: 'ip',
      message: 'Too many requests'
    },
    securityProfile: {
      cors: {
        origins: ['*'],
        methods: ['GET', 'POST', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization'],
        credentials: false,
        maxAge: 86400
      },
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        dnsPrefetchControl: true,
        frameguard: false,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: false,
        permittedCrossDomainPolicies: false,
        referrerPolicy: true,
        xssFilter: true
      },
      authentication: {
        required: false,
        methods: ['jwt'],
        tokenExpiration: 3600,
        refreshTokenEnabled: true,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 0,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          preventReuse: 0,
          maxAge: 0
        }
      },
      authorization: {
        enabled: false,
        type: 'rbac',
        roles: [],
        permissions: [],
        resourceBased: false
      },
      inputValidation: {
        sanitization: true,
        xssProtection: true,
        sqlInjectionProtection: false,
        htmlEscaping: true,
        maxInputSize: 2048,
        allowedFileTypes: []
      },
      dataProtection: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          saltRounds: 12,
          encryptionAtRest: false,
          encryptionInTransit: true
        },
        gdprCompliance: true,
        dataRetention: {
          enabled: true,
          defaultRetentionPeriod: 30,
          categories: [
            { name: 'session-data', retentionPeriod: 30, dataTypes: ['sessions'], legalBasis: 'legitimate-interest' }
          ],
          autoCleanup: true,
          notificationEnabled: false
        },
        auditLogging: false,
        sensitiveDataMasking: true
      }
    },
    testScenarios: []
  }
];

// Test Suite Configurations
export const SECURITY_TEST_SUITES: TestSuite[] = [
  {
    id: 'rate-limiting-suite',
    name: 'Rate Limiting Tests',
    description: 'Test rate limiting configurations and enforcement',
    category: 'rate-limiting',
    scenarios: [],
    parallel: true,
    timeout: 30000,
    continueOnFailure: true
  },
  {
    id: 'authentication-suite',
    name: 'Authentication Security Tests',
    description: 'Test authentication mechanisms and security',
    category: 'authentication',
    scenarios: [],
    parallel: false,
    timeout: 60000,
    continueOnFailure: true
  },
  {
    id: 'authorization-suite',
    name: 'Authorization Tests',
    description: 'Test authorization controls and access management',
    category: 'authorization',
    scenarios: [],
    parallel: false,
    timeout: 45000,
    continueOnFailure: true
  },
  {
    id: 'input-validation-suite',
    name: 'Input Validation Tests',
    description: 'Test input sanitization and validation',
    category: 'input-validation',
    scenarios: [],
    parallel: true,
    timeout: 30000,
    continueOnFailure: true
  },
  {
    id: 'xss-protection-suite',
    name: 'XSS Protection Tests',
    description: 'Test cross-site scripting protection',
    category: 'xss-protection',
    scenarios: [],
    parallel: true,
    timeout: 45000,
    continueOnFailure: true
  },
  {
    id: 'security-headers-suite',
    name: 'Security Headers Tests',
    description: 'Test security header implementation',
    category: 'security-headers',
    scenarios: [],
    parallel: true,
    timeout: 15000,
    continueOnFailure: true
  },
  {
    id: 'vulnerability-scan-suite',
    name: 'Vulnerability Scanning Tests',
    description: 'Test for common vulnerabilities',
    category: 'vulnerability-scan',
    scenarios: [],
    parallel: false,
    timeout: 300000,
    continueOnFailure: true
  },
  {
    id: 'performance-impact-suite',
    name: 'Security Performance Impact Tests',
    description: 'Test performance impact of security measures',
    category: 'performance-impact',
    scenarios: [],
    parallel: false,
    timeout: 120000,
    continueOnFailure: true
  }
];