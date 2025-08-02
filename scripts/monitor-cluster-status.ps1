# 🔍 CODAI Cluster Status Monitor

param(
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "codai-cluster-v2",
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1"
)

Write-Host "🔍 CODAI Cluster Status Monitor" -ForegroundColor Green
Write-Host "📊 Cluster: $ClusterName" -ForegroundColor Cyan
Write-Host "🌍 Region: $Region" -ForegroundColor Cyan
Write-Host ""

$maxChecks = 60
$checkInterval = 10
$currentCheck = 0

do {
    $currentCheck++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] Check $currentCheck/$maxChecks - Checking cluster status..." -ForegroundColor Yellow
    
    try {
        $clusterStatus = aws eks describe-cluster --name $ClusterName --region $Region --query 'cluster.status' --output text 2>$null
        
        if ($clusterStatus -eq "ACTIVE") {
            Write-Host ""
            Write-Host "🎉 CLUSTER IS ACTIVE!" -ForegroundColor Green
            Write-Host ""
            
            # Update kubeconfig
            Write-Host "🔧 Updating kubeconfig..." -ForegroundColor Yellow
            aws eks update-kubeconfig --name $ClusterName --region $Region
            
            # Check nodes
            Write-Host "📋 Checking nodes..." -ForegroundColor Yellow
            kubectl get nodes
            
            Write-Host ""
            Write-Host "✅ Cluster is ready for deployment!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
            Write-Host "1. Run: .\scripts\deploy-expanded-ecosystem.ps1 -Phase 1" -ForegroundColor White
            Write-Host "2. Configure Vercel DNS with the provided IP" -ForegroundColor White
            Write-Host "3. Test Phase 1 domains" -ForegroundColor White
            Write-Host ""
            break
        } elseif ($clusterStatus -eq "CREATING") {
            Write-Host "   Status: CREATING (control plane building...)" -ForegroundColor Yellow
        } elseif ($clusterStatus -eq "PENDING") {
            Write-Host "   Status: PENDING (waiting for resources...)" -ForegroundColor Yellow
        } else {
            Write-Host "   Status: $clusterStatus" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "   Error checking status: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($currentCheck -lt $maxChecks) {
        Start-Sleep $checkInterval
    }
    
} while ($currentCheck -lt $maxChecks)

if ($currentCheck -ge $maxChecks) {
    Write-Host ""
    Write-Host "⏰ Timeout reached. Check manually:" -ForegroundColor Red
    Write-Host "aws eks describe-cluster --name $ClusterName --region $Region" -ForegroundColor White
    Write-Host ""
}

Write-Host "📊 Monitoring complete." -ForegroundColor Cyan
