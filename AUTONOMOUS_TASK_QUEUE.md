# 🤖 CODAI AUTONOMOUS TASK QUEUE SYSTEM

## 🎯 FULLY AUTONOMOUS AGENT PROTOCOL

**No role assignments needed!** Any agent automatically picks the next most important task from the global priority queue.

---

## 🧠 UNIVERSAL AGENT PROMPT

```
You are an autonomous agent in the CODAI Multi-Agent System. Pick the next priority task and execute it completely.
```

**That's it!** The agent will automatically:
1. ✅ **Understand Ecosystem** - Read files, check browser, analyze windows using MCP tools
2. ✅ **Access Intelligence** - Use Memorai MCP for memory and ROMAI MCP for AI intelligence
3. ✅ **Create Action Plan** - Detailed steps with testing criteria saved in memory
4. ✅ **Execute with Testing** - Every step validated using Playwright/Glass MCP before proceeding
5. ✅ **Prove Completion** - Comprehensive validation using all MCP tools with evidence
6. ✅ **Never Stop** - Continue until 100% complete and all tests pass
7. ✅ **Auto-Challenge** - Move to next task automatically

> **📋 See SIMPLE_AGENT_PROMPT.md for complete details on what the agent does automatically**

---

## 🔄 AUTONOMOUS TASK EXECUTION WORKFLOW

### Step 0: MANDATORY ECOSYSTEM UNDERSTANDING
Before claiming any task, EVERY agent MUST:

```javascript
// 1. READ ECOSYSTEM DOCUMENTATION
read_file("E:/GitHub/codai-project/README.md")
read_file("E:/GitHub/codai-project/DESCRIPTION.md") 
read_file("E:/GitHub/codai-project/package.json")

// 2. CHECK BROWSER STATUS (Playwright MCP)
mcp_playwrightmcp_playwright_navigate("http://localhost:8080")
mcp_playwrightmcp_playwright_console_logs()

// 3. EXAMINE WINDOWS (Glass MCP)  
mcp_glassmcpserve_window_list()
mcp_glassmcpserve_window_extract_text_by_title("VS Code")

// 4. ACCESS MEMORY INTELLIGENCE (Memorai MCP)
mcp_memoraimcpser_context(agentId="codai-agent", contextSize=10)
mcp_memoraimcpser_recall(agentId="codai-agent", query="ecosystem_status current_deployment services", limit=10)

// 5. GET AI INTELLIGENCE (ROMAI MCP)
mcp_romai_romai_intelligence("analyze current CODAI ecosystem status and priorities")
```

### Step 1: Check Task Queue
```javascript
// Get current priority tasks
mcp_memoraimcpser_recall(agentId="codai-agent", query="priority_tasks available unclaimed", limit=10)

// Check what other agents are working on
mcp_memoraimcpser_recall(agentId="codai-agent", query="active_tasks claimed in_progress", limit=10)
```

### Step 2: CREATE DETAILED ACTION PLAN
```javascript
// MANDATORY: Create comprehensive step-by-step plan
const actionPlan = {
  taskId: "[task_id]",
  objective: "[clear objective]",
  currentState: "[ecosystem analysis]", 
  targetState: "[desired outcome]",
  detailedSteps: [
    "Step 1: [specific action with tools]",
    "Step 2: [specific action with validation]", 
    "Step 3: [specific action with testing]",
    // ... continue until completion
  ],
  testingCriteria: [
    "Test 1: [validation method]",
    "Test 2: [success criteria]",
    // ... comprehensive testing
  ],
  successMetrics: "[measurable outcomes]",
  failureRecovery: "[backup plans]"
}

// Store the plan in memory
mcp_memoraimcpser_remember(agentId="codai-agent", 
  content=`ACTION_PLAN: ${taskId} - ${JSON.stringify(actionPlan)}`, 
  metadata={
    entityType: "action_plan",
    taskId: "[task_id]", 
    planStatus: "created"
  }
)
```

### Step 3: Claim Task with Plan
```javascript
// Claim task with detailed plan attached
mcp_memoraimcpser_remember(agentId="codai-agent",
  content="TASK_CLAIMED: [task_id] by agent_[timestamp] with comprehensive action plan",
  metadata={
    entityType: "task_claim",
    taskId: "[task_id]",
    claimedBy: "agent_[timestamp]",
    status: "claimed_with_plan",
    planId: "[plan_reference]"
  }
)
```

### Step 4: Execute Plan with Continuous Testing
- **EXECUTE EVERY STEP**: Follow the detailed action plan exactly
- **TEST EVERY STEP**: Validate each step before proceeding
- **NEVER SKIP STEPS**: Complete all steps or update plan if blocked
- **USE ALL MCP TOOLS**: Leverage Playwright, Glass, Memorai, ROMAI for intelligence
- **REPORT PROGRESS**: Update memory every step completion

```javascript
// Progress update template for EVERY step
mcp_memoraimcpser_remember(agentId="codai-agent",
  content="STEP_COMPLETED: [task_id] Step X/Y - [action] - [test_result] - [next_action]",
  metadata={
    entityType: "step_completion",
    taskId: "[task_id]",
    stepNumber: "X/Y", 
    testPassed: true/false,
    nextStep: "[description]"
  }
)
```

### Step 5: Comprehensive Validation & Completion
```javascript
// Final validation using ALL available tools
// 1. Browser testing (Playwright MCP)
mcp_playwrightmcp_playwright_navigate("[service_url]")
mcp_playwrightmcp_playwright_get_visible_text()
mcp_playwrightmcp_playwright_console_logs()

// 2. Window validation (Glass MCP) 
mcp_glassmcpserve_window_list()
mcp_glassmcpserve_window_extract_text_by_title("[app_name]")

// 3. Intelligence analysis (ROMAI MCP)
mcp_romai_romai_intelligence("validate task completion success for [task_id]")

// 4. Mark task complete with proof
mcp_memoraimcpser_remember(agentId="codai-agent",
  content="TASK_COMPLETED: [task_id] - ALL STEPS TESTED AND PASSED - [comprehensive_results]",
  metadata={
    entityType: "task_completion",
    taskId: "[task_id]",
    status: "completed_and_validated",
    testResults: "[all_test_outcomes]",
    proofOfCompletion: "[verification_data]"
  }
)
```

### Step 6: Auto-Select Next Challenge
- Immediately query for next highest priority available task
- Loop back to Step 0 with fresh ecosystem analysis
- **NEVER STOP** until all tasks are completed and tested

---

## 📋 CURRENT PRIORITY TASK QUEUE

### 🔴 **PRIORITY 1: CRITICAL SYSTEM TASKS**

#### **TASK-001: Ecosystem Health Monitoring**
- **Objective**: Monitor all 9 running services for stability
- **Steps**:
  1. Check terminal outputs for all active services
  2. Identify any crashed or failing services  
  3. Restart failed services immediately
  4. Report ecosystem health status
- **Estimated Time**: 5 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-002: Dependency Resolution for Core Apps**
- **Objective**: Fix missing Next.js dependencies preventing app deployment
- **Affected Apps**: admin, hub, wallet, sociai, metu, publicai, dexai, docs
- **Steps**:
  1. Navigate to first affected app directory
  2. Run `pnpm install --no-frozen-lockfile` in app directory
  3. Test app startup
  4. Move to next app if successful, debug if failed
- **Estimated Time**: 15 minutes per app
- **Status**: ⚪ AVAILABLE

#### **TASK-003: API Gateway Service Discovery Update**
- **Objective**: Update API Gateway with current running services
- **Steps**:
  1. Check current API Gateway configuration
  2. Update service registry with active ports
  3. Test all route proxying
  4. Document available endpoints
- **Estimated Time**: 10 minutes
- **Status**: ⚪ AVAILABLE

### 🟡 **PRIORITY 2: EXPANSION TASKS**

#### **TASK-004: Deploy Missing Financial Services**
- **Objective**: Complete financial platform (wallet, dexai)
- **Dependencies**: Complete TASK-002 for wallet and dexai
- **Steps**:
  1. Fix wallet dependencies
  2. Start wallet on port 4066
  3. Fix dexai dependencies  
  4. Start dexai on port 4067
  5. Validate financial platform integration
- **Estimated Time**: 20 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-005: Deploy Social Platform Services**
- **Objective**: Complete presentation platform (sociai, publicai)
- **Dependencies**: Complete TASK-002 for sociai and publicai
- **Steps**:
  1. Fix sociai dependencies
  2. Start sociai on port 4082
  3. Fix publicai dependencies
  4. Start publicai on port 4083
  5. Test presentation platform integration
- **Estimated Time**: 20 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-006: Deploy Analytics Platform**
- **Objective**: Complete analytics tools (admin, analizai)
- **Dependencies**: Complete TASK-002 for admin
- **Steps**:
  1. Fix admin dependencies
  2. Start admin on port 4070
  3. Restart analizai if needed on port 4095
  4. Validate analytics platform functionality
- **Estimated Time**: 15 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-007: Deploy Desktop Platform**
- **Objective**: Get metu desktop application running
- **Dependencies**: Complete TASK-002 for metu
- **Steps**:
  1. Fix metu electron-vite dependencies
  2. Start metu desktop application
  3. Test desktop platform functionality
  4. Ensure cross-platform compatibility
- **Estimated Time**: 25 minutes
- **Status**: ⚪ AVAILABLE

### 🟢 **PRIORITY 3: OPTIMIZATION TASKS**

#### **TASK-008: Configuration Cleanup**
- **Objective**: Fix next.config.js warnings across all apps
- **Steps**:
  1. Identify apps with next.config.js warnings
  2. Remove deprecated 'appDir' experimental settings
  3. Update to use stable App Router configuration
  4. Test each app after configuration update
- **Estimated Time**: 10 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-009: Lockfile Consolidation**
- **Objective**: Remove duplicate pnpm-lock.yaml files
- **Steps**:
  1. Identify apps with duplicate lockfiles
  2. Remove app-level pnpm-lock.yaml files
  3. Ensure workspace-level lockfile handles all dependencies
  4. Test affected apps for functionality
- **Estimated Time**: 15 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-010: Performance Monitoring Setup**
- **Objective**: Implement automated performance monitoring
- **Steps**:
  1. Create health check endpoints for all services
  2. Implement automated uptime monitoring
  3. Set up performance metrics collection
  4. Create monitoring dashboard
- **Estimated Time**: 30 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-011: Documentation Generation**
- **Objective**: Auto-generate current ecosystem documentation
- **Dependencies**: Deploy docs app (TASK-002)
- **Steps**:
  1. Fix docs app dependencies
  2. Start docs on port 4074
  3. Generate API documentation for all running services
  4. Create ecosystem overview documentation
- **Estimated Time**: 20 minutes
- **Status**: ⚪ AVAILABLE

### 🔵 **PRIORITY 4: ADVANCED FEATURES**

#### **TASK-012: AI Services Platform**
- **Objective**: Deploy AI-powered services (logai, ajutai, studiai)
- **Dependencies**: Complete TypeScript dependency resolution
- **Steps**:
  1. Fix TypeScript build issues in logai packages
  2. Deploy logai on port 4086
  3. Deploy ajutai on port 4087
  4. Deploy studiai on port 4088
  5. Integrate AI services with existing platform
- **Estimated Time**: 45 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-013: Integration Hub Deployment**
- **Objective**: Deploy remaining integration services
- **Steps**:
  1. Deploy romai (Romanian services) on port 4075
  2. Deploy remaining specialized apps (curtai, donai, etc.)
  3. Integrate all services with API Gateway
  4. Test end-to-end ecosystem functionality
- **Estimated Time**: 60 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-014: Mobile Platform Deployment**
- **Objective**: Deploy mobile and AR/VR platforms
- **Steps**:
  1. Deploy mobile app on port 4084
  2. Deploy glass (AR/VR) on port 4085
  3. Test cross-platform compatibility
  4. Ensure mobile-desktop synchronization
- **Estimated Time**: 40 minutes
- **Status**: ⚪ AVAILABLE

#### **TASK-015: Complete Ecosystem Optimization**
- **Objective**: Achieve 100% ecosystem deployment and optimization
- **Dependencies**: All previous tasks completed
- **Steps**:
  1. Validate all 43 apps are deployed and functional
  2. Optimize resource usage and performance
  3. Implement automated scaling and load balancing
  4. Create comprehensive monitoring and alerting
  5. Document complete ecosystem architecture
- **Estimated Time**: 90 minutes
- **Status**: ⚪ AVAILABLE

---

## 🔒 TASK COORDINATION PROTOCOL

### Conflict Avoidance
- Only one agent can claim a task at a time
- Tasks are marked as "claimed" with agent timestamp
- If agent doesn't update progress for 10 minutes, task becomes available again
- Agents check for task conflicts before starting work

### Progress Reporting
```javascript
// Progress update every major step
mcp_memoraimcpser_remember(agentId="codai-agent",
  content="TASK_PROGRESS: [task_id] - Step X/Y completed - [status]",
  metadata={
    entityType: "task_progress", 
    taskId: "[task_id]",
    progress: "X/Y",
    status: "[current_step]"
  }
)
```

### Task Dependencies
- Tasks with dependencies show "Dependencies: Complete TASK-XXX first"
- Agents automatically check if dependencies are completed before claiming
- Dependent tasks become available automatically when prerequisites finish

---

## 🚀 GETTING STARTED

Simply activate any agent with the **simple generic prompt**:

```
You are an autonomous agent in the CODAI Multi-Agent System. Pick the next priority task and execute it completely.
```

The agent will immediately and automatically:
1. **Read ecosystem files** (README.md, DESCRIPTION.md, package.json) to understand the CODAI project
2. **Use Playwright MCP** to check browser status, console logs, and active content
3. **Use Glass MCP** to analyze windows, extract text, and monitor applications
4. **Use Memorai MCP** to access memory context and store progress
5. **Use ROMAI MCP** for intelligent analysis and decision support
6. **Create detailed action plan** with step-by-step instructions and testing criteria
7. **Execute the plan** with continuous validation and testing of every step
8. **Complete the task** with comprehensive proof of success
9. **Automatically move** to the next highest priority task

**No role assignments, no manual instructions, no configuration needed - just pure autonomous execution with your challenge protocol built-in!**

> **💡 For complete implementation details, see SIMPLE_AGENT_PROMPT.md**
