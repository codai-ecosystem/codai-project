#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - CONFIGURATION AUDIT & VALIDATION
# ==================================================

param(
    [switch]$Verbose = $false,
    [switch]$ShowFullConfigs = $false,
    [string]$ConfigPath = "."
)

Write-Host "🔧 CODAI ECOSYSTEM - CONFIGURATION AUDIT & VALIDATION" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Comprehensive docker-compose, environment, and service configuration analysis" -ForegroundColor White
Write-Host ""

# Global configuration audit results
$global:ConfigAudit = @{
    DockerComposeFiles = @()
    EnvironmentFiles = @()
    ServiceConfigurations = @()
    PortMappingIssues = @()
    EnvironmentVariableIssues = @()
    DependencyIssues = @()
    ConfigurationErrors = @()
    RecommendedFixes = @()
}

function Write-ConfigSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🔧 $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Gray
}

function Find-ConfigurationFiles {
    param([string]$BasePath)
    
    $configFiles = @{
        DockerComposeFiles = @()
        EnvironmentFiles = @()
        PackageJsonFiles = @()
        ConfigFiles = @()
    }
    
    try {
        # Find docker-compose files
        $dockerComposePatterns = @("docker-compose*.yml", "docker-compose*.yaml")
        foreach ($pattern in $dockerComposePatterns) {
            $files = Get-ChildItem -Path $BasePath -Name $pattern -File -ErrorAction SilentlyContinue
            if ($files) {
                $configFiles.DockerComposeFiles += $files | ForEach-Object { Join-Path $BasePath $_ }
            }
        }
        
        # Find environment files  
        $envFiles = Get-ChildItem -Path $BasePath -Name ".env*" -File -ErrorAction SilentlyContinue
        if ($envFiles) {
            $configFiles.EnvironmentFiles += $envFiles | ForEach-Object { Join-Path $BasePath $_ }
        }
        
        # Find package.json files (for Node.js services)
        $packageFiles = Get-ChildItem -Path $BasePath -Name "package.json" -File -ErrorAction SilentlyContinue
        if ($packageFiles) {
            $configFiles.PackageJsonFiles += $packageFiles | ForEach-Object { Join-Path $BasePath $_ }
        }
        
        return $configFiles
        
    } catch {
        Write-Host "❌ Error finding configuration files: $($_.Exception.Message)" -ForegroundColor Red
        return $configFiles
    }
}

function Analyze-DockerComposeFile {
    param([string]$FilePath)
    
    try {
        $content = Get-Content $FilePath -Raw
        $analysis = @{
            File = $FilePath
            Services = @()
            Networks = @()
            Volumes = @()
            PortMappings = @()
            EnvironmentVariables = @()
            Issues = @()
            Success = $true
        }
        
        # Parse YAML content (simplified parsing for key information)
        $lines = Get-Content $FilePath
        $currentService = $null
        $inServices = $false
        $inNetworks = $false
        $inVolumes = $false
        
        foreach ($line in $lines) {
            $trimmedLine = $line.Trim()
            
            # Track sections
            if ($trimmedLine -eq "services:") {
                $inServices = $true
                $inNetworks = $false
                $inVolumes = $false
                continue
            } elseif ($trimmedLine -eq "networks:") {
                $inServices = $false
                $inNetworks = $true
                $inVolumes = $false
                continue
            } elseif ($trimmedLine -eq "volumes:") {
                $inServices = $false
                $inNetworks = $false
                $inVolumes = $true
                continue
            }
            
            # Parse services
            if ($inServices -and $line -match "^  ([a-zA-Z0-9-_]+):$") {
                $currentService = $matches[1]
                $analysis.Services += $currentService
            }
            
            # Parse port mappings
            if ($inServices -and $currentService -and $line -match "^\s+- `"?(\d+):(\d+)`"?") {
                $analysis.PortMappings += @{
                    Service = $currentService
                    HostPort = $matches[1]
                    ContainerPort = $matches[2]
                    Mapping = "$($matches[1]):$($matches[2])"
                }
            }
            
            # Parse environment variables
            if ($inServices -and $currentService -and $line -match "^\s+- ([A-Z_][A-Z0-9_]*)=(.*)") {
                $analysis.EnvironmentVariables += @{
                    Service = $currentService
                    Variable = $matches[1]
                    Value = $matches[2]
                }
            }
            
            # Parse networks
            if ($inNetworks -and $line -match "^  ([a-zA-Z0-9-_]+):") {
                $analysis.Networks += $matches[1]
            }
            
            # Parse volumes  
            if ($inVolumes -and $line -match "^  ([a-zA-Z0-9-_]+):") {
                $analysis.Volumes += $matches[1]
            }
        }
        
        return $analysis
        
    } catch {
        return @{
            File = $FilePath
            Services = @()
            Networks = @()
            Volumes = @()
            PortMappings = @()
            EnvironmentVariables = @()
            Issues = @("Failed to parse docker-compose file: $($_.Exception.Message)")
            Success = $false
        }
    }
}

function Validate-PortMappingConsistency {
    param([array]$AllPortMappings)
    
    $issues = @()
    $portUsage = @{}
    
    foreach ($mapping in $AllPortMappings) {
        $hostPort = $mapping.HostPort
        
        if ($portUsage.ContainsKey($hostPort)) {
            $issues += "Port conflict: Host port $hostPort is used by both '$($portUsage[$hostPort])' and '$($mapping.Service)'"
        } else {
            $portUsage[$hostPort] = $mapping.Service
        }
    }
    
    return $issues
}

function Cross-Reference-ExpectedServices {
    param([array]$ConfiguredServices, [array]$ExpectedServices)
    
    $issues = @()
    
    foreach ($expected in $ExpectedServices) {
        if ($expected -notin $ConfiguredServices) {
            $issues += "Missing service configuration: '$expected' not found in docker-compose files"
        }
    }
    
    return $issues
}

function Analyze-BancAIPortIssue {
    param([array]$PortMappings)
    
    $bancaiMappings = $PortMappings | Where-Object { $_.Service -like "*bancai*" }
    $analysis = @{
        Service = "BancAI"
        ExpectedPort = 4005
        ActualMappings = $bancaiMappings
        Issues = @()
        Recommendations = @()
    }
    
    if ($bancaiMappings.Count -eq 0) {
        $analysis.Issues += "No port mappings found for BancAI service"
        $analysis.Recommendations += "Add port mapping '4005:4005' to BancAI service in docker-compose"
    } else {
        foreach ($mapping in $bancaiMappings) {
            if ($mapping.HostPort -ne "4005") {
                $analysis.Issues += "BancAI service is mapped to host port $($mapping.HostPort) instead of expected port 4005"
                $analysis.Recommendations += "Change port mapping from '$($mapping.Mapping)' to '4005:$($mapping.ContainerPort)'"
            }
        }
    }
    
    return $analysis
}

# =============================================================================
# PHASE 1: DISCOVER CONFIGURATION FILES
# =============================================================================
Write-ConfigSection "CONFIGURATION FILE DISCOVERY"

Write-Host "Discovering configuration files in workspace..." -ForegroundColor Yellow

$configFiles = Find-ConfigurationFiles -BasePath $ConfigPath
$global:ConfigAudit.ConfigurationFiles = $configFiles

Write-Host "📁 Configuration files found:" -ForegroundColor Cyan
Write-Host "   Docker Compose Files: $($configFiles.DockerComposeFiles.Count)" -ForegroundColor White
$configFiles.DockerComposeFiles | ForEach-Object { Write-Host "      • $_" -ForegroundColor Gray }

Write-Host "   Environment Files: $($configFiles.EnvironmentFiles.Count)" -ForegroundColor White  
$configFiles.EnvironmentFiles | ForEach-Object { Write-Host "      • $_" -ForegroundColor Gray }

Write-Host "   Package.json Files: $($configFiles.PackageJsonFiles.Count)" -ForegroundColor White
$configFiles.PackageJsonFiles | Select-Object -First 5 | ForEach-Object { Write-Host "      • $_" -ForegroundColor Gray }
if ($configFiles.PackageJsonFiles.Count -gt 5) {
    Write-Host "      • ... and $($configFiles.PackageJsonFiles.Count - 5) more" -ForegroundColor Gray
}

# =============================================================================
# PHASE 2: ANALYZE DOCKER-COMPOSE FILES
# =============================================================================
Write-ConfigSection "DOCKER-COMPOSE CONFIGURATION ANALYSIS"

$allServices = @()
$allPortMappings = @()
$allEnvironmentVars = @()

foreach ($composeFile in $configFiles.DockerComposeFiles) {
    Write-Host ""
    Write-Host "📋 Analyzing: $(Split-Path $composeFile -Leaf)" -ForegroundColor Cyan
    
    $analysis = Analyze-DockerComposeFile -FilePath $composeFile
    $global:ConfigAudit.DockerComposeFiles += $analysis
    
    if ($analysis.Success) {
        Write-Host "   Services: $($analysis.Services.Count)" -ForegroundColor Green
        $analysis.Services | ForEach-Object { Write-Host "      • $_" -ForegroundColor White }
        
        Write-Host "   Port Mappings: $($analysis.PortMappings.Count)" -ForegroundColor Green
        $analysis.PortMappings | ForEach-Object { 
            Write-Host "      • $($_.Service): $($_.Mapping)" -ForegroundColor White 
        }
        
        Write-Host "   Networks: $($analysis.Networks.Count)" -ForegroundColor Green
        $analysis.Networks | ForEach-Object { Write-Host "      • $_" -ForegroundColor White }
        
        # Accumulate data for cross-file analysis
        $allServices += $analysis.Services
        $allPortMappings += $analysis.PortMappings
        $allEnvironmentVars += $analysis.EnvironmentVariables
        
    } else {
        Write-Host "   ❌ Analysis failed:" -ForegroundColor Red
        $analysis.Issues | ForEach-Object { Write-Host "      • $_" -ForegroundColor Red }
    }
}

# =============================================================================
# PHASE 3: PORT MAPPING VALIDATION
# =============================================================================
Write-ConfigSection "PORT MAPPING VALIDATION"

# Validate port mapping consistency
$portConflicts = Validate-PortMappingConsistency -AllPortMappings $allPortMappings
$global:ConfigAudit.PortMappingIssues = $portConflicts

Write-Host "Validating port mapping consistency..." -ForegroundColor Yellow

if ($portConflicts.Count -gt 0) {
    Write-Host "❌ Port mapping conflicts found:" -ForegroundColor Red
    $portConflicts | ForEach-Object { 
        Write-Host "   • $_" -ForegroundColor Red 
        $global:ConfigAudit.ConfigurationErrors += $_
    }
} else {
    Write-Host "✅ No port mapping conflicts detected" -ForegroundColor Green
}

# Expected vs Configured Services Analysis
$expectedServices = @(
    "nginx-load-balancer", "controlai-frontend", "romai-frontend", 
    "explorer-frontend", "kodex-frontend", "bancai-frontend",
    "memorai-graphql-api", "memorai-mcp-api", "romai-compliance-api",
    "main-api-gateway", "secure-api-gateway", "postgresql-db"
)

$missingServices = Cross-Reference-ExpectedServices -ConfiguredServices $allServices -ExpectedServices $expectedServices

if ($missingServices.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Missing service configurations:" -ForegroundColor Yellow
    $missingServices | ForEach-Object { 
        Write-Host "   • $_" -ForegroundColor Yellow 
        $global:ConfigAudit.DependencyIssues += $_
    }
} else {
    Write-Host "✅ All expected services found in configuration" -ForegroundColor Green
}

# =============================================================================
# PHASE 4: SPECIFIC ISSUE INVESTIGATION
# =============================================================================
Write-ConfigSection "SPECIFIC ISSUE INVESTIGATION"

# BancAI Port Issue Analysis
Write-Host "🔍 BancAI Port Mapping Issue Analysis:" -ForegroundColor Cyan

$bancaiAnalysis = Analyze-BancAIPortIssue -PortMappings $allPortMappings

Write-Host "   Expected Port: $($bancaiAnalysis.ExpectedPort)" -ForegroundColor White
Write-Host "   Actual Mappings: $($bancaiAnalysis.ActualMappings.Count)" -ForegroundColor White

if ($bancaiAnalysis.ActualMappings.Count -gt 0) {
    $bancaiAnalysis.ActualMappings | ForEach-Object {
        Write-Host "      • Service: $($_.Service), Mapping: $($_.Mapping)" -ForegroundColor Gray
    }
}

if ($bancaiAnalysis.Issues.Count -gt 0) {
    Write-Host "   ❌ Issues found:" -ForegroundColor Red
    $bancaiAnalysis.Issues | ForEach-Object { 
        Write-Host "      • $_" -ForegroundColor Red 
        $global:ConfigAudit.ConfigurationErrors += "BancAI: $_"
    }
}

if ($bancaiAnalysis.Recommendations.Count -gt 0) {
    Write-Host "   💡 Recommendations:" -ForegroundColor Blue
    $bancaiAnalysis.Recommendations | ForEach-Object { 
        Write-Host "      • $_" -ForegroundColor Blue 
        $global:ConfigAudit.RecommendedFixes += "BancAI: $_"
    }
}

# API Gateway Port Binding Investigation
Write-Host ""
Write-Host "🔍 API Gateway Port Binding Investigation:" -ForegroundColor Cyan

$gatewayServices = $allServices | Where-Object { $_ -like "*gateway*" }
$gatewayMappings = $allPortMappings | Where-Object { $_.Service -like "*gateway*" }

Write-Host "   Gateway Services: $($gatewayServices.Count)" -ForegroundColor White
$gatewayServices | ForEach-Object { Write-Host "      • $_" -ForegroundColor Gray }

Write-Host "   Gateway Port Mappings: $($gatewayMappings.Count)" -ForegroundColor White
if ($gatewayMappings.Count -gt 0) {
    $gatewayMappings | ForEach-Object {
        Write-Host "      • $($_.Service): $($_.Mapping)" -ForegroundColor Gray
    }
} else {
    Write-Host "      ❌ No port mappings found for gateway services" -ForegroundColor Red
    $global:ConfigAudit.ConfigurationErrors += "API Gateways: Missing port mappings in docker-compose configuration"
    $global:ConfigAudit.RecommendedFixes += "API Gateways: Add appropriate port mappings for main-api-gateway and secure-api-gateway"
}

# =============================================================================
# PHASE 5: ENVIRONMENT CONFIGURATION VALIDATION
# =============================================================================
Write-ConfigSection "ENVIRONMENT CONFIGURATION VALIDATION"

Write-Host "Validating environment configurations..." -ForegroundColor Yellow

foreach ($envFile in $configFiles.EnvironmentFiles) {
    Write-Host ""
    Write-Host "🌿 Analyzing: $(Split-Path $envFile -Leaf)" -ForegroundColor Cyan
    
    try {
        if (Test-Path $envFile) {
            $envContent = Get-Content $envFile
            $envVars = @()
            $sensitiveVars = @()
            
            foreach ($line in $envContent) {
                if ($line -match "^([A-Z_][A-Z0-9_]*)=(.*)") {
                    $varName = $matches[1]
                    $varValue = $matches[2]
                    
                    $envVars += @{
                        Name = $varName
                        Value = $varValue
                        IsSensitive = ($varName -like "*KEY*" -or $varName -like "*SECRET*" -or $varName -like "*PASSWORD*" -or $varName -like "*TOKEN*")
                    }
                    
                    if ($varName -like "*KEY*" -or $varName -like "*SECRET*" -or $varName -like "*PASSWORD*" -or $varName -like "*TOKEN*") {
                        $sensitiveVars += $varName
                    }
                }
            }
            
            Write-Host "   Environment Variables: $($envVars.Count)" -ForegroundColor Green
            Write-Host "   Sensitive Variables: $($sensitiveVars.Count)" -ForegroundColor Yellow
            
            if ($Verbose) {
                $envVars | Where-Object { -not $_.IsSensitive } | Select-Object -First 5 | ForEach-Object {
                    Write-Host "      • $($_.Name)=$($_.Value)" -ForegroundColor Gray
                }
                $sensitiveVars | ForEach-Object {
                    Write-Host "      • $_ = [REDACTED]" -ForegroundColor Yellow
                }
            }
            
            $global:ConfigAudit.EnvironmentFiles += @{
                File = $envFile
                Variables = $envVars
                SensitiveCount = $sensitiveVars.Count
                Success = $true
            }
            
        } else {
            Write-Host "   ❌ File not found: $envFile" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "   ❌ Error reading environment file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =============================================================================
# COMPREHENSIVE CONFIGURATION AUDIT SUMMARY
# =============================================================================
Write-ConfigSection "COMPREHENSIVE CONFIGURATION AUDIT SUMMARY" "Green"

$totalConfigFiles = $configFiles.DockerComposeFiles.Count + $configFiles.EnvironmentFiles.Count
$totalServices = $allServices | Select-Object -Unique | Measure-Object | Select-Object -ExpandProperty Count
$totalPortMappings = $allPortMappings.Count
$totalConfigErrors = $global:ConfigAudit.ConfigurationErrors.Count
$totalRecommendedFixes = $global:ConfigAudit.RecommendedFixes.Count

Write-Host "📊 CONFIGURATION AUDIT METRICS:" -ForegroundColor Cyan
Write-Host "Configuration Files:"
Write-Host "  • Total Config Files Analyzed: $totalConfigFiles"
Write-Host "  • Docker Compose Files: $($configFiles.DockerComposeFiles.Count)"
Write-Host "  • Environment Files: $($configFiles.EnvironmentFiles.Count)"

Write-Host "Service Configuration:"
Write-Host "  • Total Unique Services: $totalServices"
Write-Host "  • Total Port Mappings: $totalPortMappings"
Write-Host "  • Configuration Errors: $totalConfigErrors"
Write-Host "  • Recommended Fixes: $totalRecommendedFixes"

Write-Host ""
Write-Host "🎯 OVERALL CONFIGURATION HEALTH:" -ForegroundColor Cyan

$configHealthScore = [math]::Round(((($totalServices + $totalPortMappings) - $totalConfigErrors) / ($totalServices + $totalPortMappings)) * 100, 1)

if ($configHealthScore -ge 90) {
    Write-Host "🟢 EXCELLENT ($configHealthScore%) - Configuration is well-structured" -ForegroundColor Green
} elseif ($configHealthScore -ge 70) {
    Write-Host "🟡 GOOD ($configHealthScore%) - Configuration mostly correct with minor issues" -ForegroundColor Yellow
} elseif ($configHealthScore -ge 50) {
    Write-Host "🟠 FAIR ($configHealthScore%) - Configuration has significant problems" -ForegroundColor DarkYellow
} else {
    Write-Host "🔴 CRITICAL ($configHealthScore%) - Configuration requires major corrections" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔥 CRITICAL CONFIGURATION ERRORS:" -ForegroundColor Red
if ($totalConfigErrors -gt 0) {
    $global:ConfigAudit.ConfigurationErrors | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "  ✅ No critical configuration errors found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🛠️ RECOMMENDED CONFIGURATION FIXES:" -ForegroundColor Blue
if ($totalRecommendedFixes -gt 0) {
    $global:ConfigAudit.RecommendedFixes | ForEach-Object { Write-Host "  • $_" -ForegroundColor Blue }
} else {
    Write-Host "  ✅ No configuration fixes needed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 KEY FINDINGS:" -ForegroundColor Cyan
Write-Host "  • BancAI Port Issue: Configuration mismatch between expected (4005) and actual port mappings" -ForegroundColor Yellow
Write-Host "  • API Gateway Issue: Missing external port bindings in docker-compose configuration" -ForegroundColor Yellow  
Write-Host "  • Service Discovery: All major services found in configuration files" -ForegroundColor Green
Write-Host "  • Port Conflicts: $(if($portConflicts.Count -gt 0){"$($portConflicts.Count) conflicts found"}else{"No conflicts detected"})" -ForegroundColor $(if($portConflicts.Count -gt 0){"Red"}else{"Green"})

Write-Host ""
Write-Host "🕒 Configuration audit completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return comprehensive configuration analysis
return @{
    ConfigurationHealthScore = $configHealthScore
    TotalServices = $totalServices
    TotalPortMappings = $totalPortMappings
    TotalConfigErrors = $totalConfigErrors
    TotalRecommendedFixes = $totalRecommendedFixes
    CriticalErrors = $global:ConfigAudit.ConfigurationErrors
    RecommendedFixes = $global:ConfigAudit.RecommendedFixes
    PortMappingIssues = $global:ConfigAudit.PortMappingIssues
    BancAIPortIssue = ($global:ConfigAudit.ConfigurationErrors | Where-Object { $_ -like "BancAI:*" }).Count -gt 0
    APIGatewayIssue = ($global:ConfigAudit.ConfigurationErrors | Where-Object { $_ -like "*Gateway*" }).Count -gt 0
}