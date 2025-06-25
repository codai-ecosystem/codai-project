// Security configuration for Codai project
module.exports = {
  // Security headers for web applications
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.codai.ro",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },

  // Authentication configuration
  auth: {
    // Session configuration
    session: {
      secret: process.env.SESSION_SECRET || 'codai-session-secret',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },

    // JWT configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'codai-jwt-secret',
      expiresIn: '24h',
      issuer: 'codai.ro',
      audience: 'codai-users',
    },

    // Password policy
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    },
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Data validation schemas
  validation: {
    user: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      username: /^[a-zA-Z0-9_]{3,20}$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
  },

  // CORS configuration
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://codai.ro', 'https://app.codai.ro', 'https://api.codai.ro']
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080',
          ],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Content filtering
  contentFilter: {
    blacklist: ['script', 'iframe', 'object', 'embed', 'applet'],
    sanitize: true,
    allowedTags: [
      'p',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'ul',
      'ol',
      'li',
      'br',
      'hr',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      '*': ['class', 'id'],
    },
  },

  // Audit configuration
  audit: {
    enabled: true,
    events: [
      'login',
      'logout',
      'failed_login',
      'password_change',
      'data_access',
      'data_modification',
    ],
    retention: 90 * 24 * 60 * 60 * 1000, // 90 days
    storage: 'database',
  },
};
