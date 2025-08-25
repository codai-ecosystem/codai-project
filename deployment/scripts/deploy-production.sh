#!/bin/bash
# RomAI AGI Production Deployment Script
# Comprehensive deployment orchestration with zero-downtime updates

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Help function
show_help() {
    cat << EOF
RomAI AGI Production Deployment Script

Usage: $0 [OPTIONS] ENVIRONMENT

ARGUMENTS:
    ENVIRONMENT     Target environment (local|staging|production)

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose output
    -n, --dry-run           Show what would be deployed without executing
    -f, --force             Force deployment even with warnings
    -s, --skip-tests        Skip pre-deployment tests
    -b, --build-only        Only build containers, don't deploy
    -r, --rollback          Rollback to previous version
    --skip-backup           Skip database backup
    --parallel              Use parallel deployment strategy
    --blue-green            Use blue-green deployment strategy

EXAMPLES:
    $0 local                    # Deploy to local environment
    $0 staging --verbose        # Deploy to staging with verbose output
    $0 production --blue-green  # Blue-green production deployment
    $0 production --rollback    # Rollback production deployment

ENVIRONMENT VARIABLES:
    DOCKER_REGISTRY         Container registry URL (default: ghcr.io)
    IMAGE_TAG              Override image tag
    KUBERNETES_CONTEXT     kubectl context to use
    SLACK_WEBHOOK          Slack webhook for notifications
EOF
}

# Parse command line arguments
ENVIRONMENT=""
VERBOSE=false
DRY_RUN=false
FORCE=false
SKIP_TESTS=false
BUILD_ONLY=false
ROLLBACK=false
SKIP_BACKUP=false
PARALLEL=false
BLUE_GREEN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            set -x
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --blue-green)
            BLUE_GREEN=true
            shift
            ;;
        local|staging|production)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    error "Environment is required"
    show_help
    exit 1
fi

# Set environment-specific configuration
case $ENVIRONMENT in
    local)
        NAMESPACE="romai-local"
        REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"
        REPLICAS=1
        ;;
    staging)
        NAMESPACE="romai-staging"
        REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
        REPLICAS=2
        ;;
    production)
        NAMESPACE="romai-agi"
        REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
        REPLICAS=3
        ;;
    *)
        error "Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Set image tag
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
FULL_IMAGE="$REGISTRY/romai/agi:$IMAGE_TAG"

log "🚀 Starting RomAI AGI deployment to $ENVIRONMENT"
info "Environment: $ENVIRONMENT"
info "Namespace: $NAMESPACE"
info "Image: $FULL_IMAGE"
info "Replicas: $REPLICAS"

# Dry run check
if $DRY_RUN; then
    warn "DRY RUN MODE - No changes will be made"
fi

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    # Check required tools
    for tool in docker kubectl helm; do
        if ! command -v $tool &> /dev/null; then
            error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    # Check Kubernetes connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        warn "Namespace $NAMESPACE does not exist, creating..."
        if ! $DRY_RUN; then
            kubectl create namespace "$NAMESPACE"
        fi
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df /var/lib/docker --output=avail --no-sync --block-size=1G | tail -n1)
    if [[ $AVAILABLE_SPACE -lt 10 ]]; then
        if ! $FORCE; then
            error "Insufficient disk space: ${AVAILABLE_SPACE}GB available, 10GB required"
            exit 1
        else
            warn "Low disk space but forcing deployment"
        fi
    fi
    
    log "✅ Pre-deployment checks passed"
}

# Build containers
build_containers() {
    log "🏗️ Building RomAI AGI container..."
    
    cd "$PROJECT_ROOT"
    
    # Build production Docker image
    if ! $DRY_RUN; then
        docker build \
            --file apps/romai/Dockerfile.production \
            --tag "$FULL_IMAGE" \
            --build-arg ENVIRONMENT="$ENVIRONMENT" \
            --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
            --build-arg VCS_REF="$(git rev-parse HEAD)" \
            --build-arg VERSION="$IMAGE_TAG" \
            .
            
        # Push to registry (unless local)
        if [[ "$ENVIRONMENT" != "local" ]]; then
            log "📤 Pushing image to registry..."
            docker push "$FULL_IMAGE"
        fi
    else
        info "Would build and push: $FULL_IMAGE"
    fi
    
    log "✅ Container build completed"
}

# Run pre-deployment tests
run_tests() {
    if $SKIP_TESTS; then
        warn "Skipping tests as requested"
        return
    fi
    
    log "🧪 Running pre-deployment tests..."
    
    # Unit tests
    cd "$PROJECT_ROOT/apps/romai"
    if ! $DRY_RUN; then
        python -m pytest src/tests/ -v --tb=short || {
            error "Unit tests failed"
            exit 1
        }
    else
        info "Would run unit tests"
    fi
    
    # Integration tests with temporary container
    if ! $DRY_RUN && [[ "$ENVIRONMENT" != "local" ]]; then
        log "🔌 Running integration tests..."
        
        # Start temporary container for testing
        TEST_CONTAINER="romai-test-$TIMESTAMP"
        docker run -d \
            --name "$TEST_CONTAINER" \
            --publish 6101:6101 \
            "$FULL_IMAGE" &
        
        # Wait for container to be ready
        sleep 30
        
        # Run tests
        curl -f http://localhost:6101/health || {
            error "Integration test failed"
            docker logs "$TEST_CONTAINER"
            docker stop "$TEST_CONTAINER"
            docker rm "$TEST_CONTAINER"
            exit 1
        }
        
        # Cleanup
        docker stop "$TEST_CONTAINER"
        docker rm "$TEST_CONTAINER"
    fi
    
    log "✅ Tests passed"
}

# Database backup
backup_database() {
    if $SKIP_BACKUP; then
        warn "Skipping database backup as requested"
        return
    fi
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "💾 Creating database backup..."
        
        if ! $DRY_RUN; then
            BACKUP_NAME="romai-backup-$TIMESTAMP"
            kubectl exec -n "$NAMESPACE" deployment/romai-postgres -- \
                pg_dump -U romai romai_agi | gzip > "$BACKUP_NAME.sql.gz"
            
            # Upload to storage (S3/Azure Blob/GCS)
            # aws s3 cp "$BACKUP_NAME.sql.gz" "s3://romai-backups/"
            info "Backup created: $BACKUP_NAME.sql.gz"
        else
            info "Would create database backup"
        fi
    fi
}

# Deploy application
deploy_application() {
    log "🚀 Deploying RomAI AGI to $ENVIRONMENT..."
    
    cd "$DEPLOYMENT_DIR"
    
    if $BLUE_GREEN && [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_blue_green
    elif $PARALLEL; then
        deploy_parallel
    else
        deploy_rolling
    fi
}

# Rolling deployment strategy
deploy_rolling() {
    log "📦 Using rolling deployment strategy..."
    
    if ! $DRY_RUN; then
        # Apply Kubernetes manifests
        kubectl apply -f kubernetes/romai-agi-production.yaml
        
        # Update image
        kubectl set image deployment/romai-agi \
            romai-agi="$FULL_IMAGE" \
            -n "$NAMESPACE"
        
        # Wait for rollout to complete
        kubectl rollout status deployment/romai-agi \
            -n "$NAMESPACE" \
            --timeout=900s
            
        log "✅ Rolling deployment completed"
    else
        info "Would perform rolling deployment"
    fi
}

# Blue-green deployment strategy
deploy_blue_green() {
    log "🔵🟢 Using blue-green deployment strategy..."
    
    CURRENT_COLOR=$(kubectl get deployment romai-agi -n "$NAMESPACE" \
        -o jsonpath='{.metadata.labels.color}' 2>/dev/null || echo "blue")
    
    if [[ "$CURRENT_COLOR" == "blue" ]]; then
        NEW_COLOR="green"
    else
        NEW_COLOR="blue"
    fi
    
    log "Current color: $CURRENT_COLOR, deploying: $NEW_COLOR"
    
    if ! $DRY_RUN; then
        # Create new deployment with different color
        sed "s/romai-agi/romai-agi-$NEW_COLOR/g" kubernetes/romai-agi-production.yaml | \
        kubectl apply -f -
        
        # Update image
        kubectl set image deployment/romai-agi-$NEW_COLOR \
            romai-agi="$FULL_IMAGE" \
            -n "$NAMESPACE"
        
        # Wait for new deployment
        kubectl rollout status deployment/romai-agi-$NEW_COLOR \
            -n "$NAMESPACE" \
            --timeout=900s
        
        # Run smoke tests
        run_smoke_tests "$NEW_COLOR"
        
        # Switch traffic
        kubectl patch service romai-agi-service -n "$NAMESPACE" \
            -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
        
        # Wait and verify
        sleep 30
        run_smoke_tests "active"
        
        # Cleanup old deployment
        kubectl delete deployment romai-agi-$CURRENT_COLOR -n "$NAMESPACE" || true
        
        # Update main deployment label
        kubectl label deployment romai-agi -n "$NAMESPACE" color="$NEW_COLOR" --overwrite
        
        log "✅ Blue-green deployment completed"
    else
        info "Would perform blue-green deployment from $CURRENT_COLOR to $NEW_COLOR"
    fi
}

# Parallel deployment strategy
deploy_parallel() {
    log "⚡ Using parallel deployment strategy..."
    
    if ! $DRY_RUN; then
        # Apply all resources in parallel
        kubectl apply -f kubernetes/ --recursive &
        
        # Update multiple deployments in parallel
        kubectl set image deployment/romai-agi romai-agi="$FULL_IMAGE" -n "$NAMESPACE" &
        kubectl set image deployment/romai-redis redis=redis:7.2-alpine -n "$NAMESPACE" &
        
        # Wait for all background jobs
        wait
        
        # Check rollout status
        kubectl rollout status deployment/romai-agi -n "$NAMESPACE" --timeout=600s
        
        log "✅ Parallel deployment completed"
    else
        info "Would perform parallel deployment"
    fi
}

# Run smoke tests
run_smoke_tests() {
    local TARGET="${1:-active}"
    log "💨 Running smoke tests against $TARGET deployment..."
    
    if [[ "$TARGET" == "active" ]]; then
        SERVICE_URL=$(kubectl get service romai-agi-lb -n "$NAMESPACE" \
            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "localhost")
    else
        SERVICE_URL=$(kubectl get service romai-agi-$TARGET -n "$NAMESPACE" \
            -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "localhost")
    fi
    
    # Health check
    curl -f "http://$SERVICE_URL:6101/health" || {
        error "Health check failed"
        return 1
    }
    
    # Capabilities check
    curl -f "http://$SERVICE_URL:6101/agi/capabilities" || {
        error "Capabilities check failed"
        return 1
    }
    
    # Reasoning test
    curl -X POST "http://$SERVICE_URL:6101/agi/reason" \
        -H "Content-Type: application/json" \
        -d '{"query": "What is 2+2?", "capability": "mathematical"}' \
        -f || {
        error "Reasoning test failed"
        return 1
    }
    
    log "✅ Smoke tests passed"
}

# Rollback functionality
perform_rollback() {
    log "↩️ Rolling back deployment..."
    
    if ! $DRY_RUN; then
        kubectl rollout undo deployment/romai-agi -n "$NAMESPACE"
        kubectl rollout status deployment/romai-agi -n "$NAMESPACE" --timeout=600s
        
        # Verify rollback
        run_smoke_tests
        
        log "✅ Rollback completed"
    else
        info "Would rollback deployment"
    fi
}

# Post-deployment monitoring
post_deployment_monitoring() {
    log "📊 Setting up post-deployment monitoring..."
    
    if ! $DRY_RUN; then
        # Apply monitoring configurations
        kubectl apply -f monitoring/ --recursive || warn "Monitoring setup failed"
        
        # Set up alerts
        if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
            curl -X POST "$SLACK_WEBHOOK" \
                -H 'Content-type: application/json' \
                -d "{\"text\":\"🚀 RomAI AGI deployed successfully to $ENVIRONMENT\"}" || true
        fi
    else
        info "Would set up monitoring and alerts"
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    
    # Remove temporary files
    rm -f /tmp/romai-deploy-* || true
    
    # Clean up old Docker images
    docker image prune -f --filter "until=24h" || true
}

# Main execution
main() {
    trap cleanup EXIT
    
    if $ROLLBACK; then
        perform_rollback
        return
    fi
    
    pre_deployment_checks
    build_containers
    
    if $BUILD_ONLY; then
        log "✅ Build-only deployment completed"
        return
    fi
    
    run_tests
    backup_database
    deploy_application
    run_smoke_tests
    post_deployment_monitoring
    
    log "🎉 RomAI AGI deployment to $ENVIRONMENT completed successfully!"
    info "Frontend: https://app.romai.ai"
    info "API: https://api.romai.ai"
    info "Monitoring: https://monitoring.romai.ai"
}

# Execute main function
main "$@"