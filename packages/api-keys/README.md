# @codai/api-keys

Universal API Key Management System for the CODAI ecosystem. Provides secure API key generation, validation, rotation, and comprehensive usage tracking across all services.

## Features

### 🔐 Secure Key Management
- **Multiple Key Types**: Service, User, Admin, and System keys
- **Strong Encryption**: AES-256-GCM encryption for sensitive data
- **Secure Hashing**: bcrypt with configurable salt rounds
- **JWT Integration**: Token-based authentication support

### 🎯 Advanced Access Control
- **Permission-Based**: Granular permission system
- **Scope Management**: Fine-grained access scopes
- **Environment Isolation**: Development, staging, production separation
- **Expiration Management**: Automatic key expiration

### ⚡ Performance & Scalability
- **Rate Limiting**: Configurable per-key rate limits
- **Caching**: In-memory and Redis caching
- **Load Balancing**: Distributed key validation
- **Metrics Tracking**: Comprehensive usage analytics

### 🔄 Operational Excellence
- **Key Rotation**: Automated and manual key rotation
- **Audit Trails**: Complete key lifecycle tracking
- **Health Monitoring**: Real-time key status monitoring
- **Geographic Tracking**: Usage analytics by region

## Installation

```bash
pnpm add @codai/api-keys
```

## Quick Start

```typescript
import { ApiKeyManager, createDefaultRateLimit } from '@codai/api-keys';

// Initialize the API Key Manager
const keyManager = new ApiKeyManager({
  encryptionKey: process.env.ENCRYPTION_KEY,
  jwtSecret: process.env.JWT_SECRET,
  redis: {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Generate a new API key
const { keyId, apiKey } = await keyManager.generateApiKey({
  name: 'My Service Key',
  keyType: 'service',
  permissions: ['read', 'write'],
  scopes: ['api', 'dashboard'],
  environment: 'production',
  rateLimits: createDefaultRateLimit('service'),
  createdBy: 'admin@company.com'
});

console.log('Generated API Key:', apiKey);
console.log('Key ID:', keyId);

// Validate an API key
const validation = await keyManager.validateApiKey(
  apiKey,
  ['read'], // required permissions
  ['api'],  // required scopes
  { ip: '192.168.1.1', region: 'us-east-1' }
);

if (validation.isValid) {
  console.log('Key is valid!');
  console.log('Permissions:', validation.permissions);
  console.log('Rate limit remaining:', validation.rateLimitStatus.remaining);
} else {
  console.log('Key validation failed:', validation.error);
}
```

## API Reference

### Key Generation

```typescript
// Generate a service API key
const serviceKey = await keyManager.generateApiKey({
  name: 'Payment Service',
  keyType: 'service',
  permissions: ['payment:process', 'payment:refund'],
  scopes: ['payments', 'webhooks'],
  environment: 'production',
  rateLimits: {
    requestsPerMinute: 1000,
    requestsPerHour: 10000,
    requestsPerDay: 100000
  },
  metadata: {
    serviceVersion: '2.1.0',
    department: 'finance'
  },
  tags: ['payment', 'critical'],
  createdBy: 'devops@company.com',
  serviceId: 'payment-service-prod'
});

// Generate a user API key
const userKey = await keyManager.generateApiKey({
  name: 'John Doe - Dashboard Access',
  keyType: 'user',
  permissions: ['dashboard:read', 'profile:update'],
  scopes: ['dashboard', 'profile'],
  environment: 'production',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  createdBy: 'admin@company.com',
  userId: 'user-123'
});
```

### Key Validation

```typescript
// Basic validation
const result = await keyManager.validateApiKey(apiKey);

// Validation with requirements
const result = await keyManager.validateApiKey(
  apiKey,
  ['read', 'write'], // required permissions
  ['api', 'dashboard'], // required scopes
  {
    ip: '192.168.1.100',
    userAgent: 'MyApp/1.0',
    region: 'us-west-2'
  }
);

// Check validation result
if (result.isValid) {
  console.log('✅ Key is valid');
  console.log('Permissions:', result.permissions);
  console.log('Rate limit status:', result.rateLimitStatus);
} else {
  console.log('❌ Validation failed:', result.error);
}
```

### Key Management

```typescript
// Rotate a key
const rotation = await keyManager.rotateApiKey(
  'key-id-123',
  'Scheduled rotation',
  'security-team@company.com'
);

console.log('New key:', rotation.newApiKey);

// Revoke a key
await keyManager.revokeApiKey(
  'key-id-123',
  'Security breach',
  'security-team@company.com'
);

// Update key configuration
await keyManager.updateApiKey('key-id-123', {
  permissions: ['read-only'],
  rateLimits: {
    requestsPerMinute: 500,
    requestsPerHour: 5000,
    requestsPerDay: 50000
  }
});

// List keys with filters
const serviceKeys = keyManager.listApiKeys({
  keyType: 'service',
  environment: 'production',
  isActive: true
});
```

### Usage Metrics

```typescript
// Get metrics for a specific key
const metrics = keyManager.getKeyMetrics('key-id-123');
console.log('Total requests:', metrics.totalRequests);
console.log('Success rate:', metrics.successfulRequests / metrics.totalRequests);
console.log('Geographic usage:', metrics.geographicUsage);

// Get all metrics
const allMetrics = keyManager.getAllMetrics();
allMetrics.forEach(metric => {
  console.log(`Key ${metric.keyId}:`, {
    requests: metric.totalRequests,
    lastUsed: metric.lastUsed,
    regions: Object.keys(metric.geographicUsage)
  });
});
```

### JWT Token Management

```typescript
// Generate JWT token
const token = keyManager.generateJwtToken({
  userId: 'user-123',
  permissions: ['read', 'write'],
  keyId: 'key-id-123'
}, '1h');

// Validate JWT token
const tokenValidation = keyManager.validateJwtToken(token);
if (tokenValidation.valid) {
  console.log('Token payload:', tokenValidation.payload);
} else {
  console.log('Token error:', tokenValidation.error);
}
```

## Configuration

### Environment Variables

```bash
# Required
ENCRYPTION_KEY=your-256-bit-encryption-key-hex
JWT_SECRET=your-jwt-secret-key

# Optional - Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Optional - Default Settings
API_KEY_SALT_ROUNDS=12
DEFAULT_KEY_EXPIRY_DAYS=365
RATE_LIMIT_WINDOW_MS=60000
```

### Rate Limiting

```typescript
// Custom rate limits
const customLimits = {
  requestsPerMinute: 100,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  burstAllowance: 20,
  windowSizeMs: 60000
};

// Default rate limits by key type
const serviceLimits = createDefaultRateLimit('service'); // 1000/min
const userLimits = createDefaultRateLimit('user');       // 100/min
const adminLimits = createDefaultRateLimit('admin');     // 500/min
const systemLimits = createDefaultRateLimit('system');   // 10000/min
```

## Security Best Practices

### 🔐 Key Storage
- **Never log API keys** in plaintext
- **Use environment variables** for sensitive configuration
- **Rotate keys regularly** (recommended: 90 days)
- **Monitor key usage** for anomalies

### 🛡️ Access Control
- **Principle of least privilege** - grant minimal required permissions
- **Use scopes** to limit API access granularly
- **Set expiration dates** for temporary access
- **Regular access reviews** to remove unused keys

### 📊 Monitoring
- **Track usage patterns** to detect anomalies
- **Monitor rate limit hits** to identify abuse
- **Geographic analysis** to detect unauthorized access
- **Regular security audits** of key permissions

## Events

The ApiKeyManager emits events for monitoring and logging:

```typescript
keyManager.on('key:generated', ({ keyId, config }) => {
  console.log(`New key generated: ${config.name}`);
});

keyManager.on('key:validated', ({ keyId, success, permissions }) => {
  console.log(`Key validation: ${success ? 'SUCCESS' : 'FAILED'}`);
});

keyManager.on('key:rotated', ({ oldKeyId, newKeyId, reason }) => {
  console.log(`Key rotated: ${oldKeyId} → ${newKeyId} (${reason})`);
});

keyManager.on('key:revoked', ({ keyId, reason, revokedBy }) => {
  console.log(`Key revoked: ${keyId} by ${revokedBy} (${reason})`);
});
```

## Error Handling

```typescript
import { ApiKeyError } from '@codai/api-keys';

try {
  await keyManager.validateApiKey(invalidKey);
} catch (error) {
  if (error instanceof ApiKeyError) {
    console.log('API Key Error:', error.code);
    console.log('Details:', error.details);
  }
}
```

## Integration Examples

### Express.js Middleware

```typescript
import { ApiKeyManager } from '@codai/api-keys';

const keyManager = new ApiKeyManager(config);

const authenticateApiKey = (requiredPermissions: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    const validation = await keyManager.validateApiKey(
      apiKey,
      requiredPermissions,
      [],
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        region: req.headers['x-region'] as string
      }
    );
    
    if (!validation.isValid) {
      return res.status(401).json({ error: validation.error });
    }
    
    if (!validation.rateLimitStatus.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        resetTime: validation.rateLimitStatus.resetTime
      });
    }
    
    req.apiKey = validation.keyData;
    next();
  };
};

// Usage
app.get('/api/data', authenticateApiKey(['read']), (req, res) => {
  res.json({ data: 'Protected data' });
});
```

### Next.js API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManager } from '@codai/api-keys';

const keyManager = new ApiKeyManager(config);

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }
  
  const validation = await keyManager.validateApiKey(apiKey, ['read']);
  
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    message: 'Access granted',
    permissions: validation.permissions
  });
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the CODAI team.
