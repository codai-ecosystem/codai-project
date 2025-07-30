# MCP Server Port Allocation Plan

## Current Port Allocations (HTTP MCP Servers)

### Production MCP Servers (Operational)
- **Glass MCP**: Port 8001 (Windows automation)
- **Memorai MCP**: Port 8002 (Memory management) 
- **Romai MCP**: Port 8003 (Romanian AI intelligence)
- **ControlAI MCP**: Port 7001 (Project management & coordination)

### Standard Port Range Policy
- **MCP HTTP Servers**: Ports 7000-8999
- **Application Services**: Ports 4000-4999 (existing CODAI services)
- **Development/Test**: Ports 3000-3999 (reserved for development)

## Planned MCP Server Port Assignments

### Tier 1 - Core Infrastructure (Ports 7000-7099)
- **ControlAI MCP**: Port 7001 ✅ (Implemented)
- **AI MCP**: Port 7002 (Core AI services)
- **BancAI MCP**: Port 7007 (Financial services)
- **ConversAI MCP**: Port 7020 (Conversation AI)
- **TalentAI MCP**: Port 7025 (HR & talent management)

### Tier 2 - Business Services (Ports 7100-7199) 
- **StocAI MCP**: Port 7105 (Inventory management)
- **CumparAI MCP**: Port 7108 (E-commerce)
- **Wallet MCP**: Port 7109 (Digital wallet)
- **MarketAI MCP**: Port 7110 (Market intelligence)
- **FabricAI MCP**: Port 7111 (Product creation)

### Tier 3 - Specialized Services (Ports 7200-7299)
- **AnalizAI MCP**: Port 7212 (Data analysis)
- **StudiAI MCP**: Port 7235 (Education)
- **SociAI MCP**: Port 7237 (Social media)
- **LegalAI MCP**: Port 7240 (Legal services)
- **MedicAI MCP**: Port 7245 (Healthcare)

### Tier 4 - Utility Services (Ports 7300-7399)
- **LogAI MCP**: Port 7304 (Logging & analytics)
- **METU MCP**: Port 7350 (Development tools)
- **Tools MCP**: Port 7370 (Development utilities)
- **Explorer MCP**: Port 7380 (File exploration)

### Reserved Ranges
- **External MCP Servers**: Ports 8000-8999 (Glass, Memorai, Romai)
- **Future Expansion**: Ports 7400-7999
- **Testing/Development**: Ports 9000-9999 (temporary servers)

## Implementation Guidelines

### Port Selection Rules
1. **No ports below 4000** (reserved for system/application services)
2. **MCP servers use 7000-8999 range**
3. **Stdio MCP servers don't require ports** (preferred for VS Code integration)
4. **HTTP MCP servers only when necessary** (web interfaces, external access)

### Configuration Standards
- All MCP servers support both stdio and HTTP modes
- HTTP mode disabled by default (security)
- Port configuration via environment variables
- Automatic port conflict detection and resolution
- Health check endpoints on all HTTP servers

### Security Considerations
- HTTP servers bind to localhost by default
- CORS configuration for web access
- Rate limiting on all HTTP endpoints
- Authentication for production deployments
- SSL/TLS support for production

## Current Status

### ✅ Implemented Servers (PRODUCTION READY)
- **AI MCP**: ✅ Stdio mode (Azure OpenAI integrated) - 8 core AI tools
- **BancAI MCP**: ✅ Stdio mode (Financial calculations) - 8 financial tools  
- **ControlAI MCP**: ✅ HTTP mode (Port 7001) + Stdio - Multi-agent coordination
- **ConversAI MCP**: ✅ Stdio mode (Conversation management) - 7 conversation tools
- **StocAI MCP**: ✅ Stdio mode (Inventory analytics) - 8 inventory tools
- **TalentAI MCP**: ✅ Stdio mode (HR & talent management) - 8 talent tools

### � Implementation Status
- **Total Core MCP Servers**: 6/6 (100% Complete)
- **Production Ready**: All 6 servers operational and tested
- **Azure OpenAI Integration**: Enterprise configuration standardized
- **Transport Mode**: stdio preferred for VS Code integration
- **Architecture**: Enterprise-grade with comprehensive logging
- **Build Status**: All servers compile successfully with TypeScript

## Port Conflict Prevention

### Existing CODAI Services (Ports 4000-4999)
- Gateway: 4000
- ID Service: 4001
- MEMORAI: 4002
- HUB: 4003
- LOGAI: 4004
- ADMIN: 4005
- CODAI: 4006
- BANCAI: 4007
- CUMPARAI: 4008
- WALLET: 4009
- MARKETAI: 4010
- FABRICAI: 4011
- ANALIZAI: 4012
- ROMAI: 4013

### Test/Development Services (Ports 3000-3999)
- Next.js dev server: 3000
- Various testing servers: 3001-3999

**Result**: MCP servers using 7000+ ports have **ZERO conflicts** with existing infrastructure.
