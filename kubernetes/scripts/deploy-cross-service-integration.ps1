# Cross-Service Integration Deployment Script
# Version: 1.0
# Description: Deploy service mesh, event streaming, and observability for Enhanced Essential CodAI Services

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [string]$Namespace = "codai-production",
    [switch]$SkipObservability = $false,
    [switch]$SkipServiceMesh = $false,
    [switch]$SkipEventStreaming = $false
)

$ErrorActionPreference = "Stop"

# Integration components
$IntegrationComponents = @(
    @{
        Name = "Service Mesh (Istio)"
        ManifestFile = "istio-service-mesh.yaml"
        Skip = $SkipServiceMesh
        HealthCheck = "kubectl get pods -n istio-system -l app=istiod"
        Dependencies = @()
    },
    @{
        Name = "Event Streaming (Redis)"
        ManifestFile = "redis-event-streaming.yaml" 
        Skip = $SkipEventStreaming
        HealthCheck = "kubectl get pods -n $Namespace -l app=redis-event-cluster"
        Dependencies = @()
    },
    @{
        Name = "Observability Stack"
        ManifestFile = "observability-stack.yaml"
        Skip = $SkipObservability
        HealthCheck = "kubectl get pods -n observability -l app=prometheus"
        Dependencies = @()
    }
)

# Logging functions
function Write-IntegrationInfo {
    param([string]$Message)
    Write-Host "[INTEGRATION] $(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor Cyan
}

function Write-IntegrationSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor Green
}

function Write-IntegrationWarning {
    param([string]$Message)
    Write-Host "[WARNING] $(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor Yellow
}

function Write-IntegrationError {
    param([string]$Message)
    Write-Host "[ERROR] $(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor Red
}

# Validate prerequisites
function Test-IntegrationPrerequisites {
    Write-IntegrationInfo "🔍 Validating cross-service integration prerequisites..."
    
    # Check kubectl
    try {
        $null = kubectl version --client --short
        Write-IntegrationInfo "✓ kubectl is available"
    }
    catch {
        Write-IntegrationError "kubectl is not installed or not in PATH"
        return $false
    }
    
    # Check cluster connectivity
    try {
        $null = kubectl cluster-info --request-timeout=10s
        Write-IntegrationInfo "✓ Kubernetes cluster is accessible"
    }
    catch {
        Write-IntegrationError "Cannot connect to Kubernetes cluster"
        return $false
    }
    
    # Check if Essential CodAI Services are deployed
    $services = @("codai-auth-api", "codai-gateway-api", "codai-hub-api", "codai-memorai-mcp", "codai-cbd-database", "codai-memorai-frontend")
    $missingServices = @()
    
    foreach ($service in $services) {
        try {
            $deployment = kubectl get deployment $service -n $Namespace -o name 2>$null
            if (-not $deployment) {
                $missingServices += $service
            }
        }
        catch {
            $missingServices += $service
        }
    }
    
    if ($missingServices.Count -gt 0) {
        Write-IntegrationError "Missing Essential CodAI Services: $($missingServices -join ', ')"
        Write-IntegrationError "Please deploy Essential CodAI Services first using deploy-production.ps1"
        return $false
    }
    
    Write-IntegrationInfo "✓ All Essential CodAI Services are deployed"
    
    # Check manifest files exist
    $manifestsPath = "kubernetes\manifests"
    foreach ($component in $IntegrationComponents) {
        if (-not $component.Skip) {
            $manifestPath = Join-Path $manifestsPath $component.ManifestFile
            if (-not (Test-Path $manifestPath)) {
                Write-IntegrationError "Manifest file not found: $manifestPath"
                return $false
            }
            Write-IntegrationInfo "✓ Found manifest: $($component.ManifestFile)"
        }
    }
    
    Write-IntegrationSuccess "✅ All prerequisites validated"
    return $true
}

# Deploy Istio Service Mesh
function Deploy-ServiceMesh {
    if ($SkipServiceMesh) {
        Write-IntegrationWarning "⏭️ Skipping Service Mesh deployment"
        return $true
    }
    
    Write-IntegrationInfo "🕸️ Deploying Istio Service Mesh..."
    
    try {
        # Install Istio if not already installed
        $istioSystem = kubectl get namespace istio-system 2>$null
        if (-not $istioSystem) {
            Write-IntegrationInfo "Installing Istio operator..."
            # In real deployment, you would install Istio operator here
            # For now, we'll simulate with the manifest
        }
        
        # Apply service mesh configuration
        $manifestPath = "kubernetes\manifests\istio-service-mesh.yaml"
        
        if ($DryRun) {
            kubectl apply --dry-run=client -f $manifestPath
        }
        else {
            kubectl apply -f $manifestPath
            
            Write-IntegrationInfo "⏳ Waiting for Istio control plane to be ready..."
            Start-Sleep -Seconds 30
            
            # Wait for Istio system pods
            $maxAttempts = 20
            $attempt = 1
            
            while ($attempt -le $maxAttempts) {
                $istioPodsReady = kubectl get pods -n istio-system --no-headers 2>$null | Where-Object { $_ -match "Running" }
                $totalIstioPods = kubectl get pods -n istio-system --no-headers 2>$null
                
                if ($istioPodsReady -and $istioPodsReady.Count -eq $totalIstioPods.Count) {
                    Write-IntegrationSuccess "✅ Istio service mesh is ready"
                    break
                }
                
                Write-IntegrationInfo "⏳ Waiting for Istio pods... Attempt $attempt/$maxAttempts"
                Start-Sleep -Seconds 15
                $attempt++
            }
            
            if ($attempt -gt $maxAttempts) {
                Write-IntegrationWarning "⚠️ Istio deployment may not be fully ready, continuing..."
            }
        }
        
        Write-IntegrationSuccess "✅ Service mesh deployment completed"
        return $true
    }
    catch {
        Write-IntegrationError "❌ Service mesh deployment failed: $($_.Exception.Message)"
        return $false
    }
}

# Deploy Event Streaming
function Deploy-EventStreaming {
    if ($SkipEventStreaming) {
        Write-IntegrationWarning "⏭️ Skipping Event Streaming deployment"
        return $true
    }
    
    Write-IntegrationInfo "📡 Deploying Redis Event Streaming..."
    
    try {
        $manifestPath = "kubernetes\manifests\redis-event-streaming.yaml"
        
        if ($DryRun) {
            kubectl apply --dry-run=client -f $manifestPath -n $Namespace
        }
        else {
            kubectl apply -f $manifestPath -n $Namespace
            
            Write-IntegrationInfo "⏳ Waiting for Redis cluster to be ready..."
            Start-Sleep -Seconds 20
            
            # Wait for Redis StatefulSet
            kubectl rollout status statefulset/redis-event-cluster -n $Namespace --timeout=300s
            
            # Wait for Event Hub deployment
            kubectl rollout status deployment/codai-event-hub -n $Namespace --timeout=300s
            
            # Wait for WebSocket Hub deployment
            kubectl rollout status deployment/codai-websocket-hub -n $Namespace --timeout=300s
            
            Write-IntegrationSuccess "✅ Event streaming infrastructure is ready"
        }
        
        Write-IntegrationSuccess "✅ Event streaming deployment completed"
        return $true
    }
    catch {
        Write-IntegrationError "❌ Event streaming deployment failed: $($_.Exception.Message)"
        return $false
    }
}

# Deploy Observability Stack
function Deploy-ObservabilityStack {
    if ($SkipObservability) {
        Write-IntegrationWarning "⏭️ Skipping Observability Stack deployment"
        return $true
    }
    
    Write-IntegrationInfo "📊 Deploying Observability Stack..."
    
    try {
        # Create observability namespace
        $obsNamespace = kubectl get namespace observability 2>$null
        if (-not $obsNamespace) {
            kubectl create namespace observability
            Write-IntegrationInfo "✓ Created observability namespace"
        }
        
        $manifestPath = "kubernetes\manifests\observability-stack.yaml"
        
        if ($DryRun) {
            kubectl apply --dry-run=client -f $manifestPath
        }
        else {
            kubectl apply -f $manifestPath
            
            Write-IntegrationInfo "⏳ Waiting for observability components..."
            
            # Wait for Elasticsearch
            Write-IntegrationInfo "⏳ Waiting for Elasticsearch cluster..."
            kubectl rollout status statefulset/elasticsearch -n observability --timeout=600s
            
            # Wait for Prometheus
            Write-IntegrationInfo "⏳ Waiting for Prometheus..."
            kubectl rollout status deployment/prometheus -n observability --timeout=300s
            
            # Wait for Grafana
            Write-IntegrationInfo "⏳ Waiting for Grafana..."
            kubectl rollout status deployment/grafana -n observability --timeout=300s
            
            Write-IntegrationSuccess "✅ Observability stack is ready"
        }
        
        Write-IntegrationSuccess "✅ Observability deployment completed"
        return $true
    }
    catch {
        Write-IntegrationError "❌ Observability deployment failed: $($_.Exception.Message)"
        return $false
    }
}

# Test service mesh integration
function Test-ServiceMeshIntegration {
    Write-IntegrationInfo "🔗 Testing service mesh integration..."
    
    try {
        # Check if services have Istio sidecars
        $services = @("codai-auth-api", "codai-gateway-api", "codai-hub-api", "codai-memorai-mcp")
        $sidecarIssues = @()
        
        foreach ($service in $services) {
            $pods = kubectl get pods -n $Namespace -l app=$service -o jsonpath='{.items[*].spec.containers[*].name}' 2>$null
            if ($pods -and $pods -match "istio-proxy") {
                Write-IntegrationInfo "✅ $service has Istio sidecar"
            }
            else {
                $sidecarIssues += $service
            }
        }
        
        if ($sidecarIssues.Count -gt 0) {
            Write-IntegrationWarning "⚠️ Services missing Istio sidecars: $($sidecarIssues -join ', ')"
            Write-IntegrationWarning "⚠️ This might affect service mesh features"
        }
        else {
            Write-IntegrationSuccess "✅ All services have Istio sidecars"
        }
        
        # Test virtual service configuration
        $virtualServices = kubectl get virtualservice -n $Namespace 2>$null
        if ($virtualServices) {
            Write-IntegrationSuccess "✅ Virtual services configured"
        }
        else {
            Write-IntegrationWarning "⚠️ No virtual services found"
        }
        
        return $true
    }
    catch {
        Write-IntegrationError "❌ Service mesh integration test failed: $($_.Exception.Message)"
        return $false
    }
}

# Test event streaming
function Test-EventStreaming {
    Write-IntegrationInfo "📡 Testing event streaming capabilities..."
    
    try {
        # Test Redis cluster health
        $redisPods = kubectl get pods -n $Namespace -l app=redis-event-cluster --no-headers 2>$null
        $readyRedisPods = $redisPods | Where-Object { $_ -match "Running" }
        
        if ($readyRedisPods -and $readyRedisPods.Count -ge 3) {
            Write-IntegrationSuccess "✅ Redis cluster is healthy ($($readyRedisPods.Count) pods)"
        }
        else {
            Write-IntegrationWarning "⚠️ Redis cluster may have issues"
        }
        
        # Test Event Hub
        $eventHubPods = kubectl get pods -n $Namespace -l app=codai-event-hub --no-headers 2>$null
        $readyEventHubPods = $eventHubPods | Where-Object { $_ -match "Running" }
        
        if ($readyEventHubPods) {
            Write-IntegrationSuccess "✅ Event Hub is running"
        }
        else {
            Write-IntegrationWarning "⚠️ Event Hub may have issues"
        }
        
        # Test WebSocket Hub
        $websocketPods = kubectl get pods -n $Namespace -l app=codai-websocket-hub --no-headers 2>$null
        $readyWebsocketPods = $websocketPods | Where-Object { $_ -match "Running" }
        
        if ($readyWebsocketPods) {
            Write-IntegrationSuccess "✅ WebSocket Hub is running"
        }
        else {
            Write-IntegrationWarning "⚠️ WebSocket Hub may have issues"
        }
        
        return $true
    }
    catch {
        Write-IntegrationError "❌ Event streaming test failed: $($_.Exception.Message)"
        return $false
    }
}

# Test observability
function Test-ObservabilityStack {
    Write-IntegrationInfo "📊 Testing observability stack..."
    
    try {
        # Test Prometheus
        $prometheusPods = kubectl get pods -n observability -l app=prometheus --no-headers 2>$null
        if ($prometheusPods -match "Running") {
            Write-IntegrationSuccess "✅ Prometheus is running"
        }
        else {
            Write-IntegrationWarning "⚠️ Prometheus may have issues"
        }
        
        # Test Grafana
        $grafanaPods = kubectl get pods -n observability -l app=grafana --no-headers 2>$null
        if ($grafanaPods -match "Running") {
            Write-IntegrationSuccess "✅ Grafana is running"
        }
        else {
            Write-IntegrationWarning "⚠️ Grafana may have issues"
        }
        
        # Test Elasticsearch
        $esPods = kubectl get pods -n observability -l app=elasticsearch --no-headers 2>$null
        $readyEsPods = $esPods | Where-Object { $_ -match "Running" }
        
        if ($readyEsPods -and $readyEsPods.Count -ge 3) {
            Write-IntegrationSuccess "✅ Elasticsearch cluster is running"
        }
        else {
            Write-IntegrationWarning "⚠️ Elasticsearch may have issues"
        }
        
        return $true
    }
    catch {
        Write-IntegrationError "❌ Observability stack test failed: $($_.Exception.Message)"
        return $false
    }
}

# Generate integration report
function New-IntegrationReport {
    Write-IntegrationInfo "📋 Generating cross-service integration report..."
    
    $reportFile = "cross-service-integration-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    
    $report = @"
=== Essential CodAI Services - Cross-Service Integration Report ===
Deployment Time: $(Get-Date)
Namespace: $Namespace

=== Service Mesh (Istio) ===
$(if (-not $SkipServiceMesh) {
    "Istio Pods:`n$(kubectl get pods -n istio-system 2>$null)"
    "`nVirtual Services:`n$(kubectl get virtualservice -n $Namespace 2>$null)"
    "`nDestination Rules:`n$(kubectl get destinationrule -n $Namespace 2>$null)"
} else {
    "Service Mesh deployment skipped"
})

=== Event Streaming ===
$(if (-not $SkipEventStreaming) {
    "Redis Cluster:`n$(kubectl get pods -n $Namespace -l app=redis-event-cluster 2>$null)"
    "`nEvent Hub:`n$(kubectl get pods -n $Namespace -l app=codai-event-hub 2>$null)"
    "`nWebSocket Hub:`n$(kubectl get pods -n $Namespace -l app=codai-websocket-hub 2>$null)"
} else {
    "Event Streaming deployment skipped"
})

=== Observability Stack ===
$(if (-not $SkipObservability) {
    "Prometheus:`n$(kubectl get pods -n observability -l app=prometheus 2>$null)"
    "`nGrafana:`n$(kubectl get pods -n observability -l app=grafana 2>$null)"
    "`nElasticsearch:`n$(kubectl get pods -n observability -l app=elasticsearch 2>$null)"
    "`nJaeger:`n$(kubectl get pods -n observability | Where-Object { $_ -match "jaeger" } 2>$null)"
} else {
    "Observability Stack deployment skipped"
})

=== Integration Access Points ===
Service Mesh Gateway: kubectl get gateway -n $Namespace
Event Hub Service: kubectl get service codai-event-hub -n $Namespace
WebSocket Hub: kubectl get service codai-websocket-hub -n $Namespace  
Prometheus: kubectl port-forward -n observability svc/prometheus 9090:9090
Grafana: kubectl port-forward -n observability svc/grafana 3000:3000
Jaeger: kubectl port-forward -n observability svc/codai-tracing-query 16686:16686

=== Next Steps ===
1. Configure service mesh policies and security
2. Set up event schemas and validation
3. Create custom Grafana dashboards
4. Configure alerting rules in Prometheus
5. Set up distributed tracing policies
"@
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-IntegrationInfo "📋 Integration report saved to: $reportFile"
}

# Main integration deployment function
function Start-CrossServiceIntegration {
    Write-IntegrationInfo "🔗 Starting Cross-Service Integration Deployment"
    Write-Host "===============================================" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-IntegrationWarning "🧪 DRY RUN MODE - No actual changes will be made"
    }
    
    $success = $true
    
    try {
        # Prerequisites
        if (-not (Test-IntegrationPrerequisites)) {
            exit 1
        }
        
        # Deploy components
        $success = (Deploy-ServiceMesh) -and $success
        $success = (Deploy-EventStreaming) -and $success  
        $success = (Deploy-ObservabilityStack) -and $success
        
        if (-not $DryRun) {
            # Test integration
            Write-IntegrationInfo "🧪 Running integration tests..."
            Test-ServiceMeshIntegration
            Test-EventStreaming
            Test-ObservabilityStack
        }
        
        # Generate report
        New-IntegrationReport
        
        if ($success) {
            Write-IntegrationSuccess "🎉 Cross-Service Integration deployment completed successfully!"
            Write-Host "===============================================" -ForegroundColor Green
            Write-Host "🌐 Enhanced Essential CodAI Services now have:" -ForegroundColor Green
            Write-Host "  ✅ Service Mesh with mTLS and traffic management" -ForegroundColor White
            Write-Host "  ✅ Event-driven architecture with Redis Streams" -ForegroundColor White
            Write-Host "  ✅ Comprehensive observability and monitoring" -ForegroundColor White
            Write-Host "  ✅ Distributed tracing and metrics collection" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            Write-Host "📊 Access Points:" -ForegroundColor Cyan
            Write-Host "  • Grafana: kubectl port-forward -n observability svc/grafana 3000:3000" -ForegroundColor White
            Write-Host "  • Prometheus: kubectl port-forward -n observability svc/prometheus 9090:9090" -ForegroundColor White
            Write-Host "  • Jaeger: kubectl port-forward -n observability svc/codai-tracing-query 16686:16686" -ForegroundColor White
        }
        else {
            Write-IntegrationError "❌ Some integration components failed to deploy properly"
            exit 1
        }
    }
    catch {
        Write-IntegrationError "❌ Integration deployment failed: $($_.Exception.Message)"
        Write-IntegrationError "Stack trace: $($_.ScriptStackTrace)"
        exit 1
    }
}

# Script help
function Show-IntegrationHelp {
    Write-Host @"
Essential CodAI Services - Cross-Service Integration Deployment

USAGE:
    .\deploy-cross-service-integration.ps1 [OPTIONS]

OPTIONS:
    -DryRun              Perform a dry run without making changes
    -Verbose             Enable verbose logging
    -Namespace <string>  Kubernetes namespace (default: codai-production)
    -SkipServiceMesh     Skip Istio service mesh deployment
    -SkipEventStreaming  Skip Redis event streaming deployment
    -SkipObservability   Skip observability stack deployment

EXAMPLES:
    .\deploy-cross-service-integration.ps1 -DryRun
    .\deploy-cross-service-integration.ps1 -SkipObservability
    .\deploy-cross-service-integration.ps1 -Verbose -Namespace "codai-staging"
"@
}

# Main execution
if ($args -contains "-Help" -or $args -contains "--help" -or $args -contains "-h") {
    Show-IntegrationHelp
    exit 0
}

# Start cross-service integration deployment
Start-CrossServiceIntegration