# Multi-Environment Deployment Automation Scripts
# MemorAI MCP Server v9.5.0 - Complete Deployment Orchestration

# PowerShell Deployment Orchestrator
# deploy-memorai-environments.ps1

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production", "all")]
    [string]$Environment = "development",
    
    [Parameter(Mandatory = $false)]
    [string]$Version = "v9.5.0",
    
    [Parameter(Mandatory = $false)]
    [switch]$Force = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipValidation = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false
)

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan
$White = [System.ConsoleColor]::White

function Write-ColorText {
    param([string]$Text, [System.ConsoleColor]$Color)
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Test-Prerequisites {
    Write-ColorText "🔍 Checking Prerequisites..." $Cyan
    
    # Check kubectl
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-ColorText "❌ kubectl not found. Please install kubectl." $Red
        exit 1
    }
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ColorText "❌ Docker not found. Please install Docker." $Red
        exit 1
    }
    
    # Check cluster connectivity
    try {
        kubectl cluster-info --request-timeout=10s | Out-Null
        Write-ColorText "✅ Kubernetes cluster accessible" $Green
    }
    catch {
        Write-ColorText "❌ Cannot connect to Kubernetes cluster" $Red
        exit 1
    }
    
    # Check jq
    if (-not (Get-Command jq -ErrorAction SilentlyContinue)) {
        Write-ColorText "⚠️ jq not found. Some validations may not work." $Yellow
    }
    
    Write-ColorText "✅ Prerequisites check completed" $Green
}

function Deploy-Environment {
    param([string]$EnvName)
    
    Write-ColorText "`n🚀 Deploying MemorAI MCP Server to $EnvName" $Cyan
    Write-ColorText "=============================================" $Cyan
    
    $namespace = "memorai-$EnvName"
    
    if ($DryRun) {
        Write-ColorText "🧪 DRY RUN MODE - No actual changes will be made" $Yellow
    }
    
    # Step 1: Create namespace if it doesn't exist
    Write-ColorText "`n📁 Creating namespace: $namespace" $White
    if (-not $DryRun) {
        kubectl create namespace $namespace --dry-run=client -o yaml | kubectl apply -f -
    } else {
        Write-ColorText "   Would create namespace: $namespace" $Yellow
    }
    
    # Step 2: Apply ConfigMaps
    Write-ColorText "`n⚙️ Applying ConfigMaps..." $White
    if (-not $DryRun) {
        kubectl apply -f environments/configmaps.yaml -n $namespace
    } else {
        Write-ColorText "   Would apply ConfigMaps to $namespace" $Yellow
    }
    
    # Step 3: Apply Secrets
    Write-ColorText "`n🔐 Applying Secrets..." $White
    if (-not $DryRun) {
        kubectl apply -f environments/secrets.yaml -n $namespace
    } else {
        Write-ColorText "   Would apply Secrets to $namespace" $Yellow
    }
    
    # Step 4: Apply Feature Flags
    Write-ColorText "`n🚩 Applying Feature Flags..." $White
    if (-not $DryRun) {
        kubectl apply -f environments/feature-flags.yaml -n $namespace
    } else {
        Write-ColorText "   Would apply Feature Flags to $namespace" $Yellow
    }
    
    # Step 5: Database Migration
    Write-ColorText "`n🗃️ Running Database Migration..." $White
    if (-not $DryRun) {
        kubectl apply -f environments/database-migrations.yaml -n $namespace
        
        # Wait for migration to complete
        $jobName = "memorai-db-migration-$EnvName"
        Write-ColorText "   Waiting for migration job: $jobName" $White
        
        $timeout = switch ($EnvName) {
            "development" { 300 }
            "staging" { 600 }
            "production" { 1200 }
        }
        
        kubectl wait --for=condition=complete job/$jobName -n $namespace --timeout="$($timeout)s"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ Database migration completed successfully" $Green
        } else {
            Write-ColorText "❌ Database migration failed" $Red
            if (-not $Force) {
                exit 1
            }
        }
    } else {
        Write-ColorText "   Would run database migration for $EnvName" $Yellow
    }
    
    # Step 6: Deploy Application
    Write-ColorText "`n🚀 Deploying Application..." $White
    if (-not $DryRun) {
        kubectl apply -f environments/deployments.yaml -n $namespace
        
        # Wait for deployment to be ready
        $deploymentName = "memorai-mcp-$EnvName"
        Write-ColorText "   Waiting for deployment: $deploymentName" $White
        
        kubectl rollout status deployment/$deploymentName -n $namespace --timeout=600s
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ Application deployment completed successfully" $Green
        } else {
            Write-ColorText "❌ Application deployment failed" $Red
            if (-not $Force) {
                exit 1
            }
        }
    } else {
        Write-ColorText "   Would deploy application to $EnvName" $Yellow
    }
    
    # Step 7: Validation
    if (-not $SkipValidation -and -not $DryRun) {
        Write-ColorText "`n🔍 Running Environment Validation..." $White
        kubectl apply -f environments/environment-validation.yaml -n $namespace
        
        # Run validation script
        $validationPod = kubectl run memorai-validation-$(Get-Random) --image=memorai/validation-tools:latest -n $namespace --rm -i --restart=Never -- /scripts/validate-environment.sh $EnvName
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ Environment validation passed" $Green
        } else {
            Write-ColorText "⚠️ Environment validation had issues" $Yellow
        }
    }
    
    # Step 8: Display Access Information
    Write-ColorText "`n🌐 Environment Access Information" $Cyan
    Write-ColorText "=================================" $Cyan
    
    $serviceName = "memorai-mcp-service-$EnvName"
    $servicePort = 4950
    
    Write-ColorText "📋 Environment: $EnvName" $White
    Write-ColorText "📋 Namespace: $namespace" $White
    Write-ColorText "📋 Service: $serviceName" $White
    Write-ColorText "📋 Version: $Version" $White
    
    if (-not $DryRun) {
        # Get service information
        $serviceInfo = kubectl get service $serviceName -n $namespace -o json 2>$null | ConvertFrom-Json
        
        if ($serviceInfo) {
            Write-ColorText "📋 Service Port: $($serviceInfo.spec.ports[0].port)" $White
            Write-ColorText "📋 Target Port: $($serviceInfo.spec.ports[0].targetPort)" $White
        }
        
        # Get pod information
        $pods = kubectl get pods -l "app=memorai-mcp,environment=$EnvName" -n $namespace -o jsonpath='{.items[*].metadata.name}'
        if ($pods) {
            Write-ColorText "📋 Running Pods: $($pods -split ' ' | Measure-Object | Select-Object -ExpandProperty Count)" $White
        }
        
        # Port forward command
        Write-ColorText "`n🔌 To access the service locally, run:" $Cyan
        Write-ColorText "   kubectl port-forward svc/$serviceName $servicePort`:$servicePort -n $namespace" $White
        Write-ColorText "   Then access: http://localhost:$servicePort/health" $White
    }
    
    Write-ColorText "`n✅ $EnvName deployment completed successfully!" $Green
}

function Deploy-AllEnvironments {
    Write-ColorText "🚀 Deploying to All Environments" $Cyan
    Write-ColorText "=================================" $Cyan
    
    $environments = @("development", "staging", "production")
    
    foreach ($env in $environments) {
        try {
            Deploy-Environment -EnvName $env
            Write-ColorText "`n✅ $env deployment successful" $Green
        }
        catch {
            Write-ColorText "`n❌ $env deployment failed: $_" $Red
            if (-not $Force) {
                Write-ColorText "🛑 Stopping deployment process. Use -Force to continue." $Red
                exit 1
            }
        }
        
        # Brief pause between environments
        if ($env -ne "production") {
            Write-ColorText "`n⏳ Pausing before next environment..." $Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-ColorText "`n🎉 All environments deployed successfully!" $Green
}

function Show-EnvironmentStatus {
    Write-ColorText "`n📊 Environment Status Report" $Cyan
    Write-ColorText "=============================" $Cyan
    
    $environments = @("development", "staging", "production")
    
    foreach ($env in $environments) {
        Write-ColorText "`n🌐 $($env.ToUpper()) Environment:" $White
        
        $namespace = "memorai-$env"
        $deploymentName = "memorai-mcp-$env"
        
        try {
            # Check if namespace exists
            kubectl get namespace $namespace >$null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorText "  ✅ Namespace: $namespace exists" $Green
                
                # Check deployment
                $deployment = kubectl get deployment $deploymentName -n $namespace -o jsonpath='{.status.readyReplicas}/{.status.replicas}' 2>$null
                if ($deployment) {
                    Write-ColorText "  ✅ Deployment: $deployment replicas ready" $Green
                } else {
                    Write-ColorText "  ❌ Deployment: Not found or not ready" $Red
                }
                
                # Check service
                $service = kubectl get service "memorai-mcp-service-$env" -n $namespace -o jsonpath='{.metadata.name}' 2>$null
                if ($service) {
                    Write-ColorText "  ✅ Service: $service accessible" $Green
                } else {
                    Write-ColorText "  ❌ Service: Not found" $Red
                }
            } else {
                Write-ColorText "  ❌ Namespace: $namespace does not exist" $Red
            }
        }
        catch {
            Write-ColorText "  ❌ Error checking $env environment: $_" $Red
        }
    }
}

# Main execution
Write-ColorText "🧠 MemorAI MCP Server Multi-Environment Deployment" $Cyan
Write-ColorText "===================================================" $Cyan
Write-ColorText "Version: $Version" $White
Write-ColorText "Target: $Environment" $White
Write-ColorText "Force: $Force" $White
Write-ColorText "Skip Validation: $SkipValidation" $White
Write-ColorText "Dry Run: $DryRun" $White

# Check prerequisites
Test-Prerequisites

# Execute based on environment parameter
switch ($Environment) {
    "all" {
        Deploy-AllEnvironments
    }
    default {
        Deploy-Environment -EnvName $Environment
    }
}

# Show final status
Show-EnvironmentStatus

Write-ColorText "`n🎉 Deployment process completed!" $Green
Write-ColorText "📚 For more information, visit: https://docs.memorai-mcp.com" $Cyan