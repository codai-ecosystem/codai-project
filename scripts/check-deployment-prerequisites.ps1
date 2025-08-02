# CODAI Cloud Deployment Checker
# This script checks prerequisites and provides deployment guidance

param(
    [switch]$CheckOnly,
    [switch]$InstallMissing
)

$ErrorActionPreference = "Continue"

# Prerequisites with installation instructions
$Prerequisites = @{
    "AWS CLI" = @{
        Command = "aws --version"
        InstallCmd = "winget install Amazon.AWSCLI"
        Required = $true
        Description = "AWS Command Line Interface for cloud deployment"
    }
    "kubectl" = @{
        Command = "kubectl version --client"
        InstallCmd = "winget install Kubernetes.kubectl"
        Required = $true
        Description = "Kubernetes command-line tool"
    }
    "Terraform" = @{
        Command = "terraform version"
        InstallCmd = "winget install Hashicorp.Terraform"
        Required = $true
        Description = "Infrastructure as Code tool"
    }
    "Docker Desktop" = @{
        Command = "docker --version"
        InstallCmd = "winget install Docker.DockerDesktop"
        Required = $true
        Description = "Container platform"
    }
    "Helm" = @{
        Command = "helm version"
        InstallCmd = "winget install Helm.Helm"
        Required = $true
        Description = "Kubernetes package manager"
    }
    "Git" = @{
        Command = "git --version"
        InstallCmd = "winget install Git.Git"
        Required = $false
        Description = "Version control system"
    }
}

# Color functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

# Check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        $output = Invoke-Expression $Command 2>$null
        return $true
    } catch {
        return $false
    }
}

# Install missing prerequisites
function Install-Prerequisite {
    param(
        [string]$Name,
        [string]$InstallCmd
    )
    
    Write-Info "Installing $Name..."
    try {
        Invoke-Expression $InstallCmd
        Write-Success "$Name installation initiated"
    } catch {
        Write-Error "Failed to install ${Name}: $($_.Exception.Message)"
    }
}

# Check AWS configuration
function Test-AwsConfiguration {
    try {
        $identity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
        Write-Success "✅ AWS Credentials configured"
        Write-Info "   Account ID: $($identity.Account)"
        Write-Info "   User/Role: $($identity.Arn.Split('/')[-1])"
        return $true
    } catch {
        Write-Error "❌ AWS Credentials not configured"
        Write-Warning "   Run: aws configure"
        Write-Warning "   Or:  aws configure sso"
        return $false
    }
}

# Check Docker status
function Test-DockerStatus {
    try {
        $info = docker info 2>$null
        Write-Success "✅ Docker is running"
        return $true
    } catch {
        Write-Error "❌ Docker is not running"
        Write-Warning "   Start Docker Desktop"
        return $false
    }
}

# Main checking function
function Test-Prerequisites {
    Write-Host ""
    Write-Host "🔍 CODAI Cloud Deployment Prerequisites Check" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    
    $missingRequired = @()
    $missingOptional = @()
    
    # Check each prerequisite
    foreach ($name in $Prerequisites.Keys) {
        $prereq = $Prerequisites[$name]
        $isInstalled = Test-Command -Command $prereq.Command
        
        if ($isInstalled) {
            Write-Success "✅ $name - Installed"
            if ($Verbose) {
                $version = Invoke-Expression $prereq.Command 2>$null
                Write-Info "   Version: $($version.Split("`n")[0])"
            }
        } else {
            if ($prereq.Required) {
                Write-Error "❌ $name - Missing (Required)"
                $missingRequired += @{Name=$name; Config=$prereq}
            } else {
                Write-Warning "⚠️  $name - Missing (Optional)"
                $missingOptional += @{Name=$name; Config=$prereq}
            }
            Write-Info "   Description: $($prereq.Description)"
            Write-Info "   Install: $($prereq.InstallCmd)"
        }
    }
    
    Write-Host ""
    
    # Check AWS configuration
    Write-Info "Checking AWS configuration..."
    $awsConfigured = Test-AwsConfiguration
    
    Write-Host ""
    
    # Check Docker status
    Write-Info "Checking Docker status..."
    $dockerRunning = Test-DockerStatus
    
    Write-Host ""
    Write-Host "📊 Summary" -ForegroundColor Yellow
    Write-Host "=========" -ForegroundColor Yellow
    
    if ($missingRequired.Count -eq 0 -and $awsConfigured -and $dockerRunning) {
        Write-Success "🎉 All prerequisites are met! Ready for cloud deployment."
        return $true
    } else {
        Write-Error "⚠️  Prerequisites missing or not configured properly."
        
        if ($missingRequired.Count -gt 0) {
            Write-Warning "Missing required tools:"
            foreach ($missing in $missingRequired) {
                Write-Host "  - $($missing.Name)" -ForegroundColor Red
            }
        }
        
        if (-not $awsConfigured) {
            Write-Warning "AWS credentials not configured"
        }
        
        if (-not $dockerRunning) {
            Write-Warning "Docker is not running"
        }
        
        return $false
    }
}

# Install missing prerequisites
function Install-MissingPrerequisites {
    Write-Host ""
    Write-Info "Installing missing prerequisites..."
    
    foreach ($name in $Prerequisites.Keys) {
        $prereq = $Prerequisites[$name]
        $isInstalled = Test-Command -Command $prereq.Command
        
        if (-not $isInstalled -and $prereq.Required) {
            Install-Prerequisite -Name $name -InstallCmd $prereq.InstallCmd
            Start-Sleep 2
        }
    }
    
    Write-Host ""
    Write-Warning "After installation completes, restart PowerShell and run this script again."
}

# Show deployment options
function Show-DeploymentOptions {
    Write-Host ""
    Write-Host "🚀 CODAI Deployment Options" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    Write-Host ""
    
    Write-Info "Option 1: Local Development Environment"
    Write-Host "  - Quick setup for development and testing" -ForegroundColor Gray
    Write-Host "  - Runs on your local machine" -ForegroundColor Gray
    Write-Host "  - Command: .\scripts\start-local-ecosystem.ps1" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Info "Option 2: AWS Cloud Deployment"
    Write-Host "  - Production-ready infrastructure" -ForegroundColor Gray
    Write-Host "  - Multi-domain setup with SSL" -ForegroundColor Gray
    Write-Host "  - Auto-scaling and monitoring" -ForegroundColor Gray
    Write-Host "  - Command: .\scripts\deploy-ecosystem.ps1" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Info "Option 3: Hybrid Setup"
    Write-Host "  - Local development + cloud database" -ForegroundColor Gray
    Write-Host "  - Best of both worlds" -ForegroundColor Gray
    Write-Host "  - Requires AWS RDS setup" -ForegroundColor Gray
    Write-Host ""
    
    Write-Info "Next Steps:"
    if (Test-Prerequisites) {
        Write-Success "✅ Ready for cloud deployment!"
        Write-Host "   Run: .\scripts\deploy-ecosystem.ps1" -ForegroundColor Cyan
    } else {
        Write-Warning "⚠️  Install missing prerequisites first"
        Write-Host "   Run: .\scripts\check-deployment-prerequisites.ps1 -InstallMissing" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Info "For local development (no cloud needed):"
    Write-Host "   Run: .\scripts\start-local-ecosystem.ps1" -ForegroundColor Cyan
}

# Main execution
function Main {
    if ($InstallMissing) {
        Install-MissingPrerequisites
    } else {
        $ready = Test-Prerequisites
        
        if (-not $CheckOnly) {
            Show-DeploymentOptions
        }
    }
}

# Run main function
Main
