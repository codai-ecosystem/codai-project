#!/usr/bin/env pwsh
# Package Manager Test Script
# Test that npm and pnpm commands show proper output

Write-Host "🧪 Package Manager Output Test" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Gray

# Test 1: pnpm version and config
Write-Host "`n1. Testing pnpm basic commands..." -ForegroundColor Yellow
pnpm --version
pnpm config list | Select-String "reporter|progress|loglevel" | Format-Table -AutoSize

# Test 2: pnpm install with output
Write-Host "`n2. Testing pnpm install output (quick test)..." -ForegroundColor Yellow
$startTime = Get-Date
pnpm install --reporter=append-only --loglevel=info --no-optional
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds
Write-Host "✅ pnpm install completed in $($duration.ToString('0.0')) seconds" -ForegroundColor Green

# Test 3: npm functionality
Write-Host "`n3. Testing npm basic commands..." -ForegroundColor Yellow
npm --version
npm config get progress
npm config get loglevel

# Test 4: Test individual workspace commands
Write-Host "`n4. Testing workspace commands..." -ForegroundColor Yellow
Write-Host "Available workspaces:" -ForegroundColor White
pnpm -r list --depth=0 | Select-String "apps/" | Select-Object -First 5

Write-Host "`n🎉 Package manager tests completed!" -ForegroundColor Green
Write-Host "`nTo use with full output visibility:" -ForegroundColor Yellow
Write-Host "  pnpm install --reporter=append-only --loglevel=info" -ForegroundColor White
Write-Host "  pnpm add <package> --reporter=append-only --loglevel=info" -ForegroundColor White
Write-Host "  pnpm build --reporter=append-only --loglevel=info" -ForegroundColor White
Write-Host "  npm install --verbose --progress=true" -ForegroundColor White
