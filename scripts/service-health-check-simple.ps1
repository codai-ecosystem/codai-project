#!/usr/bin/env pwsh

# CODAI Service Health Check and Stabilization Script
# Implementation of Quick Win #1: Service Stabilization

Write-Host "CODAI Service Health Check & Stabilization" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$startTime = Get-Date
$workspaceRoot = "E:\GitHub\codai-project"
$results = @()
$criticalServices = @(
    "admin", "codai", "hub", "memorai", "bancai", 
    "controlai-dashboard", "gateway", "ajutai", "conversai"
)

# Function to check service health
function Test-ServiceHealth {
    param(
        [string]$serviceName,
        [string]$servicePath
    )
    
    $serviceResult = @{
        Name = $serviceName
        Path = $servicePath
        HasPackageJson = $false
        HasBuildScript = $false
        HasDevScript = $false
        HasStartScript = $false
        DependenciesStatus = "Unknown"
        BuildStatus = "Not Tested"
        Priority = if ($criticalServices -contains $serviceName) { "Critical" } else { "Standard" }
        Issues = @()
        Recommendations = @()
    }
    
    try {
        # Check package.json
        $packageJsonPath = Join-Path $servicePath "package.json"
        if (Test-Path $packageJsonPath) {
            $serviceResult.HasPackageJson = $true
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            
            # Check scripts
            if ($packageJson.scripts) {
                $serviceResult.HasBuildScript = [bool]$packageJson.scripts.build
                $serviceResult.HasDevScript = [bool]$packageJson.scripts.dev
                $serviceResult.HasStartScript = [bool]$packageJson.scripts.start
            }
            
            # Check for common issues
            if (-not $serviceResult.HasDevScript) {
                $serviceResult.Issues += "Missing dev script"
                $serviceResult.Recommendations += "Add 'dev' script to package.json"
            }
            
            if (-not $serviceResult.HasBuildScript) {
                $serviceResult.Issues += "Missing build script"
                $serviceResult.Recommendations += "Add 'build' script to package.json"
            }
        } else {
            $serviceResult.Issues += "Missing package.json"
            $serviceResult.Recommendations += "Create package.json with proper scripts"
        }
        
        # Check for node_modules
        $nodeModulesPath = Join-Path $servicePath "node_modules"
        if (Test-Path $nodeModulesPath) {
            $serviceResult.DependenciesStatus = "Installed"
        } else {
            $serviceResult.DependenciesStatus = "Missing"
            $serviceResult.Issues += "Dependencies not installed"
            $serviceResult.Recommendations += "Run 'pnpm install' in service directory"
        }
        
    } catch {
        $serviceResult.Issues += "Error during health check: $($_.Exception.Message)"
    }
    
    return $serviceResult
}

Write-Host "Checking service health..." -ForegroundColor Yellow

# Get all app directories
$appsPath = Join-Path $workspaceRoot "apps"
$appDirs = Get-ChildItem -Path $appsPath -Directory | Where-Object { $_.Name -ne "_config" }

$totalServices = $appDirs.Count
$currentService = 0

foreach ($appDir in $appDirs) {
    $currentService++
    $progress = [math]::Round(($currentService / $totalServices) * 100, 1)
    Write-Progress -Activity "Health Check" -Status "Checking $($appDir.Name)" -PercentComplete $progress
    
    $result = Test-ServiceHealth -serviceName $appDir.Name -servicePath $appDir.FullName
    $results += $result
}

Write-Progress -Activity "Health Check" -Completed

# Analyze results
$criticalIssues = $results | Where-Object { $_.Priority -eq "Critical" -and $_.Issues.Count -gt 0 }
$healthyServices = $results | Where-Object { $_.Issues.Count -eq 0 }
$issueServices = $results | Where-Object { $_.Issues.Count -gt 0 }

Write-Host ""
Write-Host "Health Check Summary" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "Total Services: $totalServices" -ForegroundColor White
Write-Host "Healthy Services: $($healthyServices.Count) ($([math]::Round($healthyServices.Count / $totalServices * 100, 1))%)" -ForegroundColor Green
Write-Host "Services with Issues: $($issueServices.Count) ($([math]::Round($issueServices.Count / $totalServices * 100, 1))%)" -ForegroundColor Yellow
Write-Host "Critical Issues: $($criticalIssues.Count)" -ForegroundColor Red

if ($criticalIssues.Count -gt 0) {
    Write-Host ""
    Write-Host "Critical Services Needing Attention" -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    foreach ($service in $criticalIssues) {
        Write-Host "CRITICAL: $($service.Name)" -ForegroundColor Red
        foreach ($issue in $service.Issues) {
            Write-Host "   - $issue" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Healthy Services" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
foreach ($service in $healthyServices) {
    $status = if ($service.Priority -eq "Critical") { "CRITICAL-OK" } else { "OK" }
    Write-Host "$status $($service.Name)" -ForegroundColor Green
}

if ($issueServices.Count -gt 0) {
    Write-Host ""
    Write-Host "Services with Issues" -ForegroundColor Yellow
    Write-Host "====================" -ForegroundColor Yellow
    foreach ($service in $issueServices | Where-Object { $_.Priority -ne "Critical" }) {
        Write-Host "WARNING: $($service.Name)" -ForegroundColor Yellow
        foreach ($issue in $service.Issues) {
            Write-Host "   - $issue" -ForegroundColor Gray
        }
    }
}

# Generate detailed results for JSON export
$detailedResults = @{
    Timestamp = $startTime.ToString("yyyy-MM-dd HH:mm:ss")
    TotalServices = $totalServices
    HealthyServices = $healthyServices.Count
    IssueServices = $issueServices.Count
    CriticalIssues = $criticalIssues.Count
    HealthPercentage = [math]::Round($healthyServices.Count / $totalServices * 100, 1)
    Services = $results
}

$reportPath = Join-Path $workspaceRoot "SERVICE_HEALTH_REPORT.json"
$detailedResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "Detailed report saved to: SERVICE_HEALTH_REPORT.json" -ForegroundColor Cyan

$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "Health check completed in $($duration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Green

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Fix critical service issues first" -ForegroundColor White
Write-Host "2. Install missing dependencies with 'pnpm install'" -ForegroundColor White
Write-Host "3. Add missing scripts to package.json files" -ForegroundColor White
Write-Host "4. Test service startup after fixes" -ForegroundColor White
