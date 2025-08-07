# 🌐 CODAI Live Domain Configuration Plan

**Date**: August 5, 2025  
**Objective**: Configure all services to use live production domains  
**Status**: Implementation in Progress  

---

## 🔍 Current Live Domain Status

### ✅ Active Production Services
- **Hub Frontend**: https://hub.codai.ro (Vercel) - ✅ LIVE
- **CBD API**: https://cbd.memorai.ro (CloudFront/AWS) - ✅ LIVE
- **ID Service**: https://id.codai.ro (AWS ELB) - 🔄 REDIRECTING

### 🎯 Domain Architecture
```yaml
Production Domains:
├── 🏠 hub.codai.ro (Frontend Hub)
│   ├── Platform: Vercel
│   ├── Status: ✅ Operational
│   ├── Services: 5/5 Active
│   └── Needs: CBD API Connection
├── 🗄️ cbd.memorai.ro (Universal Database)
│   ├── Platform: AWS CloudFront
│   ├── Status: ✅ Operational  
│   ├── Version: v4.0.0 (6 paradigms)
│   └── Missing: Ecosystem Endpoints
├── 🆔 id.codai.ro (Authentication)
│   ├── Platform: AWS ELB
│   ├── Status: 🔄 Redirecting
│   └── Needs: Configuration Check
└── 🌐 api.codai.ro (Unified API Gateway)
    ├── Platform: AWS CloudFront
    ├── Status: 🔄 Redirecting
    └── Needs: Endpoint Configuration
```

---

## 📋 Phase 1: Deploy Ecosystem Endpoints to Live CBD

### 🔧 Missing Endpoints on https://cbd.memorai.ro
Currently Available: `/health`, `/stats`, `/document`, `/vector`, `/graph`, `/kv`, `/timeseries`, `/files`, `/ai`, `/security`

**Need to Deploy**:
- `/ecosystem/projects` - Project management
- `/ecosystem/api-keys` - API key management  
- `/ecosystem/health` - Ecosystem health check
- `/ecosystem/docs` - Integration documentation

### 🚀 Deployment Steps

1. **Update Live CBD Service**
   ```bash
   # Deploy ecosystem endpoints to production CBD
   # This requires access to the production CBD deployment
   ```

2. **Verify Endpoints**
   ```bash
   curl https://cbd.memorai.ro/ecosystem/projects
   curl https://cbd.memorai.ro/ecosystem/api-keys
   ```

---

## 📋 Phase 2: Configure Hub to Use Live CBD

### 🔧 Environment Configuration

**Current Hub Config** (hub.codai.ro):
```typescript
// Need to set NEXT_PUBLIC_CBD_API_URL to live domain
NEXT_PUBLIC_CBD_API_URL=https://cbd.memorai.ro
```

**Local Development Config**:
```typescript
// apps/hub/.env.local
NEXT_PUBLIC_CBD_API_URL=https://cbd.memorai.ro
CBD_API_URL=https://cbd.memorai.ro
```

### 🔄 Vercel Deployment Update

**Update Hub Environment Variables**:
```bash
# Set production environment in Vercel
vercel env add NEXT_PUBLIC_CBD_API_URL production
# Value: https://cbd.memorai.ro
```

---

## 📋 Phase 3: Configure API Gateway (api.codai.ro)

### 🌐 Unified API Gateway Setup

**Target Configuration**:
```nginx
# api.codai.ro routes
/projects/* → https://cbd.memorai.ro/ecosystem/projects/*
/auth/* → https://id.codai.ro/auth/*
/services/* → https://hub.codai.ro/api/services/*
```

### 🔧 CloudFront/ALB Configuration
```yaml
Route Configuration:
  - Path: /ecosystem/*
    Target: https://cbd.memorai.ro/ecosystem/*
  - Path: /auth/*  
    Target: https://id.codai.ro/auth/*
  - Path: /health
    Target: https://cbd.memorai.ro/health
```

---

## 📋 Phase 4: SSL/CORS Configuration

### 🔐 Security Headers
```yaml
CORS Configuration:
  - Allow-Origin: https://hub.codai.ro
  - Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  - Allow-Headers: Authorization, Content-Type, X-API-Key
  - Allow-Credentials: true
```

### 🛡️ SSL Certificate Management
- ✅ hub.codai.ro: Valid SSL (Vercel)
- ✅ cbd.memorai.ro: Valid SSL (CloudFront)
- 🔄 api.codai.ro: Needs verification
- 🔄 id.codai.ro: Needs verification

---

## 📋 Phase 5: Testing & Validation

### 🧪 Integration Tests
```typescript
// Test Suite for Live Domains
const tests = [
  'Hub loads successfully from hub.codai.ro',
  'Hub connects to CBD API at cbd.memorai.ro', 
  'Project creation works end-to-end',
  'API key generation works with JWT',
  'Authentication flows through id.codai.ro',
  'All CORS policies work correctly'
];
```

### 📊 Monitoring Setup
```yaml
Health Checks:
  - https://hub.codai.ro → 200 OK
  - https://cbd.memorai.ro/health → 200 OK  
  - https://cbd.memorai.ro/ecosystem/health → 200 OK
  - https://api.codai.ro/health → 200 OK
  - https://id.codai.ro/health → 200 OK
```

---

## 🎯 Implementation Priority

### 🚨 Critical (Immediate)
1. **Deploy ecosystem endpoints to cbd.memorai.ro**
2. **Configure Hub environment variables for live CBD**
3. **Test project creation flow end-to-end**

### 🔄 Important (Next)
4. **Configure api.codai.ro routing**
5. **Verify id.codai.ro authentication**
6. **Setup comprehensive monitoring**

### 📈 Enhancement (Future)
7. **Load balancing configuration**
8. **CDN optimization**
9. **Advanced security headers**

---

## 🛠️ Next Actions

### Immediate Steps:
1. **Check CBD deployment access** - Verify if we can update the live CBD service
2. **Update Hub configuration** - Point to live CBD API
3. **Test integration** - Verify project creation works with live domains
4. **Deploy missing endpoints** - Add ecosystem routes to production CBD

### Success Criteria:
- ✅ Hub at hub.codai.ro can create projects
- ✅ Projects are stored in cbd.memorai.ro
- ✅ API keys are generated with proper JWT
- ✅ All services communicate over HTTPS
- ✅ CORS policies allow cross-domain requests

---

**Status**: Ready for implementation - all domains identified and configuration plan complete.
