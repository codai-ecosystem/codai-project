# CODAI Ecosystem Services Overview

## Service Architecture Categories

### 🔧 Backend Services
**These are core API services, databases, and infrastructure components:**

1. **Gateway Service** (`apps/gateway`) - Port varies
   - **Type**: API Gateway using Express.js
   - **Purpose**: Centralized routing and management for all CODAI services
   - **Tech Stack**: TypeScript, Express, HTTP Proxy Middleware
   - **Task**: `Backend: Start Gateway Service`

2. **CBD Database** (`packages/cbd`) - Port 4180
   - **Type**: Vector database service
   - **Purpose**: High-Performance Vector Memory System with HPKV architecture
   - **Tech Stack**: TypeScript, Express, Vector operations, MCP server
   - **Task**: `Backend: Start CBD Database`

---

### 🌐 Frontend Applications
**These are Next.js applications serving user interfaces:**

1. **CODAI App** (`apps/codai`) - Port 4001
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: Main AI development environment
   - **Task**: `Frontend: Start CODAI App (4001)`

2. **Admin Dashboard** (`apps/admin`) - Port 4007 (dev), 4002 (prod)
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: Administrative interface for CODAI ecosystem
   - **Task**: `Frontend: Start Admin Dashboard (4007)`

3. **Hub App** (`apps/hub`) - Port 4008 (dev), 4003 (prod)
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: Central hub for user interactions
   - **Task**: `Frontend: Start Hub App (4008)`

4. **BancAI App** (`apps/bancai`) - Port 4005
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: AI-powered banking platform with Stripe integration
   - **Task**: `Frontend: Start BancAI App (4005)`

5. **MemorAI App** (`apps/memorai`) - Port 4006
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: AI-powered memory and knowledge management
   - **Task**: `Frontend: Start MemorAI App (4006)`

6. **ID Service** (`apps/id`) - Port 4004
   - **Type**: Next.js 15.4.5 application
   - **Purpose**: Identity and authentication service
   - **Task**: `Frontend: Start ID Service (4004)`

7. **ControlAI Dashboard** (`apps/controlai-dashboard`) - Port 4200
   - **Type**: Next.js 15.1.0 application
   - **Purpose**: Real-time dashboard for ControlAI MCP project management
   - **Task**: `Frontend: Start ControlAI Dashboard (4200)`

---

## 🚀 VS Code Task Organization

### Main Coordination Tasks:
- **📦 Install Dependencies** - Install all workspace dependencies
- **🚀 Start All Core Services** - Start gateway and database backend services
- **🌐 Start All Frontend Apps** - Start all Next.js applications in parallel
- **🔥 Start All Services (Full Stack)** - Start everything (backend + frontend)

### Individual Service Tasks:
All services now have properly named tasks with clear categorization:
- **Backend:** prefix for API services and databases
- **Frontend:** prefix for Next.js applications with port numbers

### Testing & Quality Tasks:
- **🔧 Build:** tasks for production builds
- **🧪 Test:** tasks for running test suites
- **🎭 Test: E2E** tasks for end-to-end testing
- **✨ Lint & Format:** tasks for code quality
- **🔍 Test:** tasks for API endpoint testing

---

## 🔧 Technical Details

### Common Technologies:
- **Package Manager**: pnpm with workspace configuration
- **TypeScript**: v5.8.3+ across all services
- **Next.js**: v15.4.5 for frontend applications
- **React**: v19.1.0 for UI components
- **Node.js**: v24.1.0 runtime environment

### Memory Optimization:
All frontend services use `NODE_OPTIONS: --max-old-space-size=4096` for:
- Large TypeScript compilation
- Next.js build processes
- React development server stability

### Development Workflow:
1. **Start Backend Services**: Use `🚀 Start All Core Services` first
2. **Start Frontend Apps**: Use `🌐 Start All Frontend Apps` for UI development
3. **Full Stack Development**: Use `🔥 Start All Services (Full Stack)` for complete environment
4. **Individual Services**: Use specific tasks for focused development

---

## 📊 Port Allocation

| Service | Development Port | Production Port | Category |
|---------|------------------|-----------------|----------|
| CODAI App | 4001 | 4001 | Frontend |
| Admin Dashboard | 4007 | 4002 | Frontend |
| Hub App | 4008 | 4003 | Frontend |
| ID Service | 4004 | 4004 | Frontend |
| BancAI App | 4005 | 4005 | Frontend |
| MemorAI App | 4006 | 4006 | Frontend |
| ControlAI Dashboard | 4200 | 4200 | Frontend |
| CBD Database | 4180 | 4180 | Backend |
| Gateway Service | TBD | TBD | Backend |

---

## ✅ Task Configuration Status

**COMPLETED FIXES:**
- ✅ Categorized services as Frontend vs Backend
- ✅ Renamed tasks with clear prefixes and port numbers
- ✅ Added emoji icons for better visual organization
- ✅ Fixed coordination tasks with proper dependencies
- ✅ Maintained all existing functionality
- ✅ Added proper presentation settings for better UX
- ✅ Included problem matchers for background process monitoring
- ✅ Organized test tasks with clear naming

**READY FOR USE:**
All VS Code tasks are now properly configured and ready for development workflow.
