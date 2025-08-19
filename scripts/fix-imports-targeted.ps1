# CODAI Import Reference Fix Script - Targeted Version
# This script finds and fixes import statements that reference consolidated packages/apps

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$WorkspaceRoot = "E:\GitHub\codai-project"

# Logging function
function Write-Log {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Type) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Type] $Message" -ForegroundColor $color
}

# Define import replacements based on consolidation
$ImportReplacements = @{
    # Package import fixes
    "@codai/memorai-mcp-canonical" = "@codai/memorai-mcp"
    "@codai/memorai-mcp-fixed" = "@codai/memorai-mcp"
    "memorai-mcp-canonical" = "memorai-mcp"
    "memorai-mcp-fixed" = "memorai-mcp"
    
    "@codai/codai-auth" = "@codai/auth"
    "codai-auth" = "auth"
    
    "@codai/codai-sdk-js" = "@codai/codai-sdk"
    "codai-sdk-js" = "codai-sdk"
}

# Specific directories to search
$SearchDirectories = @(
    "apps",
    "packages", 
    "scripts",
    "configs"
)

# File extensions to check
$Extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.md", "*.yml", "*.yaml")

# Function to fix imports in content
function Fix-ImportsInContent {
    param($Content, $FilePath)
    
    $originalContent = $Content
    $changesMade = $false
    
    foreach ($oldImport in $ImportReplacements.Keys) {
        $newImport = $ImportReplacements[$oldImport]
        
        if ($Content -match [regex]::Escape($oldImport)) {
            $Content = $Content -replace [regex]::Escape($oldImport), $newImport
            $changesMade = $true
            if ($Verbose) {
                Write-Log "  $FilePath : '$oldImport' -> '$newImport'" "INFO"
            }
        }
    }
    
    return @{
        Content = $Content
        Changed = $changesMade
    }
}

Write-Log "=== STARTING TARGETED IMPORT REFERENCE FIX ===" "INFO"
Write-Log "Workspace: $WorkspaceRoot" "INFO"

if ($DryRun) {
    Write-Log "DRY RUN MODE - No files will be modified" "WARNING"
}

$totalFiles = 0
$changedFiles = 0

Set-Location $WorkspaceRoot

# Search each target directory
foreach ($dir in $SearchDirectories) {
    if (-not (Test-Path $dir)) {
        Write-Log "Directory $dir not found, skipping..." "WARNING"
        continue
    }
    
    Write-Log "Searching directory: $dir" "INFO"
    
    foreach ($ext in $Extensions) {
        try {
            $files = Get-ChildItem -Path $dir -Recurse -Include $ext -File -ErrorAction SilentlyContinue | 
                     Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*\.git*" }
            
            foreach ($file in $files) {
                $totalFiles++
                
                try {
                    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
                    if (-not $content) {
                        continue
                    }
                    
                    $result = Fix-ImportsInContent $content $file.FullName
                    
                    if ($result.Changed) {
                        $changedFiles++
                        Write-Log "Fixing imports in: $($file.FullName.Replace($WorkspaceRoot, '.'))" "INFO"
                        
                        if (-not $DryRun) {
                            Set-Content -Path $file.FullName -Value $result.Content -NoNewline
                            Write-Log "  Updated successfully" "SUCCESS"
                        }
                        else {
                            Write-Log "  [DRY RUN] Would update" "INFO"
                        }
                    }
                }
                catch {
                    Write-Log "Error processing $($file.FullName): $($_.Exception.Message)" "ERROR"
                }
            }
        }
        catch {
            Write-Log "Error searching $dir for $ext : $($_.Exception.Message)" "WARNING"
        }
    }
}

# Also check some important root files
$rootFiles = @("package.json", "pnpm-workspace.yaml", "docker-compose.yml", "README.md")
foreach ($rootFile in $rootFiles) {
    if (Test-Path $rootFile) {
        $totalFiles++
        try {
            $content = Get-Content -Path $rootFile -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $result = Fix-ImportsInContent $content $rootFile
                
                if ($result.Changed) {
                    $changedFiles++
                    Write-Log "Fixing imports in root file: $rootFile" "INFO"
                    
                    if (-not $DryRun) {
                        Set-Content -Path $rootFile -Value $result.Content -NoNewline
                        Write-Log "  Updated successfully" "SUCCESS"
                    }
                    else {
                        Write-Log "  [DRY RUN] Would update" "INFO"
                    }
                }
            }
        }
        catch {
            Write-Log "Error processing root file $rootFile : $($_.Exception.Message)" "ERROR"
        }
    }
}

Write-Log "=== IMPORT FIX COMPLETE ===" "SUCCESS"
Write-Log "Total files processed: $totalFiles" "INFO"
Write-Log "Files with changes: $changedFiles" "SUCCESS"

if ($changedFiles -eq 0) {
    Write-Log "No import references needed fixing - workspace is clean!" "SUCCESS"
}
else {
    Write-Log "Fixed import references in $changedFiles files" "SUCCESS"
    if ($DryRun) {
        Write-Log "Run without -DryRun to apply changes" "INFO"
    }
}

# Generate simple report
$reportPath = "$WorkspaceRoot\IMPORT_FIX_REPORT.md"
$reportContent = @"
# CODAI Import Reference Fix Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
- **Total files processed**: $totalFiles
- **Files with changes**: $changedFiles
- **Mode**: $(if ($DryRun) { "DRY RUN" } else { "APPLIED" })

## Import Replacements Applied
$($ImportReplacements.Keys | ForEach-Object { 
    $oldImport = $_
    $newImport = $ImportReplacements[$oldImport]
    "- ``$oldImport`` → ``$newImport``"
})

## Directories Searched
$($SearchDirectories | ForEach-Object { "- $_" })

## Status
$(if ($changedFiles -eq 0) {
    "✅ No import fixes needed - workspace is clean!"
} elseif ($DryRun) {
    "⚠️ Dry run completed - run without -DryRun to apply $changedFiles changes"
} else {
    "✅ Successfully applied $changedFiles import fixes"
})
"@

if (-not $DryRun) {
    Set-Content -Path $reportPath -Value $reportContent
    Write-Log "Import fix report generated: $reportPath" "SUCCESS"
}
