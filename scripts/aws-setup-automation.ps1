# 🚀 AWS Setup Automation Script
# This script helps automate the AWS infrastructure setup for CODAI ecosystem

param(
    [Parameter(Mandatory=$true)]
    [string]$AWSAccountId,
    
    [Parameter(Mandatory=$true)]
    [string]$Region = "eu-west-1",
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateDomains,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateCluster,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployServices
)

# Color coding for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green @args }
function Write-Warning { Write-ColorOutput Yellow @args }
function Write-Error { Write-ColorOutput Red @args }
function Write-Info { Write-ColorOutput Cyan @args }

Write-Info "🚀 CODAI Ecosystem AWS Deployment Automation"
Write-Info "============================================="

# Verify AWS CLI is configured
Write-Info "📋 Checking AWS CLI configuration..."
try {
    $awsIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Success "✅ AWS CLI configured for account: $($awsIdentity.Account)"
} catch {
    Write-Error "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
}

# Define domains and services
$domains = @("codai.ro", "memorai.ro", "controlai.ro", "romai.ro")
$services = @(
    @{name="gateway"; domain="api.codai.ro"},
    @{name="id-service"; domain="id.codai.ro"},
    @{name="auth-service"; domain="auth.codai.ro"},
    @{name="memorai"; domain="memorai.ro"},
    @{name="memorai-mcp"; domain="mcp.memorai.ro"},
    @{name="memorai-cbd"; domain="cbd.memorai.ro"},
    @{name="controlai"; domain="controlai.ro"},
    @{name="controlai-mcp"; domain="mcp.controlai.ro"},
    @{name="controlai-dashboard"; domain="dashboard.controlai.ro"},
    @{name="romai"; domain="romai.ro"},
    @{name="romai-mcp"; domain="mcp.romai.ro"},
    @{name="admin"; domain="admin.codai.ro"},
    @{name="hub"; domain="hub.codai.ro"}
)

# Create Route53 Hosted Zones
if ($CreateDomains) {
    Write-Info "🌐 Creating Route53 hosted zones..."
    foreach ($domain in $domains) {
        Write-Info "Creating hosted zone for $domain"
        try {
            $result = aws route53 create-hosted-zone `
                --name $domain `
                --caller-reference "$domain-$(Get-Date -Format 'yyyyMMddHHmmss')" `
                --output json | ConvertFrom-Json
            
            Write-Success "✅ Created hosted zone for $domain"
            Write-Info "📝 Name servers: $($result.DelegationSet.NameServers -join ', ')"
        } catch {
            Write-Warning "⚠️ Hosted zone for $domain might already exist or failed to create"
        }
    }
}

# Create SSL Certificates
Write-Info "🔒 Requesting SSL certificates..."
foreach ($domain in $domains) {
    Write-Info "Requesting certificate for *.$domain and $domain"
    try {
        $result = aws acm request-certificate `
            --domain-name "*.$domain" `
            --domain-name $domain `
            --validation-method DNS `
            --region $Region `
            --output json | ConvertFrom-Json
        
        Write-Success "✅ Certificate requested for $domain (ARN: $($result.CertificateArn))"
    } catch {
        Write-Warning "⚠️ Certificate request for $domain failed or already exists"
    }
}

# Create ECR Repositories
Write-Info "📦 Creating ECR repositories..."
foreach ($service in $services) {
    $repoName = "codai/$($service.name)"
    Write-Info "Creating ECR repository: $repoName"
    try {
        $result = aws ecr create-repository `
            --repository-name $repoName `
            --region $Region `
            --output json | ConvertFrom-Json
        
        Write-Success "✅ Created ECR repository: $repoName"
    } catch {
        Write-Warning "⚠️ ECR repository $repoName might already exist"
    }
}

# Create EKS Cluster
if ($CreateCluster) {
    Write-Info "☸️ Creating EKS cluster (this takes 10-15 minutes)..."
    
    # First, create the VPC and security groups
    Write-Info "🏗️ Setting up VPC and security groups..."
    
    # You would need to create VPC, subnets, security groups, and IAM roles here
    # This is a simplified version - in production, use CloudFormation or Terraform
    
    Write-Warning "⚠️ EKS cluster creation requires VPC setup. Please refer to the deployment guide."
    Write-Info "💡 Consider using eksctl for easier cluster creation:"
    Write-Info "   eksctl create cluster --name codai-cluster --region $Region --nodes 3 --node-type t3.medium"
}

# Deploy Services
if ($DeployServices) {
    Write-Info "🚀 Deploying services to Kubernetes..."
    
    # Check if kubectl is configured
    try {
        kubectl cluster-info | Out-Null
        Write-Success "✅ kubectl is configured"
    } catch {
        Write-Error "❌ kubectl not configured. Please configure cluster access first."
        exit 1
    }
    
    # Deploy each service
    foreach ($service in $services) {
        Write-Info "Deploying $($service.name) to $($service.domain)"
        # Add deployment logic here
    }
}

Write-Success "🎉 AWS setup automation completed!"
Write-Info "📋 Next steps:"
Write-Info "   1. Update your domain registrar to use the Route53 name servers"
Write-Info "   2. Validate SSL certificates in AWS Console"
Write-Info "   3. Create EKS cluster if not done already"
Write-Info "   4. Deploy services to the cluster"
Write-Info ""
Write-Info "📖 For detailed instructions, see: AWS_DEPLOYMENT_SETUP_GUIDE.md"
