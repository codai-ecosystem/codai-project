# 🤖 SIMPLE GENERIC AGENT PROMPT

## ⚡ Copy & Paste This Anywhere

```
You are an autonomous agent in the CODAI Multi-Agent System. Pick the next priority task and execute it completely.
```

**That's it!** Any agent will automatically:

1. ✅ **Understand the Ecosystem** - Read README.md, DESCRIPTION.md, package.json
2. ✅ **Use All MCP Tools** - Playwright (browser), Glass (windows), Memorai (memory), ROMAI (intelligence)  
3. ✅ **Check Active Content** - Browser console, window states, running services
4. ✅ **Create Action Plan** - Detailed step-by-step plan with testing criteria
5. ✅ **Execute with Testing** - Every step validated before proceeding
6. ✅ **Never Stop** - Continue until 100% complete and all tests pass
7. ✅ **Auto-Challenge** - Move to next task automatically

## 🎯 What The Agent Does Automatically

### Phase 1: Ecosystem Understanding (Auto-Discovery)
```javascript
// The agent automatically runs these commands:
read_file("E:/GitHub/codai-project/README.md")
read_file("E:/GitHub/codai-project/DESCRIPTION.md") 
read_file("E:/GitHub/codai-project/package.json")
mcp_playwrightmcp_playwright_navigate("http://localhost:8080")
mcp_playwrightmcp_playwright_console_logs()
mcp_glassmcpserve_window_list()
mcp_memoraimcpser_context(agentId="codai-agent", contextSize=10)
mcp_romai_romai_intelligence(query="analyze current CODAI ecosystem status and priorities")
```

### Phase 2: Task Selection & Planning
```javascript
// Check available tasks (Task queue must be initialized first - see MEMORAI_MCP_TASK_QUEUE_INITIALIZED.md)
mcp_memoraimcpser_recall(agentId="codai-agent", query="priority_tasks available unclaimed", limit=10)

// Alternative priority-based queries:
// mcp_memoraimcpser_recall(agentId="codai-agent", query="PRIORITY 1 CRITICAL available", limit=5)
// mcp_memoraimcpser_recall(agentId="codai-agent", query="PRIORITY 2 EXPANSION available", limit=5)
// mcp_memoraimcpser_recall(agentId="codai-agent", query="PRIORITY 3 OPTIMIZATION available", limit=5)

// Create comprehensive action plan
const actionPlan = {
  taskId: "TASK-XXX",
  objective: "Clear objective based on ecosystem analysis",
  currentState: "What the agent discovered about the ecosystem", 
  targetState: "Desired outcome with success criteria",
  detailedSteps: [
    "Step 1: Specific action with tool usage",
    "Step 2: Validation and testing method", 
    "Step 3: Integration and verification",
    // ... continue until completion
  ],
  testingCriteria: [
    "Browser test: Check service responds correctly",
    "Window test: Verify application launches",
    "Memory test: Confirm state persistence",
    // ... comprehensive validation
  ],
  successMetrics: "Measurable outcomes proving completion",
  failureRecovery: "Backup plans for each potential issue"
}

// Store the plan
mcp_memoraimcpser_remember(agentId="codai-agent", content=`ACTION_PLAN: ${taskId} - ${JSON.stringify(actionPlan)}`, metadata={entityType: "action_plan", taskId: taskId})

// Claim task with plan
mcp_memoraimcpser_remember(agentId="codai-agent", content=`TASK_CLAIMED: ${taskId} by autonomous_agent with detailed plan`, metadata={entityType: "task_claim", taskId: taskId})
```

### Phase 3: Execution with Continuous Testing
```javascript
// For every step in the action plan:
// 1. Execute the step
// 2. Test with appropriate MCP tool
// 3. Validate success
// 4. Report progress
// 5. Move to next step or debug if failed

// Progress reporting for every step
mcp_memoraimcpser_remember(agentId="codai-agent", content=`STEP_COMPLETED: ${taskId} Step X/Y - ${action} - ${test_result}`, metadata={entityType: "step_progress", taskId: taskId})
```

### Phase 4: Comprehensive Validation & Completion
```javascript
// Final validation using ALL MCP tools
mcp_playwrightmcp_playwright_navigate(service_url)
mcp_playwrightmcp_playwright_get_visible_text()
mcp_playwrightmcp_playwright_console_logs()
mcp_glassmcpserve_window_extract_text_by_title(app_name)
mcp_romai_romai_intelligence("validate task completion success")

// Complete with proof
mcp_memoraimcpser_remember(agentId="codai-agent", content=`TASK_COMPLETED: ${taskId} - ALL STEPS TESTED AND PASSED - ${proof}`, metadata={entityType: "task_completion", taskId: taskId})
```

### Phase 5: Auto-Challenge Next Task
```javascript
// Immediately query for next task
mcp_memoraimcpser_recall(agentId="codai-agent", query="priority_tasks available unclaimed", limit=5)
// Loop back to Phase 1 with fresh ecosystem analysis
```

## 🔥 Challenge Protocol Built-In

Every agent automatically accepts your challenge to:

- **📋 Create detailed action plans** - No vague steps, everything specific
- **💾 Save everything** - Plans, progress, results in memory
- **🔄 Execute systematically** - Follow the plan step-by-step  
- **🧪 Test everything** - Every step validated before proceeding
- **🚫 Never stop** - Continue until 100% complete and proven
- **⚡ Auto-continue** - Move to next challenge immediately

## 🛠️ All MCP Tools Integrated

- **🌐 Playwright MCP** - Browser navigation, console logs, page content
- **🪟 Glass MCP** - Window control, text extraction, UI monitoring  
- **🧠 Memorai MCP** - Memory storage, context retrieval, coordination
- **🤖 ROMAI MCP** - AI intelligence, analysis, decision support

## 🚀 Ready to Deploy

Just paste the simple prompt and watch the agent:

1. Automatically understand the CODAI ecosystem
2. Use all available MCP tools for comprehensive analysis
3. Create detailed action plans with testing criteria
4. Execute tasks with continuous validation
5. Complete challenges and move to the next one
6. Never stop until everything is perfect

**The system is now fully autonomous with your challenge protocol built-in!**
