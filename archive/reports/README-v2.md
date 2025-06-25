# Codai Project - Ecosystem Orchestration Platform v2.0

The **Codai Project** is a next-generation orchestration platform that enables seamless development and coordination of AI-native services across the entire Codai ecosystem. Built with a hybrid architecture that supports both individual service development and coordinated ecosystem management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git with submodule support

### Setup

```bash
# Clone the orchestration platform
git clone https://github.com/codai-ecosystem/codai-project.git
cd codai-project

# Install dependencies
pnpm install

# Setup services (migrates from v1.0 if needed)
npm run setup

# Check ecosystem status
npm run status

# Start development services
npm run dev
```

## 🏗️ Architecture

### Hybrid Development Model

**Individual Service Development:**

```bash
# Work on a single service independently
git clone https://github.com/codai-ecosystem/codai.git
cd codai && npm install && npm run dev
```

**Coordinated Ecosystem Development:**

```bash
# Work on multiple services with coordination
cd codai-project
npm run dev --all  # Start all services
npm run dev --priority 1  # Start priority 1 services only
```

### Service Structure

```
codai-project/              # Orchestration platform
├── services/               # Individual services (git submodules)
│   ├── codai/             # Central Platform & AIDE Hub
│   ├── memorai/           # AI Memory & Database Core
│   ├── logai/             # Identity & Authentication Hub
│   ├── bancai/            # Financial Platform
│   ├── fabricai/          # AI Services Platform
│   ├── studiai/           # AI Education Platform
│   ├── sociai/            # AI Social Platform
│   ├── cumparai/          # AI Shopping Platform
│   ├── publicai/          # Civic AI & Transparency Tools
│   ├── wallet/            # Programmable Wallet
│   └── x/                 # AI Trading Platform
├── packages/              # Shared packages (@codai/* on NPM)
├── tools/                 # Development and deployment tools
└── scripts/               # Orchestration and automation scripts
```

## 📋 Available Commands

### Development

```bash
npm run dev              # Start priority 1 services (codai, memorai, logai)
npm run dev --all        # Start all available services
npm run dev --priority 2 # Start specific priority level
npm run dev --services codai,memorai  # Start specific services
```

### Management

```bash
npm run status           # Show comprehensive ecosystem status
npm run setup            # Initialize/migrate services architecture
npm run sync             # Sync all git submodules
npm run list             # List all available services
```

### Building & Testing

```bash
npm run build            # Intelligent build orchestration
npm run build:all        # Build all services
npm run test             # Smart test execution
npm run test:all         # Test all services
```

## 🎯 Service Priorities

**Priority 1 (Foundation):**

- `codai` - Central Platform & AIDE Hub (port 3000)
- `memorai` - AI Memory & Database Core (port 3001)
- `logai` - Identity & Authentication Hub (port 3002)

**Priority 2 (Business):**

- `bancai` - Financial Platform (port 3003)
- `wallet` - Programmable Wallet (port 3004)
- `fabricai` - AI Services Platform (port 3005)

**Priority 3 (Market):**

- `studiai` - AI Education Platform (port 3006)
- `sociai` - AI Social Platform (port 3007)
- `cumparai` - AI Shopping Platform (port 3008)

**Priority 4 (Specialized):**

- `publicai` - Civic AI & Transparency Tools (port 3009)
- `x` - AI Trading Platform (port 3010)

## 🔄 Development Workflows

### Individual Service Development

Perfect for focused development on a single service:

```bash
# Clone specific service
git clone https://github.com/codai-ecosystem/[service-name].git
cd [service-name]

# Standard development
npm install
npm run dev
npm run test
npm run build

# Deploy independently
npm run deploy
```

**Benefits:**

- ✅ Full autonomy and speed
- ✅ Independent CI/CD pipelines
- ✅ Service-specific tooling
- ✅ Clear ownership boundaries

### Coordinated Ecosystem Development

Ideal for cross-service features and integration:

```bash
# Use orchestration platform
cd codai-project

# Start related services
npm run dev --services codai,memorai,logai

# Run integration tests
npm run test:integration

# Coordinate releases
npm run release:coordinated
```

**Benefits:**

- ✅ Cross-service coordination
- ✅ Integration testing
- ✅ Centralized monitoring
- ✅ Orchestrated deployments

## 🛠️ Migration from v1.0

If you have an existing v1.0 setup with `apps/` directory:

```bash
# The setup script will automatically detect and migrate
npm run setup

# This will:
# 1. Backup existing apps/ to apps-backup/
# 2. Convert git subtrees to git submodules
# 3. Move services to services/ directory
# 4. Update all configurations
# 5. Preserve all your existing work
```

## 📊 Ecosystem Status

Check the health and status of your ecosystem:

```bash
npm run status
```

This provides:

- 📦 Repository and git status
- 🔗 Git submodule status
- 🏗️ Service availability by priority
- 📊 Architecture version and completion percentage
- 🛠️ Available development commands

## 🤝 Development Modes

### Mode 1: Individual Service Focus

- Clone specific service repository
- Full development autonomy
- Independent deployment cycles
- Service-specific teams

### Mode 2: Ecosystem Coordination

- Use codai-project platform
- Cross-service development
- Coordinated integration testing
- Orchestrated releases

### Mode 3: Hybrid Development

- Mix of both approaches
- Switch contexts as needed
- Optimal for different development phases
- Maximum flexibility

## 🔧 Advanced Configuration

### Custom Service Configuration

Create `ecosystem.config.json` for custom settings:

```json
{
  "services": {
    "codai": {
      "port": 3000,
      "env": "development",
      "autoStart": true
    }
  },
  "development": {
    "defaultPriority": 1,
    "parallelStart": true,
    "watchMode": true
  }
}
```

### Environment Variables

```bash
# Development mode
NODE_ENV=development

# Service-specific ports (auto-assigned by default)
CODAI_PORT=3000
MEMORAI_PORT=3001

# Coordination settings
ORCHESTRATOR_MODE=hybrid
SERVICE_DISCOVERY=enabled
```

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture overview
- [Development Guide](./docs/development.md) - Development best practices
- [API Documentation](./docs/api.md) - Service API specifications
- [Deployment Guide](./docs/deployment.md) - Production deployment

## 🤝 Contributing

1. Choose your development mode (individual service or coordinated)
2. Follow the development workflow for your chosen mode
3. Ensure all tests pass: `npm run test`
4. Submit pull requests to individual service repositories
5. Use coordination platform for cross-service changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Codai Ecosystem** - Building the future of AI-native development, one service at a time. 🚀
