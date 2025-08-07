#!/bin/bash

# MemorAI Container Deployment Script
# This script builds and deploys MemorAI containers to AWS ECS

set -e

echo "🚀 Starting MemorAI Container Deployment to AWS ECS..."

# Configuration
AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID="567877624442"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
API_REPO="memorai-api"
MCP_REPO="memorai-mcp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check AWS CLI and Docker
echo "🔍 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install it first."
    exit 1
fi

# Step 2: ECR Login
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
print_status "ECR login successful"

# Step 3: Create ECR repositories if they don't exist
echo "📦 Ensuring ECR repositories exist..."
aws ecr describe-repositories --repository-names $API_REPO --region $AWS_REGION &>/dev/null || {
    echo "Creating ECR repository: $API_REPO"
    aws ecr create-repository --repository-name $API_REPO --region $AWS_REGION
}

aws ecr describe-repositories --repository-names $MCP_REPO --region $AWS_REGION &>/dev/null || {
    echo "Creating ECR repository: $MCP_REPO"
    aws ecr create-repository --repository-name $MCP_REPO --region $AWS_REGION
}
print_status "ECR repositories ready"

# Step 4: Build MemorAI API Image
echo "🏗️ Building MemorAI API container..."
cd apps/memorai
docker build -t $API_REPO:latest .
docker tag $API_REPO:latest $ECR_REGISTRY/$API_REPO:latest
docker tag $API_REPO:latest $ECR_REGISTRY/$API_REPO:v1.0.0
print_status "MemorAI API image built"

# Step 5: Push MemorAI API Image
echo "📤 Pushing MemorAI API to ECR..."
docker push $ECR_REGISTRY/$API_REPO:latest
docker push $ECR_REGISTRY/$API_REPO:v1.0.0
print_status "MemorAI API image pushed to ECR"

# Step 6: Build MemorAI MCP Image
echo "🏗️ Building MemorAI MCP container..."
cd ../../packages/memorai-mcp
docker build -t $MCP_REPO:latest .
docker tag $MCP_REPO:latest $ECR_REGISTRY/$MCP_REPO:latest
docker tag $MCP_REPO:latest $ECR_REGISTRY/$MCP_REPO:v1.0.0
print_status "MemorAI MCP image built"

# Step 7: Push MemorAI MCP Image
echo "📤 Pushing MemorAI MCP to ECR..."
docker push $ECR_REGISTRY/$MCP_REPO:latest
docker push $ECR_REGISTRY/$MCP_REPO:v1.0.0
print_status "MemorAI MCP image pushed to ECR"

# Step 8: Create ECS Task Definitions
echo "📋 Creating ECS Task Definitions..."
cd ../../infrastructure/memorai

# Create API Task Definition
cat > api-task-definition.json << EOF
{
  "family": "memorai-api-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/memorai-ecs-task-execution-prod",
  "containerDefinitions": [
    {
      "name": "memorai-api",
      "image": "${ECR_REGISTRY}/${API_REPO}:latest",
      "portMappings": [
        {
          "containerPort": 4006,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/memorai-api-prod",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4006"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4006/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Create MCP Task Definition
cat > mcp-task-definition.json << EOF
{
  "family": "memorai-mcp-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/memorai-ecs-task-execution-prod",
  "containerDefinitions": [
    {
      "name": "memorai-mcp",
      "image": "${ECR_REGISTRY}/${MCP_REPO}:latest",
      "portMappings": [
        {
          "containerPort": 4950,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/memorai-mcp-prod",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4950"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4950/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ]
}
EOF

# Register Task Definitions
echo "📝 Registering ECS Task Definitions..."
aws ecs register-task-definition --cli-input-json file://api-task-definition.json --region $AWS_REGION
aws ecs register-task-definition --cli-input-json file://mcp-task-definition.json --region $AWS_REGION
print_status "Task definitions registered"

# Step 9: Get Infrastructure Outputs
echo "🔍 Getting infrastructure information..."
VPC_ID=$(terraform output -raw vpc_id)
PRIVATE_SUBNET_IDS=$(terraform output -json private_subnet_ids | jq -r '.[]' | tr '\n' ',' | sed 's/,$//')
SECURITY_GROUP_ID=$(terraform output -raw ecs_security_group_id 2>/dev/null || echo "sg-0aa41ada8150fd640")
API_TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names memorai-api-tg-prod --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
MCP_TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names memorai-mcp-tg-prod --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")

# Step 10: Create ECS Services
echo "🚀 Creating ECS Services..."

# Create API Service
if [ ! -z "$API_TARGET_GROUP_ARN" ]; then
    aws ecs create-service \
        --cluster memorai-cluster-prod \
        --service-name memorai-api-service \
        --task-definition memorai-api-prod \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
        --load-balancers targetGroupArn=$API_TARGET_GROUP_ARN,containerName=memorai-api,containerPort=4006 \
        --region $AWS_REGION || print_warning "API service may already exist"
else
    print_warning "API Target Group not found, creating service without load balancer"
    aws ecs create-service \
        --cluster memorai-cluster-prod \
        --service-name memorai-api-service \
        --task-definition memorai-api-prod \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
        --region $AWS_REGION || print_warning "API service may already exist"
fi

# Create MCP Service
if [ ! -z "$MCP_TARGET_GROUP_ARN" ]; then
    aws ecs create-service \
        --cluster memorai-cluster-prod \
        --service-name memorai-mcp-service \
        --task-definition memorai-mcp-prod \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
        --load-balancers targetGroupArn=$MCP_TARGET_GROUP_ARN,containerName=memorai-mcp,containerPort=4950 \
        --region $AWS_REGION || print_warning "MCP service may already exist"
else
    print_warning "MCP Target Group not found, creating service without load balancer"
    aws ecs create-service \
        --cluster memorai-cluster-prod \
        --service-name memorai-mcp-service \
        --task-definition memorai-mcp-prod \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
        --region $AWS_REGION || print_warning "MCP service may already exist"
fi

print_status "ECS Services created"

# Step 11: Wait for Services to Stabilize
echo "⏳ Waiting for services to become stable..."
aws ecs wait services-stable --cluster memorai-cluster-prod --services memorai-api-service memorai-mcp-service --region $AWS_REGION

# Step 12: Display Deployment Status
echo ""
echo "🎉 MemorAI Container Deployment Complete!"
echo ""
echo "📊 Deployment Summary:"
echo "   • API Service: memorai-api-service (2 tasks)"
echo "   • MCP Service: memorai-mcp-service (2 tasks)"
echo "   • Cluster: memorai-cluster-prod"
echo "   • Region: $AWS_REGION"
echo ""
echo "🔗 Access Information:"
if [ ! -z "$API_TARGET_GROUP_ARN" ]; then
    ALB_DNS=$(aws elbv2 describe-load-balancers --names memorai-alb-prod --region $AWS_REGION --query 'LoadBalancers[0].DNSName' --output text 2>/dev/null || echo "Not available")
    echo "   • Load Balancer: https://$ALB_DNS"
    echo "   • API Health: https://$ALB_DNS/health"
    echo "   • MCP Health: https://$ALB_DNS/mcp/health"
else
    echo "   • Services running on private subnets"
    echo "   • Load balancer configuration needed"
fi
echo ""
echo "📈 Monitoring:"
echo "   • CloudWatch Logs: /ecs/memorai-api-prod, /ecs/memorai-mcp-prod"
echo "   • ECS Console: https://console.aws.amazon.com/ecs/home?region=$AWS_REGION"
echo ""
print_status "MemorAI is now running on AWS ECS!"
