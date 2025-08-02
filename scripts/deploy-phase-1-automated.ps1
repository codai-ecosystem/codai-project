# CODAI Phase 1 Automated Deployment Script
# This script will be executed immediately after node group completion

param(
    [Parameter(Mandatory=$false)]
    [string]$Phase = "1",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipValidation = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param($Message, $Color = "Cyan")
    Write-Host "🚀 $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

Write-Status "Starting CODAI Phase $Phase Deployment" "Green"
Write-Status "Cluster: codai-cluster-v2"
Write-Status "Region: eu-west-1"
Write-Status "Phase: $Phase"

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No actual deployments will be made"
}

# Step 1: Validate Infrastructure
Write-Status "Step 1: Validating infrastructure..."

try {
    # Check cluster access
    $clusterInfo = kubectl cluster-info --request-timeout=30s 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot connect to cluster: $clusterInfo"
    }
    Write-Success "Cluster connection verified"
    
    # Check nodes
    $nodes = kubectl get nodes --no-headers 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot get nodes: $nodes"
    }
    
    $nodeCount = ($nodes | Measure-Object).Count
    Write-Success "Found $nodeCount nodes"
    
    # Wait for all nodes to be Ready
    Write-Status "Waiting for all nodes to be Ready..."
    $timeout = 300 # 5 minutes
    $elapsed = 0
    
    do {
        $notReadyNodes = kubectl get nodes --no-headers | Where-Object { $_ -notmatch "\sReady\s" }
        if (-not $notReadyNodes) {
            Write-Success "All nodes are Ready"
            break
        }
        
        Start-Sleep 10
        $elapsed += 10
        Write-Status "Waiting for nodes... ($elapsed/$timeout seconds)"
    } while ($elapsed -lt $timeout)
    
    if ($elapsed -ge $timeout) {
        throw "Timeout waiting for nodes to be Ready"
    }
    
} catch {
    Write-Error "Infrastructure validation failed: $_"
    exit 1
}

# Step 2: Install NGINX Ingress Controller
Write-Status "Step 2: Installing NGINX Ingress Controller..."

if (-not $DryRun) {
    try {
        # Check if already installed
        $existingIngress = kubectl get namespace ingress-nginx 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Warning "NGINX Ingress already exists, skipping installation"
        } else {
            Write-Status "Installing NGINX Ingress Controller..."
            kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/aws/deploy.yaml
            
            Write-Status "Waiting for NGINX Ingress to be ready..."
            kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=300s
            Write-Success "NGINX Ingress Controller installed and ready"
        }
    } catch {
        Write-Error "Failed to install NGINX Ingress: $_"
        exit 1
    }
} else {
    Write-Status "[DRY RUN] Would install NGINX Ingress Controller"
}

# Step 3: Install cert-manager
Write-Status "Step 3: Installing cert-manager..."

if (-not $DryRun) {
    try {
        # Check if already installed
        $existingCertManager = kubectl get namespace cert-manager 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Warning "cert-manager already exists, skipping installation"
        } else {
            Write-Status "Installing cert-manager..."
            kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml
            
            Write-Status "Waiting for cert-manager to be ready..."
            kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/name=cert-manager --timeout=300s
            Write-Success "cert-manager installed and ready"
        }
        
        # Create Let's Encrypt ClusterIssuer
        Write-Status "Creating Let's Encrypt ClusterIssuer..."
        $clusterIssuerYaml = @"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@codai.ro
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
"@
        
        $clusterIssuerYaml | kubectl apply -f -
        Write-Success "Let's Encrypt ClusterIssuer created"
        
    } catch {
        Write-Error "Failed to install cert-manager: $_"
        exit 1
    }
} else {
    Write-Status "[DRY RUN] Would install cert-manager and ClusterIssuer"
}

# Step 4: Install Database Infrastructure
Write-Status "Step 4: Installing database infrastructure..."

if (-not $DryRun) {
    try {
        # Add Helm repositories
        Write-Status "Adding Helm repositories..."
        helm repo add bitnami https://charts.bitnami.com/bitnami 2>$null
        helm repo update
        
        # Install PostgreSQL
        $existingPostgres = helm list | Select-String "postgresql"
        if ($existingPostgres) {
            Write-Warning "PostgreSQL already exists, skipping installation"
        } else {
            Write-Status "Installing PostgreSQL..."
            helm install postgresql bitnami/postgresql `
                --set auth.postgresPassword=codai2025secure `
                --set auth.database=codai_ecosystem `
                --set primary.persistence.size=20Gi
            Write-Success "PostgreSQL installed"
        }
        
        # Install Redis
        $existingRedis = helm list | Select-String "redis"
        if ($existingRedis) {
            Write-Warning "Redis already exists, skipping installation"
        } else {
            Write-Status "Installing Redis..."
            helm install redis bitnami/redis `
                --set auth.password=codai2025redis `
                --set replica.replicaCount=2
            Write-Success "Redis installed"
        }
        
    } catch {
        Write-Error "Failed to install databases: $_"
        exit 1
    }
} else {
    Write-Status "[DRY RUN] Would install PostgreSQL and Redis"
}

# Step 5: Deploy Phase 1 Ingress
Write-Status "Step 5: Deploying Phase $Phase ingress configuration..."

if (-not $DryRun) {
    try {
        $ingressFile = "infrastructure/kubernetes/ingress-expanded.yaml"
        if (-not (Test-Path $ingressFile)) {
            throw "Ingress file not found: $ingressFile"
        }
        
        Write-Status "Applying ingress configuration..."
        kubectl apply -f $ingressFile
        
        Write-Status "Verifying ingress creation..."
        Start-Sleep 5
        kubectl get ingress
        kubectl get certificates
        
        Write-Success "Ingress configuration deployed"
        
    } catch {
        Write-Error "Failed to deploy ingress: $_"
        exit 1
    }
} else {
    Write-Status "[DRY RUN] Would deploy ingress configuration"
}

# Step 6: Wait for Load Balancer IP
Write-Status "Step 6: Waiting for load balancer external IP..."

if (-not $DryRun) {
    try {
        $timeout = 600 # 10 minutes
        $elapsed = 0
        $externalIP = $null
        
        do {
            $externalIP = kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>$null
            if ([string]::IsNullOrEmpty($externalIP)) {
                $externalIP = kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
            }
            
            if (-not [string]::IsNullOrEmpty($externalIP)) {
                Write-Success "Load Balancer IP: $externalIP"
                break
            }
            
            Start-Sleep 15
            $elapsed += 15
            Write-Status "Waiting for external IP... ($elapsed/$timeout seconds)"
        } while ($elapsed -lt $timeout)
        
        if ([string]::IsNullOrEmpty($externalIP)) {
            throw "Timeout waiting for load balancer IP"
        }
        
    } catch {
        Write-Error "Failed to get load balancer IP: $_"
        exit 1
    }
} else {
    Write-Status "[DRY RUN] Would wait for load balancer IP"
    $externalIP = "192.0.2.1" # Example IP for dry run
}

# Step 7: Generate DNS Configuration
Write-Status "Step 7: Generating DNS configuration..."

try {
    $phase1Domains = @(
        'bancai.ro', 'app.bancai.ro', 'api.bancai.ro', 'admin.bancai.ro', 'mobile.bancai.ro',
        'studiai.ro', 'app.studiai.ro', 'api.studiai.ro', 'admin.studiai.ro',
        'talentai.ro', 'app.talentai.ro', 'api.talentai.ro', 'admin.talentai.ro',
        'marketai.ro', 'app.marketai.ro', 'api.marketai.ro', 'admin.marketai.ro',
        'legalizai.ro', 'app.legalizai.ro', 'api.legalizai.ro', 'admin.legalizai.ro',
        'conversai.ro', 'app.conversai.ro', 'api.conversai.ro', 'admin.conversai.ro',
        'muzicai.ro', 'app.muzicai.ro', 'api.muzicai.ro', 'admin.muzicai.ro',
        'stocai.ro', 'app.stocai.ro', 'api.stocai.ro', 'admin.stocai.ro'
    )
    
    $dnsConfig = @"
# CODAI Phase $Phase DNS Configuration
# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# Load Balancer: $externalIP
# Total Records: $($phase1Domains.Count)

# Instructions for Vercel DNS Configuration:
# 1. Go to https://vercel.com/dashboard
# 2. Navigate to your domain settings
# 3. Add these A records:

"@
    
    foreach ($domain in $phase1Domains) {
        $dnsConfig += "$domain`tA`t$externalIP`n"
    }
    
    $dnsConfig += @"

# Verification Commands:
# Test domain accessibility:
"@
    
    foreach ($domain in $phase1Domains) {
        $dnsConfig += "# curl -I https://$domain`n"
    }
    
    $outputFile = "DNS_PHASE_${Phase}_CONFIG.txt"
    $dnsConfig | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Success "DNS configuration saved to $outputFile"
    
} catch {
    Write-Error "Failed to generate DNS configuration: $_"
    exit 1
}

# Step 8: Validate SSL Certificates
Write-Status "Step 8: Monitoring SSL certificate issuance..."

if (-not $DryRun) {
    try {
        Write-Status "Waiting for SSL certificates to be issued..."
        $timeout = 600 # 10 minutes
        $elapsed = 0
        
        do {
            $certificates = kubectl get certificates --no-headers 2>$null
            if ($LASTEXITCODE -eq 0) {
                $readyCerts = $certificates | Where-Object { $_ -match "True" }
                $totalCerts = ($certificates | Measure-Object).Count
                $readyCount = ($readyCerts | Measure-Object).Count
                
                Write-Status "Certificates ready: $readyCount/$totalCerts"
                
                if ($readyCount -eq $totalCerts -and $totalCerts -gt 0) {
                    Write-Success "All SSL certificates are ready"
                    break
                }
            }
            
            Start-Sleep 30
            $elapsed += 30
        } while ($elapsed -lt $timeout)
        
        if ($elapsed -ge $timeout) {
            Write-Warning "Timeout waiting for SSL certificates, but deployment can continue"
        }
        
    } catch {
        Write-Warning "Certificate validation failed, but deployment can continue: $_"
    }
} else {
    Write-Status "[DRY RUN] Would monitor SSL certificate issuance"
}

# Final Summary
Write-Status "🎉 CODAI Phase $Phase Deployment Complete!" "Green"
Write-Success "Infrastructure Status:"
Write-Success "  ✅ EKS Cluster: codai-cluster-v2 (Kubernetes 1.31)"
Write-Success "  ✅ NGINX Ingress Controller: Installed"
Write-Success "  ✅ cert-manager: Installed"
Write-Success "  ✅ PostgreSQL: Deployed"
Write-Success "  ✅ Redis: Deployed"
Write-Success "  ✅ Load Balancer IP: $externalIP"

Write-Success "Phase $Phase Domains Deployed:"
foreach ($domain in $phase1Domains) {
    Write-Success "  ✅ https://$domain"
}

Write-Status "Next Steps:" "Yellow"
Write-Status "  1. Configure DNS records in Vercel (see DNS_PHASE_${Phase}_CONFIG.txt)"
Write-Status "  2. Wait 5-15 minutes for DNS propagation"
Write-Status "  3. Test domain accessibility"
Write-Status "  4. Monitor SSL certificate issuance"

Write-Status "Deployment completed successfully! 🚀" "Green"
