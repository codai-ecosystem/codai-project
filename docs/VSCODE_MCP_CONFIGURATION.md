# VS Code MCP Configuration for CAUTAI HTTP Server

## 📋 Quick Setup Guide - Microsoft Official Format

### 1. Add MCP Server Configuration

Based on **Microsoft's official MCP documentation**, create a `.vscode/mcp.json` file with this configuration:

```json
{
  "servers": {
    "cautai-http": {
      "type": "sse",
      "url": "http://localhost:4952/sse"
    }
  }
}
```

### 2. Alternative Configuration Files

You can also use any of these file locations (VS Code will auto-discover them):

#### Option A: Workspace-specific (recommended)
- **File**: `.vscode/mcp.json`
- **Scope**: Current workspace only

#### Option B: User-global configuration  
- **File**: `%USERPROFILE%\.mcp.json` (Windows) or `~/.mcp.json` (Mac/Linux)
- **Scope**: All VS Code workspaces

#### Option C: Repository-scoped
- **File**: `.mcp.json` (in project root)
- **Scope**: Current repository (can be source controlled)

All files use the same format:
```json
{
  "servers": {
    "cautai-http": {
      "type": "sse",
      "url": "http://localhost:4952/sse"  
    }
  }
}
```
    "enabled": true,
    "autoReconnect": true
  }
}
```

## 🔧 Alternative Configuration Methods

### Method 1: VS Code Extension Settings UI
1. Open VS Code Settings (Ctrl+,)
2. Search for "MCP"
3. Add server configuration through the UI
4. Set URL to: `http://localhost:4952/sse`
5. Set transport type to: `http`

### Method 2: Command Palette Configuration
1. Open Command Palette (Ctrl+Shift+P)
2. Type "MCP: Add Server"
3. Enter server details:
   - **Name**: `cautai-http`
   - **URL**: `http://localhost:4952/sse`
   - **Transport**: `http`
   - **Headers**: `{"Accept": "text/event-stream"}`

### Method 3: Manual Settings.json Edit
Add to your user or workspace `settings.json`:

```json
{
  "github.copilot.chat.mcpServers": {
    "cautai": {
      "transport": {
        "type": "http",
        "baseUrl": "http://localhost:4952",
        "sseEndpoint": "/sse",
        "messagesEndpoint": "/messages"
      },
      "serverInfo": {
        "name": "CAUTAI Search Engine",
        "version": "1.0.0"
      }
    }
  }
}
```

## 🛠️ Available Tools

Once configured, you'll have access to these CAUTAI tools in VS Code:

### 1. `search_web`
Search the web using CAUTAI AI search engine
- **Parameters**: 
  - `query` (required): The search query
  - `maxResults` (optional): Max results (1-50, default: 10)
  - `language` (optional): Language ('en' or 'ro', default: 'en')

### 2. `compose_answer`
Compose comprehensive answers based on search results
- **Parameters**:
  - `query` (required): The question or topic
  - `maxSources` (optional): Max sources to use (1-20, default: 5)
  - `language` (optional): Answer language ('en' or 'ro', default: 'en')

## ⚡ Usage Examples

In GitHub Copilot Chat or any MCP-enabled VS Code extension:

```
@cautai search for "latest TypeScript features 2025"
@cautai compose an answer about "best practices for Docker in production"
@cautai search web query="AI development trends" maxResults=15 language="en"
```

## 🔍 Testing the Connection

### 1. Check Server Status
```bash
curl http://localhost:4952/health
```

### 2. Test SSE Endpoint
```bash
curl -H "Accept: text/event-stream" http://localhost:4952/sse
```

### 3. VS Code Tasks
Use these VS Code tasks to manage the server:
- **🔍 Start CAUTAI MCP HTTP Server (Docker)**
- **🔍 Test CAUTAI MCP HTTP Health**
- **🔍 Test CAUTAI MCP SSE Connection**

## 🐛 Troubleshooting

### Common Issues:

1. **Server not responding**:
   ```bash
   # Restart the server
   docker-compose -f docker-compose.cautai.yml restart cautai-mcp-http
   ```

2. **Connection timeout**:
   - Increase timeout in VS Code settings
   - Check firewall settings for port 4952

3. **SSE connection issues**:
   - Verify Accept header: `text/event-stream`
   - Check CORS settings allow VS Code origin

### Debug Commands:
```bash
# Check container status
docker ps | grep cautai-mcp

# View real-time logs
docker logs -f cautai-mcp-http-server

# Test endpoint directly
curl -v http://localhost:4952/sse
```

## 📊 Server Configuration

Current CAUTAI MCP HTTP Server settings:
- **Port**: 4952
- **Host**: 0.0.0.0 (accessible from localhost)
- **Transport**: HTTP with Server-Sent Events (SSE)
- **Health Check**: `/health`
- **SSE Endpoint**: `/sse`
- **Messages Endpoint**: `/messages`
- **Max Results**: 10 (configurable)
- **Default Language**: English
- **CORS**: Enabled for VS Code origins

## 🔐 Security Notes

- Server runs with non-root user in Docker
- CORS properly configured for VS Code access
- Input validation on all tool parameters
- Rate limiting and timeout protection
- Health checks and graceful shutdown support