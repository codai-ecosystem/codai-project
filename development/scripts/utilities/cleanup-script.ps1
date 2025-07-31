# Safe Project Cleanup Script
# This script moves files to proper directories without breaking functionality

Write-Host "🧹 Starting Safe Project Cleanup..." -ForegroundColor Green

# Create target directories if they don't exist
$directories = @(
    "docs\reports\memorai",
    "docs\reports\phases", 
    "docs\reports\archive",
    "scripts\cleanup",
    "scripts\deployment",
    "config\quality"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "✅ Created directory: $dir" -ForegroundColor Yellow
    }
}

# Move MEMORAI reports to docs/reports/memorai/
$memoraiFiles = Get-ChildItem -Path "." -Name "MEMORAI_*.md" | Where-Object { $_ -notlike "*\*" }
foreach ($file in $memoraiFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\reports\memorai\" -Force
        Write-Host "📋 Moved: $file → docs\reports\memorai\" -ForegroundColor Cyan
    }
}

# Move PHASE reports to docs/reports/phases/
$phaseFiles = Get-ChildItem -Path "." -Name "PHASE_*.md" | Where-Object { $_ -notlike "*\*" }
foreach ($file in $phaseFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\reports\phases\" -Force
        Write-Host "📋 Moved: $file → docs\reports\phases\" -ForegroundColor Cyan
    }
}

# Move other reports to docs/reports/archive/
$reportFiles = @(
    "COMPREHENSIVE_WORKSPACE_ANALYSIS.md",
    "IMPLEMENTATION_PRIORITY_ROADMAP.md", 
    "MCP_TOOLS_COMPREHENSIVE_STATUS_REPORT.md",
    "PROJECT_CLEANUP_SUCCESS_SUMMARY.md",
    "PROJECT_STRUCTURE_CLEANUP_SUCCESS_REPORT.md",
    "SMART_REORGANIZATION_SUCCESS_REPORT.md",
    "WORKSPACE_REORGANIZATION_PLAN.md",
    "WORKSPACE_REORGANIZATION_SUCCESS_REPORT.md",
    "UI_COMPONENTS_LIBRARY_COMPLETE.md"
)

foreach ($file in $reportFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\reports\archive\" -Force
        Write-Host "📋 Moved: $file → docs\reports\archive\" -ForegroundColor Cyan
    }
}

# Move config files to config/quality/
$configFiles = @(
    "ci-quality-scripts.json",
    "coverage.config.json", 
    "performance.config.json",
    "quality-gates.config.json",
    "quality-scripts.json",
    "test-scripts.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "config\quality\" -Force
        Write-Host "⚙️ Moved: $file → config\quality\" -ForegroundColor Green
    }
}

# Move cleanup/phase scripts to scripts/cleanup/
$cleanupScripts = @(
    "phase-1-database-consolidation.ps1",
    "phase-2-mcp-server-consolidation.ps1",
    "reorganize-workspace.ps1",
    "quick-recovery.js"
)

foreach ($file in $cleanupScripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\cleanup\" -Force
        Write-Host "🔧 Moved: $file → scripts\cleanup\" -ForegroundColor Magenta
    }
}

Write-Host "`n🎉 Cleanup Phase 1 Complete!" -ForegroundColor Green
Write-Host "Next: Remove test artifacts and unnecessary files" -ForegroundColor Yellow
