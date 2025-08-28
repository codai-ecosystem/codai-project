/**
 * Security Integration Testing Configuration
 * Environment-aware configuration for Essential CodAI Services security testing
 */

import { SecurityTestConfig, ReportingConfig, MonitoringConfig, AutomationConfig } from './types';

export interface SecurityTestEnvironment {
  name: string;
  baseUrl: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    token?: string;
  };
  timeout: number;
  retries: number;
  parallel: boolean;
}

export const getSecurityTestConfig = (): SecurityTestConfig => {
  const environment = process.env.NODE_ENV || 'development';
  const testEnv = getTestEnvironment(environment);

  return {
    services: getServicesConfig(),
    testSuites: getTestSuitesConfig(),
    reporting: getReportingConfig(),
    monitoring: getMonitoringConfig(),
    automation: getAutomationConfig()
  };
};

export const getTestEnvironment = (env: string): SecurityTestEnvironment => {
  switch (env) {
    case 'production':
      return {
        name: 'production',
        baseUrl: 'https://api.codai.ro',
        credentials: {
          apiKey: process.env.CODAI_PROD_API_KEY,
          token: process.env.CODAI_PROD_TOKEN
        },
        timeout: 30000,
        retries: 3,
        parallel: false
      };

    case 'staging':
      return {
        name: 'staging',
        baseUrl: 'https://staging-api.codai.ro',
        credentials: {
          apiKey: process.env.CODAI_STAGING_API_KEY,
          token: process.env.CODAI_STAGING_TOKEN
        },
        timeout: 20000,
        retries: 2,
        parallel: true
      };

    case 'development':
    default:
      return {
        name: 'development',
        baseUrl: 'http://localhost',
        credentials: {
          username: 'test-admin',
          password: 'test-password',
          apiKey: 'dev-api-key-2025',
          token: 'dev-jwt-token'
        },
        timeout: 10000,
        retries: 1,
        parallel: true
      };
  }
};

export const getServicesConfig = () => {
  return require('./types').ESSENTIAL_CODAI_SERVICES;
};

export const getTestSuitesConfig = () => {
  return require('./types').SECURITY_TEST_SUITES;
};

export const getReportingConfig = (): ReportingConfig => {
  return {
    enabled: true,
    formats: ['html', 'json'],
    outputDir: process.env.SECURITY_TEST_OUTPUT_DIR || './reports',
    includeMetrics: true,
    includeScreenshots: false,
    includeEvidence: true,
    template: 'security-report-template.html'
  };
};

export const getMonitoringConfig = (): MonitoringConfig => {
  return {
    enabled: true,
    realTime: true,
    webhooks: [
      {
        url: process.env.SECURITY_WEBHOOK_URL || 'http://localhost:4350/webhook/security',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SECURITY_WEBHOOK_TOKEN || 'dev-token'}`
        },
        events: ['test-started', 'test-completed', 'security-finding', 'test-failed'],
        retryCount: 3
      }
    ],
    notifications: [
      {
        type: 'slack',
        recipients: [process.env.SLACK_SECURITY_CHANNEL || '#security-alerts'],
        template: 'security-alert-template',
        severity: ['high', 'critical']
      }
    ],
    dashboardUrl: process.env.SECURITY_DASHBOARD_URL || 'http://localhost:4350/security-dashboard'
  };
};

export const getAutomationConfig = (): AutomationConfig => {
  return {
    enabled: process.env.SECURITY_AUTOMATION_ENABLED === 'true',
    schedule: process.env.SECURITY_TEST_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    parallel: true,
    maxConcurrency: parseInt(process.env.SECURITY_MAX_CONCURRENCY || '5'),
    retryFailedTests: true,
    generateReports: true,
    sendNotifications: true
  };
};

// Security Test Configuration Templates
export const SECURITY_HEADERS_CONFIG = {
  required: [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'Referrer-Policy',
    'Permissions-Policy'
  ],
  forbidden: [
    'Server',
    'X-Powered-By',
    'X-AspNet-Version',
    'X-AspNetMvc-Version'
  ],
  values: {
    'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
    'X-Content-Type-Options': ['nosniff'],
    'X-XSS-Protection': ['1; mode=block', '0'],
    'Strict-Transport-Security': ['max-age=31536000', 'max-age=31536000; includeSubDomains'],
    'Referrer-Policy': ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin']
  }
};

export const OWASP_TOP_10_CONFIG = {
  'A01:2021': 'Broken Access Control',
  'A02:2021': 'Cryptographic Failures',
  'A03:2021': 'Injection',
  'A04:2021': 'Insecure Design',
  'A05:2021': 'Security Misconfiguration',
  'A06:2021': 'Vulnerable and Outdated Components',
  'A07:2021': 'Identification and Authentication Failures',
  'A08:2021': 'Software and Data Integrity Failures',
  'A09:2021': 'Security Logging and Monitoring Failures',
  'A10:2021': 'Server-Side Request Forgery (SSRF)'
};

export const COMMON_PAYLOADS = {
  xss: [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    "';alert('XSS');//",
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ],
  sqlInjection: [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    '" OR "1"="1',
    '" OR "1"="1" --',
    '" OR "1"="1" /*',
    "' UNION SELECT NULL--",
    "'; DROP TABLE users; --",
    "' AND 1=CONVERT(int,@@version) --"
  ],
  commandInjection: [
    '; ls -la',
    '| ls -la',
    '&& ls -la',
    '; cat /etc/passwd',
    '| cat /etc/passwd',
    '&& cat /etc/passwd',
    '; whoami',
    '| whoami',
    '&& whoami'
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd'
  ],
  ldapInjection: [
    '*',
    '*)(&',
    '*)(uid=*',
    '*)(|(uid=*',
    '*)(|(cn=*))',
    '*()|%26'
  ]
};

export const SECURITY_SCAN_PROFILES = {
  quick: {
    name: 'Quick Security Scan',
    duration: 60,
    tests: ['security-headers', 'basic-xss', 'basic-sqli', 'authentication'],
    depth: 'shallow'
  },
  standard: {
    name: 'Standard Security Scan',
    duration: 300,
    tests: ['security-headers', 'xss', 'sqli', 'authentication', 'authorization', 'rate-limiting'],
    depth: 'medium'
  },
  comprehensive: {
    name: 'Comprehensive Security Scan',
    duration: 1800,
    tests: ['all'],
    depth: 'deep'
  },
  compliance: {
    name: 'Compliance Security Scan',
    duration: 900,
    tests: ['gdpr', 'owasp-top-10', 'security-headers', 'data-protection'],
    depth: 'compliance'
  }
};

// Environment Variables Configuration
export const ENV_CONFIG = {
  // Test Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  SECURITY_TEST_TIMEOUT: parseInt(process.env.SECURITY_TEST_TIMEOUT || '30000'),
  SECURITY_TEST_RETRIES: parseInt(process.env.SECURITY_TEST_RETRIES || '3'),
  SECURITY_TEST_PARALLEL: process.env.SECURITY_TEST_PARALLEL === 'true',

  // Services Configuration
  CODAI_AUTH_API_URL: process.env.CODAI_AUTH_API_URL || 'http://localhost:8100',
  CODAI_GATEWAY_API_URL: process.env.CODAI_GATEWAY_API_URL || 'http://localhost:8010',
  CODAI_HUB_API_URL: process.env.CODAI_HUB_API_URL || 'http://localhost:8110',
  CODAI_MEMORAI_MCP_URL: process.env.CODAI_MEMORAI_MCP_URL || 'http://localhost:4950',
  CODAI_CBD_DATABASE_URL: process.env.CODAI_CBD_DATABASE_URL || 'http://localhost:8180',
  CODAI_MEMORAI_FRONTEND_URL: process.env.CODAI_MEMORAI_FRONTEND_URL || 'http://localhost:8006',

  // Authentication Configuration
  TEST_USERNAME: process.env.TEST_USERNAME || 'test-admin',
  TEST_PASSWORD: process.env.TEST_PASSWORD || 'test-password',
  TEST_API_KEY: process.env.TEST_API_KEY || 'dev-api-key-2025',
  TEST_JWT_TOKEN: process.env.TEST_JWT_TOKEN || 'dev-jwt-token',

  // Reporting Configuration
  SECURITY_TEST_OUTPUT_DIR: process.env.SECURITY_TEST_OUTPUT_DIR || './reports',
  SECURITY_REPORT_FORMAT: process.env.SECURITY_REPORT_FORMAT || 'html,json',

  // Monitoring Configuration
  SECURITY_WEBHOOK_URL: process.env.SECURITY_WEBHOOK_URL || 'http://localhost:4350/webhook/security',
  SECURITY_WEBHOOK_TOKEN: process.env.SECURITY_WEBHOOK_TOKEN || 'dev-token',
  SECURITY_DASHBOARD_URL: process.env.SECURITY_DASHBOARD_URL || 'http://localhost:4350/security-dashboard',
  SLACK_SECURITY_CHANNEL: process.env.SLACK_SECURITY_CHANNEL || '#security-alerts',

  // Automation Configuration
  SECURITY_AUTOMATION_ENABLED: process.env.SECURITY_AUTOMATION_ENABLED === 'true',
  SECURITY_TEST_SCHEDULE: process.env.SECURITY_TEST_SCHEDULE || '0 2 * * *',
  SECURITY_MAX_CONCURRENCY: parseInt(process.env.SECURITY_MAX_CONCURRENCY || '5'),

  // External Tools Configuration
  OWASP_ZAP_URL: process.env.OWASP_ZAP_URL || 'http://localhost:8080',
  OWASP_ZAP_API_KEY: process.env.OWASP_ZAP_API_KEY || 'dev-zap-key',
  BURP_SUITE_URL: process.env.BURP_SUITE_URL || 'http://localhost:1337',
  BURP_SUITE_API_KEY: process.env.BURP_SUITE_API_KEY || 'dev-burp-key'
};