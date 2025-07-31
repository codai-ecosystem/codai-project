# Security Scanning Script for Windows
param([string]$Target = "http://localhost:3000")

Write-Host "Starting security scan of: $Target"

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Running OWASP ZAP baseline scan..."
    docker run -t owasp/zap2docker-stable zap-baseline.py -t $Target -J zap-report.json -H zap-report.html
    
    Write-Host "Running Trivy container scan..."
    docker run --rm aquasec/trivy image codai/cbd-engine:latest
    docker run --rm aquasec/trivy image codai/memorai-mcp:latest
} else {
    Write-Warning "Docker not available. Please install Docker for security scanning."
}
