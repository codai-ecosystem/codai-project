// Security Types and Interfaces
export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  headers: SecurityHeadersConfig;
  validation: ValidationConfig;
  monitoring: SecurityMonitoringConfig;
  vulnerability: VulnerabilityConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  message: string;
  statusCode: number;
  redis?: {
    enabled: boolean;
    host: string;
    port: number;
    password?: string;
    keyPrefix: string;
  };
  customLimits: Record<string, CustomRateLimit>;
}

export interface CustomRateLimit {
  windowMs: number;
  maxRequests: number;
  endpoints: string[];
  methods?: string[];
}

export interface CorsConfig {
  enabled: boolean;
  origin: string[] | string | boolean;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface SecurityHeadersConfig {
  enabled: boolean;
  contentSecurityPolicy: CSPConfig;
  hsts: HSTSConfig;
  xssProtection: boolean;
  noSniff: boolean;
  frameOptions: string;
  referrerPolicy: string;
  permissionsPolicy: string;
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: boolean;
  crossOriginResourcePolicy: boolean;
}

export interface CSPConfig {
  enabled: boolean;
  directives: Record<string, string[]>;
  reportOnly: boolean;
  reportUri?: string;
}

export interface HSTSConfig {
  enabled: boolean;
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
}

export interface ValidationConfig {
  enabled: boolean;
  sanitization: SanitizationConfig;
  inputValidation: InputValidationConfig;
  outputSanitization: OutputSanitizationConfig;
}

export interface SanitizationConfig {
  enabled: boolean;
  htmlSanitization: boolean;
  sqlInjectionPrevention: boolean;
  xssProtection: boolean;
  scriptTagRemoval: boolean;
  attributeFiltering: boolean;
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
}

export interface InputValidationConfig {
  enabled: boolean;
  schemas: Record<string, ValidationSchema>;
  strictMode: boolean;
  customValidators: Record<string, ValidatorFunction>;
}

export interface ValidationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, ValidationSchema>;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  enum?: any[];
}

export interface OutputSanitizationConfig {
  enabled: boolean;
  jsonSanitization: boolean;
  htmlEscaping: boolean;
  scriptRemoval: boolean;
}

export interface SecurityMonitoringConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  threatDetection: ThreatDetectionConfig;
  incidentResponse: IncidentResponseConfig;
  logging: SecurityLoggingConfig;
  alerting: SecurityAlertingConfig;
}

export interface ThreatDetectionConfig {
  enabled: boolean;
  patterns: ThreatPattern[];
  behavioralAnalysis: boolean;
  anomalyDetection: boolean;
  ipReputation: boolean;
  bruteForceDetection: BruteForceConfig;
}

export interface ThreatPattern {
  id: string;
  name: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'alert' | 'quarantine';
  description: string;
}

export interface BruteForceConfig {
  enabled: boolean;
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  endpoints: string[];
}

export interface IncidentResponseConfig {
  enabled: boolean;
  automaticResponse: boolean;
  escalationRules: EscalationRule[];
  responseActions: ResponseAction[];
}

export interface EscalationRule {
  severity: string;
  timeThreshold: number;
  actions: string[];
  notifications: string[];
}

export interface ResponseAction {
  id: string;
  name: string;
  type: 'block_ip' | 'rate_limit' | 'quarantine' | 'alert' | 'log';
  parameters: Record<string, any>;
  conditions: Record<string, any>;
}

export interface SecurityLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  format: 'json' | 'text';
  destination: 'file' | 'elasticsearch' | 'both';
  retention: number;
  compression: boolean;
}

export interface SecurityAlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  cooldownMs: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  value: number;
  severity: string;
}

export interface VulnerabilityConfig {
  scanning: VulnerabilityScanConfig;
  penetrationTesting: PenTestConfig;
  reporting: VulnerabilityReportingConfig;
}

export interface VulnerabilityScanConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  tools: ScanTool[];
  depth: 'surface' | 'deep' | 'comprehensive';
  scope: string[];
}

export interface ScanTool {
  name: string;
  type: 'static' | 'dynamic' | 'interactive';
  enabled: boolean;
  config: Record<string, any>;
}

export interface PenTestConfig {
  enabled: boolean;
  schedule: string;
  scope: string[];
  methodology: 'owasp' | 'nist' | 'custom';
  reporting: boolean;
}

export interface VulnerabilityReportingConfig {
  enabled: boolean;
  format: 'json' | 'xml' | 'pdf' | 'html';
  recipients: string[];
  schedule: string;
  includeRemediation: boolean;
}

// Security Event Types
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  target?: string;
  description: string;
  metadata: Record<string, any>;
  correlationId?: string;
}

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_FAILURE = 'authz_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MALICIOUS_INPUT = 'malicious_input',
  VULNERABILITY_DETECTED = 'vulnerability_detected',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_ATTEMPT = 'csrf_attempt'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Security Metrics
export interface SecurityMetrics {
  timestamp: Date;
  service: string;
  rateLimitHits: number;
  blockedRequests: number;
  securityEvents: SecurityEventMetric[];
  vulnerabilities: VulnerabilityMetric[];
  performance: SecurityPerformanceMetric;
}

export interface SecurityEventMetric {
  type: SecurityEventType;
  count: number;
  severity: SecuritySeverity;
}

export interface VulnerabilityMetric {
  severity: SecuritySeverity;
  count: number;
  resolved: number;
  pending: number;
}

export interface SecurityPerformanceMetric {
  averageResponseTime: number;
  securityOverhead: number;
  throughputImpact: number;
}

// Essential CodAI Services Configuration
export interface EssentialServiceSecurity {
  serviceId: string;
  serviceName: string;
  port: number;
  securityConfig: SecurityConfig;
  customMiddleware: string[];
  endpoints: SecureEndpoint[];
}

export interface SecureEndpoint {
  path: string;
  method: string;
  rateLimitOverride?: CustomRateLimit;
  validationSchema?: ValidationSchema;
  requiresAuth: boolean;
  permissions?: string[];
  customSecurity?: Record<string, any>;
}

// Utility Types
export type ValidatorFunction = (value: any) => boolean | string;
export type SecurityMiddleware = (req: any, res: any, next: any) => void;
export type ThreatHandler = (event: SecurityEvent) => Promise<void>;

// Essential CodAI Services Security Profiles
export const ESSENTIAL_CODAI_SECURITY_PROFILES: EssentialServiceSecurity[] = [
  {
    serviceId: 'codai-auth-api',
    serviceName: 'CodAI Authentication API',
    port: 8100,
    securityConfig: {
      rateLimit: {
        enabled: true,
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP',
        statusCode: 429,
        customLimits: {
          auth_endpoints: {
            windowMs: 300000, // 5 minutes
            maxRequests: 10,
            endpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password']
          }
        }
      },
      cors: {
        enabled: true,
        origin: ['http://localhost:3000', 'http://localhost:4000', 'https://codai.ro'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count'],
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 204
      },
      headers: {
        enabled: true,
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:'],
            'connect-src': ["'self'"]
          },
          reportOnly: false
        },
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xssProtection: true,
        noSniff: true,
        frameOptions: 'DENY',
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true
      },
      validation: {
        enabled: true,
        sanitization: {
          enabled: true,
          htmlSanitization: true,
          sqlInjectionPrevention: true,
          xssProtection: true,
          scriptTagRemoval: true,
          attributeFiltering: true,
          allowedTags: ['p', 'br', 'strong', 'em'],
          allowedAttributes: {}
        },
        inputValidation: {
          enabled: true,
          schemas: {},
          strictMode: true,
          customValidators: {}
        },
        outputSanitization: {
          enabled: true,
          jsonSanitization: true,
          htmlEscaping: true,
          scriptRemoval: true
        }
      },
      monitoring: {
        enabled: true,
        realTimeMonitoring: true,
        threatDetection: {
          enabled: true,
          patterns: [],
          behavioralAnalysis: true,
          anomalyDetection: true,
          ipReputation: true,
          bruteForceDetection: {
            enabled: true,
            maxAttempts: 5,
            windowMs: 900000, // 15 minutes
            blockDurationMs: 3600000, // 1 hour
            endpoints: ['/api/auth/login']
          }
        },
        incidentResponse: {
          enabled: true,
          automaticResponse: true,
          escalationRules: [],
          responseActions: []
        },
        logging: {
          enabled: true,
          level: 'info',
          format: 'json',
          destination: 'both',
          retention: 90,
          compression: true
        },
        alerting: {
          enabled: true,
          channels: [],
          thresholds: [],
          cooldownMs: 300000
        }
      },
      vulnerability: {
        scanning: {
          enabled: true,
          schedule: '0 2 * * 0', // Weekly at 2 AM Sunday
          tools: [],
          depth: 'comprehensive',
          scope: ['/api/*']
        },
        penetrationTesting: {
          enabled: true,
          schedule: '0 3 1 * *', // Monthly at 3 AM on 1st
          scope: ['/api/auth/*'],
          methodology: 'owasp',
          reporting: true
        },
        reporting: {
          enabled: true,
          format: 'json',
          recipients: ['security@codai.ro'],
          schedule: '0 9 * * 1', // Weekly Monday at 9 AM
          includeRemediation: true
        }
      }
    },
    customMiddleware: ['authValidation', 'rateLimiting', 'inputSanitization'],
    endpoints: []
  },
  {
    serviceId: 'codai-gateway-api',
    serviceName: 'CodAI API Gateway',
    port: 8010,
    securityConfig: {
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxRequests: 1000, // Higher for gateway
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Gateway rate limit exceeded',
        statusCode: 429,
        customLimits: {}
      },
      cors: {
        enabled: true,
        origin: ['http://localhost:3000', 'http://localhost:4000', 'https://codai.ro'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
        exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 204
      },
      headers: {
        enabled: true,
        contentSecurityPolicy: {
          enabled: true,
          directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'"],
            'style-src': ["'self'"],
            'img-src': ["'self'", 'data:'],
            'connect-src': ["'self'"]
          },
          reportOnly: false
        },
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xssProtection: true,
        noSniff: true,
        frameOptions: 'DENY',
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true
      },
      validation: {
        enabled: true,
        sanitization: {
          enabled: true,
          htmlSanitization: true,
          sqlInjectionPrevention: true,
          xssProtection: true,
          scriptTagRemoval: true,
          attributeFiltering: true,
          allowedTags: [],
          allowedAttributes: {}
        },
        inputValidation: {
          enabled: true,
          schemas: {},
          strictMode: true,
          customValidators: {}
        },
        outputSanitization: {
          enabled: true,
          jsonSanitization: true,
          htmlEscaping: true,
          scriptRemoval: true
        }
      },
      monitoring: {
        enabled: true,
        realTimeMonitoring: true,
        threatDetection: {
          enabled: true,
          patterns: [],
          behavioralAnalysis: true,
          anomalyDetection: true,
          ipReputation: true,
          bruteForceDetection: {
            enabled: true,
            maxAttempts: 20,
            windowMs: 300000, // 5 minutes
            blockDurationMs: 1800000, // 30 minutes
            endpoints: ['/api/*']
          }
        },
        incidentResponse: {
          enabled: true,
          automaticResponse: true,
          escalationRules: [],
          responseActions: []
        },
        logging: {
          enabled: true,
          level: 'info',
          format: 'json',
          destination: 'both',
          retention: 90,
          compression: true
        },
        alerting: {
          enabled: true,
          channels: [],
          thresholds: [],
          cooldownMs: 300000
        }
      },
      vulnerability: {
        scanning: {
          enabled: true,
          schedule: '0 2 * * 0',
          tools: [],
          depth: 'comprehensive',
          scope: ['/api/*', '/health', '/metrics']
        },
        penetrationTesting: {
          enabled: true,
          schedule: '0 3 1 * *',
          scope: ['/api/*'],
          methodology: 'owasp',
          reporting: true
        },
        reporting: {
          enabled: true,
          format: 'json',
          recipients: ['security@codai.ro'],
          schedule: '0 9 * * 1',
          includeRemediation: true
        }
      }
    },
    customMiddleware: ['gatewayAuth', 'requestProxy', 'responseTransform'],
    endpoints: []
  }
  // Additional services would be defined here...
];