# CBD Native MCP Server - ARCHIVED

**Date Archived:** July 30, 2025  
**Reason:** Consolidating to use MemorAI MCP Server (@codai/memorai-mcp) as the primary MCP implementation.  
**Original Location:** packages/cbd/src/mcp/

## What was archived?

The CBD native MCP server provided:
- Direct CBD engine integration
- Vector search operations  
- Memory storage operations
- Health monitoring tools
- Server statistics

## Why was it archived?

To avoid confusion and duplication, we chose to use the MemorAI MCP server as the primary implementation because:
1. It provides the correct tool names expected by VS Code MCP
2. It has comprehensive memory operations (remember, recall, forget, context)
3. It's already published as a package (@codai/memorai-mcp)
4. It provides a higher-level interface for memory management

## Migration

If any CBD-specific MCP functionality is needed, it can be integrated into the MemorAI MCP server.

## Files Archived

- server.ts - Main CBD MCP Server implementation
- config.ts - Configuration management
- types.ts - TypeScript type definitions
- tools/ - MCP tool implementations
- cli.ts - Command line interface
- index.ts - Main entry point

## Key Features That Were Available

- **Direct CBD Integration**: Native integration with CBD memory engine
- **Vector Operations**: Similarity search and vector storage
- **Memory Management**: Store, search, and retrieve memories
- **Health Monitoring**: Server health checks and statistics
- **Performance Metrics**: Detailed performance monitoring

## Alternative Access

All CBD functionality is still available through:
- The @codai/cbd package directly
- The MemorAI MCP server which uses CBD as its backend
- Direct CBD API usage in applications
