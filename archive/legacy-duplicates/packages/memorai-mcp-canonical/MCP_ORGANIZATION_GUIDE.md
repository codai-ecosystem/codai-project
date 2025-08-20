# MemorAI MCP Organization Guide

## Overview
This is the **canonical MemorAI MCP server implementation** - the single source of truth for the MemorAI Model Context Protocol server.

## Package Structure
```
packages/memorai-mcp-canonical/  ← CANONICAL IMPLEMENTATION
├── package.json                 ← @codai/memorai-mcp v9.5.1+
├── src/
│   ├── server.ts               ← Main MCP server with fixed suggestions
│   └── index.ts                ← Entry point
├── dist/                       ← Compiled output
├── README.md                   ← Package documentation
└── tsconfig.json              ← TypeScript configuration
```

## Archived Implementations
Old scattered implementations have been consolidated and archived:

```
packages/archive/memorai-mcp-old-implementations/
├── cbd-mcp-server.ts          ← TypeScript CBD-based server (775 lines)
├── http-mcp-server.cjs        ← HTTP/SSE server (589 lines)
└── start-mcp-server.cjs       ← Startup script
```

## Key Changes Made

### 1. **Bug Fix Applied** ✅
- Fixed the suggestions bug where queries were returning repetitive text
- Implemented `IntelligentSuggestionGenerator` class with proper suggestion algorithms
- Version bumped to 9.5.1+ with the fix

### 2. **Structure Consolidation** ✅
- Moved from scattered implementations across `apps/memorai/` to single canonical package
- Archived old implementations to prevent confusion
- Single package now handles all MCP server functionality

### 3. **VS Code Integration** ✅
- Uses stdio transport as specified in MCP configuration
- Published to npm registry as `@codai/memorai-mcp@latest`
- Configured in VS Code MCP settings to use the published package

## Usage

### VS Code MCP Configuration
```json
{
  "memorai": {
    "command": "npx",
    "args": ["@codai/memorai-mcp@latest"],
    "transport": {
      "type": "stdio"
    }
  }
}
```

### Local Development
```bash
cd packages/memorai-mcp-canonical
npm install
npm run build
npm run dev
```

### Publishing Updates
```bash
npm version patch  # or minor/major
npm publish
```

## Architecture

### Core Components
- **MCP Server**: Implements Model Context Protocol specification
- **CBD Backend**: Code Base Database for persistent storage
- **Intelligent Suggestions**: Fixed suggestion generation system
- **Agent Isolation**: Memory separation by agent ID
- **Vector Search**: Semantic search capabilities

### Tools Provided
1. `mcp_memoraimcp_remember` - Store memories with metadata
2. `mcp_memoraimcp_recall` - Search and retrieve memories
3. `mcp_memoraimcp_forget` - Delete specific memories
4. `mcp_memoraimcp_context` - Get contextual information

## Quality Assurance

### Testing
- Unit tests for all core functionality
- Integration tests with CBD backend
- MCP protocol compliance testing
- Suggestion quality validation

### Performance
- Sub-15ms response times
- Efficient vector storage
- Optimized suggestion generation
- Proper memory management

## Maintenance

### Regular Updates
1. Monitor npm package usage and feedback
2. Apply security updates to dependencies
3. Enhance suggestion algorithms based on usage patterns
4. Maintain compatibility with MCP specification updates

### Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- Proper changelog maintenance
- Backward compatibility preservation

## Support

For issues or questions:
1. Check the package README.md
2. Review archived implementations if needed
3. Test with local development setup
4. Consult MCP specification documentation

---

**This is the definitive MemorAI MCP implementation. All other implementations are deprecated and archived.**
