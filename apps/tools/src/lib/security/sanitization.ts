/**
 * Input Sanitization Utilities
 *
 * Comprehensive input sanitization for preventing XSS, injection attacks,
 * and ensuring data integrity across the application.
 */

/**
 * Simple HTML sanitization without external dependency
 */
function simpleHtmlSanitize(html: string, strict = false): string {
  if (typeof html !== 'string') return '';

  const allowedTags = strict
    ? ['p', 'br', 'strong', 'em']
    : [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'i',
        'b',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
      ];

  // Remove script tags and their content
  let sanitized = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove all HTML tags except allowed ones
  const tagPattern = /<\/?([\dA-Za-z]+)(?:\s[^>]*)?>/g;
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // For allowed tags, remove dangerous attributes
      return match.replace(
        /\s+(on\w+|javascript:|vbscript:|data-)\s*=\s*[^\s>]+/gi,
        ''
      );
    }
    return '';
  });

  // Remove dangerous protocols
  sanitized = sanitized.replace(
    /(href|src)\s*=\s*["']?(javascript:|vbscript:|data:)[^"'>]*["']?/gi,
    ''
  );

  return sanitized;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(
  dirty: string,
  options: { strict?: boolean } = {}
): string {
  if (typeof dirty !== 'string') {
    return '';
  }

  return simpleHtmlSanitize(dirty, options.strict);
}

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/["&'/<>\\]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w+.@-]/g, '')
    .slice(0, 254); // RFC 5321 limit
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  // Allow only http, https, and mailto protocols
  const allowedProtocols = /^(https?|mailto):/i;
  const trimmedUrl = url.trim();

  if (trimmedUrl == null) {
    return '';
  }

  // If no protocol, assume https
  if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('mailto:')) {
    return `https://${trimmedUrl}`;
  }

  // Check if protocol is allowed
  if (!allowedProtocols.test(trimmedUrl)) {
    return '';
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return parsedUrl.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  return phone
    .replace(/[^\d ()+\-]/g, '')
    .trim()
    .slice(0, 20);
}

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^\w.-]/g, '')
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .slice(0, 255);
}

/**
 * Sanitize SQL-like input to prevent injection attempts
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const sqlKeywords = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'EXEC',
    'EXECUTE',
    'UNION',
    'SCRIPT',
    'JAVASCRIPT',
    'VBSCRIPT',
  ];

  let sanitized = input.trim();

  // Remove SQL keywords (case insensitive)
  for (const keyword of sqlKeywords) {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  }
  // Remove dangerous characters
  sanitized = sanitized.replace(/['*/;\-]/g, '');
  sanitized = sanitized.replace(/--/g, '');

  return sanitized.slice(0, 500);
}

/**
 * Comprehensive input sanitization based on input type
 */
export function sanitizeInput(
  input: string,
  type:
    | 'text'
    | 'email'
    | 'url'
    | 'phone'
    | 'filename'
    | 'html'
    | 'sql' = 'text'
): string {
  switch (type) {
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeUrl(input);
    case 'phone':
      return sanitizePhoneNumber(input);
    case 'filename':
      return sanitizeFilename(input);
    case 'html':
      return sanitizeHtml(input);
    case 'sql':
      return sanitizeSqlInput(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
}

/**
 * Validate and sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<
    keyof T,
    'text' | 'email' | 'url' | 'phone' | 'filename' | 'html' | 'sql'
  >
): T {
  const sanitized = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(schema)) {
    if (sanitized[key] && typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key], schema[key as keyof T]);
    }
  }

  return sanitized as T;
}

/**
 * Rate limiting token bucket implementation
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Check if action is allowed (consumes a token)
   */
  public isAllowed(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  public getTokenCount(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Reset tokens to full capacity
   */
  public reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

/**
 * Global rate limiters for different operations
 */
export const rateLimiters = {
  // Login attempts: 5 attempts per minute
  login: new RateLimiter(5, 5 / 60),

  // API calls: 100 requests per minute
  api: new RateLimiter(100, 100 / 60),

  // Password reset: 3 attempts per hour
  passwordReset: new RateLimiter(3, 3 / 3600),

  // File uploads: 10 uploads per minute
  fileUpload: new RateLimiter(10, 10 / 60),
};

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.github.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),
};

/**
 * Check if input contains potential security threats
 */
export function detectSecurityThreats(input: string): {
  hasThreats: boolean;
  threats: string[];
} {
  const threats: string[] = [];

  // XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /eval\(/i,
    /expression\(/i,
  ];

  // SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /--/,
    /\/\*/,
    /\*\//,
  ];
  // Directory traversal patterns
  const traversalPatterns = [/\.\.\//, /\.\.\\/, /%2e%2e%2f/i, /%2e%2e%5c/i];

  // Check for XSS
  if (xssPatterns.some(pattern => pattern.test(input))) {
    threats.push('XSS');
  }

  // Check for SQL injection
  if (sqlPatterns.some(pattern => pattern.test(input))) {
    threats.push('SQL_INJECTION');
  }

  // Check for directory traversal
  if (traversalPatterns.some(pattern => pattern.test(input))) {
    threats.push('DIRECTORY_TRAVERSAL');
  }

  return {
    hasThreats: threats.length > 0,
    threats,
  };
}
