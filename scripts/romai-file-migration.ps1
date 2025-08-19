#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RomAI File Migration Script - Phase 3 Integration & Quality Assurance
    
.DESCRIPTION
    Migrates 103 unique "advanced_" and "enhanced_" files to proper Microsoft Azure ML standard locations
    following best practices for code organization and naming conventions.
    
.PARAMETER SourcePath
    Root path for RomAI project source files
    
.PARAMETER DryRun
    If specified, performs analysis without making file changes
    
.EXAMPLE
    .\romai-file-migration.ps1 -DryRun
    .\romai-file-migration.ps1 -SourcePath "e:\GitHub\codai-project\apps\romai\src"
#>

param(
    [string]$SourcePath = "e:\GitHub\codai-project\apps\romai\src",
    [switch]$DryRun = $false
)

Write-Host "🧠 RomAI Phase 3: File Migration Script" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Microsoft Azure ML Standards Migration Implementation" -ForegroundColor White

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE: Analysis only, no files will be modified" -ForegroundColor Green
}

# Define Microsoft Azure ML standard directory structure
$StandardStructure = @{
    # Core components (already established)
    'core/mathematical' = "$SourcePath\core\mathematical"
    'core/reasoning' = "$SourcePath\core\reasoning"  
    'core/learning' = "$SourcePath\core\learning"
    'core/integration' = "$SourcePath\core\integration"
    
    # Services (already established)
    'services/romanian' = "$SourcePath\services\romanian"
    'services/enterprise' = "$SourcePath\services\enterprise"
    'services/cultural' = "$SourcePath\services\cultural"
    
    # New standard structure following Microsoft Azure ML
    'models' = "$SourcePath\models"                    # Model definitions and architectures
    'preprocessing' = "$SourcePath\preprocessing"      # Data preprocessing steps
    'training' = "$SourcePath\training"               # Model training pipelines
    'inference' = "$SourcePath\inference"             # Inference and serving
    'monitoring' = "$SourcePath\monitoring"           # System monitoring and analytics
    'utils' = "$SourcePath\utils"                     # Utility functions and helpers
    'config' = "$SourcePath\config"                   # Configuration files
    'deployment' = "$SourcePath\deployment"           # Deployment scripts and configs
    'tests' = "$SourcePath\tests"                     # Test files and frameworks
}

# Microsoft-compliant naming mappings
$NamingMappings = @{
    # Consciousness & Awareness
    'advanced_consciousness_framework' = 'consciousness_framework'
    'enhanced_consciousness_evolution' = 'consciousness_evolution'
    'advanced_awareness_engine' = 'awareness_engine'
    'advanced_global_consciousness_evolution' = 'global_consciousness_evolution'
    
    # Intelligence & Optimization
    'advanced_intelligence_optimizer' = 'intelligence_optimizer'
    'enhanced_meta_learning_engine' = 'meta_learning_engine'
    'advanced_intelligence_enhancement' = 'intelligence_enhancement'
    'advanced_intelligence_emergence_system' = 'intelligence_emergence_system'
    
    # Romanian AI & Cultural
    'enhanced_romanian_ai' = 'romanian_ai_processor'
    'enhanced_romanian_processor' = 'romanian_processor'
    'enhanced_linguistic_patterns' = 'linguistic_patterns'
    'enhanced_romanian_cultural_intelligence' = 'romanian_cultural_intelligence'
    'enhanced_romanian_system' = 'romanian_system'
    
    # Executive Control & Memory
    'advanced_executive_control' = 'executive_controller'
    'enhanced_executive_control' = 'executive_controller'
    'advanced_working_memory' = 'working_memory'
    'advanced_memory_architecture' = 'memory_architecture'
    'advanced_memory_optimizer' = 'memory_optimizer'
    
    # Mathematical & Logic
    'enhanced_mathematical_reasoning_engine' = 'mathematical_reasoning_engine'
    'enhanced_logic_processor' = 'logic_processor'
    'enhanced_symbolic_recognizer' = 'symbolic_recognizer'
    
    # Multimodal & NLP
    'enhanced_multimodal_intelligence' = 'multimodal_intelligence'
    'advanced_nlp_integration' = 'nlp_integration'
    'advanced_ai_integration' = 'ai_integration'
    
    # Infrastructure & Systems
    'advanced_training_infrastructure' = 'training_infrastructure'
    'enhanced_training_infrastructure' = 'training_infrastructure'
    'advanced_deployment_systems' = 'deployment_systems'
    'advanced_monitoring_system' = 'monitoring_system'
    'advanced_caching_framework' = 'caching_framework'
    'advanced_integration_system' = 'integration_system'
    
    # Analytics & Testing
    'advanced_analytics_engine' = 'analytics_engine'
    'advanced_analytics' = 'analytics'
    'advanced_real_world_testing_system' = 'real_world_testing_system'
    
    # AGI & Orchestration
    'advanced_agi_evolution_system' = 'agi_evolution_system'
    'advanced_agi_coordination_hub' = 'agi_coordination_hub'
    'advanced_agi_orchestrator' = 'agi_orchestrator'
    'advanced_ecosystem_integrator' = 'ecosystem_integrator'
    
    # EU AI Act & Compliance
    'advanced_eu_ai_act_framework' = 'eu_ai_act_framework'
    
    # Execution & Knowledge
    'advanced_execution_engine' = 'execution_engine'
    'advanced_knowledge_integration' = 'knowledge_integration'
}

# File categorization rules for Microsoft Azure ML structure
$FileCategories = @{
    # Models directory
    'models' = @('*model*', '*neural*', '*architecture*', '*transformer*', '*agi_evolution*', '*multimodal*')
    
    # Preprocessing directory  
    'preprocessing' = @('*processor*', '*linguistic*', '*romanian_ai*', '*romanian_processor*', '*symbolic*')
    
    # Training directory
    'training' = @('*training*', '*learning*', '*meta_learning*')
    
    # Inference directory
    'inference' = @('*execution*', '*inference*', '*serving*')
    
    # Monitoring directory
    'monitoring' = @('*monitoring*', '*analytics*', '*performance*', '*testing*')
    
    # Utils directory
    'utils' = @('*utils*', '*caching*', '*memory_optimizer*', '*knowledge_integration*')
    
    # Config directory
    'config' = @('*framework*', '*eu_ai_act*', '*config*')
    
    # Deployment directory
    'deployment' = @('*deployment*', '*integration_system*', '*ecosystem_integrator*')
    
    # Core extensions (high-level AI capabilities)
    'core/reasoning' = @('*consciousness*', '*awareness*', '*executive*', '*working_memory*', '*logic*')
    'core/mathematical' = @('*mathematical*')
    'core/learning' = @('*intelligence_optimizer*', '*intelligence_enhancement*', '*intelligence_emergence*')
    'core/integration' = @('*orchestrator*', '*coordination*', '*ai_integration*', '*nlp_integration*')
    
    # Services extensions
    'services/romanian' = @('*romanian*', '*cultural_intelligence*')
}

function Get-TargetDirectory {
    param($FileName)
    
    foreach ($category in $FileCategories.Keys) {
        foreach ($pattern in $FileCategories[$category]) {
            if ($FileName -like $pattern) {
                return $category
            }
        }
    }
    
    # Default to utils if no specific category matches
    return 'utils'
}

function Get-StandardFileName {
    param($OriginalName)
    
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($OriginalName)
    $extension = [System.IO.Path]::GetExtension($OriginalName)
    
    # Check for exact mapping
    if ($NamingMappings.ContainsKey($baseName)) {
        return $NamingMappings[$baseName] + $extension
    }
    
    # Apply standard transformations
    $standardName = $baseName
    $standardName = $standardName -replace '^advanced_', ''
    $standardName = $standardName -replace '^enhanced_', ''
    $standardName = $standardName -replace '_engine$', ''
    $standardName = $standardName -replace '_system$', ''
    
    return $standardName + $extension
}

# Initialize migration tracking
$MigrationPlan = @{
    TotalFiles = 0
    MigrationActions = @()
    DirectoriesCreated = @()
    Errors = @()
}

Write-Host "`n📁 Creating Microsoft Azure ML standard directory structure..." -ForegroundColor Yellow

# Create standard directories
foreach ($dir in $StandardStructure.Values) {
    if (-not (Test-Path $dir)) {
        Write-Host "   📂 Creating: $dir" -ForegroundColor White
        if (-not $DryRun) {
            try {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                $MigrationPlan.DirectoriesCreated += $dir
            }
            catch {
                $MigrationPlan.Errors += "Failed to create directory $dir : $($_.Exception.Message)"
                Write-Host "   ❌ Failed to create: $dir" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   ✅ Exists: $dir" -ForegroundColor Green
    }
}

Write-Host "`n🔍 Scanning for migration candidate files..." -ForegroundColor Yellow

# Get all advanced/enhanced files that weren't deleted
$MigrationCandidates = @()
$MigrationCandidates += Get-ChildItem -Path "$SourcePath" -Recurse -Include "*advanced*" -File | Where-Object { $_.Extension -eq '.py' }
$MigrationCandidates += Get-ChildItem -Path "$SourcePath" -Recurse -Include "*enhanced*" -File | Where-Object { $_.Extension -eq '.py' }

$MigrationPlan.TotalFiles = $MigrationCandidates.Count

Write-Host "📊 Found $($MigrationCandidates.Count) files to migrate" -ForegroundColor White

Write-Host "`n🗂️ Planning file migrations..." -ForegroundColor Yellow

foreach ($file in $MigrationCandidates) {
    try {
        $targetCategory = Get-TargetDirectory -FileName $file.Name
        $standardName = Get-StandardFileName -OriginalName $file.Name
        $targetDirectory = $StandardStructure[$targetCategory]
        $targetPath = Join-Path $targetDirectory $standardName
        
        $migrationAction = @{
            SourcePath = $file.FullName
            TargetPath = $targetPath
            TargetDirectory = $targetCategory
            OriginalName = $file.Name
            StandardName = $standardName
            FileSize = $file.Length
            LastModified = $file.LastWriteTime
        }
        
        $MigrationPlan.MigrationActions += $migrationAction
        
        Write-Host "   📄 $($file.Name)" -ForegroundColor White
        Write-Host "      → $targetCategory/$standardName" -ForegroundColor Gray
    }
    catch {
        $MigrationPlan.Errors += "Error planning migration for $($file.FullName) : $($_.Exception.Message)"
        Write-Host "   ❌ Error planning: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "`n📊 Migration Plan Summary:" -ForegroundColor Cyan
Write-Host "   📁 Directories to create: $($MigrationPlan.DirectoriesCreated.Count)" -ForegroundColor White
Write-Host "   📦 Files to migrate: $($MigrationPlan.MigrationActions.Count)" -ForegroundColor White
Write-Host "   ❌ Planning errors: $($MigrationPlan.Errors.Count)" -ForegroundColor Red

# Show distribution by target directory
$distribution = $MigrationPlan.MigrationActions | Group-Object TargetDirectory | Sort-Object Count -Descending
foreach ($group in $distribution) {
    Write-Host "      🔹 $($group.Name): $($group.Count) files" -ForegroundColor White
}

if (-not $DryRun) {
    Write-Host "`n🚀 Executing file migrations..." -ForegroundColor Green
    
    foreach ($action in $MigrationPlan.MigrationActions) {
        try {
            Write-Host "   📦 Migrating: $($action.OriginalName)" -ForegroundColor Yellow
            Write-Host "      → $($action.TargetDirectory)/$($action.StandardName)" -ForegroundColor Gray
            
            # Copy file to new location
            Copy-Item -Path $action.SourcePath -Destination $action.TargetPath -Force
            
            # Remove original file
            Remove-Item -Path $action.SourcePath -Force
            
            Write-Host "   ✅ Migrated successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Failed to migrate: $($_.Exception.Message)" -ForegroundColor Red
            $MigrationPlan.Errors += "Failed to migrate $($action.SourcePath) : $($_.Exception.Message)"
        }
    }
    
    Write-Host "`n✅ File migration completed!" -ForegroundColor Green
    Write-Host "   📊 Migrated: $($MigrationPlan.MigrationActions.Count) files" -ForegroundColor White
    Write-Host "   📁 Created: $($MigrationPlan.DirectoriesCreated.Count) directories" -ForegroundColor White
} else {
    Write-Host "`n🔍 DRY RUN completed - no files were modified" -ForegroundColor Green
}

# Save migration report
$reportPath = "$SourcePath\..\PHASE_3_FILE_MIGRATION_REPORT.json"
$MigrationPlan | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📋 Migration report saved: $reportPath" -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps for Phase 3:" -ForegroundColor Cyan
Write-Host "   1. Update import statements in migrated files" -ForegroundColor White
Write-Host "   2. Test core system functionality after migration" -ForegroundColor White
Write-Host "   3. Execute enterprise API integration testing" -ForegroundColor White
Write-Host "   4. Fix frontend integration issues" -ForegroundColor White
Write-Host "   5. Validate 'world class AGI for real, real values'" -ForegroundColor White

Write-Host "`n🏁 Phase 3 File Migration: READY FOR EXECUTION" -ForegroundColor Green
