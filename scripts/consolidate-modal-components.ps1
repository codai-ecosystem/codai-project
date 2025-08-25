# Modal Component Consolidation Script
# Automates the process of replacing duplicate modal components with shared-ui imports

param(
    [string[]]$Apps = @(),
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$SharedUIModalImportTemplate = @"
// CONSOLIDATED: This component has been replaced by @codai/shared-ui Modal component
// The shared-ui Modal provides comprehensive functionality including:
// - Advanced modal system with overlay, content, header, footer, and close button components
// - Size variants: sm, default, lg, xl, fullscreen with responsive behavior
// - App-specific theming and customization support  
// - Enhanced animations and transitions using Framer Motion
// - Accessibility features: focus management, escape key, click outside
// - Portal rendering for proper z-index management
// - Loading states and confirmation dialog patterns

// Use the shared Modal component instead:
// import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton } from "@codai/shared-ui"

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton, ConfirmationModal, LoadingModal } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton, ConfirmationModal, LoadingModal }
export type { ModalProps, ModalOverlayProps, ModalContentProps, ModalHeaderProps, ModalTitleProps, ModalDescriptionProps, ModalFooterProps, ModalCloseButtonProps } from "@codai/shared-ui"

// For existing default exports to continue working
export default Modal
"@

# Modal file patterns to look for
$ModalPatterns = @(
    "src/components/ui/Modal.tsx",
    "src/components/ui/Modal-simple.tsx", 
    "src/components/ui/Modal-new.tsx",
    "components/ui/Modal.tsx",
    "components/Modal.tsx"
)

$AllApps = @(
    'studiai', 'publicai', 'wallet', 'sociai', 'stocai', 'talentai', 'sunai',
    'memorai', 'romai', 'kodex', 'explorer', 'hub', 'id', 'docs', 'jucai', 
    'legalizai', 'ajutai', 'analizai', 'bancai', 'marketai', 'x', 'controlai-dashboard'
)

if ($Apps.Count -eq 0) {
    $Apps = $AllApps
}

$TotalLinesEliminated = 0
$AppsProcessed = 0
$TotalModalFiles = 0
$AppsWithSharedUI = @()
$AppsWithoutSharedUI = @()

Write-Host "🎭 Starting Modal Component Consolidation" -ForegroundColor Cyan
Write-Host "📍 Target Apps: $($Apps -join ', ')" -ForegroundColor White
Write-Host "🔧 Dry Run Mode: $DryRun" -ForegroundColor $(if($DryRun) {'Yellow'} else {'Green'})
Write-Host ""

foreach ($App in $Apps) {
    $AppPath = "apps/$App"
    $PackageJsonPath = "$AppPath/package.json"
    
    if (-not (Test-Path $AppPath)) {
        Write-Host "⚠️  App '$App' not found at $AppPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔍 Processing app: $App" -ForegroundColor Cyan
    
    # Find all modal files in this app
    $AppModalFiles = @()
    foreach ($Pattern in $ModalPatterns) {
        $ModalPath = "$AppPath/$Pattern"
        if (Test-Path $ModalPath) {
            $AppModalFiles += $ModalPath
        }
    }
    
    if ($AppModalFiles.Count -eq 0) {
        Write-Host "   ℹ️  No modal files found - skipping" -ForegroundColor Gray
        continue
    }
    
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
    Write-Host "   📄 Found $($AppModalFiles.Count) modal file(s)" -ForegroundColor White
    
    $AppLinesEliminated = 0
    
    foreach ($ModalFile in $AppModalFiles) {
        $OriginalContent = Get-Content $ModalFile
        $OriginalLines = $OriginalContent.Count
        $FileName = Split-Path $ModalFile -Leaf
        
        Write-Host "      📋 $FileName : $OriginalLines lines" -ForegroundColor Gray
        
        if ($Verbose) {
            $PreviewLines = $OriginalContent | Select-Object -First 3
            foreach ($Line in $PreviewLines) {
                Write-Host "         $Line" -ForegroundColor DarkGray
            }
            Write-Host "         ..." -ForegroundColor DarkGray
        }
        
        if (-not $DryRun) {
            # Replace modal component with shared-ui import
            Set-Content $ModalFile $SharedUIModalImportTemplate
            Write-Host "      ✅ $FileName consolidated!" -ForegroundColor Green
        } else {
            Write-Host "      🔄 Would replace $OriginalLines lines in $FileName" -ForegroundColor Yellow
        }
        
        $AppLinesEliminated += $OriginalLines
        $TotalModalFiles++
    }
    
    if (-not $DryRun) {
        # Add shared-ui dependency if missing
        if (-not $HasSharedUI -and (Test-Path $PackageJsonPath)) {
            Write-Host "   📦 Adding @codai/shared-ui dependency..." -ForegroundColor Yellow
            $PackageContent = Get-Content $PackageJsonPath | ConvertFrom-Json
            
            # Handle different package.json structures
            if ($PackageContent.dependencies) {
                $PackageContent.dependencies | Add-Member -Name "@codai/shared-ui" -Value "workspace:*" -MemberType NoteProperty -Force
            } else {
                $PackageContent | Add-Member -Name "dependencies" -Value @{"@codai/shared-ui" = "workspace:*"} -MemberType NoteProperty -Force
            }
            
            $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
        }
        
        Write-Host "   ✅ App processed: $($AppModalFiles.Count) files, $AppLinesEliminated lines eliminated!" -ForegroundColor Green
        $TotalLinesEliminated += $AppLinesEliminated
        $AppsProcessed++
    } else {
        Write-Host "   🔄 Would process $($AppModalFiles.Count) files, $AppLinesEliminated lines" -ForegroundColor Yellow
        $TotalLinesEliminated += $AppLinesEliminated
        $AppsProcessed++
    }
    
    Write-Host ""
}

# Summary Report
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 MODAL CONSOLIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Apps processed: $AppsProcessed" -ForegroundColor Green
Write-Host "📄 Total modal files: $TotalModalFiles" -ForegroundColor Green
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
    Write-Host "🎉 Modal consolidation completed successfully!" -ForegroundColor Green
    Write-Host "💡 Run 'pnpm install' to update dependencies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📈 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test apps to ensure modal functionality works" -ForegroundColor White
Write-Host "   2. Update any custom modal implementations to use shared variants" -ForegroundColor White
Write-Host "   3. Consider using ConfirmationModal and LoadingModal for specialized needs" -ForegroundColor White
Write-Host "   4. Proceed to next component consolidation phase" -ForegroundColor White
Write-Host ""
Write-Host "🏆 Enhanced Modal Features Available:" -ForegroundColor Cyan
Write-Host "   - Advanced animation system with Framer Motion" -ForegroundColor White
Write-Host "   - Full accessibility support (focus trapping, ARIA)" -ForegroundColor White
Write-Host "   - App-specific theming and customization" -ForegroundColor White
Write-Host "   - Size variants: sm, default, lg, xl, fullscreen" -ForegroundColor White
Write-Host "   - ConfirmationModal: Perfect for delete/destructive actions" -ForegroundColor White
Write-Host "   - LoadingModal: Great for async operations feedback" -ForegroundColor White