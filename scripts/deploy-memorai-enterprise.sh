#!/bin/bash

# MemorAI Enterprise Production Deployment Script
# Phase 2: Infrastructure Deployment and Service Provisioning

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRASTRUCTURE_DIR="$PROJECT_ROOT/infrastructure"
K8S_DIR="$INFRASTRUCTURE_DIR/k8s"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check required tools
    local required_tools=("terraform" "kubectl" "aws" "docker" "helm")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi
    
    # Check required environment variables
    local required_vars=("AWS_ACCOUNT_ID" "AWS_REGION" "DOMAIN_NAME" "DB_PASSWORD" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Prerequisites validation passed"
}

# Infrastructure deployment
deploy_infrastructure() {
    log_info "Deploying AWS infrastructure with Terraform..."
    
    cd "$INFRASTRUCTURE_DIR/aws"
    
    # Initialize Terraform
    terraform init -upgrade
    
    # Plan deployment
    terraform plan \
        -var="aws_account_id=$AWS_ACCOUNT_ID" \
        -var="aws_region=$AWS_REGION" \
        -var="domain_name=$DOMAIN_NAME" \
        -var="db_password=$DB_PASSWORD" \
        -var="jwt_secret=$JWT_SECRET" \
        -out=tfplan
    
    # Apply infrastructure
    log_info "Applying Terraform configuration..."
    terraform apply tfplan
    
    # Extract outputs
    export CLUSTER_NAME=$(terraform output -raw cluster_name)
    export CLUSTER_ENDPOINT=$(terraform output -raw cluster_endpoint)
    export RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    export REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
    export VPC_ID=$(terraform output -raw vpc_id)
    
    log_success "Infrastructure deployment completed"
}

# Kubernetes cluster configuration
configure_kubernetes() {
    log_info "Configuring Kubernetes cluster access..."
    
    # Update kubeconfig
    aws eks update-kubeconfig \
        --region "$AWS_REGION" \
        --name "$CLUSTER_NAME"
    
    # Verify cluster connectivity
    kubectl cluster-info
    
    # Install AWS Load Balancer Controller
    log_info "Installing AWS Load Balancer Controller..."
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        --namespace kube-system \
        --set clusterName="$CLUSTER_NAME" \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller
    
    # Install Cluster Autoscaler
    log_info "Installing Cluster Autoscaler..."
    helm install cluster-autoscaler eks/cluster-autoscaler \
        --namespace kube-system \
        --set autoDiscovery.clusterName="$CLUSTER_NAME" \
        --set awsRegion="$AWS_REGION"
    
    log_success "Kubernetes cluster configuration completed"
}

# Docker image building and pushing
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    local ecr_registry="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ecr_registry"
    
    # Build and push CBD Enterprise
    log_info "Building CBD Enterprise image..."
    cd "$PROJECT_ROOT/packages/cbd"
    docker build -t "$ecr_registry/memorai/cbd-enterprise:latest" \
        -f Dockerfile.enterprise .
    docker push "$ecr_registry/memorai/cbd-enterprise:latest"
    
    # Build and push MemorAI Backend
    log_info "Building MemorAI Backend image..."
    cd "$PROJECT_ROOT/packages/memorai"
    docker build -t "$ecr_registry/memorai/backend:latest" .
    docker push "$ecr_registry/memorai/backend:latest"
    
    # Build and push MemorAI Frontend
    log_info "Building MemorAI Frontend image..."
    cd "$PROJECT_ROOT/apps/memorai"
    docker build -t "$ecr_registry/memorai/frontend:latest" .
    docker push "$ecr_registry/memorai/frontend:latest"
    
    # Build and push MemorAI MCP
    log_info "Building MemorAI MCP image..."
    cd "$PROJECT_ROOT/packages/@codai/memorai-mcp"
    docker build -t "$ecr_registry/memorai/mcp:latest" .
    docker push "$ecr_registry/memorai/mcp:latest"
    
    log_success "Docker images built and pushed successfully"
}

# Deploy Kubernetes resources
deploy_kubernetes_resources() {
    log_info "Deploying Kubernetes resources..."
    
    # Update image references in manifests
    local ecr_registry="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Deploy namespaces
    kubectl apply -f "$K8S_DIR/namespaces/memorai-namespaces.yaml"
    
    # Deploy ConfigMaps
    kubectl apply -f "$K8S_DIR/configmaps/memorai-configs.yaml"
    
    # Deploy Secrets (with actual values)
    envsubst < "$K8S_DIR/secrets/memorai-secrets.yaml" | kubectl apply -f -
    
    # Deploy CBD Enterprise
    envsubst < "$K8S_DIR/services/memorai-enterprise/cbd-enterprise.yaml" | kubectl apply -f -
    
    # Deploy MemorAI Backend
    envsubst < "$K8S_DIR/services/memorai-enterprise/memorai-backend.yaml" | kubectl apply -f -
    
    # Deploy MemorAI Frontend
    envsubst < "$K8S_DIR/services/memorai-enterprise/memorai-frontend.yaml" | kubectl apply -f -
    
    # Deploy MemorAI MCP
    envsubst < "$K8S_DIR/services/memorai-enterprise/memorai-mcp.yaml" | kubectl apply -f -
    
    # Deploy Ingress
    envsubst < "$K8S_DIR/ingress/memorai-ingress.yaml" | kubectl apply -f -
    
    log_success "Kubernetes resources deployed successfully"
}

# Health check and validation
validate_deployment() {
    log_info "Validating deployment health..."
    
    # Wait for pods to be ready
    log_info "Waiting for CBD Enterprise pods..."
    kubectl wait --for=condition=ready pod -l app=cbd-enterprise -n memorai-production --timeout=600s
    
    log_info "Waiting for MemorAI Backend pods..."
    kubectl wait --for=condition=ready pod -l app=memorai-backend -n memorai-production --timeout=600s
    
    log_info "Waiting for MemorAI Frontend pods..."
    kubectl wait --for=condition=ready pod -l app=memorai-frontend -n memorai-production --timeout=600s
    
    log_info "Waiting for MemorAI MCP pods..."
    kubectl wait --for=condition=ready pod -l app=memorai-mcp -n memorai-production --timeout=600s
    
    # Check service endpoints
    log_info "Checking service endpoints..."
    kubectl get svc -n memorai-production
    
    # Check ingress
    log_info "Checking ingress configuration..."
    kubectl get ingress -n memorai-production
    
    # Run basic health checks
    log_info "Running health checks..."
    local frontend_url="https://memorai.$DOMAIN_NAME"
    local backend_url="https://api.memorai.$DOMAIN_NAME/health"
    local mcp_url="https://mcp.memorai.$DOMAIN_NAME/health"
    
    # Wait for DNS propagation and ALB provisioning
    sleep 120
    
    # Test endpoints
    if curl -f -s "$backend_url" > /dev/null; then
        log_success "Backend health check passed"
    else
        log_warning "Backend health check failed - may need more time for ALB provisioning"
    fi
    
    log_success "Deployment validation completed"
}

# Monitoring setup
setup_monitoring() {
    log_info "Setting up monitoring and observability..."
    
    # Install Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    helm install prometheus prometheus-community/kube-prometheus-stack \
        --namespace memorai-monitoring \
        --create-namespace \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
        --set grafana.persistence.enabled=true \
        --set grafana.persistence.size=10Gi
    
    # Install AWS CloudWatch Container Insights
    kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/cloudwatch-namespace.yaml
    
    log_success "Monitoring setup completed"
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Check logs above for details."
        log_info "To cleanup partial deployment, run: ./cleanup-deployment.sh"
    fi
}

# Main deployment flow
main() {
    log_info "Starting MemorAI Enterprise Production Deployment"
    
    trap cleanup EXIT
    
    # Phase 1: Validation
    check_prerequisites
    
    # Phase 2: Infrastructure
    deploy_infrastructure
    
    # Phase 3: Kubernetes
    configure_kubernetes
    
    # Phase 4: Container Images
    build_and_push_images
    
    # Phase 5: Application Deployment
    deploy_kubernetes_resources
    
    # Phase 6: Validation
    validate_deployment
    
    # Phase 7: Monitoring
    setup_monitoring
    
    log_success "MemorAI Enterprise deployment completed successfully!"
    log_info "Access points:"
    log_info "  Frontend: https://memorai.$DOMAIN_NAME"
    log_info "  Backend API: https://api.memorai.$DOMAIN_NAME"
    log_info "  MCP Server: https://mcp.memorai.$DOMAIN_NAME"
    log_info "  Monitoring: kubectl port-forward -n memorai-monitoring svc/prometheus-grafana 3000:80"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "validate")
        validate_deployment
        ;;
    "cleanup")
        log_info "Cleanup not implemented in this script"
        log_info "Use Terraform destroy and kubectl delete commands manually"
        ;;
    *)
        echo "Usage: $0 [deploy|validate|cleanup]"
        exit 1
        ;;
esac
