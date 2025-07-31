# 🚀 SERVICES OVERVIEW

_Consolidated: July 31, 2025_

This document provides an organized overview of the CODAI ecosystem services based on available configurations and documentation.

---

## 🏗️ Service Architecture

### Core Applications (`apps/`)

#### **CODAI** (`apps/codai/`)

- **Purpose**: AI Development Platform
- **Port**: 4030+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`

#### **Admin** (`apps/admin/`)

- **Purpose**: Administrative Dashboard
- **Port**: 4031+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`
- **Memory Configuration**: NODE_OPTIONS --max-old-space-size=4096

#### **Hub** (`apps/hub/`)

- **Purpose**: Collaboration Hub
- **Port**: 4032+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`
- **Memory Configuration**: NODE_OPTIONS --max-old-space-size=4096

#### **ID** (`apps/id/`)

- **Purpose**: Identity Service
- **Port**: 4033+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`
- **Memory Configuration**: NODE_OPTIONS --max-old-space-size=4096

#### **BancAI** (`apps/bancai/`)

- **Purpose**: Financial AI Services
- **Port**: 4034+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`
- **Memory Configuration**: NODE_OPTIONS --max-old-space-size=4096

#### **MemorAI** (`apps/memorai/`)

- **Purpose**: Memory Management System
- **Port**: 4035+ range
- **Technology**: Next.js, TypeScript
- **Health Endpoint**: `/api/health.ts`
- **Memory Configuration**: NODE_OPTIONS --max-old-space-size=4096

#### **ControlAI Dashboard** (`apps/controlai-dashboard/`)

- **Purpose**: Project Management Interface
- **Technology**: Next.js, React, TypeScript
- **Features**: Project orchestration and management UI

---

## 🌐 Infrastructure Services

### **Gateway** (`apps/gateway/`)

- **Purpose**: API Gateway and Service Registry
- **Port**: 4000 (primary gateway)
- **Files**:
  - `gateway-simple.js`: Simplified production gateway
  - `gateway-standalone.js`: Standalone gateway implementation
- **Features**: Service discovery, routing, health monitoring

### **Packages** (`packages/`)

Various shared packages and utilities supporting the ecosystem.

---

## 🧠 MCP (Model Context Protocol) Infrastructure

### MCP Server Configuration

- **Core MCP Servers**: 6 configured
- **External MCP Servers**: 3 additional
- **Total AI Tools**: 50+ tools available across the ecosystem
- **CBD Package**: (`packages/cbd/`) - Core business data package with MCP integration

---

## 🔧 Service Management

### Available Task Commands

Based on workspace configuration:

#### Dependency Management

- **Install Dependencies**: `pnpm install --frozen-lockfile=false`

#### Individual Service Startup

- **Gateway Service**: `node gateway-simple.js` (port 4000)
- **CODAI Service**: `pnpm dev` in apps/codai
- **Admin Service**: `pnpm dev` in apps/admin
- **Hub Service**: `pnpm dev` in apps/hub
- **ID Service**: `pnpm dev` in apps/id
- **BancAI Service**: `pnpm dev` in apps/bancai
- **MemorAI Service**: `pnpm dev` in apps/memorai
- **CBD Service**: `npm run service` in packages/cbd
- **Dashboard Dev Server**: `pnpm dev` in apps/controlai-dashboard

#### Orchestrated Startup

- **Start All Core Services**: Parallel startup of 6 core services
- **Start Primary Services**: `pnpm dev:primary --no-cache`
- **Start All Services**: CBD + Dashboard combination

---

## 🔍 Service Health Monitoring

### Health Check Infrastructure

- **Individual Health Endpoints**: Each service has `/api/health.ts`
- **Gateway Health Monitoring**: Centralized health checking
- **Service Registry**: Gateway maintains service discovery
- **Health Check Scripts**: `service-health-check.js` available

---

## 🌍 Port Allocation Strategy

### Port Range Organization

- **Gateway**: 4000 (primary entry point)
- **Applications**: 4030-4081 range
- **Services**: 4001-4066 range
- **Development**: All services avoid conflicts with 4000+ strategy

---

## 📦 Package Dependencies

### Core Technologies

- **Framework**: Next.js for web applications
- **Language**: TypeScript for type safety
- **Package Manager**: pnpm with workspace support
- **Build System**: Turbo for monorepo management

### Development Tools

- **Testing**: Jest, Vitest, Playwright
- **Code Quality**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions integration

---

## 🚀 Azure AI Integration

### AI Services Support

- **Azure AI Foundry**: Primary AI service integration
- **Azure AI Hub**: Advanced ML and open source models
- **Azure OpenAI**: Specialized OpenAI access
- **Model Access**: 1900+ AI models available
- **Deployment**: Automated scripts for Azure AI services

---

## 🔄 Development Workflow

### Local Development

- **Individual Service Development**: Each service can run independently
- **Integrated Development**: Full ecosystem startup with orchestrated commands
- **Hot Reload**: Development servers with live reload capabilities

### Testing Integration

- **Service Testing**: Individual service health validation
- **Integration Testing**: Cross-service communication testing
- **E2E Testing**: Full workflow validation

---

## 📁 Service File Structure

### Application Structure

```
apps/
├── [service-name]/
│   ├── pages/api/health.ts      # Health endpoint
│   ├── package.json             # Service dependencies
│   ├── next.config.js           # Next.js configuration
│   └── [service-specific files]
```

### Package Structure

```
packages/
├── [package-name]/
│   ├── package.json             # Package configuration
│   ├── src/                     # Source code
│   └── [package-specific files]
```

---

## 🛠️ Service Configuration

### Environment Configuration

- **Environment Templates**: Multiple .env templates available
- **Service-Specific Config**: Individual service environment settings
- **Development vs Production**: Separate configuration strategies

### Memory Configuration

Most services configured with:

- **Memory Allocation**: NODE_OPTIONS --max-old-space-size=4096
- **Performance Optimization**: High memory allocation for development

---

## 📊 Service Monitoring

### Available Monitoring

- **Health Endpoints**: Standardized health checking across services
- **Service Registry**: Gateway-based service discovery
- **Development Logging**: Console output for development monitoring

---

## ⚠️ Important Notes

### Service Status

- **Configuration Present**: All services have configuration files
- **Health Endpoints**: Standardized health checking implemented
- **Orchestration**: Task-based service management available
- **Validation Needed**: Actual operational status requires verification

### Development Environment

- **Memory Requirements**: High memory allocation configured for most services
- **Port Management**: Systematic port allocation to avoid conflicts
- **Dependency Management**: pnpm workspace configuration for unified dependency management

---

## 🎯 Next Steps

1. **Service Validation**: Verify actual operational status of each service
2. **Health Check Execution**: Run health checks to confirm service status
3. **Integration Testing**: Validate inter-service communication
4. **Performance Monitoring**: Establish runtime performance metrics

---

_This services overview is based on available configuration files and documentation. Actual service operational status should be verified independently._
