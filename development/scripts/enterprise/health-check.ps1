# MemorAI Enterprise Health Check Script (PowerShell)

param(
    [switch]$Detailed
)

# Colors
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Info {
    param([string]$Message)
    Write-Host "${Blue}[INFO]${Reset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${Green}[SUCCESS]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

Write-Host "🏥 MemorAI Enterprise Health Check" -ForegroundColor Green
Write-Host "=================================="

# Check cluster status
Write-Info "Checking cluster status..."
try {
    kubectl cluster-info | Out-Null
    Write-Success "Kubernetes cluster is accessible"
} catch {
    Write-Error "Cannot access Kubernetes cluster"
    exit 1
}

# Check node status
Write-Info "Checking node status..."
$nodes = kubectl get nodes --no-headers
foreach ($line in $nodes) {
    $parts = $line -split '\s+'
    $nodeName = $parts[0]
    $nodeStatus = $parts[1]
    if ($nodeStatus -eq "Ready") {
        Write-Success "Node $nodeName is Ready"
    } else {
        Write-Error "Node $nodeName is $nodeStatus"
    }
}

# Check service status
Write-Info "Checking service status in memorai-system namespace..."
$pods = kubectl get pods -n memorai-system --no-headers
foreach ($line in $pods) {
    $parts = $line -split '\s+'
    $podName = $parts[0]
    $podStatus = $parts[2]
    if ($podStatus -eq "Running") {
        Write-Success "Pod $podName is Running"
    } else {
        Write-Warning "Pod $podName is $podStatus"
    }
}

# Check resource usage
Write-Info "Checking resource usage..."
try {
    kubectl top nodes | Out-Null
    kubectl top pods -n memorai-system | Out-Null
} catch {
    Write-Warning "Metrics server not available"
}

# Test API endpoints
Write-Info "Testing API endpoints..."
try {
    $gatewayIp = kubectl get svc istio-gateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    
    if ($gatewayIp -and $gatewayIp -ne "null" -and $gatewayIp -ne "") {
        Write-Info "Gateway IP: $gatewayIp"
        
        # Test health endpoint
        try {
            $response = Invoke-WebRequest "http://$gatewayIp/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Health endpoint is accessible"
            }
        } catch {
            Write-Warning "Health endpoint is not accessible"
        }
        
        # Test MCP API
        try {
            $response = Invoke-WebRequest "http://$gatewayIp/api/v1/mcp/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "MCP API is accessible"
            }
        } catch {
            Write-Warning "MCP API is not accessible"
        }
        
        # Test Vector API
        try {
            $response = Invoke-WebRequest "http://$gatewayIp/api/v1/vector/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Vector API is accessible"
            }
        } catch {
            Write-Warning "Vector API is not accessible"
        }
    } else {
        Write-Warning "Gateway IP not available or still pending"
    }
} catch {
    Write-Warning "Could not retrieve gateway information"
}

# Check persistent volumes
Write-Info "Checking persistent volumes..."
try {
    $pvs = kubectl get pv --no-headers
    foreach ($line in $pvs) {
        $parts = $line -split '\s+'
        $pvName = $parts[0]
        $pvStatus = $parts[4]
        if ($pvStatus -eq "Bound" -or $pvStatus -eq "Available") {
            Write-Success "PV $pvName is $pvStatus"
        } else {
            Write-Warning "PV $pvName is $pvStatus"
        }
    }
} catch {
    Write-Warning "Could not retrieve persistent volume information"
}

# Check secrets
Write-Info "Checking secrets..."
try {
    kubectl get secret memorai-secrets -n memorai-system | Out-Null
    Write-Success "memorai-secrets exists"
} catch {
    Write-Error "memorai-secrets not found"
}

# Summary
Write-Host ""
Write-Info "Health check summary:"

try {
    $totalPods = (kubectl get pods -n memorai-system --no-headers | Measure-Object).Count
    $runningPods = (kubectl get pods -n memorai-system --no-headers | Where-Object { $_ -match '\s+Running\s+' } | Measure-Object).Count
    $totalNodes = (kubectl get nodes --no-headers | Measure-Object).Count
    $readyNodes = (kubectl get nodes --no-headers | Where-Object { $_ -match '\s+Ready\s+' } | Measure-Object).Count

    Write-Host "  Nodes: $readyNodes/$totalNodes Ready"
    Write-Host "  Pods: $runningPods/$totalPods Running"

    if ($readyNodes -eq $totalNodes -and $runningPods -eq $totalPods) {
        Write-Success "✅ All systems operational!"
    } else {
        Write-Warning "⚠️  Some components may need attention"
    }
} catch {
    Write-Warning "Could not generate summary statistics"
}

Write-Host ""
Write-Host "For detailed information, run:"
Write-Host "  kubectl get all -n memorai-system"
Write-Host "  kubectl logs -f deployment/memorai-mcp -n memorai-system"
Write-Host "  kubectl logs -f statefulset/cbd-vector-db -n memorai-system"

if ($Detailed) {
    Write-Host ""
    Write-Info "Detailed cluster information:"
    kubectl get all -A
}
