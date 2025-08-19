# 🌐 CODAI Ecosystem - Corrected Domain Strategy

## 🔍 Architecture Analysis

After analyzing the codebase, here's the **CORRECT** deployment architecture:

---

## 🔧 **BACKEND API SERVERS** → Deploy to Cloud/Kubernetes

These are **pure backend services** that need cloud infrastructure:

### Core Infrastructure Services

1. **Gateway Service** (`apps/gateway/`)
   - **Type**: Express.js API Gateway (Port 4000)
   - **Domain**: `api.codai.ro`
   - **Purpose**: Central API routing for entire ecosystem
   - **Technology**: Node.js + Express + TypeScript

2. **MemorAI Backend** (`packages/memorai/` - backend parts)
   - **Type**: Node.js API Server (Port 3693/6367)
   - **Domain**: `api.memorai.ro`
   - **Purpose**: Memory service backend + MCP protocol server
   - **Technology**: Node.js + TypeScript + MCP Protocol

3. **RomAI API Server** (`apps/romai/apps/api/`)
   - **Type**: Node.js REST API Server (Port 8000)
   - **Domain**: `api.romai.ro` or `api.romcp.ro`
   - **Purpose**: Romanian AI backend API
   - **Technology**: Node.js + TypeScript + Express

4. **RomAI MCP Server** (`apps/romai/apps/mcp-server/`)
   - **Type**: MCP Protocol Server (Port 3001)
   - **Domain**: `mcp.romai.ro` or `mcp.romcp.ro`
   - **Purpose**: Model Context Protocol server for AI agents
   - **Technology**: Node.js + TypeScript + MCP Protocol

5. **Glass MCP Server** (`apps/glass/packages/mcp/`)
   - **Type**: HTTP/WebSocket MCP Server (Port 8001)
   - **Domain**: `glass.codai.ro` or `mcp.glass.codai.ro`
   - **Purpose**: Windows automation + MCP protocol server
   - **Technology**: Node.js + TypeScript + WebSocket

---

## 🌐 **FRONTEND NEXT.JS APPS** → Deploy to Vercel

These are **Next.js applications** with API routes that should go to Vercel:

### Core Platform Apps

1. **CODAI Platform** (`apps/codai/`)
   - **Type**: Next.js 15 App (Port 4006)
   - **Domain**: `codai.ro`
   - **Purpose**: Main AI development platform
   - **API Routes**: Yes (Next.js API routes)

2. **Admin Dashboard** (`apps/admin/`)
   - **Type**: Next.js 15 App (Port 4005)
   - **Domain**: `admin.codai.ro`
   - **Purpose**: Administrative dashboard
   - **API Routes**: Yes (Next.js API routes)

3. **Hub Service** (`apps/hub/`) OR **Hub Simple** (`apps/hub-simple/`)
   - **Type**: Next.js 15 App (Port 4003)
   - **Domain**: `hub.codai.ro`
   - **Purpose**: Integration center and workflow orchestration
   - **API Routes**: Yes (Next.js API routes)

4. **ID Service** (`apps/id/`) OR **ID Simple** (`apps/id-simple/`)
   - **Type**: Next.js App (Port 4001)
   - **Domain**: `id.codai.ro`
   - **Purpose**: Identity management frontend
   - **API Routes**: Yes (Next.js API routes for auth frontend)

### Memory & AI Platform Apps

5. **MemorAI Frontend** (`apps/memorai/`)
   - **Type**: Next.js 15 App (Port 4006)
   - **Domain**: `memorai.ro`
   - **Purpose**: Memory platform UI and dashboard
   - **API Routes**: Yes (communicates with backend API)

6. **RomAI Dashboard** (`apps/romai/` - main Next.js app)
   - **Type**: Next.js 15 App (Port 6100)
   - **Domain**: `romai.ro` or `romcp.ro`
   - **Purpose**: Romanian AI platform dashboard
   - **API Routes**: Yes (communicates with API server)

7. **Glass Dashboard** (`apps/glass/` - main Next.js app)
   - **Type**: Next.js 15 App (Port 4600)
   - **Domain**: `glass.codai.ro`
   - **Purpose**: Windows automation dashboard
   - **API Routes**: Yes (communicates with MCP server)

### Business AI Apps (All Next.js)

8. **BancAI** (`apps/bancai/`) → `bancai.ro`
9. **StudiAI** (`apps/studiai/`) → `studiai.ro`
10. **TalentAI** (`apps/talentai/`) → `talentai.ro`
11. **StocAI** (`apps/stocai/`) → `stocai.ro`
12. **AnalizAI** (`apps/analizai/`) → `analizai.ro`
13. **AjutAI** (`apps/ajutai/`) → `ajutai.ro`
14. **ConversAI** (`apps/conversai/`) → `conversai.ro`
15. **PrezentAI** (`apps/prezentai/`) → `prezentai.ro`
    ... and 15+ more AI business apps

---

## 📊 **DOCS SUBDOMAINS** Strategy

For documentation, you should also consider:

### Option 1: Separate Docs Apps (Recommended)

- `docs.codai.ro` → Dedicated docs site (Docusaurus/GitBook)
- `docs.memorai.ro` → MemorAI documentation
- `docs.romai.ro` → RomAI documentation
- `api-docs.codai.ro` → API documentation (Swagger UI)

### Option 2: Integrated Docs (Alternative)

- Include docs as `/docs` routes in main apps
- `codai.ro/docs`, `memorai.ro/docs`, etc.

---

## 🎯 **CORRECTED DEPLOYMENT PLAN**

### Phase 1: Core Infrastructure to Cloud (Kubernetes/EKS)

```yaml
Backend Services to Deploy:
  - api.codai.ro → Gateway Service (Port 4000)
  - api.memorai.ro → MemorAI Backend (Port 3693/6367)
  - api.romai.ro → RomAI API Server (Port 8000)
  - mcp.romai.ro → RomAI MCP Server (Port 3001)
  - glass.codai.ro → Glass MCP Server (Port 8001)
```

### Phase 2: Frontend Apps to Vercel

```yaml
Next.js Apps to Deploy:
  - codai.ro → CODAI Platform
  - admin.codai.ro → Admin Dashboard
  - hub.codai.ro → Hub Service
  - id.codai.ro → ID Service
  - memorai.ro → MemorAI Frontend
  - romai.ro → RomAI Dashboard
  - glass.codai.ro → Glass Dashboard (or separate domain)
```

### Phase 3: Business AI Apps to Vercel

```yaml
Business Apps:
  - bancai.ro, studiai.ro, talentai.ro, stocai.ro
  - analizai.ro, ajutai.ro, conversai.ro, prezentai.ro
  - Plus 15+ more specialized AI business apps
```

---

## 🔄 **API Communication Flow**

### Correct Architecture:

```
Next.js Frontend Apps (Vercel)
        ↓ API calls
Backend API Servers (Cloud)
        ↓ Data & MCP
Database & Services (Cloud)
```

### Example Communication:

- `memorai.ro` (Vercel) → calls → `api.memorai.ro` (Cloud)
- `romai.ro` (Vercel) → calls → `api.romai.ro` (Cloud)
- All frontends → calls → `api.codai.ro` (Gateway)

---

## ✅ **Why This Architecture Makes Sense**

1. **Backend APIs**: Need persistent connections, databases, file systems → Cloud
2. **Frontend Apps**: Static/SSR with edge functions → Vercel
3. **MCP Servers**: Need persistent WebSocket connections → Cloud
4. **Business Logic**: Separated cleanly between frontend UI and backend APIs
5. **Scalability**: Frontend scales on CDN, backend scales on infrastructure

This separation allows you to:

- Deploy frontends instantly on Vercel
- Scale backend APIs independently on cloud infrastructure
- Use the best platform for each type of service
- Maintain clear API boundaries

**The key insight**: `api.*` subdomains are for backend servers, main domains are for frontend apps!
