# 🔌 ROMAI MCP Integration Guide

Model Context Protocol integration for ROMAI Central Intelligence System.

## Overview

ROMAI provides a complete MCP (Model Context Protocol) server implementation that allows seamless integration with Claude Desktop, Cline, and other MCP-compatible applications.

## Features

- **5 Specialized Tools** for Romanian AI assistance
- **JSON-RPC 2.0 Protocol** compliance
- **Real-time Communication** via stdio transport
- **Romanian Language Optimization** 
- **Cultural Context Awareness**

## Available MCP Tools

### 1. `romai_intelligence`
General intelligence and problem-solving capabilities.

**Description**: Handles general questions and provides intelligent responses with Romanian context.

**Parameters**:
- `query` (string, required): The question or problem to solve
- `language` (string, optional): Response language ("ro" or "en", default: "ro")
- `domain` (string, optional): Specific domain for context

**Example**:
```json
{
  "query": "Care sunt avantajele inteligenței artificiale în educație?",
  "language": "ro",
  "domain": "education"
}
```

### 2. `romai_romanian_expert`
Specialized Romanian cultural and contextual expertise.

**Description**: Provides deep insights into Romanian culture, history, language, and traditions.

**Parameters**:
- `query` (string, required): Question about Romanian culture/context
- `category` (string, optional): Specific category like "culture", "history", "language", "food", "traditions"

**Example**:
```json
{
  "query": "Explică-mi semnificația sărbătorii de Dragobete",
  "category": "traditions"
}
```

### 3. `romai_problem_solver`
Step-by-step problem analysis and solution.

**Description**: Breaks down complex problems into manageable steps with detailed solutions.

**Parameters**:
- `problem` (string, required): The problem to analyze and solve
- `context` (string, optional): Additional context about the problem
- `approach` (string, optional): Preferred solving approach

**Example**:
```json
{
  "problem": "Cum pot optimiza performanța unei aplicații web React?",
  "context": "Aplicația are probleme de încărcare lentă",
  "approach": "step-by-step"
}
```

### 4. `romai_code_assistant`
Romanian-first coding assistance and code review.

**Description**: Provides code help, reviews, and programming guidance with Romanian explanations.

**Parameters**:
- `code` (string, optional): Code to analyze or improve
- `question` (string, required): Programming question or request
- `language` (string, optional): Programming language
- `explanation_language` (string, optional): Language for explanations

**Example**:
```json
{
  "question": "Cum pot implementa autentificare JWT în Node.js?",
  "language": "javascript",
  "explanation_language": "ro"
}
```

### 5. `romai_health_check`
System health monitoring and diagnostics.

**Description**: Checks ROMAI system health and provides diagnostic information.

**Parameters**: None required

**Example**:
```json
{}
```

## MCP Server Configuration

### Installation

1. **Clone and build ROMAI**:
```bash
git clone https://github.com/codai/romai.git
cd romai
pnpm install
pnpm build
```

2. **Start MCP server**:
```bash
cd apps/mcp-server
pnpm start
```

### Claude Desktop Integration

Add ROMAI to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "romai": {
      "command": "node",
      "args": ["C:/path/to/romai/apps/mcp-server/dist/server.js"],
      "env": {
        "AZURE_OPENAI_API_KEY": "your-api-key",
        "AZURE_OPENAI_ENDPOINT": "https://your-endpoint.openai.azure.com/",
        "AZURE_OPENAI_DEPLOYMENT_NAME": "gpt-4o"
      }
    }
  }
}
```

### Cline Integration

Configure ROMAI in your Cline MCP settings:

```json
{
  "mcpServers": {
    "romai": {
      "command": "node",
      "args": ["./apps/mcp-server/dist/server.js"],
      "cwd": "/path/to/romai",
      "env": {
        "AZURE_OPENAI_API_KEY": "your-api-key",
        "AZURE_OPENAI_ENDPOINT": "https://your-endpoint.openai.azure.com/"
      }
    }
  }
}
```

### VS Code MCP Extension

If using an MCP extension in VS Code:

```json
{
  "mcp.servers": [
    {
      "name": "romai",
      "command": "node",
      "args": ["./apps/mcp-server/dist/server.js"],
      "cwd": "${workspaceFolder}/romai",
      "env": {
        "AZURE_OPENAI_API_KEY": "${env:AZURE_OPENAI_API_KEY}"
      }
    }
  ]
}
```

## Usage Examples

### Using with Claude Desktop

Once configured, you can use ROMAI tools directly in Claude Desktop:

```
Could you use the romai_romanian_expert tool to explain the significance of "Mărțișor" in Romanian culture?
```

Claude will automatically call:
```json
{
  "tool": "romai_romanian_expert",
  "parameters": {
    "query": "Explain the significance of Mărțișor in Romanian culture",
    "category": "traditions"
  }
}
```

### Programming Assistance

```
Can you use romai_code_assistant to help me implement a REST API in Romanian with comments?
```

```json
{
  "tool": "romai_code_assistant",
  "parameters": {
    "question": "How to implement a REST API with Romanian comments?",
    "language": "javascript",
    "explanation_language": "ro"
  }
}
```

### Problem Solving

```
Use romai_problem_solver to help me plan a Romanian cultural event.
```

```json
{
  "tool": "romai_problem_solver",
  "parameters": {
    "problem": "Plan a Romanian cultural event",
    "context": "Need to organize an event showcasing Romanian traditions",
    "approach": "comprehensive"
  }
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Azure OpenAI (Required)
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Optional Configuration
ROMAI_MCP_PORT=3001
ROMAI_LOG_LEVEL=info
NODE_ENV=production
```

### Docker Configuration

Run ROMAI MCP server in Docker:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY apps/mcp-server/package.json ./
COPY apps/mcp-server/dist ./dist/

RUN npm install --production

CMD ["node", "dist/server.js"]
```

```bash
docker build -t romai-mcp .
docker run -d \
  --name romai-mcp \
  -e AZURE_OPENAI_API_KEY=your-key \
  -e AZURE_OPENAI_ENDPOINT=your-endpoint \
  romai-mcp
```

## Transport Methods

### 1. Stdio Transport (Default)

Direct communication via standard input/output:

```bash
node apps/mcp-server/dist/server.js
```

### 2. HTTP Transport (Coming Soon)

RESTful HTTP interface:

```bash
# Start HTTP server
ROMAI_MCP_TRANSPORT=http ROMAI_MCP_PORT=3001 node apps/mcp-server/dist/server.js

# Test endpoint
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "romai_intelligence",
      "arguments": {
        "query": "Test query"
      }
    }
  }'
```

### 3. WebSocket Transport (Planned)

Real-time WebSocket communication for web applications.

## Error Handling

### Common Errors

1. **Authentication Error**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Azure OpenAI authentication failed",
    "data": "Invalid API key or endpoint"
  }
}
```

2. **Rate Limit Error**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Rate limit exceeded",
    "data": "Too many requests. Please wait before retrying."
  }
}
```

3. **Tool Not Found**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Tool not found",
    "data": "Tool 'invalid_tool' is not available"
  }
}
```

## Performance Optimization

### Connection Pooling

ROMAI uses connection pooling for Azure OpenAI:

```typescript
// Optimized for concurrent requests
const config = {
  maxConcurrentRequests: 10,
  requestTimeout: 30000,
  retryAttempts: 3
};
```

### Caching

Response caching for frequently asked questions:

```typescript
// Cache responses for 1 hour
const cacheConfig = {
  ttl: 3600,
  maxSize: 1000,
  strategy: 'lru'
};
```

## Monitoring and Logging

### Log Levels

```bash
# Debug mode
ROMAI_LOG_LEVEL=debug node dist/server.js

# Production mode  
ROMAI_LOG_LEVEL=info node dist/server.js
```

### Health Monitoring

Use the health check tool to monitor system status:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "romai_health_check",
    "arguments": {}
  }
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": "healthy",
    "uptime": "2h 30m",
    "azureOpenAI": "connected",
    "memory": "available",
    "tools": 5
  }
}
```

## Troubleshooting

### Common Issues

1. **MCP Server Won't Start**
   - Check Node.js version (requires 20+)
   - Verify environment variables
   - Check Azure OpenAI connectivity

2. **Tools Not Available in Claude**
   - Restart Claude Desktop
   - Check configuration file syntax
   - Verify file paths are correct

3. **Romanian Characters Not Displaying**
   - Ensure UTF-8 encoding
   - Check terminal/IDE settings
   - Verify locale configuration

### Debug Mode

Enable debug logging:

```bash
DEBUG=romai:* node dist/server.js
```

### Testing Tools

Test tools directly:

```bash
# Test intelligence tool
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"romai_intelligence","arguments":{"query":"Test"}}}' | node dist/server.js

# Test Romanian expert
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"romai_romanian_expert","arguments":{"query":"Test despre România"}}}' | node dist/server.js
```

## Contributing

### Adding New Tools

1. **Define tool interface**:
```typescript
interface NewToolArgs {
  param1: string;
  param2?: number;
}
```

2. **Implement tool handler**:
```typescript
async function handleNewTool(args: NewToolArgs): Promise<ToolResult> {
  // Implementation
  return {
    content: [{
      type: "text",
      text: "Tool response"
    }]
  };
}
```

3. **Register tool**:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools
    {
      name: "romai_new_tool",
      description: "Description of new tool",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string" },
          param2: { type: "number" }
        },
        required: ["param1"]
      }
    }
  ]
}));
```

## Support

- **MCP Issues**: GitHub Issues
- **Integration Help**: integration@codai.ro
- **Documentation**: https://docs.romai.ro/mcp
- **Community**: Discord server (coming soon)
