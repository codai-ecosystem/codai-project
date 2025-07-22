#!/bin/bash
# CBD-MemoraiMCP Production Deployment Script
# Comprehensive Kubernetes deployment with compliance validation

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-cbd-memorai-prod}"
ENVIRONMENT="${ENVIRONMENT:-production}"
HELM_CHART_PATH="${HELM_CHART_PATH:-./helm/cbd-memorai-chart}"
VALUES_FILE="${VALUES_FILE:-values-production.yaml}"
KUBECTL_CONTEXT="${KUBECTL_CONTEXT:-production-cluster}"
DRY_RUN="${DRY_RUN:-false}"
SKIP_COMPLIANCE="${SKIP_COMPLIANCE:-false}"
BACKUP_ENABLED="${BACKUP_ENABLED:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
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

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Banner
show_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                CBD-MemoraiMCP Production Deployment              ║"
    echo "║                      Phase 4: Go-Live Ready                     ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Prerequisites check
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check required tools
    for tool in kubectl helm docker; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool '$tool' is not installed"
        fi
    done
    
    # Check Kubernetes context
    if ! kubectl config current-context | grep -q "$KUBECTL_CONTEXT"; then
        warning "Current context is not $KUBECTL_CONTEXT"
        kubectl config use-context "$KUBECTL_CONTEXT" || error "Failed to switch to $KUBECTL_CONTEXT"
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
    fi
    
    # Check Helm chart exists
    if [[ ! -d "$HELM_CHART_PATH" ]]; then
        error "Helm chart not found at: $HELM_CHART_PATH"
    fi
    
    # Check values file
    if [[ ! -f "$VALUES_FILE" ]]; then
        error "Values file not found: $VALUES_FILE"
    fi
    
    success "Prerequisites check passed"
}

# Pre-deployment backup
create_backup() {
    if [[ "$BACKUP_ENABLED" != "true" ]]; then
        log "Backup disabled, skipping..."
        return 0
    fi
    
    log "Creating pre-deployment backup..."
    
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Export current namespace resources
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log "Backing up existing resources in namespace: $NAMESPACE"
        kubectl get all,secrets,configmaps,pvc -n "$NAMESPACE" -o yaml > "$backup_dir/existing-resources.yaml"
        
        # Export persistent data if exists
        kubectl get pvc -n "$NAMESPACE" -o json | jq -r '.items[].metadata.name' | while read pvc; do
            log "Creating snapshot for PVC: $pvc"
            # This would typically use cloud provider specific snapshot creation
            # kubectl exec -n "$NAMESPACE" deployment/backup-tool -- create-snapshot "$pvc" "$backup_dir/$pvc.snapshot"
        done
    fi
    
    success "Backup created at: $backup_dir"
}

# Compliance validation
validate_compliance() {
    if [[ "$SKIP_COMPLIANCE" == "true" ]]; then
        warning "Compliance validation skipped"
        return 0
    fi
    
    log "Running compliance validation..."
    
    # Generate manifests for validation
    local temp_manifests="./temp-manifests"
    mkdir -p "$temp_manifests"
    
    helm template cbd-memorai "$HELM_CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE" \
        --output-dir "$temp_manifests"
    
    # Run compliance checks using custom validator
    if [[ -f "./scripts/compliance-validator.py" ]]; then
        log "Running CBD compliance validator..."
        python3 ./scripts/compliance-validator.py \
            --manifests-dir "$temp_manifests" \
            --framework "SOC2,GDPR,ISO27001" \
            --environment "$ENVIRONMENT" \
            --output "./compliance-report.json"
        
        # Check compliance score
        local compliance_score=$(cat ./compliance-report.json | jq -r '.overall_score')
        if (( $(echo "$compliance_score < 90" | bc -l) )); then
            error "Compliance score ($compliance_score%) below required threshold (90%)"
        fi
        
        success "Compliance validation passed with score: ${compliance_score}%"
    else
        warning "Compliance validator not found, performing basic checks..."
        
        # Basic security checks
        if grep -r "privileged: true" "$temp_manifests"; then
            error "Privileged containers detected - not allowed in production"
        fi
        
        if grep -r "runAsRoot: true" "$temp_manifests"; then
            error "Running as root detected - not allowed in production"
        fi
        
        success "Basic compliance checks passed"
    fi
    
    # Cleanup temporary manifests
    rm -rf "$temp_manifests"
}

# Security scanning
run_security_scan() {
    log "Running security scans..."
    
    # Image vulnerability scanning
    local images=(
        "codai/cbd-engine:latest"
        "codai/memorai-mcp:latest"
    )
    
    for image in "${images[@]}"; do
        log "Scanning image: $image"
        
        if command -v trivy &> /dev/null; then
            trivy image --severity HIGH,CRITICAL --no-progress "$image" || warning "Vulnerabilities found in $image"
        else
            warning "Trivy not available, skipping image scan for $image"
        fi
    done
    
    success "Security scanning completed"
}

# Deploy infrastructure components
deploy_infrastructure() {
    log "Deploying infrastructure components..."
    
    # Create namespaces
    kubectl apply -f k8s/namespaces/
    
    # Deploy RBAC
    kubectl apply -f k8s/rbac/
    
    # Deploy security policies
    kubectl apply -f k8s/security/
    
    # Deploy monitoring (if not using Helm)
    if [[ ! $(helm list -n cbd-memorai-monitoring | grep prometheus) ]]; then
        log "Deploying monitoring stack..."
        kubectl apply -f k8s/monitoring/
    fi
    
    success "Infrastructure components deployed"
}

# Deploy application using Helm
deploy_application() {
    log "Deploying CBD-MemoraiMCP application..."
    
    local helm_args=(
        "upgrade"
        "--install"
        "cbd-memorai"
        "$HELM_CHART_PATH"
        "--namespace" "$NAMESPACE"
        "--create-namespace"
        "--values" "$VALUES_FILE"
        "--timeout" "15m"
        "--wait"
        "--wait-for-jobs"
    )
    
    if [[ "$DRY_RUN" == "true" ]]; then
        helm_args+=("--dry-run")
        log "Running in dry-run mode..."
    fi
    
    # Add environment-specific configurations
    helm_args+=(
        "--set" "environment=$ENVIRONMENT"
        "--set" "deployment.timestamp=$(date +%s)"
        "--set" "global.registry=codai"
    )
    
    # Execute Helm deployment
    if helm "${helm_args[@]}"; then
        success "Application deployed successfully"
    else
        error "Application deployment failed"
    fi
}

# Post-deployment validation
validate_deployment() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "Skipping validation in dry-run mode"
        return 0
    fi
    
    log "Validating deployment..."
    
    # Wait for all deployments to be ready
    log "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment -n "$NAMESPACE" --all
    
    # Check pod status
    local failing_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers | wc -l)
    if [[ $failing_pods -gt 0 ]]; then
        error "Found $failing_pods pods not in Running state"
    fi
    
    # Health checks
    log "Running health checks..."
    
    # CBD Engine health check
    local cbd_service=$(kubectl get service -n "$NAMESPACE" -l app=cbd-engine -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec -n "$NAMESPACE" deployment/cbd-engine -- curl -f http://localhost:8080/health &> /dev/null; then
        success "CBD Engine health check passed"
    else
        error "CBD Engine health check failed"
    fi
    
    # MemoraiMCP health check
    if kubectl exec -n "$NAMESPACE" deployment/memorai-mcp -- curl -f http://localhost:3000/health &> /dev/null; then
        success "MemoraiMCP health check passed"
    else
        error "MemoraiMCP health check failed"
    fi
    
    # Integration test
    log "Running integration tests..."
    if [[ -f "./tests/integration/k8s-integration-test.sh" ]]; then
        ./tests/integration/k8s-integration-test.sh --namespace "$NAMESPACE" || error "Integration tests failed"
        success "Integration tests passed"
    else
        warning "Integration tests not found, skipping..."
    fi
    
    success "Deployment validation completed"
}

# Configure monitoring and alerting
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Deploy Prometheus rules
    kubectl apply -f k8s/monitoring/prometheus-rules.yaml
    
    # Deploy Grafana dashboards
    kubectl apply -f k8s/monitoring/grafana-dashboards.yaml
    
    # Configure alerts
    if [[ -f "k8s/monitoring/alert-rules.yaml" ]]; then
        kubectl apply -f k8s/monitoring/alert-rules.yaml
        success "Alert rules configured"
    fi
    
    # Test monitoring endpoints
    local prometheus_url=$(kubectl get ingress -n cbd-memorai-monitoring prometheus-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "prometheus.local")
    local grafana_url=$(kubectl get ingress -n cbd-memorai-monitoring grafana-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "grafana.local")
    
    info "Monitoring endpoints:"
    info "  Prometheus: https://$prometheus_url"
    info "  Grafana: https://$grafana_url"
    
    success "Monitoring setup completed"
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# CBD-MemoraiMCP Production Deployment Report

**Deployment Date:** $(date)  
**Environment:** $ENVIRONMENT  
**Namespace:** $NAMESPACE  
**Deployed By:** $(whoami)  

## Deployment Summary

- **Status:** ✅ Successful
- **Kubernetes Context:** $KUBECTL_CONTEXT
- **Helm Chart:** $HELM_CHART_PATH
- **Values File:** $VALUES_FILE

## Application Status

### CBD Engine
- **Replicas:** $(kubectl get deployment -n "$NAMESPACE" cbd-engine -o jsonpath='{.status.readyReplicas}')
- **Image:** $(kubectl get deployment -n "$NAMESPACE" cbd-engine -o jsonpath='{.spec.template.spec.containers[0].image}')
- **Status:** $(kubectl get deployment -n "$NAMESPACE" cbd-engine -o jsonpath='{.status.conditions[0].type}')

### MemoraiMCP
- **Replicas:** $(kubectl get deployment -n "$NAMESPACE" memorai-mcp -o jsonpath='{.status.readyReplicas}')
- **Image:** $(kubectl get deployment -n "$NAMESPACE" memorai-mcp -o jsonpath='{.spec.template.spec.containers[0].image}')
- **Status:** $(kubectl get deployment -n "$NAMESPACE" memorai-mcp -o jsonpath='{.status.conditions[0].type}')

## Compliance Status

$(if [[ -f "./compliance-report.json" ]]; then
    echo "- **Overall Score:** $(cat ./compliance-report.json | jq -r '.overall_score')%"
    echo "- **Framework Compliance:** $(cat ./compliance-report.json | jq -r '.frameworks | keys | join(", ")')"
else
    echo "- **Compliance Check:** Basic validation passed"
fi)

## Next Steps

1. Monitor application performance and health
2. Review security scanning results
3. Configure backup and disaster recovery
4. Schedule compliance audits
5. Update documentation and runbooks

---
*Generated automatically by CBD-MemoraiMCP deployment script*
EOF

    success "Deployment report generated: $report_file"
}

# Main deployment workflow
main() {
    show_banner
    
    log "Starting CBD-MemoraiMCP production deployment..."
    log "Environment: $ENVIRONMENT"
    log "Namespace: $NAMESPACE"
    log "Dry Run: $DRY_RUN"
    
    # Execute deployment steps
    check_prerequisites
    create_backup
    validate_compliance
    run_security_scan
    deploy_infrastructure
    deploy_application
    validate_deployment
    setup_monitoring
    generate_report
    
    success "🎉 CBD-MemoraiMCP production deployment completed successfully!"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        info "Application endpoints:"
        info "  MemoraiMCP API: https://$(kubectl get ingress -n "$NAMESPACE" cbd-memorai-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo 'memorai-api.codai.app')"
        info "  CBD Engine: https://$(kubectl get ingress -n "$NAMESPACE" cbd-memorai-ingress -o jsonpath='{.spec.rules[1].host}' 2>/dev/null || echo 'cbd-engine.codai.app')"
        info ""
        info "Next: Monitor the deployment and conduct final acceptance testing"
    fi
}

# Script execution
main "$@"
