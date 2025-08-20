#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Start CBD Universal Database Services using VS Code-compatible commands
.DESCRIPTION
    Starts all CBD services in the correct order for Phase 3 testing
#>

Write-Host "🚀 Starting CBD Universal Database Services..." -ForegroundColor Green

# Change to CBD directory
Set-Location "E:\GitHub\codai-project\packages\cbd"

Write-Host "`n📊 Starting CBD Core Database (4180)..." -ForegroundColor Yellow
Start-Process -FilePath "tsx" -ArgumentList "../../../tsx", "src/start.ts" -WorkingDirectory "E:\GitHub\codai-project\packages\cbd" -NoNewWindow

Write-Host "⏳ Waiting for CBD Core Database to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n👥 Starting Real-time Collaboration Service (4600)..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "cbd-collaboration-service.cjs" -WorkingDirectory "E:\GitHub\codai-project\packages\cbd" -NoNewWindow

Write-Host "⏳ Waiting for Collaboration Service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n🤖 Starting AI Analytics Engine (4700)..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "cbd-ai-analytics-engine.cjs" -WorkingDirectory "E:\GitHub\codai-project\packages\cbd" -NoNewWindow

Write-Host "⏳ Waiting for AI Analytics Engine to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n🌐 Starting GraphQL Gateway (4800)..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "cbd-graphql-gateway.cjs" -WorkingDirectory "E:\GitHub\codai-project\packages\cbd" -NoNewWindow

Write-Host "⏳ Waiting for GraphQL Gateway to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n🔍 Checking service status..." -ForegroundColor Cyan
netstat -ano | Select-String -Pattern ":(4180|4600|4700|4800)" | Sort-Object

Write-Host "`n✅ CBD Services startup initiated!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "   1. Run comprehensive test suite" -ForegroundColor Gray
Write-Host "   2. Check individual service health endpoints" -ForegroundColor Gray
Write-Host "   3. Verify all 21 tests pass" -ForegroundColor Gray
