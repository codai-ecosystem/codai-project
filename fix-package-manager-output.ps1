# PowerShell Package Manager Configuration
# This script sets up proper output visibility for pnpm and npm commands

Write-Host "🔧 Configuring Package Manager Output Settings..." -ForegroundColor Cyan

# Configure PNPM for verbose output
Write-Host "📦 Configuring PNPM..." -ForegroundColor Yellow
pnpm config set progress true --location global
pnpm config set reporter default --location global
pnpm config delete reporter --location project 2>$null
pnpm config delete progress --location project 2>$null

# Configure NPM for verbose output  
Write-Host "📦 Configuring NPM..." -ForegroundColor Yellow
npm config set progress true --location global
npm config set loglevel info --location global

# Verify settings
Write-Host "`n✅ Current Settings:" -ForegroundColor Green
Write-Host "PNPM Progress: " -NoNewline -ForegroundColor White
pnpm config get progress
Write-Host "PNPM Reporter: " -NoNewline -ForegroundColor White  
pnpm config get reporter
Write-Host "NPM Progress: " -NoNewline -ForegroundColor White
npm config get progress
Write-Host "NPM Log Level: " -NoNewline -ForegroundColor White
npm config get loglevel

Write-Host "`n🎯 Package manager output should now be visible!" -ForegroundColor Green
