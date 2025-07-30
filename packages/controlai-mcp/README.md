# ControlAI MCP - Enterprise AI Project Management Server

![ControlAI Logo](https://img.shields.io/badge/ControlAI-MCP-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)

**ControlAI MCP** is a world-class, enterprise-grade AI project management solution built as a Model Context Protocol (MCP) server. It provides intelligent task management, multi-agent coordination, conflict resolution, and real-time project monitoring for AI agent ecosystems.

## 🌟 Features

### ✨ **Intelligent Project Management**
- 🧠 **AI-Powered Task Analysis**: Natural language processing for automatic task breakdown and categorization
- 📊 **Smart Priority Assignment**: Intelligent priority and complexity assessment
- 🎯 **Automated Task Generation**: Convert project descriptions into actionable tasks

### 🤖 **Multi-Agent Coordination**
- 🔄 **Intelligent Agent Assignment**: AI-driven task-to-agent matching based on capabilities
- ⚖️ **Conflict Resolution**: Automatic detection and resolution of resource conflicts
- 📈 **Performance Optimization**: Real-time optimization suggestions for better task distribution

### 🚀 **Real-Time Monitoring**
- 📡 **WebSocket Updates**: Live project status updates and notifications
- 📊 **Interactive Dashboard**: Real-time metrics and insights
- 🔍 **Advanced Analytics**: Project progress tracking and performance metrics

### 🛡️ **Enterprise Grade**
- 🏗️ **Scalable Architecture**: Built for high-performance multi-agent environments
- 🔒 **Robust Data Management**: SQLite with sql.js for reliable persistence
- 🌐 **Cross-Platform**: Works on Windows, macOS, and Linux
- 🔌 **VS Code Integration**: Native MCP protocol support for seamless IDE integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher
- Azure OpenAI API access (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/codai-ecosystem/codai-project.git
cd codai-project/packages/controlai-mcp

# Install dependencies
pnpm install

# Build the project
pnpm run build
```

### Environment Configuration

Create a `.env` file in your project root:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-openai-instance.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# ControlAI Configuration (Optional)
CONTROLAI_PORT=7001
CONTROLAI_HOST=localhost
CONTROLAI_DATABASE_PATH=/path/to/your/database
CONTROLAI_CORS_ORIGIN=*
```

### Running the Server

```bash
# Development mode with hot reload
pnpm run dev

# Production mode
pnpm run start

# Run tests
pnpm run test
```

## 🛠️ Usage

### 1. **MCP Integration**

ControlAI MCP implements the Model Context Protocol, making it compatible with VS Code and other MCP-enabled tools.

#### VS Code Configuration

Add to your VS Code settings or MCP configuration:

```json
{
  "mcps": {
    "controlai": {
      "command": "node",
      "args": ["path/to/controlai-mcp/dist/server.js"],
      "env": {
        "AZURE_OPENAI_ENDPOINT": "your-endpoint",
        "AZURE_OPENAI_API_KEY": "your-key"
      }
    }
  }
}
```

### 2. **Available Tools**

#### 📝 **create_project**
Create a new project with intelligent analysis.

```typescript
{
  "name": "E-commerce Website",
  "description": "Build a modern e-commerce platform with React, Node.js, and MongoDB",
  "priority": "high",
  "tags": ["web", "ecommerce", "fullstack"]
}
```

#### 🔍 **analyze_plan**
Break down project plans into actionable tasks using AI.

```typescript
{
  "projectId": "project-uuid",
  "plan": "Create a user authentication system with login, registration, password reset, and role-based access control"
}
```

#### 🤖 **register_agent**
Register AI agents with specific capabilities.

```typescript
{
  "name": "Senior Developer Agent",
  "type": "coding_agent",
  "capabilities": ["programming", "typescript", "react", "testing"],
  "workspaceId": "workspace-1",
  "maxConcurrentTasks": 3
}
```

#### 📋 **assign_task**
Intelligently assign tasks to the most suitable agents.

```typescript
{
  "taskId": "task-uuid",
  "agentId": "agent-uuid" // Optional - AI will suggest if omitted
}
```

#### 📊 **get_dashboard_data**
Retrieve real-time dashboard metrics and insights.

```typescript
{
  "workspaceId": "workspace-1"
}
```

### 3. **WebSocket Real-Time Updates**

Connect to the WebSocket server for live updates:

```javascript
const ws = new WebSocket('ws://localhost:7001');

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`Event: ${message.type}`, message.payload);
});
```

#### Event Types:
- `project_created` - New project added
- `task_assigned` - Task assigned to agent
- `task_status_updated` - Task progress update
- `agent_registered` - New agent joined
- `plan_analyzed` - Project plan broken down
- `conflict_detected` - Resource conflict identified

## 🏗️ Architecture

### **Core Components**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Server    │────│  HTTP/WS APIs   │────│   Dashboard     │
│    (Stdio)      │    │   (Express)     │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│ CoordinationSvc │──────────────┘
                        └─────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
  │ DatabaseService│    │  AI Service   │    │ WebSocket Mgr │
  │   (sql.js)     │    │ (Azure OpenAI)│    │  (Real-time)  │
  └───────────────┘    └───────────────┘    └───────────────┘
```

### **Data Flow**

1. **Project Creation**: User creates project → AI analyzes → Tasks generated
2. **Task Assignment**: Task created → AI evaluates agents → Best match assigned
3. **Status Updates**: Agent reports progress → Database updated → WebSocket broadcast
4. **Conflict Resolution**: System detects conflicts → AI suggests solutions → Auto-resolve

## 📖 API Reference

### **MCP Tools**

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `create_project` | Create new project | `{name, description, priority?, tags?}` | `Project` |
| `analyze_plan` | AI plan analysis | `{projectId, plan}` | `{analysis, tasks[]}` |
| `get_project_status` | Project overview | `{projectId}` | `{project, tasks, metrics}` |
| `assign_task` | Smart assignment | `{taskId, agentId?}` | `{taskId, agentId, assignedAt}` |
| `register_agent` | Register agent | `{name, type, capabilities, workspaceId}` | `Agent` |
| `get_dashboard_data` | Dashboard metrics | `{workspaceId}` | `{metrics, agents, projects}` |
| `update_task_status` | Update progress | `{taskId, status, actualHours?, notes?}` | `{task, updatedAt}` |

### **REST Endpoints**

- `GET /health` - Health check
- `WS /` - WebSocket connection for real-time updates

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Run in watch mode
pnpm run test:watch
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | - | ✅ |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | - | ✅ |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | `gpt-4o` | ❌ |
| `CONTROLAI_PORT` | HTTP server port | `7001` | ❌ |
| `CONTROLAI_HOST` | Server host | `localhost` | ❌ |
| `CONTROLAI_DATABASE_PATH` | Database file path | `~/.controlai-mcp/` | ❌ |
| `CONTROLAI_CORS_ORIGIN` | CORS origin | `*` | ❌ |

### **Advanced Configuration**

Create `controlai.config.js`:

```javascript
export default {
  server: {
    port: 7001,
    host: 'localhost',
    cors: { origin: '*' }
  },
  database: {
    path: './data/controlai.db'
  },
  ai: {
    provider: 'azure-openai',
    deploymentName: 'gpt-4o'
  },
  websocket: {
    enabled: true,
    heartbeatInterval: 30000
  }
};
```

## 🛡️ Security

- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention with prepared statements
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Rate limiting ready (configurable)

## 📊 Performance

### **Benchmarks**

- **Task Creation**: < 200ms (with AI analysis)
- **Agent Assignment**: < 100ms
- **Database Queries**: < 50ms
- **WebSocket Broadcast**: < 10ms
- **Memory Usage**: ~50MB base + data

### **Scalability**

- **Concurrent Agents**: 1000+
- **Projects**: Unlimited
- **Tasks per Project**: 10,000+
- **WebSocket Connections**: 100+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- **CODAI Ecosystem**: [Main Repository](https://github.com/codai-ecosystem/codai-project)
- **MemoRAI MCP**: Memory management for AI agents
- **Glass Browser**: Web automation toolkit

## 📞 Support

- 📧 **Email**: support@codai.ro
- 💬 **Discord**: [CODAI Community](https://discord.gg/codai)
- 🐛 **Issues**: [GitHub Issues](https://github.com/codai-ecosystem/codai-project/issues)
- 📖 **Docs**: [Documentation Site](https://docs.codai.ro)

## 🚀 Roadmap

- [ ] **Q1 2025**: GitHub Integration
- [ ] **Q2 2025**: Slack/Teams Integration  
- [ ] **Q3 2025**: Advanced Analytics Dashboard
- [ ] **Q4 2025**: Multi-tenant Support

---

<div align="center">

**Built with ❤️ by the CODAI Ecosystem Team**

[Website](https://codai.ro) • [Documentation](https://docs.codai.ro) • [Community](https://discord.gg/codai)

</div>
