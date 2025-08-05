#!/usr/bin/env pwsh

Write-Host "🧪 Testing Package Manager Output Visibility" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Test PNPM
Write-Host "`n📦 Testing PNPM..." -ForegroundColor Yellow
Write-Host "PNPM Version:" -ForegroundColor White
pnpm --version

Write-Host "`nPNPM Config (relevant settings):" -ForegroundColor White
pnpm config get progress
pnpm config get reporter

# Test NPM
Write-Host "`n📦 Testing NPM..." -ForegroundColor Yellow
Write-Host "NPM Version:" -ForegroundColor White
npm --version

Write-Host "`nNPM Config (relevant settings):" -ForegroundColor White
npm config get progress
npm config get loglevel

# Test a simple install with verbose output
Write-Host "`n📦 Testing PNPM Install with Progress..." -ForegroundColor Yellow
Write-Host "Running: pnpm list --depth=0" -ForegroundColor Gray
pnpm list --depth=0

Write-Host "`n✅ Package Manager Test Complete!" -ForegroundColor Green
