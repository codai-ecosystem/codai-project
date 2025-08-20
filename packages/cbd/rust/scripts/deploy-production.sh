#!/bin/bash

# CBD Enterprise Production Deployment Script
# 
# This script automates the production deployment of CBD Enterprise Engine
# including Docker image building, Kubernetes deployment, and health checks.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="cbd-enterprise/cbd-engine"
IMAGE_TAG="${1:-latest}"
NAMESPACE="cbd-enterprise"
KUBECTL_CONTEXT="${KUBECTL_CONTEXT:-}"
DRY_RUN="${DRY_RUN:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check kubectl context
    if [[ -n "$KUBECTL_CONTEXT" ]]; then
        kubectl config use-context "$KUBECTL_CONTEXT"
    fi
    
    # Verify Kubernetes connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    cd "$PROJECT_ROOT"
    
    # Build the image
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would build docker image"
        return
    fi
    
    docker build \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:latest" \
        -f Dockerfile \
        .
    
    log_success "Docker image built successfully"
}

# Run security scan on Docker image
security_scan() {
    log_info "Running security scan on Docker image..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run security scan"
        return
    fi
    
    # Use trivy for vulnerability scanning if available
    if command -v trivy &> /dev/null; then
        trivy image --severity HIGH,CRITICAL "${IMAGE_NAME}:${IMAGE_TAG}"
    else
        log_warning "trivy not available, skipping security scan"
    fi
}

# Push Docker image to registry
push_docker_image() {
    log_info "Pushing Docker image to registry..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would push docker image"
        return
    fi
    
    # Check if we're logged into the registry
    docker push "${IMAGE_NAME}:${IMAGE_TAG}"
    docker push "${IMAGE_NAME}:latest"
    
    log_success "Docker image pushed successfully"
}

# Create namespace if it doesn't exist
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Namespace $NAMESPACE already exists"
        return
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would create namespace"
        return
    fi
    
    kubectl create namespace "$NAMESPACE"
    log_success "Namespace created successfully"
}

# Apply Kubernetes manifests
deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would apply Kubernetes manifests"
        kubectl apply -f k8s/production-deployment.yaml --dry-run=client
        return
    fi
    
    # Apply the manifests
    kubectl apply -f k8s/production-deployment.yaml
    
    log_success "Kubernetes manifests applied successfully"
}

# Wait for deployment to be ready
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would wait for deployment"
        return
    fi
    
    # Wait for deployment to be available
    kubectl wait --for=condition=available \
        --timeout=300s \
        deployment/cbd-engine \
        -n "$NAMESPACE"
    
    log_success "Deployment is ready"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run health checks"
        return
    fi
    
    # Get service endpoint
    SERVICE_IP=$(kubectl get svc cbd-engine-service -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    SERVICE_PORT=$(kubectl get svc cbd-engine-service -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')
    
    # Port forward for health check
    kubectl port-forward svc/cbd-engine-service -n "$NAMESPACE" 8080:8080 &
    PORT_FORWARD_PID=$!
    
    # Wait for port forward to establish
    sleep 5
    
    # Check health endpoint
    if curl -f -s http://localhost:8080/health > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        kill $PORT_FORWARD_PID
        exit 1
    fi
    
    # Clean up port forward
    kill $PORT_FORWARD_PID
}

# Run smoke tests
smoke_tests() {
    log_info "Running smoke tests..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run smoke tests"
        return
    fi
    
    # Port forward for smoke tests
    kubectl port-forward svc/cbd-engine-service -n "$NAMESPACE" 8080:8080 &
    PORT_FORWARD_PID=$!
    
    # Wait for port forward
    sleep 5
    
    # Test basic endpoints
    if curl -f -s http://localhost:8080/health | grep -q "healthy"; then
        log_success "Basic health endpoint test passed"
    else
        log_error "Basic health endpoint test failed"
        kill $PORT_FORWARD_PID
        exit 1
    fi
    
    # Test metrics endpoint
    if curl -f -s http://localhost:9090/metrics > /dev/null; then
        log_success "Metrics endpoint test passed"
    else
        log_warning "Metrics endpoint test failed"
    fi
    
    # Clean up
    kill $PORT_FORWARD_PID
    
    log_success "Smoke tests completed"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# CBD Enterprise Deployment Report

**Deployment Date**: $(date)
**Image Tag**: ${IMAGE_TAG}
**Namespace**: ${NAMESPACE}
**Dry Run**: ${DRY_RUN}

## Deployment Status

- Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}
- Kubernetes Namespace: ${NAMESPACE}
- Deployment Status: $(kubectl get deployment cbd-engine -n "$NAMESPACE" -o jsonpath='{.status.conditions[0].type}' 2>/dev/null || echo "Unknown")

## Pod Status

\`\`\`
$(kubectl get pods -n "$NAMESPACE" -l app=cbd-engine 2>/dev/null || echo "No pods found")
\`\`\`

## Service Status

\`\`\`
$(kubectl get svc -n "$NAMESPACE" 2>/dev/null || echo "No services found")
\`\`\`

## Resource Usage

\`\`\`
$(kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Resource usage data not available")
\`\`\`

## Deployment Configuration

- Replicas: 3
- CPU Request: 1 core
- CPU Limit: 4 cores
- Memory Request: 2Gi
- Memory Limit: 8Gi
- Storage: 500Gi (data), 100Gi (logs)

EOF
    
    log_success "Deployment report generated: $REPORT_FILE"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would rollback deployment"
        return
    fi
    
    kubectl rollout undo deployment/cbd-engine -n "$NAMESPACE"
    
    # Wait for rollback to complete
    kubectl rollout status deployment/cbd-engine -n "$NAMESPACE"
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Kill any background processes
    jobs -p | xargs -r kill
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting CBD Enterprise production deployment..."
    log_info "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
    log_info "Namespace: ${NAMESPACE}"
    log_info "Dry Run: ${DRY_RUN}"
    
    # Trap cleanup function
    trap cleanup EXIT
    
    # Check prerequisites
    check_prerequisites
    
    # Build and push Docker image
    build_docker_image
    security_scan
    
    if [[ "$DRY_RUN" != "true" ]]; then
        push_docker_image
    fi
    
    # Deploy to Kubernetes
    create_namespace
    deploy_to_kubernetes
    
    if [[ "$DRY_RUN" != "true" ]]; then
        wait_for_deployment
        health_check
        smoke_tests
    fi
    
    # Generate report
    generate_report
    
    log_success "CBD Enterprise deployment completed successfully!"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [IMAGE_TAG]

Environment Variables:
  KUBECTL_CONTEXT - Kubernetes context to use
  DRY_RUN         - Set to 'true' for dry run mode

Examples:
  $0                    # Deploy with 'latest' tag
  $0 v1.0.0            # Deploy with specific tag
  DRY_RUN=true $0      # Dry run mode
  
Options:
  --rollback    Rollback to previous deployment
  --help        Show this help message
EOF
}

# Handle command line arguments
case "${1:-}" in
    --help)
        usage
        exit 0
        ;;
    --rollback)
        rollback
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
