#!/bin/bash

# CODAI Ecosystem Deployment Script
# Comprehensive deployment automation with health checks and rollback capability

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.production.yml"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Help function
show_help() {
    cat << EOF
CODAI Ecosystem Deployment Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy      Deploy the entire CODAI ecosystem
    rollback    Rollback to previous version
    health      Run health checks
    backup      Create system backup
    restore     Restore from backup
    logs        Show deployment logs
    status      Show system status

Options:
    -e, --env       Environment (development|staging|production)
    -v, --version   Version to deploy
    -f, --force     Force deployment without confirmations
    -h, --help      Show this help message

Examples:
    $0 deploy -e production -v v1.2.3
    $0 rollback -e production
    $0 health -e staging
EOF
}

# Parse command line arguments
ENVIRONMENT="development"
VERSION="latest"
FORCE=false
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        deploy|rollback|health|backup|restore|logs|status)
            COMMAND="$1"
            shift
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            log "Environment: $ENVIRONMENT"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    REQUIRED_SPACE=1048576  # 1GB in KB
    
    if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
        error "Insufficient disk space. Required: 1GB, Available: $(($AVAILABLE_SPACE/1024))MB"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating system backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="codai-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup configuration files
    mkdir -p "$BACKUP_PATH/config"
    cp -r "$PROJECT_ROOT/.env"* "$BACKUP_PATH/config/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/docker-compose"* "$BACKUP_PATH/config/" 2>/dev/null || true
    
    # Backup database (if running)
    if docker ps | grep -q postgres; then
        log "Backing up PostgreSQL database..."
        docker exec postgres pg_dumpall -U postgres > "$BACKUP_PATH/database.sql" 2>/dev/null || warning "Database backup failed"
    fi
    
    # Create metadata
    cat > "$BACKUP_PATH/metadata.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "$ENVIRONMENT",
    "version": "$VERSION",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    # Create archive
    tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
    rm -rf "$BACKUP_PATH"
    
    success "Backup created: $BACKUP_PATH.tar.gz"
    echo "$BACKUP_PATH.tar.gz" > "$PROJECT_ROOT/.last-backup"
}

# Health check function
run_health_checks() {
    log "Running comprehensive health checks..."
    
    local failed=0
    
    # Check if services are running
    log "Checking service status..."
    local services=("memorai-mcp" "cbd-database" "prometheus" "grafana")
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$service"; then
            success "✅ $service is running"
        else
            error "❌ $service is not running"
            ((failed++))
        fi
    done
    
    # Check HTTP endpoints
    log "Checking HTTP endpoints..."
    local endpoints=(
        "https://memorai.codai.ro"
        "https://admin.codai.ro"
        "https://hub.codai.ro"
        "https://romai.codai.ro"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" "$endpoint" | grep -q "^2"; then
            success "✅ $endpoint is healthy"
        else
            error "❌ $endpoint is not responding"
            ((failed++))
        fi
    done
    
    # Run security tests
    log "Running security validation..."
    if node "$PROJECT_ROOT/security/security-test.js" > /dev/null 2>&1; then
        success "✅ Security validation passed"
    else
        error "❌ Security validation failed"
        ((failed++))
    fi
    
    # Run performance tests
    log "Running performance validation..."
    if node "$PROJECT_ROOT/performance/performance-optimizer.js" > /dev/null 2>&1; then
        success "✅ Performance validation passed"
    else
        warning "⚠️ Performance validation needs attention"
    fi
    
    if [ $failed -eq 0 ]; then
        success "🎉 All health checks passed!"
        return 0
    else
        error "❌ $failed health checks failed"
        return 1
    fi
}

# Deploy function
deploy_system() {
    log "Starting deployment to $ENVIRONMENT environment..."
    
    # Confirmation for production
    if [ "$ENVIRONMENT" = "production" ] && [ "$FORCE" = false ]; then
        echo -e "${YELLOW}WARNING: You are about to deploy to PRODUCTION!${NC}"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Create backup before deployment
    create_backup
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Stop existing services gracefully
    log "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30
    
    # Start services
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Run health checks
    if run_health_checks; then
        success "🚀 Deployment completed successfully!"
        
        # Update version file
        echo "$VERSION" > "$PROJECT_ROOT/.deployed-version"
        
        # Send notification (if configured)
        send_notification "✅ CODAI deployment successful" "Environment: $ENVIRONMENT, Version: $VERSION"
        
    else
        error "❌ Deployment validation failed - initiating rollback..."
        rollback_system
        exit 1
    fi
}

# Rollback function
rollback_system() {
    log "Starting rollback procedure..."
    
    # Find last backup
    if [ -f "$PROJECT_ROOT/.last-backup" ]; then
        BACKUP_FILE=$(cat "$PROJECT_ROOT/.last-backup")
        log "Using backup: $BACKUP_FILE"
    else
        error "No backup found for rollback"
        exit 1
    fi
    
    # Extract backup
    BACKUP_NAME=$(basename "$BACKUP_FILE" .tar.gz)
    tar -xzf "$BACKUP_FILE" -C "$BACKUP_DIR"
    
    # Restore configuration
    cp -r "$BACKUP_DIR/$BACKUP_NAME/config/"* "$PROJECT_ROOT/" 2>/dev/null || true
    
    # Restart services with previous configuration
    log "Restarting services with previous configuration..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait and validate
    sleep 30
    if run_health_checks; then
        success "🔄 Rollback completed successfully!"
        send_notification "🔄 CODAI rollback successful" "Environment: $ENVIRONMENT"
    else
        error "❌ Rollback validation failed - manual intervention required"
        exit 1
    fi
    
    # Cleanup
    rm -rf "$BACKUP_DIR/$BACKUP_NAME"
}

# Show system status
show_status() {
    log "CODAI Ecosystem Status - $ENVIRONMENT"
    echo "=============================================="
    
    # Docker containers
    echo -e "${BLUE}Docker Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Disk usage
    echo -e "${BLUE}Disk Usage:${NC}"
    df -h /
    echo ""
    
    # Memory usage
    echo -e "${BLUE}Memory Usage:${NC}"
    free -h
    echo ""
    
    # Version info
    if [ -f "$PROJECT_ROOT/.deployed-version" ]; then
        echo -e "${BLUE}Deployed Version:${NC} $(cat "$PROJECT_ROOT/.deployed-version")"
    else
        echo -e "${YELLOW}No version information available${NC}"
    fi
    echo ""
    
    # Quick health check
    echo -e "${BLUE}Quick Health Check:${NC}"
    run_health_checks
}

# Show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        error "No log file found"
    fi
}

# Send notification (webhook/email - implement as needed)
send_notification() {
    local title="$1"
    local message="$2"
    
    # Placeholder for notification implementation
    log "Notification: $title - $message"
    
    # Example webhook (uncomment and configure)
    # curl -X POST "$WEBHOOK_URL" \
    #     -H "Content-Type: application/json" \
    #     -d "{\"text\":\"$title: $message\"}"
}

# Main execution
main() {
    validate_environment
    check_prerequisites
    
    case $COMMAND in
        deploy)
            deploy_system
            ;;
        rollback)
            rollback_system
            ;;
        health)
            run_health_checks
            ;;
        backup)
            create_backup
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        *)
            error "No command specified"
            show_help
            exit 1
            ;;
    esac
}

# Handle interrupts
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main
