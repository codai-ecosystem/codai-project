# Isolated Dashboard Startup Script
Write-Host "Starting Memorai Dashboard in isolated mode..." -ForegroundColor Green

# Set working directory
Set-Location -Path $PSScriptRoot

# Clear any turbo interference
$env:TURBO_FORCE = "false"
$env:TURBO_CACHE = "false"

# Clean Next.js cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cleared .next cache" -ForegroundColor Yellow
}

# Start Next.js directly
Write-Host "Starting Next.js on port 4032..." -ForegroundColor Cyan
npx next dev --port 4032
