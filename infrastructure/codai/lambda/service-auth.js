// 🔐 CODAI Service Authentication Lambda
// Inter-service JWT token generation and validation

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const ssm = new AWS.SSM();

let jwtSecret = null;
let interServiceKey = null;
let serviceDiscovery = null;
let apiPermissions = null;

exports.handler = async (event) => {
    console.log('Service authentication event:', JSON.stringify(event, null, 2));
    
    try {
        // Initialize secrets if not cached
        if (!jwtSecret || !interServiceKey || !serviceDiscovery || !apiPermissions) {
            await loadSecrets();
        }
        
        const { action, serviceName, targetService, token, payload } = event;
        
        switch (action) {
            case 'generate_token':
                return await generateServiceToken(serviceName, targetService, payload);
            
            case 'validate_token':
                return await validateServiceToken(token);
            
            case 'check_permission':
                return await checkServicePermission(serviceName, targetService, payload.action);
            
            case 'get_service_info':
                return await getServiceInfo(serviceName);
            
            default:
                throw new Error(`Unknown action: ${action}`);
        }
        
    } catch (error) {
        console.error('Service authentication error:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

async function loadSecrets() {
    try {
        const params = {
            Names: [
                process.env.JWT_SECRET_PARAM,
                process.env.INTER_SERVICE_KEY_PARAM,
                process.env.SERVICE_DISCOVERY_PARAM,
                process.env.API_PERMISSIONS_PARAM
            ],
            WithDecryption: true
        };
        
        const result = await ssm.getParameters(params).promise();
        const parameters = {};
        
        result.Parameters.forEach(param => {
            const key = param.Name.split('/').pop();
            parameters[key] = param.Value;
        });
        
        jwtSecret = parameters['jwt-secret'];
        interServiceKey = parameters['inter-service-key'];
        serviceDiscovery = JSON.parse(parameters['discovery']);
        apiPermissions = JSON.parse(parameters['api-permissions']);
        
        console.log('Secrets loaded successfully');
        
    } catch (error) {
        console.error('Error loading secrets:', error);
        throw error;
    }
}

async function generateServiceToken(sourceName, targetName, payload = {}) {
    try {
        // Validate source service
        const sourceService = serviceDiscovery.services[sourceName];
        if (!sourceService) {
            throw new Error(`Unknown source service: ${sourceName}`);
        }
        
        // Validate target service
        const targetService = serviceDiscovery.services[targetName];
        if (!targetService) {
            throw new Error(`Unknown target service: ${targetName}`);
        }
        
        // Check permission
        const hasPermission = await checkServicePermission(sourceName, targetName, 'access');
        if (!hasPermission.allowed) {
            throw new Error(`Permission denied: ${sourceName} cannot access ${targetName}`);
        }
        
        // Generate JWT token
        const tokenPayload = {
            iss: 'codai-services',
            aud: 'codai-internal',
            sub: sourceName,
            target: targetName,
            permissions: hasPermission.permissions,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + serviceDiscovery.auth.token_ttl,
            ...payload
        };
        
        const token = jwt.sign(tokenPayload, jwtSecret);
        
        return {
            success: true,
            token,
            expires_at: tokenPayload.exp,
            permissions: hasPermission.permissions,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error generating service token:', error);
        throw error;
    }
}

async function validateServiceToken(token) {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        
        // Check if token is expired
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }
        
        // Validate issuer and audience
        if (decoded.iss !== 'codai-services' || decoded.aud !== 'codai-internal') {
            throw new Error('Invalid token issuer or audience');
        }
        
        // Validate services still exist
        const sourceService = serviceDiscovery.services[decoded.sub];
        const targetService = serviceDiscovery.services[decoded.target];
        
        if (!sourceService || !targetService) {
            throw new Error('Invalid services in token');
        }
        
        return {
            success: true,
            valid: true,
            decoded,
            source_service: decoded.sub,
            target_service: decoded.target,
            permissions: decoded.permissions,
            expires_at: decoded.exp,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error validating service token:', error);
        return {
            success: true,
            valid: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function checkServicePermission(sourceName, targetName, action) {
    try {
        const sourcePermissions = apiPermissions.service_permissions[sourceName];
        if (!sourcePermissions) {
            return {
                allowed: false,
                reason: `No permissions defined for service: ${sourceName}`
            };
        }
        
        // Check if source can access target
        if (!sourcePermissions.can_access.includes(targetName) && 
            !sourcePermissions.can_access.includes('*')) {
            return {
                allowed: false,
                reason: `Service ${sourceName} cannot access ${targetName}`
            };
        }
        
        // Check specific action permission
        if (action && !sourcePermissions.can_call.includes(action) && 
            !sourcePermissions.can_call.includes('*')) {
            return {
                allowed: false,
                reason: `Service ${sourceName} cannot call action ${action} on ${targetName}`
            };
        }
        
        return {
            allowed: true,
            permissions: sourcePermissions.can_call,
            rate_limit: sourcePermissions.rate_limit,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error checking service permission:', error);
        return {
            allowed: false,
            reason: `Permission check failed: ${error.message}`
        };
    }
}

async function getServiceInfo(serviceName) {
    try {
        const service = serviceDiscovery.services[serviceName];
        if (!service) {
            throw new Error(`Service not found: ${serviceName}`);
        }
        
        const permissions = apiPermissions.service_permissions[serviceName];
        
        return {
            success: true,
            service: {
                name: serviceName,
                ...service,
                permissions: permissions || {}
            },
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error getting service info:', error);
        throw error;
    }
}

// Health check endpoint
exports.health = async (event) => {
    try {
        return {
            status: 'healthy',
            service: 'codai-service-auth',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            secrets_loaded: !!(jwtSecret && interServiceKey && serviceDiscovery && apiPermissions)
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};
