# CODAI Ecosystem Package Update Script
# Execute the smart package updater

Write-Host "📦 CODAI ECOSYSTEM - PACKAGE UPDATE PROCESS" -ForegroundColor Cyan
Write-Host "=" * 60

# Change to project directory
Set-Location "E:\GitHub\codai-project"

# Run the package updater
Write-Host "`nRunning smart package updater..." -ForegroundColor Yellow
node scripts/smart-package-updater.cjs

# Check if updates were made
Write-Host "`nChecking for any remaining issues..." -ForegroundColor Yellow

# Run pnpm install to apply updates
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nInstalling updated packages..." -ForegroundColor Green
    pnpm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Package updates completed successfully!" -ForegroundColor Green
        Write-Host "🧪 Recommendation: Test critical apps before deployment" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Package installation failed. Check dependencies." -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Package update script failed. Check the output above." -ForegroundColor Red
}

Write-Host "`n🎯 Process complete. Check the output above for details." -ForegroundColor Cyan
