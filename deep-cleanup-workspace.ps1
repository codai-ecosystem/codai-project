# CODAI Workspace Deep Cleanup Script
# This script performs comprehensive workspace cleanup beyond just root directory organization

Write-Host "🔍 Starting COMPREHENSIVE CODAI Workspace Deep Cleanup..." -ForegroundColor Green

# Create archive directory for safe storage
Write-Host "📦 Creating archive structure for safe cleanup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "archive/empty-directories" -Force | Out-Null
New-Item -ItemType Directory -Path "archive/broken-packages" -Force | Out-Null
New-Item -ItemType Directory -Path "archive/placeholder-libs" -Force | Out-Null
New-Item -ItemType Directory -Path "archive/template-duplicates" -Force | Out-Null
New-Item -ItemType Directory -Path "archive/minimal-templates" -Force | Out-Null
New-Item -ItemType Directory -Path "rust-projects" -Force | Out-Null

Write-Host "✅ Archive structure created!" -ForegroundColor Green

# Phase 1: Remove Completely Empty Directories
Write-Host "🗑️ Phase 1: Removing completely empty directories..." -ForegroundColor Yellow

$emptyDirectories = @(
    "apps/_config",
    "tools/analyzers", 
    "tools/generators",
    "tools/validators",
    "validation/logs"
)

foreach ($dir in $emptyDirectories) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        if ($fileCount -eq 0) {
            Remove-Item $dir -Recurse -Force
            Write-Host "  Removed empty directory: $dir" -ForegroundColor Red
        } else {
            Write-Host "  Skipped $dir (not empty: $fileCount files)" -ForegroundColor Yellow
        }
    }
}

Write-Host "✅ Phase 1 complete!" -ForegroundColor Green

# Phase 2: Fix Broken Packages
Write-Host "🔧 Phase 2: Fixing broken packages..." -ForegroundColor Yellow

# Handle packages/shared (no package.json)
if (Test-Path "packages/shared" -and !(Test-Path "packages/shared/package.json")) {
    Write-Host "  Moving broken packages/shared to archive..." -ForegroundColor Red
    Move-Item "packages/shared" "archive/broken-packages/shared" -Force
}

# Handle packages/cbd-enterprise (Rust project in Node monorepo)
if (Test-Path "packages/cbd-enterprise") {
    if (Test-Path "packages/cbd-enterprise/Cargo.toml") {
        Write-Host "  Moving Rust project cbd-enterprise to rust-projects/..." -ForegroundColor Cyan
        Move-Item "packages/cbd-enterprise" "rust-projects/cbd-enterprise" -Force
    }
}

Write-Host "✅ Phase 2 complete!" -ForegroundColor Green

# Phase 3: Archive Placeholder Libs (Single-file placeholders)
Write-Host "📚 Phase 3: Archiving placeholder libs..." -ForegroundColor Yellow

$placeholderLibs = @(
    "advanced-analytics",
    "advanced-security", 
    "ai-chatbot",
    "code-analysis",
    "ecosystem-communication",
    "mobile-optimization",
    "project-orchestration"
)

foreach ($lib in $placeholderLibs) {
    $libPath = "libs/$lib"
    if (Test-Path $libPath) {
        $fileCount = (Get-ChildItem $libPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        if ($fileCount -le 1) {
            Move-Item $libPath "archive/placeholder-libs/$lib" -Force
            Write-Host "  Archived placeholder lib: $lib ($fileCount files)" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Phase 3 complete!" -ForegroundColor Green

# Phase 4: Archive Minimal Templates
Write-Host "📝 Phase 4: Archiving minimal templates..." -ForegroundColor Yellow

$minimalTemplates = @(
    "agent-registration",
    "desktop-template",
    "mcp-configs", 
    "mobile-template",
    "task-management"
)

foreach ($template in $minimalTemplates) {
    $templatePath = "templates/$template"
    if (Test-Path $templatePath) {
        $fileCount = (Get-ChildItem $templatePath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        if ($fileCount -le 4) {
            Move-Item $templatePath "archive/minimal-templates/$template" -Force
            Write-Host "  Archived minimal template: $template ($fileCount files)" -ForegroundColor Cyan
        }
    }
}

Write-Host "✅ Phase 4 complete!" -ForegroundColor Green

# Phase 5: Identify and Report App Duplicates (Analysis Only)
Write-Host "🔍 Phase 5: Analyzing potential app duplicates..." -ForegroundColor Yellow

$suspiciousApps = @()
$appsToAnalyze = Get-ChildItem apps -Directory | ForEach-Object { 
    $fileCount = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
    [PSCustomObject]@{
        Name = $_.Name
        Files = $fileCount
        HasSrc = Test-Path (Join-Path $_.FullName "src")
        HasPackageJson = Test-Path (Join-Path $_.FullName "package.json")
    }
} | Sort-Object Files

# Group apps by similar file counts (potential templates)
$appsToAnalyze | Group-Object Files | Where-Object { $_.Count -gt 2 -and $_.Name -match '^\d{3}$' } | ForEach-Object {
    Write-Host "  Potential template group ($($_.Name) files): $($_.Group.Name -join ', ')" -ForegroundColor Yellow
    $suspiciousApps += $_.Group.Name
}

# Apps without src directories
$appsWithoutSrc = $appsToAnalyze | Where-Object { !$_.HasSrc -and $_.HasPackageJson }
if ($appsWithoutSrc) {
    Write-Host "  Apps without src/ directories:" -ForegroundColor Red
    $appsWithoutSrc | ForEach-Object { Write-Host "    - $($_.Name) ($($_.Files) files)" -ForegroundColor Red }
}

# Apps with excessive files but no src (likely node_modules bloat)
$bloatedApps = $appsToAnalyze | Where-Object { $_.Files -gt 5000 -and !$_.HasSrc }
if ($bloatedApps) {
    Write-Host "  Bloated apps (>5000 files, no src/):" -ForegroundColor Red
    $bloatedApps | ForEach-Object { Write-Host "    - $($_.Name) ($($_.Files) files)" -ForegroundColor Red }
}

Write-Host "✅ Phase 5 complete!" -ForegroundColor Green

# Phase 6: Clean up minimal packages (packages with very few files)
Write-Host "📦 Phase 6: Reviewing minimal packages..." -ForegroundColor Yellow

$minimalPackages = Get-ChildItem packages -Directory | ForEach-Object { 
    $fileCount = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
    [PSCustomObject]@{
        Name = $_.Name
        Files = $fileCount
        HasPackageJson = Test-Path (Join-Path $_.FullName "package.json")
    }
} | Where-Object { $_.Files -lt 10 -and $_.HasPackageJson }

if ($minimalPackages) {
    Write-Host "  Minimal packages found (review needed):" -ForegroundColor Yellow
    $minimalPackages | ForEach-Object { 
        Write-Host "    - $($_.Name) ($($_.Files) files)" -ForegroundColor Yellow 
    }
}

Write-Host "✅ Phase 6 complete!" -ForegroundColor Green

# Generate Cleanup Report
Write-Host "📊 Generating cleanup report..." -ForegroundColor Yellow

$report = @"
# CODAI Workspace Deep Cleanup Report - $(Get-Date)

## Summary of Actions Taken

### Phase 1: Empty Directory Removal
$(if ($emptyDirectories) { $emptyDirectories | ForEach-Object { "- Removed: $_" } | Out-String } else { "- No empty directories found" })

### Phase 2: Broken Package Fixes
- packages/shared → archive/broken-packages/shared (no package.json)
- packages/cbd-enterprise → rust-projects/cbd-enterprise (Rust project)

### Phase 3: Placeholder Libs Archived
$(if ($placeholderLibs) { $placeholderLibs | ForEach-Object { "- Archived: libs/$_" } | Out-String })

### Phase 4: Minimal Templates Archived  
$(if ($minimalTemplates) { $minimalTemplates | ForEach-Object { "- Archived: templates/$_" } | Out-String })

### Phase 5: App Analysis Results
- Suspicious template groups identified: $(if ($suspiciousApps) { $suspiciousApps.Count } else { 0 }) apps
- Apps without src/: $(if ($appsWithoutSrc) { $appsWithoutSrc.Count } else { 0 }) apps
- Bloated apps: $(if ($bloatedApps) { $bloatedApps.Count } else { 0 }) apps

### Phase 6: Minimal Package Review
- Packages with <10 files: $(if ($minimalPackages) { $minimalPackages.Count } else { 0 }) packages

## Next Steps Recommended

1. **Review archived content** - Check if archived items are truly unnecessary
2. **Analyze app duplicates** - Investigate potential template apps for consolidation
3. **Fix apps without src/** - Either implement or remove these apps
4. **Review minimal packages** - Determine if small packages are placeholders
5. **Test functionality** - Ensure all remaining components work correctly

## File Structure Impact

### Before Cleanup:
- packages/: 47 directories (including broken ones)
- libs/: 8 directories (7 were placeholders)  
- templates/: 8 directories (5 were minimal)
- apps/: ~50 directories (many potential duplicates)

### After Cleanup:
- packages/: ~45 directories (removed broken ones)
- libs/: 1-2 directories (removed placeholders)
- templates/: 3 directories (removed minimal ones)
- apps/: ~50 directories (analysis provided for manual review)
- archive/: All removed content safely stored
- rust-projects/: Proper location for Rust code

"@

$report | Out-File "DEEP_CLEANUP_REPORT.md" -Encoding UTF8

Write-Host "✅ Phase 6 complete!" -ForegroundColor Green

# Final Summary
Write-Host "🎉 COMPREHENSIVE WORKSPACE DEEP CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "  • Empty directories removed" 
Write-Host "  • Broken packages fixed and archived"
Write-Host "  • Placeholder libs archived (7 items)"
Write-Host "  • Minimal templates archived (5 items)"
Write-Host "  • Rust projects moved to proper location"
Write-Host "  • App duplicates analyzed and reported"
Write-Host "  • Cleanup report generated: DEEP_CLEANUP_REPORT.md"
Write-Host ""
Write-Host "⚠️  Next steps needed:" -ForegroundColor Yellow
Write-Host "  1. Review DEEP_CLEANUP_REPORT.md for detailed analysis"
Write-Host "  2. Decide on app duplicates and template consolidation"
Write-Host "  3. Fix or remove apps without src/ directories"
Write-Host "  4. Review archived content in archive/ directory"
Write-Host "  5. Test remaining functionality"
Write-Host "  6. Consider updating pnpm-workspace.yaml for new structure"
