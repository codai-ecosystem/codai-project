# CODAI Ecosystem Workspace Handoff Prompts

Use these short prompts to start conversations with specialized agents in each workspace.

## 🎨 Color-Coded Workspaces

Each workspace uses "Just Black 2" theme with unique color coding for easy identification:

- 🔵 **ControlAI** - Blue (Project Management & Coordination)
- 🟢 **MemorAI** - Green (Memory Management & Analytics)
- 🔴 **RomAI** - Red (Romanian Intelligence & Market Analysis)
- 🟣 **ID Auth** - Purple (Authentication & User Federation)

## 1. ControlAI Workspace

**File**: `workspaces/controlai.code-workspace` 🔵

**Handoff Prompt**:

```
I'm working in the ControlAI workspace. Check ControlAI MCP for any existing projects and planned tasks. If there are active projects, continue with the next priorities. If no active projects, ask me what I want to work on. The ControlAI system has advanced analytics, WebSocket real-time updates, and dashboard capabilities ready.
```

## 2. MemorAI Workspace

**File**: `workspaces/memorai.code-workspace` 🟢

**Handoff Prompt**:

```
I'm working in the MemorAI workspace. Check ControlAI MCP for any memory-related projects or tasks assigned to memory management. If there are active memory projects, continue with those. If not, ask me what memory features or optimizations I want to work on. The MemorAI system has vector embeddings and agent isolation ready.
```

## 3. RomAI Workspace

**File**: `workspaces/romai.code-workspace` 🔴

**Handoff Prompt**:

```
I'm working in the RomAI workspace. Check ControlAI MCP for any Romanian intelligence or market analysis projects. If there are active Romanian projects, continue with those. If not, ask me what Romanian market intelligence or language features I want to develop. The RomAI system has cultural analysis and market intelligence capabilities ready.
```

## 4. ID Authentication Workspace

**File**: `workspaces/id.code-workspace` 🟣

**Handoff Prompt**:

```
I'm working in the ID authentication workspace. Check ControlAI MCP for any authentication, security, or user federation projects. If there are active security projects, continue with those. If not, ask me what authentication features or security enhancements I want to implement. The ID system has JWT, RBAC, and audit logging foundations ready.
```

## Usage Instructions

1. **Open the workspace**: Use `File > Open Workspace` and select the appropriate `.code-workspace` file
2. **Start new conversation**: Paste the handoff prompt for that workspace
3. **Let the agent check ControlAI**: The agent will automatically check for existing projects and tasks
4. **Continue or define new work**: Agent will either continue existing work or ask for new directions

## Workspace Services

Each workspace has pre-configured tasks to start the required services:

- **ControlAI**: CBD Service + MCP Server + Dashboard (ports 4180, 7001, 4200)
- **MemorAI**: MemorAI MCP Server
- **RomAI**: RomAI Intelligence Server
- **ID**: ID Authentication Server

Use `Ctrl+Shift+P > Tasks: Run Task` to start services in each workspace.
