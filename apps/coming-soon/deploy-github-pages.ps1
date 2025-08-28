#!/usr/bin/env pwsh

Write-Host "🚀 CODAI Coming Soon - GitHub Pages Deployment Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Build the application
Write-Host "`n📦 Building application..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Export static files
Write-Host "`n📤 Exporting static files..." -ForegroundColor Yellow
node ../../node_modules/next/dist/bin/next export

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Export failed!" -ForegroundColor Red
    exit 1
}

# Create GitHub Pages deployment branch
Write-Host "`n🌐 Preparing GitHub Pages deployment..." -ForegroundColor Yellow

# Check if we're in a git repository
if (-not (Test-Path ".git" -PathType Container)) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Blue
    git init
    git remote add origin https://github.com/codai-ecosystem/codai-coming-soon.git
}

# Create gh-pages branch
Write-Host "🌿 Creating/updating gh-pages branch..." -ForegroundColor Blue
git checkout --orphan gh-pages 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout gh-pages 2>$null
}

# Copy export files
Write-Host "📋 Copying exported files..." -ForegroundColor Blue
if (Test-Path "out") {
    Copy-Item -Path "out\*" -Destination "." -Recurse -Force
    
    # Create .nojekyll file for GitHub Pages
    New-Item -ItemType File -Path ".nojekyll" -Force | Out-Null
    
    # Add CNAME for custom domain (optional)
    # "coming-soon.codai.ro" | Out-File -FilePath "CNAME" -Encoding ascii
    
    Write-Host "✅ Files prepared for GitHub Pages!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. git add ." -ForegroundColor White
    Write-Host "2. git commit -m 'Deploy CODAI Coming Soon to GitHub Pages'" -ForegroundColor White
    Write-Host "3. git push origin gh-pages" -ForegroundColor White
    Write-Host "`nThen enable GitHub Pages in repository settings!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Export directory 'out' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 GitHub Pages deployment ready!" -ForegroundColor Green