# 🚀 Vercel Deployment Plan for CODAI Ecosystem

## Phase 1: MCP Dashboard Applications

### 📋 Deployment Priority Order

#### 1. MemorAI Applications

- **`memorai.ro`** → MemorAI Frontend App (Port 4006)
- **`mcp.memorai.ro`** → MemorAI MCP Dashboard

#### 2. RomAI Applications

- **`romcp.ro`** → RomAI Frontend App (Port 6100)
- **`mcp.romcp.ro`** → RomAI MCP Dashboard

#### 3. Core Platform Applications

- **`admin.codai.ro`** → Admin Dashboard (Port 4007)
- **`hub.codai.ro`** → Hub App
- **`codai.ro`** → CODAI Main App

## 📦 Application Analysis

### MemorAI App (`apps/memorai`)

```json
Framework: Next.js 15.4.1
Port: 4006 (dev), 4006 (start)
Dependencies: React 19.1.0, TypeScript 5.8.3
Backend Integration: @codai/memorai workspace package
Build Command: next build --experimental-build-mode=compile
```

### RomAI App (`apps/romai`)

```json
Framework: Next.js 15.4.1
Port: 6100 (dev), 6100 (start)
Dependencies: React 19.1.0, TypeScript 5.8.3
Backend Integration: @codai/shared-ui, @codai/translations
Build Command: next build
```

### Admin App (`apps/admin`)

```json
Framework: Next.js 15.4.1
Port: 4007 (dev), 4002 (start)
Dependencies: React 19.1.0, TypeScript 5.8.3, Radix UI
Backend Integration: Multiple @codai/* packages
Build Command: next build
```

## 🔧 Vercel Configuration Strategy

### Environment Variables Template

```env
# Backend API Endpoints
NEXT_PUBLIC_API_URL=https://api.codai.ro
NEXT_PUBLIC_MEMORAI_API_URL=https://api.memorai.ro
NEXT_PUBLIC_ROMAI_API_URL=https://api.romcp.ro
NEXT_PUBLIC_GLASS_API_URL=https://glass.codai.ro

# MCP Protocol Endpoints
NEXT_PUBLIC_MEMORAI_MCP_URL=https://api.memorai.ro/mcp
NEXT_PUBLIC_ROMAI_MCP_URL=https://api.romcp.ro/mcp

# Authentication & Security
NEXTAUTH_URL=https://[app-domain]
NEXTAUTH_SECRET=[generate-secret]

# Feature Flags
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG=false
```

### Vercel Build Configuration

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "nodeVersion": "18.x"
}
```

## 🚦 Deployment Steps

### Step 1: Prepare Repository

1. Ensure all apps build successfully locally
2. Configure environment variables
3. Test API connectivity to backend services

### Step 2: Create Vercel Projects

For each application:

1. Connect GitHub repository
2. Set custom domain
3. Configure build settings
4. Set environment variables
5. Deploy

### Step 3: Domain Configuration

Vercel will automatically handle:

- SSL certificate provisioning
- CDN distribution
- Edge optimization
- Automatic deployments from Git

## 📊 Expected Deployment Timeline

```
Phase 1: MCP Apps (30 minutes)
├── memorai.ro: 10 minutes
├── mcp.memorai.ro: 10 minutes
├── romcp.ro: 10 minutes
└── mcp.romcp.ro: 10 minutes

Phase 2: Core Apps (45 minutes)
├── admin.codai.ro: 15 minutes
├── hub.codai.ro: 15 minutes
└── codai.ro: 15 minutes

Total: ~75 minutes for 7 applications
```

## 🔗 Backend Integration Testing

### API Connectivity Verification

After deployment, test these endpoints:

```bash
# MemorAI MCP Server
curl https://api.memorai.ro/health
curl https://api.memorai.ro/mcp/capabilities

# RomAI MCP Server
curl https://api.romcp.ro/health
curl https://api.romcp.ro/mcp/capabilities

# Gateway Service
curl https://api.codai.ro/health

# Glass Service
curl https://glass.codai.ro/health
```

## 🎯 Success Criteria

### Phase 1 Complete When:

- [ ] memorai.ro loads successfully
- [ ] mcp.memorai.ro connects to MCP server
- [ ] romcp.ro loads successfully
- [ ] mcp.romcp.ro connects to MCP server
- [ ] All domains have valid SSL certificates
- [ ] Backend API calls working

### Phase 2 Complete When:

- [ ] admin.codai.ro loads with authentication
- [ ] hub.codai.ro displays properly
- [ ] codai.ro main site functional
- [ ] All inter-app navigation working
- [ ] Performance metrics meet standards

---

**Ready to Begin**: Backend infrastructure operational ✅
**DNS Configuration**: Complete ✅  
**Next Action**: Start with MemorAI app deployment
