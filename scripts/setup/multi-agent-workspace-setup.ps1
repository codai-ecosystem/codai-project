# 🏗️ PowerShell Setup Script for CODAI Multi-Agent Workspace

param(
    [Parameter(Mandatory=$false)]
    [string]$WorkspaceId = "codai-project-main",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = "E:\GitHub\codai-project",
    
    [Parameter(Mandatory=$false)]
    [int]$ServerPort = 7001
)

Write-Host "🚀 CODAI Multi-Agent Workspace Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Verify Prerequisites
Write-Host "`n📋 Step 1: Verifying Prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm/npx
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Check VS Code
$vscodePath = Get-Command code -ErrorAction SilentlyContinue
if ($vscodePath) {
    Write-Host "✅ VS Code: Found" -ForegroundColor Green
} else {
    Write-Host "⚠️  VS Code: Not in PATH (may still be installed)" -ForegroundColor Yellow
}

# Step 2: Verify ControlAI MCP
Write-Host "`n🔧 Step 2: Verifying ControlAI MCP..." -ForegroundColor Yellow

try {
    $controlaiOutput = npx controlai-mcp@latest --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ControlAI MCP v1.0.6+ available" -ForegroundColor Green
    } else {
        Write-Host "❌ ControlAI MCP not available. Installing..." -ForegroundColor Red
        npm install -g controlai-mcp@latest
    }
} catch {
    Write-Host "❌ Failed to verify ControlAI MCP" -ForegroundColor Red
    exit 1
}

# Step 3: Setup Directory Structure
Write-Host "`n📁 Step 3: Setting up directory structure..." -ForegroundColor Yellow

$directories = @(
    "$ProjectRoot\data",
    "$ProjectRoot\templates\mcp-configs", 
    "$ProjectRoot\templates\agent-registration",
    "$ProjectRoot\docs\deployment",
    "$ProjectRoot\scripts\monitoring"
)

foreach ($dir in $directories) {
    if (!(Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Exists: $dir" -ForegroundColor Green
    }
}

# Step 4: Create Environment Configuration
Write-Host "`n🔐 Step 4: Setting up environment configuration..." -ForegroundColor Yellow

$envFile = "$ProjectRoot\.env"
$envTemplate = @"
# Azure OpenAI Configuration (Required)
AZURE_OPENAI_ENDPOINT=https://your-openai-instance.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# ControlAI Configuration
CONTROLAI_PORT=$ServerPort
CONTROLAI_HOST=localhost
CONTROLAI_DATABASE_PATH=./data/controlai.db
CONTROLAI_CORS_ORIGIN=*
CONTROLAI_WEBSOCKET_ENABLED=true

# Workspace Configuration  
WORKSPACE_ID=$WorkspaceId
PROJECT_ROOT=$ProjectRoot

# MCP Configuration
MEMORAI_DATABASE_PATH=./data/memorai.db
"@

if (!(Test-Path -Path $envFile)) {
    $envTemplate | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✅ Created .env template at: $envFile" -ForegroundColor Green
    Write-Host "⚠️  Please update Azure OpenAI credentials in .env file" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists: $envFile" -ForegroundColor Green
}

# Step 5: Create MCP Configuration Template
Write-Host "`n⚙️  Step 5: Creating MCP configuration templates..." -ForegroundColor Yellow

$mcpConfig = @"
{
  "ControlAIMCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "controlai-mcp@latest"],
    "env": {
      "DOTENV_CONFIG_PATH": "$($ProjectRoot.Replace('\', '\\'))\\.env"
    }
  },
  "MemoraiMCP": {
    "type": "stdio",
    "command": "npx", 
    "args": ["-y", "memorai-mcp@latest"],
    "env": {
      "MEMORAI_DATABASE_PATH": "$($ProjectRoot.Replace('\', '\\'))\\data\\memorai.db"
    }
  },
  "PlaywrightMCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"]
  },
  "GlassMCP": {
    "type": "stdio", 
    "command": "npx",
    "args": ["-y", "glass-mcp@latest"]
  },
  "RomaiMCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "romai-mcp@latest"]
  }
}
"@

$mcpConfigFile = "$ProjectRoot\templates\mcp-configs\mcp.json"
$mcpConfig | Out-File -FilePath $mcpConfigFile -Encoding UTF8
Write-Host "✅ Created MCP config: $mcpConfigFile" -ForegroundColor Green

# Step 6: Create Agent Activation Scripts
Write-Host "`n🤖 Step 6: Creating agent activation scripts..." -ForegroundColor Yellow

$agentScript = @"
# 🤖 Quick Agent Activation Script

# Copy this into any VS Code Copilot chat to activate autonomous agent:

You are an autonomous agent in the CODAI Multi-Agent System. Pick the next priority task and execute it completely.

# Agent Registration Templates:

## Frontend Specialist:
mcp_controlaimcp_register_agent({
  name: "Agent-Frontend-Specialist-001",
  type: "senior_developer",
  capabilities: ["javascript", "typescript", "react", "ui_ux", "testing"],
  workspaceId: "$WorkspaceId",
  maxConcurrentTasks: 1
})

## Backend Expert:
mcp_controlaimcp_register_agent({
  name: "Agent-Backend-Expert-001", 
  type: "senior_developer",
  capabilities: ["node_js", "typescript", "databases", "python", "devops"],
  workspaceId: "$WorkspaceId",
  maxConcurrentTasks: 1
})

## DevOps Engineer:
mcp_controlaimcp_register_agent({
  name: "Agent-DevOps-Engineer-001",
  type: "devops_engineer", 
  capabilities: ["devops", "deployment", "security", "testing"],
  workspaceId: "$WorkspaceId",
  maxConcurrentTasks: 1
})

## Verification:
mcp_controlaimcp_get_dashboard_data({workspaceId: "$WorkspaceId"})
"@

$agentScriptFile = "$ProjectRoot\templates\agent-registration\QUICK_ACTIVATION.md"
$agentScript | Out-File -FilePath $agentScriptFile -Encoding UTF8
Write-Host "✅ Created agent activation guide: $agentScriptFile" -ForegroundColor Green

# Step 7: Create Monitoring Script
Write-Host "`n📊 Step 7: Creating monitoring scripts..." -ForegroundColor Yellow

$monitorScript = @"
# 📊 CODAI Multi-Agent Monitoring Script

# Check workspace status
mcp_controlaimcp_get_dashboard_data({workspaceId: "$WorkspaceId"})

# Check recent task activity  
mcp_memoraimcp_recall({
  agentId: "all",
  query: "task_progress task_completion task_claimed", 
  limit: 20
})

# Check agent performance
mcp_memoraimcp_recall({
  agentId: "all", 
  query: "agent_registration agent_performance",
  limit: 10
})

# Check current active tasks
mcp_memoraimcp_recall({
  agentId: "all",
  query: "TASK_CLAIMED IN_PROGRESS",
  limit: 15  
})
"@

$monitorScriptFile = "$ProjectRoot\scripts\monitoring\workspace-monitoring.md"
$monitorScript | Out-File -FilePath $monitorScriptFile -Encoding UTF8
Write-Host "✅ Created monitoring script: $monitorScriptFile" -ForegroundColor Green

# Step 8: Final Setup Summary
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your Azure OpenAI credentials" -ForegroundColor White
Write-Host "2. Start ControlAI MCP server: npx controlai-mcp@latest" -ForegroundColor White
Write-Host "3. Copy mcp.json to each VS Code instance MCP configuration" -ForegroundColor White
Write-Host "4. Open VS Code instances and use agent activation templates" -ForegroundColor White
Write-Host "5. Monitor progress with the dashboard and monitoring scripts" -ForegroundColor White

Write-Host "`n📁 Created Files:" -ForegroundColor Cyan
Write-Host "• .env template: $envFile" -ForegroundColor White
Write-Host "• MCP config: $mcpConfigFile" -ForegroundColor White  
Write-Host "• Agent templates: $agentScriptFile" -ForegroundColor White
Write-Host "• Monitoring script: $monitorScriptFile" -ForegroundColor White

Write-Host "`n🚀 Ready to deploy autonomous agents!" -ForegroundColor Green

# Optional: Start ControlAI MCP server
$startServer = Read-Host "`nStart ControlAI MCP server now? (y/N)"
if ($startServer.ToLower() -eq 'y' -or $startServer.ToLower() -eq 'yes') {
    Write-Host "`n🚀 Starting ControlAI MCP server..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npx controlai-mcp@latest
}
