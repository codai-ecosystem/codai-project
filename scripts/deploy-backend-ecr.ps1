# CODAI AWS ECR Backend Deployment Script
# Builds and pushes backend services to Amazon ECR for Terraform deployment

param(
    [string]$Environment = "production",
    [string]$AWSRegion = "us-east-1", 
    [string]$AWSProfile = "default",
    [switch]$DryRun = $false,
    [switch]$SkipBuild = $false,
    [switch]$PushOnly = $false
)

$ErrorActionPreference = "Stop"

# Color functions for better output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }

Write-Info "🐳 CODAI AWS ECR Backend Deployment"
Write-Info "Environment: $Environment | Region: $AWSRegion | Profile: $AWSProfile"

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No actual deployments will be performed"
}

# Backend services configuration for AWS deployment
$BackendServices = @{
    "cbd-database" = @{
        "Path" = "packages/cbd"
        "Dockerfile" = "Dockerfile"
        "BuildContext" = "."
        "Port" = 4180
        "HealthCheck" = "/health"
        "Description" = "CBD Universal Database Engine"
    }
    "gateway-service" = @{
        "Path" = "apps/gateway"
        "Dockerfile" = "Dockerfile"
        "BuildContext" = "."
        "Port" = 4003
        "HealthCheck" = "/health"
        "Description" = "API Gateway and Service Discovery"
    }
    "websocket-service" = @{
        "Path" = "packages/websocket-service"
        "Dockerfile" = "Dockerfile"
        "BuildContext" = "."
        "Port" = 4900
        "HealthCheck" = "/health"
        "Description" = "Real-time WebSocket Communication"
    }
    "ai-analytics" = @{
        "Path" = "packages/cbd"
        "Dockerfile" = "Dockerfile.ai-analytics"
        "BuildContext" = "."
        "Port" = 4700
        "HealthCheck" = "/health"
        "Description" = "AI Analytics and ML Processing"
    }
    "collaboration-service" = @{
        "Path" = "packages/cbd"
        "Dockerfile" = "Dockerfile.collaboration"
        "BuildContext" = "."
        "Port" = 4600
        "HealthCheck" = "/health"
        "Description" = "Real-time Collaboration Engine"
    }
    "graphql-gateway" = @{
        "Path" = "packages/cbd"
        "Dockerfile" = "Dockerfile.graphql"
        "BuildContext" = "."
        "Port" = 4800
        "HealthCheck" = "/health"
        "Description" = "GraphQL API Gateway"
    }
}

# Get AWS Account ID
Write-Info "Getting AWS Account ID..."
try {
    $AWSAccountId = aws sts get-caller-identity --profile $AWSProfile --query Account --output text
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get AWS Account ID"
    }
    Write-Success "AWS Account ID: $AWSAccountId"
} catch {
    Write-Error "Failed to get AWS Account ID: $($_.Exception.Message)"
    exit 1
}

# Login to ECR
Write-Info "Logging into Amazon ECR..."
try {
    $ECRRegistry = "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com"
    aws ecr get-login-password --region $AWSRegion --profile $AWSProfile | docker login --username AWS --password-stdin $ECRRegistry
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to login to ECR"
    }
    Write-Success "Successfully logged into ECR: $ECRRegistry"
} catch {
    Write-Error "Failed to login to ECR: $($_.Exception.Message)"
    exit 1
}

# Create ECR repositories if they don't exist
Write-Info "Ensuring ECR repositories exist..."
foreach ($ServiceName in $BackendServices.Keys) {
    $RepoName = "codai/$ServiceName"
    
    if (-not $DryRun) {
        try {
            $RepoCheck = aws ecr describe-repositories --repository-names $RepoName --region $AWSRegion --profile $AWSProfile 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Repository exists: $RepoName"
            } else {
                Write-Info "Creating ECR repository: $RepoName"
                aws ecr create-repository --repository-name $RepoName --region $AWSRegion --profile $AWSProfile | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Created repository: $RepoName"
                    
                    # Set lifecycle policy
                    $LifecyclePolicy = @"
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last 10 images",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["v"],
                "countType": "imageCountMoreThan",
                "countNumber": 10
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
"@
                    $LifecyclePolicy | aws ecr put-lifecycle-policy --repository-name $RepoName --lifecycle-policy-text file:///dev/stdin --region $AWSRegion --profile $AWSProfile
                } else {
                    throw "Failed to create repository: $RepoName"
                }
            }
        } catch {
            Write-Error "Failed to check/create repository $RepoName : $($_.Exception.Message)"
            continue
        }
    } else {
        Write-Info "[DRY RUN] Would ensure repository exists: $RepoName"
    }
}

# Function to create Dockerfile if it doesn't exist
function Create-BackendDockerfile {
    param($ServicePath, $ServiceName, $ServiceConfig)
    
    $DockerfilePath = Join-Path $ServicePath $ServiceConfig.Dockerfile
    
    if (-not (Test-Path $DockerfilePath)) {
        Write-Warning "Dockerfile not found at $DockerfilePath, creating optimized production Dockerfile..."
        
        $OptimizedDockerfile = @"
# Multi-stage production Dockerfile for $ServiceName
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=$($ServiceConfig.Port)

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Copy node_modules if needed for runtime
COPY --from=deps /app/node_modules ./node_modules

USER nodejs

EXPOSE $($ServiceConfig.Port)

ENV PORT=$($ServiceConfig.Port)

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$($ServiceConfig.Port)$($ServiceConfig.HealthCheck) || exit 1

# Start application
CMD ["node", "dist/index.js"]
"@
        
        Set-Content -Path $DockerfilePath -Value $OptimizedDockerfile
        Write-Success "Created optimized Dockerfile for $ServiceName"
    }
}

# Function to create .dockerignore
function Create-DockerIgnore {
    param($ServicePath)
    
    $DockerIgnorePath = Join-Path $ServicePath ".dockerignore"
    
    if (-not (Test-Path $DockerIgnorePath)) {
        $DockerIgnore = @"
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Build outputs
.next/
dist/
build/
out/

# Debug
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
.nyc_output
coverage/
*.lcov

# ESLint
.eslintcache

# MacOS
.DS_Store

# Windows
Thumbs.db

# IDEs
.vscode/
.idea/

# Temporary folders
tmp/
temp/

# Git
.git
.gitignore

# Documentation
README.md
*.md
!README.md

# Tests
__tests__/
tests/
test/
*.test.js
*.spec.js
"@
        
        Set-Content -Path $DockerIgnorePath -Value $DockerIgnore
        Write-Info "Created .dockerignore for $ServicePath"
    }
}

# Build and push Docker images
$BuildResults = @{}
$PushResults = @{}

foreach ($ServiceName in $BackendServices.Keys) {
    $Service = $BackendServices[$ServiceName]
    $RepoName = "codai/$ServiceName"
    $ImageTag = "$ECRRegistry/$RepoName" + ":latest"
    $VersionTag = "$ECRRegistry/$RepoName" + ":v$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $BuildPath = Join-Path $PWD $Service.Path
    
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Info "🏗️ Processing: $ServiceName"
    Write-Info "Description: $($Service.Description)"
    Write-Info "Path: $BuildPath"
    Write-Info "Latest: $ImageTag"
    Write-Info "Version: $VersionTag"
    
    if (Test-Path $BuildPath) {
        # Create necessary files
        Create-BackendDockerfile -ServicePath $BuildPath -ServiceName $ServiceName -ServiceConfig $Service
        Create-DockerIgnore -ServicePath $BuildPath
        
        # Build Docker image
        if (-not $SkipBuild -and -not $PushOnly) {
            Write-Info "Building Docker image for $ServiceName..."
            
            if (-not $DryRun) {
                try {
                    Push-Location $BuildPath
                    docker build -t $ImageTag -t $VersionTag -f $Service.Dockerfile $Service.BuildContext
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Successfully built image: $ServiceName"
                        $BuildResults[$ServiceName] = "SUCCESS"
                    } else {
                        throw "Docker build failed for $ServiceName"
                    }
                } catch {
                    Write-Error "Failed to build $ServiceName : $($_.Exception.Message)"
                    $BuildResults[$ServiceName] = "FAILED"
                    continue
                } finally {
                    Pop-Location
                }
            } else {
                Write-Info "[DRY RUN] Would build Docker image: $ImageTag"
                $BuildResults[$ServiceName] = "DRY_RUN"
            }
        } else {
            Write-Info "Skipping build for $ServiceName"
            $BuildResults[$ServiceName] = "SKIPPED"
        }
        
        # Push to ECR
        if ($BuildResults[$ServiceName] -eq "SUCCESS" -or $PushOnly) {
            Write-Info "Pushing images to ECR: $ServiceName..."
            
            if (-not $DryRun) {
                try {
                    docker push $ImageTag
                    docker push $VersionTag
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Successfully pushed images: $ServiceName"
                        $PushResults[$ServiceName] = "SUCCESS"
                    } else {
                        throw "Docker push failed for $ServiceName"
                    }
                } catch {
                    Write-Error "Failed to push $ServiceName : $($_.Exception.Message)"
                    $PushResults[$ServiceName] = "FAILED"
                }
            } else {
                Write-Info "[DRY RUN] Would push images: $ImageTag and $VersionTag"
                $PushResults[$ServiceName] = "DRY_RUN"
            }
        } else {
            $PushResults[$ServiceName] = "SKIPPED_DUE_TO_BUILD_FAILURE"
        }
        
    } else {
        Write-Error "Service path does not exist: $BuildPath"
        $BuildResults[$ServiceName] = "PATH_NOT_FOUND"
        $PushResults[$ServiceName] = "SKIPPED"
    }
    
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Summary Report
Write-Info ""
Write-Info "📊 AWS ECR DEPLOYMENT SUMMARY REPORT"
Write-Info "═══════════════════════════════════════════════════════════════"

$SuccessfulBuilds = ($BuildResults.Values | Where-Object { $_ -eq "SUCCESS" }).Count
$FailedBuilds = ($BuildResults.Values | Where-Object { $_ -eq "FAILED" }).Count
$SuccessfulPushes = ($PushResults.Values | Where-Object { $_ -eq "SUCCESS" }).Count
$FailedPushes = ($PushResults.Values | Where-Object { $_ -eq "FAILED" }).Count

Write-Info "Build and Push Results:"
foreach ($Service in $BackendServices.Keys) {
    $BuildStatus = $BuildResults[$Service]
    $PushStatus = $PushResults[$Service]
    $Description = $BackendServices[$Service].Description
    
    switch ($BuildStatus) {
        "SUCCESS" { Write-Success "  ✅ $Service : Build SUCCESS | Push $PushStatus | $Description" }
        "FAILED" { Write-Error "  ❌ $Service : Build FAILED | Push $PushStatus | $Description" }
        "SKIPPED" { Write-Warning "  ⏭️ $Service : Build SKIPPED | Push $PushStatus | $Description" }
        "DRY_RUN" { Write-Info "  🧪 $Service : Build DRY_RUN | Push $PushStatus | $Description" }
        "PATH_NOT_FOUND" { Write-Error "  🔍 $Service : PATH NOT FOUND | Push $PushStatus | $Description" }
    }
}

Write-Info ""
Write-Info "Statistics:"
Write-Info "  Successful Builds: $SuccessfulBuilds/$($BackendServices.Count)"
Write-Info "  Failed Builds: $FailedBuilds/$($BackendServices.Count)"
Write-Info "  Successful Pushes: $SuccessfulPushes/$($BackendServices.Count)"
Write-Info "  Failed Pushes: $FailedPushes/$($BackendServices.Count)"

# Create Terraform deployment manifest
if (-not $DryRun -and $SuccessfulPushes -gt 0) {
    $TerraformVars = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        environment = $Environment
        region = $AWSRegion
        account_id = $AWSAccountId
        registry = $ECRRegistry
        services = @{}
    }
    
    foreach ($ServiceName in $BackendServices.Keys) {
        if ($PushResults[$ServiceName] -eq "SUCCESS") {
            $TerraformVars.services[$ServiceName] = @{
                image = "$ECRRegistry/codai/$ServiceName" + ":latest"
                port = $BackendServices[$ServiceName].Port
                health_check = $BackendServices[$ServiceName].HealthCheck
                description = $BackendServices[$ServiceName].Description
                status = "READY_FOR_TERRAFORM"
            }
        }
    }
    
    $VarsPath = "terraform/terraform.tfvars.json"
    $TerraformVars | ConvertTo-Json -Depth 4 | Out-File -FilePath $VarsPath -Encoding UTF8
    Write-Success "Terraform variables file created: $VarsPath"
    
    # Create deployment checklist
    $ChecklistPath = "DEPLOYMENT_CHECKLIST_$Environment.md"
    $Checklist = @"
# 🚀 CODAI AWS Deployment Checklist - $Environment

## ✅ Phase 1: Container Images (COMPLETED)
- [x] Built $SuccessfulBuilds/$($BackendServices.Count) backend services
- [x] Pushed images to ECR registry: $ECRRegistry
- [x] Created Terraform variables file: $VarsPath

## 📋 Phase 2: Infrastructure Deployment (NEXT)
1. **Review Terraform Configuration**
   - [ ] Review terraform/aws-infrastructure.tf
   - [ ] Review terraform/ecs-services.tf
   - [ ] Review terraform/load-balancer.tf
   - [ ] Review terraform/monitoring.tf

2. **Set Environment Variables**
   ```powershell
   # AWS Configuration
   `$env:AWS_PROFILE = "$AWSProfile"
   `$env:AWS_REGION = "$AWSRegion"
   `$env:TF_VAR_environment = "$Environment"
   `$env:TF_VAR_domain_name = "codai.ai"  # Replace with your domain
   ```

3. **Initialize and Deploy Terraform**
   ```bash
   cd terraform
   terraform init
   terraform plan -var-file="terraform.tfvars.json"
   terraform apply -var-file="terraform.tfvars.json"
   ```

## 🔍 Phase 3: Validation (PENDING)
- [ ] Verify ECS services are running
- [ ] Test load balancer health checks
- [ ] Verify RDS database connectivity
- [ ] Test Redis cache connectivity
- [ ] Check CloudWatch monitoring
- [ ] Validate domain SSL certificates

## 📊 Deployment Status
- **Environment**: $Environment
- **AWS Account**: $AWSAccountId
- **Region**: $AWSRegion
- **Timestamp**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')

## 🐳 Container Images Ready
$(foreach ($ServiceName in $BackendServices.Keys) {
    if ($PushResults[$ServiceName] -eq "SUCCESS") {
        "- [x] **$ServiceName**: $ECRRegistry/codai/$ServiceName`:latest"
    } else {
        "- [ ] **$ServiceName**: FAILED - $($BuildResults[$ServiceName])"
    }
} | Out-String)

## 🆘 Troubleshooting
If any builds failed, check the logs above and fix the issues before proceeding with Terraform deployment.

## 🚀 Next Commands
```powershell
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="terraform.tfvars.json"

# Apply infrastructure
terraform apply -var-file="terraform.tfvars.json"
```
"@
    
    Set-Content -Path $ChecklistPath -Value $Checklist -Encoding UTF8
    Write-Success "Deployment checklist created: $ChecklistPath"
}

if ($FailedBuilds -gt 0 -or $FailedPushes -gt 0) {
    Write-Error "❌ Some builds or pushes failed. Check logs above for details."
    Write-Info "🔧 Fix the issues and re-run the script before proceeding with Terraform."
    exit 1
} else {
    Write-Success "🚀 All backend services successfully deployed to ECR!"
    Write-Success "✅ Ready for Terraform infrastructure deployment"
    Write-Info ""
    Write-Info "📋 Next Steps:"
    Write-Info "1. Review the deployment checklist: DEPLOYMENT_CHECKLIST_$Environment.md"
    Write-Info "2. Set your domain name in terraform variables"
    Write-Info "3. Run: cd terraform && terraform init && terraform apply"
    if (-not $DryRun) {
        Write-Success "🎯 Terraform is ready to deploy your infrastructure!"
    }
    exit 0
}
