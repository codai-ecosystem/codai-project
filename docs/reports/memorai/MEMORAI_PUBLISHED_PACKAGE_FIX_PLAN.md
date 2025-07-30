# 🔧 MemorAI Published Package Fix Plan

**Date**: July 30, 2025  
**Objective**: Fix MemorAI packages to work with published package configuration  
**Status**: ⚡ EXECUTING  
**Configuration**: Keep `@codai/memorai-mcp@latest` as configured in MCP settings  

---

## 🎯 PROBLEM ANALYSIS

### Current MCP Configuration (KEEP INTACT) ✅
```json
{
  "MemoraiMCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@codai/memorai-mcp@latest"],
    "env": {
      "DOTENV_CONFIG_PATH": "E:\\GitHub\\workspace-ai\\.env"
    }
  }
}
```

### Issues to Fix:
1. **Published Package**: VS Code expects `@codai/memorai-mcp@latest` from npm
2. **Current State**: We have local CBD-based server but no published package
3. **Environment**: Package must use `E:\GitHub\workspace-ai\.env` path
4. **0 Memories Issue**: Published package must work correctly

---

## 🚀 COMPREHENSIVE FIX STRATEGY

### Strategy 1: Update Local Package to Match Configuration ⚡ RECOMMENDED
**Approach**: Modify the local MemorAI package to be publishable as `@codai/memorai-mcp@latest`

#### Step 1.1: Create Publishable Package Structure
```bash
# Create proper package structure for publishing
mkdir -p packages/@codai/memorai-mcp
```

#### Step 1.2: Package Configuration
- **Package Name**: `@codai/memorai-mcp`  
- **Version**: Use CBD-based server (our working v8.0.0)
- **Entry Point**: Point to CBD MCP server
- **Environment**: Support `DOTENV_CONFIG_PATH`

#### Step 1.3: CBD Integration
- Use our working `apps/memorai/cbd-mcp-server.ts` as the server
- Ensure package reads from `E:\GitHub\workspace-ai\.env`
- Maintain all CBD functionality (vector search, HPKV, etc.)

### Strategy 2: Local Development Override 🔧 ALTERNATIVE
**Approach**: Use npm link or local package reference

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Create Publishable MemorAI MCP Package ⚡

#### 1.1 Package Structure Creation
```bash
# Create package directory
mkdir packages/@codai/memorai-mcp
cd packages/@codai/memorai-mcp

# Initialize package
npm init -y
```

#### 1.2 Package.json Configuration
```json
{
  "name": "@codai/memorai-mcp",
  "version": "8.0.0-cbd",
  "description": "MemorAI CBD-based MCP Server",
  "main": "dist/server.js",
  "bin": {
    "memorai-mcp": "dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx src/server.ts"
  },
  "dependencies": {
    "@codai/cbd": "workspace:*",
    "@modelcontextprotocol/sdk": "latest",
    "dotenv": "^16.0.0"
  }
}
```

#### 1.3 Server Implementation
```typescript
// packages/@codai/memorai-mcp/src/server.ts
// Import and adapt our CBD MCP server
import { MemorAICBDServer } from '../../../apps/memorai/cbd-mcp-server';
import { config } from 'dotenv';

// Load environment from DOTENV_CONFIG_PATH
if (process.env.DOTENV_CONFIG_PATH) {
  config({ path: process.env.DOTENV_CONFIG_PATH });
}

// Start server with environment configuration
const server = new MemorAICBDServer({
  cbdPath: process.env.MEMORAI_CBD_PATH || './memorai-cbd-data',
  logLevel: process.env.MEMORAI_LOG_LEVEL || 'info',
  // ... other config
});

server.start();
```

### Phase 2: Local Development Setup 🔧

#### 2.1 Local Package Development
```bash
# Build the package
cd packages/@codai/memorai-mcp
npm run build

# Link for local development
npm link

# Use the linked package globally
npm link @codai/memorai-mcp
```

#### 2.2 Workspace Integration
```json
// pnpm-workspace.yaml - Add to packages
packages:
  - "packages/@codai/memorai-mcp"
```

### Phase 3: Testing & Validation ✅

#### 3.1 Test Published Package Behavior
```bash
# Simulate npm install behavior
npx -y @codai/memorai-mcp@latest
```

#### 3.2 Environment Variable Testing
```bash
# Test with DOTENV_CONFIG_PATH
DOTENV_CONFIG_PATH="E:\\GitHub\\workspace-ai\\.env" npx @codai/memorai-mcp@latest
```

#### 3.3 MCP Integration Testing
```javascript
// Test that VS Code MCP loads correctly
mcp_memoraimcp_recall("test query")
// Expected: Returns actual memories from CBD system
```

---

## 🔧 IMMEDIATE IMPLEMENTATION

### Create Publishable Package Structure
```bash
# 1. Create package directory
mkdir -p packages/@codai/memorai-mcp/src
mkdir -p packages/@codai/memorai-mcp/dist

# 2. Copy our working CBD server
cp apps/memorai/cbd-mcp-server.ts packages/@codai/memorai-mcp/src/server.ts

# 3. Create package.json
# 4. Build and test
```

### Environment Integration
```typescript
// Ensure package reads correct .env file
const envPath = process.env.DOTENV_CONFIG_PATH || '.env';
config({ path: envPath });

// Validate environment
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not found in:', envPath);
  process.exit(1);
}
```

---

## 📊 SUCCESS CRITERIA

### Package Integration ✅
- ✅ `npx -y @codai/memorai-mcp@latest` works correctly
- ✅ Reads environment from `E:\GitHub\workspace-ai\.env`
- ✅ Uses CBD backend for memory operations
- ✅ Returns actual memories (not 0)

### MCP Configuration Compatibility ✅
- ✅ Works with existing MCP configuration (no changes needed)
- ✅ Maintains all other MCP servers intact
- ✅ Supports development debugging with `"debug": { "type": "node" }`

### Memory Operations ✅
- ✅ `mcp_memoraimcp_recall` returns actual data
- ✅ Vector embeddings and semantic search work
- ✅ Sub-3-second response times
- ✅ Production-grade reliability

---

## 🎯 EXECUTION STATUS

**Current Status**: ⚡ **READY TO IMPLEMENT**  
**Strategy**: Create publishable `@codai/memorai-mcp` package using our CBD server  
**Configuration**: Keep MCP settings exactly as provided  
**Expected Outcome**: 0 memories issue resolved without changing MCP config  

### Next Actions:
1. **Create Package Structure**: Set up `packages/@codai/memorai-mcp`
2. **Adapt CBD Server**: Make it work as published package
3. **Environment Integration**: Support `DOTENV_CONFIG_PATH`
4. **Test & Validate**: Ensure compatibility with existing MCP config
5. **Deploy**: Make package available for `npx -y @codai/memorai-mcp@latest`

This approach maintains your exact MCP configuration while fixing the underlying MemorAI package to use our working CBD system.
