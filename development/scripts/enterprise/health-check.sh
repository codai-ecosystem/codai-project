#!/bin/bash
# MemorAI Enterprise Health Check Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🏥 MemorAI Enterprise Health Check"
echo "=================================="

# Check cluster status
log_info "Checking cluster status..."
if kubectl cluster-info &> /dev/null; then
    log_success "Kubernetes cluster is accessible"
else
    log_error "Cannot access Kubernetes cluster"
    exit 1
fi

# Check node status
log_info "Checking node status..."
kubectl get nodes --no-headers | while read line; do
    node_name=$(echo $line | awk '{print $1}')
    node_status=$(echo $line | awk '{print $2}')
    if [[ "$node_status" == "Ready" ]]; then
        log_success "Node $node_name is Ready"
    else
        log_error "Node $node_name is $node_status"
    fi
done

# Check service status
log_info "Checking service status in memorai-system namespace..."
kubectl get pods -n memorai-system --no-headers | while read line; do
    pod_name=$(echo $line | awk '{print $1}')
    pod_status=$(echo $line | awk '{print $3}')
    if [[ "$pod_status" == "Running" ]]; then
        log_success "Pod $pod_name is Running"
    else
        log_warning "Pod $pod_name is $pod_status"
    fi
done

# Check resource usage
log_info "Checking resource usage..."
kubectl top nodes 2>/dev/null || log_warning "Metrics server not available"
kubectl top pods -n memorai-system 2>/dev/null || log_warning "Pod metrics not available"

# Test API endpoints
log_info "Testing API endpoints..."
GATEWAY_IP=$(kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [[ -n "$GATEWAY_IP" && "$GATEWAY_IP" != "null" ]]; then
    log_info "Gateway IP: $GATEWAY_IP"
    
    # Test health endpoint
    if curl -f -s "http://$GATEWAY_IP/health" &> /dev/null; then
        log_success "Health endpoint is accessible"
    else
        log_warning "Health endpoint is not accessible"
    fi
    
    # Test MCP API
    if curl -f -s "http://$GATEWAY_IP/api/v1/mcp/health" &> /dev/null; then
        log_success "MCP API is accessible"
    else
        log_warning "MCP API is not accessible"
    fi
    
    # Test Vector API
    if curl -f -s "http://$GATEWAY_IP/api/v1/vector/health" &> /dev/null; then
        log_success "Vector API is accessible"
    else
        log_warning "Vector API is not accessible"
    fi
else
    log_warning "Gateway IP not available or still pending"
fi

# Check persistent volumes
log_info "Checking persistent volumes..."
kubectl get pv | grep -E "(Bound|Available)" | while read line; do
    pv_name=$(echo $line | awk '{print $1}')
    pv_status=$(echo $line | awk '{print $5}')
    log_success "PV $pv_name is $pv_status"
done

# Check secrets
log_info "Checking secrets..."
if kubectl get secret memorai-secrets -n memorai-system &> /dev/null; then
    log_success "memorai-secrets exists"
else
    log_error "memorai-secrets not found"
fi

# Summary
echo ""
log_info "Health check summary:"
TOTAL_PODS=$(kubectl get pods -n memorai-system --no-headers | wc -l)
RUNNING_PODS=$(kubectl get pods -n memorai-system --no-headers | grep Running | wc -l)
TOTAL_NODES=$(kubectl get nodes --no-headers | wc -l)
READY_NODES=$(kubectl get nodes --no-headers | grep Ready | wc -l)

echo "  Nodes: $READY_NODES/$TOTAL_NODES Ready"
echo "  Pods: $RUNNING_PODS/$TOTAL_PODS Running"

if [[ $READY_NODES -eq $TOTAL_NODES && $RUNNING_PODS -eq $TOTAL_PODS ]]; then
    log_success "✅ All systems operational!"
else
    log_warning "⚠️  Some components may need attention"
fi

echo ""
echo "For detailed information, run:"
echo "  kubectl get all -n memorai-system"
echo "  kubectl logs -f deployment/memorai-mcp -n memorai-system"
echo "  kubectl logs -f statefulset/cbd-vector-db -n memorai-system"
