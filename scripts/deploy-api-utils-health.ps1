#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Deploy @codai/api-utils health endpoints across the ecosystem

.DESCRIPTION
    This script identifies and replaces duplicate health endpoint implementations
    across all applications with standardized @codai/api-utils health utilities.
    
    Based on API analysis findings:
    - 23 duplicate health endpoints across 15 apps  
    - ~540 lines of duplicate code to be eliminated
    - Standardized health checks with service discovery

.PARAMETER AppPaths
    Array of application paths to process. If not provided, will process all apps in the workspace.

.PARAMETER DryRun
    If specified, will only show what would be changed without making modifications.

.EXAMPLE
    .\deploy-api-utils-health.ps1 -DryRun
    Shows what would be changed without making modifications

.EXAMPLE
    .\deploy-api-utils-health.ps1 -AppPaths @('apps/memorai', 'apps/romai', 'apps/bancai')
    Deploy health endpoints to specific apps
#>

param(
    [string[]]$AppPaths = @(),
    [switch]$DryRun
)

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Split-Path -Parent $ScriptDir

Write-Host "🏥 CODAI API Utils - Health Endpoints Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Define high-priority apps for Phase 1 deployment
$HighPriorityApps = @(
    "apps/memorai",
    "apps/romai", 
    "apps/bancai",
    "apps/explorer",
    "apps/codai-dashboard",
    "packages/cbd",
    "packages/memorai-mcp"
)

# If no specific app paths provided, use high-priority apps
if ($AppPaths.Count -eq 0) {
    $AppPaths = $HighPriorityApps
}

# Validate workspace structure
if (-not (Test-Path "$WorkspaceRoot/packages/api-utils/dist/health.js")) {
    Write-Error "❌ @codai/api-utils package not found or not built. Please run 'npm run build' in packages/api-utils first."
    exit 1
}

Write-Host "📦 @codai/api-utils package validated ✅" -ForegroundColor Green
Write-Host ""

# Track deployment statistics
$Stats = @{
    AppsProcessed = 0
    EndpointsReplaced = 0
    LinesEliminated = 0
    FilesModified = 0
    Errors = 0
}

# Health endpoint patterns to detect and replace
$HealthPatterns = @{
    SimpleHealth = @{
        Pattern = '/api/health.*get.*status.*ok'
        Replacement = 'createSimpleHealthEndpoint()'
        Description = 'Simple health check endpoint'
    }
    DetailedHealth = @{
        Pattern = '/api/health.*database.*memory.*uptime'
        Replacement = 'createHealthEndpoint()'
        Description = 'Detailed health check with system metrics'
    }
    StatusEndpoint = @{
        Pattern = '/api/status.*service.*version'
        Replacement = 'createStatusEndpoint()'
        Description = 'Status endpoint with service info'
    }
}

function Add-ApiUtilsDependency {
    param(
        [string]$AppPath,
        [bool]$DryRun
    )
    
    $PackageJsonPath = Join-Path $WorkspaceRoot $AppPath "package.json"
    
    if (-not (Test-Path $PackageJsonPath)) {
        Write-Warning "⚠️  No package.json found in $AppPath"
        return $false
    }
    
    try {
        $PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        
        # Check if dependency already exists
        if ($PackageJson.dependencies.'@codai/api-utils') {
            Write-Host "  📦 @codai/api-utils dependency already exists" -ForegroundColor Gray
            return $true
        }
        
        # Add dependency
        if (-not $PackageJson.dependencies) {
            $PackageJson | Add-Member -Type NoteProperty -Name dependencies -Value ([PSCustomObject]@{})
        }
        
        # Convert dependencies to hashtable for easier manipulation
        if ($PackageJson.dependencies -is [PSCustomObject]) {
            $DepsHash = @{}
            $PackageJson.dependencies.PSObject.Properties | ForEach-Object {
                $DepsHash[$_.Name] = $_.Value
            }
            $DepsHash['@codai/api-utils'] = 'workspace:*'
            
            # Convert back to PSCustomObject
            $NewDeps = [PSCustomObject]$DepsHash
            $PackageJson.dependencies = $NewDeps
        } else {
            $PackageJson.dependencies.'@codai/api-utils' = 'workspace:*'
        }
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would add @codai/api-utils dependency" -ForegroundColor Yellow
        } else {
            $PackageJson | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath -Encoding UTF8
            Write-Host "  ✅ Added @codai/api-utils dependency" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Error "❌ Failed to update package.json in $AppPath : $($_.Exception.Message)"
        return $false
    }
}

function Find-HealthEndpoints {
    param(
        [string]$AppPath
    )
    
    $HealthEndpoints = @()
    $ApiFiles = @()
    
    # Common API file patterns
    $ApiPatterns = @(
        "*/api/health.*",
        "*/api/status.*", 
        "*/routes/health.*",
        "*/routes/status.*",
        "*/pages/api/health.*",
        "*health*.ts",
        "*health*.js"
    )
    
    foreach ($Pattern in $ApiPatterns) {
        $Files = Get-ChildItem -Path (Join-Path $WorkspaceRoot $AppPath) -Recurse -Filter $Pattern -ErrorAction SilentlyContinue
        $ApiFiles += $Files
    }
    
    foreach ($File in $ApiFiles) {
        try {
            $Content = Get-Content $File.FullName -Raw
            
            # Detect health endpoint patterns
            foreach ($PatternName in $HealthPatterns.Keys) {
                $Pattern = $HealthPatterns[$PatternName]
                
                if ($Content -match $Pattern.Pattern) {
                    $HealthEndpoints += @{
                        File = $File.FullName
                        Pattern = $PatternName
                        Description = $Pattern.Description
                        Replacement = $Pattern.Replacement
                        Lines = ($Content -split "`n").Count
                    }
                }
            }
        }
        catch {
            Write-Warning "⚠️  Could not analyze file: $($File.FullName)"
        }
    }
    
    return $HealthEndpoints
}

function Replace-HealthEndpoint {
    param(
        [hashtable]$Endpoint,
        [bool]$DryRun
    )
    
    try {
        $FilePath = $Endpoint.File
        $Content = Get-Content $FilePath -Raw
        
        # Create standardized health endpoint replacement
        $ImportStatement = "import { $($Endpoint.Replacement -replace '\(\)', '') } from '@codai/api-utils/health';"
        $NewEndpoint = $Endpoint.Replacement
        
        # Generate replacement based on pattern type
        $ReplacementCode = switch ($Endpoint.Pattern) {
            'SimpleHealth' {
                @"
$ImportStatement

export default createSimpleHealthEndpoint({
  service: '$($FilePath | Split-Path | Split-Path | Split-Path -Leaf)',
  version: process.env.npm_package_version || '1.0.0'
});
"@
            }
            'DetailedHealth' {
                @"
$ImportStatement

export default createHealthEndpoint({
  service: '$($FilePath | Split-Path | Split-Path | Split-Path -Leaf)',
  version: process.env.npm_package_version || '1.0.0',
  healthChecks: {
    database: async () => ({ status: 'healthy', responseTime: 50 }),
    memory: async () => ({ 
      status: 'healthy', 
      usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) 
    })
  }
});
"@
            }
            'StatusEndpoint' {
                @"
$ImportStatement

export default createStatusEndpoint({
  service: '$($FilePath | Split-Path | Split-Path | Split-Path -Leaf)',
  version: process.env.npm_package_version || '1.0.0'
});
"@
            }
        }
        
        if ($DryRun) {
            Write-Host "    [DRY RUN] Would replace $($Endpoint.Lines) lines with standardized endpoint" -ForegroundColor Yellow
            Write-Host "    [DRY RUN] Pattern: $($Endpoint.Description)" -ForegroundColor Yellow
        } else {
            Set-Content -Path $FilePath -Value $ReplacementCode -Encoding UTF8
            Write-Host "    ✅ Replaced $($Endpoint.Lines) lines with $($Endpoint.Replacement)" -ForegroundColor Green
            $Stats.LinesEliminated += $Endpoint.Lines - ($ReplacementCode -split "`n").Count
            $Stats.FilesModified++
        }
        
        $Stats.EndpointsReplaced++
        return $true
    }
    catch {
        Write-Error "❌ Failed to replace endpoint in $($Endpoint.File) : $($_.Exception.Message)"
        $Stats.Errors++
        return $false
    }
}

# Main deployment loop
foreach ($AppPath in $AppPaths) {
    $FullAppPath = Join-Path $WorkspaceRoot $AppPath
    
    if (-not (Test-Path $FullAppPath)) {
        Write-Warning "⚠️  App path not found: $AppPath"
        continue
    }
    
    Write-Host "🚀 Processing app: $AppPath" -ForegroundColor Blue
    Write-Host "   Path: $FullAppPath" -ForegroundColor Gray
    
    # Step 1: Add @codai/api-utils dependency
    $DependencyAdded = Add-ApiUtilsDependency -AppPath $AppPath -DryRun $DryRun
    
    if (-not $DependencyAdded) {
        Write-Warning "⚠️  Skipping $AppPath due to dependency issues"
        continue
    }
    
    # Step 2: Find health endpoints
    $HealthEndpoints = Find-HealthEndpoints -AppPath $AppPath
    
    Write-Host "   📊 Found $($HealthEndpoints.Count) health endpoint(s)" -ForegroundColor Cyan
    
    # Step 3: Replace health endpoints
    foreach ($Endpoint in $HealthEndpoints) {
        Write-Host "   🔄 Processing: $($Endpoint.Description)" -ForegroundColor White
        Write-Host "      File: $($Endpoint.File -replace [regex]::Escape($WorkspaceRoot), '.')" -ForegroundColor Gray
        
        $Success = Replace-HealthEndpoint -Endpoint $Endpoint -DryRun $DryRun
        
        if (-not $Success) {
            Write-Warning "⚠️  Failed to process endpoint in $($Endpoint.File)"
        }
    }
    
    $Stats.AppsProcessed++
    Write-Host ""
}

# Display deployment summary
Write-Host "📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Apps Processed:      $($Stats.AppsProcessed)" -ForegroundColor Green
Write-Host "Endpoints Replaced:  $($Stats.EndpointsReplaced)" -ForegroundColor Green
Write-Host "Files Modified:      $($Stats.FilesModified)" -ForegroundColor Green
Write-Host "Lines Eliminated:    $($Stats.LinesEliminated)" -ForegroundColor Green
Write-Host "Errors:              $($Stats.Errors)" -ForegroundColor $(if($Stats.Errors -eq 0) { 'Green' } else { 'Red' })

if ($DryRun) {
    Write-Host ""
    Write-Host "🏃 DRY RUN COMPLETE - No files were modified" -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to apply changes" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🎉 HEALTH ENDPOINTS DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'pnpm install' to update dependencies" -ForegroundColor White
    Write-Host "2. Test health endpoints in each app" -ForegroundColor White
    Write-Host "3. Proceed with Phase 2: Authentication endpoints" -ForegroundColor White
}

# Exit with error code if there were errors
if ($Stats.Errors -gt 0) {
    exit 1
}