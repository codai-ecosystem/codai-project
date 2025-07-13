#!/bin/bash

# 🚀 ROMAI Production Deployment Script
# Automated production deployment with validation and rollback
# Generated for Phase 4 Week 4 Day 24 - Production Deployment

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# 🔧 CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
VERSION="${VERSION:-latest}"
BUILD_REVISION="${BUILD_REVISION:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/var/backups/romai"
MAX_ROLLBACK_VERSIONS=5

# =============================================================================
# 📋 LOGGING FUNCTIONS
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# =============================================================================
# 🔍 PRE-DEPLOYMENT VALIDATION
# =============================================================================

validate_environment() {
    log "Validating deployment environment..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running or accessible"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "$PROJECT_ROOT/$COMPOSE_FILE" ]; then
        error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/$ENV_FILE" ]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    # Validate environment variables
    if ! grep -q "AZURE_OPENAI_API_KEY=" "$PROJECT_ROOT/$ENV_FILE"; then
        error "AZURE_OPENAI_API_KEY not found in environment file"
        exit 1
    fi
    
    if ! grep -q "JWT_SECRET=" "$PROJECT_ROOT/$ENV_FILE"; then
        error "JWT_SECRET not found in environment file"
        exit 1
    fi
    
    # Check available disk space (minimum 5GB)
    available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    min_space=$((5 * 1024 * 1024)) # 5GB in KB
    
    if [ "$available_space" -lt "$min_space" ]; then
        error "Insufficient disk space. Available: ${available_space}KB, Required: ${min_space}KB"
        exit 1
    fi
    
    success "Environment validation passed"
}

# =============================================================================
# 💾 BACKUP FUNCTIONS
# =============================================================================

create_backup() {
    log "Creating backup of current deployment..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="romai_backup_${backup_timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Create backup directory
    sudo mkdir -p "$backup_path"
    
    # Backup configuration files
    sudo cp "$PROJECT_ROOT/$ENV_FILE" "$backup_path/" 2>/dev/null || true
    sudo cp "$PROJECT_ROOT/$COMPOSE_FILE" "$backup_path/" 2>/dev/null || true
    
    # Backup container volumes if they exist
    if docker volume ls | grep -q romai; then
        log "Backing up Docker volumes..."
        for volume in $(docker volume ls --format "table {{.Name}}" | grep romai); do
            log "Backing up volume: $volume"
            docker run --rm -v "$volume":/data -v "$backup_path":/backup alpine \
                tar czf "/backup/${volume}.tar.gz" -C /data . || warn "Failed to backup volume: $volume"
        done
    fi
    
    # Export current container images
    if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps -q | grep -q .; then
        log "Exporting current container images..."
        docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" images -q | \
            xargs -I {} docker save {} | gzip > "$backup_path/images.tar.gz" || warn "Failed to backup images"
    fi
    
    # Store deployment metadata
    cat > "$backup_path/metadata.json" << EOF
{
    "timestamp": "$backup_timestamp",
    "version": "$VERSION",
    "build_revision": "$BUILD_REVISION",
    "environment": "$DEPLOY_ENV",
    "docker_compose_version": "$(docker-compose --version)",
    "docker_version": "$(docker --version)"
}
EOF
    
    # Set permissions
    sudo chown -R $(whoami):$(whoami) "$backup_path" 2>/dev/null || true
    
    # Cleanup old backups (keep only MAX_ROLLBACK_VERSIONS)
    if [ -d "$BACKUP_DIR" ]; then
        sudo find "$BACKUP_DIR" -maxdepth 1 -type d -name "romai_backup_*" | \
            sort -r | tail -n +$((MAX_ROLLBACK_VERSIONS + 1)) | \
            xargs -r sudo rm -rf
    fi
    
    echo "$backup_path" > /tmp/romai_last_backup
    success "Backup created: $backup_path"
}

# =============================================================================
# 🔨 BUILD FUNCTIONS
# =============================================================================

build_images() {
    log "Building production images..."
    
    cd "$PROJECT_ROOT"
    
    # Set build arguments
    export VERSION="$VERSION"
    export BUILD_REVISION="$BUILD_REVISION"
    
    # Build images with no cache for production
    docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    
    # Tag images with version
    local services=(romai-api romai-dashboard romai-mcp)
    for service in "${services[@]}"; do
        if docker images | grep -q "romai/$service"; then
            docker tag "romai/$service:latest" "romai/$service:$VERSION"
            docker tag "romai/$service:latest" "romai/$service:$BUILD_REVISION"
        fi
    done
    
    success "Images built successfully"
}

# =============================================================================
# 🚀 DEPLOYMENT FUNCTIONS
# =============================================================================

deploy_services() {
    log "Deploying ROMAI services..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment variables
    export VERSION="$VERSION"
    export BUILD_REVISION="$BUILD_REVISION"
    
    # Pull external images
    log "Pulling external images..."
    docker-compose -f "$COMPOSE_FILE" pull elasticsearch kibana logstash redis nginx
    
    # Start core infrastructure first
    log "Starting core infrastructure..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        elasticsearch redis
    
    # Wait for core services to be healthy
    wait_for_service "elasticsearch" "http://localhost:9200/_cluster/health" 120
    wait_for_service "redis" "redis-cli ping" 60
    
    # Start remaining ELK stack
    log "Starting ELK stack..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        kibana logstash
    
    # Wait for ELK services
    wait_for_service "kibana" "http://localhost:5601/api/status" 180
    
    # Start ROMAI applications
    log "Starting ROMAI applications..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d \
        romai-api romai-mcp romai-dashboard
    
    # Wait for application services
    wait_for_service "romai-api" "http://localhost:8000/health" 120
    wait_for_service "romai-dashboard" "http://localhost:4000/health" 120
    
    # Start nginx proxy
    log "Starting nginx reverse proxy..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d nginx
    
    success "All services deployed successfully"
}

# =============================================================================
# 🔍 VALIDATION FUNCTIONS
# =============================================================================

wait_for_service() {
    local service_name="$1"
    local health_url="$2"
    local timeout="$3"
    local count=0
    
    log "Waiting for $service_name to be healthy..."
    
    while [ $count -lt $timeout ]; do
        if curl -f "$health_url" >/dev/null 2>&1; then
            success "$service_name is healthy"
            return 0
        fi
        
        sleep 5
        count=$((count + 5))
        echo -n "."
    done
    
    error "$service_name health check timeout after ${timeout}s"
    return 1
}

validate_deployment() {
    log "Validating deployment..."
    
    # Check if all containers are running
    local failed_services=()
    local services=(romai-api romai-dashboard romai-mcp elasticsearch kibana redis nginx)
    
    for service in "${services[@]}"; do
        if ! docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps | grep -q "$service.*Up"; then
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        error "Failed services: ${failed_services[*]}"
        return 1
    fi
    
    # Validate service endpoints
    log "Validating service endpoints..."
    
    # API health check
    if ! curl -f http://localhost:8000/health >/dev/null 2>&1; then
        error "API health check failed"
        return 1
    fi
    
    # Dashboard health check
    if ! curl -f http://localhost:4000 >/dev/null 2>&1; then
        error "Dashboard health check failed"
        return 1
    fi
    
    # Elasticsearch health check
    if ! curl -f http://localhost:9200/_cluster/health >/dev/null 2>&1; then
        error "Elasticsearch health check failed"
        return 1
    fi
    
    # Nginx health check
    if ! curl -f http://localhost:80/health >/dev/null 2>&1; then
        error "Nginx health check failed"
        return 1
    fi
    
    success "Deployment validation passed"
    return 0
}

# =============================================================================
# 🔄 ROLLBACK FUNCTIONS
# =============================================================================

rollback() {
    local backup_path="${1:-$(cat /tmp/romai_last_backup 2>/dev/null)}"
    
    if [ -z "$backup_path" ] || [ ! -d "$backup_path" ]; then
        error "No valid backup path provided or backup not found"
        return 1
    fi
    
    warn "Rolling back to backup: $backup_path"
    
    # Stop current services
    log "Stopping current services..."
    docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" down || true
    
    # Restore configuration files
    if [ -f "$backup_path/$ENV_FILE" ]; then
        cp "$backup_path/$ENV_FILE" "$PROJECT_ROOT/"
    fi
    
    if [ -f "$backup_path/$COMPOSE_FILE" ]; then
        cp "$backup_path/$COMPOSE_FILE" "$PROJECT_ROOT/"
    fi
    
    # Restore container images
    if [ -f "$backup_path/images.tar.gz" ]; then
        log "Restoring container images..."
        gunzip -c "$backup_path/images.tar.gz" | docker load
    fi
    
    # Restore volumes
    for volume_backup in "$backup_path"/*.tar.gz; do
        if [ -f "$volume_backup" ] && [[ $(basename "$volume_backup") =~ ^romai.*\.tar\.gz$ ]]; then
            local volume_name=$(basename "$volume_backup" .tar.gz)
            log "Restoring volume: $volume_name"
            
            # Remove existing volume
            docker volume rm "$volume_name" 2>/dev/null || true
            
            # Create and restore volume
            docker volume create "$volume_name"
            docker run --rm -v "$volume_name":/data -v "$backup_path":/backup alpine \
                tar xzf "/backup/$(basename "$volume_backup")" -C /data
        fi
    done
    
    # Start services with restored configuration
    log "Starting services with restored configuration..."
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    # Validate rollback
    if validate_deployment; then
        success "Rollback completed successfully"
        return 0
    else
        error "Rollback validation failed"
        return 1
    fi
}

# =============================================================================
# 📊 MONITORING FUNCTIONS
# =============================================================================

show_status() {
    log "ROMAI Production Status"
    echo "======================================"
    
    # Service status
    echo "Services:"
    docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps
    echo
    
    # Resource usage
    echo "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    echo
    
    # Service URLs
    echo "Service URLs:"
    echo "- API: http://localhost:8000"
    echo "- Dashboard: http://localhost:4000"
    echo "- Kibana: http://localhost:5601"
    echo "- Elasticsearch: http://localhost:9200"
    echo
    
    # Health checks
    echo "Health Checks:"
    curl -s http://localhost:8000/health && echo " ✅ API" || echo " ❌ API"
    curl -s http://localhost:4000 >/dev/null && echo " ✅ Dashboard" || echo " ❌ Dashboard"
    curl -s http://localhost:9200/_cluster/health >/dev/null && echo " ✅ Elasticsearch" || echo " ❌ Elasticsearch"
    curl -s http://localhost:5601/api/status >/dev/null && echo " ✅ Kibana" || echo " ❌ Kibana"
}

# =============================================================================
# 🎯 MAIN DEPLOYMENT FUNCTION
# =============================================================================

main() {
    local action="${1:-deploy}"
    
    case "$action" in
        "deploy")
            log "Starting ROMAI production deployment..."
            validate_environment
            create_backup
            build_images
            deploy_services
            
            if validate_deployment; then
                success "🎉 ROMAI deployment completed successfully!"
                show_status
            else
                error "Deployment validation failed. Rolling back..."
                rollback
                exit 1
            fi
            ;;
            
        "rollback")
            local backup_path="$2"
            log "Starting rollback process..."
            rollback "$backup_path"
            ;;
            
        "status")
            show_status
            ;;
            
        "validate")
            validate_deployment
            ;;
            
        "backup")
            create_backup
            ;;
            
        *)
            echo "Usage: $0 {deploy|rollback|status|validate|backup}"
            echo
            echo "Commands:"
            echo "  deploy   - Full production deployment"
            echo "  rollback - Rollback to previous version"
            echo "  status   - Show current status"
            echo "  validate - Validate current deployment"
            echo "  backup   - Create backup of current state"
            exit 1
            ;;
    esac
}

# =============================================================================
# 🚀 SCRIPT EXECUTION
# =============================================================================

# Trap signals for cleanup
trap 'error "Deployment interrupted"; exit 130' INT TERM

# Run main function with all arguments
main "$@"
