# MemorAI Enterprise Deployment Script (PowerShell)
# This script deploys the complete enterprise architecture

param(
    [string]$Environment = "production",
    [string]$AwsRegion = "us-east-1",
    [string]$DomainName = "",
    [string]$OpenAiApiKey = ""
)

# Configuration
$ProjectRoot = Split-Path -Parent -Path (Split-Path -Parent -Path $PSScriptRoot)
$ClusterName = "memorai-enterprise"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Info {
    param([string]$Message)
    Write-Host "${Blue}[INFO]${Reset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${Green}[SUCCESS]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check required tools
    $tools = @("terraform", "kubectl", "helm", "aws", "docker")
    foreach ($tool in $tools) {
        if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Error "$tool is not installed or not in PATH"
            exit 1
        }
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    } catch {
        Write-Error "AWS credentials not configured"
        exit 1
    }
    
    # Check Docker daemon
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker daemon not running"
        exit 1
    }
    
    Write-Success "All prerequisites met"
}

function New-Secrets {
    Write-Info "Generating secure secrets..."
    
    # Generate random passwords and tokens
    $DbPassword = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $RedisAuthToken = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $JwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
    $EncryptionKey = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $CbdApiKey = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    
    # Save to .env file
    $envContent = @"
# MemorAI Enterprise Environment Configuration
ENVIRONMENT=$Environment
AWS_REGION=$AwsRegion

# Database Configuration
DB_PASSWORD=$DbPassword
REDIS_AUTH_TOKEN=$RedisAuthToken

# Application Secrets
JWT_SECRET=$JwtSecret
ENCRYPTION_KEY=$EncryptionKey
CBD_API_KEY=$CbdApiKey

# OpenAI API Key
OPENAI_API_KEY=$OpenAiApiKey

# Domain Configuration (optional)
DOMAIN_NAME=$DomainName
"@
    
    $envFile = Join-Path $ProjectRoot ".env.production"
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    
    # Set environment variables for current session
    $env:DB_PASSWORD = $DbPassword
    $env:REDIS_AUTH_TOKEN = $RedisAuthToken
    $env:JWT_SECRET = $JwtSecret
    $env:ENCRYPTION_KEY = $EncryptionKey
    $env:CBD_API_KEY = $CbdApiKey
    $env:OPENAI_API_KEY = $OpenAiApiKey
    $env:DOMAIN_NAME = $DomainName
    
    Write-Success "Secrets generated and saved to .env.production"
    if ([string]::IsNullOrEmpty($OpenAiApiKey)) {
        Write-Warning "Please update OPENAI_API_KEY in .env.production with your actual API key"
    }
}

function Deploy-Infrastructure {
    Write-Info "Deploying AWS infrastructure with Terraform..."
    
    Push-Location (Join-Path $ProjectRoot "infrastructure\aws")
    
    try {
        # Initialize Terraform
        terraform init
        
        # Plan deployment
        Write-Info "Planning infrastructure deployment..."
        terraform plan `
            -var="environment=$Environment" `
            -var="aws_region=$AwsRegion" `
            -var="db_password=$env:DB_PASSWORD" `
            -var="redis_auth_token=$env:REDIS_AUTH_TOKEN" `
            -var="domain_name=$DomainName" `
            -out=tfplan
        
        # Apply deployment
        Write-Info "Applying infrastructure deployment..."
        terraform apply tfplan
        
        # Save outputs
        terraform output -json | Out-File -FilePath (Join-Path $ProjectRoot "terraform-outputs.json") -Encoding UTF8
        
        Write-Success "Infrastructure deployed successfully"
    }
    finally {
        Pop-Location
    }
}

function Set-KubernetesConfig {
    Write-Info "Configuring Kubernetes access..."
    
    # Update kubeconfig
    aws eks update-kubeconfig --region $AwsRegion --name $ClusterName
    
    # Verify connection
    kubectl cluster-info
    
    Write-Success "Kubernetes configured successfully"
}

function Install-CoreComponents {
    Write-Info "Installing core Kubernetes components..."
    
    # Add Helm repositories
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo add jetstack https://charts.jetstack.io
    helm repo add istio https://istio-release.storage.googleapis.com/charts
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Install cert-manager
    Write-Info "Installing cert-manager..."
    helm upgrade --install cert-manager jetstack/cert-manager `
        --namespace cert-manager `
        --create-namespace `
        --set installCRDs=true `
        --wait
    
    # Install Istio
    Write-Info "Installing Istio service mesh..."
    helm upgrade --install istio-base istio/base `
        --namespace istio-system `
        --create-namespace `
        --wait
    
    helm upgrade --install istiod istio/istiod `
        --namespace istio-system `
        --wait
    
    helm upgrade --install istio-gateway istio/gateway `
        --namespace istio-system `
        --wait
    
    # Install monitoring stack
    Write-Info "Installing monitoring stack..."
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack `
        --namespace monitoring `
        --create-namespace `
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi `
        --set grafana.adminPassword=admin123 `
        --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=10Gi `
        --wait
    
    Write-Success "Core components installed successfully"
}

function Build-AndPushImages {
    Write-Info "Building and pushing container images..."
    
    # Use Docker Hub for now (can be updated to use ECR)
    $registry = "codai"
    
    # Build CBD image
    Write-Info "Building CBD Enterprise image..."
    docker build -t "${registry}/cbd:latest" -f "$ProjectRoot\docker\enterprise\Dockerfile.cbd" $ProjectRoot
    docker push "${registry}/cbd:latest"
    
    # Build MemorAI MCP image
    Write-Info "Building MemorAI MCP Enterprise image..."
    docker build -t "${registry}/memorai-mcp:latest" -f "$ProjectRoot\docker\enterprise\Dockerfile.memorai-mcp" $ProjectRoot
    docker push "${registry}/memorai-mcp:latest"
    
    Write-Success "Container images built and pushed successfully"
}

function New-KubernetesSecrets {
    Write-Info "Creating Kubernetes secrets..."
    
    # Get database and Redis connection details from Terraform outputs
    $terraformOutputs = Get-Content (Join-Path $ProjectRoot "terraform-outputs.json") | ConvertFrom-Json
    $dbEndpoint = $terraformOutputs.rds_instance_endpoint.value
    $redisEndpoint = $terraformOutputs.elasticache_redis_primary_endpoint_address.value
    
    # Create namespaces
    kubectl apply -f "$ProjectRoot\k8s\base\namespaces.yaml"
    
    # Enable Istio injection
    kubectl label namespace memorai-system istio-injection=enabled --overwrite
    
    # Create secrets
    kubectl create secret generic memorai-secrets `
        --namespace=memorai-system `
        --from-literal="database-url=postgresql://memorai_admin:$($env:DB_PASSWORD)@$dbEndpoint/memorai" `
        --from-literal="redis-url=redis://:$($env:REDIS_AUTH_TOKEN)@$redisEndpoint:6379" `
        --from-literal="cbd-api-key=$($env:CBD_API_KEY)" `
        --from-literal="jwt-secret=$($env:JWT_SECRET)" `
        --from-literal="encryption-key=$($env:ENCRYPTION_KEY)" `
        --from-literal="openai-api-key=$($env:OPENAI_API_KEY)" `
        --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Success "Kubernetes secrets created successfully"
}

function Deploy-Applications {
    Write-Info "Deploying MemorAI applications..."
    
    # Create storage class for encrypted volumes
    $storageClassYaml = @"
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3-encrypted
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
  fsType: ext4
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
"@
    
    $storageClassYaml | kubectl apply -f -
    
    # Deploy CBD Vector Database
    Write-Info "Deploying CBD Vector Database..."
    kubectl apply -f "$ProjectRoot\k8s\services\cbd-vector-db.yaml"
    
    # Wait for CBD to be ready
    kubectl wait --for=condition=ready pod -l app=cbd-vector-db -n memorai-system --timeout=600s
    
    # Deploy MemorAI MCP Server
    Write-Info "Deploying MemorAI MCP Server..."
    kubectl apply -f "$ProjectRoot\k8s\services\memorai-mcp.yaml"
    
    # Wait for MemorAI to be ready
    kubectl wait --for=condition=available deployment/memorai-mcp -n memorai-system --timeout=300s
    
    Write-Success "Applications deployed successfully"
}

function Set-Ingress {
    Write-Info "Configuring ingress and load balancing..."
    
    $ingressYaml = @"
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: memorai-gateway
  namespace: memorai-system
spec:
  selector:
    istio: gateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: memorai-tls-secret
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: memorai-routes
  namespace: memorai-system
spec:
  hosts:
  - "*"
  gateways:
  - memorai-gateway
  http:
  - match:
    - uri:
        prefix: /api/v1/mcp
    route:
    - destination:
        host: memorai-mcp
        port:
          number: 8080
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  - match:
    - uri:
        prefix: /api/v1/vector
    route:
    - destination:
        host: cbd-vector-db-lb
        port:
          number: 4180
    timeout: 60s
  - match:
    - uri:
        prefix: /health
    route:
    - destination:
        host: memorai-mcp
        port:
          number: 8080
"@
    
    $ingressYaml | kubectl apply -f -
    
    Write-Success "Ingress configured successfully"
}

function Test-HealthChecks {
    Write-Info "Running comprehensive health checks..."
    
    # Check cluster status
    kubectl cluster-info
    kubectl get nodes
    
    # Check service status
    kubectl get all -n memorai-system
    kubectl get all -n monitoring
    kubectl get all -n istio-system
    
    # Test API endpoints
    Write-Info "Testing API endpoints..."
    $gatewayIp = kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    
    if ($gatewayIp -and $gatewayIp -ne "pending") {
        Write-Info "Gateway IP: $gatewayIp"
        
        # Test health endpoints
        try {
            $response = Invoke-WebRequest "http://$gatewayIp/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "Health endpoint accessible"
            }
        } catch {
            Write-Warning "Health endpoint not yet accessible"
        }
    } else {
        Write-Warning "Load balancer IP still pending"
    }
    
    Write-Success "Health checks completed"
}

function Show-AccessInfo {
    Write-Info "Deployment completed! Access information:"
    
    $gatewayIp = kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    $grafanaPassword = "admin123"
    
    Write-Host ""
    Write-Host "🚀 MemorAI Enterprise Deployment Complete!" -ForegroundColor Green
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "📊 Monitoring & Dashboards:"
    Write-Host "  Grafana: kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
    Write-Host "  Username: admin, Password: $grafanaPassword"
    Write-Host "  Prometheus: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"
    Write-Host ""
    Write-Host "🔗 API Endpoints:"
    if ($gatewayIp -and $gatewayIp -ne "pending") {
        Write-Host "  Gateway IP: $gatewayIp"
        Write-Host "  MemorAI MCP API: http://$gatewayIp/api/v1/mcp"
        Write-Host "  CBD Vector API: http://$gatewayIp/api/v1/vector"
        Write-Host "  Health Check: http://$gatewayIp/health"
    } else {
        Write-Host "  Gateway IP: pending (run 'kubectl get svc istio-gateway -n istio-system' to check)"
    }
    Write-Host ""
    Write-Host "🔧 Management Commands:"
    Write-Host "  View services: kubectl get all -n memorai-system"
    Write-Host "  View logs: kubectl logs -f deployment/memorai-mcp -n memorai-system"
    Write-Host "  Scale services: kubectl scale deployment memorai-mcp --replicas=10 -n memorai-system"
    Write-Host ""
    Write-Host "📖 Documentation:"
    Write-Host "  Architecture: $ProjectRoot\MEMORAI_ENTERPRISE_DEPLOYMENT_ARCHITECTURE.md"
    Write-Host "  Guide: $ProjectRoot\MEMORAI_ENTERPRISE_DEPLOYMENT_GUIDE.md"
    Write-Host ""
    
    if ([string]::IsNullOrEmpty($env:OPENAI_API_KEY)) {
        Write-Warning "Don't forget to set OPENAI_API_KEY in your environment!"
    }
}

function Remove-TempFiles {
    Write-Info "Cleaning up temporary files..."
    $tempFile = Join-Path $ProjectRoot "terraform-outputs.json"
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
}

# Main execution
function Main {
    Write-Info "Starting MemorAI Enterprise Deployment"
    Write-Info "Environment: $Environment"
    Write-Info "AWS Region: $AwsRegion"
    
    # Check if .env.production exists and load it
    $envFile = Join-Path $ProjectRoot ".env.production"
    if (Test-Path $envFile) {
        Write-Info "Loading environment from .env.production"
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
    
    try {
        # Execute deployment steps
        Test-Prerequisites
        
        # Generate secrets if not already done
        if (!(Test-Path $envFile)) {
            New-Secrets
            Write-Warning "Generated new secrets. Please review .env.production and re-run if needed."
            return
        }
        
        Deploy-Infrastructure
        Set-KubernetesConfig
        Install-CoreComponents
        Build-AndPushImages
        New-KubernetesSecrets
        Deploy-Applications
        Set-Ingress
        
        # Wait a bit for everything to settle
        Write-Info "Waiting for services to stabilize..."
        Start-Sleep -Seconds 30
        
        Test-HealthChecks
        Show-AccessInfo
        
        Write-Success "🎉 MemorAI Enterprise deployment completed successfully!"
    }
    finally {
        Remove-TempFiles
    }
}

# Run main function
Main
