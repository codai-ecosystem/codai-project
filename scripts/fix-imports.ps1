# CODAI Import Reference Fix Script
# This script finds and fixes import statements that reference consolidated packages/apps

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
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
    
    # App reference fixes (relative imports and config references)
    "./memorai-api" = "./memorai"
    "../memorai-api" = "../memorai"
    "/memorai-api" = "/memorai"
    "memorai-api/" = "memorai/"
    
    "./memorai-docs" = "./memorai"
    "../memorai-docs" = "../memorai"
    "/memorai-docs" = "/memorai"
    "memorai-docs/" = "memorai/"
    
    "./codai-mobile" = "./codai"
    "../codai-mobile" = "../codai"
    "/codai-mobile" = "/codai"
    "codai-mobile/" = "codai/"
    
    "./codai-standalone" = "./codai"
    "../codai-standalone" = "../codai"
    "/codai-standalone" = "/codai"
    "codai-standalone/" = "codai/"
    
    "./aide-api" = "./aide"
    "../aide-api" = "../aide"
    "/aide-api" = "/aide"
    "aide-api/" = "aide/"
    
    "./aide-cli" = "./aide"
    "../aide-cli" = "../aide"
    "/aide-cli" = "/aide"
    "aide-cli/" = "aide/"
    
    "./aide-native" = "./aide"
    "../aide-native" = "../aide"
    "/aide-native" = "/aide"
    "aide-native/" = "aide/"
    
    "./hub-simple" = "./hub"
    "../hub-simple" = "../hub"
    "/hub-simple" = "/hub"
    "hub-simple/" = "hub/"
    
    "./id-simple" = "./id"
    "../id-simple" = "../id"
    "/id-simple" = "/id"
    "id-simple/" = "id/"
    
    "./auth-simple" = "./auth"
    "../auth-simple" = "../auth"
    "/auth-simple" = "/auth"
    "auth-simple/" = "auth/"
}

# File patterns to search
$FilePatterns = @(
    "*.ts", "*.tsx", "*.js", "*.jsx", "*.mjs", "*.cjs",
    "*.json", "*.md", "*.yml", "*.yaml",
    "*.config.js", "*.config.ts", "*.config.mjs",
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml"
)

# Directories to exclude
$ExcludeDirectories = @(
    "node_modules", ".git", "dist", "build", ".next", 
    "coverage", ".cache", "archive", ".vscode",
    "*.log", "*.tmp"
)

# Function to check if file should be excluded
function Should-ExcludeFile {
    param($FilePath)
    
    foreach ($exclude in $ExcludeDirectories) {
        if ($FilePath -like "*\$exclude\*" -or $FilePath -like "*/$exclude/*" -or $FilePath -like "*$exclude*") {
            return $true
        }
    }
    
    # Additional safety checks for problematic paths
    if ($FilePath -like "*node_modules*" -or 
        $FilePath -like "*.git*" -or 
        $FilePath -like "*archive*" -or
        $FilePath.Length -gt 260) {
        return $true
    }
    
    return $false
}

# Function to fix imports in a file
function Fix-ImportsInFile {
    param($FilePath, $Content)
    
    $originalContent = $Content
    $changesMade = $false
    
    foreach ($oldImport in $ImportReplacements.Keys) {
        $newImport = $ImportReplacements[$oldImport]
        
        if ($Content -match [regex]::Escape($oldImport)) {
            $Content = $Content -replace [regex]::Escape($oldImport), $newImport
            $changesFound = $originalContent -ne $Content
            if ($changesFound) {
                $changesMade = $true
                if ($Verbose) {
                    Write-Log "  Found: '$oldImport' -> '$newImport'" "INFO"
                }
            }
        }
    }
    
    return @{
        Content = $Content
        Changed = $changesFound
    }
}

# Main processing function
function Process-File {
    param($File)
    
    if (Should-ExcludeFile $File.FullName) {
        return
    }
    
    try {
        $content = Get-Content -Path $File.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            return
        }
        
        $result = Fix-ImportsInFile $File.FullName $content
        
        if ($result.Changed) {
            Write-Log "Fixing imports in: $($File.FullName)" "INFO"
            
            if (-not $DryRun) {
                Set-Content -Path $File.FullName -Value $result.Content -NoNewline
                Write-Log "  Updated: $($File.FullName)" "SUCCESS"
            }
            else {
                Write-Log "  [DRY RUN] Would update: $($File.FullName)" "INFO"
            }
            
            return 1  # Changed
        }
    }
    catch {
        Write-Log "Error processing $($File.FullName): $($_.Exception.Message)" "ERROR"
    }
    
    return 0  # No changes
}

Write-Log "=== STARTING IMPORT REFERENCE FIX ===" "INFO"
Write-Log "Workspace: $WorkspaceRoot" "INFO"

if ($DryRun) {
    Write-Log "DRY RUN MODE - No files will be modified" "WARNING"
}

$totalFiles = 0
$changedFiles = 0

Set-Location $WorkspaceRoot

# Process all relevant files
foreach ($pattern in $FilePatterns) {
    Write-Log "Searching for files matching: $pattern" "INFO"
    
    try {
        $files = Get-ChildItem -Recurse -Include $pattern -File -ErrorAction SilentlyContinue | Where-Object { 
            -not (Should-ExcludeFile $_.FullName) 
        }
        
        foreach ($file in $files) {
            $totalFiles++
            $changes = Process-File $file
            $changedFiles += $changes
            
            if ($totalFiles % 100 -eq 0) {
                Write-Log "Processed $totalFiles files..." "INFO"
            }
        }
    }
    catch {
        Write-Log "Error searching for $pattern : $($_.Exception.Message)" "WARNING"
        continue
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

# Generate fix report
$reportPath = "$WorkspaceRoot\IMPORT_FIX_REPORT.md"
$reportContent = @"
# CODAI Import Reference Fix Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
Fixed import references after duplicate consolidation.

## Statistics
- **Total files processed**: $totalFiles
- **Files with changes**: $changedFiles
- **Mode**: $(if ($DryRun) { "DRY RUN" } else { "APPLIED" })

## Import Replacements Applied
"@

foreach ($oldImport in $ImportReplacements.Keys) {
    $newImport = $ImportReplacements[$oldImport]
    $reportContent += "- ``$oldImport`` → ``$newImport```n"
}

$reportContent += @"

## Next Steps
$(if ($changedFiles -gt 0 -and -not $DryRun) {
"1. Test all applications to ensure proper functionality
2. Update any remaining manual references
3. Verify all imports are working correctly"
} elseif ($changedFiles -gt 0 -and $DryRun) {
"1. Review the dry run results
2. Run the script without -DryRun to apply changes
3. Test all applications after applying changes"
} else {
"1. No import fixes were needed
2. Workspace is clean and ready for use"
})

## File Patterns Searched
$($FilePatterns | ForEach-Object { "- $_" } | Out-String)

## Excluded Directories  
$($ExcludeDirectories | ForEach-Object { "- $_" } | Out-String)
"@

if (-not $DryRun) {
    Set-Content -Path $reportPath -Value $reportContent
    Write-Log "Import fix report generated: $reportPath" "SUCCESS"
}
else {
    Write-Log "[DRY RUN] Report content prepared but not written" "INFO"
}
