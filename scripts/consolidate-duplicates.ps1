# CODAI Workspace Duplicate Consolidation Script
# This script consolidates duplicate packages and apps, preserving the most current versions

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false,
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

# Create legacy archive directory
$LegacyDir = "$WorkspaceRoot\archive\legacy-duplicates"
if (-not (Test-Path $LegacyDir) -and -not $DryRun) {
    New-Item -ItemType Directory -Path $LegacyDir -Force | Out-Null
    Write-Log "Created legacy duplicates archive: $LegacyDir" "SUCCESS"
}

# Define duplicate consolidation rules
$PackageDuplicates = @{
    "memorai-mcp" = @{
        "primary" = "memorai-mcp"
        "duplicates" = @("memorai-mcp-canonical", "memorai-mcp-fixed")
        "reason" = "memorai-mcp v9.9.0-phase3-enterprise is the current version"
    }
    "auth" = @{
        "primary" = "auth"
        "duplicates" = @("codai-auth")
        "reason" = "auth v1.1.2 is the complete implementation, codai-auth v1.0.0 is just a stub"
    }
    "codai-sdk" = @{
        "primary" = "codai-sdk"
        "duplicates" = @("codai-sdk-js")
        "reason" = "codai-sdk is the main SDK, codai-sdk-js appears redundant"
    }
}

$AppDuplicates = @{
    "memorai" = @{
        "primary" = "memorai"
        "duplicates" = @("memorai-api", "memorai-docs")
        "reason" = "memorai contains integrated API and docs"
    }
    "codai" = @{
        "primary" = "codai"
        "duplicates" = @("codai-mobile", "codai-standalone")
        "reason" = "codai is the main application"
    }
    "hub" = @{
        "primary" = "hub"
        "duplicates" = @("hub-simple")
        "reason" = "hub is the main hub application"
    }
    "id" = @{
        "primary" = "id"
        "duplicates" = @("id-simple")
        "reason" = "id is the main identity service"
    }
    "aide" = @{
        "primary" = "aide"
        "duplicates" = @("aide-api", "aide-cli", "aide-native")
        "reason" = "aide is the main application, others are specialized versions"
    }
}

# Function to analyze package.json to determine which version is newer
function Get-PackageVersion {
    param($PackagePath)
    
    $packageJsonPath = Join-Path $PackagePath "package.json"
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            return $packageJson.version
        }
        catch {
            Write-Log "Failed to parse package.json in $PackagePath" "WARNING"
            return "0.0.0"
        }
    }
    return "0.0.0"
}

# Function to compare semantic versions
function Compare-Version {
    param($Version1, $Version2)
    
    try {
        $v1 = [System.Version]::new($Version1 -replace '[^0-9.]', '')
        $v2 = [System.Version]::new($Version2 -replace '[^0-9.]', '')
        return $v1.CompareTo($v2)
    }
    catch {
        # If version parsing fails, use string comparison
        return $Version1.CompareTo($Version2)
    }
}

# Function to move duplicate to archive
function Move-DuplicateToArchive {
    param($SourcePath, $Type, $Name, $Reason)
    
    $archivePath = Join-Path $LegacyDir "$Type\$Name"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would move: $SourcePath -> $archivePath" "INFO"
        Write-Log "[DRY RUN] Reason: $Reason" "INFO"
        return
    }
    
    try {
        # Create archive subdirectory
        $archiveParent = Split-Path $archivePath -Parent
        if (-not (Test-Path $archiveParent)) {
            New-Item -ItemType Directory -Path $archiveParent -Force | Out-Null
        }
        
        # Move the duplicate
        Move-Item -Path $SourcePath -Destination $archivePath -Force
        Write-Log "Moved duplicate: $Name -> archive\legacy-duplicates\$Type\$Name" "SUCCESS"
        Write-Log "Reason: $Reason" "INFO"
    }
    catch {
        Write-Log "Failed to move $SourcePath : $($_.Exception.Message)" "ERROR"
    }
}

# Process package duplicates
Write-Log "=== PROCESSING PACKAGE DUPLICATES ===" "INFO"
Set-Location "$WorkspaceRoot\packages"

foreach ($group in $PackageDuplicates.Keys) {
    $config = $PackageDuplicates[$group]
    $primary = $config.primary
    $duplicates = $config.duplicates
    $reason = $config.reason
    
    Write-Log "Processing package group: $group" "INFO"
    Write-Log "Primary: $primary" "INFO"
    Write-Log "Duplicates: $($duplicates -join ', ')" "INFO"
    
    # Verify primary exists
    if (-not (Test-Path $primary)) {
        Write-Log "WARNING: Primary package $primary not found!" "WARNING"
        continue
    }
    
    # Get primary version for validation
    $primaryVersion = Get-PackageVersion $primary
    Write-Log "Primary version: $primaryVersion" "INFO"
    
    # Process each duplicate
    foreach ($duplicate in $duplicates) {
        if (Test-Path $duplicate) {
            $duplicateVersion = Get-PackageVersion $duplicate
            Write-Log "Duplicate $duplicate version: $duplicateVersion" "INFO"
            
            # Compare versions to ensure we're keeping the right one
            $comparison = Compare-Version $primaryVersion $duplicateVersion
            if ($comparison -lt 0 -and -not $Force) {
                Write-Log "WARNING: Duplicate $duplicate has newer version than primary! Use -Force to override." "WARNING"
                continue
            }
            
            Move-DuplicateToArchive "$duplicate" "packages" $duplicate $reason
        }
        else {
            Write-Log "Duplicate package $duplicate not found (already removed?)" "INFO"
        }
    }
}

# Process app duplicates
Write-Log "=== PROCESSING APP DUPLICATES ===" "INFO"
Set-Location "$WorkspaceRoot\apps"

foreach ($group in $AppDuplicates.Keys) {
    $config = $AppDuplicates[$group]
    $primary = $config.primary
    $duplicates = $config.duplicates
    $reason = $config.reason
    
    Write-Log "Processing app group: $group" "INFO"
    Write-Log "Primary: $primary" "INFO"
    Write-Log "Duplicates: $($duplicates -join ', ')" "INFO"
    
    # Verify primary exists
    if (-not (Test-Path $primary)) {
        Write-Log "WARNING: Primary app $primary not found!" "WARNING"
        continue
    }
    
    # Process each duplicate
    foreach ($duplicate in $duplicates) {
        if (Test-Path $duplicate) {
            Move-DuplicateToArchive "$duplicate" "apps" $duplicate $reason
        }
        else {
            Write-Log "Duplicate app $duplicate not found (already removed?)" "INFO"
        }
    }
}

# Handle special cases
Write-Log "=== PROCESSING SPECIAL CASES ===" "INFO"

# Handle nested apps/apps directory
if (Test-Path "$WorkspaceRoot\apps\apps") {
    Write-Log "Found nested apps directory - investigating contents" "INFO"
    $nestedApps = Get-ChildItem "$WorkspaceRoot\apps\apps"
    if ($nestedApps.Count -eq 0) {
        if (-not $DryRun) {
            Remove-Item "$WorkspaceRoot\apps\apps" -Force
            Write-Log "Removed empty nested apps directory" "SUCCESS"
        }
        else {
            Write-Log "[DRY RUN] Would remove empty nested apps directory" "INFO"
        }
    }
    else {
        Write-Log "Nested apps directory contains ecosystem configuration files - moving to configs/" "INFO"
        $configsDir = "$WorkspaceRoot\configs\ecosystem"
        
        if (-not $DryRun) {
            if (-not (Test-Path $configsDir)) {
                New-Item -ItemType Directory -Path $configsDir -Force | Out-Null
            }
            
            # Move ecosystem configuration files
            foreach ($file in $nestedApps) {
                $destPath = Join-Path $configsDir $file.Name
                Move-Item -Path $file.FullName -Destination $destPath -Force
                Write-Log "Moved ecosystem config: $($file.Name) -> configs/ecosystem/" "SUCCESS"
            }
            
            # Remove empty nested directory
            Remove-Item "$WorkspaceRoot\apps\apps" -Force
            Write-Log "Removed nested apps directory after moving configs" "SUCCESS"
        }
        else {
            $nestedApps | ForEach-Object { 
                Write-Log "[DRY RUN] Would move ecosystem config: $($_.Name) -> configs/ecosystem/" "INFO" 
            }
            Write-Log "[DRY RUN] Would remove nested apps directory" "INFO"
        }
    }
}

# Handle auth-simple
if (Test-Path "$WorkspaceRoot\apps\auth-simple") {
    Move-DuplicateToArchive "$WorkspaceRoot\apps\auth-simple" "apps" "auth-simple" "Superseded by main auth package"
}

# Generate consolidation report
$reportPath = "$WorkspaceRoot\DUPLICATE_CONSOLIDATION_REPORT.md"
$reportContent = @"
# CODAI Workspace Duplicate Consolidation Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
This report documents the consolidation of duplicate packages and applications in the CODAI workspace.

## Package Consolidations
"@

foreach ($group in $PackageDuplicates.Keys) {
    $config = $PackageDuplicates[$group]
    $reportContent += @"

### $group
- **Primary**: $($config.primary)
- **Archived**: $($config.duplicates -join ', ')
- **Reason**: $($config.reason)
"@
}

$reportContent += @"

## App Consolidations
"@

foreach ($group in $AppDuplicates.Keys) {
    $config = $AppDuplicates[$group]
    $reportContent += @"

### $group
- **Primary**: $($config.primary)
- **Archived**: $($config.duplicates -join ', ')
- **Reason**: $($config.reason)
"@
}

$reportContent += @"

## Next Steps
1. Update import statements to reference primary packages/apps
2. Update VS Code tasks and configurations
3. Update deployment scripts and documentation
4. Test all applications to ensure proper functionality

## Archive Location
Archived duplicates can be found in: `archive/legacy-duplicates/`
"@

if (-not $DryRun) {
    Set-Content -Path $reportPath -Value $reportContent
    Write-Log "Consolidation report generated: $reportPath" "SUCCESS"
}
else {
    Write-Log "[DRY RUN] Report content prepared but not written" "INFO"
}

Write-Log "=== CONSOLIDATION COMPLETE ===" "SUCCESS"
Write-Log "Use -DryRun parameter to preview changes before execution" "INFO"
Write-Log "Use -Force parameter to override version warnings" "INFO"

# Return to workspace root
Set-Location $WorkspaceRoot
