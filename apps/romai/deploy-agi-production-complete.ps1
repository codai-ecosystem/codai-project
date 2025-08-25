#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RomAI AGI System - Complete Production Deployment Execution
    
.DESCRIPTION
    Executes complete production deployment of RomAI AGI System
    - Pre-deployment validation and preparation
    - Production environment setup
    - Service deployment and initialization
    - Post-deployment validation
    - Health monitoring setup
    
.PARAMETER Clean
    Clean existing deployment before starting
    
.PARAMETER SkipValidation
    Skip pre-deployment validation (not recommended)
    
.PARAMETER MonitorOnly
    Only set up monitoring, skip main deployment
    
.EXAMPLE
    .\deploy-agi-production-complete.ps1
    .\deploy-agi-production-complete.ps1 -Clean
    .\deploy-agi-production-complete.ps1 -MonitorOnly
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$Clean = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipValidation = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$MonitorOnly = $false
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Global variables
$DeploymentResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    status = "UNKNOWN"
    steps_completed = @()
    errors = @()
    services_deployed = @()
    endpoints = @{}
}

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Highlight = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
    
    # Also log to deployment log
    $logEntry = "$(Get-Date -Format 'HH:mm:ss') [$Color] $Message"
    Add-Content -Path "deployment.log" -Value $logEntry -Encoding UTF8
}

function Step-PreDeploymentValidation {
    Write-ColorOutput "🔍 Step 1: Pre-deployment validation..." -Color Info
    
    try {
        # Check Docker availability
        $dockerVersion = docker --version 2>$null
        if (-not $dockerVersion) {
            throw "Docker is not available or not running"
        }
        Write-ColorOutput "✅ Docker: $dockerVersion" -Color Success
        
        # Check Docker Compose
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            throw "Docker Compose is not available"
        }
        Write-ColorOutput "✅ Docker Compose: $composeVersion" -Color Success
        
        # Check port availability
        $requiredPorts = @(5432, 6379, 6101, 4180, 8080, 9090, 443, 80)
        foreach ($port in $requiredPorts) {
            $portInUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($portInUse -and -not $Clean) {
                Write-ColorOutput "⚠️ Port $port is in use (will attempt to handle)" -Color Warning
            }
        }
        
        # Check required files
        $requiredFiles = @(
            "docker-compose.production.agi.yml",
            "Dockerfile.agi.production",
            ".env.agi.production",
            "requirements.production.txt"
        )
        
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path $file)) {
                throw "Required file missing: $file"
            }
        }
        Write-ColorOutput "✅ All required configuration files present" -Color Success
        
        $DeploymentResults.steps_completed += "pre_deployment_validation"
        Write-ColorOutput "✅ Pre-deployment validation completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "Pre-deployment validation failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-EnvironmentPreparation {
    Write-ColorOutput "🛠️ Step 2: Environment preparation..." -Color Info
    
    try {
        # Clean previous deployment if requested
        if ($Clean) {
            Write-ColorOutput "🧹 Cleaning previous deployment..." -Color Warning
            try {
                docker-compose -f docker-compose.production.agi.yml down --volumes --remove-orphans 2>$null
                Write-ColorOutput "✅ Previous deployment cleaned" -Color Success
            } catch {
                Write-ColorOutput "⚠️ Clean operation had issues (continuing)" -Color Warning
            }
        }
        
        # Create necessary directories
        $directories = @("logs", "data", "backups", "monitoring/data")
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-ColorOutput "✅ Created directory: $dir" -Color Success
            }
        }
        
        # Set proper permissions (if on Linux/macOS)
        if ($env:OS -ne "Windows_NT") {
            chmod +x deploy-agi-production.ps1 2>$null
            chmod +x validate-agi-production-readiness.ps1 2>$null
        }
        
        # Load environment variables
        if (Test-Path ".env.agi.production") {
            Write-ColorOutput "✅ Production environment configuration loaded" -Color Success
        }
        
        $DeploymentResults.steps_completed += "environment_preparation"
        Write-ColorOutput "✅ Environment preparation completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "Environment preparation failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-InfrastructureDeployment {
    Write-ColorOutput "🏗️ Step 3: Infrastructure deployment..." -Color Info
    
    try {
        # Deploy infrastructure services first (databases, cache, etc.)
        Write-ColorOutput "📦 Deploying infrastructure services..." -Color Info
        docker-compose -f docker-compose.production.agi.yml up -d postgres redis --remove-orphans
        
        # Wait for infrastructure to be ready
        Write-ColorOutput "⏳ Waiting for infrastructure services..." -Color Info
        Start-Sleep -Seconds 30
        
        # Check infrastructure health
        $infraHealthy = $true
        
        # Check PostgreSQL
        try {
            $pgResult = docker exec romai-postgres-production pg_isready -U romai_user 2>$null
            if ($pgResult -match "accepting connections") {
                Write-ColorOutput "✅ PostgreSQL: Ready" -Color Success
                $DeploymentResults.services_deployed += "PostgreSQL"
            } else {
                throw "PostgreSQL not ready"
            }
        } catch {
            Write-ColorOutput "❌ PostgreSQL: Not ready" -Color Error
            $infraHealthy = $false
        }
        
        # Check Redis
        try {
            $redisResult = docker exec romai-redis-production redis-cli ping 2>$null
            if ($redisResult -match "PONG") {
                Write-ColorOutput "✅ Redis: Ready" -Color Success
                $DeploymentResults.services_deployed += "Redis"
            } else {
                throw "Redis not ready"
            }
        } catch {
            Write-ColorOutput "❌ Redis: Not ready" -Color Error
            $infraHealthy = $false
        }
        
        if (-not $infraHealthy) {
            throw "Infrastructure services are not healthy"
        }
        
        $DeploymentResults.steps_completed += "infrastructure_deployment"
        Write-ColorOutput "✅ Infrastructure deployment completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "Infrastructure deployment failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-AGISystemDeployment {
    Write-ColorOutput "🧠 Step 4: RomAI AGI System deployment..." -Color Info
    
    try {
        # Build and deploy the AGI system
        Write-ColorOutput "🔨 Building RomAI AGI System..." -Color Info
        docker-compose -f docker-compose.production.agi.yml build romai-agi-system
        
        Write-ColorOutput "🚀 Deploying RomAI AGI System..." -Color Info
        docker-compose -f docker-compose.production.agi.yml up -d romai-agi-system
        
        # Wait for AGI system initialization
        Write-ColorOutput "⏳ Waiting for AGI system initialization (60 seconds)..." -Color Info
        Start-Sleep -Seconds 60
        
        # Test AGI system health
        $maxRetries = 5
        $retryCount = 0
        $agiHealthy = $false
        
        while ($retryCount -lt $maxRetries -and -not $agiHealthy) {
            try {
                Write-ColorOutput "🔍 Testing AGI system health (attempt $($retryCount + 1)/$maxRetries)..." -Color Info
                $healthResponse = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 30
                
                if ($healthResponse -and $healthResponse.status -eq "healthy") {
                    Write-ColorOutput "✅ RomAI AGI System: Healthy" -Color Success
                    $agiHealthy = $true
                    $DeploymentResults.services_deployed += "RomAI_AGI_System"
                    $DeploymentResults.endpoints["agi_system"] = "http://localhost:6101"
                } else {
                    throw "Health check returned unhealthy status"
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-ColorOutput "⏳ AGI system not ready yet, retrying in 30 seconds..." -Color Warning
                    Start-Sleep -Seconds 30
                } else {
                    throw "AGI system failed to become healthy after $maxRetries attempts"
                }
            }
        }
        
        if (-not $agiHealthy) {
            throw "RomAI AGI System deployment failed health checks"
        }
        
        # Test all 5 reasoning engines
        Write-ColorOutput "🧠 Testing all 5 reasoning engines..." -Color Info
        $engines = @(
            @{ Name = "Mathematical"; Endpoint = "/solve_math"; Data = @{ problem = "2+2" } },
            @{ Name = "Logical"; Endpoint = "/reason"; Data = @{ premise = "Test reasoning" } },
            @{ Name = "Romanian Cultural"; Endpoint = "/analyze_culture"; Data = @{ context = "Test culture" } },
            @{ Name = "Creative"; Endpoint = "/create"; Data = @{ prompt = "Test creativity"; creativity_type = "problem_solving" } },
            @{ Name = "Cross-Modal"; Endpoint = "/process_query"; Data = @{ query = "Test integration" } }
        )
        
        $workingEngines = 0
        foreach ($engine in $engines) {
            try {
                $body = $engine.Data | ConvertTo-Json
                $response = Invoke-RestMethod -Uri "http://localhost:6101$($engine.Endpoint)" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 45
                if ($response.success) {
                    Write-ColorOutput "✅ $($engine.Name) Engine: Working" -Color Success
                    $workingEngines++
                }
            } catch {
                Write-ColorOutput "❌ $($engine.Name) Engine: Failed" -Color Error
            }
        }
        
        Write-ColorOutput "📊 Working Engines: $workingEngines/5" -Color $(if ($workingEngines -eq 5) { "Success" } else { "Warning" })
        
        if ($workingEngines -lt 3) {
            throw "Insufficient engines working ($workingEngines/5)"
        }
        
        $DeploymentResults.steps_completed += "agi_system_deployment"
        Write-ColorOutput "✅ RomAI AGI System deployment completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "AGI system deployment failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-MonitoringDeployment {
    Write-ColorOutput "📊 Step 5: Monitoring and observability deployment..." -Color Info
    
    try {
        # Deploy monitoring stack
        Write-ColorOutput "📈 Deploying monitoring services..." -Color Info
        docker-compose -f docker-compose.production.agi.yml up -d prometheus grafana health-dashboard
        
        # Wait for monitoring services
        Write-ColorOutput "⏳ Waiting for monitoring services..." -Color Info
        Start-Sleep -Seconds 30
        
        # Check monitoring services
        $monitoringServices = @(
            @{ Name = "Prometheus"; Port = 9090; Endpoint = "/-/healthy" },
            @{ Name = "Health Dashboard"; Port = 8080; Endpoint = "/health" }
        )
        
        foreach ($service in $monitoringServices) {
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:$($service.Port)$($service.Endpoint)" -Method Get -TimeoutSec 15
                Write-ColorOutput "✅ $($service.Name): Available" -Color Success
                $DeploymentResults.services_deployed += $service.Name
                $DeploymentResults.endpoints[$service.Name.ToLower() -replace " ", "_"] = "http://localhost:$($service.Port)"
            } catch {
                Write-ColorOutput "⚠️ $($service.Name): Not accessible (may start later)" -Color Warning
            }
        }
        
        $DeploymentResults.steps_completed += "monitoring_deployment"
        Write-ColorOutput "✅ Monitoring deployment completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "Monitoring deployment failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-LoadBalancerDeployment {
    Write-ColorOutput "⚖️ Step 6: Load balancer and reverse proxy deployment..." -Color Info
    
    try {
        # Deploy NGINX load balancer
        Write-ColorOutput "🌐 Deploying NGINX load balancer..." -Color Info
        docker-compose -f docker-compose.production.agi.yml up -d nginx
        
        # Wait for NGINX
        Start-Sleep -Seconds 15
        
        # Test load balancer
        try {
            $response = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -TimeoutSec 15
            Write-ColorOutput "✅ NGINX Load Balancer: Available" -Color Success
            $DeploymentResults.services_deployed += "NGINX_Load_Balancer"
            $DeploymentResults.endpoints["load_balancer"] = "http://localhost"
            $DeploymentResults.endpoints["ssl_endpoint"] = "https://localhost"
        } catch {
            Write-ColorOutput "⚠️ NGINX Load Balancer: Not accessible (may need manual configuration)" -Color Warning
        }
        
        $DeploymentResults.steps_completed += "load_balancer_deployment"
        Write-ColorOutput "✅ Load balancer deployment completed" -Color Success
        return $true
        
    } catch {
        $errorMsg = "Load balancer deployment failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Step-PostDeploymentValidation {
    Write-ColorOutput "✅ Step 7: Post-deployment validation..." -Color Info
    
    try {
        # Run comprehensive validation
        if (Test-Path "validate-agi-production-readiness.ps1") {
            Write-ColorOutput "🔍 Running production readiness validation..." -Color Info
            $validationResult = & .\validate-agi-production-readiness.ps1
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Production readiness validation: PASSED" -Color Success
            } else {
                Write-ColorOutput "⚠️ Production readiness validation: ISSUES DETECTED" -Color Warning
            }
        }
        
        # Test critical endpoints
        $criticalEndpoints = @(
            @{ Name = "AGI Health"; Url = "http://localhost:6101/health" },
            @{ Name = "Load Balancer"; Url = "http://localhost/health" }
        )
        
        $healthyEndpoints = 0
        foreach ($endpoint in $criticalEndpoints) {
            try {
                $response = Invoke-RestMethod -Uri $endpoint.Url -Method Get -TimeoutSec 10
                Write-ColorOutput "✅ $($endpoint.Name): Accessible" -Color Success
                $healthyEndpoints++
            } catch {
                Write-ColorOutput "❌ $($endpoint.Name): Not accessible" -Color Error
            }
        }
        
        $allHealthy = ($healthyEndpoints -eq $criticalEndpoints.Count)
        
        $DeploymentResults.steps_completed += "post_deployment_validation"
        Write-ColorOutput "✅ Post-deployment validation completed" -Color Success
        return $allHealthy
        
    } catch {
        $errorMsg = "Post-deployment validation failed: $($_.Exception.Message)"
        Write-ColorOutput "❌ $errorMsg" -Color Error
        $DeploymentResults.errors += $errorMsg
        return $false
    }
}

function Generate-DeploymentReport {
    # Determine final status
    $criticalStepsCompleted = @("infrastructure_deployment", "agi_system_deployment", "post_deployment_validation")
    $criticalStepsCount = ($DeploymentResults.steps_completed | Where-Object { $_ -in $criticalStepsCompleted }).Count
    
    if ($criticalStepsCount -eq $criticalStepsCompleted.Count -and $DeploymentResults.errors.Count -eq 0) {
        $DeploymentResults.status = "SUCCESS"
    } elseif ($criticalStepsCount -eq $criticalStepsCompleted.Count -and $DeploymentResults.errors.Count -le 2) {
        $DeploymentResults.status = "SUCCESS_WITH_WARNINGS"
    } else {
        $DeploymentResults.status = "FAILED"
    }
    
    # Save deployment report
    $reportPath = "deployment-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $DeploymentResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
    
    return $reportPath
}

function Show-DeploymentSummary {
    param([string]$ReportPath)
    
    Write-ColorOutput "" -Color Info
    Write-ColorOutput "🚀 ROMAI AGI PRODUCTION DEPLOYMENT SUMMARY" -Color Highlight
    Write-ColorOutput "==========================================" -Color Highlight
    Write-ColorOutput "" -Color Info
    
    Write-ColorOutput "📊 Deployment Status: $($DeploymentResults.status)" -Color $(
        switch ($DeploymentResults.status) {
            "SUCCESS" { "Success" }
            "SUCCESS_WITH_WARNINGS" { "Success" }
            default { "Error" }
        }
    )
    Write-ColorOutput "📅 Timestamp: $($DeploymentResults.timestamp)" -Color Info
    Write-ColorOutput "🏗️ Steps Completed: $($DeploymentResults.steps_completed.Count)" -Color Success
    Write-ColorOutput "⚠️ Errors Encountered: $($DeploymentResults.errors.Count)" -Color $(if ($DeploymentResults.errors.Count -eq 0) { "Success" } else { "Warning" })
    Write-ColorOutput "" -Color Info
    
    Write-ColorOutput "🌐 Deployed Services:" -Color Info
    foreach ($service in $DeploymentResults.services_deployed) {
        Write-ColorOutput "   ✅ $service" -Color Success
    }
    Write-ColorOutput "" -Color Info
    
    Write-ColorOutput "🔗 Available Endpoints:" -Color Info
    foreach ($endpoint in $DeploymentResults.endpoints.GetEnumerator()) {
        Write-ColorOutput "   🌐 $($endpoint.Key): $($endpoint.Value)" -Color Success
    }
    Write-ColorOutput "" -Color Info
    
    if ($DeploymentResults.errors.Count -gt 0) {
        Write-ColorOutput "⚠️ Errors:" -Color Warning
        foreach ($error in $DeploymentResults.errors) {
            Write-ColorOutput "   ❌ $error" -Color Error
        }
        Write-ColorOutput "" -Color Info
    }
    
    if ($DeploymentResults.status -eq "SUCCESS") {
        Write-ColorOutput "🎉 DEPLOYMENT SUCCESSFUL!" -Color Success
        Write-ColorOutput "RomAI AGI System is now running in production!" -Color Success
    } elseif ($DeploymentResults.status -eq "SUCCESS_WITH_WARNINGS") {
        Write-ColorOutput "🎯 DEPLOYMENT COMPLETED WITH WARNINGS" -Color Warning
        Write-ColorOutput "RomAI AGI System is running but may need attention." -Color Warning
    } else {
        Write-ColorOutput "❌ DEPLOYMENT FAILED" -Color Error
        Write-ColorOutput "Please review errors and retry deployment." -Color Error
    }
    
    Write-ColorOutput "" -Color Info
    Write-ColorOutput "📋 Detailed report: $ReportPath" -Color Info
    Write-ColorOutput "📋 Deployment log: deployment.log" -Color Info
}

# Main deployment flow
try {
    Write-ColorOutput "🚀 ROMAI AGI PRODUCTION DEPLOYMENT" -Color Highlight
    Write-ColorOutput "===================================" -Color Highlight
    Write-ColorOutput "Clean Mode: $($Clean.ToString())" -Color Info
    Write-ColorOutput "Skip Validation: $($SkipValidation.ToString())" -Color Info
    Write-ColorOutput "Monitor Only: $($MonitorOnly.ToString())" -Color Info
    Write-ColorOutput "" -Color Info
    
    # Initialize deployment log
    "ROMAI AGI Production Deployment Log - $(Get-Date)" | Out-File -FilePath "deployment.log" -Encoding UTF8
    
    if (-not $MonitorOnly) {
        # Step 1: Pre-deployment validation
        if (-not $SkipValidation) {
            if (-not (Step-PreDeploymentValidation)) {
                throw "Pre-deployment validation failed"
            }
        } else {
            Write-ColorOutput "⏭️ Skipping pre-deployment validation" -Color Warning
        }
        
        # Step 2: Environment preparation
        if (-not (Step-EnvironmentPreparation)) {
            throw "Environment preparation failed"
        }
        
        # Step 3: Infrastructure deployment
        if (-not (Step-InfrastructureDeployment)) {
            throw "Infrastructure deployment failed"
        }
        
        # Step 4: AGI system deployment
        if (-not (Step-AGISystemDeployment)) {
            throw "AGI system deployment failed"
        }
        
        # Step 6: Load balancer deployment
        if (-not (Step-LoadBalancerDeployment)) {
            Write-ColorOutput "⚠️ Load balancer deployment had issues (continuing)" -Color Warning
        }
    }
    
    # Step 5: Monitoring deployment
    if (-not (Step-MonitoringDeployment)) {
        Write-ColorOutput "⚠️ Monitoring deployment had issues (continuing)" -Color Warning
    }
    
    if (-not $MonitorOnly) {
        # Step 7: Post-deployment validation
        Step-PostDeploymentValidation | Out-Null
    }
    
    # Generate and show report
    $reportPath = Generate-DeploymentReport
    Show-DeploymentSummary -ReportPath $reportPath
    
    # Exit with appropriate code
    if ($DeploymentResults.status -eq "SUCCESS") {
        Write-ColorOutput "✅ Deployment completed successfully!" -Color Success
        exit 0
    } elseif ($DeploymentResults.status -eq "SUCCESS_WITH_WARNINGS") {
        Write-ColorOutput "⚠️ Deployment completed with warnings" -Color Warning
        exit 1
    } else {
        Write-ColorOutput "❌ Deployment failed" -Color Error
        exit 2
    }
    
} catch {
    Write-ColorOutput "❌ Deployment failed: $($_.Exception.Message)" -Color Error
    Write-ColorOutput "🔍 Check deployment.log for details" -Color Info
    
    $DeploymentResults.status = "FAILED"
    $DeploymentResults.errors += $_.Exception.Message
    
    $reportPath = Generate-DeploymentReport
    Show-DeploymentSummary -ReportPath $reportPath
    
    exit 3
}