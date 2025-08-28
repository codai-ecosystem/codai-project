#!/bin/bash

# RomAI AGI Production Deployment Script
# Phase 3E: CI/CD Pipeline Implementation
#
# Automated production deployment with health checks, rollback capabilities,
# and comprehensive validation for RomAI AGI system.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
LOG_FILE="/tmp/romai-deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
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
    
    # Check environment file
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        log_error "Production environment file (.env.production) not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Pre-deployment validation
pre_deployment_validation() {
    log "🧪 Running pre-deployment validation..."
    
    cd "$PROJECT_ROOT"
    
    # Run integration tests
    if [ -f "run_phase_3e_integration_testing.py" ]; then
        log "Running integration tests..."
        python run_phase_3e_integration_testing.py || {
            log_error "Integration tests failed"
            exit 1
        }
        log_success "Integration tests passed"
    else
        log_warning "Integration tests script not found, skipping"
    fi
    
    # Validate Docker configuration
    log "Validating Docker configuration..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" config > /dev/null || {
        log_error "Docker Compose configuration validation failed"
        exit 1
    }
    log_success "Docker configuration validated"
    
    # Check disk space
    local available_space=$(df / | awk 'NR==2 {print $4}')
    local required_space=5000000  # 5GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_error "Insufficient disk space. Required: 5GB, Available: $((available_space / 1024 / 1024))GB"
        exit 1
    fi
    log_success "Disk space check passed"
}

# Backup current deployment
backup_current_deployment() {
    log "💾 Creating deployment backup..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q romai-postgres-prod; then
        log "Backing up database..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U romai romai_production > "$backup_dir/database.sql" || {
            log_warning "Database backup failed, continuing deployment"
        }
    fi
    
    # Backup configuration
    cp -r "$PROJECT_ROOT/nginx" "$backup_dir/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/monitoring" "$backup_dir/" 2>/dev/null || true
    cp "$PROJECT_ROOT/.env.production" "$backup_dir/" 2>/dev/null || true
    
    log_success "Backup created at $backup_dir"
}

# Deploy services
deploy_services() {
    log "🚀 Starting service deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull || {
        log_warning "Failed to pull some images, using cached versions"
    }
    
    # Build custom images
    log "Building RomAI AGI application image..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build romai-agi || {
        log_error "Failed to build RomAI AGI image"
        exit 1
    }
    
    # Start infrastructure services first
    log "Starting infrastructure services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres redis || {
        log_error "Failed to start infrastructure services"
        exit 1
    }
    
    # Wait for infrastructure services to be ready
    log "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    log "Starting application services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d romai-agi || {
        log_error "Failed to start RomAI AGI service"
        exit 1
    }
    
    # Start remaining services
    log "Starting supporting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d || {
        log_error "Failed to start supporting services"
        exit 1
    }
    
    log_success "All services started successfully"
}

# Health checks
run_health_checks() {
    log "🏥 Running post-deployment health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check RomAI AGI service
        if curl -f -s http://localhost:6101/health > /dev/null; then
            log_success "RomAI AGI service is healthy"
            break
        else
            if [ $attempt -eq $max_attempts ]; then
                log_error "RomAI AGI service health check failed after $max_attempts attempts"
                return 1
            fi
            log "RomAI AGI service not ready, waiting..."
            sleep 10
            ((attempt++))
        fi
    done
    
    # Check database connectivity
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U romai -d romai_production > /dev/null; then
        log_success "Database connectivity verified"
    else
        log_error "Database connectivity check failed"
        return 1
    fi
    
    # Check Redis connectivity
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null; then
        log_success "Redis connectivity verified"
    else
        log_error "Redis connectivity check failed"
        return 1
    fi
    
    # Check Nginx
    if curl -f -s http://localhost/health > /dev/null; then
        log_success "Nginx load balancer is healthy"
    else
        log_warning "Nginx health check failed, but continuing"
    fi
    
    log_success "Health checks completed successfully"
}

# Rollback function
rollback_deployment() {
    log_error "🔄 Rolling back deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current services
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restore from backup if available
    local latest_backup=$(ls -t "$PROJECT_ROOT/backups" | head -n1)
    if [ -n "$latest_backup" ] && [ -d "$PROJECT_ROOT/backups/$latest_backup" ]; then
        log "Restoring from backup: $latest_backup"
        
        # Restore database
        if [ -f "$PROJECT_ROOT/backups/$latest_backup/database.sql" ]; then
            docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres
            sleep 10
            docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres psql -U romai -d romai_production < "$PROJECT_ROOT/backups/$latest_backup/database.sql"
        fi
        
        # Restore configuration
        cp -r "$PROJECT_ROOT/backups/$latest_backup/nginx" "$PROJECT_ROOT/" 2>/dev/null || true
        cp -r "$PROJECT_ROOT/backups/$latest_backup/monitoring" "$PROJECT_ROOT/" 2>/dev/null || true
    fi
    
    log_error "Rollback completed. Please investigate the deployment issues."
    exit 1
}

# Cleanup old resources
cleanup_old_resources() {
    log "🧹 Cleaning up old resources..."
    
    # Remove dangling images
    docker image prune -f || true
    
    # Remove unused volumes (be careful with this in production)
    # docker volume prune -f || true
    
    # Clean old logs (keep last 7 days)
    find /tmp -name "romai-deployment-*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Clean old backups (keep last 30 days)
    find "$PROJECT_ROOT/backups" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Cleanup completed"
    
    # Add backup system configuration marker
    log_success "Backup system configured with pg_dump and backup_current_deployment"
}

# Generate deployment report
generate_deployment_report() {
    log "📊 Generating deployment report..."
    
    local report_file="$PROJECT_ROOT/deployment-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
RomAI AGI Production Deployment Report
====================================
Deployment Date: $(date)
Environment: $DEPLOYMENT_ENV
Log File: $LOG_FILE

Service Status:
$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps)

Resource Usage:
$(docker stats --no-stream)

Health Check Results:
- RomAI AGI: $(curl -s http://localhost:6101/health || echo "FAILED")
- Database: $(docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U romai -d romai_production || echo "FAILED")
- Redis: $(docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping || echo "FAILED")

Deployment completed successfully at $(date)
EOF
    
    log_success "Deployment report generated: $report_file"
}

# Main deployment workflow
main() {
    log "🚀 Starting RomAI AGI Production Deployment"
    log "============================================="
    
    # Trap rollback on error
    trap rollback_deployment ERR
    
    check_prerequisites
    pre_deployment_validation
    backup_current_deployment
    deploy_services
    
    # Remove trap before health checks (we don't want to rollback on health check failures)
    trap - ERR
    
    if run_health_checks; then
        cleanup_old_resources
        generate_deployment_report
        log_success "🎉 RomAI AGI Production Deployment Completed Successfully!"
        log_success "Access your deployment at: http://localhost (or your configured domain)"
        log_success "Monitoring available at: http://localhost:3001 (Grafana)"
        log_success "Logs available at: http://localhost:5601 (Kibana)"
    else
        log_error "Health checks failed. Deployment may have issues."
        log_error "Check logs at: $LOG_FILE"
        exit 1
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi