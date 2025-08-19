# 🚀 CODAI Services - Vercel Deployment Guide

## ✅ ALL SERVICES VERIFIED AND READY

**Build Status: 🟢 100% SUCCESS**

- ✅ CODAI Main Platform builds successfully
- ✅ Hub Simple Service builds successfully
- ✅ Auth Simple Service builds successfully
- ✅ ID Simple Service builds successfully

## 📋 Deployment Steps

### 1. Vercel Project Setup

For each service, create a Vercel project:

```bash
# Deploy CODAI Main Platform
cd apps/codai
vercel --prod --name codai-main

# Deploy Hub Service
cd ../hub-simple
vercel --prod --name codai-hub

# Deploy Auth Service
cd ../auth-simple
vercel --prod --name codai-auth

# Deploy ID Service
cd ../id-simple
vercel --prod --name codai-id
```

### 2. Domain Configuration

In Vercel dashboard, add custom domains:

| Service      | Vercel Project | Custom Domain   |
| ------------ | -------------- | --------------- |
| CODAI Main   | `codai-main`   | `api.codai.ro`  |
| Hub Service  | `codai-hub`    | `hub.codai.ro`  |
| Auth Service | `codai-auth`   | `auth.codai.ro` |
| ID Service   | `codai-id`     | `id.codai.ro`   |

### 3. DNS Configuration

Add CNAME records in your DNS provider:

```
api.codai.ro    CNAME   codai-main.vercel.app
hub.codai.ro    CNAME   codai-hub.vercel.app
auth.codai.ro   CNAME   codai-auth.vercel.app
id.codai.ro     CNAME   codai-id.vercel.app
```

## 🔧 Service Configuration

### Environment Variables

Add to each Vercel project:

```env
# For all services
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.codai.ro
NEXT_PUBLIC_AUTH_URL=https://auth.codai.ro
NEXT_PUBLIC_HUB_URL=https://hub.codai.ro
NEXT_PUBLIC_ID_URL=https://id.codai.ro

# For auth service specifically
JWT_SECRET=your-secret-key-here
TOKEN_EXPIRY=3600

# For main CODAI platform
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-openai-key
```

## 🧪 Post-Deployment Testing

### Health Checks

```bash
# Test all service health endpoints
curl https://api.codai.ro/api/health
curl https://hub.codai.ro/api/health
curl https://auth.codai.ro/api/health
curl https://id.codai.ro/api/health
```

### Authentication Flow

```bash
# 1. Login to get token
curl -X POST https://auth.codai.ro/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@codai.ro","password":"demo123"}'

# 2. Use token to access protected endpoints
curl https://id.codai.ro/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Service Registry

```bash
# Check service registry
curl https://hub.codai.ro/api/services

# Check system status
curl https://hub.codai.ro/api/status
```

## 📊 Service Endpoints Reference

### Auth Service (auth.codai.ro)

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/verify` - Token verification
- `POST /api/profile` - User profile
- `POST /api/logout` - Logout
- `GET /api/health` - Health check

### ID Service (id.codai.ro)

- `GET /api/users` - List users (auth required)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `GET /api/roles` - List roles (auth required)
- `GET /api/health` - Health check

### Hub Service (hub.codai.ro)

- `GET /api/services` - Service registry
- `GET /api/status` - System status
- `GET /api/health` - Health check

### CODAI Main Platform (api.codai.ro)

- Full AI platform with existing endpoints
- Model management, conversations, training
- Integration with auth/id services

## 🔐 Security Configuration

### CORS Headers

All services include proper CORS configuration:

```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Security Headers

```javascript
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

## 🎯 Success Criteria

After deployment, verify:

- ✅ All services respond to health checks
- ✅ Auth service can authenticate users
- ✅ ID service can list users with auth token
- ✅ Hub service shows all services in registry
- ✅ CODAI main platform is accessible
- ✅ Cross-service authentication works
- ✅ Custom domains resolve correctly

## 📱 Demo Access

Use these credentials for testing:

- **Admin**: `admin@codai.ro` / `admin123`
- **Demo User**: `demo@codai.ro` / `demo123`

## 🚀 Deploy Command Summary

```bash
# Quick deployment script
cd apps/codai && vercel --prod
cd ../hub-simple && vercel --prod
cd ../auth-simple && vercel --prod
cd ../id-simple && vercel --prod
```

**Status: 🟢 READY FOR IMMEDIATE DEPLOYMENT**

All services are built, tested, and configured for production deployment on Vercel with custom domain mapping to \*.codai.ro subdomains.
