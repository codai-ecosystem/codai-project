#!/bin/bash

# CODAI Ecosystem Deployment Script
# This script deploys the complete CODAI ecosystem to AWS EKS

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
CLUSTER_NAME="codai-ecosystem"
TERRAFORM_DIR="infrastructure/aws"
K8S_MANIFESTS_DIR="infrastructure/k8s"
DOCKER_REGISTRY_PREFIX=""

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install it first."
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install it first."
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
    fi
    
    # Check Helm
    if ! command -v helm &> /dev/null; then
        error "Helm is not installed. Please install it first."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured or invalid."
    fi
    
    log "All prerequisites satisfied ✓"
}

# Initialize Terraform
init_terraform() {
    log "Initializing Terraform..."
    cd "$TERRAFORM_DIR"
    
    terraform init
    terraform validate
    
    log "Terraform initialized successfully ✓"
    cd - > /dev/null
}

# Plan Terraform deployment
plan_terraform() {
    log "Planning Terraform deployment..."
    cd "$TERRAFORM_DIR"
    
    terraform plan -var="aws_region=$AWS_REGION" -out=tfplan
    
    log "Terraform plan completed ✓"
    cd - > /dev/null
}

# Apply Terraform infrastructure
apply_terraform() {
    log "Deploying AWS infrastructure with Terraform..."
    cd "$TERRAFORM_DIR"
    
    terraform apply tfplan
    
    # Get outputs
    CLUSTER_ENDPOINT=$(terraform output -raw cluster_endpoint)
    ECR_REGISTRY=$(terraform output -raw ecr_registry_url)
    
    log "AWS infrastructure deployed successfully ✓"
    log "EKS Cluster Endpoint: $CLUSTER_ENDPOINT"
    log "ECR Registry: $ECR_REGISTRY"
    
    cd - > /dev/null
}

# Configure kubectl
configure_kubectl() {
    log "Configuring kubectl for EKS cluster..."
    
    aws eks update-kubeconfig --region "$AWS_REGION" --name "$CLUSTER_NAME"
    
    # Test connection
    kubectl cluster-info
    
    log "kubectl configured successfully ✓"
}

# Install AWS Load Balancer Controller
install_aws_load_balancer_controller() {
    log "Installing AWS Load Balancer Controller..."
    
    # Download IAM policy
    curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.4/docs/install/iam_policy.json
    
    # Get account ID
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    # Create IAM policy if it doesn't exist
    aws iam create-policy \
        --policy-name AWSLoadBalancerControllerIAMPolicy \
        --policy-document file://iam_policy.json || true
    
    # Add EKS Helm repository
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    # Install AWS Load Balancer Controller
    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName="$CLUSTER_NAME" \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller \
        --set region="$AWS_REGION" \
        --set vpcId=$(aws eks describe-cluster --name "$CLUSTER_NAME" --query "cluster.resourcesVpcConfig.vpcId" --output text)
    
    rm -f iam_policy.json
    
    log "AWS Load Balancer Controller installed successfully ✓"
}

# Install External DNS
install_external_dns() {
    log "Installing External DNS..."
    
    # Add Bitnami Helm repository
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Get account ID and OIDC issuer
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    OIDC_ISSUER=$(aws eks describe-cluster --name "$CLUSTER_NAME" --query "cluster.identity.oidc.issuer" --output text)
    
    # Install External DNS
    helm upgrade --install external-dns bitnami/external-dns \
        --namespace kube-system \
        --set provider=aws \
        --set aws.region="$AWS_REGION" \
        --set txtOwnerId="$CLUSTER_NAME" \
        --set domainFilters[0]=codai.ro \
        --set domainFilters[1]=memorai.ro \
        --set domainFilters[2]=controlai.ro \
        --set domainFilters[3]=romai.ro \
        --set policy=sync
    
    log "External DNS installed successfully ✓"
}

# Install Cluster Autoscaler
install_cluster_autoscaler() {
    log "Installing Cluster Autoscaler..."
    
    # Add autoscaler Helm repository
    helm repo add autoscaler https://kubernetes.github.io/autoscaler
    helm repo update
    
    # Install Cluster Autoscaler
    helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler \
        --namespace kube-system \
        --set autoDiscovery.clusterName="$CLUSTER_NAME" \
        --set awsRegion="$AWS_REGION" \
        --set rbac.serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/codai-cluster-autoscaler"
    
    log "Cluster Autoscaler installed successfully ✓"
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    # Get ECR login token
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
    
    # Services to build
    declare -a services=(
        "apps/id:id-service"
        "apps/gateway:gateway-service"
        "apps/hub:hub-service"
        "apps/admin:admin-service"
        "apps/memorai:memorai-frontend"
        "packages/memorai:memorai-backend"
        "packages/cbd:cbd-service"
        "packages/@codai/memorai-mcp:memorai-mcp"
        "apps/controlai-dashboard:controlai-dashboard"
        "packages/controlai-mcp:controlai-mcp"
        "apps/romai:romai-frontend"
    )
    
    for service in "${services[@]}"; do
        IFS=":" read -r path name <<< "$service"
        
        if [ -d "$path" ]; then
            log "Building $name from $path..."
            
            # Create Dockerfile if it doesn't exist
            if [ ! -f "$path/Dockerfile" ]; then
                create_dockerfile "$path" "$name"
            fi
            
            # Build and push image
            docker build -t "$name:latest" "$path"
            docker tag "$name:latest" "$ECR_REGISTRY/$name:latest"
            docker push "$ECR_REGISTRY/$name:latest"
            
            log "Built and pushed $name ✓"
        else
            warn "Directory $path does not exist, skipping $name"
        fi
    done
    
    log "All Docker images built and pushed successfully ✓"
}

# Create Dockerfile for services that don't have one
create_dockerfile() {
    local service_path="$1"
    local service_name="$2"
    
    log "Creating Dockerfile for $service_name..."
    
    # Check if it's a Node.js project
    if [ -f "$service_path/package.json" ]; then
        cat > "$service_path/Dockerfile" << EOF
# Multi-stage build for $service_name
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
EOF
    else
        warn "Unsupported project type for $service_name, skipping Dockerfile creation"
    fi
}

# Deploy Kubernetes manifests
deploy_k8s_manifests() {
    log "Deploying Kubernetes manifests..."
    
    # Update image references in manifests
    update_image_references
    
    # Apply manifests in order
    kubectl apply -f "$K8S_MANIFESTS_DIR/core-services.yaml"
    kubectl apply -f "$K8S_MANIFESTS_DIR/memorai-services.yaml"
    kubectl apply -f "$K8S_MANIFESTS_DIR/controlai-romai-services.yaml"
    kubectl apply -f "$K8S_MANIFESTS_DIR/ingress.yaml"
    kubectl apply -f "$K8S_MANIFESTS_DIR/monitoring.yaml"
    
    log "Kubernetes manifests deployed successfully ✓"
}

# Update image references in manifests
update_image_references() {
    log "Updating image references in manifests..."
    
    # Replace placeholder ECR URLs with actual registry
    find "$K8S_MANIFESTS_DIR" -name "*.yaml" -exec sed -i.bak "s|\${aws_ecr_repository\.\([^}]*\)\.repository_url}|$ECR_REGISTRY/\1|g" {} \;
    
    # Clean up backup files
    find "$K8S_MANIFESTS_DIR" -name "*.bak" -delete
    
    log "Image references updated ✓"
}

# Wait for deployments to be ready
wait_for_deployments() {
    log "Waiting for deployments to be ready..."
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-core
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-services
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-apis
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-mcps
    kubectl wait --for=condition=available --timeout=600s deployment --all -n monitoring
    
    log "All deployments are ready ✓"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check pod status
    info "Pod Status:"
    kubectl get pods --all-namespaces
    
    # Check service status
    info "Service Status:"
    kubectl get services --all-namespaces
    
    # Check ingress status
    info "Ingress Status:"
    kubectl get ingress --all-namespaces
    
    # Get load balancer endpoints
    info "Load Balancer Endpoints:"
    kubectl get ingress --all-namespaces -o jsonpath='{range .items[*]}{.spec.rules[*].host}{"\n"}{end}' | sort | uniq
    
    log "Deployment verification completed ✓"
}

# Clean up function
cleanup() {
    if [ "$1" = "full" ]; then
        log "Performing full cleanup..."
        
        # Delete Kubernetes resources
        kubectl delete -f "$K8S_MANIFESTS_DIR" --ignore-not-found=true
        
        # Destroy Terraform infrastructure
        cd "$TERRAFORM_DIR"
        terraform destroy -var="aws_region=$AWS_REGION" -auto-approve
        cd - > /dev/null
        
        log "Full cleanup completed ✓"
    else
        log "Performing partial cleanup..."
        
        # Delete only Kubernetes resources
        kubectl delete -f "$K8S_MANIFESTS_DIR" --ignore-not-found=true
        
        log "Partial cleanup completed ✓"
    fi
}

# Main deployment function
main() {
    case "${1:-deploy}" in
        "deploy")
            log "Starting CODAI Ecosystem deployment..."
            check_prerequisites
            init_terraform
            plan_terraform
            apply_terraform
            configure_kubectl
            install_aws_load_balancer_controller
            install_external_dns
            install_cluster_autoscaler
            build_and_push_images
            deploy_k8s_manifests
            wait_for_deployments
            verify_deployment
            log "CODAI Ecosystem deployment completed successfully! 🎉"
            ;;
        "cleanup")
            cleanup "${2:-partial}"
            ;;
        "verify")
            verify_deployment
            ;;
        "images")
            build_and_push_images
            ;;
        "k8s")
            deploy_k8s_manifests
            wait_for_deployments
            verify_deployment
            ;;
        *)
            echo "Usage: $0 {deploy|cleanup|verify|images|k8s}"
            echo "  deploy  - Full deployment (default)"
            echo "  cleanup - Clean up resources (partial|full)"
            echo "  verify  - Verify existing deployment"
            echo "  images  - Build and push Docker images only"
            echo "  k8s     - Deploy Kubernetes manifests only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
