#!/bin/bash
set -euo pipefail

# MemorAI Enterprise Deployment Script
# This script deploys the complete enterprise architecture

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="memorai-enterprise"

# Functions
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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local tools=("terraform" "kubectl" "helm" "aws" "docker")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon not running"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

generate_secrets() {
    log_info "Generating secure secrets..."
    
    # Generate random passwords and tokens
    DB_PASSWORD=$(openssl rand -base64 32)
    REDIS_AUTH_TOKEN=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    CBD_API_KEY=$(openssl rand -base64 32)
    
    # Save to .env file
    cat > "${PROJECT_ROOT}/.env.production" << EOF
# MemorAI Enterprise Environment Configuration
ENVIRONMENT=${ENVIRONMENT}
AWS_REGION=${AWS_REGION}

# Database Configuration
DB_PASSWORD=${DB_PASSWORD}
REDIS_AUTH_TOKEN=${REDIS_AUTH_TOKEN}

# Application Secrets
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CBD_API_KEY=${CBD_API_KEY}

# OpenAI API Key (set this manually)
OPENAI_API_KEY=your-openai-api-key-here

# Domain Configuration (optional)
DOMAIN_NAME=${DOMAIN_NAME:-}
EOF
    
    log_success "Secrets generated and saved to .env.production"
    log_warning "Please update OPENAI_API_KEY in .env.production with your actual API key"
}

deploy_infrastructure() {
    log_info "Deploying AWS infrastructure with Terraform..."
    
    cd "${PROJECT_ROOT}/infrastructure/aws"
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    log_info "Planning infrastructure deployment..."
    terraform plan \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -var="db_password=${DB_PASSWORD}" \
        -var="redis_auth_token=${REDIS_AUTH_TOKEN}" \
        -var="domain_name=${DOMAIN_NAME:-}" \
        -out=tfplan
    
    # Apply deployment
    log_info "Applying infrastructure deployment..."
    terraform apply tfplan
    
    # Save outputs
    terraform output -json > "${PROJECT_ROOT}/terraform-outputs.json"
    
    log_success "Infrastructure deployed successfully"
}

configure_kubernetes() {
    log_info "Configuring Kubernetes access..."
    
    # Update kubeconfig
    aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"
    
    # Verify connection
    kubectl cluster-info
    
    log_success "Kubernetes configured successfully"
}

install_core_components() {
    log_info "Installing core Kubernetes components..."
    
    # Add Helm repositories
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo add jetstack https://charts.jetstack.io
    helm repo add istio https://istio-release.storage.googleapis.com/charts
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Install cert-manager
    log_info "Installing cert-manager..."
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true \
        --wait
    
    # Install Istio
    log_info "Installing Istio service mesh..."
    helm upgrade --install istio-base istio/base \
        --namespace istio-system \
        --create-namespace \
        --wait
    
    helm upgrade --install istiod istio/istiod \
        --namespace istio-system \
        --wait
    
    helm upgrade --install istio-gateway istio/gateway \
        --namespace istio-system \
        --wait
    
    # Install monitoring stack
    log_info "Installing monitoring stack..."
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi \
        --set grafana.adminPassword=admin123 \
        --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=10Gi \
        --wait
    
    log_success "Core components installed successfully"
}

build_and_push_images() {
    log_info "Building and pushing container images..."
    
    # Get ECR registry URL from Terraform outputs
    local ecr_registry=$(jq -r '.ecr_registry_url.value' "${PROJECT_ROOT}/terraform-outputs.json" 2>/dev/null || echo "")
    
    if [[ -z "$ecr_registry" ]]; then
        log_warning "ECR registry not found, using Docker Hub"
        local registry="codai"
    else
        local registry="$ecr_registry"
        # Login to ECR
        aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "$ecr_registry"
    fi
    
    # Build CBD image
    log_info "Building CBD Enterprise image..."
    docker build -t "${registry}/cbd:latest" -f "${PROJECT_ROOT}/docker/enterprise/Dockerfile.cbd" "${PROJECT_ROOT}"
    docker push "${registry}/cbd:latest"
    
    # Build MemorAI MCP image
    log_info "Building MemorAI MCP Enterprise image..."
    docker build -t "${registry}/memorai-mcp:latest" -f "${PROJECT_ROOT}/docker/enterprise/Dockerfile.memorai-mcp" "${PROJECT_ROOT}"
    docker push "${registry}/memorai-mcp:latest"
    
    log_success "Container images built and pushed successfully"
}

create_kubernetes_secrets() {
    log_info "Creating Kubernetes secrets..."
    
    # Get database and Redis connection details from Terraform outputs
    local db_endpoint=$(jq -r '.rds_instance_endpoint.value' "${PROJECT_ROOT}/terraform-outputs.json")
    local redis_endpoint=$(jq -r '.elasticache_redis_primary_endpoint_address.value' "${PROJECT_ROOT}/terraform-outputs.json")
    
    # Create namespaces
    kubectl apply -f "${PROJECT_ROOT}/k8s/base/namespaces.yaml"
    
    # Enable Istio injection
    kubectl label namespace memorai-system istio-injection=enabled --overwrite
    
    # Create secrets
    kubectl create secret generic memorai-secrets \
        --namespace=memorai-system \
        --from-literal="database-url=postgresql://memorai_admin:${DB_PASSWORD}@${db_endpoint}/memorai" \
        --from-literal="redis-url=redis://:${REDIS_AUTH_TOKEN}@${redis_endpoint}:6379" \
        --from-literal="cbd-api-key=${CBD_API_KEY}" \
        --from-literal="jwt-secret=${JWT_SECRET}" \
        --from-literal="encryption-key=${ENCRYPTION_KEY}" \
        --from-literal="openai-api-key=${OPENAI_API_KEY:-}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Kubernetes secrets created successfully"
}

deploy_applications() {
    log_info "Deploying MemorAI applications..."
    
    # Create storage class for encrypted volumes
    kubectl apply -f - << EOF
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
EOF
    
    # Deploy CBD Vector Database
    log_info "Deploying CBD Vector Database..."
    kubectl apply -f "${PROJECT_ROOT}/k8s/services/cbd-vector-db.yaml"
    
    # Wait for CBD to be ready
    kubectl wait --for=condition=ready pod -l app=cbd-vector-db -n memorai-system --timeout=600s
    
    # Deploy MemorAI MCP Server
    log_info "Deploying MemorAI MCP Server..."
    kubectl apply -f "${PROJECT_ROOT}/k8s/services/memorai-mcp.yaml"
    
    # Wait for MemorAI to be ready
    kubectl wait --for=condition=available deployment/memorai-mcp -n memorai-system --timeout=300s
    
    log_success "Applications deployed successfully"
}

configure_ingress() {
    log_info "Configuring ingress and load balancing..."
    
    # Create Istio Gateway and VirtualService
    kubectl apply -f - << EOF
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
EOF
    
    log_success "Ingress configured successfully"
}

run_health_checks() {
    log_info "Running comprehensive health checks..."
    
    # Check cluster status
    kubectl cluster-info
    kubectl get nodes
    
    # Check service status
    kubectl get all -n memorai-system
    kubectl get all -n monitoring
    kubectl get all -n istio-system
    
    # Check pod logs for errors
    log_info "Checking pod logs..."
    kubectl logs -l app=cbd-vector-db -n memorai-system --tail=50 | grep -i error || true
    kubectl logs -l app=memorai-mcp -n memorai-system --tail=50 | grep -i error || true
    
    # Test API endpoints
    log_info "Testing API endpoints..."
    local gateway_ip=$(kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    
    if [[ "$gateway_ip" != "pending" && "$gateway_ip" != "" ]]; then
        log_info "Gateway IP: $gateway_ip"
        
        # Test health endpoints
        if curl -f "http://$gateway_ip/health" &> /dev/null; then
            log_success "Health endpoint accessible"
        else
            log_warning "Health endpoint not yet accessible"
        fi
    else
        log_warning "Load balancer IP still pending"
    fi
    
    log_success "Health checks completed"
}

display_access_info() {
    log_info "Deployment completed! Access information:"
    
    local gateway_ip=$(kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    local grafana_password="admin123"
    
    echo ""
    echo "🚀 MemorAI Enterprise Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "📊 Monitoring & Dashboards:"
    echo "  Grafana: kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
    echo "  Username: admin, Password: $grafana_password"
    echo "  Prometheus: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"
    echo ""
    echo "🔗 API Endpoints:"
    if [[ "$gateway_ip" != "pending" && "$gateway_ip" != "" ]]; then
        echo "  Gateway IP: $gateway_ip"
        echo "  MemorAI MCP API: http://$gateway_ip/api/v1/mcp"
        echo "  CBD Vector API: http://$gateway_ip/api/v1/vector"
        echo "  Health Check: http://$gateway_ip/health"
    else
        echo "  Gateway IP: pending (run 'kubectl get svc istio-gateway -n istio-system' to check)"
    fi
    echo ""
    echo "🔧 Management Commands:"
    echo "  View services: kubectl get all -n memorai-system"
    echo "  View logs: kubectl logs -f deployment/memorai-mcp -n memorai-system"
    echo "  Scale services: kubectl scale deployment memorai-mcp --replicas=10 -n memorai-system"
    echo ""
    echo "📖 Documentation:"
    echo "  Architecture: $PROJECT_ROOT/MEMORAI_ENTERPRISE_DEPLOYMENT_ARCHITECTURE.md"
    echo "  Guide: $PROJECT_ROOT/MEMORAI_ENTERPRISE_DEPLOYMENT_GUIDE.md"
    echo ""
    
    if [[ -z "${OPENAI_API_KEY:-}" ]]; then
        log_warning "Don't forget to set OPENAI_API_KEY in your environment!"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "${PROJECT_ROOT}/terraform-outputs.json"
}

main() {
    log_info "Starting MemorAI Enterprise Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "AWS Region: $AWS_REGION"
    
    # Check if .env.production exists and source it
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        log_info "Loading environment from .env.production"
        set -a
        source "${PROJECT_ROOT}/.env.production"
        set +a
    fi
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Execute deployment steps
    check_prerequisites
    
    # Generate secrets if not already done
    if [[ ! -f "${PROJECT_ROOT}/.env.production" ]]; then
        generate_secrets
        log_warning "Generated new secrets. Please review .env.production and re-run if needed."
        exit 0
    fi
    
    deploy_infrastructure
    configure_kubernetes
    install_core_components
    build_and_push_images
    create_kubernetes_secrets
    deploy_applications
    configure_ingress
    
    # Wait a bit for everything to settle
    log_info "Waiting for services to stabilize..."
    sleep 30
    
    run_health_checks
    display_access_info
    
    log_success "🎉 MemorAI Enterprise deployment completed successfully!"
}

# Run main function
main "$@"
