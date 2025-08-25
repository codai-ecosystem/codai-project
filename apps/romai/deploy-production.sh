#!/bin/bash
# RomAI AGI Production Deployment Script
# =====================================
# Complete production deployment automation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROMAI_DIR="/var/lib/romai"
ROMAI_USER="romai"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "Do not run this script as root. Use a regular user with sudo privileges."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        error "User $USER is not in docker group. Run: sudo usermod -aG docker $USER && newgrp docker"
    fi
    
    success "Prerequisites check passed"
}

# Create system user for RomAI
create_romai_user() {
    log "Creating RomAI system user..."
    
    if ! id "$ROMAI_USER" &>/dev/null; then
        sudo useradd -r -s /bin/false -d "$ROMAI_DIR" "$ROMAI_USER"
        success "Created RomAI system user: $ROMAI_USER"
    else
        log "RomAI user already exists"
    fi
}

# Setup directory structure
setup_directories() {
    log "Setting up directory structure..."
    
    # Create main directory
    sudo mkdir -p "$ROMAI_DIR"
    sudo chown "$ROMAI_USER:$ROMAI_USER" "$ROMAI_DIR"
    
    # Create data directories
    local dirs=(
        "data/postgres"
        "data/redis" 
        "data/cbd"
        "data/models"
        "data/agi"
        "data/prometheus"
        "data/grafana"
        "logs/agi"
        "logs/api"
        "logs/nginx"
        "backups"
        "ssl"
        "config/nginx"
        "config/prometheus"
        "config/grafana"
    )
    
    for dir in "${dirs[@]}"; do
        sudo mkdir -p "$ROMAI_DIR/$dir"
        sudo chown "$ROMAI_USER:$ROMAI_USER" "$ROMAI_DIR/$dir"
    done
    
    success "Directory structure created"
}

# Generate production environment file
setup_environment() {
    log "Setting up production environment..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f ".env.production.template" ]]; then
            cp .env.production.template "$ENV_FILE"
            
            # Generate secure passwords
            POSTGRES_PASS=$(openssl rand -hex 32)
            REDIS_PASS=$(openssl rand -hex 32)
            API_SECRET=$(openssl rand -hex 64)
            JWT_SECRET=$(openssl rand -hex 64)
            SESSION_SECRET=$(openssl rand -hex 64)
            GRAFANA_PASS=$(openssl rand -hex 16)
            
            # Replace placeholders
            sed -i "s/romai_secure_production_2025_\$(openssl rand -hex 16)/$POSTGRES_PASS/g" "$ENV_FILE"
            sed -i "s/romai_cache_production_2025_\$(openssl rand -hex 16)/$REDIS_PASS/g" "$ENV_FILE"
            sed -i "s/romai_api_production_2025_\$(openssl rand -hex 32)/$API_SECRET/g" "$ENV_FILE"
            sed -i "s/romai_jwt_production_2025_\$(openssl rand -hex 32)/$JWT_SECRET/g" "$ENV_FILE"
            sed -i "s/romai_session_production_2025_\$(openssl rand -hex 32)/$SESSION_SECRET/g" "$ENV_FILE"
            sed -i "s/romai_grafana_admin_2025/$GRAFANA_PASS/g" "$ENV_FILE"
            
            # Update paths
            sed -i "s|/var/lib/romai|$ROMAI_DIR|g" "$ENV_FILE"
            sed -i "s|/var/log/romai|$ROMAI_DIR/logs|g" "$ENV_FILE"
            
            success "Production environment file created: $ENV_FILE"
            warning "Please review and customize $ENV_FILE with your specific configuration"
        else
            error "Template file .env.production.template not found"
        fi
    else
        log "Production environment file already exists"
    fi
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [[ ! -f "$ROMAI_DIR/ssl/cert.pem" ]]; then
        warning "SSL certificates not found. Generating self-signed certificates for development."
        warning "For production, replace with proper SSL certificates from a CA."
        
        # Generate self-signed certificate
        sudo openssl req -x509 -newkey rsa:4096 -keyout "$ROMAI_DIR/ssl/key.pem" \
            -out "$ROMAI_DIR/ssl/cert.pem" -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=RomAI/OU=AGI/CN=localhost"
        
        sudo chown "$ROMAI_USER:$ROMAI_USER" "$ROMAI_DIR/ssl"/*
        sudo chmod 600 "$ROMAI_DIR/ssl"/*
        
        success "Self-signed SSL certificates generated"
    else
        log "SSL certificates already exist"
    fi
}

# Setup firewall rules
setup_firewall() {
    log "Setting up firewall rules..."
    
    if command -v ufw &> /dev/null; then
        # Allow SSH
        sudo ufw allow ssh
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Allow monitoring
        sudo ufw allow 3000/tcp  # Grafana
        sudo ufw allow 9090/tcp  # Prometheus
        
        # Enable firewall
        sudo ufw --force enable
        
        success "Firewall configured"
    else
        warning "UFW not available, please configure firewall manually"
    fi
}

# Pre-flight checks
preflight_checks() {
    log "Running pre-flight checks..."
    
    # Check disk space (need at least 20GB)
    AVAILABLE=$(df . | tail -1 | awk '{print $4}')
    REQUIRED=$((20 * 1024 * 1024))  # 20GB in KB
    
    if [[ $AVAILABLE -lt $REQUIRED ]]; then
        error "Insufficient disk space. Need at least 20GB available."
    fi
    
    # Check memory (need at least 8GB)
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    if [[ $TOTAL_MEM -lt 8192 ]]; then
        warning "Less than 8GB RAM available. RomAI may not perform optimally."
    fi
    
    # Check Docker daemon
    if ! docker info &>/dev/null; then
        error "Docker daemon is not running"
    fi
    
    success "Pre-flight checks passed"
}

# Deploy RomAI stack
deploy_stack() {
    log "Deploying RomAI AGI stack..."
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    success "RomAI stack deployed"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to become healthy..."
    
    local services=(
        "romai-postgres"
        "romai-redis"
        "romai-cbd-database"
        "romai-agi-server"
        "romai-enterprise-api"
        "romai-frontend"
    )
    
    for service in "${services[@]}"; do
        log "Checking $service..."
        
        local retries=60
        while [[ $retries -gt 0 ]]; do
            if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$service.*healthy"; then
                success "$service is healthy"
                break
            fi
            
            if [[ $retries -eq 1 ]]; then
                error "$service failed to become healthy"
            fi
            
            sleep 5
            ((retries--))
        done
    done
}

# Display deployment information
show_deployment_info() {
    log "Deployment completed successfully!"
    
    echo
    echo "==============================================="
    echo "         RomAI AGI Deployment Complete        "
    echo "==============================================="
    echo
    echo "Access Points:"
    echo "  Frontend:     https://localhost"
    echo "  API:          https://localhost/api"
    echo "  Grafana:      http://localhost:3000"
    echo "  Prometheus:   http://localhost:9090"
    echo
    echo "Default Credentials:"
    echo "  Grafana:      admin / $(grep GRAFANA_PASSWORD $ENV_FILE | cut -d'=' -f2)"
    echo
    echo "Monitoring:"
    echo "  docker-compose -f $COMPOSE_FILE logs -f"
    echo "  docker-compose -f $COMPOSE_FILE ps"
    echo
    echo "To stop:"
    echo "  docker-compose -f $COMPOSE_FILE down"
    echo
    echo "==============================================="
}

# Main deployment process
main() {
    log "Starting RomAI AGI Production Deployment"
    
    check_root
    check_prerequisites
    create_romai_user
    setup_directories
    setup_environment
    setup_ssl
    setup_firewall
    preflight_checks
    deploy_stack
    wait_for_services
    show_deployment_info
    
    success "RomAI AGI is now running in production mode!"
}

# Handle interrupts
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"