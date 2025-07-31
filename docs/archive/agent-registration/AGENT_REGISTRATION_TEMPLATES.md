# 🤖 Agent Registration Templates

## 🎨 Frontend Specialist Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Frontend-Specialist-001",
  type: "senior_developer", 
  capabilities: [
    "javascript",
    "typescript", 
    "react",
    "ui_ux",
    "testing"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 🔧 Backend Expert Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Backend-Expert-001",
  type: "senior_developer",
  capabilities: [
    "node_js",
    "typescript",
    "databases", 
    "python",
    "devops",
    "security"
  ],
  workspaceId: "codai-project-main", 
  maxConcurrentTasks: 1
})
```

## ⚙️ DevOps Engineer Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-DevOps-Engineer-001",
  type: "devops_engineer",
  capabilities: [
    "devops",
    "deployment",
    "security",
    "monitoring", 
    "testing"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 🧪 QA Testing Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-QA-Tester-001", 
  type: "qa_engineer",
  capabilities: [
    "testing",
    "code_review",
    "javascript",
    "typescript",
    "security"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 🎨 UX Design Agent  
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-UX-Designer-001",
  type: "ux_designer", 
  capabilities: [
    "ui_ux",
    "design", 
    "analysis",
    "javascript"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 📚 Documentation Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Documentation-001",
  type: "generic",
  capabilities: [
    "documentation",
    "analysis",
    "project_management", 
    "code_review"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 🛡️ Security Engineer Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Security-Engineer-001",
  type: "security_engineer",
  capabilities: [
    "security",
    "code_review",
    "javascript",
    "typescript",
    "devops"
  ],
  workspaceId: "codai-project-main", 
  maxConcurrentTasks: 1
})
```

## 📊 Data Scientist Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Data-Scientist-001",
  type: "data_scientist",
  capabilities: [
    "machine_learning",
    "python", 
    "analysis",
    "databases"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

## 🎯 Project Manager Agent
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-Project-Manager-001",
  type: "project_manager",
  capabilities: [
    "project_management",
    "analysis",
    "documentation",
    "code_review"
  ], 
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 2
})
```

## 🚀 Full-Stack Agent (Multi-capability)
```javascript
mcp_controlaimcp_register_agent({
  name: "Agent-FullStack-Generalist-001",
  type: "senior_developer", 
  capabilities: [
    "javascript",
    "typescript",
    "react", 
    "node_js",
    "databases",
    "testing",
    "documentation"
  ],
  workspaceId: "codai-project-main",
  maxConcurrentTasks: 1
})
```

---

## 📝 Usage Instructions

1. **Choose an agent template** that matches your VS Code instance's intended role
2. **Modify the agent name** with a unique identifier (e.g., increment the number)
3. **Run the registration command** in your VS Code Copilot chat
4. **Verify registration** with dashboard data check
5. **Activate autonomous mode** with the universal agent prompt

## 🔄 Agent Naming Convention
- **Format**: `Agent-[Role]-[Specialization]-[Number]`
- **Examples**: 
  - `Agent-Frontend-React-001`
  - `Agent-Backend-API-002` 
  - `Agent-DevOps-AWS-001`
  - `Agent-QA-E2E-001`

## ⚡ Quick Registration Verification
After registering any agent:
```javascript
mcp_controlaimcp_get_dashboard_data({
  workspaceId: "codai-project-main"
})
```

## 🎯 Universal Activation Prompt
Once registered, activate any agent with:
```
You are an autonomous agent in the CODAI Multi-Agent System. Pick the next priority task and execute it completely.
```

---

*Templates Version: 1.0 - Production Ready*  
*Compatible with: ControlAI MCP v1.0.6+*
