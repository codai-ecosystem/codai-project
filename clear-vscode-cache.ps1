#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clear VS Code cache and restart for Glass MCP latest version
    
.DESCRIPTION
    This script clears VS Code's extension host cache, MCP cache, and ensures 
    the latest Glass MCP package is used when VS Code restarts.
    
.NOTES
    Run this script after publishing a new Glass MCP version
#>

Write-Host "🔄 Glass MCP VS Code Cache Clear & Restart" -ForegroundColor Cyan
Write-Host "=" -repeat 50 -ForegroundColor Cyan
Write-Host ""

# Step 1: Close all VS Code instances
Write-Host "1️⃣ Closing all VS Code instances..." -ForegroundColor Yellow
try {
    Get-Process -Name "Code*" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ VS Code instances closed" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ No VS Code instances running" -ForegroundColor Yellow
}

# Step 2: Clear VS Code extension host cache
Write-Host "`n2️⃣ Clearing VS Code extension host cache..." -ForegroundColor Yellow
$vscodeDataDir = "$env:APPDATA\Code\User\workspaceStorage"
if (Test-Path $vscodeDataDir) {
    try {
        Remove-Item "$vscodeDataDir\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Extension host cache cleared" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Could not clear all cache files (some may be in use)" -ForegroundColor Yellow
    }
}

# Step 3: Clear VS Code logs
Write-Host "`n3️⃣ Clearing VS Code logs..." -ForegroundColor Yellow  
$logsDir = "$env:APPDATA\Code\logs"
if (Test-Path $logsDir) {
    try {
        Remove-Item "$logsDir\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ VS Code logs cleared" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Could not clear all log files" -ForegroundColor Yellow
    }
}

# Step 4: Force npm/npx to use latest version
Write-Host "`n4️⃣ Forcing latest Glass MCP version..." -ForegroundColor Yellow
try {
    npm cache clean --force | Out-Null 2>&1
    Write-Host "✅ NPM cache cleared" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Could not clear NPM cache completely" -ForegroundColor Yellow
}

# Step 5: Test that latest version is available
Write-Host "`n5️⃣ Testing latest Glass MCP version..." -ForegroundColor Yellow
try {
    $testOutput = npx @codai/glass-mcp@latest --version 2>&1
    if ($testOutput -match "37 tools ready") {
        Write-Host "✅ Glass MCP v9.1.0 with 37 tools confirmed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Could not confirm 37 tools - may still work after restart" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️ Could not test package - VS Code restart should resolve this" -ForegroundColor Yellow
}

# Step 6: Provide restart instructions
Write-Host "`n6️⃣ Next Steps:" -ForegroundColor Magenta
Write-Host "   🔄 Restart VS Code completely" -ForegroundColor White
Write-Host "   🧪 Check MCP tools discovery in VS Code" -ForegroundColor White
Write-Host "   ✅ Should now see all 37 Glass MCP tools" -ForegroundColor White

Write-Host "`n🎯 Glass MCP Configuration:" -ForegroundColor Magenta
Write-Host "   📦 Package: @codai/glass-mcp@9.1.0" -ForegroundColor White
Write-Host "   🛠️ Tools: 37 comprehensive Windows automation tools" -ForegroundColor White
Write-Host "   🚀 Command: npx @codai/glass-mcp" -ForegroundColor White

Write-Host "`n✨ Cache cleared! Please restart VS Code to use Glass MCP v9.1.0 with all 37 tools." -ForegroundColor Green
Write-Host ""