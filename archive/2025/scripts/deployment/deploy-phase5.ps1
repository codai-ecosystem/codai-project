# 🚀 CODAI Phase 5 Domain & Security Deployment Script
# Complete infrastructure deployment with domain configuration and security

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("plan", "apply", "destroy", "validate", "init")]
    [string]$Action = "plan",
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoApprove,
    
    [Parameter(Mandatory=$false)]
    [string]$WorkspaceFolder = "e:\GitHub\codai-project"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." "Cyan"
    
    # Check Terraform
    try {
        $terraformVersion = terraform --version
        Write-ColorOutput "✅ Terraform: $($terraformVersion.Split("`n")[0])" "Green"
    } catch {
        Write-ColorOutput "❌ Terraform not found. Please install Terraform." "Red"
        exit 1
    }
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version
        Write-ColorOutput "✅ AWS CLI: $($awsVersion)" "Green"
    } catch {
        Write-ColorOutput "❌ AWS CLI not found. Please install AWS CLI." "Red"
        exit 1
    }
    
    # Check AWS credentials
    try {
        $awsIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-ColorOutput "✅ AWS Identity: $($awsIdentity.Arn)" "Green"
    } catch {
        Write-ColorOutput "❌ AWS credentials not configured. Please run 'aws configure'." "Red"
        exit 1
    }
    
    # Check Node.js (for Lambda functions)
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js: $nodeVersion" "Green"
    } catch {
        Write-ColorOutput "❌ Node.js not found. Please install Node.js for Lambda functions." "Red"
        exit 1
    }
    
    Write-ColorOutput "✅ All prerequisites satisfied!" "Green"
}

# Function to validate infrastructure directory
function Test-InfrastructureDirectory {
    $infraDir = Join-Path $WorkspaceFolder "infrastructure\codai"
    
    if (-not (Test-Path $infraDir)) {
        Write-ColorOutput "❌ Infrastructure directory not found: $infraDir" "Red"
        exit 1
    }
    
    $requiredFiles = @(
        "main.tf",
        "domains.tf", 
        "api-security.tf",
        "api-routes.tf",
        "alb-https.tf",
        "service-auth.tf"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $infraDir $file
        if (-not (Test-Path $filePath)) {
            Write-ColorOutput "❌ Required file not found: $file" "Red"
            exit 1
        }
    }
    
    Write-ColorOutput "✅ Infrastructure directory validated!" "Green"
    return $infraDir
}

# Function to run Terraform command
function Invoke-TerraformCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory,
        [switch]$AutoApprove
    )
    
    $originalLocation = Get-Location
    try {
        Set-Location $WorkingDirectory
        
        $terraformArgs = @($Command)
        
        if ($AutoApprove -and $Command -eq "apply") {
            $terraformArgs += "-auto-approve"
        }
        
        if ($Verbose) {
            $terraformArgs += "-verbose"
        }
        
        Write-ColorOutput "🔧 Running: terraform $($terraformArgs -join ' ')" "Yellow"
        
        & terraform @terraformArgs
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Terraform command failed with exit code: $LASTEXITCODE" "Red"
            exit $LASTEXITCODE
        }
        
    } finally {
        Set-Location $originalLocation
    }
}

# Function to display deployment summary
function Show-DeploymentSummary {
    param([string]$InfraDir)
    
    Write-ColorOutput "`n🎯 Phase 5 Deployment Summary" "Cyan"
    Write-ColorOutput "================================" "Gray"
    
    Write-ColorOutput "📁 Infrastructure Directory: $InfraDir" "White"
    Write-ColorOutput "🌐 Domain Configuration: codai.ro with wildcard SSL" "White"
    Write-ColorOutput "🔐 Security Features: API Gateway, JWT auth, API keys, WAF" "White"
    Write-ColorOutput "🛡️ Service Authentication: Inter-service JWT tokens" "White"
    Write-ColorOutput "🔗 Load Balancer: HTTPS termination with domain routing" "White"
    Write-ColorOutput "📊 Monitoring: CloudWatch logs and metrics" "White"
    Write-ColorOutput "🏗️ Infrastructure: Route 53, ACM certificates, CloudFront" "White"
    
    Write-ColorOutput "`n🚀 Deployment Action: $Action" "Yellow"
    
    if ($AutoApprove) {
        Write-ColorOutput "⚡ Auto-approve: Enabled" "Yellow"
    } else {
        Write-ColorOutput "⚡ Auto-approve: Disabled (manual approval required)" "Yellow"
    }
}

# Function to show post-deployment instructions
function Show-PostDeploymentInstructions {
    Write-ColorOutput "`n🎉 Phase 5 Deployment Instructions" "Green"
    Write-ColorOutput "====================================" "Gray"
    
    Write-ColorOutput "`n1. 📋 Domain Setup:" "Cyan"
    Write-ColorOutput "   • Update your domain registrar to use AWS Route 53 name servers" "White"
    Write-ColorOutput "   • Copy the name servers from Route 53 hosted zone" "White"
    Write-ColorOutput "   • DNS propagation may take 24-48 hours" "White"
    
    Write-ColorOutput "`n2. 🔐 Master Admin Access:" "Cyan"
    Write-ColorOutput "   • Master admin credentials are stored in AWS SSM Parameter Store" "White"
    Write-ColorOutput "   • Use AWS CLI to retrieve: aws ssm get-parameter --name '/codai/security/master-admin' --with-decryption" "White"
    Write-ColorOutput "   • Admin panel will be available at: https://admin.codai.ro" "White"
    
    Write-ColorOutput "`n3. 🔑 API Key Management:" "Cyan"
    Write-ColorOutput "   • API keys are managed through the admin panel" "White"
    Write-ColorOutput "   • Create project-specific API keys for different applications" "White"
    Write-ColorOutput "   • API endpoint: https://api.codai.ro" "White"
    
    Write-ColorOutput "`n4. 🛠️ Service Endpoints:" "Cyan"
    Write-ColorOutput "   • Gateway: https://gateway.codai.ro" "White"
    Write-ColorOutput "   • Apps Portal: https://apps.codai.ro" "White"
    Write-ColorOutput "   • Documentation: https://docs.codai.ro" "White"
    Write-ColorOutput "   • Monitoring: https://monitoring.codai.ro" "White"
    
    Write-ColorOutput "`n5. 🔍 Monitoring & Logs:" "Cyan"
    Write-ColorOutput "   • CloudWatch logs: /aws/apigateway/codai-gateway" "White"
    Write-ColorOutput "   • Infrastructure logs: /aws/codai/infrastructure" "White"
    Write-ColorOutput "   • Service metrics available in CloudWatch" "White"
    
    Write-ColorOutput "`n6. 🔧 Next Steps:" "Cyan"
    Write-ColorOutput "   • Update frontend applications to use new domain endpoints" "White"
    Write-ColorOutput "   • Configure service authentication in backend services" "White"
    Write-ColorOutput "   • Test API endpoints and security configurations" "White"
    Write-ColorOutput "   • Set up monitoring and alerting rules" "White"
    
    Write-ColorOutput "`n✅ Phase 5 Domain Configuration & Security Implementation Complete!" "Green"
}

# Main execution
try {
    Write-ColorOutput "🚀 Starting CODAI Phase 5 Infrastructure Deployment" "Cyan"
    Write-ColorOutput "=================================================" "Gray"
    
    # Check prerequisites
    Test-Prerequisites
    
    # Validate infrastructure directory
    $infraDir = Test-InfrastructureDirectory
    
    # Show deployment summary
    Show-DeploymentSummary -InfraDir $infraDir
    
    Write-ColorOutput "`n🔧 Beginning Terraform operations..." "Yellow"
    
    # Initialize Terraform if needed
    if ($Action -eq "init" -or -not (Test-Path (Join-Path $infraDir ".terraform"))) {
        Write-ColorOutput "`n📦 Initializing Terraform..." "Cyan"
        Invoke-TerraformCommand -Command "init" -WorkingDirectory $infraDir
    }
    
    # Validate configuration
    if ($Action -ne "destroy") {
        Write-ColorOutput "`n✅ Validating Terraform configuration..." "Cyan"
        Invoke-TerraformCommand -Command "validate" -WorkingDirectory $infraDir
    }
    
    # Execute the requested action
    switch ($Action) {
        "plan" {
            Write-ColorOutput "`n📋 Creating Terraform plan..." "Cyan"
            Invoke-TerraformCommand -Command "plan" -WorkingDirectory $infraDir
        }
        "apply" {
            Write-ColorOutput "`n🚀 Applying Terraform configuration..." "Cyan"
            Invoke-TerraformCommand -Command "apply" -WorkingDirectory $infraDir -AutoApprove:$AutoApprove
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "`n✅ Infrastructure deployment successful!" "Green"
                Show-PostDeploymentInstructions
            }
        }
        "destroy" {
            Write-ColorOutput "`n💥 Destroying Terraform infrastructure..." "Red"
            if (-not $AutoApprove) {
                $confirm = Read-Host "Are you sure you want to destroy the infrastructure? (yes/no)"
                if ($confirm -ne "yes") {
                    Write-ColorOutput "❌ Destroy operation cancelled." "Yellow"
                    exit 0
                }
            }
            Invoke-TerraformCommand -Command "destroy" -WorkingDirectory $infraDir -AutoApprove:$AutoApprove
        }
        "validate" {
            Write-ColorOutput "`n✅ Terraform configuration is valid!" "Green"
        }
        "init" {
            Write-ColorOutput "`n✅ Terraform initialization complete!" "Green"
        }
    }
    
    Write-ColorOutput "`n🎉 Phase 5 deployment operation completed successfully!" "Green"
    
} catch {
    Write-ColorOutput "`n❌ Error during deployment: $($_.Exception.Message)" "Red"
    Write-ColorOutput "Stack trace: $($_.ScriptStackTrace)" "Red"
    exit 1
}
