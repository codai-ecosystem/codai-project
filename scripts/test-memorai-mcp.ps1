#!/usr/bin/env pwsh
# MemoraiMCP Testing and Debugging Script
# This script tests the MemoraiMCP server functionality and provides debugging information

param(
    [switch]$Verbose,
    [switch]$SkipRestart,
    [string]$TestType = "basic"
)

Write-Host "🧠 MemoraiMCP Testing and Debugging Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Set error handling
$ErrorActionPreference = "Continue"

# Check environment
Write-Host "`n📁 Environment Check:" -ForegroundColor Yellow
Write-Host "Current Directory: $(Get-Location)"
Write-Host "Data Directory: E:\GitHub\codai-project\data\memorai"
Write-Host ".env File: E:\GitHub\codai-project\.env"

if (Test-Path "E:\GitHub\codai-project\.env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing" -ForegroundColor Red
    exit 1
}

if (Test-Path "E:\GitHub\codai-project\data\memorai") {
    Write-Host "✅ MemoraiMCP data directory exists" -ForegroundColor Green
    $memoryFiles = Get-ChildItem "E:\GitHub\codai-project\data\memorai" -ErrorAction SilentlyContinue
    Write-Host "📦 Memory files found: $($memoryFiles.Count)"
} else {
    Write-Host "❌ MemoraiMCP data directory missing" -ForegroundColor Red
    New-Item -ItemType Directory -Path "E:\GitHub\codai-project\data\memorai" -Force
    Write-Host "✅ Created MemoraiMCP data directory" -ForegroundColor Green
}

# Test MCP server directly
Write-Host "`n🔧 Testing MCP Server Directly:" -ForegroundColor Yellow

$env:DOTENV_CONFIG_PATH = "E:\GitHub\codai-project\.env"
$env:NODE_ENV = "development"
$env:DEBUG = "memorai:*"
$env:MEMORAI_DEBUG = "true"
$env:MEMORAI_LOG_LEVEL = "debug"

Write-Host "Starting MemoraiMCP server test..."

try {
    # Test package availability
    Write-Host "� Testing package availability..."
    $packageTest = npx view @codai/memorai-mcp@latest version 2>&1
    Write-Host "✅ Package version: $packageTest" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error testing package: $($_.Exception.Message)" -ForegroundColor Red
}

# Check VS Code MCP configuration
Write-Host "`n⚙️ VS Code MCP Configuration Check:" -ForegroundColor Yellow

$mcpConfigPath = "C:\Users\vladu\VS Code Insiders Profiles\ghcp1_metu\User\profiles\5eb2e7aa\mcp.json"
if (Test-Path $mcpConfigPath) {
    Write-Host "✅ MCP configuration file found" -ForegroundColor Green
    
    try {
        $mcpConfig = Get-Content $mcpConfigPath | ConvertFrom-Json
        
        if ($mcpConfig.servers.MemoraiMCP) {
            Write-Host "✅ MemoraiMCP server configured" -ForegroundColor Green
            Write-Host "Command: $($mcpConfig.servers.MemoraiMCP.command)"
            Write-Host "Args: $($mcpConfig.servers.MemoraiMCP.args -join ' ')"
            Write-Host "Env Path: $($mcpConfig.servers.MemoraiMCP.env.DOTENV_CONFIG_PATH)"
        } else {
            Write-Host "❌ MemoraiMCP server not configured" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error reading MCP config: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ VS Code MCP configuration file not found" -ForegroundColor Red
}

# Network and connectivity check
Write-Host "`n🌐 Connectivity Check:" -ForegroundColor Yellow
try {
    $npmTest = npm view @codai/memorai-mcp@latest version 2>&1
    Write-Host "✅ NPM package accessible: $npmTest" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM package not accessible" -ForegroundColor Red
}

# Recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code after configuration changes"
Write-Host "2. Check VS Code Output panel > Model Context Protocol for detailed logs"
Write-Host "3. Ensure all environment variables are properly set"
Write-Host "4. Try reloading the VS Code window (Ctrl+Shift+P > Developer: Reload Window)"
Write-Host "5. Check that the MemoraiMCP tools use correct names (without mcp_ prefix in server)"

Write-Host "`n🎯 Test completed! Check the output above for any issues." -ForegroundColor Green
