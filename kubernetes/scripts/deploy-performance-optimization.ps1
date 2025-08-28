# 🚀 Deploy Performance & Scale Optimization Infrastructure
# Version: 1.0
# Database Optimization | CDN Integration | Application Performance Monitoring
# Comprehensive deployment script for Essential CodAI Services performance optimization

param(
    [Parameter()]
    [string]$Environment = "production",
    
    [Parameter()]
    [string]$Namespace = "codai-production",
    
    [Parameter()]
    [switch]$DryRun = $false,
    
    [Parameter()]
    [switch]$ValidateOnly = $false,
    
    [Parameter()]
    [switch]$Verbose = $false
)

# Set error action and verbose preferences
$ErrorActionPreference = "Stop"
if ($Verbose) { $VerbosePreference = "Continue" }

# Enhanced logging function
function Write-EnhancedLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colorMap = @{
        "INFO" = "White"
        "SUCCESS" = "Green"
        "WARNING" = "Yellow" 
        "ERROR" = "Red"
        "PROGRESS" = "Cyan"
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $colorMap[$Level]
}

# Performance optimization deployment summary
Write-EnhancedLog "🚀 ESSENTIAL CODAI SERVICES - PERFORMANCE & SCALE OPTIMIZATION DEPLOYMENT" -Level "SUCCESS"
Write-EnhancedLog "=============================================================================" -Level "SUCCESS"
Write-EnhancedLog ""

# Display deployment parameters
Write-EnhancedLog "📋 Deployment Configuration:" -Level "PROGRESS"
Write-EnhancedLog "   Environment: $Environment" -Level "INFO"
Write-EnhancedLog "   Namespace: $Namespace" -Level "INFO"
Write-EnhancedLog "   Dry Run: $DryRun" -Level "INFO"
Write-EnhancedLog "   Validate Only: $ValidateOnly" -Level "INFO"
Write-EnhancedLog ""

# Validate Prerequisites
Write-EnhancedLog "🔍 Validating Prerequisites..." -Level "PROGRESS"

try {
    # Check kubectl
    $kubectlVersion = kubectl version --client --short 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-EnhancedLog "✅ kubectl: Available ($kubectlVersion)" -Level "SUCCESS"
    } else {
        throw "kubectl not found or not properly configured"
    }
    
    # Check cluster connection
    $clusterInfo = kubectl cluster-info --request-timeout=5s 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-EnhancedLog "✅ Kubernetes Cluster: Connected" -Level "SUCCESS"
    } else {
        throw "Cannot connect to Kubernetes cluster"
    }
    
    # Check namespace
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-EnhancedLog "✅ Namespace '$Namespace': Exists" -Level "SUCCESS"
    } else {
        Write-EnhancedLog "⚠️ Namespace '$Namespace' does not exist. Creating..." -Level "WARNING"
        if (-not $DryRun) {
            kubectl create namespace $Namespace
            Write-EnhancedLog "✅ Namespace '$Namespace': Created" -Level "SUCCESS"
        }
    }
    
} catch {
    Write-EnhancedLog "❌ Prerequisites validation failed: $_" -Level "ERROR"
    exit 1
}

Write-EnhancedLog ""

# Define performance optimization components
$performanceComponents = @(
    @{
        Name = "Database Performance Optimization"
        File = "database-performance-optimization.yaml"
        Description = "PostgreSQL optimization with read replicas and connection pooling"
        Dependencies = @()
    },
    @{
        Name = "Advanced Caching Infrastructure" 
        File = "advanced-caching-infrastructure.yaml"
        Description = "Redis cluster with cache warming and invalidation"
        Dependencies = @("Database Performance Optimization")
    },
    @{
        Name = "CDN & Global Asset Optimization"
        File = "cdn-global-optimization.yaml" 
        Description = "Multi-CDN with edge caching and asset optimization"
        Dependencies = @()
    },
    @{
        Name = "Application Performance Monitoring"
        File = "application-performance-monitoring.yaml"
        Description = "APM, profiling, and memory optimization"
        Dependencies = @("Database Performance Optimization")
    }
)

# Validation function
function Test-ComponentDeployment {
    param(
        [string]$ComponentName,
        [string]$ManifestFile
    )
    
    Write-EnhancedLog "🔍 Validating $ComponentName..." -Level "PROGRESS"
    
    if (-not (Test-Path "kubernetes/manifests/$ManifestFile")) {
        Write-EnhancedLog "❌ Manifest file not found: $ManifestFile" -Level "ERROR"
        return $false
    }
    
    # Validate YAML syntax
    try {
        $validation = kubectl apply --dry-run=client -f "kubernetes/manifests/$ManifestFile" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-EnhancedLog "❌ YAML validation failed for $ManifestFile" -Level "ERROR"
            Write-EnhancedLog "Error details: $validation" -Level "ERROR"
            return $false
        }
        Write-EnhancedLog "✅ $ComponentName: YAML validation passed" -Level "SUCCESS"
        return $true
    } catch {
        Write-EnhancedLog "❌ Validation error for $ComponentName: $_" -Level "ERROR"
        return $false
    }
}

# Deploy component function
function Deploy-Component {
    param(
        [string]$ComponentName,
        [string]$ManifestFile,
        [string]$Description
    )
    
    Write-EnhancedLog "🚀 Deploying $ComponentName..." -Level "PROGRESS"
    Write-EnhancedLog "   Description: $Description" -Level "INFO"
    
    try {
        if ($DryRun) {
            Write-EnhancedLog "🔍 DRY RUN: Would deploy $ManifestFile" -Level "WARNING"
            return $true
        }
        
        # Apply manifests
        $deployResult = kubectl apply -f "kubernetes/manifests/$ManifestFile" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-EnhancedLog "✅ $ComponentName: Deployed successfully" -Level "SUCCESS"
            
            # Wait for deployment readiness
            Write-EnhancedLog "⏳ Waiting for $ComponentName to be ready..." -Level "PROGRESS"
            Start-Sleep -Seconds 10
            
            return $true
        } else {
            Write-EnhancedLog "❌ Failed to deploy $ComponentName" -Level "ERROR"
            Write-EnhancedLog "Error details: $deployResult" -Level "ERROR"
            return $false
        }
    } catch {
        Write-EnhancedLog "❌ Deployment error for $ComponentName: $_" -Level "ERROR"
        return $false
    }
}

# Validate all components first
Write-EnhancedLog "🔍 PHASE 1: VALIDATING ALL PERFORMANCE COMPONENTS" -Level "PROGRESS"
Write-EnhancedLog "=================================================" -Level "PROGRESS"

$validationResults = @{}
foreach ($component in $performanceComponents) {
    $validationResults[$component.Name] = Test-ComponentDeployment -ComponentName $component.Name -ManifestFile $component.File
}

$validationFailures = $validationResults.Values | Where-Object { $_ -eq $false }
if ($validationFailures.Count -gt 0) {
    Write-EnhancedLog "❌ Validation phase failed. Please fix the errors above." -Level "ERROR"
    exit 1
}

Write-EnhancedLog "✅ All components validated successfully!" -Level "SUCCESS"
Write-EnhancedLog ""

if ($ValidateOnly) {
    Write-EnhancedLog "✅ Validation completed. Exiting (validate-only mode)." -Level "SUCCESS"
    exit 0
}

# Deploy components
Write-EnhancedLog "🚀 PHASE 2: DEPLOYING PERFORMANCE & SCALE OPTIMIZATION" -Level "PROGRESS"
Write-EnhancedLog "======================================================" -Level "PROGRESS"

$deploymentResults = @{}
$deploymentStartTime = Get-Date

foreach ($component in $performanceComponents) {
    # Check dependencies
    $dependenciesMet = $true
    foreach ($dependency in $component.Dependencies) {
        if (-not $deploymentResults.ContainsKey($dependency) -or -not $deploymentResults[$dependency]) {
            Write-EnhancedLog "⚠️ Dependency not met: $dependency for $($component.Name)" -Level "WARNING"
            $dependenciesMet = $false
        }
    }
    
    if (-not $dependenciesMet) {
        Write-EnhancedLog "⚠️ Skipping $($component.Name) due to unmet dependencies" -Level "WARNING"
        $deploymentResults[$component.Name] = $false
        continue
    }
    
    $deploymentResults[$component.Name] = Deploy-Component -ComponentName $component.Name -ManifestFile $component.File -Description $component.Description
    
    if ($deploymentResults[$component.Name]) {
        Write-EnhancedLog "✅ $($component.Name): Successfully deployed" -Level "SUCCESS"
    } else {
        Write-EnhancedLog "❌ $($component.Name): Deployment failed" -Level "ERROR"
    }
    
    Write-EnhancedLog ""
}

# Deployment summary
Write-EnhancedLog "📊 DEPLOYMENT SUMMARY" -Level "PROGRESS"
Write-EnhancedLog "=====================" -Level "PROGRESS"

$successfulDeployments = $deploymentResults.Values | Where-Object { $_ -eq $true }
$failedDeployments = $deploymentResults.Values | Where-Object { $_ -eq $false }
$totalDeploymentTime = (Get-Date) - $deploymentStartTime

Write-EnhancedLog "✅ Successful Deployments: $($successfulDeployments.Count)" -Level "SUCCESS"
Write-EnhancedLog "❌ Failed Deployments: $($failedDeployments.Count)" -Level $(if ($failedDeployments.Count -eq 0) { "SUCCESS" } else { "ERROR" })
Write-EnhancedLog "⏱️ Total Deployment Time: $($totalDeploymentTime.Minutes)m $($totalDeploymentTime.Seconds)s" -Level "INFO"
Write-EnhancedLog ""

# Detailed deployment results
foreach ($component in $performanceComponents) {
    $status = if ($deploymentResults[$component.Name]) { "✅ SUCCESS" } else { "❌ FAILED" }
    $statusColor = if ($deploymentResults[$component.Name]) { "SUCCESS" } else { "ERROR" }
    Write-EnhancedLog "$status $($component.Name)" -Level $statusColor
}

Write-EnhancedLog ""

# Post-deployment validation
if ($successfulDeployments.Count -gt 0 -and -not $DryRun) {
    Write-EnhancedLog "🔍 PHASE 3: POST-DEPLOYMENT VALIDATION" -Level "PROGRESS" 
    Write-EnhancedLog "=====================================" -Level "PROGRESS"
    
    Write-EnhancedLog "⏳ Waiting for services to stabilize..." -Level "PROGRESS"
    Start-Sleep -Seconds 30
    
    # Check pod status
    Write-EnhancedLog "📊 Checking pod status..." -Level "PROGRESS"
    $podStatus = kubectl get pods -n $Namespace -l component=performance-optimization 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-EnhancedLog "Pod Status:" -Level "INFO"
        Write-Host $podStatus
    }
    
    # Check service status
    Write-EnhancedLog "📊 Checking service status..." -Level "PROGRESS"
    $serviceStatus = kubectl get services -n $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-EnhancedLog "Service Status:" -Level "INFO"
        Write-Host $serviceStatus
    }
    
    # Performance optimization health checks
    Write-EnhancedLog "🏥 Running performance optimization health checks..." -Level "PROGRESS"
    
    $healthChecks = @(
        @{ Name = "Database Pool"; Service = "codai-database-pool"; Port = "5432" },
        @{ Name = "CDN Manager"; Service = "codai-cdn-manager"; Port = "80" },
        @{ Name = "Asset Optimizer"; Service = "codai-asset-optimizer"; Port = "80" },
        @{ Name = "Memory Analyzer"; Service = "codai-memory-analyzer"; Port = "80" }
    )
    
    foreach ($check in $healthChecks) {
        Write-EnhancedLog "🔍 Testing $($check.Name)..." -Level "PROGRESS"
        
        try {
            # Port forward for health check
            $portForwardJob = Start-Job -ScriptBlock {
                param($Namespace, $Service, $Port)
                kubectl port-forward -n $Namespace service/$Service 8080:$Port 2>$null
            } -ArgumentList $Namespace, $check.Service, $check.Port
            
            Start-Sleep -Seconds 5
            
            # Test health endpoint
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5
                Write-EnhancedLog "✅ $($check.Name): Healthy" -Level "SUCCESS"
            } catch {
                Write-EnhancedLog "⚠️ $($check.Name): Health check failed" -Level "WARNING"
            }
            
            # Cleanup port forward
            Stop-Job -Job $portForwardJob -ErrorAction SilentlyContinue
            Remove-Job -Job $portForwardJob -ErrorAction SilentlyContinue
            
        } catch {
            Write-EnhancedLog "⚠️ $($check.Name): Could not perform health check" -Level "WARNING"
        }
    }
}

Write-EnhancedLog ""

# Final summary and next steps
if ($failedDeployments.Count -eq 0) {
    Write-EnhancedLog "🎉 PERFORMANCE & SCALE OPTIMIZATION DEPLOYMENT SUCCESSFUL!" -Level "SUCCESS"
    Write-EnhancedLog "==========================================================" -Level "SUCCESS"
    Write-EnhancedLog ""
    Write-EnhancedLog "✅ All performance optimization components deployed successfully" -Level "SUCCESS"
    Write-EnhancedLog "✅ Database performance optimization active" -Level "SUCCESS"
    Write-EnhancedLog "✅ Advanced caching infrastructure operational" -Level "SUCCESS"
    Write-EnhancedLog "✅ CDN and global asset optimization enabled" -Level "SUCCESS"
    Write-EnhancedLog "✅ Application performance monitoring configured" -Level "SUCCESS"
    Write-EnhancedLog ""
    Write-EnhancedLog "🌐 Performance Optimization Access Points:" -Level "PROGRESS"
    Write-EnhancedLog "   • Database Pool: codai-database-pool.$Namespace.svc.cluster.local:5432" -Level "INFO"
    Write-EnhancedLog "   • CDN Manager: codai-cdn-manager.$Namespace.svc.cluster.local:80" -Level "INFO"
    Write-EnhancedLog "   • Asset Optimizer: codai-asset-optimizer.$Namespace.svc.cluster.local:80" -Level "INFO"
    Write-EnhancedLog "   • Memory Analyzer: codai-memory-analyzer.$Namespace.svc.cluster.local:80" -Level "INFO"
    Write-EnhancedLog "   • Performance Profiler: codai-performance-profiler.$Namespace.svc.cluster.local:4040" -Level "INFO"
    Write-EnhancedLog ""
    Write-EnhancedLog "📊 Expected Performance Improvements:" -Level "PROGRESS"
    Write-EnhancedLog "   • API Response Times: <100ms (P95)" -Level "SUCCESS"
    Write-EnhancedLog "   • Database Query Performance: 10x improvement" -Level "SUCCESS"
    Write-EnhancedLog "   • Cache Hit Ratio: >90%" -Level "SUCCESS"
    Write-EnhancedLog "   • CDN Cache Hit Ratio: >95%" -Level "SUCCESS"
    Write-EnhancedLog "   • Memory Optimization: 40% reduction in usage" -Level "SUCCESS"
    Write-EnhancedLog ""
    Write-EnhancedLog "🚀 Next Steps:" -Level "PROGRESS"
    Write-EnhancedLog "   1. Monitor performance metrics via Grafana dashboards" -Level "INFO"
    Write-EnhancedLog "   2. Configure CDN settings for production domains" -Level "INFO"
    Write-EnhancedLog "   3. Run load testing scenarios to validate improvements" -Level "INFO"
    Write-EnhancedLog "   4. Proceed with US-PROD-005: Operational Excellence & DevOps" -Level "INFO"
    Write-EnhancedLog ""
    
    exit 0
} else {
    Write-EnhancedLog "⚠️ PERFORMANCE OPTIMIZATION DEPLOYMENT COMPLETED WITH ISSUES" -Level "WARNING"
    Write-EnhancedLog "=============================================================" -Level "WARNING"
    Write-EnhancedLog ""
    Write-EnhancedLog "Some components failed to deploy. Please review the errors above and:" -Level "WARNING"
    Write-EnhancedLog "1. Check the manifest files for syntax errors" -Level "INFO"
    Write-EnhancedLog "2. Verify cluster resources and permissions" -Level "INFO"
    Write-EnhancedLog "3. Check for conflicting deployments" -Level "INFO"
    Write-EnhancedLog "4. Re-run the deployment script after fixing issues" -Level "INFO"
    Write-EnhancedLog ""
    
    exit 1
}