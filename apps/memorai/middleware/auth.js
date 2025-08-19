// Authentication middleware for MemorAI API
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'memorai-dev-secret-2025';
const API_KEYS = new Set([
    'memorai-prod-key-2025',
    'memorai-dev-key-2025',
    'memorai-test-key-2025'
]);

export const authenticateAPI = (req, res, next) => {
    try {
        // Check for API key in headers
        const apiKey = req.headers['x-api-key'] ||
            req.headers['authorization']?.replace('Bearer ', '') ||
            req.query.apiKey;

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'API key required. Include X-API-Key header or authorization bearer token.',
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Validate API key
        if (API_KEYS.has(apiKey)) {
            req.authenticated = true;
            req.apiKey = apiKey;
            return next();
        }

        // Try JWT validation as fallback
        try {
            const decoded = jwt.verify(apiKey, JWT_SECRET);
            req.authenticated = true;
            req.user = decoded;
            return next();
        } catch (jwtError) {
            // Invalid JWT, continue to reject
        }

        return res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Invalid API key or token.',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication system error.',
                timestamp: new Date().toISOString()
            }
        });
    }
};

export const generateAPIKey = (userId, expiresIn = '30d') => {
    return jwt.sign(
        {
            userId,
            type: 'api_key',
            issued: Date.now()
        },
        JWT_SECRET,
        { expiresIn }
    );
};

export const validateAPIKey = (apiKey) => {
    if (API_KEYS.has(apiKey)) {
        return { valid: true, type: 'static' };
    }

    try {
        const decoded = jwt.verify(apiKey, JWT_SECRET);
        return { valid: true, type: 'jwt', user: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};
