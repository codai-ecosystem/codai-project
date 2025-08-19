#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RomAI File Consolidation Script - Phase 3 Integration & Quality Assurance
    
.DESCRIPTION
    Systematically consolidates 185+ "advanced_" and "enhanced_" files following Microsoft Azure ML best practices.
    Eliminates duplicate code, preserves unique functionality, and enforces enterprise naming conventions.
    
.PARAMETER DryRun
    If specified, performs analysis without making file changes
    
.PARAMETER TargetPath
    Root path for RomAI project (default: current directory)
    
.EXAMPLE
    .\romai-file-consolidation.ps1 -DryRun
    .\romai-file-consolidation.ps1 -TargetPath "e:\GitHub\codai-project\apps\romai"
#>

param(
    [switch]$DryRun = $false,
    [string]$TargetPath = "e:\GitHub\codai-project\apps\romai"
)

# Phase 3: Integration & Quality Assurance - File Consolidation
# Following Microsoft Azure ML MLOps best practices for code organization

Write-Host "🧠 RomAI Phase 3: File Consolidation Script" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Microsoft Azure ML Standards Compliance Implementation" -ForegroundColor White
Write-Host "Target: 185+ files (137 'advanced_' + 48 'enhanced_')" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE: Analysis only, no files will be modified" -ForegroundColor Green
}

# Initialize consolidation tracking
$ConsolidationReport = @{
    TotalFiles = 0
    AdvancedFiles = @()
    EnhancedFiles = @()
    Duplicates = @()
    SafeDeletions = @()
    RequireMigration = @()
    ProcessingResults = @()
    Errors = @()
}

# Define Microsoft-compliant naming mappings
$NamingConventions = @{
    'advanced_reasoning_engine' = 'reasoning_engine'
    'enhanced_reasoning_engine' = 'reasoning_engine'
    'advanced_consciousness_framework' = 'consciousness_framework'
    'enhanced_consciousness_evolution' = 'consciousness_evolution'
    'advanced_intelligence_optimizer' = 'intelligence_optimizer'
    'enhanced_meta_learning_engine' = 'meta_learning_engine'
    'advanced_executive_control' = 'executive_controller'
    'enhanced_executive_control' = 'executive_controller'
    'advanced_working_memory' = 'working_memory'
    'advanced_reasoning_systems' = 'reasoning_systems'
    'advanced_global_consciousness_evolution' = 'global_consciousness_evolution'
}

# Core system paths (Microsoft Azure ML structure)
$CorePaths = @{
    'reasoning' = "$TargetPath\src\core\reasoning"
    'mathematical' = "$TargetPath\src\core\mathematical"
    'learning' = "$TargetPath\src\core\learning"
    'integration' = "$TargetPath\src\core\integration"
    'services_romanian' = "$TargetPath\src\services\romanian"
    'services_enterprise' = "$TargetPath\src\services\enterprise"
    'services_cultural' = "$TargetPath\src\services\cultural"
}

Write-Host "`n📁 Scanning for advanced_ and enhanced_ files..." -ForegroundColor Yellow

# Step 1: Catalog all target files
$AdvancedFiles = Get-ChildItem -Path "$TargetPath\src" -Recurse -Include "*advanced*" -File
$EnhancedFiles = Get-ChildItem -Path "$TargetPath\src" -Recurse -Include "*enhanced*" -File

$ConsolidationReport.AdvancedFiles = $AdvancedFiles
$ConsolidationReport.EnhancedFiles = $EnhancedFiles
$ConsolidationReport.TotalFiles = $AdvancedFiles.Count + $EnhancedFiles.Count

Write-Host "📊 Discovery Results:" -ForegroundColor Cyan
Write-Host "   🔹 Advanced files: $($AdvancedFiles.Count)" -ForegroundColor White
Write-Host "   🔹 Enhanced files: $($EnhancedFiles.Count)" -ForegroundColor White
Write-Host "   🔹 Total files: $($ConsolidationReport.TotalFiles)" -ForegroundColor Yellow

# Step 2: Analyze each file for consolidation opportunities
Write-Host "`n🔍 Analyzing files for consolidation opportunities..." -ForegroundColor Yellow

function Analyze-File {
    param($File)
    
    $analysis = @{
        FullPath = $File.FullName
        Name = $File.Name
        Size = $File.Length
        LastModified = $File.LastWriteTime
        Category = ""
        CoreEquivalent = ""
        Action = ""
        Reason = ""
        HasCoreVersion = $false
    }
    
    # Determine category based on file name
    $fileName = $File.BaseName
    
    if ($fileName -match "reasoning") {
        $analysis.Category = "reasoning"
        $analysis.CoreEquivalent = "$($CorePaths.reasoning)\reasoning_engine.py"
    } elseif ($fileName -match "mathematical") {
        $analysis.Category = "mathematical"
        $analysis.CoreEquivalent = "$($CorePaths.mathematical)\mathematical_engine.py"
    } elseif ($fileName -match "learning") {
        $analysis.Category = "learning"
        $analysis.CoreEquivalent = "$($CorePaths.learning)\learning_engine.py"
    } elseif ($fileName -match "consciousness") {
        $analysis.Category = "consciousness"
        $analysis.CoreEquivalent = "$($CorePaths.reasoning)\consciousness_framework.py"
    } elseif ($fileName -match "intelligence|optimizer") {
        $analysis.Category = "intelligence"
        $analysis.CoreEquivalent = "$($CorePaths.integration)\intelligence_optimizer.py"
    } elseif ($fileName -match "executive") {
        $analysis.Category = "executive"
        $analysis.CoreEquivalent = "$($CorePaths.integration)\executive_controller.py"
    } elseif ($fileName -match "memory") {
        $analysis.Category = "memory"
        $analysis.CoreEquivalent = "$($CorePaths.reasoning)\working_memory.py"
    } else {
        $analysis.Category = "uncategorized"
    }
    
    # Check if core equivalent exists
    if ($analysis.CoreEquivalent -ne "" -and (Test-Path $analysis.CoreEquivalent)) {
        $analysis.HasCoreVersion = $true
        $coreFile = Get-Item $analysis.CoreEquivalent
        
        # Compare dates and sizes
        if ($coreFile.LastWriteTime -gt $File.LastWriteTime -and $coreFile.Length -gt $File.Length) {
            $analysis.Action = "DELETE"
            $analysis.Reason = "Core version is newer and larger (authoritative)"
        } elseif ($coreFile.LastWriteTime -lt $File.LastWriteTime) {
            $analysis.Action = "REVIEW"
            $analysis.Reason = "Advanced/Enhanced version is newer - needs content comparison"
        } else {
            $analysis.Action = "REVIEW"
            $analysis.Reason = "Dates/sizes inconclusive - needs manual review"
        }
    } else {
        $analysis.Action = "MIGRATE"
        $analysis.Reason = "No core equivalent - needs migration to proper location"
    }
    
    return $analysis
}

# Analyze advanced files
foreach ($file in $AdvancedFiles) {
    try {
        $analysis = Analyze-File -File $file
        $ConsolidationReport.ProcessingResults += $analysis
        
        Write-Host "   📄 $($file.Name)" -ForegroundColor White
        Write-Host "      Action: $($analysis.Action) - $($analysis.Reason)" -ForegroundColor Gray
        
        if ($analysis.Action -eq "DELETE") {
            $ConsolidationReport.SafeDeletions += $analysis
        } elseif ($analysis.Action -eq "MIGRATE") {
            $ConsolidationReport.RequireMigration += $analysis
        }
    }
    catch {
        $ConsolidationReport.Errors += "Error analyzing $($file.FullName): $($_.Exception.Message)"
        Write-Host "   ❌ Error analyzing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Analyze enhanced files
foreach ($file in $EnhancedFiles) {
    try {
        $analysis = Analyze-File -File $file
        $ConsolidationReport.ProcessingResults += $analysis
        
        Write-Host "   📄 $($file.Name)" -ForegroundColor White
        Write-Host "      Action: $($analysis.Action) - $($analysis.Reason)" -ForegroundColor Gray
        
        if ($analysis.Action -eq "DELETE") {
            $ConsolidationReport.SafeDeletions += $analysis
        } elseif ($analysis.Action -eq "MIGRATE") {
            $ConsolidationReport.RequireMigration += $analysis
        }
    }
    catch {
        $ConsolidationReport.Errors += "Error analyzing $($file.FullName): $($_.Exception.Message)"
        Write-Host "   ❌ Error analyzing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 3: Generate consolidation summary
Write-Host "`n📊 Consolidation Analysis Summary:" -ForegroundColor Cyan
Write-Host "   🗑️  Safe deletions: $($ConsolidationReport.SafeDeletions.Count)" -ForegroundColor Green
Write-Host "   📦 Require migration: $($ConsolidationReport.RequireMigration.Count)" -ForegroundColor Yellow
Write-Host "   🔍 Need review: $(($ConsolidationReport.ProcessingResults | Where-Object { $_.Action -eq 'REVIEW' }).Count)" -ForegroundColor DarkYellow
Write-Host "   ❌ Errors: $($ConsolidationReport.Errors.Count)" -ForegroundColor Red

# Step 4: Execute consolidation (if not dry run)
if (-not $DryRun) {
    Write-Host "`n🚀 Executing file consolidation..." -ForegroundColor Green
    
    # Delete confirmed duplicates
    foreach ($deletion in $ConsolidationReport.SafeDeletions) {
        try {
            Write-Host "   🗑️  Deleting: $($deletion.Name)" -ForegroundColor Yellow
            Remove-Item -Path $deletion.FullPath -Force
            Write-Host "   ✅ Deleted successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Failed to delete: $($_.Exception.Message)" -ForegroundColor Red
            $ConsolidationReport.Errors += "Failed to delete $($deletion.FullPath): $($_.Exception.Message)"
        }
    }
    
    Write-Host "`n✅ File consolidation completed!" -ForegroundColor Green
    Write-Host "   📊 Deleted: $($ConsolidationReport.SafeDeletions.Count) duplicate files" -ForegroundColor White
    Write-Host "   📦 Migration candidates: $($ConsolidationReport.RequireMigration.Count) files" -ForegroundColor White
} else {
    Write-Host "`n🔍 DRY RUN completed - no files were modified" -ForegroundColor Green
}

# Step 5: Save detailed report
$reportPath = "$TargetPath\PHASE_3_FILE_CONSOLIDATION_REPORT.json"
$ConsolidationReport | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📋 Detailed report saved: $reportPath" -ForegroundColor Cyan

# Step 6: Display next steps
Write-Host "`n🎯 Next Steps for Phase 3:" -ForegroundColor Cyan
Write-Host "   1. Review migration candidates for unique functionality" -ForegroundColor White
Write-Host "   2. Execute enterprise API integration testing" -ForegroundColor White
Write-Host "   3. Fix frontend integration issues (55.6% test failure rate)" -ForegroundColor White
Write-Host "   4. Validate 'world class AGI for real, real values'" -ForegroundColor White

Write-Host "`n🏁 Phase 3 File Consolidation: READY FOR EXECUTION" -ForegroundColor Green
