# Codai Ecosystem Port Assignments

> **Last Updated**: June 24, 2025  
> **Total Services**: 40 (11 apps + 29 services)  
> **Port Range**: 4000-4028

## Quick Reference

### Core Applications (Priority 1-3)

```
4000 - apps/codai          # Central Platform & AIDE Hub (Priority 1)
4001 - apps/memorai        # AI Memory & Database Core (Priority 1)
     └── 4011 - memorai/dashboard  # MemorAI Web Dashboard
     └── 4012 - memorai/api       # MemorAI REST API
4002 - apps/logai          # Identity & Authentication (Priority 1)
4003 - apps/bancai         # Financial Platform (Priority 2)
4004 - apps/wallet         # Programmable Wallet (Priority 2)
4005 - apps/fabricai       # AI Services Platform (Priority 2)
4006 - apps/x              # AI Trading Platform (Priority 2)
4007 - apps/studiai        # AI Education Platform (Priority 3)
4008 - apps/sociai         # AI Social Platform (Priority 3)
4009 - apps/cumparai       # AI Shopping Platform (Priority 3)
4010 - apps/publicai       # Public AI Services
```

### Extended Services (Alphabetical)

```
4011 - services/admin      # Admin Panel & Management
4012 - services/AIDE       # AI Development Environment
4013 - services/ajutai     # AI Support & Help Platform
4014 - services/analizai   # AI Analytics Platform
4015 - services/dash       # Analytics Dashboard
4016 - services/docs       # Documentation Platform
4017 - services/explorer   # AI Blockchain Explorer
4018 - services/hub        # Central Hub & Dashboard
4019 - services/id         # Identity Management System
4020 - services/jucai      # AI Gaming Platform
4021 - services/kodex      # Code Repository & Version Control
4022 - services/legalizai  # AI Legal Services Platform
4023 - services/marketai   # AI Marketing Platform
4024 - services/metu       # AI Metrics & Analytics
4025 - services/mod        # Modding & Extension Platform
4026 - services/stocai     # AI Stock Trading Platform
4027 - services/templates  # Shared Templates & Boilerplates
4028 - services/tools      # Development Tools & Utilities
```

## Development URLs

### Priority 1 Services (Foundation)

- **Codai Platform**: http://localhost:4000
- **MemorAI Core**: http://localhost:4001 (Turborepo with sub-services)
  - Dashboard: http://localhost:4011 (Next.js)
  - API: http://localhost:4012 (Express)
  - Demo: http://localhost:4013 (Reserved)
- **LogAI Auth**: http://localhost:4002

### Priority 2 Services (Business Logic)

- **BancAI Finance**: http://localhost:4003
- **Wallet**: http://localhost:4004
- **FabricAI Services**: http://localhost:4005
- **X Trading**: http://localhost:4006

### Priority 3 Services (Specialized)

- **StudiAI Education**: http://localhost:4007
- **SociAI Social**: http://localhost:4008
- **CumparAI Shopping**: http://localhost:4009
- **PublicAI Services**: http://localhost:4010

### Extended Services

- **Admin Panel**: http://localhost:4011
- **AIDE Environment**: http://localhost:4012
- **AjutAI Support**: http://localhost:4013
- **AnalyzAI Analytics**: http://localhost:4014
- **Dashboard**: http://localhost:4015
- **Documentation**: http://localhost:4016
- **Explorer**: http://localhost:4017
- **Hub**: http://localhost:4018
- **Identity**: http://localhost:4019
- **JucAI Gaming**: http://localhost:4020
- **Kodex Repository**: http://localhost:4021
- **LegalizAI Legal**: http://localhost:4022
- **MarketAI Marketing**: http://localhost:4023
- **Metu Metrics**: http://localhost:4024
- **Mod Platform**: http://localhost:4025
- **StocAI Stock**: http://localhost:4026
- **Templates**: http://localhost:4027
- **Tools**: http://localhost:4028

## Usage Instructions

### Starting Individual Services

```bash
# Start a specific app
cd apps/codai && pnpm dev    # Runs on :4000

# Start a specific service
cd services/dash && pnpm dev # Runs on :4015
```

### Starting Multiple Services

```bash
# Start all priority 1 services
pnpm dev --filter="./apps/codai" --filter="./apps/memorai" --filter="./apps/logai"

# Start all services (requires sufficient system resources)
pnpm dev
```

### Browser Testing

Browser tests are configured to access the correct ports automatically. The test suite includes:

- **Foundation Tests**: Access apps/codai on port 4000
- **Authentication Tests**: Access apps/logai on port 4002
- **Memory Tests**: Access apps/memorai on port 4001

## For New Projects

When integrating new services into the Codai ecosystem:

1. **Check PORT_ASSIGNMENTS.json** for the next available port (4029+)
2. **Update your package.json**:
   ```json
   {
     "scripts": {
       "dev": "next dev -p YOUR_ASSIGNED_PORT"
     }
   }
   ```
3. **Document your service** in this file
4. **Update browser tests** if web-based
5. **Run the port assignment script** to validate

## Port Conflict Resolution

If you encounter port conflicts:

1. Check if another service is running: `netstat -ano | findstr :4000`
2. Stop conflicting services: `pnpm dev --filter="!./conflicting-service"`
3. Use individual service startup for debugging
4. Verify PORT_ASSIGNMENTS.json matches your package.json

## System Requirements

- **Development**: Each service uses ~100-200MB RAM
- **Parallel Development**: 4-8GB RAM recommended for 5+ services
- **Full Ecosystem**: 16GB+ RAM recommended for all 29 services
- **Port Range**: Ensure ports 4000-4028+ are available

---

**Note**: Some services may have duplicate names in both `apps/` and `services/` directories. This is intentional for the hybrid architecture where apps contain core business logic and services provide extended functionality.
