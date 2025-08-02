# PNPM Performance Optimization Script
# This script addresses slow pnpm install/add operations

Write-Host "🚀 CODAI Project - PNPM Performance Optimization" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check current pnpm version
Write-Host "📋 Current PNPM Configuration:" -ForegroundColor Yellow
pnpm --version
Write-Host ""

# Check store location and size
Write-Host "📊 PNPM Store Analysis:" -ForegroundColor Yellow
$storeLocation = pnpm store path
Write-Host "Store Location: $storeLocation" -ForegroundColor White
if (Test-Path $storeLocation) {
    $storeSize = (Get-ChildItem -Path $storeLocation -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Store Size: $([math]::Round($storeSize, 2)) MB" -ForegroundColor White
} else {
    Write-Host "Store not found or empty" -ForegroundColor Gray
}
Write-Host ""

# Check lock file size
Write-Host "🔒 Lock File Analysis:" -ForegroundColor Yellow
$lockFile = "pnpm-lock.yaml"
if (Test-Path $lockFile) {
    $lockSize = (Get-Item $lockFile).Length / 1MB
    Write-Host "Lock File Size: $([math]::Round($lockSize, 2)) MB" -ForegroundColor White
    if ($lockSize -gt 2) {
        Write-Host "⚠️  Large lock file detected - this may slow operations" -ForegroundColor Red
    }
} else {
    Write-Host "No lock file found" -ForegroundColor Gray
}
Write-Host ""

# Optimization steps
Write-Host "🔧 Performing Optimizations:" -ForegroundColor Green

Write-Host "1. Pruning unused packages from store..." -ForegroundColor White
pnpm store prune

Write-Host "2. Verifying store integrity..." -ForegroundColor White
pnpm store status

Write-Host "3. Cleaning node_modules..." -ForegroundColor White
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✅ Removed root node_modules" -ForegroundColor Green
}

# Clean individual app node_modules
$appDirs = @("apps\admin", "apps\bancai", "apps\codai", "apps\controlai-dashboard", "apps\gateway", "apps\hub", "apps\id", "apps\memorai", "packages\cbd")
foreach ($dir in $appDirs) {
    $nodeModulesPath = "$dir\node_modules"
    if (Test-Path $nodeModulesPath) {
        Remove-Item -Recurse -Force $nodeModulesPath
        Write-Host "   ✅ Removed $nodeModulesPath" -ForegroundColor Green
    }
}

Write-Host "4. Optimized reinstall with performance settings..." -ForegroundColor White
$env:NODE_OPTIONS = "--max-old-space-size=4096"
pnpm install --prefer-offline --no-frozen-lockfile --reporter=silent

Write-Host ""
Write-Host "✅ Optimization Complete!" -ForegroundColor Green
Write-Host "📈 Performance Tips:" -ForegroundColor Cyan
Write-Host "   • Use 'pnpm add <package> --prefer-offline' for faster installs" -ForegroundColor White
Write-Host "   • Run 'pnpm store prune' weekly to clean unused packages" -ForegroundColor White
Write-Host "   • Consider using --reporter=silent for quieter installs" -ForegroundColor White
Write-Host "   • Use VS Code task '⚡ Quick Install' for development" -ForegroundColor White
