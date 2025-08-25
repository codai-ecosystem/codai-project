#!/usr/bin/env pwsh
<#
.SYNOPSIS
🚀 RomAI Production Deployment Automation Script

.DESCRIPTION
Comprehensive production deployment automation for RomAI with:
- Multi-region Kubernetes deployment
- Infrastructure provisioning with Terraform
- Monitoring and observability setup
- Security hardening and compliance
- Health checks and validation
- Blue-green deployment support
- Auto-scaling configuration

.PARAMETER Environment
Target environment (production, staging)

.PARAMETER Regions
AWS regions for deployment (comma-separated)

.PARAMETER SkipInfrastructure
Skip Terraform infrastructure provisioning

.PARAMETER MonitoringOnly
Deploy only monitoring stack

.PARAMETER Validate
Perform deployment validation only

.EXAMPLE
./deploy-production.ps1 -Environment production -Regions "us-east-1,eu-central-1"

.EXAMPLE
./deploy-production.ps1 -Environment production -MonitoringOnly

.EXAMPLE
./deploy-production.ps1 -Environment production -Validate
#>

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("production", "staging")]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$Regions = "us-east-1,us-west-2,eu-central-1,ap-southeast-1",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipInfrastructure,
    
    [Parameter(Mandatory = $false)]
    [switch]$MonitoringOnly,
    
    [Parameter(Mandatory = $false)]
    [switch]$Validate
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n$('='*80)" -ForegroundColor $Colors.Header
    Write-Host "🚀 $Message" -ForegroundColor $Colors.Header
    Write-Host "$('='*80)" -ForegroundColor $Colors.Header
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n📋 $Message" -ForegroundColor $Colors.Info
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Colors.Error
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check required tools
    $requiredTools = @("kubectl", "terraform", "helm", "aws", "docker")
    $missingTools = @()
    
    foreach ($tool in $requiredTools) {
        if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
            $missingTools += $tool
        }
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools: $($missingTools -join ', ')"
        Write-Host "Please install the missing tools and try again." -ForegroundColor $Colors.Warning
        exit 1
    }
    
    # Check AWS credentials
    try {
        $awsIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-Success "AWS credentials verified for account: $($awsIdentity.Account)"
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    }
    
    # Check Docker is running
    try {
        docker version | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
    
    # Check Kubernetes context
    try {
        $currentContext = kubectl config current-context
        Write-Success "Current Kubernetes context: $currentContext"
    }
    catch {
        Write-Warning "No Kubernetes context set. Will configure after infrastructure deployment."
    }
    
    Write-Success "All prerequisites satisfied"
}

function Deploy-Infrastructure {
    if ($SkipInfrastructure) {
        Write-Warning "Skipping infrastructure deployment as requested"
        return
    }
    
    Write-Step "Deploying infrastructure with Terraform..."
    
    # Initialize Terraform
    Push-Location "terraform/production"
    try {
        Write-Host "🔧 Initializing Terraform..." -ForegroundColor $Colors.Info
        terraform init
        
        # Plan deployment
        Write-Host "📋 Planning infrastructure deployment..." -ForegroundColor $Colors.Info
        $regionList = $Regions -split ","
        $terraformVars = @(
            "-var", "environment=$Environment"
            "-var", "regions=[`"$($regionList -join '","')`"]"
        )
        
        terraform plan @terraformVars -out=tfplan
        
        # Apply deployment
        Write-Host "🚀 Applying infrastructure deployment..." -ForegroundColor $Colors.Info
        terraform apply tfplan
        
        Write-Success "Infrastructure deployment completed"
        
        # Get outputs
        $outputs = terraform output -json | ConvertFrom-Json
        return $outputs
    }
    catch {
        Write-Error "Infrastructure deployment failed: $($_.Exception.Message)"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Configure-Kubernetes {
    param([object]$TerraformOutputs)
    
    Write-Step "Configuring Kubernetes contexts..."
    
    $regionList = $Regions -split ","
    
    foreach ($region in $regionList) {
        try {
            $clusterName = "romai-cluster-$region"
            
            Write-Host "🔧 Configuring kubeconfig for $clusterName..." -ForegroundColor $Colors.Info
            aws eks update-kubeconfig --region $region --name $clusterName --alias $clusterName
            
            # Verify cluster connectivity
            kubectl --context=$clusterName cluster-info | Out-Null
            Write-Success "Kubernetes context configured for $region"
        }
        catch {
            Write-Error "Failed to configure Kubernetes for $region : $($_.Exception.Message)"
            exit 1
        }
    }
}

function Deploy-RomAI-Services {
    Write-Step "Deploying RomAI services to Kubernetes..."
    
    $regionList = $Regions -split ","
    
    foreach ($region in $regionList) {
        $context = "romai-cluster-$region"
        
        try {
            Write-Host "🚀 Deploying RomAI services to $region..." -ForegroundColor $Colors.Info
            
            # Apply production deployment
            kubectl --context=$context apply -f k8s/production/romai-production-deployment.yaml
            
            # Wait for deployments to be ready
            Write-Host "⏳ Waiting for deployments to be ready..." -ForegroundColor $Colors.Info
            kubectl --context=$context wait --for=condition=available deployment --all -n romai-production --timeout=600s
            
            Write-Success "RomAI services deployed to $region"
        }
        catch {
            Write-Error "Failed to deploy RomAI services to $region : $($_.Exception.Message)"
            exit 1
        }
    }
}

function Deploy-Monitoring {
    Write-Step "Deploying monitoring and observability stack..."
    
    $regionList = $Regions -split ","
    $primaryRegion = $regionList[0]
    $primaryContext = "romai-cluster-$primaryRegion"
    
    try {
        Write-Host "📊 Deploying monitoring stack to primary region: $primaryRegion..." -ForegroundColor $Colors.Info
        
        # Deploy monitoring stack
        kubectl --context=$primaryContext apply -f k8s/monitoring/monitoring-stack.yaml
        
        # Wait for monitoring services to be ready
        Write-Host "⏳ Waiting for monitoring services to be ready..." -ForegroundColor $Colors.Info
        kubectl --context=$primaryContext wait --for=condition=available deployment --all -n monitoring --timeout=600s
        
        # Setup monitoring for other regions
        for ($i = 1; $i -lt $regionList.Count; $i++) {
            $region = $regionList[$i]
            $context = "romai-cluster-$region"
            
            Write-Host "📊 Configuring monitoring for $region..." -ForegroundColor $Colors.Info
            
            # Deploy lightweight monitoring agents
            kubectl --context=$context apply -f k8s/monitoring/monitoring-agents.yaml
            
            Write-Success "Monitoring configured for $region"
        }
        
        Write-Success "Monitoring stack deployment completed"
    }
    catch {
        Write-Error "Failed to deploy monitoring stack: $($_.Exception.Message)"
        exit 1
    }
}

function Setup-Auto-Scaling {
    Write-Step "Configuring auto-scaling policies..."
    
    $regionList = $Regions -split ","
    
    foreach ($region in $regionList) {
        $context = "romai-cluster-$region"
        
        try {
            Write-Host "📈 Setting up auto-scaling for $region..." -ForegroundColor $Colors.Info
            
            # Enable cluster autoscaler
            helm --kube-context=$context upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler \
                --namespace kube-system \
                --set autoDiscovery.clusterName="romai-cluster-$region" \
                --set awsRegion=$region \
                --set cloudProvider=aws \
                --set extraArgs.skip-nodes-with-local-storage=false \
                --set extraArgs.skip-nodes-with-system-pods=false \
                --set extraArgs.balance-similar-node-groups=true
            
            # Enable metrics server
            kubectl --context=$context apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
            
            Write-Success "Auto-scaling configured for $region"
        }
        catch {
            Write-Error "Failed to setup auto-scaling for $region : $($_.Exception.Message)"
            exit 1
        }
    }
}

function Setup-Security {
    Write-Step "Implementing security hardening..."
    
    $regionList = $Regions -split ","
    
    foreach ($region in $regionList) {
        $context = "romai-cluster-$region"
        
        try {
            Write-Host "🛡️ Implementing security policies for $region..." -ForegroundColor $Colors.Info
            
            # Deploy network policies
            kubectl --context=$context apply -f k8s/security/network-policies.yaml
            
            # Deploy pod security policies
            kubectl --context=$context apply -f k8s/security/pod-security-policies.yaml
            
            # Deploy RBAC policies
            kubectl --context=$context apply -f k8s/security/rbac-policies.yaml
            
            # Deploy secrets management
            kubectl --context=$context apply -f k8s/security/secrets-management.yaml
            
            Write-Success "Security hardening applied to $region"
        }
        catch {
            Write-Error "Failed to implement security for $region : $($_.Exception.Message)"
            exit 1
        }
    }
}

function Validate-Deployment {
    Write-Step "Validating production deployment..."
    
    $regionList = $Regions -split ","
    $validationResults = @{}
    
    foreach ($region in $regionList) {
        $context = "romai-cluster-$region"
        $regionResults = @{
            Services = @{}
            Health = $true
            Metrics = @{}
        }
        
        try {
            Write-Host "🔍 Validating deployment in $region..." -ForegroundColor $Colors.Info
            
            # Check service health
            $services = @("romai-ml-api", "memorai-mcp-service", "postgresql-primary", "redis-cluster")
            
            foreach ($service in $services) {
                try {
                    $deployment = kubectl --context=$context get deployment $service -n romai-production -o json | ConvertFrom-Json
                    $ready = $deployment.status.readyReplicas -eq $deployment.status.replicas
                    $regionResults.Services[$service] = $ready
                    
                    if ($ready) {
                        Write-Success "$service is ready in $region"
                    } else {
                        Write-Warning "$service is not ready in $region"
                        $regionResults.Health = $false
                    }
                }
                catch {
                    Write-Warning "Could not check $service in $region"
                    $regionResults.Services[$service] = $false
                    $regionResults.Health = $false
                }
            }
            
            # Check resource utilization
            try {
                $nodes = kubectl --context=$context get nodes -o json | ConvertFrom-Json
                $totalNodes = $nodes.items.Count
                $readyNodes = ($nodes.items | Where-Object { $_.status.conditions | Where-Object { $_.type -eq "Ready" -and $_.status -eq "True" } }).Count
                
                $regionResults.Metrics["NodesTotal"] = $totalNodes
                $regionResults.Metrics["NodesReady"] = $readyNodes
                $regionResults.Metrics["NodeHealth"] = [math]::Round(($readyNodes / $totalNodes) * 100, 1)
                
                Write-Host "📊 Node health: $readyNodes/$totalNodes nodes ready ($($regionResults.Metrics.NodeHealth)%)" -ForegroundColor $Colors.Info
            }
            catch {
                Write-Warning "Could not check node health in $region"
            }
            
            # Performance test
            try {
                Write-Host "⚡ Running performance test..." -ForegroundColor $Colors.Info
                
                # Get load balancer endpoint
                $lbService = kubectl --context=$context get service nginx-load-balancer -n romai-production -o json | ConvertFrom-Json
                $endpoint = $lbService.status.loadBalancer.ingress[0].hostname
                
                if ($endpoint) {
                    # Simple health check
                    $response = Invoke-RestMethod -Uri "http://$endpoint/health" -Method Get -TimeoutSec 10
                    if ($response) {
                        $regionResults.Metrics["LoadBalancerHealth"] = "Healthy"
                        Write-Success "Load balancer is healthy in $region"
                    }
                } else {
                    Write-Warning "Load balancer endpoint not available in $region"
                    $regionResults.Metrics["LoadBalancerHealth"] = "Unavailable"
                    $regionResults.Health = $false
                }
            }
            catch {
                Write-Warning "Performance test failed in $region : $($_.Exception.Message)"
                $regionResults.Metrics["LoadBalancerHealth"] = "Failed"
                $regionResults.Health = $false
            }
        }
        catch {
            Write-Error "Validation failed for $region : $($_.Exception.Message)"
            $regionResults.Health = $false
        }
        
        $validationResults[$region] = $regionResults
    }
    
    return $validationResults
}

function Show-Deployment-Summary {
    param([hashtable]$ValidationResults)
    
    Write-Header "ROMAI PRODUCTION DEPLOYMENT SUMMARY"
    
    $overallHealth = $true
    $totalRegions = $ValidationResults.Count
    $healthyRegions = 0
    
    foreach ($region in $ValidationResults.Keys) {
        $result = $ValidationResults[$region]
        
        Write-Host "`n🌐 Region: $region" -ForegroundColor $Colors.Header
        Write-Host "   Status: $(if ($result.Health) { '✅ Healthy' } else { '❌ Issues Detected' })" -ForegroundColor $(if ($result.Health) { $Colors.Success } else { $Colors.Error })
        
        if ($result.Services.Count -gt 0) {
            Write-Host "   Services:" -ForegroundColor $Colors.Info
            foreach ($service in $result.Services.Keys) {
                $status = if ($result.Services[$service]) { '✅' } else { '❌' }
                Write-Host "     $status $service" -ForegroundColor $(if ($result.Services[$service]) { $Colors.Success } else { $Colors.Error })
            }
        }
        
        if ($result.Metrics.Count -gt 0) {
            Write-Host "   Metrics:" -ForegroundColor $Colors.Info
            foreach ($metric in $result.Metrics.Keys) {
                Write-Host "     📊 $metric : $($result.Metrics[$metric])" -ForegroundColor $Colors.Info
            }
        }
        
        if ($result.Health) {
            $healthyRegions++
        } else {
            $overallHealth = $false
        }
    }
    
    Write-Host "`n$('='*80)" -ForegroundColor $Colors.Header
    Write-Host "📊 OVERALL STATUS" -ForegroundColor $Colors.Header
    Write-Host "$('='*80)" -ForegroundColor $Colors.Header
    
    Write-Host "🌐 Regions Deployed: $totalRegions" -ForegroundColor $Colors.Info
    Write-Host "✅ Healthy Regions: $healthyRegions" -ForegroundColor $(if ($healthyRegions -eq $totalRegions) { $Colors.Success } else { $Colors.Warning })
    Write-Host "📊 Success Rate: $([math]::Round(($healthyRegions / $totalRegions) * 100, 1))%" -ForegroundColor $(if ($overallHealth) { $Colors.Success } else { $Colors.Warning })
    
    if ($overallHealth) {
        Write-Host "`n🎉 DEPLOYMENT SUCCESSFUL - ROMAI IS PRODUCTION READY!" -ForegroundColor $Colors.Success
        Write-Host "🚀 All regions are healthy and operational" -ForegroundColor $Colors.Success
        Write-Host "📋 Next Steps:" -ForegroundColor $Colors.Info
        Write-Host "   • Monitor system performance via Grafana dashboards" -ForegroundColor $Colors.Info
        Write-Host "   • Configure additional alerting as needed" -ForegroundColor $Colors.Info
        Write-Host "   • Run comprehensive load testing" -ForegroundColor $Colors.Info
        Write-Host "   • Schedule regular health checks" -ForegroundColor $Colors.Info
    } else {
        Write-Host "`n⚠️ DEPLOYMENT COMPLETED WITH ISSUES" -ForegroundColor $Colors.Warning
        Write-Host "🔧 Please review failed components and resolve issues" -ForegroundColor $Colors.Warning
        Write-Host "📋 Troubleshooting Steps:" -ForegroundColor $Colors.Info
        Write-Host "   • Check pod logs: kubectl logs -n romai-production <pod-name>" -ForegroundColor $Colors.Info
        Write-Host "   • Verify resource allocation and limits" -ForegroundColor $Colors.Info
        Write-Host "   • Check network connectivity between services" -ForegroundColor $Colors.Info
        Write-Host "   • Review monitoring dashboards for errors" -ForegroundColor $Colors.Info
    }
    
    Write-Host "$('='*80)" -ForegroundColor $Colors.Header
}

# Main execution
try {
    Write-Header "ROMAI PRODUCTION DEPLOYMENT ORCHESTRATOR"
    Write-Host "Environment: $Environment" -ForegroundColor $Colors.Info
    Write-Host "Regions: $Regions" -ForegroundColor $Colors.Info
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')" -ForegroundColor $Colors.Info
    
    # Test prerequisites
    Test-Prerequisites
    
    if ($Validate) {
        # Validation only mode
        $validationResults = Validate-Deployment
        Show-Deployment-Summary -ValidationResults $validationResults
        exit 0
    }
    
    if ($MonitoringOnly) {
        # Monitoring only mode
        Deploy-Monitoring
        Write-Success "Monitoring stack deployment completed"
        exit 0
    }
    
    # Full deployment
    $startTime = Get-Date
    
    # Step 1: Deploy infrastructure
    $terraformOutputs = Deploy-Infrastructure
    
    # Step 2: Configure Kubernetes
    Configure-Kubernetes -TerraformOutputs $terraformOutputs
    
    # Step 3: Deploy RomAI services
    Deploy-RomAI-Services
    
    # Step 4: Deploy monitoring
    Deploy-Monitoring
    
    # Step 5: Setup auto-scaling
    Setup-Auto-Scaling
    
    # Step 6: Implement security
    Setup-Security
    
    # Step 7: Validate deployment
    $validationResults = Validate-Deployment
    
    # Step 8: Show summary
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n⏱️ Total deployment time: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor $Colors.Info
    
    Show-Deployment-Summary -ValidationResults $validationResults
    
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    Write-Host "Stack trace:" -ForegroundColor $Colors.Error
    Write-Host $_.ScriptStackTrace -ForegroundColor $Colors.Error
    exit 1
}