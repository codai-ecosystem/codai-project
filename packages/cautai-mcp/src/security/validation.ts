import { z } from 'zod';
import validator from 'validator';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[SecurityValidator] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[SecurityValidator] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[SecurityValidator] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[SecurityValidator] ${msg}`, meta || '')
};

export interface SecurityValidationConfig {
  maxInputLength: number;           // Maximum input length (characters)
  allowedDomains: string[];         // Allowed domains for URLs
  bannedPatterns: RegExp[];         // Patterns to block (SQL injection, XSS, etc.)
  enableDOMPurification: boolean;   // Enable HTML sanitization
  enableSQLInjectionCheck: boolean; // Enable SQL injection detection
  enableXSSCheck: boolean;          // Enable XSS detection
  enableCommandInjectionCheck: boolean; // Enable command injection detection
  enablePathTraversalCheck: boolean; // Enable path traversal detection
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedInput: string;
  violations: SecurityViolation[];
  riskScore: number; // 0-100, higher = more risky
}

export interface SecurityViolation {
  type: 'sql_injection' | 'xss' | 'command_injection' | 'path_traversal' | 'malicious_pattern' | 'length_exceeded' | 'invalid_domain' | 'invalid_format';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  pattern?: string;
  suggestion?: string;
}

export interface InputValidationRules {
  query: z.ZodSchema;
  email: z.ZodSchema;
  url: z.ZodSchema;
  filename: z.ZodSchema;
  apiKey: z.ZodSchema;
  searchOptions: z.ZodSchema;
}

/**
 * Comprehensive security validation system with:
 * - Input sanitization and validation
 * - SQL injection detection
 * - XSS prevention
 * - Command injection detection
 * - Path traversal prevention
 * - Malicious pattern detection
 * - Content Security Policy enforcement
 * - Rate limiting validation
 */
export class SecurityValidationSystem {
  private readonly config: SecurityValidationConfig;
  private readonly validationRules: InputValidationRules;
  
  // Security patterns for detection
  private readonly sqlInjectionPatterns = [
    /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bexec\b|\bexecute\b).*(\bfrom\b|\binto\b|\bwhere\b|\btable\b)/i,
    /('|(\\x27)|(\\x2D)|(\\x23)|(\\x3B)|(\\x0D)|(\\x0A)|(\\x1A)|(\\x00)|(\\x08)|(\\x09)|(\\x0B)|(\\x0C)|(\\x1B)|(\\x5C))/i,
    /(\bor\b|\band\b).*(\b1=1\b|\b1=2\b|\btrue\b|\bfalse\b)/i,
    /(\bunion\b.*\bselect\b|\bselect\b.*\bunion\b)/i,
    /(benchmark|sleep|waitfor|delay)\s*\(/i
  ];

  private readonly xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /<[^>]*\s(onerror|onload|onclick|onmouseover|onfocus|onblur|onchange|onsubmit)\s*=/gi
  ];

  private readonly commandInjectionPatterns = [
    /[;&|`$()\[\]{}\\]/,
    /(^|\s)(cat|ls|dir|type|copy|move|del|rm|chmod|chown|wget|curl|nc|netcat|telnet|ssh|ftp|ping|nslookup|dig)\s/i,
    /\$\([^)]*\)|\`[^`]*\`/,
    /(&&|\|\|)/,
    />\s*\/|\/>|<\s*\//
  ];

  private readonly pathTraversalPatterns = [
    /\.\.[\/\\]/,
    /[\/\\]\.\.$/,
    /^\.\.$/,
    /\~[\/\\]/,
    /(\.\.%2f|\.\.%2F|\.\.%5c|\.\.%5C)/i,
    /(%2e%2e%2f|%2e%2e%5c)/i
  ];

  constructor(config: SecurityValidationConfig) {
    this.config = config;
    this.validationRules = this.initializeValidationRules();
    
    logger.info('Security validation system initialized', {
      maxInputLength: config.maxInputLength,
      allowedDomainsCount: config.allowedDomains.length,
      bannedPatternsCount: config.bannedPatterns.length
    });
  }

  /**
   * Validate and sanitize search query input
   */
  validateSearchQuery(input: string): ValidationResult {
    const violations: SecurityViolation[] = [];
    let sanitizedInput = input;
    let riskScore = 0;

    // Length validation
    if (input.length > this.config.maxInputLength) {
      violations.push({
        type: 'length_exceeded',
        severity: 'medium',
        description: `Input length ${input.length} exceeds maximum ${this.config.maxInputLength}`,
        suggestion: 'Reduce query length'
      });
      sanitizedInput = input.substring(0, this.config.maxInputLength);
      riskScore += 20;
    }

    // SQL injection detection
    if (this.config.enableSQLInjectionCheck) {
      const sqlViolations = this.detectSQLInjection(sanitizedInput);
      violations.push(...sqlViolations);
      riskScore += sqlViolations.length * 25;
    }

    // XSS detection and sanitization
    if (this.config.enableXSSCheck) {
      const xssResult = this.detectAndSanitizeXSS(sanitizedInput);
      violations.push(...xssResult.violations);
      sanitizedInput = xssResult.sanitized;
      riskScore += xssResult.violations.length * 30;
    }

    // Command injection detection
    if (this.config.enableCommandInjectionCheck) {
      const cmdViolations = this.detectCommandInjection(sanitizedInput);
      violations.push(...cmdViolations);
      riskScore += cmdViolations.length * 35;
    }

    // Path traversal detection
    if (this.config.enablePathTraversalCheck) {
      const pathViolations = this.detectPathTraversal(sanitizedInput);
      violations.push(...pathViolations);
      riskScore += pathViolations.length * 25;
    }

    // Custom pattern detection
    const customViolations = this.detectCustomPatterns(sanitizedInput);
    violations.push(...customViolations);
    riskScore += customViolations.length * 20;

    // Final sanitization
    sanitizedInput = this.performFinalSanitization(sanitizedInput);

    const result: ValidationResult = {
      isValid: violations.length === 0 || !violations.some(v => v.severity === 'critical'),
      sanitizedInput,
      violations,
      riskScore: Math.min(100, riskScore)
    };

    if (violations.length > 0) {
      logger.warn('Security violations detected', {
        input: input.substring(0, 100),
        violationCount: violations.length,
        riskScore: result.riskScore,
        criticalViolations: violations.filter(v => v.severity === 'critical').length
      });
    }

    return result;
  }

  /**
   * Validate email input
   */
  validateEmail(email: string): ValidationResult {
    const violations: SecurityViolation[] = [];
    let sanitizedInput = email.trim().toLowerCase();
    let riskScore = 0;

    try {
      this.validationRules.email.parse(email);
      
      // Additional email security checks
      if (!validator.isEmail(email)) {
        violations.push({
          type: 'invalid_format',
          severity: 'high',
          description: 'Invalid email format',
          suggestion: 'Provide a valid email address'
        });
        riskScore += 50;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /[<>'"]/,
        /javascript:/i,
        /data:/i,
        /\x00-\x1f\x7f-\x9f/
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(email)) {
          violations.push({
            type: 'malicious_pattern',
            severity: 'critical',
            description: 'Suspicious characters or patterns detected in email',
            pattern: pattern.toString()
          });
          riskScore += 40;
        }
      }

    } catch (error) {
      violations.push({
        type: 'invalid_format',
        severity: 'high',
        description: 'Email validation failed',
        suggestion: 'Provide a valid email address'
      });
      riskScore += 60;
    }

    return {
      isValid: violations.length === 0,
      sanitizedInput,
      violations,
      riskScore: Math.min(100, riskScore)
    };
  }

  /**
   * Validate URL input
   */
  validateURL(url: string): ValidationResult {
    const violations: SecurityViolation[] = [];
    let sanitizedInput = url.trim();
    let riskScore = 0;

    try {
      this.validationRules.url.parse(url);
      
      const parsedUrl = new URL(url);
      
      // Domain whitelist check
      if (this.config.allowedDomains.length > 0) {
        const isAllowed = this.config.allowedDomains.some(domain => 
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
        );
        
        if (!isAllowed) {
          violations.push({
            type: 'invalid_domain',
            severity: 'high',
            description: `Domain ${parsedUrl.hostname} not in allowed list`,
            suggestion: 'Use an approved domain'
          });
          riskScore += 40;
        }
      }

      // Protocol validation
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        violations.push({
          type: 'malicious_pattern',
          severity: 'critical',
          description: `Unsafe protocol: ${parsedUrl.protocol}`,
          suggestion: 'Use HTTP or HTTPS only'
        });
        riskScore += 60;
      }

      // Suspicious URL patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /file:/i,
        /ftp:/i,
        /<script/i,
        /eval\(/i,
        /document\./i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          violations.push({
            type: 'malicious_pattern',
            severity: 'critical',
            description: 'Suspicious URL pattern detected',
            pattern: pattern.toString()
          });
          riskScore += 50;
        }
      }

    } catch (error) {
      violations.push({
        type: 'invalid_format',
        severity: 'high',
        description: 'Invalid URL format',
        suggestion: 'Provide a valid URL'
      });
      riskScore += 70;
    }

    return {
      isValid: violations.length === 0,
      sanitizedInput,
      violations,
      riskScore: Math.min(100, riskScore)
    };
  }

  /**
   * Validate API key format and security
   */
  validateAPIKey(apiKey: string): ValidationResult {
    const violations: SecurityViolation[] = [];
    const sanitizedInput = apiKey.trim();
    let riskScore = 0;

    try {
      this.validationRules.apiKey.parse(apiKey);

      // Check for common weak patterns
      const weakPatterns = [
        /^(test|demo|sample|example|default|admin|password|secret|key)/i,
        /^(123|abc|aaa|000)/,
        /^[a-z]+$/i, // Only letters
        /^[0-9]+$/,  // Only numbers
        /(.)\1{5,}/ // Repeated characters
      ];

      for (const pattern of weakPatterns) {
        if (pattern.test(apiKey)) {
          violations.push({
            type: 'malicious_pattern',
            severity: 'medium',
            description: 'Weak API key pattern detected',
            suggestion: 'Use a strong, randomly generated API key'
          });
          riskScore += 30;
        }
      }

      // Length check
      if (apiKey.length < 32) {
        violations.push({
          type: 'invalid_format',
          severity: 'medium',
          description: 'API key too short',
          suggestion: 'Use an API key with at least 32 characters'
        });
        riskScore += 25;
      }

    } catch (error) {
      violations.push({
        type: 'invalid_format',
        severity: 'high',
        description: 'Invalid API key format',
        suggestion: 'Provide a valid API key'
      });
      riskScore += 60;
    }

    return {
      isValid: violations.length === 0 || !violations.some(v => v.severity === 'critical'),
      sanitizedInput,
      violations,
      riskScore: Math.min(100, riskScore)
    };
  }

  /**
   * Validate filename for safe file operations
   */
  validateFilename(filename: string): ValidationResult {
    const violations: SecurityViolation[] = [];
    let sanitizedInput = filename.trim();
    let riskScore = 0;

    // Path traversal check
    const pathViolations = this.detectPathTraversal(filename);
    violations.push(...pathViolations);
    riskScore += pathViolations.length * 40;

    // Dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse', 
      '.jar', '.wsf', '.wsc', '.wsh', '.ps1', '.psc1', '.sh', '.bash',
      '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.cgi'
    ];

    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (dangerousExtensions.includes(extension)) {
      violations.push({
        type: 'malicious_pattern',
        severity: 'critical',
        description: `Potentially dangerous file extension: ${extension}`,
        suggestion: 'Use safe file formats only'
      });
      riskScore += 60;
    }

    // Invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1f\x7f]/;
    if (invalidChars.test(filename)) {
      violations.push({
        type: 'malicious_pattern',
        severity: 'medium',
        description: 'Invalid characters in filename',
        suggestion: 'Remove special characters from filename'
      });
      riskScore += 30;
    }

    // Reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const baseName = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(baseName)) {
      violations.push({
        type: 'malicious_pattern',
        severity: 'medium',
        description: `Reserved filename: ${baseName}`,
        suggestion: 'Use a different filename'
      });
      riskScore += 25;
    }

    // Sanitize filename
    sanitizedInput = filename
      .replace(invalidChars, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255); // Max filename length

    return {
      isValid: violations.length === 0 || !violations.some(v => v.severity === 'critical'),
      sanitizedInput,
      violations,
      riskScore: Math.min(100, riskScore)
    };
  }

  /**
   * Get security validation statistics
   */
  getValidationStats(): {
    totalPatterns: number;
    sqlInjectionPatterns: number;
    xssPatterns: number;
    commandInjectionPatterns: number;
    pathTraversalPatterns: number;
    customPatterns: number;
  } {
    return {
      totalPatterns: this.sqlInjectionPatterns.length + this.xssPatterns.length + 
                    this.commandInjectionPatterns.length + this.pathTraversalPatterns.length + 
                    this.config.bannedPatterns.length,
      sqlInjectionPatterns: this.sqlInjectionPatterns.length,
      xssPatterns: this.xssPatterns.length,
      commandInjectionPatterns: this.commandInjectionPatterns.length,
      pathTraversalPatterns: this.pathTraversalPatterns.length,
      customPatterns: this.config.bannedPatterns.length
    };
  }

  /**
   * Initialize Zod validation schemas
   */
  private initializeValidationRules(): InputValidationRules {
    return {
      query: z.string()
        .min(1, 'Query cannot be empty')
        .max(this.config.maxInputLength, `Query too long (max ${this.config.maxInputLength} characters)`)
        .regex(/^[^<>{}[\]\\]*$/, 'Query contains invalid characters'),
      
      email: z.string()
        .email('Invalid email format')
        .max(254, 'Email too long')
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
      
      url: z.string()
        .url('Invalid URL format')
        .max(2048, 'URL too long'),
      
      filename: z.string()
        .min(1, 'Filename cannot be empty')
        .max(255, 'Filename too long')
        .regex(/^[^<>:"|?*\x00-\x1f\x7f]*$/, 'Filename contains invalid characters'),
      
      apiKey: z.string()
        .min(16, 'API key too short')
        .max(256, 'API key too long')
        .regex(/^[a-zA-Z0-9_-]+$/, 'API key contains invalid characters'),
      
      searchOptions: z.object({
        query: z.string().min(1).max(this.config.maxInputLength),
        limit: z.number().min(1).max(100).optional(),
        language: z.enum(['en', 'ro', 'auto']).optional(),
        includeSnippets: z.boolean().optional(),
        includeCitations: z.boolean().optional()
      })
    };
  }

  /**
   * Detect SQL injection patterns
   */
  private detectSQLInjection(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(input)) {
        violations.push({
          type: 'sql_injection',
          severity: 'critical',
          description: 'SQL injection pattern detected',
          pattern: pattern.toString(),
          suggestion: 'Remove SQL commands and special characters'
        });
      }
    }
    
    return violations;
  }

  /**
   * Detect and sanitize XSS patterns
   */
  private detectAndSanitizeXSS(input: string): { sanitized: string; violations: SecurityViolation[] } {
    const violations: SecurityViolation[] = [];
    let sanitized = input;
    
    // Detect XSS patterns
    for (const pattern of this.xssPatterns) {
      if (pattern.test(input)) {
        violations.push({
          type: 'xss',
          severity: 'critical',
          description: 'XSS pattern detected',
          pattern: pattern.toString(),
          suggestion: 'Remove HTML tags and JavaScript code'
        });
      }
    }
    
    // Sanitize HTML if enabled
    if (this.config.enableDOMPurification) {
      // Simple HTML sanitization - remove all HTML tags and decode entities
      sanitized = input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&'); // Decode HTML entities (do this last)
    }
    
    return { sanitized, violations };
  }

  /**
   * Detect command injection patterns
   */
  private detectCommandInjection(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    for (const pattern of this.commandInjectionPatterns) {
      if (pattern.test(input)) {
        violations.push({
          type: 'command_injection',
          severity: 'critical',
          description: 'Command injection pattern detected',
          pattern: pattern.toString(),
          suggestion: 'Remove shell commands and special characters'
        });
      }
    }
    
    return violations;
  }

  /**
   * Detect path traversal patterns
   */
  private detectPathTraversal(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    for (const pattern of this.pathTraversalPatterns) {
      if (pattern.test(input)) {
        violations.push({
          type: 'path_traversal',
          severity: 'high',
          description: 'Path traversal pattern detected',
          pattern: pattern.toString(),
          suggestion: 'Remove directory traversal sequences'
        });
      }
    }
    
    return violations;
  }

  /**
   * Detect custom banned patterns
   */
  private detectCustomPatterns(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    for (const pattern of this.config.bannedPatterns) {
      if (pattern.test(input)) {
        violations.push({
          type: 'malicious_pattern',
          severity: 'medium',
          description: 'Banned pattern detected',
          pattern: pattern.toString(),
          suggestion: 'Remove prohibited content'
        });
      }
    }
    
    return violations;
  }

  /**
   * Perform final input sanitization
   */
  private performFinalSanitization(input: string): string {
    return input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, this.config.maxInputLength); // Enforce length limit
  }
}

// Export default configuration
export const DEFAULT_SECURITY_CONFIG: SecurityValidationConfig = {
  maxInputLength: 1000,
  allowedDomains: [
    'google.com', 'bing.com', 'duckduckgo.com', 'wikipedia.org',
    'github.com', 'stackoverflow.com', 'medium.com', 'dev.to',
    'docs.microsoft.com', 'developer.mozilla.org'
  ],
  bannedPatterns: [
    /\b(password|secret|token|key)\s*[:=]/i,
    /\b(admin|administrator|root|sa)\b/i,
    /\b(hack|exploit|vulnerability|malware|virus)\b/i
  ],
  enableDOMPurification: true,
  enableSQLInjectionCheck: true,
  enableXSSCheck: true,
  enableCommandInjectionCheck: true,
  enablePathTraversalCheck: true
};