#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Start METU Development Stack
.DESCRIPTION
    Starts all METU services in the correct order:
    1. Backend Server (port 4402)
    2. Web App (port 4400) 
    3. Electron App (port 6388)
.EXAMPLE
    .\start-metu-dev.ps1
#>

Write-Host "🚀 Starting METU Development Stack..." -ForegroundColor Green

# Clean up any existing processes
Write-Host "🧹 Cleaning up existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

# Check if ports are free
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow
$portsInUse = netstat -ano | findstr ":440"
if ($portsInUse) {
    Write-Host "⚠️  Some ports may still be in use. Waiting..." -ForegroundColor Yellow  
    Start-Sleep -Seconds 3
}

Write-Host "📡 Starting Backend Server (port 4402)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-Command", "cd '$PSScriptRoot'; pnpm --filter=metu server:dev" -WindowStyle Normal

Write-Host "⏳ Waiting for Backend Server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "🌐 Starting Web App (port 4400)..." -ForegroundColor Cyan  
Start-Process pwsh -ArgumentList "-Command", "cd '$PSScriptRoot'; pnpm --filter=metu dev:web" -WindowStyle Normal

Write-Host "⏳ Waiting for Web App to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

Write-Host "🖥️  Starting Electron App (port 6388)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-Command", "cd '$PSScriptRoot/apps/metu'; pnpm electron-vite dev" -WindowStyle Normal

Write-Host "✅ METU Development Stack started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services running:" -ForegroundColor White
Write-Host "   🔧 Backend Server:  http://localhost:4402" -ForegroundColor Gray
Write-Host "   🌐 Web App:         http://localhost:4400" -ForegroundColor Gray  
Write-Host "   🖥️  Electron App:    http://localhost:6388" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 To check status: netstat -ano | findstr :440" -ForegroundColor White
Write-Host "🛑 To stop all: taskkill /F /IM node.exe" -ForegroundColor White
