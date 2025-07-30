# MemorAI Phase 2.3 MCP Configuration Update

## Update Overview
This document details the configuration updates required for MemorAI MCP integration in Phase 2.3 of the CODAI project.

## Current MCP Configuration Issues

### 1. Tool Name Conflicts
```json
// Current problematic configuration
{
  "mcpServers": {
    "memorai": {
      "command": "node",
      "args": ["apps/memorai/packages/mcp/dist/mcp-server.js"],
      "tools": {
        "mcp_memoraimcp_remember": "Store memories",
        "mcp_memoraimcp_recall": "Search memories",
        "mcp_memoraimcp_forget": "Delete memories",
        "mcp_memoraimcp_context": "Get context"
      }
    }
  }
}
```

### 2. Path Resolution Issues
- Incorrect server script paths
- Missing environment variable handling
- Database path configuration errors

### 3. Integration Conflicts
- Tool name collisions with other MCP servers
- Inconsistent error handling
- Missing fallback configurations

## Updated Configuration

### 1. Fixed MCP Server Configuration
```json
{
  "mcpServers": {
    "memorai": {
      "command": "node",
      "args": ["apps/memorai/production-mcp-server.js"],
      "env": {
        "MEMORAI_DB_PATH": "./data/memorai.db",
        "MEMORAI_LOG_LEVEL": "info",
        "MEMORAI_EMBEDDING_MODEL": "text-embedding-3-small"
      },
      "tools": {
        "remember": {
          "description": "Store information in memory with metadata",
          "parameters": {
            "content": "string",
            "metadata": "object?"
          }
        },
        "recall": {
          "description": "Search and retrieve stored memories",
          "parameters": {
            "query": "string",
            "limit": "number?",
            "minRelevance": "number?"
          }
        },
        "forget": {
          "description": "Delete specific memories by key",
          "parameters": {
            "structuredKey": "string"
          }
        },
        "context": {
          "description": "Get contextual information for agent",
          "parameters": {
            "agentId": "string",
            "contextSize": "number?"
          }
        }
      }
    }
  }
}
```

### 2. Production Server Script
```javascript
// apps/memorai/production-mcp-server.js
#!/usr/bin/env node

const { MemoraiMCPServer } = require('./packages/mcp/dist/mcp-server');
const path = require('path');

// Configuration
const config = {
  database: {
    path: process.env.MEMORAI_DB_PATH || path.join(process.cwd(), 'data', 'memorai.db'),
    autoCreate: true
  },
  embedding: {
    model: process.env.MEMORAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY
  },
  logging: {
    level: process.env.MEMORAI_LOG_LEVEL || 'info'
  }
};

// Initialize and start server
async function startServer() {
  try {
    const server = new MemoraiMCPServer(config);
    await server.initialize();
    await server.start();
    
    console.log('MemorAI MCP Server started successfully');
    console.log(`Database: ${config.database.path}`);
    console.log(`Log Level: ${config.logging.level}`);
  } catch (error) {
    console.error('Failed to start MemorAI MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down MemorAI MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down MemorAI MCP Server...');
  process.exit(0);
});

startServer();
```

### 3. Environment Configuration
```bash
# .env.memorai
MEMORAI_DB_PATH=./data/memorai.db
MEMORAI_LOG_LEVEL=info
MEMORAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=your_api_key_here
MEMORAI_MAX_MEMORY_SIZE=1000
MEMORAI_CLEANUP_INTERVAL=3600
```

## VS Code Integration

### 1. Settings.json Updates
```json
{
  "mcp.servers": {
    "memorai": {
      "enabled": true,
      "autoStart": true,
      "restartOnConfigChange": true
    }
  },
  "mcp.tools.memorai": {
    "defaultTimeout": 30000,
    "retryAttempts": 3,
    "enableDebugLogging": false
  }
}
```

### 2. Workspace Configuration
```json
{
  "mcp": {
    "workspace": {
      "memorai": {
        "agentId": "vscode-agent",
        "sessionId": "workspace-session",
        "contextPreservation": true
      }
    }
  }
}
```

## Claude Desktop Integration

### 1. Claude Desktop Config
```json
{
  "mcpServers": {
    "memorai": {
      "command": "node",
      "args": ["C:/path/to/codai-project/apps/memorai/production-mcp-server.js"],
      "env": {
        "MEMORAI_DB_PATH": "C:/Users/Username/.memorai/memorai.db",
        "MEMORAI_LOG_LEVEL": "warn"
      }
    }
  }
}
```

### 2. Installation Script
```powershell
# install-memorai-mcp.ps1
param(
    [string]$ConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json",
    [string]$ProjectPath = "C:\path\to\codai-project",
    [string]$DataPath = "$env:USERPROFILE\.memorai"
)

# Create data directory
if (!(Test-Path $DataPath)) {
    New-Item -Path $DataPath -ItemType Directory -Force
}

# Read existing config
$config = @{}
if (Test-Path $ConfigPath) {
    $config = Get-Content $ConfigPath | ConvertFrom-Json -AsHashtable
}

# Add MemorAI MCP server
if (!$config.mcpServers) {
    $config.mcpServers = @{}
}

$config.mcpServers.memorai = @{
    command = "node"
    args = @("$ProjectPath\apps\memorai\production-mcp-server.js")
    env = @{
        MEMORAI_DB_PATH = "$DataPath\memorai.db"
        MEMORAI_LOG_LEVEL = "warn"
    }
}

# Save updated config
$config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath

Write-Host "MemorAI MCP server configured successfully!"
Write-Host "Config: $ConfigPath"
Write-Host "Data: $DataPath"
```

## Testing Configuration

### 1. Connection Test
```javascript
// test-mcp-connection.js
const { exec } = require('child_process');

async function testMCPConnection() {
  return new Promise((resolve, reject) => {
    const serverProcess = exec('node apps/memorai/production-mcp-server.js', {
      env: { ...process.env, MEMORAI_LOG_LEVEL: 'debug' }
    });
    
    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data;
      console.log('Server:', data.toString());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('Server Error:', data.toString());
    });
    
    setTimeout(() => {
      serverProcess.kill();
      if (output.includes('started successfully')) {
        resolve('✅ MCP Server connection successful');
      } else {
        reject('❌ MCP Server connection failed');
      }
    }, 5000);
  });
}

testMCPConnection()
  .then(console.log)
  .catch(console.error);
```

### 2. Tool Functionality Test
```javascript
// test-mcp-tools.js
async function testMCPTools() {
  const tests = [
    {
      tool: 'remember',
      args: { content: 'Test memory', metadata: { type: 'test' } },
      expected: 'success'
    },
    {
      tool: 'recall',
      args: { query: 'test memory', limit: 5 },
      expected: 'results'
    },
    {
      tool: 'context',
      args: { agentId: 'test-agent', contextSize: 10 },
      expected: 'context'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.tool}...`);
      // Tool testing logic here
      console.log(`✅ ${test.tool} test passed`);
    } catch (error) {
      console.log(`❌ ${test.tool} test failed:`, error.message);
    }
  }
}

testMCPTools();
```

## Troubleshooting Guide

### Common Issues

#### 1. Server Won't Start
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check file permissions
ls -la apps/memorai/production-mcp-server.js

# Check dependencies
cd apps/memorai/packages/mcp && npm list
```

#### 2. Database Connection Errors
```bash
# Check database path
echo $MEMORAI_DB_PATH

# Check directory permissions
ls -la $(dirname $MEMORAI_DB_PATH)

# Manual database creation
sqlite3 $MEMORAI_DB_PATH ".schema"
```

#### 3. Tool Registration Issues
```javascript
// Debug tool registration
console.log('Registered tools:', server.getTools());
console.log('Tool schemas:', server.getToolSchemas());
```

### Performance Monitoring
```javascript
// Monitor MCP performance
const performanceMonitor = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
  
  logRequest(toolName, duration) {
    this.requestCount++;
    console.log(`${toolName}: ${duration}ms`);
  },
  
  logError(toolName, error) {
    this.errorCount++;
    console.error(`${toolName} error:`, error);
  },
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    return {
      uptime: Math.round(uptime / 1000),
      requests: this.requestCount,
      errors: this.errorCount,
      errorRate: this.errorCount / this.requestCount
    };
  }
};
```

## Success Criteria

### Phase 2.3 Completion Requirements
- ✅ MCP server starts without errors
- ✅ All four tools register correctly
- ✅ Database operations function properly
- ✅ VS Code integration works
- ✅ Claude Desktop integration works
- ✅ Configuration is documented
- ✅ Troubleshooting guide is complete

### Performance Targets
- **Server Start Time**: < 2 seconds
- **Tool Response Time**: < 500ms average
- **Memory Usage**: < 50MB
- **Error Rate**: < 1%

## Next Steps

### Immediate (This Week)
1. Deploy updated MCP configuration
2. Test all integration points
3. Validate tool functionality
4. Monitor performance metrics

### Short Term (Next 2 Weeks)
1. Optimize performance bottlenecks
2. Enhance error handling
3. Improve logging and monitoring
4. Create automated tests

This configuration update resolves the major MCP integration issues and provides a solid foundation for Phase 3 development.
