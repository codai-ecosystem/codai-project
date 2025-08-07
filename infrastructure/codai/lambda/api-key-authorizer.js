// 🔐 CODAI API Key Authorizer Lambda Function
// Advanced security with rate limiting, project isolation, and comprehensive logging

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEYS_TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
    console.log('Authorization event:', JSON.stringify(event, null, 2));

    try {
        const { headers, requestContext } = event;
        const apiKey = headers['x-api-key'];
        const clientId = headers['x-client-id'];
        const projectId = headers['x-project-id'];
        const sourceIp = requestContext.http.sourceIp;
        const userAgent = headers['user-agent'];

        // Validate required headers
        if (!apiKey) {
            return generateAuthResponse('Deny', 'Missing API key');
        }

        // Check API key in DynamoDB
        const apiKeyData = await validateApiKey(apiKey, clientId, projectId);
        if (!apiKeyData) {
            return generateAuthResponse('Deny', 'Invalid API key');
        }

        // Check rate limits
        const rateLimitPassed = await checkRateLimit(apiKeyData, sourceIp);
        if (!rateLimitPassed) {
            return generateAuthResponse('Deny', 'Rate limit exceeded');
        }

        // Generate JWT token for downstream services
        const serviceToken = generateServiceToken(apiKeyData, sourceIp, userAgent);

        // Log successful authentication
        await logApiKeyUsage(apiKeyData, sourceIp, userAgent, 'success');

        return generateAuthResponse('Allow', 'Access granted', {
            apiKeyData,
            serviceToken,
            context: {
                projectId: apiKeyData.project_id,
                clientId: apiKeyData.client_id,
                userId: apiKeyData.user_id,
                permissions: apiKeyData.permissions,
                sourceIp,
                userAgent
            }
        });

    } catch (error) {
        console.error('Authorization error:', error);
        await logApiKeyUsage(null, event.requestContext.http.sourceIp, headers['user-agent'], 'error', error.message);
        return generateAuthResponse('Deny', 'Authorization failed');
    }
};

async function validateApiKey(apiKey, clientId, projectId) {
    try {
        const params = {
            TableName: API_KEYS_TABLE,
            Key: {
                api_key_id: apiKey
            }
        };

        const result = await dynamodb.get(params).promise();
        const apiKeyData = result.Item;

        if (!apiKeyData) {
            return null;
        }

        // Check if API key is active
        if (apiKeyData.status !== 'active') {
            return null;
        }

        // Check expiration
        if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
            return null;
        }

        // Validate client ID if provided
        if (clientId && apiKeyData.client_id !== clientId) {
            return null;
        }

        // Validate project ID if provided
        if (projectId && apiKeyData.project_id !== projectId) {
            return null;
        }

        return apiKeyData;

    } catch (error) {
        console.error('Error validating API key:', error);
        return null;
    }
}

async function checkRateLimit(apiKeyData, sourceIp) {
    try {
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 minute
        const maxRequests = apiKeyData.rate_limit || 1000; // Default rate limit

        // Get current usage
        const params = {
            TableName: API_KEYS_TABLE,
            Key: {
                api_key_id: apiKeyData.api_key_id
            },
            UpdateExpression: 'SET last_used = :now, usage_count = if_not_exists(usage_count, :zero) + :inc',
            ExpressionAttributeValues: {
                ':now': now,
                ':zero': 0,
                ':inc': 1
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(params).promise();
        const updatedData = result.Attributes;

        // Check if within rate limit window
        if (updatedData.rate_limit_window && (now - updatedData.rate_limit_window) < windowSize) {
            return updatedData.rate_limit_count < maxRequests;
        } else {
            // Reset rate limit window
            await dynamodb.update({
                TableName: API_KEYS_TABLE,
                Key: {
                    api_key_id: apiKeyData.api_key_id
                },
                UpdateExpression: 'SET rate_limit_window = :now, rate_limit_count = :one',
                ExpressionAttributeValues: {
                    ':now': now,
                    ':one': 1
                }
            }).promise();

            return true;
        }

    } catch (error) {
        console.error('Error checking rate limit:', error);
        return false;
    }
}

function generateServiceToken(apiKeyData, sourceIp, userAgent) {
    const payload = {
        sub: apiKeyData.user_id,
        client_id: apiKeyData.client_id,
        project_id: apiKeyData.project_id,
        permissions: apiKeyData.permissions,
        source_ip: sourceIp,
        user_agent: userAgent,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
        iss: 'codai-api-gateway',
        aud: 'codai-services'
    };

    return jwt.sign(payload, JWT_SECRET);
}

async function logApiKeyUsage(apiKeyData, sourceIp, userAgent, status, errorMessage = null) {
    try {
        const logEntry = {
            timestamp: new Date().toISOString(),
            api_key_id: apiKeyData?.api_key_id || 'unknown',
            project_id: apiKeyData?.project_id || 'unknown',
            client_id: apiKeyData?.client_id || 'unknown',
            source_ip: sourceIp,
            user_agent: userAgent,
            status,
            error_message: errorMessage
        };

        console.log('API Key Usage Log:', JSON.stringify(logEntry));

        // Could also store in CloudWatch Logs or another logging service

    } catch (error) {
        console.error('Error logging API key usage:', error);
    }
}

function generateAuthResponse(effect, reason, context = {}) {
    const response = {
        principalId: context.apiKeyData?.user_id || 'anonymous',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: '*'
                }
            ]
        },
        context: {
            reason,
            ...context.context
        }
    };

    if (context.serviceToken) {
        response.context.serviceToken = context.serviceToken;
    }

    console.log('Auth response:', JSON.stringify(response, null, 2));
    return response;
}
