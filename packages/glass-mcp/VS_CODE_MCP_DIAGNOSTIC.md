# Glass MCP VS Code Diagnostic Guide

## ✅ Server Status: WORKING
The Glass MCP server is working correctly and responding with **13 tools**:

1. window_list
2. window_focus  
3. window_extract_text
4. window_extract_text_by_title
5. window_send_text
6. window_send_text_by_title
7. clipboard_get_text
8. clipboard_set_text
9. system_info
10. process_list
11. file_exists
12. file_read
13. file_write

## 🔍 VS Code MCP Configuration

### Step 1: Check VS Code MCP Settings
Open VS Code Settings (Ctrl+,) and search for "mcp". Ensure you have:

```json
{
  "mcp.servers": {
    "GlassMCP": {
      "type": "stdio",
      "command": "npx",
      "args": ["--yes", "@codai/glass-mcp@latest"]
    }
  }
}
```

### Step 2: Check VS Code Output Panel
1. Open View → Output
2. Select "MCP" from the dropdown
3. Look for connection errors or initialization failures

### Step 3: Alternative Configuration
If npx is causing issues, try using the direct node path:

```json
{
  "mcp.servers": {
    "GlassMCP": {
      "type": "stdio", 
      "command": "node",
      "args": ["C:\\Users\\%USERNAME%\\AppData\\Roaming\\npm\\node_modules\\@codai\\glass-mcp\\dist\\mcp-server.js"]
    }
  }
}
```

### Step 4: Restart VS Code Completely
1. Close all VS Code windows
2. Wait 5 seconds
3. Restart VS Code
4. Check the MCP output panel again

### Step 5: Test Local Installation
If published package fails, you can use the local version:

```json
{
  "mcp.servers": {
    "GlassMCP": {
      "type": "stdio",
      "command": "node", 
      "args": ["E:\\GitHub\\codai-project\\packages\\glass-mcp\\dist\\mcp-server.js"]
    }
  }
}
```

## 🐛 Common Issues

1. **PATH Issues**: VS Code might not find `npx` - use full node path instead
2. **npm Warnings**: The npm config warnings don't affect functionality
3. **Cache Issues**: Clear VS Code workspace cache by restarting completely
4. **Permissions**: Ensure VS Code has permission to execute the server

## ✅ Verification
The server responds correctly to MCP protocol requests with all 13 tools listed above.