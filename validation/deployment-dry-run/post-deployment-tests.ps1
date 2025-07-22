# Post-Deployment Validation Tests (PowerShell)
param([string]$Namespace = "cbd-memorai-staging")

Write-Host "Running post-deployment validation tests..."

# Check pod status
Write-Host "Checking pod status..."
kubectl get pods -n $Namespace

# Verify services are healthy
Write-Host "Verifying service health..."
kubectl wait --for=condition=available deployment/cbd-engine -n $Namespace --timeout=300s
kubectl wait --for=condition=available deployment/memorai-mcp -n $Namespace --timeout=300s

# Test service endpoints (if accessible)
Write-Host "Testing service endpoints..."
try {
    $cbdHealth = Invoke-RestMethod -Uri "http://localhost:8080/health" -ErrorAction SilentlyContinue
    Write-Host "CBD Engine health check: OK"
} catch {
    Write-Warning "CBD Engine health check failed: $($_.Exception.Message)"
}

try {
    $memoraiHealth = Invoke-RestMethod -Uri "http://localhost:3000/health" -ErrorAction SilentlyContinue  
    Write-Host "MemoraiMCP health check: OK"
} catch {
    Write-Warning "MemoraiMCP health check failed: $($_.Exception.Message)"
}

# Run integration tests
Write-Host "Running integration tests..."
if (Test-Path "tests/cbd-memorai-integration") {
    Set-Location "tests/cbd-memorai-integration"
    npm test
    Set-Location "../.."
}

Write-Host "Post-deployment validation completed!"
