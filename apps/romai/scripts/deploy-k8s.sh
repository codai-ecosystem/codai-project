#!/bin/bash

# 🚀 RomAI Enterprise Kubernetes Deployment Script
# Production-grade deployment automation for on-premise installations

set -euo pipefail

# Configuration
NAMESPACE="romai-enterprise"
KUBECTL_TIMEOUT="300s"
DOCKER_REGISTRY="your-registry.com"
VERSION="${VERSION:-latest}"

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
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build AGI model server
    log_info "Building RomAI AGI model server..."
    docker build -t "${DOCKER_REGISTRY}/romai/agi:${VERSION}" -f apps/romai/Dockerfile.agi .
    
    # Build Enterprise API
    log_info "Building RomAI Enterprise API..."
    docker build -t "${DOCKER_REGISTRY}/romai/enterprise-api:${VERSION}" -f apps/romai/Dockerfile.enterprise .
    
    # Build Frontend
    log_info "Building RomAI Frontend..."
    docker build -t "${DOCKER_REGISTRY}/romai/frontend:${VERSION}" -f apps/romai/Dockerfile .
    
    log_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    docker push "${DOCKER_REGISTRY}/romai/agi:${VERSION}"
    docker push "${DOCKER_REGISTRY}/romai/enterprise-api:${VERSION}"
    docker push "${DOCKER_REGISTRY}/romai/frontend:${VERSION}"
    
    log_success "Images pushed to registry"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Create namespace and basic resources
    log_info "Creating namespace and configurations..."
    kubectl apply -f apps/romai/k8s/00-namespace.yaml
    
    # Wait for namespace to be ready
    kubectl wait --for=condition=Ready namespace/${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy database layer
    log_info "Deploying PostgreSQL database..."
    kubectl apply -f apps/romai/k8s/01-postgres.yaml
    kubectl wait --for=condition=available deployment/postgres -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy Redis cache
    log_info "Deploying Redis cache..."
    kubectl apply -f apps/romai/k8s/02-redis.yaml
    kubectl wait --for=condition=available deployment/redis -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy RomAI AGI
    log_info "Deploying RomAI AGI model server..."
    kubectl apply -f apps/romai/k8s/03-romai-agi.yaml
    kubectl wait --for=condition=available deployment/romai-agi -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy Enterprise API
    log_info "Deploying RomAI Enterprise API..."
    kubectl apply -f apps/romai/k8s/04-enterprise-api.yaml
    kubectl wait --for=condition=available deployment/romai-enterprise-api -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy Ingress
    log_info "Deploying Ingress controller..."
    kubectl apply -f apps/romai/k8s/05-ingress.yaml
    
    # Deploy monitoring
    log_info "Deploying monitoring stack..."
    kubectl apply -f apps/romai/k8s/06-monitoring.yaml
    kubectl wait --for=condition=available deployment/prometheus -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=available deployment/grafana -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    log_success "Kubernetes deployment completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check all pods are running
    log_info "Checking pod status..."
    kubectl get pods -n ${NAMESPACE}
    
    # Check services
    log_info "Checking services..."
    kubectl get services -n ${NAMESPACE}
    
    # Check ingress
    log_info "Checking ingress..."
    kubectl get ingress -n ${NAMESPACE}
    
    # Health checks
    log_info "Performing health checks..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=ready pod -l app=romai-agi -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=ready pod -l app=romai-enterprise-api -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    log_success "Deployment verification completed"
}

# Main deployment function
main() {
    log_info "Starting RomAI Enterprise deployment..."
    log_info "Version: ${VERSION}"
    log_info "Registry: ${DOCKER_REGISTRY}"
    log_info "Namespace: ${NAMESPACE}"
    
    check_prerequisites
    
    if [[ "${1:-}" == "--build" ]]; then
        build_images
        push_images
    fi
    
    deploy_kubernetes
    verify_deployment
    
    log_success "🎉 RomAI Enterprise deployment completed successfully!"
    log_info "Access your deployment:"
    log_info "  - Frontend: https://romai.enterprise.com"
    log_info "  - API: https://api.romai.enterprise.com"
    log_info "  - AGI: https://agi.romai.enterprise.com"
    log_info "  - Grafana: https://grafana.romai.enterprise.com"
    log_info "  - Prometheus: https://prometheus.romai.enterprise.com"
    
    log_warning "Don't forget to:"
    log_warning "  1. Update DNS records to point to your ingress IP"
    log_warning "  2. Configure SSL certificates"
    log_warning "  3. Set up backup procedures"
    log_warning "  4. Configure monitoring alerts"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
