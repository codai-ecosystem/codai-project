# ROMAI Ultimate MCP Server - Blue-Green Deployment Script
# Zero-downtime production deployment with automated rollback

# Configuration
$NAMESPACE = "romai-production"
$APP_NAME = "romai-mcp"
$IMAGE_REGISTRY = "ghcr.io/romai"
$IMAGE_NAME = "ultimate-mcp-server"
$HEALTH_CHECK_TIMEOUT = 300
$SMOKE_TEST_TIMEOUT = 120

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-KubernetesConnection {
    Write-Status "🔧 Testing Kubernetes connection..." $Blue
    
    try {
        $context = kubectl config current-context 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "No Kubernetes context configured"
        }
        
        $namespaceExists = kubectl get namespace $NAMESPACE 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Status "📦 Creating namespace $NAMESPACE..." $Yellow
            kubectl create namespace $NAMESPACE
        }
        
        Write-Status "✅ Kubernetes connection verified (Context: $context)" $Green
        return $true
    } catch {
        Write-Status "❌ Kubernetes connection failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Get-CurrentEnvironment {
    Write-Status "🔍 Detecting current active environment..." $Blue
    
    try {
        $service = kubectl get service $APP_NAME-service -n $NAMESPACE -o json 2>$null | ConvertFrom-Json
        if ($LASTEXITCODE -eq 0) {
            $currentSelector = $service.spec.selector.version
            Write-Status "📍 Current active environment: $currentSelector" $Cyan
            return $currentSelector
        } else {
            Write-Status "📍 No existing deployment found, will deploy to blue environment" $Yellow
            return "green"  # Will deploy to blue as first deployment
        }
    } catch {
        Write-Status "📍 Cannot detect current environment, defaulting to green" $Yellow
        return "green"
    }
}

function Get-TargetEnvironment {
    param([string]$CurrentEnv)
    
    if ($CurrentEnv -eq "blue") {
        return "green"
    } else {
        return "blue"
    }
}

function Deploy-ToEnvironment {
    param(
        [string]$Environment,
        [string]$ImageTag,
        [string]$CurrentEnvironment
    )
    
    Write-Status "🚀 Deploying to $Environment environment..." $Blue
    Write-Status "📦 Image: $IMAGE_REGISTRY/${IMAGE_NAME}:$ImageTag" $Cyan
    
    # Create deployment manifest
    $deploymentManifest = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $APP_NAME-$Environment
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
    version: $Environment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: $APP_NAME
      version: $Environment
  template:
    metadata:
      labels:
        app: $APP_NAME
        version: $Environment
    spec:
      containers:
      - name: $APP_NAME
        image: $IMAGE_REGISTRY/${IMAGE_NAME}:$ImageTag
        ports:
        - containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: VERSION
          value: "$Environment"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 12
      imagePullSecrets:
      - name: ghcr-secret
---
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME-$Environment-service
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
    version: $Environment
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: $APP_NAME
    version: $Environment
"@

    # Apply deployment
    try {
        $deploymentManifest | kubectl apply -f - 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to apply deployment manifest"
        }
        
        Write-Status "📋 Deployment manifest applied successfully" $Green
        
        # Wait for rollout to complete
        Write-Status "⏳ Waiting for deployment rollout..." $Yellow
        kubectl rollout status deployment/$APP_NAME-$Environment -n $NAMESPACE --timeout=${HEALTH_CHECK_TIMEOUT}s
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✅ Deployment rollout completed successfully" $Green
            return $true
        } else {
            throw "Deployment rollout failed or timed out"
        }
    } catch {
        Write-Status "❌ Deployment failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Test-EnvironmentHealth {
    param([string]$Environment)
    
    Write-Status "🏥 Running health checks for $Environment environment..." $Blue
    
    try {
        # Get service endpoint
        $serviceIP = kubectl get service $APP_NAME-$Environment-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>$null
        
        if (-not $serviceIP) {
            throw "Cannot get service IP for $Environment environment"
        }
        
        Write-Status "🔗 Service IP: $serviceIP" $Cyan
        
        # Health check with kubectl port-forward
        $portForwardJob = Start-Job -ScriptBlock {
            param($Namespace, $AppName, $Environment)
            kubectl port-forward -n $Namespace service/$AppName-$Environment-service 8080:80
        } -ArgumentList $NAMESPACE, $APP_NAME, $Environment
        
        Start-Sleep -Seconds 5
        
        # Test health endpoint
        $healthCheckPassed = $false
        $attempts = 0
        $maxAttempts = 10
        
        while (-not $healthCheckPassed -and $attempts -lt $maxAttempts) {
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 10
                if ($response.status -eq "ok") {
                    $healthCheckPassed = $true
                    Write-Status "✅ Health check passed" $Green
                } else {
                    Write-Status "⚠️  Health check returned unexpected status: $($response.status)" $Yellow
                }
            } catch {
                $attempts++
                Write-Status "🔄 Health check attempt $attempts/$maxAttempts failed, retrying..." $Yellow
                Start-Sleep -Seconds 10
            }
        }
        
        # Clean up port-forward
        Stop-Job -Job $portForwardJob -PassThru | Remove-Job
        
        if (-not $healthCheckPassed) {
            throw "Health checks failed after $maxAttempts attempts"
        }
        
        return $true
    } catch {
        Write-Status "❌ Health check failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Run-SmokeTests {
    param([string]$Environment)
    
    Write-Status "🧪 Running smoke tests for $Environment environment..." $Blue
    
    try {
        # Port-forward for testing
        $portForwardJob = Start-Job -ScriptBlock {
            param($Namespace, $AppName, $Environment)
            kubectl port-forward -n $Namespace service/$AppName-$Environment-service 8081:80
        } -ArgumentList $NAMESPACE, $APP_NAME, $Environment
        
        Start-Sleep -Seconds 5
        
        # Test 1: Health endpoint
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8081/health" -Method Get -TimeoutSec 10
        if ($healthResponse.status -ne "ok") {
            throw "Health endpoint test failed"
        }
        Write-Status "✅ Health endpoint test passed" $Green
        
        # Test 2: MCP tools endpoint
        $toolsResponse = Invoke-RestMethod -Uri "http://localhost:8081/mcp/tools" -Method Get -TimeoutSec 15
        if (-not $toolsResponse -or $toolsResponse.Count -eq 0) {
            throw "MCP tools endpoint test failed"
        }
        Write-Status "✅ MCP tools endpoint test passed" $Green
        
        # Test 3: MCP health check call
        $mcpHealthPayload = @{
            tool = "romai_health_check"
            arguments = @{}
        } | ConvertTo-Json
        
        $mcpResponse = Invoke-RestMethod -Uri "http://localhost:8081/mcp/call" -Method Post -Body $mcpHealthPayload -ContentType "application/json" -TimeoutSec 20
        if (-not $mcpResponse.success) {
            throw "MCP health check call failed"
        }
        Write-Status "✅ MCP health check call test passed" $Green
        
        # Clean up port-forward
        Stop-Job -Job $portForwardJob -PassThru | Remove-Job
        
        Write-Status "✅ All smoke tests passed" $Green
        return $true
    } catch {
        Write-Status "❌ Smoke tests failed: $($_.Exception.Message)" $Red
        # Clean up port-forward
        try { Stop-Job -Job $portForwardJob -PassThru | Remove-Job } catch {}
        return $false
    }
}

function Switch-Traffic {
    param([string]$TargetEnvironment)
    
    Write-Status "🔄 Switching traffic to $TargetEnvironment environment..." $Blue
    
    # Create or update main service
    $serviceManifest = @"
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME-service
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: $APP_NAME
    version: $TargetEnvironment
"@

    try {
        $serviceManifest | kubectl apply -f - 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to update main service"
        }
        
        Write-Status "✅ Traffic switched to $TargetEnvironment environment" $Green
        return $true
    } catch {
        Write-Status "❌ Traffic switch failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Cleanup-OldEnvironment {
    param([string]$OldEnvironment)
    
    Write-Status "🧹 Cleaning up $OldEnvironment environment..." $Blue
    
    try {
        # Scale down old deployment
        kubectl scale deployment $APP_NAME-$OldEnvironment -n $NAMESPACE --replicas=0 2>$null
        
        # Wait a bit for graceful shutdown
        Start-Sleep -Seconds 30
        
        # Delete old deployment and service
        kubectl delete deployment $APP_NAME-$OldEnvironment -n $NAMESPACE --ignore-not-found=true 2>$null
        kubectl delete service $APP_NAME-$OldEnvironment-service -n $NAMESPACE --ignore-not-found=true 2>$null
        
        Write-Status "✅ Cleanup completed" $Green
        return $true
    } catch {
        Write-Status "⚠️  Cleanup encountered issues: $($_.Exception.Message)" $Yellow
        return $false
    }
}

function Rollback-Deployment {
    param([string]$CurrentEnvironment)
    
    Write-Status "🚨 Rolling back to $CurrentEnvironment environment..." $Red
    
    try {
        # Switch traffic back
        Switch-Traffic -TargetEnvironment $CurrentEnvironment
        Write-Status "✅ Rollback completed" $Green
        return $true
    } catch {
        Write-Status "❌ Rollback failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Generate-DeploymentReport {
    param(
        [string]$Environment,
        [string]$ImageTag,
        [bool]$Success,
        [string]$StartTime,
        [string]$EndTime
    )
    
    $duration = [datetime]::Parse($EndTime) - [datetime]::Parse($StartTime)
    
    $report = @{
        timestamp = $EndTime
        deployment = @{
            environment = $Environment
            imageTag = $ImageTag
            success = $Success
            duration = $duration.TotalSeconds
        }
        startTime = $StartTime
        endTime = $EndTime
    }
    
    $reportJson = $report | ConvertTo-Json -Depth 3
    $reportPath = "blue-green-deployment-report.json"
    $reportJson | Out-File -FilePath $reportPath -Encoding UTF8
    
    Write-Status "📊 Deployment Report" $Cyan
    Write-Status "===================" $Cyan
    Write-Status "🎯 Environment: $Environment" $White
    Write-Status "🏷️  Image Tag: $ImageTag" $White
    Write-Status "✅ Success: $Success" $(if ($Success) { $Green } else { $Red })
    Write-Status "⏱️  Duration: $([math]::Round($duration.TotalSeconds, 1)) seconds" $White
    Write-Status "📄 Report saved to: $reportPath" $Blue
}

# Main deployment function
function Start-BlueGreenDeployment {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ImageTag
    )
    
    $startTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Status "🚀 ROMAI Ultimate MCP Server - Blue-Green Deployment" $Cyan
    Write-Status "=================================================" $Cyan
    Write-Status "📦 Image Tag: $ImageTag" $Blue
    Write-Status "🕐 Start Time: $startTime" $Blue
    
    try {
        # Step 1: Verify Kubernetes connection
        if (-not (Test-KubernetesConnection)) {
            throw "Kubernetes connection failed"
        }
        
        # Step 2: Detect current environment
        $currentEnvironment = Get-CurrentEnvironment
        $targetEnvironment = Get-TargetEnvironment -CurrentEnv $currentEnvironment
        
        Write-Status "🔄 Current Environment: $currentEnvironment" $Cyan
        Write-Status "🎯 Target Environment: $targetEnvironment" $Cyan
        
        # Step 3: Deploy to target environment
        if (-not (Deploy-ToEnvironment -Environment $targetEnvironment -ImageTag $ImageTag -CurrentEnvironment $currentEnvironment)) {
            throw "Deployment to $targetEnvironment failed"
        }
        
        # Step 4: Health checks
        if (-not (Test-EnvironmentHealth -Environment $targetEnvironment)) {
            throw "Health checks failed for $targetEnvironment"
        }
        
        # Step 5: Smoke tests
        if (-not (Run-SmokeTests -Environment $targetEnvironment)) {
            throw "Smoke tests failed for $targetEnvironment"
        }
        
        # Step 6: Switch traffic
        if (-not (Switch-Traffic -TargetEnvironment $targetEnvironment)) {
            throw "Traffic switch to $targetEnvironment failed"
        }
        
        # Step 7: Cleanup old environment (after successful traffic switch)
        Start-Sleep -Seconds 60  # Wait for traffic to stabilize
        Cleanup-OldEnvironment -OldEnvironment $currentEnvironment
        
        $endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Generate-DeploymentReport -Environment $targetEnvironment -ImageTag $ImageTag -Success $true -StartTime $startTime -EndTime $endTime
        
        Write-Status "🎉 Blue-Green Deployment Completed Successfully!" $Green
        Write-Status "✅ Application is now running on $targetEnvironment environment" $Green
        
    } catch {
        $endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Status "❌ Deployment failed: $($_.Exception.Message)" $Red
        
        # Attempt rollback
        Write-Status "🚨 Attempting rollback..." $Yellow
        Rollback-Deployment -CurrentEnvironment $currentEnvironment
        
        Generate-DeploymentReport -Environment $targetEnvironment -ImageTag $ImageTag -Success $false -StartTime $startTime -EndTime $endTime
        
        Write-Status "❌ Blue-Green Deployment Failed!" $Red
        exit 1
    }
}

# Script execution
if ($args.Count -eq 0) {
    Write-Status "❌ Usage: .\blue-green-deploy.ps1 <image-tag>" $Red
    Write-Status "Example: .\blue-green-deploy.ps1 v1.2.3" $Yellow
    exit 1
}

$imageTag = $args[0]
Start-BlueGreenDeployment -ImageTag $imageTag
