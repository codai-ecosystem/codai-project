# Button Component Consolidation Script
# Automates the process of replacing duplicate button components with shared-ui imports

param(
    [string[]]$Apps = @(),
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$SharedUIImportTemplate = @"
// CONSOLIDATED: This component has been replaced by @codai/shared-ui Button component
// The shared-ui Button provides comprehensive functionality including:
// - 16+ variants with app-specific theming
// - Advanced features: loading states, icons, tooltips, pulse effects
// - Touch-friendly sizes and accessibility features
// - Animated effects and gradient variants

// Use the shared Button component instead:
// import { Button } from "@codai/shared-ui"

import { Button } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Button, buttonVariants } from "@codai/shared-ui"
export type { ButtonProps } from "@codai/shared-ui"

// For existing imports to continue working
export default Button
"@

$AllApps = @(
    'publicai', 'kodex', 'jucai', 'stocai', 'docs', 'explorer', 'hub',
    'x', 'sunai', 'talentai', 'promovai', 'prezentai', 'mod', 'muzicai', 
    'marketai', 'logai', 'legalizai', 'wallet', 'bancai', 'sociai'
)

if ($Apps.Count -eq 0) {
    $Apps = $AllApps
}

$TotalLinesEliminated = 0
$AppsProcessed = 0
$AppsWithSharedUI = @()
$AppsWithoutSharedUI = @()

Write-Host "🚀 Starting Button Component Consolidation" -ForegroundColor Cyan
Write-Host "📍 Target Apps: $($Apps -join ', ')" -ForegroundColor White
Write-Host "🔧 Dry Run Mode: $DryRun" -ForegroundColor $(if($DryRun) {'Yellow'} else {'Green'})
Write-Host ""

foreach ($App in $Apps) {
    $AppPath = "apps/$App"
    $ButtonPath = "$AppPath/src/components/ui/button.tsx"
    $PackageJsonPath = "$AppPath/package.json"
    
    if (-not (Test-Path $AppPath)) {
        Write-Host "⚠️  App '$App' not found at $AppPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔍 Processing app: $App" -ForegroundColor Cyan
    
    # Check if button.tsx exists
    if (-not (Test-Path $ButtonPath)) {
        Write-Host "   ℹ️  No button.tsx found - skipping" -ForegroundColor Gray
        continue
    }
    
    # Count lines in original button component
    $OriginalContent = Get-Content $ButtonPath
    $OriginalLines = $OriginalContent.Count
    
    # Check package.json for @codai/shared-ui dependency
    $HasSharedUI = $false
    if (Test-Path $PackageJsonPath) {
        $PackageContent = Get-Content $PackageJsonPath | ConvertFrom-Json
        if ($PackageContent.dependencies.'@codai/shared-ui' -or $PackageContent.devDependencies.'@codai/shared-ui') {
            $HasSharedUI = $true
            $AppsWithSharedUI += $App
        } else {
            $AppsWithoutSharedUI += $App
        }
    }
    
    Write-Host "   📦 Shared-UI dependency: $(if($HasSharedUI) {'✅ Found'} else {'❌ Missing'})" -ForegroundColor $(if($HasSharedUI) {'Green'} else {'Red'})
    Write-Host "   📄 Original button.tsx: $OriginalLines lines" -ForegroundColor White
    
    if ($Verbose) {
        Write-Host "   🔍 Button file preview:" -ForegroundColor Gray
        $PreviewLines = $OriginalContent | Select-Object -First 3
        foreach ($Line in $PreviewLines) {
            Write-Host "      $Line" -ForegroundColor DarkGray
        }
        Write-Host "      ..." -ForegroundColor DarkGray
    }
    
    if (-not $DryRun) {
        # Add shared-ui dependency if missing
        if (-not $HasSharedUI -and (Test-Path $PackageJsonPath)) {
            Write-Host "   📦 Adding @codai/shared-ui dependency..." -ForegroundColor Yellow
            $PackageContent = Get-Content $PackageJsonPath | ConvertFrom-Json
            if (-not $PackageContent.dependencies) {
                $PackageContent | Add-Member -Name "dependencies" -Value @{} -MemberType NoteProperty
            }
            $PackageContent.dependencies.'@codai/shared-ui' = "workspace:*"
            $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
        }
        
        # Replace button component
        Write-Host "   🔄 Replacing button component..." -ForegroundColor Yellow
        Set-Content $ButtonPath $SharedUIImportTemplate
        Write-Host "   ✅ Button consolidated successfully!" -ForegroundColor Green
        
        $TotalLinesEliminated += $OriginalLines
        $AppsProcessed++
    } else {
        Write-Host "   🔄 Would replace $OriginalLines lines with shared-ui import" -ForegroundColor Yellow
        $TotalLinesEliminated += $OriginalLines
        $AppsProcessed++
    }
    
    Write-Host ""
}

# Summary Report
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 BUTTON CONSOLIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Apps processed: $AppsProcessed" -ForegroundColor Green
Write-Host "📉 Total lines eliminated: $TotalLinesEliminated" -ForegroundColor Green
Write-Host "📦 Apps with shared-ui: $($AppsWithSharedUI.Count)" -ForegroundColor Blue
Write-Host "📦 Apps without shared-ui: $($AppsWithoutSharedUI.Count)" -ForegroundColor Red
Write-Host ""

if ($AppsWithSharedUI.Count -gt 0) {
    Write-Host "📦 Apps with shared-ui dependency:" -ForegroundColor Blue
    foreach ($App in $AppsWithSharedUI) {
        Write-Host "   ✅ $App" -ForegroundColor Green
    }
    Write-Host ""
}

if ($AppsWithoutSharedUI.Count -gt 0) {
    Write-Host "📦 Apps needing shared-ui dependency:" -ForegroundColor Red
    foreach ($App in $AppsWithoutSharedUI) {
        Write-Host "   ❌ $App" -ForegroundColor Red
    }
    Write-Host ""
}

if ($DryRun) {
    Write-Host "🔧 This was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "💡 Run without -DryRun flag to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "🎉 Button consolidation completed successfully!" -ForegroundColor Green
    Write-Host "💡 Run 'pnpm install' to update dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📈 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run consolidation script for Card components" -ForegroundColor White
Write-Host "   2. Run consolidation script for Modal components" -ForegroundColor White
Write-Host "   3. Test apps to ensure button functionality works" -ForegroundColor White
Write-Host "   4. Update any custom button implementations to use shared variants" -ForegroundColor White