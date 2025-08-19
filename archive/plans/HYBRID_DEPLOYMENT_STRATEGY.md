# 🏗️ CODAI Ecosystem Deployment Strategy

## 📊 Application Classification

Based on the Unified Service Directory, here's the correct deployment architecture:

### �️ **CORE INFRASTRUCTURE SERVICES** (Deploy to Cloud/Kubernetes)

**These are the backbone services that MUST be deployed to cloud infrastructure:**

1. **Gateway Service** (Port 4000) - Node.js + Express
   - Central API gateway with routing, auth, rate limiting
   - **CRITICAL**: Must be deployed first - all traffic routes through this
2. **MemorAI Service** (Port 3693/6367) - Node.js + TypeScript + MCP Protocol
   - Production-ready agent memory with vector embeddings
   - **CRITICAL**: Memory provider for all AI services
3. **ID Service** (Port 4001) - Next.js but **CORE AUTH**
   - Universal SSO, identity management, authentication provider
   - **CRITICAL**: Authentication for entire ecosystem
4. **RomAI MCP Server** (Port 8000) - Node.js + TypeScript
   - Romanian AI central intelligence system
   - **CRITICAL**: MCP server for AI coordination

5. **Glass Service** (Port 7700) - Node.js + TypeScript
   - Windows automation and MCP server
   - **BACKEND SERVICE**: Production-ready API server

### 🌐 **NEXT.JS APPLICATIONS** (Deploy to Vercel)

**These are frontend applications that should go to Vercel:**

#### **Phase 1 - Core Platform Apps**

1. **Admin Service** (Port 4005) - Next.js 15
   - Comprehensive administrative dashboard
   - Ecosystem management and monitoring
2. **Hub Service** (Port 4003) - Next.js 15
   - Integration center and workflow orchestration
   - Service discovery and automation
3. **CODAI Service** (Port 4006) - Next.js 15
   - AI-native development platform
   - Core development environment

#### **Phase 2 - Business AI Platforms (8 Priority Apps)**

4. **BancAI Service** (Port 4007) - Next.js 15
   - AI-powered banking platform with PCI DSS compliance
5. **StudiAI Service** (Port 5001) - Next.js 15
   - AI education platform with personalized tutoring
6. **TalentAI Service** (Port 5003) - Next.js 15
   - HR and talent management with AI recruitment
7. **AnalizAI Service** (Port 3016) - Next.js 14
   - Enterprise analytics and business intelligence
8. **AjutAI Service** (Port 3000) - Next.js 15
   - AI customer support with Romanian focus
9. **ConversAI Service** (Port 3000) - Next.js 15
   - Professional email with AI communication intelligence
10. **StocAI Service** (Port 5004) - Next.js 15
    - AI-powered stock trading platform
11. **PrezentAI Service** (Port 5005) - Next.js 15
    - AI presentation and content creation

#### **Phase 3 - Extended Business Apps**

12. **MarketAI Service** - AI agents marketplace
13. **FabricAI Service** - AI development platform
14. **LegalizAI Service** - AI legal and compliance
15. **MuzicAI Service** - AI music creation
16. **SociAI Service** - AI social networking
17. **SunAI Service** - Solar energy optimization
18. **CumparAI Service** - Intelligent shopping
19. **Wallet Service** - Cryptocurrency wallet
20. **Tools Service** - AI-powered utilities
21. **All other specialized AI services** (30+ apps)

### 🔧 **SPECIALIZED DEPLOYMENTS**

1. **AIDE Service** (Ports 42434/42433)
   - VS Code + Electron desktop application
   - **DESKTOP APP**: Separate deployment strategy
2. **METU Service** (Port 3000)
   - Voice AI Electron application
   - **DESKTOP APP**: Separate deployment strategy

### 📱 Native Mobile Apps (Separate Deployment)

These need specialized mobile deployment:

- **aide** - VS Code-like IDE (Electron app)
- **aide-landing** - Landing page for aide
- **aide-control** - Control interface for aide

## 🚀 Deployment Architecture

### Vercel Deployment (Next.js Apps)

```yaml
Vercel Configuration:
  - Auto-deploy from GitHub
  - Custom domains for each app
  - Environment variables per app
  - Edge functions for API routes
  - Global CDN distribution
```

### Cloud Infrastructure (Node.js Services)

```yaml
Kubernetes Deployment:
  - Docker containers for each service
  - Load balancing with NGINX Ingress
  - Service mesh for inter-service communication
  - Database connections (PostgreSQL/Redis)
  - API Gateway as entry point
```

## 🌐 Domain Strategy - CORRECTED

### 🔧 **BACKEND API SERVERS** (Cloud/Kubernetes)

**Pure Backend Services - Need Cloud Infrastructure:**

- `api.codai.ro` → **Gateway Service** (Port 4000) - Express.js API Gateway
- `api.memorai.ro` → **MemorAI Backend API** (Port 3693/6367) - Memory service backend + MCP
- `api.romai.ro` → **RomAI API Server** (Port 8000) - Romanian AI REST API
- `mcp.romai.ro` → **RomAI MCP Server** (Port 3001) - Model Context Protocol server
- `glass.codai.ro` → **Glass MCP Server** (Port 8001) - Windows automation MCP server

### 🌐 **FRONTEND NEXT.JS APPS** (Vercel)

**Next.js Applications with API Routes:**

**Core Platform Apps:**

- `codai.ro` → **CODAI Platform** (Next.js 15) - Main development platform
- `admin.codai.ro` → **Admin Dashboard** (Next.js 15) - Administrative interface
- `hub.codai.ro` → **Hub Service** (Next.js 15) - Integration center
- `id.codai.ro` → **ID Service** (Next.js) - Identity management frontend

**AI Platform Apps:**

- `memorai.ro` → **MemorAI Frontend** (Next.js 15) - Memory platform UI
- `romai.ro` → **RomAI Dashboard** (Next.js 15) - Romanian AI platform UI
- `glass.codai.ro` → **Glass Dashboard** (Next.js 15) - Windows automation UI

**Documentation Sites:**

- `docs.codai.ro` → **Main Documentation** - Ecosystem documentation
- `docs.memorai.ro` → **MemorAI Docs** - Memory service documentation
- `docs.romai.ro` → **RomAI Docs** - Romanian AI documentation
- `api-docs.codai.ro` → **API Documentation** - Swagger/OpenAPI docs

### 💼 **BUSINESS AI PLATFORMS** (Vercel - Phase 1)

- `bancai.ro` → **BancAI Service** - AI banking platform
- `studiai.ro` → **StudiAI Service** - AI education platform
- `talentai.ro` → **TalentAI Service** - HR AI platform
- `stocai.ro` → **StocAI Service** - AI trading platform
- `analizai.ro` → **AnalizAI Service** - Business intelligence
- `ajutai.ro` → **AjutAI Service** - Customer support AI
- `conversai.ro` → **ConversAI Service** - Email AI
- `prezentai.ro` → **PrezentAI Service** - Presentation AI

### 🚀 **EXTENDED SERVICES** (Vercel - Phase 2)

- `marketai.ro` → **MarketAI Service** - AI marketplace
- `fabricai.ro` → **FabricAI Service** - AI development
- `legalizai.ro` → **LegalizAI Service** - Legal AI
- `muzicai.ro` → **MuzicAI Service** - Music AI
- `sociai.ro` → **SociAI Service** - Social AI
- `sunai.ro` → **SunAI Service** - Solar energy AI
- `cumparai.ro` → **CumparAI Service** - Shopping AI
- `tools.codai.ro` → **Tools Service** - Utility tools
- Plus 15+ other specialized AI services

## ⚡ Fast Deployment Plan

### Step 1: Deploy Core Infrastructure to Cloud (15 minutes)

```bash
# Deploy CRITICAL backend services that everything depends on
kubectl apply -f infrastructure/kubernetes/core-infrastructure.yaml

# Services deployed:
# - Gateway Service (Port 4000) - API routing
# - MemorAI Service (Port 3693/6367) - Agent memory
# - RomAI MCP Server (Port 8000) - AI coordination
# - Glass Service (Port 7700) - Windows automation
# - PostgreSQL, Redis, monitoring
```

### Step 2: Deploy Core Platform to Vercel (10 minutes)

```bash
# Deploy platform management apps
# - admin.codai.ro (Admin dashboard)
# - hub.codai.ro (Integration center)
# - codai.ro (Development platform)
# - id.codai.ro (Identity frontend)
```

### Step 3: Deploy Business AI Apps to Vercel (15 minutes)

```bash
# Deploy 8 primary business AI platforms
# - bancai.ro, studiai.ro, talentai.ro, stocai.ro
# - analizai.ro, ajutai.ro, conversai.ro, prezentai.ro
```

### Step 4: Configure DNS (5 minutes)

```bash
# Point infrastructure domains to cloud load balancer
# Point app domains to Vercel
# Configure SSL certificates
```

## 🎯 Benefits of This Approach

✅ **Speed**: Vercel deploys are instant, cloud services are containerized
✅ **Scalability**: Vercel handles frontend scaling, Kubernetes handles backend
✅ **Cost**: Vercel free tier for frontends, optimized cloud costs for backends
✅ **Reliability**: Best of both worlds - Vercel CDN + cloud redundancy
✅ **Development**: Perfect for team collaboration and CI/CD

This hybrid approach gets you **production-ready deployment in 30 minutes** instead of hours of EKS troubleshooting!
