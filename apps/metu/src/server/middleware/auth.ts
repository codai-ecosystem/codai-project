// 🔑 API Key Authentication Middleware for METU

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

interface ApiKeyData {
  key: string;
  name: string;
  role: 'admin' | 'user' | 'readonly';
  permissions: string[];
  created: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

class ApiKeyManager {
  private apiKeys = new Map<string, ApiKeyData>();

  constructor() {
    this.initializeDefaultKeys();
  }

  private initializeDefaultKeys() {
    // Create admin key from environment or generate one
    const adminKey = process.env.ADMIN_API_KEY || this.generateApiKey();
    this.addApiKey({
      key: adminKey,
      name: 'System Admin',
      role: 'admin',
      permissions: ['*'],
      created: new Date(),
      isActive: true
    });

    // Create readonly key for monitoring
    const readonlyKey = process.env.READONLY_API_KEY || this.generateApiKey();
    this.addApiKey({
      key: readonlyKey,
      name: 'Monitoring',
      role: 'readonly',
      permissions: ['read:health', 'read:metrics', 'read:status'],
      created: new Date(),
      isActive: true
    });

    if (!process.env.ADMIN_API_KEY) {
      console.log(`🔑 Generated Admin API Key: ${adminKey}`);
    }

    if (!process.env.READONLY_API_KEY) {
      console.log(`👁️ Generated Readonly API Key: ${readonlyKey}`);
    }
  }

  generateApiKey(): string {
    return 'metu_' + crypto.randomBytes(32).toString('hex');
  }

  addApiKey(keyData: ApiKeyData) {
    this.apiKeys.set(keyData.key, keyData);
  }

  validateApiKey(key: string): ApiKeyData | null {
    const keyData = this.apiKeys.get(key);

    if (!keyData || !keyData.isActive) {
      return null;
    }

    // Check expiration
    if (keyData.expiresAt && keyData.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    keyData.lastUsed = new Date();

    return keyData;
  }

  revokeApiKey(key: string): boolean {
    const keyData = this.apiKeys.get(key);
    if (keyData) {
      keyData.isActive = false;
      return true;
    }
    return false;
  }

  listApiKeys(): Omit<ApiKeyData, 'key'>[] {
    return Array.from(this.apiKeys.values()).map(({ key, ...data }) => data);
  }

  hasPermission(keyData: ApiKeyData, permission: string): boolean {
    // Admin has all permissions
    if (keyData.permissions.includes('*')) {
      return true;
    }

    // Check exact permission
    if (keyData.permissions.includes(permission)) {
      return true;
    }

    // Check wildcard permissions
    const wildcardPermissions = keyData.permissions.filter(p => p.endsWith('*'));
    for (const wildcardPerm of wildcardPermissions) {
      const prefix = wildcardPerm.slice(0, -1);
      if (permission.startsWith(prefix)) {
        return true;
      }
    }

    return false;
  }
}

const apiKeyManager = new ApiKeyManager();

// API Key authentication middleware
export function apiKeyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the x-api-key header or apiKey query parameter'
    });
  }

  const keyData = apiKeyManager.validateApiKey(apiKey);

  if (!keyData) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is invalid, expired, or revoked'
    });
  }

  // Attach key and user data to request
  req.apiKey = apiKey;
  req.user = {
    id: keyData.key.substring(0, 8), // Use first 8 chars as user ID
    role: keyData.role,
    permissions: keyData.permissions
  };

  next();
}

// Permission-based authorization middleware
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate with a valid API key'
      });
    }

    const apiKey = req.apiKey!;
    const keyData = apiKeyManager.validateApiKey(apiKey);

    if (!keyData || !apiKeyManager.hasPermission(keyData, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permission: ${permission}`,
        userRole: req.user.role,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
}

// Role-based authorization middleware
export function requireRole(role: 'admin' | 'user' | 'readonly') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const roleHierarchy = { admin: 3, user: 2, readonly: 1 };
    const requiredLevel = roleHierarchy[role];
    const userLevel = roleHierarchy[req.user.role as keyof typeof roleHierarchy];

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient role',
        message: `Required role: ${role}, current role: ${req.user.role}`
      });
    }

    next();
  };
}

// Optional authentication (doesn't require auth but adds user if present)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;

  if (apiKey) {
    const keyData = apiKeyManager.validateApiKey(apiKey);

    if (keyData) {
      req.apiKey = apiKey;
      req.user = {
        id: keyData.key.substring(0, 8),
        role: keyData.role,
        permissions: keyData.permissions
      };
    }
  }

  next();
}

// API Key management endpoints (for admin use)
export function createApiKeyEndpoints(app: any) {
  // Create new API key (admin only)
  app.post('/api/admin/keys', apiKeyMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, role, permissions, expiresIn } = req.body;

      if (!name || !role || !permissions) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'role', 'permissions']
        });
      }

      const newKey = apiKeyManager.generateApiKey();
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

      const keyData: ApiKeyData = {
        key: newKey,
        name,
        role,
        permissions: Array.isArray(permissions) ? permissions : [permissions],
        created: new Date(),
        expiresAt,
        isActive: true
      };

      apiKeyManager.addApiKey(keyData);

      res.json({
        message: 'API key created successfully',
        key: newKey,
        name,
        role,
        permissions: keyData.permissions,
        expiresAt
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create API key',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List API keys (admin only)
  app.get('/api/admin/keys', apiKeyMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
    const keys = apiKeyManager.listApiKeys();
    res.json({ keys });
  });

  // Revoke API key (admin only)
  app.delete('/api/admin/keys/:keyId', apiKeyMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
    const { keyId } = req.params;
    const success = apiKeyManager.revokeApiKey(keyId);

    if (success) {
      res.json({ message: 'API key revoked successfully' });
    } else {
      res.status(404).json({ error: 'API key not found' });
    }
  });

  // Get current user info
  app.get('/api/auth/me', apiKeyMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      user: req.user,
      keyInfo: {
        role: req.user!.role,
        permissions: req.user!.permissions
      }
    });
  });
}

export { apiKeyManager };
