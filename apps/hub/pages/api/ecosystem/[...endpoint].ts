/**
 * CBD Ecosystem Proxy Service
 * Provides ecosystem endpoints until they're deployed to live CBD service
 */

import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock project storage for demonstration
const projects: any[] = [];
const apiKeys: any[] = [];
const users: any[] = [
  {
    id: 'admin_user_001',
    email: 'admin@codai.ro',
    username: 'admin',
    password: '$2b$12$LQv3c1yX8LsiuK/XWm/s/.k8o0Z1xBv.M4iq2WUJ5NXMZXWzYdGAG', // admin123
    role: 'admin',
    permissions: ['admin', 'read', 'write', 'ecosystem:admin'],
    isActive: true,
    createdAt: '2025-08-05T20:59:00.000Z',
    profile: {
      name: 'Admin User',
      department: 'System Administration'
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { endpoint } = query;

  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route to appropriate handler
    if (endpoint?.[0] === 'projects') {
      return await handleProjects(req, res);
    } else if (endpoint?.[0] === 'api-keys') {
      return await handleApiKeys(req, res);
    } else if (endpoint?.[0] === 'auth') {
      return await handleAuth(req, res);
    } else if (endpoint?.[0] === 'health') {
      return await handleHealth(req, res);
    } else {
      return res.status(404).json({
        error: 'Not Found',
        message: `Ecosystem endpoint not found: /${endpoint?.join('/')}`,
        availableEndpoints: ['/projects', '/api-keys', '/auth', '/health']
      });
    }
  } catch (error) {
    console.error('Ecosystem API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleAuth(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const action = query.endpoint?.[1]; // login, register, verify

  switch (method) {
    case 'POST':
      if (action === 'login') {
        // Login user
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password are required'
          });
        }

        const user = users.find(u => u.email === email && u.isActive);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }

        // For simplicity, we'll do a basic password check (in production, use bcrypt)
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }

        // Create a session token (simplified JWT)
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
          },
          'codai-ecosystem-secret',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              permissions: user.permissions,
              profile: user.profile
            },
            token
          }
        });
      }
      break;

    case 'GET':
      if (action === 'verify') {
        // Verify token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'Authorization header required'
          });
        }

        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, 'codai-ecosystem-secret') as any;
          const user = users.find(u => u.id === decoded.userId);

          if (!user || !user.isActive) {
            return res.status(401).json({
              success: false,
              error: 'Invalid token'
            });
          }

          return res.json({
            success: true,
            data: {
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                profile: user.profile
              }
            }
          });
        } catch (error) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token'
          });
        }
      }
      break;

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(404).json({ error: 'Auth endpoint not found' });
}

async function handleProjects(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const projectId = query.endpoint?.[1];

  switch (method) {
    case 'GET':
      if (projectId) {
        // Get specific project
        const project = projects.find(p => p.id === projectId);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }
        return res.json({ success: true, data: project });
      } else {
        // List projects
        return res.json({ success: true, data: projects });
      }

    case 'POST':
      // Create project
      const newProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        ownerId: req.body.ownerId || 'hub-user',
        status: req.body.status || 'PLANNING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      projects.push(newProject);
      return res.status(201).json({ success: true, data: newProject });

    case 'PUT':
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'Project ID required' });
      }

      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      projects[projectIndex] = {
        ...projects[projectIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      return res.json({ success: true, data: projects[projectIndex] });

    case 'DELETE':
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'Project ID required' });
      }

      const deleteIndex = projects.findIndex(p => p.id === projectId);
      if (deleteIndex === -1) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      projects.splice(deleteIndex, 1);
      return res.json({ success: true, message: 'Project deleted' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleApiKeys(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const keyId = query.endpoint?.[1];

  switch (method) {
    case 'GET':
      // List API keys
      const projectId = query.projectId as string;
      const filteredKeys = projectId
        ? apiKeys.filter(key => key.projectId === projectId)
        : apiKeys;

      return res.json({ success: true, data: filteredKeys });

    case 'POST':
      // Create API key
      const newApiKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: req.body.name,
        projectId: req.body.projectId,
        keyHash: 'hash_placeholder',
        token: `codai_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
        scopes: req.body.scopes || ['read', 'write'],
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: req.body.expiresIn ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
      };

      apiKeys.push(newApiKey);
      return res.status(201).json({ success: true, data: newApiKey });

    case 'DELETE':
      if (!keyId) {
        return res.status(400).json({ success: false, error: 'API Key ID required' });
      }

      const deleteIndex = apiKeys.findIndex(k => k.id === keyId);
      if (deleteIndex === -1) {
        return res.status(404).json({ success: false, error: 'API Key not found' });
      }

      apiKeys.splice(deleteIndex, 1);
      return res.json({ success: true, message: 'API Key revoked' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleHealth(req: NextApiRequest, res: NextApiResponse) {
  return res.json({
    status: 'healthy',
    service: 'CBD Ecosystem Proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/ecosystem/projects': 'Project management',
      '/ecosystem/api-keys': 'API key management',
      '/ecosystem/auth/login': 'User authentication',
      '/ecosystem/auth/verify': 'Token verification',
      '/ecosystem/health': 'Health check'
    },
    authentication: {
      adminUser: 'admin@codai.ro',
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length
    }
  });
}
