#!/usr/bin/env pwsh

# Script to update VS Code MCP configuration after Glass/ControlAI name swap
# Run this script to automatically update your MCP configuration

$mcpConfigPath = "C:\Users\vladu\VS Code Insiders Profiles\ghcp1_metu\User\profiles\5eb2e7aa\mcp.json"
$backupPath = "$mcpConfigPath.backup"

Write-Host "🔧 Updating VS Code MCP Configuration..." -ForegroundColor Cyan
Write-Host ""

# Create backup
if (Test-Path $mcpConfigPath) {
    Write-Host "📋 Creating backup of existing configuration..." -ForegroundColor Yellow
    Copy-Item $mcpConfigPath $backupPath
    Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
}

# Updated configuration
$newConfig = @"
{
  "mcpServers": {
    "glass-mcp": {
      "command": "npx",
      "args": ["@codai/glass-mcp@2.1.0"],
      "description": "Glass MCP - AI-powered project management server (formerly ControlAI MCP)",
      "env": {
        "GLASS_MCP_PORT": "7001",
        "GLASS_MCP_MODE": "project-management"
      }
    },
    "controlai-mcp": {
      "command": "npx", 
      "args": ["@codai/controlai-mcp@2.1.0"],
      "description": "ControlAI MCP - UI automation and visual intelligence server (formerly Glass MCP)",
      "env": {
        "CONTROLAI_MCP_PORT": "7002", 
        "CONTROLAI_MCP_MODE": "ui-automation"
      }
    },
    "memorai-mcp": {
      "command": "npx",
      "args": ["@codai/memorai-mcp@latest"],
      "description": "MemorAI MCP - Advanced memory management and context preservation"
    },
    "cautai-mcp": {
      "command": "npx", 
      "args": ["@codai/cautai-mcp@latest"],
      "description": "CAUTAI MCP - Web search and information retrieval server"
    }
  }
}
"@

# Write new configuration
try {
    $newConfig | Out-File -FilePath $mcpConfigPath -Encoding UTF8
    Write-Host ""
    Write-Host "✅ MCP configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Changes made:" -ForegroundColor Yellow
    Write-Host "  - glass-mcp: Now configured as PROJECT MANAGEMENT server" -ForegroundColor White
    Write-Host "  - controlai-mcp: Now configured as UI AUTOMATION server" -ForegroundColor White
    Write-Host "  - Updated to version 2.1.0 with correct functionality assignments" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Restart VS Code Insiders to apply changes!" -ForegroundColor Magenta
} catch {
    Write-Host "❌ Failed to update configuration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please manually update the file with the configuration from mcp-configuration-update.json" -ForegroundColor Yellow
}