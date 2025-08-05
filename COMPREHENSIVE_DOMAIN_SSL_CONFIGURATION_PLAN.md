# 🌐 Comprehensive Domain & SSL Configuration Plan

## 📅 Date: August 5, 2025
## 🎯 Objective: Complete SSL and Custom Domain Setup for All CODAI Services

---

## 🔍 Current Status Analysis

### ✅ BACKEND SERVICES (Properly Configured)
| Service | Domain | SSL Status | Infrastructure | Status |
|---------|--------|------------|----------------|---------|
| **API Gateway** | api.codai.ro | ✅ ISSUED | CloudFront → ALB → ECS | ✅ OPERATIONAL |
| **Service Gateway** | gateway.codai.ro | ✅ ISSUED | CloudFront → ALB → ECS | ✅ OPERATIONAL |

**SSL Certificate**: `arn:aws:acm:us-east-1:567877624442:certificate/636a3f22-9f1f-444b-b603-03078898093b`
- **Domain Coverage**: `codai.ro` + `*.codai.ro` (wildcard)
- **Status**: ISSUED ✅
- **Expiry**: September 3, 2026
- **In Use By**: 2 CloudFront distributions + 1 ALB

### ❌ FRONTEND APPLICATIONS (Missing Custom Domains)
| Application | Expected Domain | Current Deployment | Custom Domain Status | DNS Status |
|-------------|----------------|-------------------|---------------------|------------|
| **CODAI Main** | codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **MemorAI** | memorai.codai.ro | memorai-r2nt1v1cv-codai-ro.vercel.app | ❌ Missing | ❌ Missing |
| **Admin Dashboard** | admin.codai.ro | admin-pnw0pkrdu-codai-ro.vercel.app | ❌ Missing | ❌ Missing |
| **ID Service** | id.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **Hub Service** | hub.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **BancAI** | bancai.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **Gateway Web** | apps.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **ControlAI Dashboard** | control.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |
| **RomAI** | romai.codai.ro | Vercel Default | ❌ Missing | ❌ Missing |

---

## 🎯 Implementation Plan

### Phase 1: Vercel Custom Domain Configuration
For each frontend application, we need to:

1. **Add Custom Domain in Vercel**
   ```bash
   vercel domains add <subdomain>.codai.ro --scope codai-ro
   ```

2. **Assign Domain to Project**
   ```bash
   vercel domains assign <subdomain>.codai.ro <project-name> --scope codai-ro
   ```

3. **Configure DNS Records**
   ```bash
   vercel dns add codai.ro <subdomain> CNAME cname.vercel-dns.com.
   ```

### Phase 2: SSL Certificate Validation
Since we already have a wildcard SSL certificate (`*.codai.ro`), Vercel should automatically provision SSL for each subdomain.

### Phase 3: DNS Verification
Verify each domain resolves correctly and has proper SSL.

---

## 🚀 Execution Steps

### Step 1: Configure MemorAI Domain
```bash
# Navigate to MemorAI app
cd e:\GitHub\codai-project\apps\memorai

# Add custom domain
vercel domains add memorai.codai.ro --scope codai-ro

# Assign to project
vercel alias set memorai-r2nt1v1cv-codai-ro.vercel.app memorai.codai.ro

# Add DNS record
vercel dns add codai.ro memorai CNAME cname.vercel-dns.com.
```

### Step 2: Configure Admin Dashboard Domain
```bash
# Navigate to Admin app
cd e:\GitHub\codai-project\apps\admin

# Add custom domain
vercel domains add admin.codai.ro --scope codai-ro

# Assign to project
vercel alias set admin-pnw0pkrdu-codai-ro.vercel.app admin.codai.ro

# Add DNS record
vercel dns add codai.ro admin CNAME cname.vercel-dns.com.
```

### Step 3: Configure Remaining Applications
Repeat the process for:
- `id.codai.ro` (ID Service)
- `hub.codai.ro` (Hub Service)  
- `bancai.codai.ro` (BancAI)
- `apps.codai.ro` (Gateway Web)
- `control.codai.ro` (ControlAI Dashboard)
- `romai.codai.ro` (RomAI)

### Step 4: Configure Main Domain
```bash
# Configure root domain
vercel domains add codai.ro --scope codai-ro
vercel alias set <main-codai-deployment>.vercel.app codai.ro
```

---

## 🔐 SSL Certificate Verification

### Current Certificate Status
- **Certificate ARN**: `arn:aws:acm:us-east-1:567877624442:certificate/636a3f22-9f1f-444b-b603-03078898093b`
- **Coverage**: `codai.ro` + `*.codai.ro`
- **Status**: ISSUED ✅
- **Validation**: DNS validation completed

### Vercel SSL Behavior
Vercel will automatically provision SSL certificates for custom domains using Let's Encrypt. Since we're using subdomains of `codai.ro`, SSL should be provisioned automatically.

---

## 📊 Expected Final Configuration

### Backend Services (CloudFront + AWS)
```bash
https://api.codai.ro        → CloudFront → ALB → ECS Services
https://gateway.codai.ro    → CloudFront → ALB → ECS Services
```

### Frontend Applications (Vercel)
```bash
https://codai.ro           → Vercel → CODAI Main App
https://memorai.codai.ro   → Vercel → MemorAI App
https://admin.codai.ro     → Vercel → Admin Dashboard
https://id.codai.ro        → Vercel → ID Service
https://hub.codai.ro       → Vercel → Hub Service
https://bancai.codai.ro    → Vercel → BancAI App
https://apps.codai.ro      → Vercel → Gateway Web App
https://control.codai.ro   → Vercel → ControlAI Dashboard
https://romai.codai.ro     → Vercel → RomAI App
```

---

## 🎯 Success Criteria

### ✅ Domain Configuration Complete When:
- [ ] All 9 frontend applications have custom domains configured
- [ ] All domains resolve with valid SSL certificates
- [ ] All applications load correctly on their custom domains
- [ ] Cross-origin requests work between frontend and backend
- [ ] Authentication flows work across all domains

### ✅ SSL Configuration Complete When:
- [ ] All domains show valid SSL certificates (green lock icon)
- [ ] SSL certificate expiry dates are reasonable (>90 days)
- [ ] No mixed content warnings
- [ ] HTTPS redirects work correctly

### ✅ Integration Testing Complete When:
- [ ] Frontend apps can communicate with backend APIs
- [ ] Authentication works across all subdomains
- [ ] WebSocket connections establish successfully
- [ ] CORS policies allow cross-subdomain communication

---

## 🚀 Implementation Timeline

### Immediate Actions (30 minutes)
1. Configure custom domains for successfully deployed apps (MemorAI, Admin)
2. Add DNS records for these domains
3. Verify SSL provisioning

### Short Term (1-2 hours)
1. Deploy remaining applications to Vercel
2. Configure custom domains for all applications
3. Complete DNS configuration

### Validation (30 minutes)
1. Test all domains and SSL certificates
2. Verify cross-service communication
3. Complete integration testing

---

## 🔧 Troubleshooting Guide

### Common Issues:
1. **DNS Propagation Delay**: Wait 5-10 minutes for DNS changes
2. **SSL Provisioning Delay**: Vercel SSL can take 1-2 minutes
3. **CORS Issues**: Update API CORS settings to include new domains
4. **Caching Issues**: Clear browser cache or use incognito mode

### Verification Commands:
```bash
# Check DNS resolution
nslookup memorai.codai.ro

# Check SSL certificate
curl -I https://memorai.codai.ro

# Test API connectivity
curl https://api.codai.ro/health
```

---

## 🎉 Expected Outcome

Upon completion, the CODAI ecosystem will have:
- **9 Frontend Applications** with custom SSL domains
- **2 Backend Services** with CloudFront SSL
- **Complete End-to-End HTTPS** across all services
- **Production-Ready Domain Configuration** for public access

**Total SSL-Enabled Domains**: 11 (9 frontend + 2 backend)

This will complete the missing domain and SSL configuration identified in the current setup!
