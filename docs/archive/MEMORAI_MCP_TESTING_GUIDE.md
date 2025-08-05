# MemoraiMCP Tool Testing Guide

## Testing the MemoraiMCP Tools

The MemoraiMCP server is properly initialized and shows 27 tools. However, there may be issues with tool invocation. Here's how to test and debug:

### 1. Server Status ✅

- Server starts successfully (version 9.4.10)
- 27 tools discovered correctly
- 7 memories loaded from storage
- Data path correctly set to: E:\GitHub\codai-project\data\memorai

### 2. Configuration Fixed ✅

- Updated .env path to correct workspace
- Added debugging environment variables
- Enhanced MCP configuration with proper logging

### 3. Tool Names Analysis

The server provides tools with standard names:

- `remember` (not `mcp_memoraimcp_remember`)
- `recall` (not `mcp_memoraimcp_recall`)
- `forget` (not `mcp_memoraimcp_forget`)
- etc.

VS Code may be auto-prefixing tool names with `mcp_memoraimcp_` when calling them.

### 4. Testing Steps

#### Option 1: Use standard tool names

Try calling tools with their actual names:

```
- remember
- recall
- forget
- context
```

#### Option 2: Test with the MCP Inspector

You can test the server directly using the MCP Inspector tool.

### 5. Next Steps

1. **Restart VS Code** completely to reload the MCP configuration
2. **Check VS Code Output Panel** > Model Context Protocol for detailed logs
3. **Try calling tools with simple names** (without prefixes)
4. **Enable VS Code Developer Tools** to see exact tool calls being made

### 6. Common Issues and Solutions

**Issue**: Tools not responding
**Solution**: Check if VS Code is using prefixed tool names vs actual tool names

**Issue**: Authentication errors  
**Solution**: Verify .env file has correct Azure OpenAI credentials

**Issue**: Path errors
**Solution**: Ensure data directory exists and has proper permissions

### 7. Manual Testing

You can test individual tools by trying to call them in VS Code chat:

- Start with a simple recall query
- Try storing a memory with remember
- Test context retrieval

### 8. Debugging Commands

If issues persist, check:

```powershell
# Check package installation
npm list @codai/memorai-mcp

# Test server manually
$env:DOTENV_CONFIG_PATH = "E:\GitHub\codai-project\.env"
npx @codai/memorai-mcp@latest

# Check data directory
Get-ChildItem "E:\GitHub\codai-project\data\memorai"
```

The server initialization shows everything is working correctly at the protocol level. Any remaining issues are likely related to tool name mapping between VS Code and the MCP server.
