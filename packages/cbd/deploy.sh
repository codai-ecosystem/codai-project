#!/bin/bash
# 🚀 CBD Universal Database - Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
CBD_VERSION="${CBD_VERSION:-4.0.0}"
REGISTRY="${REGISTRY:-cbd-registry.codai.ai}"
NAMESPACE="${NAMESPACE:-cbd-production}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_header "Pre-Deployment Validation"
    
    # Check if services are running
    log_info "Checking CBD services health..."
    
    if curl -f -s http://localhost:4180/health > /dev/null; then
        log_success "CBD Core Database: HEALTHY"
    else
        log_error "CBD Core Database: NOT RESPONDING"
        exit 1
    fi
    
    if curl -f -s http://localhost:4600/health > /dev/null; then
        log_success "CBD Collaboration Service: HEALTHY"
    else
        log_warning "CBD Collaboration Service: NOT RESPONDING"
    fi
    
    if curl -f -s http://localhost:4700/health > /dev/null; then
        log_success "CBD AI Analytics Engine: HEALTHY"
    else
        log_warning "CBD AI Analytics Engine: NOT RESPONDING"
    fi
    
    if curl -f -s http://localhost:4800/health > /dev/null; then
        log_success "CBD GraphQL Gateway: HEALTHY"
    else
        log_warning "CBD GraphQL Gateway: NOT RESPONDING"
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        log_success "Docker: AVAILABLE"
    else
        log_error "Docker: NOT FOUND"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        log_success "Docker Compose: AVAILABLE"
    else
        log_error "Docker Compose: NOT FOUND"
        exit 1
    fi
}

# Build Docker images
build_images() {
    log_header "Building Production Docker Images"
    
    log_info "Building CBD Universal Database image..."
    docker build \
        --tag ${REGISTRY}/cbd-universal:${CBD_VERSION} \
        --tag ${REGISTRY}/cbd-universal:latest \
        --file Dockerfile \
        --build-arg NODE_ENV=production \
        --build-arg CBD_VERSION=${CBD_VERSION} \
        .
    
    log_success "Docker image built successfully"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log_header "Deploying with Docker Compose"
    
    # Set environment variables
    export CBD_VERSION=${CBD_VERSION}
    export DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
    
    log_info "Starting CBD services..."
    docker-compose -f docker-compose.production.yml up -d
    
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    for i in {1..10}; do
        if curl -f -s http://localhost/health > /dev/null; then
            log_success "CBD services are healthy and ready!"
            break
        else
            log_info "Waiting for services... (attempt $i/10)"
            sleep 10
        fi
    done
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_header "Deploying to Kubernetes"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Skipping Kubernetes deployment."
        return 1
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    log_info "Applying Kubernetes manifests..."
    
    # Deploy ConfigMap
    kubectl apply -f k8s/configmap.yaml -n ${NAMESPACE}
    
    # Deploy Secrets
    kubectl apply -f k8s/secrets.yaml -n ${NAMESPACE}
    
    # Deploy PersistentVolumeClaims
    kubectl apply -f k8s/pvc.yaml -n ${NAMESPACE}
    
    # Deploy CBD services
    kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}
    
    # Deploy Services
    kubectl apply -f k8s/service.yaml -n ${NAMESPACE}
    
    # Deploy Ingress
    kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}
    
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/cbd-universal-database -n ${NAMESPACE}
    
    log_success "Kubernetes deployment completed!"
}

# Performance testing
performance_test() {
    log_header "Performance Testing"
    
    log_info "Running basic performance tests..."
    
    # Test CBD Core API
    log_info "Testing CBD Core API performance..."
    for i in {1..100}; do
        curl -f -s http://localhost/health > /dev/null
    done
    log_success "CBD Core API: 100 requests completed"
    
    # Test GraphQL endpoint
    log_info "Testing GraphQL endpoint..."
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{"query":"query { health }"}' \
        http://localhost/graphql > /dev/null
    log_success "GraphQL endpoint: Working"
}

# Monitoring setup
setup_monitoring() {
    log_header "Setting Up Monitoring"
    
    log_info "Configuring Prometheus monitoring..."
    
    # Start monitoring stack if using Docker Compose
    if docker-compose -f docker-compose.production.yml ps | grep -q prometheus; then
        log_success "Prometheus: RUNNING"
    else
        log_warning "Prometheus: NOT RUNNING"
    fi
    
    if docker-compose -f docker-compose.production.yml ps | grep -q grafana; then
        log_success "Grafana: RUNNING (http://localhost:3000)"
    else
        log_warning "Grafana: NOT RUNNING"
    fi
}

# Post-deployment verification
post_deployment_verification() {
    log_header "Post-Deployment Verification"
    
    # Test all endpoints
    endpoints=(
        "http://localhost/health"
        "http://localhost/stats"
        "http://localhost/collaboration/health"
        "http://localhost/analytics/health"
        "http://localhost/graphql"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "$endpoint" > /dev/null; then
            log_success "✓ $endpoint"
        else
            log_error "✗ $endpoint"
        fi
    done
    
    # Display deployment information
    log_header "Deployment Summary"
    echo -e "${CYAN}📊 CBD Universal Database v${CBD_VERSION}${NC}"
    echo -e "${CYAN}🌐 Environment: ${DEPLOYMENT_ENV}${NC}"
    echo -e "${CYAN}🔗 Main API: http://localhost${NC}"
    echo -e "${CYAN}🔗 GraphQL: http://localhost/graphql${NC}"
    echo -e "${CYAN}🔗 Collaboration: http://localhost/collaboration${NC}"
    echo -e "${CYAN}🔗 Analytics: http://localhost/analytics${NC}"
    echo -e "${CYAN}📊 Monitoring: http://localhost:3000${NC}"
}

# Rollback function
rollback() {
    log_header "Rolling Back Deployment"
    
    log_warning "Rolling back to previous version..."
    
    if [ -f "docker-compose.production.yml" ]; then
        docker-compose -f docker-compose.production.yml down
        log_success "Docker services stopped"
    fi
    
    # Rollback Kubernetes deployment if applicable
    if command -v kubectl &> /dev/null; then
        kubectl rollout undo deployment/cbd-universal-database -n ${NAMESPACE}
        log_success "Kubernetes deployment rolled back"
    fi
}

# Cleanup function
cleanup() {
    log_header "Cleaning Up"
    
    # Remove unused Docker images
    docker image prune -f
    log_success "Docker cleanup completed"
}

# Main deployment function
main() {
    log_header "CBD Universal Database - Production Deployment"
    echo -e "${CYAN}Version: ${CBD_VERSION}${NC}"
    echo -e "${CYAN}Environment: ${DEPLOYMENT_ENV}${NC}"
    echo -e "${CYAN}Registry: ${REGISTRY}${NC}"
    echo ""
    
    case "${1:-deploy}" in
        "check")
            pre_deployment_checks
            ;;
        "build")
            pre_deployment_checks
            build_images
            ;;
        "deploy")
            pre_deployment_checks
            build_images
            deploy_docker_compose
            setup_monitoring
            performance_test
            post_deployment_verification
            ;;
        "k8s")
            pre_deployment_checks
            build_images
            deploy_kubernetes
            post_deployment_verification
            ;;
        "test")
            performance_test
            ;;
        "monitor")
            setup_monitoring
            ;;
        "rollback")
            rollback
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 {check|build|deploy|k8s|test|monitor|rollback|cleanup}"
            exit 1
            ;;
    esac
    
    log_success "Deployment operation completed!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted!"; exit 1' INT

# Run main function
main "$@"
