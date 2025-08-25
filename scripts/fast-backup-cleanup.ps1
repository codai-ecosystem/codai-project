# Fast Backup File Cleanup Script
# Efficiently finds and removes backup files while excluding heavy directories

param(
    [switch]$WhatIf = $true,
    [switch]$Execute = $false
)

Write-Host "🧹 CODAI Fast Backup Cleanup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Define directories to exclude for performance
$excludeDirs = @(
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    '.git',
    'playwright-report',
    'test-results',
    '.turbo',
    '.pnpm-store',
    'target',
    'tmp',
    'temp'
)

# Create exclude pattern for Get-ChildItem
$excludePattern = $excludeDirs -join '|'

Write-Host "🔍 Fast scanning (excluding: $($excludeDirs -join ', '))..." -ForegroundColor Yellow

$results = @{
    BakFiles = @()
    BackupFiles = @()
    TotalSize = 0
}

# Fast scan for .bak files
Write-Host "`n📄 Finding .bak files..." -ForegroundColor Magenta
try {
    Get-ChildItem -Path "." -Recurse -Include "*.bak" -Force -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch $excludePattern } |
        ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Location).Path, "")
            $size = [math]::Round($_.Length / 1KB, 2)
            
            Write-Host "  🗑️  $relativePath ($size KB)" -ForegroundColor White
            
            $results.BakFiles += @{
                Path = $_.FullName
                Size = $_.Length
                Name = $_.Name
            }
            $results.TotalSize += $_.Length
        }
} catch {
    Write-Host "Error scanning .bak files: $($_.Exception.Message)" -ForegroundColor Red
}

# Fast scan for backup files
Write-Host "`n📄 Finding *backup* files..." -ForegroundColor Magenta
try {
    Get-ChildItem -Path "." -Recurse -Include "*backup*" -Force -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.FullName -notmatch $excludePattern -and 
            $_.Name -notmatch "alertmanager-backup\.yml" -and
            $_.Extension -ne ".md"
        } |
        ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Location).Path, "")
            $size = [math]::Round($_.Length / 1KB, 2)
            
            Write-Host "  🗑️  $relativePath ($size KB)" -ForegroundColor White
            
            $results.BackupFiles += @{
                Path = $_.FullName
                Size = $_.Length
                Name = $_.Name
            }
            $results.TotalSize += $_.Length
        }
} catch {
    Write-Host "Error scanning backup files: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
$totalFiles = $results.BakFiles.Count + $results.BackupFiles.Count
$totalSizeMB = [math]::Round($results.TotalSize / 1MB, 2)

Write-Host "`n📊 Scan Results:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "  .bak files found: $($results.BakFiles.Count)" -ForegroundColor White
Write-Host "  *backup* files found: $($results.BackupFiles.Count)" -ForegroundColor White
Write-Host "  Total files: $totalFiles" -ForegroundColor White
Write-Host "  Total size: $totalSizeMB MB" -ForegroundColor White

if ($Execute -and -not $WhatIf) {
    Write-Host "`n🗑️  Executing cleanup..." -ForegroundColor Red
    
    # Delete .bak files
    foreach ($file in $results.BakFiles) {
        try {
            Remove-Item $file.Path -Force
            Write-Host "  ✅ Deleted: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Delete backup files
    foreach ($file in $results.BackupFiles) {
        try {
            Remove-Item $file.Path -Force
            Write-Host "  ✅ Deleted: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
} elseif ($WhatIf) {
    Write-Host "`n⚠️  Preview mode - No files deleted" -ForegroundColor Yellow
    Write-Host "To execute cleanup, run with: -Execute -WhatIf:`$false" -ForegroundColor Yellow
}

return $results