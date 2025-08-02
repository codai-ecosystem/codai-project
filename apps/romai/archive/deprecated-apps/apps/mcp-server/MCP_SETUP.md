# ROMAI MCP Server Setup Guide

This guide explains how to set up and use the ROMAI Model Context Protocol (MCP) server with Claude Desktop.

## Prerequisites

1. **Node.js 20+** installed on your system
2. **Claude Desktop** application installed
3. **Azure OpenAI** access with a deployed GPT-4 model

## Setup Instructions

### 1. Build the Project

```bash
cd e:\GitHub\romai
pnpm install
pnpm build
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your Azure OpenAI credentials:

```bash
cd apps/mcp-server
cp .env.example .env
```

Edit `.env` and add your Azure OpenAI configuration:

```env
AZURE_OPENAI_API_KEY=your-actual-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### 3. Claude Desktop Configuration

The Claude Desktop configuration file has been automatically created at:
`C:\Users\vladu\AppData\Roaming\Claude\claude_desktop_config.json`

**Important**: You need to update the environment variables in this file with your actual Azure OpenAI credentials.

### 4. Test the MCP Server

You can test the server locally before using it with Claude:

```bash
cd apps/mcp-server
pnpm start
```

This will start the server in stdio mode. You should see:
```
ROMAI MCP Server running on stdio
```

### 5. Restart Claude Desktop

After updating the configuration file, restart Claude Desktop for the changes to take effect.

### 6. Verify Connection

In Claude Desktop, you should now be able to use ROMAI tools. Try asking:

- "Use ROMAI to analyze this problem in Romanian"
- "Ask ROMAI for Romanian business advice"
- "Get ROMAI to help with coding in Romanian"

## Available Tools

The ROMAI MCP server provides these tools:

1. **romai_intelligence** - General AI analysis and problem-solving
2. **romai_romanian_expert** - Romanian culture, business, and language expertise
3. **romai_problem_solver** - Step-by-step problem analysis and solutions
4. **romai_code_assistant** - Romanian-first coding assistant
5. **romai_health_check** - Check ROMAI system status

## Troubleshooting

### Server Not Starting
- Check that all dependencies are installed: `pnpm install`
- Verify the build completed successfully: `pnpm build`
- Check environment variables are set correctly

### Claude Can't Connect
- Ensure Claude Desktop is completely restarted after config changes
- Verify the server path in `claude_desktop_config.json` is correct
- Check Windows file paths use double backslashes `\\`

### Azure OpenAI Errors
- Verify your API key is correct and active
- Ensure your deployment name matches exactly
- Check your Azure OpenAI endpoint URL format

## File Locations

- **MCP Server**: `e:\GitHub\romai\apps\mcp-server\dist\server.js`
- **Claude Config**: `C:\Users\vladu\AppData\Roaming\Claude\claude_desktop_config.json`
- **Environment**: `e:\GitHub\romai\apps\mcp-server\.env`

## Advanced Configuration

For advanced users, you can modify the server configuration by editing:
- `packages/romai-mcp/src/index.ts` - MCP tool definitions
- `packages/romai-core/src/index.ts` - Core AI logic
- `apps/mcp-server/src/server.ts` - Server startup

After making changes, rebuild with `pnpm build` and restart Claude Desktop.
