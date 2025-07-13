# 🎯 Focused Sub-Project Development Guide

## Overview
This guide explains how to work on individual Codai projects with isolated VS Code instances and focused agent contexts, preventing overwhelming cross-project interference.

## Quick Start Commands

### Option 1: Individual App Windows
```bash
# Open focused app development
code "e:\GitHub\codai-project\apps\bancai" --new-window
code "e:\GitHub\codai-project\apps\codai" --new-window
code "e:\GitHub\codai-project\apps\memorai" --new-window

# Open focused service development  
code "e:\GitHub\codai-project\services\admin" --new-window
code "e:\GitHub\codai-project\services\hub" --new-window
```

### Option 2: Multi-Root Workspaces (Recommended)
```bash
# Create focused workspace files in .vscode/focused-workspaces/
code .vscode/focused-workspaces/bancai.code-workspace
code .vscode/focused-workspaces/memorai.code-workspace
```

## Workspace Templates

### App-Focused Workspace Template
Create `.vscode/focused-workspaces/{app-name}.code-workspace`:
```json
{
  "folders": [
    {
      "name": "{app-name}-app",
      "path": "../../apps/{app-name}"
    },
    {
      "name": "shared-packages", 
      "path": "../../packages"
    }
  ],
  "settings": {
    "ai.copilot.context": "{app-name}-only",
    "ai.copilot.instructions": "../../apps/{app-name}/copilot-instructions.md",
    "files.exclude": {
      "../../apps/*": true,
      "../../services/*": true
    }
  },
  "extensions": {
    "recommendations": [
      "github.copilot",
      "bradlc.vscode-tailwindcss",
      "esbenp.prettier-vscode"
    ]
  }
}
```

### Service-Focused Workspace Template
Create `.vscode/focused-workspaces/{service-name}.code-workspace`:
```json
{
  "folders": [
    {
      "name": "{service-name}-service",
      "path": "../../services/{service-name}"
    },
    {
      "name": "shared-packages",
      "path": "../../packages"
    }
  ],
  "settings": {
    "ai.copilot.context": "{service-name}-service-only",
    "ai.copilot.instructions": "../../services/{service-name}/copilot-instructions.md"
  }
}
```

## Agent Profile System

### Per-Project Agent Configuration
Each project should have:
- `{project}/.agent/agent.profile.json` - Agent configuration
- `{project}/copilot-instructions.md` - Project-specific instructions
- `{project}/.agent/agent.memory.json` - Isolated memory context

### Example Agent Profile
`apps/bancai/.agent/agent.profile.json`:
```json
{
  "agentId": "bancai-specialist",
  "name": "Bancai Financial Platform Specialist",
  "version": "1.0.0",
  "scope": "bancai-only",
  "capabilities": [
    "financial-platform-development",
    "payment-processing",
    "banking-apis",
    "fintech-compliance"
  ],
  "context": {
    "projectPath": "apps/bancai",
    "framework": "next.js",
    "port": 4033,
    "domain": "bancai.ro"
  },
  "memory": {
    "contextFile": ".agent/agent.memory.json",
    "maxContextSize": 1000,
    "isolationLevel": "strict"
  }
}
```

## Benefits of Focused Development

### 🎯 **Agent Focus**
- Agent only sees bancai-related files and context
- No confusion from other projects
- Faster, more relevant responses
- Specialized expertise per project

### 🚀 **Performance**
- Smaller workspace = faster VS Code
- Reduced indexing time
- Focused IntelliSense suggestions
- Better memory usage

### 🔒 **Isolation**
- Changes don't affect other projects
- Independent debugging
- Separate terminal instances
- Project-specific extensions

### 👥 **Team Collaboration**
- Multiple developers can work on different projects
- No stepping on each other's work
- Independent deployment cycles
- Project-specific git workflows

## Implementation Steps

1. **Create Workspace Files**: Generate focused workspace configurations
2. **Setup Agent Profiles**: Configure project-specific agent behavior
3. **Isolate Dependencies**: Ensure clean dependency boundaries
4. **Configure Ports**: Verify each project uses correct ports
5. **Test Isolation**: Validate agents work independently

## Commands Reference

```bash
# Start specific app in isolation
cd apps/bancai && pnpm dev

# Open focused workspace
code .vscode/focused-workspaces/bancai.code-workspace

# Check port allocation
netstat -ano | findstr :4033

# Test agent memory isolation
# (Use VS Code Copilot Chat in focused window)
```

This approach transforms the overwhelming 40-project ecosystem into manageable, focused development environments!
