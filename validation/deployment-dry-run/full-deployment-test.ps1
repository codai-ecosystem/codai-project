# Full Production Deployment Dry Run Test (PowerShell)
param(
    [string]$Namespace = "cbd-memorai-staging",
    [switch]$DryRun = $true
)

Write-Host "Starting production deployment dry run..."

# Validate prerequisites
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "kubectl not found"
    exit 1
}

if (!(Get-Command helm -ErrorAction SilentlyContinue)) {
    Write-Error "helm not found"
    exit 1
}

# Create staging namespace if it doesn't exist
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Deploy with dry run first
if ($DryRun) {
    Write-Host "Executing dry run deployment..."
    helm upgrade --install cbd-memorai ./helm/cbd-memorai-chart `
        --namespace $Namespace `
        --values values-staging.yaml `
        --dry-run `
        --debug
} else {
    Write-Host "Executing actual deployment..."
    helm upgrade --install cbd-memorai ./helm/cbd-memorai-chart `
        --namespace $Namespace `
        --values values-staging.yaml `
        --wait `
        --timeout=600s
        
    # Run post-deployment tests
    Write-Host "Running post-deployment tests..."
    & "$PSScriptRoot/post-deployment-tests.ps1" -Namespace $Namespace
}

Write-Host "Deployment dry run completed!"
