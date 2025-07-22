# TypeScript Configuration Deployment Script
# Deploys standardized tsconfig.json to all app packages

$ErrorActionPreference = "Stop"
$rootDir = "e:\GitHub\codai-project"
$templateFile = "$rootDir\tsconfig.template.json"

Write-Host "🔧 Starting TypeScript Configuration Standardization..." -ForegroundColor Yellow

# Get all app directories
$appDirs = Get-ChildItem -Path "$rootDir\apps" -Directory | Where-Object { 
    Test-Path "$($_.FullName)\package.json" 
}

Write-Host "📦 Found $($appDirs.Count) app packages to update" -ForegroundColor Green

foreach ($appDir in $appDirs) {
    $appName = $appDir.Name
    $tsConfigPath = "$($appDir.FullName)\tsconfig.json"
    
    Write-Host "  📝 Updating $appName..." -ForegroundColor Cyan
    
    try {
        # Copy template to app directory
        Copy-Item -Path $templateFile -Destination $tsConfigPath -Force
        Write-Host "    ✅ Updated tsconfig.json for $appName" -ForegroundColor Green
    }
    catch {
        Write-Host "    ❌ Failed to update $appName`: $_" -ForegroundColor Red
    }
}

Write-Host "🎉 TypeScript configuration deployment complete!" -ForegroundColor Green
