# Card Component Consolidation Script
# Automates the process of replacing duplicate card components with shared-ui imports

param(
    [string[]]$Apps = @(),
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$SharedUICardImportTemplate = @"
// CONSOLIDATED: This component has been replaced by @codai/shared-ui Card component
// The shared-ui Card provides comprehensive functionality including:
// - 7+ variants: default, elevated, ghost, outline, gradient, glass, neon
// - Advanced features: app-specific theming, interactive states, loading states
// - Size variants: sm, default, lg, xl with proper spacing
// - Enhanced compositions: MetricCard, FeatureCard with built-in features
// - Better accessibility and responsive design

// Use the shared Card component instead:
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@codai/shared-ui"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, FeatureCard, cardVariants } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, FeatureCard, cardVariants }
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from "@codai/shared-ui"

// For existing default exports to continue working
export default Card
"@

$AllApps = @(
    'memorai', 'romai', 'studiai', 'publicai', 'kodex', 'explorer', 'hub',
    'id', 'docs', 'jucai', 'stocai', 'legalizai', 'ajutai', 'analizai',
    'bancai', 'marketai', 'x', 'sociai', 'controlai-dashboard'
)

if ($Apps.Count -eq 0) {
    $Apps = $AllApps
}

$TotalLinesEliminated = 0
$AppsProcessed = 0
$AppsWithSharedUI = @()
$AppsWithoutSharedUI = @()

Write-Host "🃏 Starting Card Component Consolidation" -ForegroundColor Cyan
Write-Host "📍 Target Apps: $($Apps -join ', ')" -ForegroundColor White
Write-Host "🔧 Dry Run Mode: $DryRun" -ForegroundColor $(if($DryRun) {'Yellow'} else {'Green'})
Write-Host ""

foreach ($App in $Apps) {
    $AppPath = "apps/$App"
    $CardPath = "$AppPath/src/components/ui/card.tsx"
    $PackageJsonPath = "$AppPath/package.json"
    
    if (-not (Test-Path $AppPath)) {
        Write-Host "⚠️  App '$App' not found at $AppPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔍 Processing app: $App" -ForegroundColor Cyan
    
    # Check if card.tsx exists
    if (-not (Test-Path $CardPath)) {
        Write-Host "   ℹ️  No card.tsx found - skipping" -ForegroundColor Gray
        continue
    }
    
    # Count lines in original card component
    $OriginalContent = Get-Content $CardPath
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
    Write-Host "   📄 Original card.tsx: $OriginalLines lines" -ForegroundColor White
    
    if ($Verbose) {
        Write-Host "   🔍 Card file preview:" -ForegroundColor Gray
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
            
            # Handle different package.json structures
            if ($PackageContent.dependencies) {
                $PackageContent.dependencies | Add-Member -Name "@codai/shared-ui" -Value "workspace:*" -Force
            } else {
                $PackageContent | Add-Member -Name "dependencies" -Value @{"@codai/shared-ui" = "workspace:*"} -MemberType NoteProperty -Force
            }
            
            $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
        }
        
        # Replace card component
        Write-Host "   🔄 Replacing card component..." -ForegroundColor Yellow
        Set-Content $CardPath $SharedUICardImportTemplate
        Write-Host "   ✅ Card consolidated successfully!" -ForegroundColor Green
        
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
Write-Host "📊 CARD CONSOLIDATION SUMMARY" -ForegroundColor Cyan
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
        Write-Host "   ❌ $App $(if(-not $DryRun) {'(ADDED)'} else {'(WOULD ADD)'})" -ForegroundColor $(if(-not $DryRun) {'Green'} else {'Yellow'})
    }
    Write-Host ""
}

if ($DryRun) {
    Write-Host "🔧 This was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "💡 Run without -DryRun flag to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "🎉 Card consolidation completed successfully!" -ForegroundColor Green
    Write-Host "💡 Run 'pnpm install' to update dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📈 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test apps to ensure card functionality works" -ForegroundColor White
Write-Host "   2. Update any custom card implementations to use shared variants" -ForegroundColor White
Write-Host "   3. Consider using MetricCard and FeatureCard for specialized needs" -ForegroundColor White
Write-Host "   4. Run consolidation script for Modal components" -ForegroundColor White
Write-Host ""
Write-Host "🏆 Enhanced Card Features Available:" -ForegroundColor Cyan
Write-Host "   - App-specific theming with border accent colors" -ForegroundColor White
Write-Host "   - Interactive states (hover, scale, click effects)" -ForegroundColor White
Write-Host "   - Loading states with pulse animations" -ForegroundColor White
Write-Host "   - MetricCard: Perfect for dashboards and KPIs" -ForegroundColor White
Write-Host "   - FeatureCard: Great for product features and marketing" -ForegroundColor White