#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - SERVICE FAILURE ROOT CAUSE ANALYSIS
# =====================================================

param(
    [switch]$Verbose = $false,
    [switch]$ShowFullLogs = $false,
    [int]$LogLines = 20
)

Write-Host "🔍 CODAI ECOSYSTEM - SERVICE FAILURE ROOT CAUSE ANALYSIS" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Deep dive analysis of container logs, startup failures, and configuration issues" -ForegroundColor White
Write-Host ""

# Global root cause analysis results
$global:RootCauseAnalysis = @{
    ContainerLogAnalysis = @()
    PortBindingIssues = @()
    HealthCheckFailures = @()
    ConfigurationProblems = @()
    CriticalErrors = @()
    RecommendedActions = @()
}

function Write-AnalysisSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🔎 $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Gray
}

function Get-ContainerDetailedLogs {
    param(
        [string]$ContainerName,
        [int]$Lines = 50,
        [bool]$IncludeTimestamps = $true
    )
    
    try {
        $logParams = @("logs")
        if ($IncludeTimestamps) { $logParams += "--timestamps" }
        $logParams += @("--tail", $Lines.ToString(), $ContainerName)
        
        $logs = docker @logParams 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            return @{
                Container = $ContainerName
                Success = $true
                Logs = $logs
                LogLines = @($logs).Count
                ErrorPatterns = @()
                WarningPatterns = @()
            }
        } else {
            return @{
                Container = $ContainerName
                Success = $false
                Logs = $logs
                LogLines = 0
                ErrorPatterns = @("Failed to get logs")
                WarningPatterns = @()
            }
        }
        
    } catch {
        return @{
            Container = $ContainerName
            Success = $false
            Logs = @("Exception getting logs: $($_.Exception.Message)")
            LogLines = 0
            ErrorPatterns = @("Log retrieval exception")
            WarningPatterns = @()
        }
    }
}

function Analyze-ContainerLogs {
    param([array]$LogLines, [string]$ContainerName)
    
    $errorPatterns = @(
        "ERROR", "FATAL", "EXCEPTION", "FAILED", "CRASH", "PANIC", "ABORT",
        "Connection refused", "Permission denied", "No such file", "Cannot bind",
        "Port already in use", "Address already in use", "Network unreachable",
        "TimeoutException", "ConnectionException", "AuthenticationException",
        "npm ERR!", "yarn ERR!", "python.*Error", "java.*Exception"
    )
    
    $warningPatterns = @(
        "WARN", "WARNING", "DEPRECATED", "RETRY", "TIMEOUT", "SLOW",
        "Memory usage", "CPU usage", "Disk space", "Performance"
    )
    
    $errors = @()
    $warnings = @()
    
    foreach ($line in $LogLines) {
        foreach ($pattern in $errorPatterns) {
            if ($line -match $pattern) {
                $errors += $line.Trim()
                break
            }
        }
        
        foreach ($pattern in $warningPatterns) {
            if ($line -match $pattern) {
                $warnings += $line.Trim()
                break
            }
        }
    }
    
    return @{
        Container = $ContainerName
        ErrorPatterns = $errors | Select-Object -Unique
        WarningPatterns = $warnings | Select-Object -Unique
        TotalErrors = $errors.Count
        TotalWarnings = $warnings.Count
    }
}

function Get-ContainerConfiguration {
    param([string]$ContainerName)
    
    try {
        $config = docker inspect $ContainerName --format "{{json .}}" 2>$null | ConvertFrom-Json
        
        if ($LASTEXITCODE -eq 0) {
            return @{
                Container = $ContainerName
                Success = $true
                Image = $config.Config.Image
                Environment = $config.Config.Env
                Ports = $config.Config.ExposedPorts
                Mounts = $config.Mounts
                NetworkMode = $config.HostConfig.NetworkMode
                PortBindings = $config.HostConfig.PortBindings
                RestartPolicy = $config.HostConfig.RestartPolicy
                HealthCheck = $config.Config.Healthcheck
                Status = $config.State.Status
                StartedAt = $config.State.StartedAt
                ExitCode = $config.State.ExitCode
                Error = $config.State.Error
            }
        } else {
            return @{
                Container = $ContainerName
                Success = $false
                Error = "Failed to inspect container configuration"
            }
        }
        
    } catch {
        return @{
            Container = $ContainerName
            Success = $false
            Error = "Exception inspecting container: $($_.Exception.Message)"
        }
    }
}

function Diagnose-PortBindingIssue {
    param([object]$ContainerConfig)
    
    $diagnosis = @{
        Container = $ContainerConfig.Container
        HasExposedPorts = ($ContainerConfig.Ports -ne $null)
        HasPortBindings = ($ContainerConfig.PortBindings -ne $null)
        Issues = @()
        Recommendations = @()
    }
    
    if ($ContainerConfig.Ports -and !$ContainerConfig.PortBindings) {
        $diagnosis.Issues += "Container exposes ports but has no host port bindings"
        $diagnosis.Recommendations += "Check docker-compose port mapping configuration"
    }
    
    if (!$ContainerConfig.Ports -and !$ContainerConfig.PortBindings) {
        $diagnosis.Issues += "Container has no exposed ports and no port bindings"
        $diagnosis.Recommendations += "Add EXPOSE directive in Dockerfile and port mapping in docker-compose"
    }
    
    if ($ContainerConfig.NetworkMode -eq "none") {
        $diagnosis.Issues += "Container is using 'none' network mode"
        $diagnosis.Recommendations += "Configure proper Docker network connectivity"
    }
    
    return $diagnosis
}

# =============================================================================
# PHASE 1: IDENTIFY PROBLEMATIC CONTAINERS
# =============================================================================
Write-AnalysisSection "IDENTIFYING PROBLEMATIC CONTAINERS"

# From our previous diagnostics, identify containers with issues
$problematicContainers = @(
    @{ Name = "codai-bancai-frontend"; Issue = "No port bindings despite healthy status" },
    @{ Name = "codai-main-api-gateway"; Issue = "No port bindings despite healthy status" }, 
    @{ Name = "codai-secure-api-gateway"; Issue = "Unhealthy status" },
    @{ Name = "codai-memorai-graphql-api"; Issue = "HTTP 400 responses" },
    @{ Name = "memorai-prometheus"; Issue = "Unhealthy status" },
    @{ Name = "codai-controlai-frontend"; Issue = "Unhealthy status" }
)

# Also check containers that were reported as missing
$missingContainers = @("codai-nginx-load-balancer", "codai-kibana", "codai-jaeger")

Write-Host "Analyzing $($problematicContainers.Count) problematic containers and $($missingContainers.Count) potentially missing containers..." -ForegroundColor Yellow

# =============================================================================  
# PHASE 2: DETAILED LOG ANALYSIS FOR PROBLEMATIC CONTAINERS
# =============================================================================
Write-AnalysisSection "DETAILED LOG ANALYSIS FOR PROBLEMATIC CONTAINERS"

foreach ($container in $problematicContainers) {
    Write-Host ""
    Write-Host "🔍 ANALYZING: $($container.Name)" -ForegroundColor Cyan
    Write-Host "   Issue: $($container.Issue)" -ForegroundColor Yellow
    
    # Get detailed logs
    $logData = Get-ContainerDetailedLogs -ContainerName $container.Name -Lines $LogLines -IncludeTimestamps $true
    $global:RootCauseAnalysis.ContainerLogAnalysis += $logData
    
    if ($logData.Success) {
        Write-Host "   📋 Retrieved $($logData.LogLines) log lines" -ForegroundColor Gray
        
        # Analyze logs for error patterns
        $logAnalysis = Analyze-ContainerLogs -LogLines $logData.Logs -ContainerName $container.Name
        
        Write-Host "   🚨 Errors Found: $($logAnalysis.TotalErrors)" -ForegroundColor $(if($logAnalysis.TotalErrors -gt 0){"Red"}else{"Green"})
        Write-Host "   ⚠️  Warnings Found: $($logAnalysis.TotalWarnings)" -ForegroundColor $(if($logAnalysis.TotalWarnings -gt 0){"Yellow"}else{"Green"})
        
        # Show critical errors
        if ($logAnalysis.ErrorPatterns.Count -gt 0) {
            Write-Host "   🔴 CRITICAL ERRORS:" -ForegroundColor Red
            $logAnalysis.ErrorPatterns | Select-Object -First 5 | ForEach-Object {
                Write-Host "      • $_" -ForegroundColor Red
                $global:RootCauseAnalysis.CriticalErrors += "$($container.Name): $_"
            }
        }
        
        # Show recent log entries if verbose
        if ($Verbose -or $ShowFullLogs) {
            Write-Host "   📋 Recent log entries:" -ForegroundColor Gray
            $logData.Logs | Select-Object -Last 10 | ForEach-Object {
                Write-Host "      $_" -ForegroundColor Gray
            }
        }
        
    } else {
        Write-Host "   ❌ Failed to get logs: $($logData.Logs -join "; ")" -ForegroundColor Red
        $global:RootCauseAnalysis.CriticalErrors += "$($container.Name): Failed to retrieve logs"
    }
    
    # Get container configuration for port binding analysis
    $containerConfig = Get-ContainerConfiguration -ContainerName $container.Name
    if ($containerConfig.Success) {
        $portDiagnosis = Diagnose-PortBindingIssue -ContainerConfig $containerConfig
        $global:RootCauseAnalysis.PortBindingIssues += $portDiagnosis
        
        if ($portDiagnosis.Issues.Count -gt 0) {
            Write-Host "   🔧 PORT BINDING ISSUES:" -ForegroundColor DarkYellow
            $portDiagnosis.Issues | ForEach-Object {
                Write-Host "      • $_" -ForegroundColor DarkYellow
            }
            Write-Host "   💡 RECOMMENDATIONS:" -ForegroundColor Blue
            $portDiagnosis.Recommendations | ForEach-Object {
                Write-Host "      • $_" -ForegroundColor Blue
                $global:RootCauseAnalysis.RecommendedActions += "$($container.Name): $_"
            }
        }
    }
}

# =============================================================================
# PHASE 3: MISSING CONTAINER INVESTIGATION  
# =============================================================================
Write-AnalysisSection "MISSING CONTAINER INVESTIGATION"

Write-Host "Investigating containers that were reported as missing..." -ForegroundColor Yellow

foreach ($containerName in $missingContainers) {
    Write-Host ""
    Write-Host "🔍 SEARCHING FOR: $containerName" -ForegroundColor Cyan
    
    try {
        # Check if container exists in any state
        $containerSearch = docker ps -a --filter "name=$containerName" --format "{{.Names}}|{{.Status}}|{{.Image}}|{{.CreatedAt}}" 2>$null
        
        if ($LASTEXITCODE -eq 0 -and $containerSearch) {
            $parts = $containerSearch -split '\|'
            Write-Host "   ✅ Container found!" -ForegroundColor Green
            Write-Host "      Name: $($parts[0])" -ForegroundColor White
            Write-Host "      Status: $($parts[1])" -ForegroundColor White
            Write-Host "      Image: $($parts[2])" -ForegroundColor Gray
            Write-Host "      Created: $($parts[3])" -ForegroundColor Gray
            
            # If it exists, this was a search pattern issue in our infrastructure diagnostics
            $global:RootCauseAnalysis.ConfigurationProblems += @{
                Container = $containerName
                Issue = "Container exists but was not found by infrastructure diagnostics"
                Recommendation = "Review container name search patterns in diagnostic scripts"
            }
            
            # Get logs if container is not running
            if ($parts[1] -notmatch "Up") {
                Write-Host "   📋 Getting failure logs (last $LogLines lines):" -ForegroundColor Yellow
                $failureLogs = Get-ContainerDetailedLogs -ContainerName $containerName -Lines $LogLines
                
                if ($failureLogs.Success -and $failureLogs.LogLines -gt 0) {
                    $failureAnalysis = Analyze-ContainerLogs -LogLines $failureLogs.Logs -ContainerName $containerName
                    
                    if ($failureAnalysis.ErrorPatterns.Count -gt 0) {
                        Write-Host "   🚨 Container failure reasons:" -ForegroundColor Red
                        $failureAnalysis.ErrorPatterns | Select-Object -First 3 | ForEach-Object {
                            Write-Host "      • $_" -ForegroundColor Red
                        }
                    }
                }
            }
            
        } else {
            Write-Host "   ❌ Container truly does not exist" -ForegroundColor Red
            $global:RootCauseAnalysis.ConfigurationProblems += @{
                Container = $containerName
                Issue = "Container was never created or has been completely removed"
                Recommendation = "Check docker-compose configuration and service definitions"
            }
        }
        
    } catch {
        Write-Host "   ❌ Error searching for container: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =============================================================================
# PHASE 4: SPECIFIC ISSUE INVESTIGATION
# =============================================================================
Write-AnalysisSection "SPECIFIC ISSUE INVESTIGATION"

# BancAI Frontend Port 4005 Issue
Write-Host "🔍 BancAI Frontend (Port 4005) Deep Dive:" -ForegroundColor Cyan

try {
    $bancaiConfig = Get-ContainerConfiguration -ContainerName "codai-bancai-frontend"
    if ($bancaiConfig.Success) {
        Write-Host "   Container Status: $($bancaiConfig.Status)" -ForegroundColor White
        Write-Host "   Image: $($bancaiConfig.Image)" -ForegroundColor Gray
        Write-Host "   Network Mode: $($bancaiConfig.NetworkMode)" -ForegroundColor Gray
        
        if ($bancaiConfig.Ports) {
            Write-Host "   Exposed Ports:" -ForegroundColor Yellow
            $bancaiConfig.Ports.PSObject.Properties | ForEach-Object {
                Write-Host "      • $($_.Name)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ No exposed ports in container configuration" -ForegroundColor Red
            $global:RootCauseAnalysis.CriticalErrors += "BancAI Frontend: Container has no exposed ports configured"
        }
        
        if ($bancaiConfig.PortBindings) {
            Write-Host "   Port Bindings:" -ForegroundColor Yellow
            $bancaiConfig.PortBindings.PSObject.Properties | ForEach-Object {
                Write-Host "      • $($_.Name) -> $($_.Value)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ No host port bindings configured" -ForegroundColor Red
            $global:RootCauseAnalysis.CriticalErrors += "BancAI Frontend: Container has no host port bindings"
        }
    }
} catch {
    Write-Host "   ❌ Failed to analyze BancAI configuration: $($_.Exception.Message)" -ForegroundColor Red
}

# GraphQL API HTTP 400 Issue
Write-Host ""
Write-Host "🔍 GraphQL API (HTTP 400) Deep Dive:" -ForegroundColor Cyan

try {
    # Test GraphQL with proper POST request
    $graphqlBody = '{"query": "{ health { status version uptime } }"}'
    $graphqlResponse = Invoke-RestMethod -Uri "http://localhost:4500/graphql" -Method POST -Body $graphqlBody -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    
    Write-Host "   ✅ GraphQL endpoint working with proper POST request" -ForegroundColor Green
    Write-Host "   Response: $($graphqlResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ GraphQL endpoint issue confirmed: $($_.Exception.Message)" -ForegroundColor Red
    $global:RootCauseAnalysis.CriticalErrors += "GraphQL API: Endpoint returning errors - $($_.Exception.Message)"
}

# =============================================================================
# ROOT CAUSE ANALYSIS SUMMARY
# =============================================================================
Write-AnalysisSection "ROOT CAUSE ANALYSIS SUMMARY" "Green"

$totalCriticalErrors = $global:RootCauseAnalysis.CriticalErrors.Count
$totalPortIssues = $global:RootCauseAnalysis.PortBindingIssues.Count
$totalConfigProblems = $global:RootCauseAnalysis.ConfigurationProblems.Count
$totalRecommendations = $global:RootCauseAnalysis.RecommendedActions.Count

Write-Host "📊 ROOT CAUSE ANALYSIS METRICS:" -ForegroundColor Cyan
Write-Host "Critical Errors Identified: $totalCriticalErrors"
Write-Host "Port Binding Issues: $totalPortIssues"  
Write-Host "Configuration Problems: $totalConfigProblems"
Write-Host "Recommended Actions: $totalRecommendations"

Write-Host ""
Write-Host "🔥 TOP CRITICAL ISSUES:" -ForegroundColor Red
if ($totalCriticalErrors -gt 0) {
    $global:RootCauseAnalysis.CriticalErrors | Select-Object -First 5 | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor Red
    }
} else {
    Write-Host "  ✅ No critical errors found in log analysis" -ForegroundColor Green
}

Write-Host ""
Write-Host "🛠️ IMMEDIATE ACTIONS REQUIRED:" -ForegroundColor Blue
if ($totalRecommendations -gt 0) {
    $global:RootCauseAnalysis.RecommendedActions | Select-Object -First 5 | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor Blue
    }
} else {
    Write-Host "  ✅ No immediate actions required" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 ROOT CAUSE ANALYSIS CONCLUSIONS:" -ForegroundColor Cyan

# Generate conclusions based on findings
$conclusions = @()

if ($global:RootCauseAnalysis.PortBindingIssues.Count -gt 0) {
    $conclusions += "PRIMARY ISSUE: Docker port binding misconfiguration affecting multiple services"
}

if ($global:RootCauseAnalysis.ConfigurationProblems | Where-Object { $_.Issue -like "*exists but was not found*" }) {
    $conclusions += "DIAGNOSTIC ISSUE: Container search patterns in infrastructure diagnostics need correction"  
}

if ($global:RootCauseAnalysis.CriticalErrors | Where-Object { $_ -like "*exposed ports*" }) {
    $conclusions += "DOCKER CONFIGURATION: Services missing proper port exposure in container definitions"
}

if ($conclusions.Count -gt 0) {
    $conclusions | ForEach-Object { Write-Host "  • $_" -ForegroundColor Yellow }
} else {
    Write-Host "  • Analysis incomplete - requires configuration file examination" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🕒 Root cause analysis completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return comprehensive root cause data
return @{
    TotalCriticalErrors = $totalCriticalErrors
    TotalPortIssues = $totalPortIssues  
    TotalConfigurationProblems = $totalConfigProblems
    TotalRecommendations = $totalRecommendations
    CriticalErrors = $global:RootCauseAnalysis.CriticalErrors
    RecommendedActions = $global:RootCauseAnalysis.RecommendedActions
    PortBindingIssues = $global:RootCauseAnalysis.PortBindingIssues
    ConfigurationProblems = $global:RootCauseAnalysis.ConfigurationProblems
}