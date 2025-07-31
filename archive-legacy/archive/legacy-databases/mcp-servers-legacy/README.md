# Legacy MCP Servers Archive

This directory contains the legacy MCP server implementations that were replaced with the unified CBD-based server.

## Archived Files:
- `enterprise-mcp-server.js` - Enterprise CND integration server
- `enhanced-mcp-server.js` - Enhanced features server  
- `production-mcp-server.js` - Production-ready server implementation

## Reason for Archival:
These servers created fragmentation and conflicts in the MemorAI system, causing the MCP to return 0 memories. The new unified `cbd-mcp-server.ts` replaces all of these implementations with a single, consistent CBD-based backend.

## Archive Date:
July 30, 2025

## Migration Path:
All functionality from these servers has been consolidated into the single CBD MCP server implementation.
