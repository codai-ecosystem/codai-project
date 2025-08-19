# MemorAI App MCP Files - ARCHIVED

**Date Archived:** July 30, 2025  
**Files Archived:** 7 files
**Reason:** Consolidating to use published @codai/memorai-mcp package only

## Archived Files

These files were duplicate MCP server implementations within the MemorAI app:
- cbd-mcp-server.ts - CBD-based MCP server implementation
- enhanced-mcp-server.js - Enhanced MCP server with extra features
- enterprise-mcp-server.js - Enterprise MCP server with CND integration
- production-mcp-server.js - Production MCP server implementation
- production-mcp-package.json - Production package configuration
- test-cbd-mcp.ts - CBD MCP server test suite
- mcp-test-config.json - MCP test configuration

## Migration

The MemorAI app now uses the published @codai/memorai-mcp package exclusively.
All MCP functionality is provided through that package.

If any app-specific MCP functionality is needed, it should be added to the 
@codai/memorai-mcp package instead of creating duplicate implementations.

## Why These Were Archived

1. **Duplication**: These files duplicated functionality already available in @codai/memorai-mcp
2. **Confusion**: Multiple MCP server implementations caused confusion
3. **Maintenance**: Single package is easier to maintain and publish
4. **Standardization**: Using published packages ensures consistency across projects

## Accessing Archived Functionality

If any of these implementations contained unique features:
1. Review the archived files in this directory
2. Extract the needed functionality
3. Add it to the @codai/memorai-mcp package
4. Publish a new version of the package
5. Update projects to use the new package version
