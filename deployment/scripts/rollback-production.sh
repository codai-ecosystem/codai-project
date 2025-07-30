#!/bin/bash
# CODAI Ecosystem Rollback Script
# Safely rollback to a previous deployment version

set -e

# Configuration
NAMESPACE="codai-production"
ROLLBACK_VERSION=""
BACKUP_BEFORE_ROLLBACK=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${GREEN}$1${NC}"
}

warn() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${YELLOW}WARNING: $1${NC}"
}

error() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${RED}ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${BLUE}INFO: $1${NC}"
}

# Help function
show_help() {
    echo "CODAI Ecosystem Rollback Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [REVISION]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -n, --namespace NAME    Target namespace (default: codai-production)"
    echo "  -l, --list              List available rollback revisions"
    echo "  -v, --version VERSION   Specific version to rollback to"
    echo "  --no-backup            Skip backup before rollback"
    echo "  --force                Force rollback without confirmation"
    echo ""
    echo "Examples:"
    echo "  $0 -l                   List available revisions"
    echo "  $0 2                    Rollback to revision 2"
    echo "  $0 -v 1.2.3            Rollback to version 1.2.3"
    echo "  $0 --force 1           Force rollback to revision 1"
    echo ""
}

# Parse command line arguments
parse_arguments() {
    FORCE_ROLLBACK=false
    LIST_REVISIONS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -l|--list)
                LIST_REVISIONS=true
                shift
                ;;
            -v|--version)
                ROLLBACK_VERSION="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP_BEFORE_ROLLBACK=false
                shift
                ;;
            --force)
                FORCE_ROLLBACK=true
                shift
                ;;
            *)
                if [[ -z "$ROLLBACK_VERSION" ]] && [[ "$1" =~ ^[0-9]+$ ]]; then
                    ROLLBACK_VERSION="$1"
                fi
                shift
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    fi
    
    # Check namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        error "Namespace $NAMESPACE does not exist."
    fi
    
    log "✅ Prerequisites check passed"
}

# List available rollback revisions
list_revisions() {
    log "📋 Available rollback revisions:"
    echo ""
    
    # Get API Gateway rollout history
    echo "API Gateway Rollout History:"
    kubectl rollout history deployment/api-gateway -n $NAMESPACE --revision=0 || warn "API Gateway deployment not found"
    echo ""
    
    # Get core services rollout history
    echo "Core Services Rollout History:"
    CORE_SERVICES=("id-service" "memorai-service" "hub-service" "logai-service")
    for service in "${CORE_SERVICES[@]}"; do
        if kubectl get deployment $service -n $NAMESPACE &>/dev/null; then
            echo "  $service:"
            kubectl rollout history deployment/$service -n $NAMESPACE --revision=0 | head -5
            echo ""
        fi
    done
    
    # Get current deployment versions
    echo "Current Deployment Versions:"
    kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image,REPLICAS:.status.readyReplicas
    echo ""
}

# Backup current state
backup_current_state() {
    if [ "$BACKUP_BEFORE_ROLLBACK" = true ]; then
        log "💾 Creating backup of current state..."
        
        BACKUP_DIR="rollback-backups/$(date +%Y%m%d-%H%M%S)-pre-rollback"
        mkdir -p $BACKUP_DIR
        
        # Backup deployment configurations
        kubectl get deployments -n $NAMESPACE -o yaml > $BACKUP_DIR/deployments.yaml
        kubectl get services -n $NAMESPACE -o yaml > $BACKUP_DIR/services.yaml
        kubectl get configmaps -n $NAMESPACE -o yaml > $BACKUP_DIR/configmaps.yaml
        kubectl get ingresses -n $NAMESPACE -o yaml > $BACKUP_DIR/ingresses.yaml
        kubectl get hpa -n $NAMESPACE -o yaml > $BACKUP_DIR/hpa.yaml 2>/dev/null || true
        
        # Backup current pod status
        kubectl get pods -n $NAMESPACE -o wide > $BACKUP_DIR/pods-status.txt
        kubectl describe deployments -n $NAMESPACE > $BACKUP_DIR/deployments-describe.txt
        
        # Save rollout history
        mkdir -p $BACKUP_DIR/rollout-history
        for deployment in $(kubectl get deployments -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
            kubectl rollout history deployment/$deployment -n $NAMESPACE > $BACKUP_DIR/rollout-history/$deployment.txt 2>/dev/null || true
        done
        
        log "✅ Backup created in $BACKUP_DIR"
        echo "BACKUP_DIR=$BACKUP_DIR" > /tmp/codai-rollback-backup-path
    fi
}

# Validate rollback target
validate_rollback_target() {
    if [ -z "$ROLLBACK_VERSION" ]; then
        error "No rollback version specified. Use -l to list available revisions."
    fi
    
    # Check if it's a revision number or version string
    if [[ "$ROLLBACK_VERSION" =~ ^[0-9]+$ ]]; then
        REVISION_NUMBER=$ROLLBACK_VERSION
        log "🎯 Rolling back to revision $REVISION_NUMBER"
    else
        log "🎯 Rolling back to version $ROLLBACK_VERSION"
        warn "Version-based rollback may require manual intervention"
    fi
    
    # Verify revision exists for API Gateway
    if ! kubectl rollout history deployment/api-gateway -n $NAMESPACE --revision=$ROLLBACK_VERSION &>/dev/null && [[ "$ROLLBACK_VERSION" =~ ^[0-9]+$ ]]; then
        error "Revision $ROLLBACK_VERSION does not exist for API Gateway deployment"
    fi
}

# Confirm rollback operation
confirm_rollback() {
    if [ "$FORCE_ROLLBACK" = false ]; then
        echo ""
        warn "⚠️  ROLLBACK OPERATION"
        echo "This will rollback the CODAI ecosystem to revision/version: $ROLLBACK_VERSION"
        echo "Namespace: $NAMESPACE"
        echo ""
        echo "Current deployment status:"
        kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,AVAILABLE:.status.availableReplicas
        echo ""
        
        read -p "Are you sure you want to proceed with the rollback? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi
}

# Perform the actual rollback
perform_rollback() {
    log "🔄 Starting rollback operation..."
    
    # Array of all deployments to rollback
    ALL_DEPLOYMENTS=(
        "api-gateway"
        "id-service" 
        "memorai-service"
        "hub-service"
        "logai-service"
        "codai-service"
        "bancai-service" 
        "cumparai-service"
        "studiai-service"
        "fabricai-service"
        "muzicai-service"
        "talentai-service"
        "sociai-service"
        "stocai-service"
    )
    
    # Rollback each deployment
    for deployment in "${ALL_DEPLOYMENTS[@]}"; do
        if kubectl get deployment $deployment -n $NAMESPACE &>/dev/null; then
            info "Rolling back $deployment..."
            
            if [[ "$ROLLBACK_VERSION" =~ ^[0-9]+$ ]]; then
                # Revision-based rollback
                if kubectl rollout undo deployment/$deployment -n $NAMESPACE --to-revision=$ROLLBACK_VERSION; then
                    log "✅ $deployment rollback initiated"
                else
                    warn "⚠️  Failed to rollback $deployment, continuing..."
                fi
            else
                # Version-based rollback (manual image update)
                warn "Version-based rollback for $deployment requires manual intervention"
                # You would need to map versions to image tags here
            fi
        else
            info "Deployment $deployment not found, skipping..."
        fi
    done
    
    log "✅ Rollback operations initiated for all deployments"
}

# Wait for rollback to complete
wait_for_rollback() {
    log "⏳ Waiting for rollback to complete..."
    
    # Wait for each deployment to complete rollback
    TIMEOUT=300
    for deployment in api-gateway id-service memorai-service hub-service logai-service codai-service bancai-service cumparai-service studiai-service fabricai-service; do
        if kubectl get deployment $deployment -n $NAMESPACE &>/dev/null; then
            info "Waiting for $deployment rollback to complete..."
            if kubectl rollout status deployment/$deployment -n $NAMESPACE --timeout=${TIMEOUT}s; then
                log "✅ $deployment rollback completed"
            else
                warn "⚠️  $deployment rollback timeout or failed"
            fi
        fi
    done
    
    # Wait for all pods to be ready
    info "Waiting for all pods to be ready..."
    kubectl wait --for=condition=ready pod --all -n $NAMESPACE --timeout=300s || warn "Some pods may not be ready"
    
    log "✅ Rollback operations completed"
}

# Verify rollback success
verify_rollback() {
    log "🔍 Verifying rollback success..."
    
    # Check deployment status
    echo ""
    echo "Current Deployment Status:"
    kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,AVAILABLE:.status.availableReplicas,AGE:.metadata.creationTimestamp
    echo ""
    
    # Check pod status
    echo "Pod Status:"
    kubectl get pods -n $NAMESPACE -o wide
    echo ""
    
    # Test API Gateway health
    API_GATEWAY_IP=$(kubectl get svc api-gateway-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")
    if [ ! -z "$API_GATEWAY_IP" ]; then
        if kubectl run rollback-health-check --rm -i --restart=Never --image=curlimages/curl -- curl -f --max-time 10 http://$API_GATEWAY_IP:4000/health 2>/dev/null; then
            log "✅ API Gateway health check passed"
        else
            error "❌ API Gateway health check failed"
        fi
    else
        warn "⚠️  API Gateway service not found"
    fi
    
    # Check service endpoints
    info "Checking service health endpoints..."
    FAILED_SERVICES=()
    
    for service in id-service memorai-service hub-service logai-service; do
        if kubectl get svc $service -n $NAMESPACE &>/dev/null; then
            SERVICE_IP=$(kubectl get svc $service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
            SERVICE_PORT=$(kubectl get svc $service -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
            
            if kubectl run rollback-health-check-$service --rm -i --restart=Never --image=curlimages/curl -- curl -f --max-time 10 http://$SERVICE_IP:$SERVICE_PORT/health 2>/dev/null; then
                log "✅ $service health check passed"
            else
                warn "⚠️  $service health check failed"
                FAILED_SERVICES+=($service)
            fi
        fi
    done
    
    # Summary
    if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
        log "✅ All health checks passed - rollback verification successful"
    else
        warn "⚠️  Some services failed health checks: ${FAILED_SERVICES[*]}"
        warn "Manual investigation may be required"
    fi
}

# Display rollback summary
display_rollback_summary() {
    log "📋 Rollback Summary"
    
    echo ""
    echo "🔄 CODAI Ecosystem Rollback Complete!"
    echo "====================================="
    echo ""
    echo "Rollback Details:"
    echo "  • Target: Revision/Version $ROLLBACK_VERSION"
    echo "  • Namespace: $NAMESPACE"
    echo "  • Timestamp: $(date)"
    echo ""
    
    # Show current revision numbers
    echo "Current Revision Numbers:"
    for deployment in api-gateway id-service memorai-service hub-service logai-service; do
        if kubectl get deployment $deployment -n $NAMESPACE &>/dev/null; then
            CURRENT_REVISION=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}')
            echo "  • $deployment: Revision $CURRENT_REVISION"
        fi
    done
    echo ""
    
    echo "📊 Deployed Services After Rollback:"
    kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,AVAILABLE:.status.availableReplicas,IMAGE:.spec.template.spec.containers[0].image
    echo ""
    
    if [ "$BACKUP_BEFORE_ROLLBACK" = true ] && [ -f "/tmp/codai-rollback-backup-path" ]; then
        BACKUP_PATH=$(cat /tmp/codai-rollback-backup-path | cut -d'=' -f2)
        echo "💾 Pre-rollback backup location: $BACKUP_PATH"
        echo ""
    fi
    
    echo "🔗 Access URLs:"
    echo "  • API Gateway: https://api.codai.ro"
    echo "  • Documentation: https://docs.codai.ro"
    echo "  • Monitoring: https://grafana.codai.ro"
    echo ""
    
    echo "📚 Useful Post-Rollback Commands:"
    echo "  • Check logs: kubectl logs -f deployment/api-gateway -n $NAMESPACE"
    echo "  • View events: kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
    echo "  • Scale if needed: kubectl scale deployment api-gateway --replicas=5 -n $NAMESPACE"
    echo "  • Roll forward: ./deploy-production.sh  # (to deploy latest version again)"
    echo ""
    
    if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
        warn "⚠️  Some services may need attention: ${FAILED_SERVICES[*]}"
        echo "Consider checking logs and service configurations."
    fi
}

# Emergency rollback (simplified, fastest possible)
emergency_rollback() {
    log "🚨 EMERGENCY ROLLBACK MODE"
    warn "This will perform the fastest possible rollback with minimal checks"
    
    # Immediate rollback of critical services
    CRITICAL_SERVICES=("api-gateway" "id-service" "memorai-service")
    
    for service in "${CRITICAL_SERVICES[@]}"; do
        if kubectl get deployment $service -n $NAMESPACE &>/dev/null; then
            info "Emergency rollback: $service"
            kubectl rollout undo deployment/$service -n $NAMESPACE --to-revision=$ROLLBACK_VERSION &
        fi
    done
    
    # Wait for critical services
    wait
    
    # Quick health check
    sleep 30
    API_GATEWAY_IP=$(kubectl get svc api-gateway-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")
    if [ ! -z "$API_GATEWAY_IP" ]; then
        if kubectl run emergency-health-check --rm -i --restart=Never --image=curlimages/curl -- curl -f --max-time 5 http://$API_GATEWAY_IP:4000/health 2>/dev/null; then
            log "✅ Emergency rollback appears successful"
        else
            error "❌ Emergency rollback failed - manual intervention required"
        fi
    fi
}

# Cleanup function
cleanup() {
    # Clean up temporary files
    rm -f /tmp/codai-rollback-backup-path
    
    # Clean up any test pods that might be left behind
    kubectl delete pod -n $NAMESPACE -l run=rollback-health-check --ignore-not-found=true &>/dev/null || true
    kubectl delete pod -n $NAMESPACE -l run=emergency-health-check --ignore-not-found=true &>/dev/null || true
}

# Main function
main() {
    echo ""
    echo "🔄 CODAI Ecosystem Rollback Tool"
    echo "================================"
    echo ""
    
    parse_arguments "$@"
    
    if [ "$LIST_REVISIONS" = true ]; then
        check_prerequisites
        list_revisions
        exit 0
    fi
    
    check_prerequisites
    validate_rollback_target
    
    # Handle emergency rollback
    if [ "$1" = "--emergency" ]; then
        emergency_rollback
        cleanup
        exit 0
    fi
    
    confirm_rollback
    backup_current_state
    perform_rollback
    wait_for_rollback
    verify_rollback
    display_rollback_summary
    cleanup
    
    log "🎉 Rollback operation completed successfully!"
}

# Handle script interruption
trap 'error "Rollback interrupted! System may be in inconsistent state. Check deployment status manually."; cleanup' INT TERM

# Ensure cleanup runs on exit
trap 'cleanup' EXIT

# Run main function
main "$@"
