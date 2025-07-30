#!/usr/bin/env pwsh
# Workspace Reorganization Script for codai-project
# Generated on 2025-07-30

Write-Host "🗂️  Starting Workspace Reorganization..." -ForegroundColor Green

# Navigate to project root
Set-Location "e:\GitHub\codai-project"

# Create reorganization log
$logFile = "REORGANIZATION_LOG.md"
@"
# Workspace Reorganization Log
**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Script:** reorganize-workspace.ps1

## Files Moved

"@ | Out-File $logFile

Write-Host "📁 Moving MEMORAI and Phase Reports..." -ForegroundColor Yellow

# Move MEMORAI and PHASE files to docs/reports/
$reportFiles = @(
    "MEMORAI_*.md",
    "PHASE_*.md", 
    "PROJECT_*_REPORT.md",
    "COMPREHENSIVE_WORKSPACE_ANALYSIS.md",
    "IMPLEMENTATION_PRIORITY_ROADMAP.md",
    "MCP_TOOLS_COMPREHENSIVE_STATUS_REPORT.md",
    "SMART_REORGANIZATION_SUCCESS_REPORT.md",
    "WORKSPACE_REORGANIZATION_*.md"
)

foreach ($pattern in $reportFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            git mv $file "docs/reports/"
            "- Moved `$file` → `docs/reports/`" | Add-Content $logFile
            Write-Host "  ✓ $file → docs/reports/" -ForegroundColor Green
        }
    }
}

Write-Host "🧪 Moving Test Files..." -ForegroundColor Yellow

# Move test files to tests/integration/
$testFiles = @(
    "test-*.js",
    "test-*.mjs"
)

foreach ($pattern in $testFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            git mv $file "tests/integration/"
            "- Moved `$file` → `tests/integration/`" | Add-Content $logFile
            Write-Host "  ✓ $file → tests/integration/" -ForegroundColor Green
        }
    }
}

Write-Host "📊 Moving Test Configuration Files..." -ForegroundColor Yellow

# Move test configuration files
$testConfigFiles = @(
    "TEST*.json",
    "TESTING_FRAMEWORK_INTEGRATION_REPORT.json"
)

foreach ($pattern in $testConfigFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            git mv $file "tests/config/"
            "- Moved `$file` → `tests/config/`" | Add-Content $logFile
            Write-Host "  ✓ $file → tests/config/" -ForegroundColor Green
        }
    }
}

Write-Host "⚙️  Moving Configuration Files..." -ForegroundColor Yellow

# Move quality configuration files
$qualityConfigFiles = @(
    "coverage.config.json",
    "quality-*.json",
    "ci-quality-scripts.json",
    "performance.config.json",
    "eslint.config.optimized.js",
    "playwright.config.optimized.ts",
    "vitest.config.optimized.ts"
)

foreach ($pattern in $qualityConfigFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            git mv $file "config/quality/"
            "- Moved `$file` → `config/quality/`" | Add-Content $logFile
            Write-Host "  ✓ $file → config/quality/" -ForegroundColor Green
        }
    }
}

Write-Host "🔧 Moving Maintenance Scripts..." -ForegroundColor Yellow

# Move utility and maintenance scripts
$maintenanceScripts = @(
    "cleanup-script.ps1",
    "quick-recovery.js",
    "run-git-commit.cmd"
)

foreach ($script in $maintenanceScripts) {
    if (Test-Path $script) {
        git mv $script "scripts/maintenance/"
        "- Moved `$script` → `scripts/maintenance/`" | Add-Content $logFile
        Write-Host "  ✓ $script → scripts/maintenance/" -ForegroundColor Green
    }
}

Write-Host "📝 Moving Documentation..." -ForegroundColor Yellow

# Move documentation files
$docFiles = @(
    "DESCRIPTION.md",
    "copilot-instructions.md"
)

foreach ($docFile in $docFiles) {
    if (Test-Path $docFile) {
        git mv $docFile "docs/project/"
        "- Moved `$docFile` → `docs/project/`" | Add-Content $logFile
        Write-Host "  ✓ $docFile → docs/project/" -ForegroundColor Green
    }
}

# Finalize log
@"

## Summary
- **Reports:** Moved to `docs/reports/`
- **Test Files:** Moved to `tests/integration/`
- **Test Configs:** Moved to `tests/config/`
- **Quality Configs:** Moved to `config/quality/`
- **Scripts:** Moved to `scripts/maintenance/`
- **Documentation:** Moved to `docs/project/`

## Files Kept in Root
Essential project files remain in root:
- package.json, pnpm-*.yaml
- README.md, CHANGELOG.md
- tsconfig.json, turbo.json, vercel.json
- All dotfiles and configurations
- Core configuration files

---
*Reorganization completed successfully!*
"@ | Add-Content $logFile

Write-Host "✅ Workspace reorganization completed!" -ForegroundColor Green
Write-Host "📄 Check REORGANIZATION_LOG.md for detailed move log" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes: git status" -ForegroundColor White
Write-Host "2. Commit the reorganization: git add . && git commit -m 'feat: reorganize workspace structure'" -ForegroundColor White
Write-Host "3. Update any hardcoded file paths in your project" -ForegroundColor White
