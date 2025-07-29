# CODAI Workspace Reorganization Script
# This script reorganizes the workspace for better structure and maintainability

Write-Host "🚀 Starting CODAI Workspace Reorganization..." -ForegroundColor Green

# Create new directory structure
Write-Host "📁 Creating new directory structure..." -ForegroundColor Yellow

# Documentation structure
New-Item -ItemType Directory -Path "docs/ecosystem" -Force
New-Item -ItemType Directory -Path "docs/implementation" -Force  
New-Item -ItemType Directory -Path "docs/testing" -Force
New-Item -ItemType Directory -Path "docs/historical" -Force

# Configuration structure
New-Item -ItemType Directory -Path "config/build" -Force
New-Item -ItemType Directory -Path "config/test" -Force
New-Item -ItemType Directory -Path "config/dev" -Force

# Test structure
New-Item -ItemType Directory -Path "tests/e2e" -Force
New-Item -ItemType Directory -Path "tests/unit" -Force
New-Item -ItemType Directory -Path "tests/performance" -Force
New-Item -ItemType Directory -Path "tests/results" -Force

# Scripts directory (if not exists)
if (!(Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" -Force
}

Write-Host "✅ Directory structure created!" -ForegroundColor Green

# Move Documentation Files
Write-Host "📚 Moving documentation files..." -ForegroundColor Yellow

# Ecosystem documentation
$ecosystemDocs = @(
    "CBD_ECOSYSTEM.md",
    "CND_ECOSYSTEM.md", 
    "CODAI_COMPONENT_INVENTORY.md",
    "CODAI_ECOSYSTEM_IMPLEMENTATION_PLAN_REVISED.md",
    "CODAI_ECOSYSTEM_RECOVERY_PLAN.md",
    "CODAI_ECOSYSTEM_RECOVERY_SUCCESS_REPORT.md",
    "MCP_TOOLS_COMPREHENSIVE_CATALOG.md"
)

foreach ($doc in $ecosystemDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs/ecosystem/" -Force
        Write-Host "  Moved $doc to docs/ecosystem/" -ForegroundColor Cyan
    }
}

# Implementation documentation  
$implementationDocs = @(
    "METU_COMPREHENSIVE_IMPLEMENTATION_PLAN.md",
    "METU_IMPLEMENTATION_PLAN.md", 
    "METU_TRANSFORMATION_COMPLETE.md",
    "PHASE_2_COMPLETION_REPORT.md",
    "PHASE_3_PACKAGE_TESTING_SUMMARY.md",
    "PHASE_3_PRIORITY_MATRIX_AND_ASSIGNMENTS.md",
    "PHASE_4_UI_UX_TESTING_PLAN.md",
    "PHASE_5_APPLICATION_DOCUMENTATION_PROGRESS.md",
    "DOCUMENTATION_COMPLETION_MASTER_PLAN.md",
    "DOCUMENTATION_STANDARDS_GUIDE.md"
)

foreach ($doc in $implementationDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs/implementation/" -Force
        Write-Host "  Moved $doc to docs/implementation/" -ForegroundColor Cyan
    }
}

# Testing documentation
$testingDocs = @(
    "COMPREHENSIVE_PLAYWRIGHT_TEST_RESULTS.md",
    "COMPREHENSIVE_TESTING_PLAN.md"
)

foreach ($doc in $testingDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs/testing/" -Force
        Write-Host "  Moved $doc to docs/testing/" -ForegroundColor Cyan
    }
}

# Historical documentation
if (Test-Path "AIDE-original") {
    Move-Item "AIDE-original" "docs/historical/" -Force
    Write-Host "  Moved AIDE-original to docs/historical/" -ForegroundColor Cyan
}

# Other important docs
$otherDocs = @(
    "SERVICE_STATUS_REALITY_REPORT.md"
)

foreach ($doc in $otherDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs/" -Force
        Write-Host "  Moved $doc to docs/" -ForegroundColor Cyan
    }
}

Write-Host "✅ Documentation moved!" -ForegroundColor Green

# Move Configuration Files
Write-Host "⚙️ Moving configuration files..." -ForegroundColor Yellow

# Test configurations
$testConfigs = @(
    "cypress.config.cjs",
    "cypress.config.js", 
    "cypress.config.ts",
    "jest.config.js",
    "jest.setup.js",
    "playwright.config.ts",
    "vitest.config.ts",
    "vitest.setup.ts",
    "vitest.workspace.ts"
)

foreach ($config in $testConfigs) {
    if (Test-Path $config) {
        Move-Item $config "config/test/" -Force
        Write-Host "  Moved $config to config/test/" -ForegroundColor Cyan
    }
}

# Development configurations
$devConfigs = @(
    "eslint.config.js",
    "commitlint.config.js"
)

foreach ($config in $devConfigs) {
    if (Test-Path $config) {
        Move-Item $config "config/dev/" -Force
        Write-Host "  Moved $config to config/dev/" -ForegroundColor Cyan
    }
}

Write-Host "✅ Configuration files moved!" -ForegroundColor Green

# Move Scripts
Write-Host "📜 Moving scripts..." -ForegroundColor Yellow

$scripts = @(
    "start-metu-dev.ps1",
    "test-services-quick.js",
    "validate-ecosystem.js"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Move-Item $script "scripts/" -Force
        Write-Host "  Moved $script to scripts/" -ForegroundColor Cyan
    }
}

Write-Host "✅ Scripts moved!" -ForegroundColor Green

# Move Test Files and Directories
Write-Host "🧪 Moving test files..." -ForegroundColor Yellow

# Performance tests
$perfTests = @(
    "test-memorai-performance.cjs",
    "test-memorai-performance.js"
)

foreach ($test in $perfTests) {
    if (Test-Path $test) {
        Move-Item $test "tests/performance/" -Force
        Write-Host "  Moved $test to tests/performance/" -ForegroundColor Cyan
    }
}

# E2E test directories
if (Test-Path "cypress") {
    Move-Item "cypress" "tests/e2e/" -Force
    Write-Host "  Moved cypress to tests/e2e/" -ForegroundColor Cyan
}

if (Test-Path "playwright-report") {
    Move-Item "playwright-report" "tests/results/" -Force
    Write-Host "  Moved playwright-report to tests/results/" -ForegroundColor Cyan
}

if (Test-Path "test-results") {
    Move-Item "test-results" "tests/results/" -Force
    Write-Host "  Moved test-results to tests/results/" -ForegroundColor Cyan
}

Write-Host "✅ Test files moved!" -ForegroundColor Green

# Merge duplicate directories
Write-Host "🔄 Merging duplicate directories..." -ForegroundColor Yellow

if (Test-Path "configs") {
    Get-ChildItem "configs" | Move-Item -Destination "config/" -Force
    Remove-Item "configs" -Recurse -Force
    Write-Host "  Merged configs/ into config/" -ForegroundColor Cyan
}

Write-Host "✅ Duplicates merged!" -ForegroundColor Green

# Clean up build artifacts and temporary files
Write-Host "🧹 Cleaning up build artifacts..." -ForegroundColor Yellow

$artifactsToDelete = @(
    "electron-v37.2.3-win32-x64.zip",
    "debug-storybook.log",
    "validation-results.json",
    "tsconfig.tsbuildinfo"
)

foreach ($artifact in $artifactsToDelete) {
    if (Test-Path $artifact) {
        Remove-Item $artifact -Force
        Write-Host "  Deleted $artifact" -ForegroundColor Red
    }
}

Write-Host "✅ Build artifacts cleaned!" -ForegroundColor Green

Write-Host "🎉 Workspace reorganization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "  • Documentation organized into docs/ subdirectories" 
Write-Host "  • Configuration files organized into config/ subdirectories"
Write-Host "  • Scripts moved to scripts/ directory"
Write-Host "  • Test files organized into tests/ subdirectories"
Write-Host "  • Build artifacts and logs cleaned up"
Write-Host "  • Duplicate directories merged"
Write-Host ""
Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update package.json script paths"
Write-Host "  2. Update .gitignore for new structure"
Write-Host "  3. Update VS Code settings"
Write-Host "  4. Test builds and tests work"
Write-Host "  5. Update CI/CD workflows"
