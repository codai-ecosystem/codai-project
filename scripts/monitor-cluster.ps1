# EKS Cluster Status Monitor
# Monitors the cluster creation progress and provides next steps

param(
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "codai-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1"
)

Write-Host "🔍 EKS Cluster Status Monitor" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

function Get-ClusterStatus {
    try {
        $status = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-cluster --name $ClusterName --region $Region --query 'cluster.status' --output text 2>$null
        return $status
    } catch {
        return "ERROR"
    }
}

function Get-NodeGroupStatus {
    try {
        $nodeGroups = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks list-nodegroups --cluster-name $ClusterName --region $Region --query 'nodegroups' --output text 2>$null
        if ($nodeGroups) {
            return $nodeGroups -split "`t"
        }
        return @()
    } catch {
        return @()
    }
}

function Show-ClusterDetails {
    Write-Host "`n📊 Cluster Details:" -ForegroundColor Yellow
    try {
        $clusterInfo = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-cluster --name $ClusterName --region $Region --output table 2>$null
        if ($clusterInfo) {
            Write-Host $clusterInfo -ForegroundColor White
        }
    } catch {
        Write-Host "Unable to fetch cluster details" -ForegroundColor Red
    }
}

# Main monitoring loop
do {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "`n[$timestamp] Checking cluster status..." -ForegroundColor Cyan
    
    $clusterStatus = Get-ClusterStatus
    $nodeGroups = Get-NodeGroupStatus
    
    switch ($clusterStatus) {
        "CREATING" {
            Write-Host "🔄 Cluster Status: CREATING" -ForegroundColor Yellow
            Write-Host "   ⏳ Control plane is being created..." -ForegroundColor White
            Write-Host "   📝 This typically takes 10-15 minutes" -ForegroundColor Gray
        }
        "ACTIVE" {
            Write-Host "✅ Cluster Status: ACTIVE" -ForegroundColor Green
            Write-Host "   🎉 Control plane is ready!" -ForegroundColor White
            
            if ($nodeGroups.Count -eq 0) {
                Write-Host "   🔄 Node groups are being created..." -ForegroundColor Yellow
                Write-Host "   📝 This typically takes 5-10 minutes" -ForegroundColor Gray
            } else {
                Write-Host "   ✅ Node groups found: $($nodeGroups -join ', ')" -ForegroundColor Green
                
                # Check node group status
                foreach ($ng in $nodeGroups) {
                    $ngStatus = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-nodegroup --cluster-name $ClusterName --nodegroup-name $ng --region $Region --query 'nodegroup.status' --output text 2>$null
                    Write-Host "      📋 $ng`: $ngStatus" -ForegroundColor White
                }
            }
        }
        "FAILED" {
            Write-Host "❌ Cluster Status: FAILED" -ForegroundColor Red
            Write-Host "   💥 Cluster creation failed!" -ForegroundColor Red
            Show-ClusterDetails
            break
        }
        "ERROR" {
            Write-Host "❌ Unable to check cluster status" -ForegroundColor Red
            Write-Host "   🔍 Please verify AWS CLI configuration and permissions" -ForegroundColor Yellow
            break
        }
        default {
            Write-Host "🔄 Cluster Status: $clusterStatus" -ForegroundColor Yellow
        }
    }
    
    # Check if fully ready for deployment
    if ($clusterStatus -eq "ACTIVE" -and $nodeGroups.Count -gt 0) {
        $allNodesReady = $true
        foreach ($ng in $nodeGroups) {
            $ngStatus = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-nodegroup --cluster-name $ClusterName --nodegroup-name $ng --region $Region --query 'nodegroup.status' --output text 2>$null
            if ($ngStatus -ne "ACTIVE") {
                $allNodesReady = $false
                break
            }
        }
        
        if ($allNodesReady) {
            Write-Host "`n🎉 CLUSTER IS READY FOR DEPLOYMENT!" -ForegroundColor Green
            Write-Host "================================" -ForegroundColor Green
            Write-Host "✅ Control plane: ACTIVE" -ForegroundColor Green
            Write-Host "✅ Node groups: ACTIVE" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
            Write-Host "1. Run: .\scripts\deploy-services.ps1" -ForegroundColor White
            Write-Host "2. Configure Vercel DNS (see VERCEL_DNS_CONFIGURATION_GUIDE.md)" -ForegroundColor White
            Write-Host "3. Test your domains!" -ForegroundColor White
            Write-Host ""
            Write-Host "Press Ctrl+C to exit monitoring or wait for automatic exit..." -ForegroundColor Gray
            Start-Sleep 10
            break
        }
    }
    
    Write-Host "   ⏳ Checking again in 30 seconds... (Press Ctrl+C to exit)" -ForegroundColor Gray
    Start-Sleep 30
    
} while ($true)

Write-Host "`n👋 Monitoring session ended." -ForegroundColor Cyan
