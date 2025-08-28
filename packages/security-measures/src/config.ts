import { SecurityConfig, ESSENTIAL_CODAI_SECURITY_PROFILES } from './types';

// Security Configuration
export const securityConfig: SecurityConfig = {
  rateLimit: {
    enabled: process.env.SECURITY_RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    message: process.env.SECURITY_RATE_LIMIT_MESSAGE || 'Too many requests from this IP',
    statusCode: 429,
    redis: {
      enabled: process.env.REDIS_RATE_LIMIT_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_RATE_LIMIT_PREFIX || 'codai:security:rate-limit:'
    },
    customLimits: {
      auth_critical: {
        windowMs: 300000, // 5 minutes
        maxRequests: 5,
        endpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password'],
        methods: ['POST']
      },
      api_heavy: {
        windowMs: 60000, // 1 minute
        maxRequests: 10,
        endpoints: ['/api/upload', '/api/export', '/api/report'],
        methods: ['POST', 'PUT']
      }
    }
  },
  cors: {
    enabled: process.env.SECURITY_CORS_ENABLED !== 'false',
    origin: process.env.SECURITY_CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:8006',
      'https://codai.ro',
      'https://app.codai.ro'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'X-Correlation-ID',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Rate-Limit-Remaining',
      'X-Response-Time'
    ],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  headers: {
    enabled: process.env.SECURITY_HEADERS_ENABLED !== 'false',
    contentSecurityPolicy: {
      enabled: process.env.SECURITY_CSP_ENABLED !== 'false',
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'connect-src': ["'self'", 'https:', 'wss:', 'ws:'],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      },
      reportOnly: process.env.SECURITY_CSP_REPORT_ONLY === 'true',
      reportUri: process.env.SECURITY_CSP_REPORT_URI
    },
    hsts: {
      enabled: process.env.SECURITY_HSTS_ENABLED !== 'false',
      maxAge: parseInt(process.env.SECURITY_HSTS_MAX_AGE || '31536000'),
      includeSubDomains: process.env.SECURITY_HSTS_INCLUDE_SUBDOMAINS !== 'false',
      preload: process.env.SECURITY_HSTS_PRELOAD !== 'false'
    },
    xssProtection: true,
    noSniff: true,
    frameOptions: process.env.SECURITY_FRAME_OPTIONS || 'DENY',
    referrerPolicy: process.env.SECURITY_REFERRER_POLICY || 'strict-origin-when-cross-origin',
    permissionsPolicy: process.env.SECURITY_PERMISSIONS_POLICY || 'camera=(), microphone=(), geolocation=(), payment=()',
    crossOriginEmbedderPolicy: process.env.SECURITY_COEP_ENABLED !== 'false',
    crossOriginOpenerPolicy: process.env.SECURITY_COOP_ENABLED !== 'false',
    crossOriginResourcePolicy: process.env.SECURITY_CORP_ENABLED !== 'false'
  },
  validation: {
    enabled: process.env.SECURITY_VALIDATION_ENABLED !== 'false',
    sanitization: {
      enabled: process.env.SECURITY_SANITIZATION_ENABLED !== 'false',
      htmlSanitization: process.env.SECURITY_HTML_SANITIZATION_ENABLED !== 'false',
      sqlInjectionPrevention: process.env.SECURITY_SQL_INJECTION_PREVENTION_ENABLED !== 'false',
      xssProtection: process.env.SECURITY_XSS_PROTECTION_ENABLED !== 'false',
      scriptTagRemoval: process.env.SECURITY_SCRIPT_TAG_REMOVAL_ENABLED !== 'false',
      attributeFiltering: process.env.SECURITY_ATTRIBUTE_FILTERING_ENABLED !== 'false',
      allowedTags: process.env.SECURITY_ALLOWED_TAGS?.split(',') || ['p', 'br', 'strong', 'em', 'u', 'i'],
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'width', 'height']
      }
    },
    inputValidation: {
      enabled: process.env.SECURITY_INPUT_VALIDATION_ENABLED !== 'false',
      schemas: {},
      strictMode: process.env.SECURITY_VALIDATION_STRICT_MODE !== 'false',
      customValidators: {}
    },
    outputSanitization: {
      enabled: process.env.SECURITY_OUTPUT_SANITIZATION_ENABLED !== 'false',
      jsonSanitization: process.env.SECURITY_JSON_SANITIZATION_ENABLED !== 'false',
      htmlEscaping: process.env.SECURITY_HTML_ESCAPING_ENABLED !== 'false',
      scriptRemoval: process.env.SECURITY_SCRIPT_REMOVAL_ENABLED !== 'false'
    }
  },
  monitoring: {
    enabled: process.env.SECURITY_MONITORING_ENABLED !== 'false',
    realTimeMonitoring: process.env.SECURITY_REAL_TIME_MONITORING_ENABLED !== 'false',
    threatDetection: {
      enabled: process.env.SECURITY_THREAT_DETECTION_ENABLED !== 'false',
      patterns: [
        {
          id: 'xss_attempt',
          name: 'Cross-Site Scripting Attempt',
          pattern: '<script[^>]*>.*?</script>|javascript:|onload=|onerror=',
          severity: 'high',
          action: 'block',
          description: 'Detects potential XSS attack patterns'
        },
        {
          id: 'sql_injection',
          name: 'SQL Injection Attempt',
          pattern: "(union|select|insert|delete|update|drop|create|alter)\\s+(.*\\s+)*(from|into|table|database)",
          severity: 'critical',
          action: 'block',
          description: 'Detects potential SQL injection patterns'
        },
        {
          id: 'path_traversal',
          name: 'Path Traversal Attempt',
          pattern: '\\.\\.\\/|\\.\\.\\\|%2e%2e%2f|%2e%2e\\',
          severity: 'medium',
          action: 'block',
          description: 'Detects directory traversal attempts'
        }
      ],
      behavioralAnalysis: process.env.SECURITY_BEHAVIORAL_ANALYSIS_ENABLED !== 'false',
      anomalyDetection: process.env.SECURITY_ANOMALY_DETECTION_ENABLED !== 'false',
      ipReputation: process.env.SECURITY_IP_REPUTATION_ENABLED !== 'false',
      bruteForceDetection: {
        enabled: process.env.SECURITY_BRUTE_FORCE_DETECTION_ENABLED !== 'false',
        maxAttempts: parseInt(process.env.SECURITY_BRUTE_FORCE_MAX_ATTEMPTS || '5'),
        windowMs: parseInt(process.env.SECURITY_BRUTE_FORCE_WINDOW_MS || '900000'), // 15 minutes
        blockDurationMs: parseInt(process.env.SECURITY_BRUTE_FORCE_BLOCK_DURATION_MS || '3600000'), // 1 hour
        endpoints: ['/api/auth/login', '/api/auth/register', '/api/admin/login']
      }
    },
    incidentResponse: {
      enabled: process.env.SECURITY_INCIDENT_RESPONSE_ENABLED !== 'false',
      automaticResponse: process.env.SECURITY_AUTOMATIC_RESPONSE_ENABLED !== 'false',
      escalationRules: [
        {
          severity: 'critical',
          timeThreshold: 60000, // 1 minute
          actions: ['block_ip', 'alert_admin', 'log_incident'],
          notifications: ['email', 'slack']
        },
        {
          severity: 'high',
          timeThreshold: 300000, // 5 minutes
          actions: ['rate_limit', 'alert_admin', 'log_incident'],
          notifications: ['email']
        }
      ],
      responseActions: [
        {
          id: 'block_ip',
          name: 'Block IP Address',
          type: 'block_ip',
          parameters: { duration: 3600000 }, // 1 hour
          conditions: { severity: ['critical', 'high'] }
        },
        {
          id: 'rate_limit_strict',
          name: 'Apply Strict Rate Limiting',
          type: 'rate_limit',
          parameters: { maxRequests: 1, windowMs: 60000 },
          conditions: { severity: ['medium', 'high'] }
        }
      ]
    },
    logging: {
      enabled: process.env.SECURITY_LOGGING_ENABLED !== 'false',
      level: (process.env.SECURITY_LOG_LEVEL as any) || 'info',
      format: (process.env.SECURITY_LOG_FORMAT as any) || 'json',
      destination: (process.env.SECURITY_LOG_DESTINATION as any) || 'both',
      retention: parseInt(process.env.SECURITY_LOG_RETENTION_DAYS || '90'),
      compression: process.env.SECURITY_LOG_COMPRESSION_ENABLED !== 'false'
    },
    alerting: {
      enabled: process.env.SECURITY_ALERTING_ENABLED !== 'false',
      channels: [
        {
          type: 'email',
          config: {
            to: process.env.SECURITY_ALERT_EMAIL || 'security@codai.ro',
            from: process.env.SECURITY_ALERT_FROM_EMAIL || 'alerts@codai.ro',
            smtp: {
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || '587'),
              secure: process.env.SMTP_SECURE === 'true',
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            }
          },
          enabled: process.env.SECURITY_EMAIL_ALERTS_ENABLED !== 'false'
        }
      ],
      thresholds: [
        {
          metric: 'security_events_per_minute',
          operator: 'gt',
          value: 10,
          severity: 'high'
        },
        {
          metric: 'blocked_requests_per_minute',
          operator: 'gt',
          value: 50,
          severity: 'critical'
        }
      ],
      cooldownMs: parseInt(process.env.SECURITY_ALERT_COOLDOWN_MS || '300000') // 5 minutes
    }
  },
  vulnerability: {
    scanning: {
      enabled: process.env.SECURITY_VULNERABILITY_SCANNING_ENABLED !== 'false',
      schedule: process.env.SECURITY_VULNERABILITY_SCAN_SCHEDULE || '0 2 * * 0', // Weekly at 2 AM Sunday
      tools: [
        {
          name: 'npm_audit',
          type: 'static',
          enabled: true,
          config: {
            level: 'moderate',
            production: true
          }
        },
        {
          name: 'snyk',
          type: 'static',
          enabled: process.env.SNYK_TOKEN ? true : false,
          config: {
            token: process.env.SNYK_TOKEN
          }
        }
      ],
      depth: (process.env.SECURITY_SCAN_DEPTH as any) || 'comprehensive',
      scope: process.env.SECURITY_SCAN_SCOPE?.split(',') || ['/api/*', '/health', '/metrics']
    },
    penetrationTesting: {
      enabled: process.env.SECURITY_PEN_TESTING_ENABLED === 'true',
      schedule: process.env.SECURITY_PEN_TEST_SCHEDULE || '0 3 1 * *', // Monthly at 3 AM on 1st
      scope: process.env.SECURITY_PEN_TEST_SCOPE?.split(',') || ['/api/*'],
      methodology: (process.env.SECURITY_PEN_TEST_METHODOLOGY as any) || 'owasp',
      reporting: process.env.SECURITY_PEN_TEST_REPORTING_ENABLED !== 'false'
    },
    reporting: {
      enabled: process.env.SECURITY_VULNERABILITY_REPORTING_ENABLED !== 'false',
      format: (process.env.SECURITY_VULNERABILITY_REPORT_FORMAT as any) || 'json',
      recipients: process.env.SECURITY_VULNERABILITY_REPORT_RECIPIENTS?.split(',') || ['security@codai.ro'],
      schedule: process.env.SECURITY_VULNERABILITY_REPORT_SCHEDULE || '0 9 * * 1', // Weekly Monday at 9 AM
      includeRemediation: process.env.SECURITY_VULNERABILITY_REPORT_INCLUDE_REMEDIATION !== 'false'
    }
  }
};

// Service-Specific Security Configurations
export const serviceSecurityConfig = {
  getSecurityProfile: (serviceId: string) => {
    return ESSENTIAL_CODAI_SECURITY_PROFILES.find(profile => profile.serviceId === serviceId);
  },

  getAllProfiles: () => {
    return ESSENTIAL_CODAI_SECURITY_PROFILES;
  },

  getPortMapping: () => {
    return ESSENTIAL_CODAI_SECURITY_PROFILES.reduce((map, profile) => {
      map[profile.port] = profile.serviceId;
      return map;
    }, {} as Record<number, string>);
  }
};

// Environment Variables Documentation
export const environmentVariables = {
  // Rate Limiting
  SECURITY_RATE_LIMIT_ENABLED: 'Enable/disable rate limiting (default: true)',
  SECURITY_RATE_LIMIT_WINDOW_MS: 'Rate limit window in milliseconds (default: 60000)',
  SECURITY_RATE_LIMIT_MAX_REQUESTS: 'Maximum requests per window (default: 100)',
  SECURITY_RATE_LIMIT_MESSAGE: 'Rate limit exceeded message',

  // CORS
  SECURITY_CORS_ENABLED: 'Enable/disable CORS (default: true)',
  SECURITY_CORS_ORIGIN: 'Allowed origins (comma-separated)',

  // Security Headers
  SECURITY_HEADERS_ENABLED: 'Enable/disable security headers (default: true)',
  SECURITY_CSP_ENABLED: 'Enable/disable Content Security Policy (default: true)',
  SECURITY_CSP_REPORT_ONLY: 'Enable CSP report-only mode (default: false)',
  SECURITY_CSP_REPORT_URI: 'CSP report URI',
  SECURITY_HSTS_ENABLED: 'Enable/disable HSTS (default: true)',
  SECURITY_HSTS_MAX_AGE: 'HSTS max age in seconds (default: 31536000)',

  // Monitoring
  SECURITY_MONITORING_ENABLED: 'Enable/disable security monitoring (default: true)',
  SECURITY_THREAT_DETECTION_ENABLED: 'Enable/disable threat detection (default: true)',
  SECURITY_BRUTE_FORCE_DETECTION_ENABLED: 'Enable/disable brute force detection (default: true)',
  SECURITY_INCIDENT_RESPONSE_ENABLED: 'Enable/disable incident response (default: true)',

  // Vulnerability Scanning
  SECURITY_VULNERABILITY_SCANNING_ENABLED: 'Enable/disable vulnerability scanning (default: true)',
  SECURITY_PEN_TESTING_ENABLED: 'Enable/disable penetration testing (default: false)',
  SNYK_TOKEN: 'Snyk API token for vulnerability scanning',

  // Alerting
  SECURITY_ALERTING_ENABLED: 'Enable/disable security alerting (default: true)',
  SECURITY_ALERT_EMAIL: 'Email address for security alerts',
  SMTP_HOST: 'SMTP server host for email alerts',
  SMTP_PORT: 'SMTP server port',
  SMTP_USER: 'SMTP username',
  SMTP_PASS: 'SMTP password'
};

export default securityConfig;