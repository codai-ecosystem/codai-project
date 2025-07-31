# Disaster Recovery Test Script for Windows
param([string]$Namespace = "cbd-memorai-prod")

Write-Host "Starting disaster recovery test for namespace: $Namespace"

# Check if Velero is available
if (Get-Command velero -ErrorAction SilentlyContinue) {
    $BackupName = "cbd-memorai-dr-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    Write-Host "Creating backup: $BackupName"
    velero backup create $BackupName --include-namespaces $Namespace --wait
    
    Write-Host "Verifying backup status..."
    velero backup describe $BackupName --details
    
    Write-Host "Simulating disaster scenario..."
    kubectl scale deployment cbd-engine --replicas=0 -n $Namespace
    kubectl scale deployment memorai-mcp --replicas=0 -n $Namespace
    
    Write-Host "Waiting for pods to terminate..."
    Start-Sleep -Seconds 30
    
    Write-Host "Restoring from backup..."
    velero restore create --from-backup $BackupName --wait
    
    Write-Host "Verifying restoration..."
    kubectl wait --for=condition=available deployment/cbd-engine -n $Namespace --timeout=300s
    kubectl wait --for=condition=available deployment/memorai-mcp -n $Namespace --timeout=300s
    
    Write-Host "Disaster recovery test completed successfully!"
} else {
    Write-Warning "Velero not found. Please install Velero for Kubernetes backup testing."
}
