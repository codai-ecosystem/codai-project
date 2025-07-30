# 🤖 CODAI MCP Quick Reference

## Core MCP Servers (stdio transport)

| Server | Tools | Purpose |
|--------|-------|---------|
| **AI MCP** | 8 | Core AI services (completion, analysis, embeddings) |
| **BancAI MCP** | 8 | Financial calculations and banking services |
| **ControlAI MCP** | Multi | Project management and multi-agent coordination |
| **ConversAI MCP** | 7 | Conversation management with AI integration |
| **StocAI MCP** | 8 | Inventory management and analytics |
| **TalentAI MCP** | 8 | HR and talent management with AI insights |

## External MCP Servers (HTTP transport)

| Server | Port | Purpose |
|--------|------|---------|
| **Glass MCP** | 8001 | Windows automation and UI integration |
| **Memorai MCP** | 8002 | Advanced persistent memory with agent isolation |
| **Romai MCP** | 8003 | Romanian AI intelligence and market analysis |

## Quick Commands

```bash
# Build all core MCP servers
for dir in packages/ai-mcp apps/bancai/packages/bancai-mcp packages/controlai-mcp apps/conversai/packages/conversai-mcp apps/stocai/packages/stocai-mcp apps/talentai/packages/talentai-mcp; do
  cd "$dir" && npm run build && cd -
done

# Test MCP server tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node packages/ai-mcp/dist/server.js

# Start ControlAI HTTP server
cd packages/controlai-mcp && npm run start:http
```

## VS Code Integration

1. Install MCP extension in VS Code
2. Configure MCP servers in VS Code settings
3. Access tools through VS Code chat interface
4. All core servers use stdio transport (no port configuration needed)

## Documentation

- **Complete Guide**: `docs/MCP_ECOSYSTEM_COMPLETE.md`
- **Port Allocation**: `docs/MCP_PORT_ALLOCATION.md`  
- **Service Directory**: `SERVICE_DIRECTORY.md`

**Status**: ✅ All 6 core MCP servers production ready
