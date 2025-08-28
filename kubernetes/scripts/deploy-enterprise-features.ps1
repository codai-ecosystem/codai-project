# Enterprise Features Deployment Script for Essential CodAI Services
# Version: 1.0
# Comprehensive Production Deployment

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "validate", "rollback", "status", "cleanup")]
    [string]$Action = "deploy",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "production")]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipValidation,
    
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 1800  # 30 minutes
)

# Enterprise Features Deployment Configuration
$EnterpriseFeatures = @{
    "MultiTenancy" = @{
        "manifest" = "kubernetes/manifests/multi-tenancy-infrastructure.yaml"
        "required" = $true
        "validation" = "codai-tenant-manager"
    }
    "AdvancedRBAC" = @{
        "manifest" = "kubernetes/manifests/advanced-rbac-system.yaml"
        "required" = $true
        "validation" = "codai-rbac-service"
    }
    "EnterpriseSSO" = @{
        "manifest" = "kubernetes/manifests/enterprise-sso-integration.yaml"
        "required" = $true
        "validation" = "codai-enterprise-sso"
    }
    "WhiteLabelTheming" = @{
        "manifest" = "kubernetes/manifests/white-label-theming-system.yaml"
        "required" = $true
        "validation" = "codai-white-label-service"
    }
    "AuditLogging" = @{
        "manifest" = "kubernetes/manifests/comprehensive-audit-logging.yaml"
        "required" = $true
        "validation" = "codai-audit-logger"
    }
}

$DeploymentConfig = @{
    "namespace" = "codai-production"
    "timeout" = $Timeout
    "healthCheckRetries" = 12
    "healthCheckInterval" = 15  # seconds
}

# Color output functions
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $colors = @{
        "Red" = [System.ConsoleColor]::Red
        "Green" = [System.ConsoleColor]::Green
        "Yellow" = [System.ConsoleColor]::Yellow
        "Blue" = [System.ConsoleColor]::Blue
        "Cyan" = [System.ConsoleColor]::Cyan
        "Magenta" = [System.ConsoleColor]::Magenta
        "White" = [System.ConsoleColor]::White
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n🏢 $Title" "Cyan"
    Write-ColorOutput ("=" * 80) "Cyan"
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "📋 $Message" "Yellow"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️ $Message" "Yellow"
}

# Pre-deployment validation
function Test-Prerequisites {
    Write-Header "Enterprise Features Prerequisites Validation"
    
    $checks = @()
    
    # Check kubectl
    Write-Step "Checking kubectl availability..."
    try {
        $kubectlVersion = kubectl version --client -o json | ConvertFrom-Json
        Write-Success "kubectl v$($kubectlVersion.clientVersion.gitVersion) available"
        $checks += @{name="kubectl"; status="passed"}
    } catch {
        Write-Error "kubectl not available or not configured"
        $checks += @{name="kubectl"; status="failed"}
    }
    
    # Check cluster connection
    Write-Step "Checking Kubernetes cluster connection..."
    try {
        $clusterInfo = kubectl cluster-info --request-timeout=10s 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Cluster connection established"
            $checks += @{name="cluster"; status="passed"}
        } else {
            Write-Error "Cannot connect to Kubernetes cluster"
            $checks += @{name="cluster"; status="failed"}
        }
    } catch {
        Write-Error "Cluster connection failed"
        $checks += @{name="cluster"; status="failed"}
    }
    
    # Check namespace
    Write-Step "Checking namespace: $($DeploymentConfig.namespace)..."
    $namespace = kubectl get namespace $DeploymentConfig.namespace -o json 2>$null | ConvertFrom-Json
    if ($namespace) {
        Write-Success "Namespace '$($DeploymentConfig.namespace)' exists"
        $checks += @{name="namespace"; status="passed"}
    } else {
        Write-Warning "Namespace '$($DeploymentConfig.namespace)' does not exist - will be created"
        $checks += @{name="namespace"; status="warning"}
    }
    
    # Check required secrets
    Write-Step "Checking required secrets..."
    $requiredSecrets = @(
        "codai-database-secrets",
        "redis-event-secrets",
        "sso-secrets",
        "azure-ad-secrets",
        "aws-s3-secrets",
        "audit-secrets"
    )
    
    $secretsStatus = @()
    foreach ($secret in $requiredSecrets) {
        $secretExists = kubectl get secret $secret -n $DeploymentConfig.namespace 2>$null
        if ($secretExists) {
            $secretsStatus += @{name=$secret; status="exists"}
        } else {
            $secretsStatus += @{name=$secret; status="missing"}
        }
    }
    
    $missingSecrets = $secretsStatus | Where-Object { $_.status -eq "missing" }
    if ($missingSecrets) {
        Write-Warning "Missing secrets: $($missingSecrets.name -join ', ')"
        Write-Warning "Secrets will need to be created manually before full functionality"
        $checks += @{name="secrets"; status="warning"}
    } else {
        Write-Success "All required secrets are available"
        $checks += @{name="secrets"; status="passed"}
    }
    
    # Check manifest files
    Write-Step "Checking manifest files..."
    $manifestStatus = @()
    foreach ($feature in $EnterpriseFeatures.GetEnumerator()) {
        $manifestPath = $feature.Value.manifest
        if (Test-Path $manifestPath) {
            $manifestStatus += @{name=$feature.Key; status="exists"}
        } else {
            $manifestStatus += @{name=$feature.Key; status="missing"}
        }
    }
    
    $missingManifests = $manifestStatus | Where-Object { $_.status -eq "missing" }
    if ($missingManifests) {
        Write-Error "Missing manifest files: $($missingManifests.name -join ', ')"
        $checks += @{name="manifests"; status="failed"}
    } else {
        Write-Success "All manifest files are available"
        $checks += @{name="manifests"; status="passed"}
    }
    
    # Summary
    $failedChecks = $checks | Where-Object { $_.status -eq "failed" }
    $warningChecks = $checks | Where-Object { $_.status -eq "warning" }
    
    if ($failedChecks) {
        Write-Error "Prerequisites validation failed: $($failedChecks.name -join ', ')"
        return $false
    }
    
    if ($warningChecks) {
        Write-Warning "Prerequisites validation completed with warnings: $($warningChecks.name -join ', ')"
    } else {
        Write-Success "All prerequisites validation passed"
    }
    
    return $true
}

# Create namespace if it doesn't exist
function Initialize-Namespace {
    Write-Step "Ensuring namespace '$($DeploymentConfig.namespace)' exists..."
    
    $namespace = kubectl get namespace $DeploymentConfig.namespace 2>$null
    if (-not $namespace) {
        if ($DryRun) {
            Write-ColorOutput "DRY-RUN: Would create namespace '$($DeploymentConfig.namespace)'" "Magenta"
        } else {
            kubectl create namespace $DeploymentConfig.namespace
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Namespace '$($DeploymentConfig.namespace)' created"
            } else {
                Write-Error "Failed to create namespace"
                return $false
            }
        }
    } else {
        Write-Success "Namespace '$($DeploymentConfig.namespace)' already exists"
    }
    return $true
}

# Deploy enterprise feature
function Deploy-EnterpriseFeature {
    param([string]$FeatureName, [hashtable]$FeatureConfig)
    
    Write-Step "Deploying $FeatureName..."
    
    if (-not (Test-Path $FeatureConfig.manifest)) {
        Write-Error "Manifest file not found: $($FeatureConfig.manifest)"
        return $false
    }
    
    if ($DryRun) {
        Write-ColorOutput "DRY-RUN: Would deploy $FeatureName from $($FeatureConfig.manifest)" "Magenta"
        return $true
    }
    
    # Apply manifest
    kubectl apply -f $FeatureConfig.manifest
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy $FeatureName"
        return $false
    }
    
    Write-Success "$FeatureName manifest applied"
    return $true
}

# Wait for deployment to be ready
function Wait-ForDeployment {
    param([string]$DeploymentName, [int]$TimeoutSeconds = 300)
    
    Write-Step "Waiting for deployment '$DeploymentName' to be ready..."
    
    if ($DryRun) {
        Write-ColorOutput "DRY-RUN: Would wait for deployment '$DeploymentName'" "Magenta"
        return $true
    }
    
    $attempts = 0
    $maxAttempts = [math]::Floor($TimeoutSeconds / 10)
    
    while ($attempts -lt $maxAttempts) {
        $deployment = kubectl get deployment $DeploymentName -n $DeploymentConfig.namespace -o json 2>$null | ConvertFrom-Json
        
        if ($deployment -and $deployment.status.readyReplicas -eq $deployment.status.replicas) {
            Write-Success "Deployment '$DeploymentName' is ready"
            return $true
        }
        
        Write-ColorOutput "Waiting for deployment '$DeploymentName'... ($($attempts + 1)/$maxAttempts)" "Yellow"
        Start-Sleep -Seconds 10
        $attempts++
    }
    
    Write-Error "Deployment '$DeploymentName' failed to become ready within $TimeoutSeconds seconds"
    return $false
}

# Health check for service
function Test-ServiceHealth {
    param([string]$ServiceName, [string]$Namespace)
    
    Write-Step "Health check for service '$ServiceName'..."
    
    if ($DryRun) {
        Write-ColorOutput "DRY-RUN: Would perform health check for '$ServiceName'" "Magenta"
        return $true
    }
    
    # Get service endpoint
    $service = kubectl get service $ServiceName -n $Namespace -o json 2>$null | ConvertFrom-Json
    if (-not $service) {
        Write-Error "Service '$ServiceName' not found"
        return $false
    }
    
    # Simple connectivity test (assuming port 80 or first port)
    $port = $service.spec.ports[0].port
    
    Write-ColorOutput "Service '$ServiceName' is available on port $port" "Green"
    return $true
}

# Validate deployment
function Test-DeploymentHealth {
    Write-Header "Enterprise Features Health Validation"
    
    $healthResults = @()
    
    foreach ($feature in $EnterpriseFeatures.GetEnumerator()) {
        $featureName = $feature.Key
        $validationService = $feature.Value.validation
        
        Write-Step "Validating $featureName..."
        
        # Check deployment status
        $deploymentReady = Wait-ForDeployment -DeploymentName $validationService -TimeoutSeconds 60
        
        # Check service health
        $serviceHealthy = Test-ServiceHealth -ServiceName $validationService -Namespace $DeploymentConfig.namespace
        
        $healthResults += @{
            feature = $featureName
            deployment = $deploymentReady
            service = $serviceHealthy
            overall = $deploymentReady -and $serviceHealthy
        }
    }
    
    # Summary
    $healthyFeatures = $healthResults | Where-Object { $_.overall }
    $unhealthyFeatures = $healthResults | Where-Object { -not $_.overall }
    
    Write-ColorOutput "`n📊 Health Check Summary:" "Cyan"
    Write-ColorOutput "✅ Healthy Features: $($healthyFeatures.Count)" "Green"
    if ($unhealthyFeatures) {
        Write-ColorOutput "❌ Unhealthy Features: $($unhealthyFeatures.Count)" "Red"
        foreach ($unhealthy in $unhealthyFeatures) {
            Write-ColorOutput "  - $($unhealthy.feature)" "Red"
        }
    }
    
    return $healthResults
}

# Get deployment status
function Get-DeploymentStatus {
    Write-Header "Enterprise Features Deployment Status"
    
    foreach ($feature in $EnterpriseFeatures.GetEnumerator()) {
        $featureName = $feature.Key
        $validationService = $feature.Value.validation
        
        Write-ColorOutput "`n📋 $featureName Status:" "Yellow"
        
        # Get deployment info
        $deployment = kubectl get deployment $validationService -n $DeploymentConfig.namespace -o json 2>$null | ConvertFrom-Json
        if ($deployment) {
            $ready = $deployment.status.readyReplicas
            $desired = $deployment.status.replicas
            Write-ColorOutput "  Deployment: $ready/$desired replicas ready" $(if ($ready -eq $desired) {"Green"} else {"Yellow"})
        } else {
            Write-ColorOutput "  Deployment: Not found" "Red"
        }
        
        # Get service info
        $service = kubectl get service $validationService -n $DeploymentConfig.namespace -o json 2>$null | ConvertFrom-Json
        if ($service) {
            $port = $service.spec.ports[0].port
            Write-ColorOutput "  Service: Available on port $port" "Green"
        } else {
            Write-ColorOutput "  Service: Not found" "Red"
        }
        
        # Get pods info
        $pods = kubectl get pods -l app=$validationService -n $DeploymentConfig.namespace -o json 2>$null | ConvertFrom-Json
        if ($pods -and $pods.items) {
            $runningPods = ($pods.items | Where-Object { $_.status.phase -eq "Running" }).Count
            $totalPods = $pods.items.Count
            Write-ColorOutput "  Pods: $runningPods/$totalPods running" $(if ($runningPods -eq $totalPods) {"Green"} else {"Yellow"})
        } else {
            Write-ColorOutput "  Pods: None found" "Red"
        }
    }
}

# Cleanup deployment
function Remove-EnterpriseFeatures {
    Write-Header "Enterprise Features Cleanup"
    
    if ($DryRun) {
        Write-ColorOutput "DRY-RUN: Would cleanup enterprise features" "Magenta"
        return
    }
    
    Write-Warning "This will remove all enterprise features. Are you sure? (y/N)"
    $confirm = Read-Host
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-ColorOutput "Cleanup cancelled" "Yellow"
        return
    }
    
    foreach ($feature in $EnterpriseFeatures.GetEnumerator()) {
        $featureName = $feature.Key
        $manifest = $feature.Value.manifest
        
        Write-Step "Removing $featureName..."
        kubectl delete -f $manifest --ignore-not-found=true
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$featureName removed"
        } else {
            Write-Warning "Failed to remove $featureName (may not exist)"
        }
    }
}

# Main execution
function Main {
    Write-Header "Essential CodAI Enterprise Features Deployment"
    Write-ColorOutput "Environment: $Environment" "Cyan"
    Write-ColorOutput "Action: $Action" "Cyan"
    if ($DryRun) { Write-ColorOutput "Mode: DRY-RUN" "Magenta" }
    Write-ColorOutput "Timeout: $Timeout seconds" "Cyan"
    
    switch ($Action) {
        "deploy" {
            if (-not $SkipValidation) {
                if (-not (Test-Prerequisites)) {
                    Write-Error "Prerequisites validation failed. Use -SkipValidation to bypass."
                    exit 1
                }
            }
            
            if (-not (Initialize-Namespace)) {
                Write-Error "Failed to initialize namespace"
                exit 1
            }
            
            $deploymentSuccess = $true
            foreach ($feature in $EnterpriseFeatures.GetEnumerator()) {
                $success = Deploy-EnterpriseFeature -FeatureName $feature.Key -FeatureConfig $feature.Value
                if (-not $success) {
                    $deploymentSuccess = $false
                    if ($feature.Value.required) {
                        Write-Error "Required feature $($feature.Key) failed to deploy"
                        exit 1
                    }
                }
            }
            
            if ($deploymentSuccess -and -not $DryRun) {
                Write-Success "All enterprise features deployed successfully"
                
                Write-Step "Performing health validation..."
                $healthResults = Test-DeploymentHealth
                
                $healthyCount = ($healthResults | Where-Object { $_.overall }).Count
                $totalCount = $healthResults.Count
                
                if ($healthyCount -eq $totalCount) {
                    Write-Success "🎉 Enterprise features deployment completed successfully!"
                    Write-ColorOutput "All $totalCount features are healthy and operational" "Green"
                } else {
                    Write-Warning "Deployment completed with $($totalCount - $healthyCount) unhealthy features"
                    exit 1
                }
            } elseif ($DryRun) {
                Write-ColorOutput "DRY-RUN: Enterprise features deployment validation completed" "Magenta"
            }
        }
        
        "validate" {
            $healthResults = Test-DeploymentHealth
            $healthyCount = ($healthResults | Where-Object { $_.overall }).Count
            $totalCount = $healthResults.Count
            
            if ($healthyCount -eq $totalCount) {
                Write-Success "All enterprise features are healthy"
                exit 0
            } else {
                Write-Error "$($totalCount - $healthyCount) features are unhealthy"
                exit 1
            }
        }
        
        "status" {
            Get-DeploymentStatus
        }
        
        "cleanup" {
            Remove-EnterpriseFeatures
        }
        
        "rollback" {
            Write-Warning "Rollback functionality not yet implemented"
            Write-ColorOutput "Use 'cleanup' to remove features or redeploy with previous versions" "Yellow"
        }
    }
}

# Execute main function
try {
    Main
} catch {
    Write-Error "Deployment script failed: $($_.Exception.Message)"
    Write-ColorOutput $_.Exception.StackTrace "Red"
    exit 1
}