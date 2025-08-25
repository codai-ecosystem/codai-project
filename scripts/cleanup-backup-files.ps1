# CODAI Workspace Backup Cleanup Script
# Safely removes backup files following Microsoft DevOps standards

param(
    [switch]$WhatIf = $false,
    [switch]$Force = $false,
    [string]$BackupDir = "./workspace-backups"
)

Write-Host "🧹 CODAI Workspace Backup Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Ensure backup directory exists before cleanup
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "📁 Created backup directory: $BackupDir" -ForegroundColor Yellow
}

# Define backup file patterns to clean
$backupPatterns = @(
    "*.bak",
    "*backup*",
    "*.backup",
    "terraform.tfstate.backup*",
    "*.tfstate.*.backup"
)

$cleanupResults = @{
    BakFiles = @()
    BackupFiles = @()
    TerraformBackups = @()
    TotalSize = 0
    TotalCount = 0
}

Write-Host "🔍 Scanning for backup files..." -ForegroundColor Yellow

# Process .bak files
Write-Host "`n📄 .BAK Files:" -ForegroundColor Magenta
Get-ChildItem -Path "." -Recurse -Include "*.bak" -ErrorAction SilentlyContinue | ForEach-Object {
    $file = $_
    $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path), ""
    $size = [math]::Round($file.Length / 1KB, 2)
    
    Write-Host "  🗑️  $relativePath ($size KB)" -ForegroundColor White
    
    $cleanupResults.BakFiles += @{
        Path = $file.FullName
        RelativePath = $relativePath
        Size = $file.Length
        LastModified = $file.LastWriteTime
    }
    $cleanupResults.TotalSize += $file.Length
    $cleanupResults.TotalCount++
    
    if (-not $WhatIf) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "    ✅ Deleted" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Process *backup* files (excluding critical terraform state backups)
Write-Host "`n📄 *BACKUP* Files:" -ForegroundColor Magenta
Get-ChildItem -Path "." -Recurse -Include "*backup*" -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -notmatch "terraform\.tfstate\.backup" -and
    $_.Extension -ne ".backup" -and
    $_.Name -notmatch "alertmanager-backup\.yml"
} | ForEach-Object {
    $file = $_
    $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path), ""
    $size = [math]::Round($file.Length / 1KB, 2)
    
    Write-Host "  🗑️  $relativePath ($size KB)" -ForegroundColor White
    
    $cleanupResults.BackupFiles += @{
        Path = $file.FullName
        RelativePath = $relativePath
        Size = $file.Length
        LastModified = $file.LastWriteTime
    }
    $cleanupResults.TotalSize += $file.Length
    $cleanupResults.TotalCount++
    
    if (-not $WhatIf) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "    ✅ Deleted" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Handle Terraform state backups (preserve but organize)
Write-Host "`n🏗️  Terraform State Backups:" -ForegroundColor Magenta
$terraformBackupDir = "$BackupDir/terraform-states"
if (-not (Test-Path $terraformBackupDir)) {
    New-Item -ItemType Directory -Path $terraformBackupDir -Force | Out-Null
}

Get-ChildItem -Path "." -Recurse -Include "terraform.tfstate.backup*" -ErrorAction SilentlyContinue | ForEach-Object {
    $file = $_
    $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path), ""
    $size = [math]::Round($file.Length / 1KB, 2)
    
    Write-Host "  📦 $relativePath ($size KB) - Moving to organized backup" -ForegroundColor Cyan
    
    $cleanupResults.TerraformBackups += @{
        Path = $file.FullName
        RelativePath = $relativePath
        Size = $file.Length
        LastModified = $file.LastWriteTime
    }
    
    if (-not $WhatIf) {
        try {
            $newName = "$($file.Directory.Name)-$($file.Name)"
            $newPath = Join-Path $terraformBackupDir $newName
            Move-Item $file.FullName $newPath -Force
            Write-Host "    ✅ Moved to $newPath" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "  .bak files: $($cleanupResults.BakFiles.Count)" -ForegroundColor White
Write-Host "  *backup* files: $($cleanupResults.BackupFiles.Count)" -ForegroundColor White
Write-Host "  Terraform backups moved: $($cleanupResults.TerraformBackups.Count)" -ForegroundColor White
Write-Host "  Total files processed: $($cleanupResults.TotalCount)" -ForegroundColor White
Write-Host "  Total space reclaimed: $([math]::Round($cleanupResults.TotalSize / 1MB, 2)) MB" -ForegroundColor White

if ($WhatIf) {
    Write-Host "`n⚠️  WhatIf mode - No files were actually deleted" -ForegroundColor Yellow
    Write-Host "Run with -WhatIf:`$false to perform actual cleanup" -ForegroundColor Yellow
}

# Create Git-based backup strategy documentation
$gitBackupStrategy = @"
# CODAI Git-Based Backup Strategy

## Overview
Following Microsoft DevOps standards, we use Git for version control and backup instead of file system backups.

## Backup Strategy
1. **Git Commits**: All changes are tracked in Git history
2. **Branch Protection**: Important branches have backup policies
3. **Remote Repositories**: Multiple remote repositories for redundancy
4. **Automated Backups**: CI/CD pipeline handles backup automation

## Replaced File System Backups
- ❌ .bak files (use Git history instead)
- ❌ *backup* files (use Git branches instead)
- ❌ Manual file copies (use Git stash/branches instead)

## Best Practices
1. Commit frequently with descriptive messages
2. Use feature branches for experimental work
3. Tag important releases
4. Use Git LFS for large files
5. Regular repository maintenance

## Emergency Recovery
- Use `git reflog` for recent history recovery
- Use `git fsck` for repository integrity checks
- Remote repositories provide disaster recovery
- Automated backups to cloud storage

## Implementation
- Pre-commit hooks prevent .bak file commits
- CI/CD validates no backup files in commits
- Automated cleanup removes backup files
- Documentation updated for Git-first approach
"@

if (-not $WhatIf) {
    $gitBackupStrategy | Out-File "$BackupDir/git-backup-strategy.md" -Encoding UTF8
    Write-Host "📝 Created Git backup strategy documentation" -ForegroundColor Green
}

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green

# Return results for further processing
return $cleanupResults