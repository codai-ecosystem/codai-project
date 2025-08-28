#!/bin/bash
# RomAI AGI Production Deployment Script for romcp.ro
# Comprehensive deployment with health checks and monitoring

set -e

echo "🚀 Starting RomAI AGI Production Deployment for romcp.ro"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="romcp.ro"
APP_NAME="romai-agi"
DOCKER_REGISTRY="ghcr.io/codai-ecosystem"
VERSION="v2.0.0"

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

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check GPU support
    if command -v nvidia-smi &> /dev/null; then
        log_success "NVIDIA GPU detected"
        GPU_AVAILABLE=true
    else
        log_warning "No NVIDIA GPU detected - running in CPU mode"
        GPU_AVAILABLE=false
    fi
    
    log_success "All requirements met"
}

setup_environment() {
    log_info "Setting up production environment..."
    
    # Create necessary directories
    mkdir -p ./logs/nginx
    mkdir -p ./logs/romai
    mkdir -p ./models
    mkdir -p ./certs
    mkdir -p ./monitoring/prometheus
    mkdir -p ./monitoring/grafana/dashboards
    
    # Set permissions
    chmod -R 755 ./logs
    chmod -R 755 ./models
    
    log_success "Environment setup complete"
}

generate_ssl_certs() {
    log_info "Setting up SSL certificates for ${DOMAIN}..."
    
    if [ ! -f "./certs/${DOMAIN}.crt" ]; then
        # Generate self-signed certificate for development
        # In production, use Let's Encrypt or proper CA certificates
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "./certs/${DOMAIN}.key" \
            -out "./certs/${DOMAIN}.crt" \
            -subj "/CN=${DOMAIN}"
        
        log_warning "Generated self-signed certificate. Replace with proper SSL certificate in production."
    else
        log_success "SSL certificates already exist"
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    # Build RomAI AGI Server
    log_info "Building RomAI AGI Server image..."
    docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-server:${VERSION} \
        -f Dockerfile.production .
    
    # Build Frontend
    log_info "Building RomAI Frontend image..."
    docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${VERSION} \
        -f Dockerfile.frontend .
    
    log_success "Docker images built successfully"
}

deploy_services() {
    log_info "Deploying RomAI AGI services..."
    
    # Export environment variables
    export DOMAIN
    export VERSION
    export GPU_AVAILABLE
    
    # Deploy with Docker Compose
    docker-compose -f docker-compose.production.yml down --remove-orphans
    docker-compose -f docker-compose.production.yml up -d
    
    log_success "Services deployed"
}

wait_for_services() {
    log_info "Waiting for services to be healthy..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt ${attempt}/${max_attempts}"
        
        # Check RomAI AGI Server
        if curl -sf http://localhost:6101/health > /dev/null; then
            log_success "RomAI AGI Server is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Services failed to start after ${max_attempts} attempts"
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

run_health_checks() {
    log_info "Running comprehensive health checks..."
    
    # Check RomAI AGI Server
    local health_response=$(curl -s http://localhost:6101/health)
    local models_loaded=$(echo $health_response | jq -r '.models_loaded // 0')
    local server_status=$(echo $health_response | jq -r '.status // "unknown"')
    
    if [ "$server_status" = "healthy" ]; then
        log_success "✅ RomAI AGI Server: HEALTHY (${models_loaded} models loaded)"
    else
        log_error "❌ RomAI AGI Server: UNHEALTHY"
        return 1
    fi
    
    # Check Frontend
    if curl -sf http://localhost:3000/api/health > /dev/null; then
        log_success "✅ RomAI Frontend: HEALTHY"
    else
        log_error "❌ RomAI Frontend: UNHEALTHY"
        return 1
    fi
    
    # Check Database
    if docker exec romai-db-production pg_isready -U romai_prod > /dev/null; then
        log_success "✅ PostgreSQL Database: HEALTHY"
    else
        log_error "❌ PostgreSQL Database: UNHEALTHY"
        return 1
    fi
    
    # Check Redis
    if docker exec romai-redis-production redis-cli ping | grep -q "PONG"; then
        log_success "✅ Redis Cache: HEALTHY"
    else
        log_error "❌ Redis Cache: UNHEALTHY"
        return 1
    fi
    
    log_success "🎉 All health checks passed!"
}

show_deployment_info() {
    log_info "Deployment completed successfully!"
    echo ""
    echo "🌐 Access Points:"
    echo "   • Main Application: https://${DOMAIN}"
    echo "   • AGI API: https://api.${DOMAIN}"
    echo "   • Monitoring: https://monitor.${DOMAIN}"
    echo "   • Grafana Dashboard: http://localhost:3001"
    echo "   • Prometheus: http://localhost:9090"
    echo ""
    echo "🔧 Management Commands:"
    echo "   • View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "   • Stop services: docker-compose -f docker-compose.production.yml down"
    echo "   • Restart services: docker-compose -f docker-compose.production.yml restart"
    echo ""
    echo "📊 System Status:"
    docker-compose -f docker-compose.production.yml ps
}

# Main deployment sequence
main() {
    log_info "Starting deployment process..."
    
    check_requirements
    setup_environment
    generate_ssl_certs
    build_images
    deploy_services
    wait_for_services
    run_health_checks
    show_deployment_info
    
    log_success "🚀 RomAI AGI deployment completed successfully!"
}

# Run main deployment if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi