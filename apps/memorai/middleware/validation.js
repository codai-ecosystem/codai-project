// Input validation and SQL injection prevention middleware
import validator from 'validator';

// Common SQL injection patterns to detect and block
const SQL_INJECTION_PATTERNS = [
    /(\bDROP\b|\bDELETE\b|\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b)/i,
    /('|"|;|--|\/\*|\*\/|xp_|sp_)/,
    /(\bOR\b|\bAND\b).*=.*=/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(script|javascript|vbscript|onload|onerror)/i
];

// XSS patterns to detect and block
const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
];

export const validateSearchQuery = (req, res, next) => {
    try {
        const query = req.query.q || req.body.query || '';

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query parameter is required and cannot be empty.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Length validation
        if (query.length > 500) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query too long. Maximum 500 characters allowed.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // SQL Injection detection
        for (const pattern of SQL_INJECTION_PATTERNS) {
            if (pattern.test(query)) {
                console.warn('SQL injection attempt detected:', {
                    query,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'SECURITY_VIOLATION',
                        message: 'Invalid characters detected in query.',
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }

        // XSS detection
        for (const pattern of XSS_PATTERNS) {
            if (pattern.test(query)) {
                console.warn('XSS attempt detected:', {
                    query,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'SECURITY_VIOLATION',
                        message: 'Invalid content detected in query.',
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }

        // Sanitize the query
        req.sanitizedQuery = validator.escape(query.trim());

        next();
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Input validation failed.',
                timestamp: new Date().toISOString()
            }
        });
    }
};

export const sanitizeInput = (req, res, next) => {
    try {
        const sanitizeValue = (value) => {
            if (typeof value === 'string') {
                return validator.escape(value.trim());
            }
            if (Array.isArray(value)) {
                return value.map(sanitizeValue);
            }
            if (typeof value === 'object' && value !== null) {
                const sanitized = {};
                for (const [key, val] of Object.entries(value)) {
                    sanitized[key] = sanitizeValue(val);
                }
                return sanitized;
            }
            return value;
        };

        // Sanitize all input
        if (req.body) {
            req.body = sanitizeValue(req.body);
        }
        if (req.query) {
            req.query = sanitizeValue(req.query);
        }
        if (req.params) {
            req.params = sanitizeValue(req.params);
        }

        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SANITIZATION_ERROR',
                message: 'Input sanitization failed.',
                timestamp: new Date().toISOString()
            }
        });
    }
};

export const validateMemoryInput = (req, res, next) => {
    try {
        const { content, metadata } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Content is required and must be a string.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        if (content.length > 10000) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Content too long. Maximum 10,000 characters allowed.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Validate metadata if provided
        if (metadata && typeof metadata !== 'object') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Metadata must be an object.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        next();
    } catch (error) {
        console.error('Memory validation error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Memory input validation failed.',
                timestamp: new Date().toISOString()
            }
        });
    }
};
