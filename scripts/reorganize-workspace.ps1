#!/usr/bin/env pwsh
#
# CODAI Project Workspace Reorganization Script
# Systematically organizes 400+ scattered files into proper archive structure
#

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$RootPath = "e:\GitHub\codai-project"
$ArchivePath = "$RootPath\archive"

# Ensure archive directories exist
$ArchiveDirs = @(
    "$ArchivePath\reports",
    "$ArchivePath\plans", 
    "$ArchivePath\phases",
    "$ArchivePath\deployment",
    "$ArchivePath\legacy",
    "$RootPath\configs"
)

foreach ($dir in $ArchiveDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# File categorization patterns
$FilePatterns = @{
    "reports" = @(
        "*SUCCESS_REPORT*.md",
        "*STATUS_REPORT*.md", 
        "*COMPLETE_REPORT*.md",
        "*FINAL_REPORT*.md",
        "*SUMMARY*.md",
        "*ANALYSIS*.md",
        "*ASSESSMENT*.md",
        "*AUDIT*.md",
        "*VALIDATION*.md",
        "*TESTING_RESULTS*.md",
        "*RESULTS*.md"
    )
    "plans" = @(
        "*PLAN*.md",
        "*IMPLEMENTATION*.md",
        "*STRATEGY*.md", 
        "*GUIDE*.md",
        "*INSTRUCTIONS*.md",
        "*ROADMAP*.md",
        "*BLUEPRINT*.md"
    )
    "phases" = @(
        "PHASE_*.md",
        "WEEK_*.md",
        "DAY_*.md"
    )
    "deployment" = @(
        "*DEPLOYMENT*.md",
        "*DOCKER*.md",
        "*AWS*.md",
        "*VERCEL*.md",
        "*CLOUD*.md",
        "*INFRASTRUCTURE*.md",
        "*SSL*.md",
        "*DOMAIN*.md",
        "*DNS*.md"
    )
    "legacy" = @(
        "*.log",
        "build-*.log",
        "*.err",
        "debug.*",
        "*temp*",
        "*backup*",
        "*old*",
        "*legacy*"
    )
}

# Configuration files to move to configs/
$ConfigPatterns = @(
    ".env*",
    "*.json",
    "*.yml", 
    "*.yaml",
    "*.config.*",
    "tsconfig*.json",
    "vitest*.ts",
    "playwright*.ts",
    "*.tfvars"
)

# Files to keep in root (essential files)
$KeepInRoot = @(
    "README.md",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml", 
    "turbo.json",
    ".gitignore",
    ".gitattributes",
    ".npmrc",
    ".pnpmrc",
    "docker-compose*.yml",
    "Dockerfile"
)

function Move-FilesByPattern {
    param(
        [string]$Category,
        [array]$Patterns,
        [string]$DestinationPath
    )
    
    $movedCount = 0
    $errors = @()
    
    Write-Host "`n🔄 Processing $Category files..." -ForegroundColor Cyan
    
    foreach ($pattern in $Patterns) {
        $files = Get-ChildItem -Path $RootPath -Name $pattern -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            $sourcePath = Join-Path $RootPath $file
            $destPath = Join-Path $DestinationPath $file
            
            # Skip if file doesn't exist or is in keep list
            if (!(Test-Path $sourcePath)) { continue }
            if ($file -in $KeepInRoot) { 
                if ($Verbose) { Write-Host "⏭️  Keeping in root: $file" -ForegroundColor Yellow }
                continue 
            }
            
            try {
                if ($DryRun) {
                    Write-Host "📋 [DRY RUN] Would move: $file → $Category/" -ForegroundColor Gray
                } else {
                    # Check if destination file already exists
                    if (Test-Path $destPath) {
                        Write-Host "⚠️  File exists in destination: $file" -ForegroundColor Yellow
                        $newName = "$($file.BaseName)_duplicate$($file.Extension)"
                        $destPath = Join-Path $DestinationPath $newName
                        Write-Host "📝 Renaming to: $newName" -ForegroundColor Yellow
                    }
                    
                    Move-Item -Path $sourcePath -Destination $destPath -Force
                    Write-Host "✅ Moved: $file → $Category/" -ForegroundColor Green
                    $movedCount++
                }
            }
            catch {
                $errors += "❌ Error moving $file : $($_.Exception.Message)"
                Write-Host "❌ Error moving $file : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "📊 ${Category}: $movedCount files moved" -ForegroundColor Magenta
    return @{ Count = $movedCount; Errors = $errors }
}

# Main reorganization process
Write-Host "🚀 Starting CODAI Workspace Reorganization..." -ForegroundColor Green
Write-Host "📁 Root Path: $RootPath" -ForegroundColor White
Write-Host "📁 Archive Path: $ArchivePath" -ForegroundColor White

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
}

$totalMoved = 0
$allErrors = @()

# Process each category
foreach ($category in $FilePatterns.Keys) {
    $destPath = Join-Path $ArchivePath $category
    $result = Move-FilesByPattern -Category $category -Patterns $FilePatterns[$category] -DestinationPath $destPath
    $totalMoved += $result.Count
    $allErrors += $result.Errors
}

# Handle configuration files
Write-Host "`n🔄 Processing configuration files..." -ForegroundColor Cyan
$configMoved = 0
foreach ($pattern in $ConfigPatterns) {
    $files = Get-ChildItem -Path $RootPath -Name $pattern -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $sourcePath = Join-Path $RootPath $file
        $destPath = Join-Path "$RootPath\configs" $file
        
        if (!(Test-Path $sourcePath)) { continue }
        if ($file -in $KeepInRoot) { 
            if ($Verbose) { Write-Host "⏭️  Keeping in root: $file" -ForegroundColor Yellow }
            continue 
        }
        
        try {
            if ($DryRun) {
                Write-Host "📋 [DRY RUN] Would move: $file → configs/" -ForegroundColor Gray
            } else {
                if (Test-Path $destPath) {
                    Write-Host "⚠️  Config file exists: $file" -ForegroundColor Yellow
                    continue
                }
                Move-Item -Path $sourcePath -Destination $destPath -Force
                Write-Host "✅ Moved: $file → configs/" -ForegroundColor Green
                $configMoved++
            }
        }
        catch {
            $allErrors += "❌ Error moving config $file : $($_.Exception.Message)"
            Write-Host "❌ Error moving config $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "📊 Configuration files: $configMoved files moved" -ForegroundColor Magenta

# Final summary
Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "📋 REORGANIZATION SUMMARY" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green
Write-Host "📊 Total files moved: $totalMoved" -ForegroundColor White
Write-Host "⚙️  Config files moved: $configMoved" -ForegroundColor White
Write-Host "❌ Errors encountered: $($allErrors.Count)" -ForegroundColor $(if ($allErrors.Count -gt 0) { "Red" } else { "Green" })

if ($allErrors.Count -gt 0) {
    Write-Host "`n🚨 ERRORS:" -ForegroundColor Red
    foreach ($error in $allErrors) {
        Write-Host $error -ForegroundColor Red
    }
}

if (!$DryRun) {
    Write-Host "`n✅ Workspace reorganization completed!" -ForegroundColor Green
    Write-Host "📁 Files organized into:" -ForegroundColor White
    Write-Host "   📂 archive/reports/ - Success reports, status reports, analyses" -ForegroundColor Gray
    Write-Host "   📂 archive/plans/ - Implementation plans, strategies, guides" -ForegroundColor Gray  
    Write-Host "   📂 archive/phases/ - Phase documentation, weekly/daily reports" -ForegroundColor Gray
    Write-Host "   📂 archive/deployment/ - Deployment documentation" -ForegroundColor Gray
    Write-Host "   📂 archive/legacy/ - Legacy files and logs" -ForegroundColor Gray
    Write-Host "   📂 configs/ - Configuration files" -ForegroundColor Gray
} else {
    Write-Host "`n🔍 DRY RUN completed - add -DryRun:`$false to execute" -ForegroundColor Yellow
}
