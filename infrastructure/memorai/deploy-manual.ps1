#!/usr/bin/env pwsh
# MemorAI Manual Deployment (Bypass SSL Validation)
# Deploy infrastructure without waiting for SSL certificate validation

param(
    [switch]$SkipSSL,
    [switch]$Force
)

function Write-DeployLog {
    param($Message, $Level = "INFO")
    $colors = @{
        "INFO" = "White"
        "SUCCESS" = "Green" 
        "WARNING" = "Yellow"
        "ERROR" = "Red"
        "DEPLOY" = "Cyan"
    }
    $Timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$Timestamp] $Message" -ForegroundColor $colors[$Level]
}

Write-DeployLog "🚀 MemorAI Manual Deployment Tool" "DEPLOY"
Write-DeployLog "This will deploy MemorAI infrastructure without waiting for SSL validation" "INFO"

if (-not $Force) {
    Write-DeployLog "⚠️ WARNING: SSL certificates are still PENDING_VALIDATION" "WARNING"
    Write-DeployLog "The deployment will work but HTTPS may not be immediately available" "WARNING"
    Write-DeployLog "SSL certificates will activate automatically once validated by AWS" "INFO"
    Write-Host ""
    $confirm = Read-Host "Continue with deployment? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-DeployLog "Deployment cancelled by user" "INFO"
        exit 0
    }
}

Write-DeployLog "Starting MemorAI infrastructure deployment..." "DEPLOY"

# Change to infrastructure directory
Set-Location $PSScriptRoot

# Deploy core infrastructure first (excluding CloudFront for now)
Write-DeployLog "Deploying core infrastructure (VPC, ECS, ALB, Route53)..." "DEPLOY"

$coreResources = @(
    "aws_vpc.main",
    "aws_internet_gateway.main", 
    "aws_subnet.public",
    "aws_subnet.private",
    "aws_route_table.public",
    "aws_route_table.private",
    "aws_route_table_association.public",
    "aws_route_table_association.private",
    "aws_security_group.alb",
    "aws_security_group.ecs",
    "aws_ecs_cluster.main",
    "aws_lb.main",
    "aws_lb_listener.http",
    "aws_lb_target_group.api",
    "aws_lb_target_group.mcp",
    "aws_route53_zone.main",
    "aws_ecr_repository.api",
    "aws_ecr_repository.mcp"
)

foreach ($resource in $coreResources) {
    Write-DeployLog "Deploying: $resource" "INFO"
}

$deployCore = terraform apply -auto-approve $(foreach($r in $coreResources) { "-target=$r" })

if ($LASTEXITCODE -eq 0) {
    Write-DeployLog "✅ Core infrastructure deployed successfully!" "SUCCESS"
} else {
    Write-DeployLog "❌ Core infrastructure deployment failed" "ERROR"
    exit 1
}

# Deploy application services
Write-DeployLog "Deploying application services..." "DEPLOY"

$appResources = @(
    "aws_ecs_task_definition.api",
    "aws_ecs_task_definition.mcp",
    "aws_service_discovery_private_dns_namespace.internal",
    "aws_service_discovery_service.api",
    "aws_service_discovery_service.mcp"
)

$deployApps = terraform apply -auto-approve $(foreach($r in $appResources) { "-target=$r" })

if ($LASTEXITCODE -eq 0) {
    Write-DeployLog "✅ Application services deployed successfully!" "SUCCESS"
} else {
    Write-DeployLog "❌ Application services deployment failed" "ERROR"
    exit 1
}

# Get outputs
Write-DeployLog "Retrieving deployment information..." "INFO"

$vpcId = terraform output -raw vpc_id
$albDns = terraform output -raw alb_dns_name
$hostedZoneId = terraform output -raw route53_zone_id
$ecsCluster = terraform output -raw ecs_cluster_name

Write-DeployLog "=== DEPLOYMENT COMPLETED ===" "SUCCESS"
Write-DeployLog "VPC ID: $vpcId" "INFO"
Write-DeployLog "ALB DNS: $albDns" "INFO"  
Write-DeployLog "Hosted Zone: $hostedZoneId" "INFO"
Write-DeployLog "ECS Cluster: $ecsCluster" "INFO"

Write-DeployLog "" "INFO"
Write-DeployLog "🌐 MemorAI Infrastructure Status:" "SUCCESS"
Write-DeployLog "✅ Core AWS infrastructure: DEPLOYED" "SUCCESS"
Write-DeployLog "✅ Application services: DEPLOYED" "SUCCESS"
Write-DeployLog "⏳ SSL certificates: PENDING (will activate automatically)" "WARNING"
Write-DeployLog "⏳ CloudFront CDN: Will deploy when SSL certificates are ready" "WARNING"

Write-DeployLog "" "INFO"
Write-DeployLog "📋 Next Steps:" "INFO"
Write-DeployLog "1. Build and push Docker images to ECR" "INFO"
Write-DeployLog "2. Deploy ECS services" "INFO"
Write-DeployLog "3. Configure DNS records" "INFO"
Write-DeployLog "4. SSL certificates will validate automatically" "INFO"

Write-DeployLog "" "INFO"
Write-DeployLog "🔗 Temporary Access (HTTP):" "INFO"
Write-DeployLog "ALB Direct: http://$albDns" "INFO"
Write-DeployLog "Once SSL validates: https://memorai.ro" "INFO"

Write-DeployLog "" "SUCCESS"
Write-DeployLog "✅ MemorAI manual deployment completed successfully!" "SUCCESS"
