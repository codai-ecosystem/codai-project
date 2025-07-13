# Simple development server start script for DEXAI Dictionary
Write-Host "🚀 Starting DEXAI Dictionary Development Server..." -ForegroundColor Green
Write-Host "📍 Project: Enhanced Romanian Dictionary Application" -ForegroundColor Cyan
Write-Host ""

# Change to web app directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Start the development server
Write-Host "🌐 Starting Next.js development server..." -ForegroundColor Blue
Write-Host "💡 The application will be available at: http://localhost:3000" -ForegroundColor Magenta
Write-Host "📖 Dictionary interface at: http://localhost:3000/dictionary" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

# Start development server
pnpm dev
