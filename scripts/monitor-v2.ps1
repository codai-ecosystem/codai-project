# Monitor new node group (v2) and auto-deploy
param(
    [Parameter(Mandatory=$false)]
    [switch]$AutoDeploy = $true,
    
    [Parameter(Mandatory=$false)]
    [int]$CheckInterval = 30
)

$ErrorActionPreference = "Continue"

function Write-Status {
    param($Message, $Color = "Cyan")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] 🔄 $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] ✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] ⚠️ $Message" -ForegroundColor Yellow
}

$startTime = Get-Date
Write-Status "Starting node group v2 monitoring..." "Green"
Write-Status "Cluster: codai-cluster-v2"
Write-Status "Node Group: codai-workers-v2 (optimized config)"
Write-Status "Region: eu-west-1"

$checkCount = 0
do {
    $checkCount++
    $elapsedMinutes = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    
    Write-Status "Check #$checkCount (Elapsed: $elapsedMinutes minutes)"
    
    try {
        # Check node group status
        $nodeGroupStatus = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-nodegroup --cluster-name codai-cluster-v2 --nodegroup-name codai-workers-v2 --region eu-west-1 --query 'nodegroup.status' --output text 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Node Group v2 Status: $nodeGroupStatus"
            
            if ($nodeGroupStatus -eq "ACTIVE") {
                Write-Success "Node group v2 is ACTIVE!"
                
                # Check if nodes are ready
                Write-Status "Checking node readiness..."
                $nodes = kubectl get nodes --no-headers 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    $nodeCount = ($nodes | Measure-Object).Count
                    $readyNodes = $nodes | Where-Object { $_ -match "\sReady\s" }
                    $readyCount = ($readyNodes | Measure-Object).Count
                    
                    Write-Status "Nodes: $readyCount/$nodeCount Ready"
                    
                    if ($readyCount -eq $nodeCount -and $nodeCount -gt 0) {
                        Write-Success "All $nodeCount nodes are Ready!"
                        Write-Success "🎉 READY FOR PHASE 1 DEPLOYMENT!"
                        
                        if ($AutoDeploy) {
                            Write-Success "🚀 Starting automated Phase 1 deployment!"
                            Write-Status "Executing: .\scripts\deploy-phase-1-automated.ps1"
                            
                            try {
                                & ".\scripts\deploy-phase-1-automated.ps1"
                                Write-Success "Deployment script completed!"
                            } catch {
                                Write-Warning "Deployment script encountered issues: $_"
                                Write-Status "You can manually run: .\scripts\deploy-phase-1-automated.ps1"
                            }
                        } else {
                            Write-Success "Ready for deployment! Run: .\scripts\deploy-phase-1-automated.ps1"
                        }
                        
                        break
                    } else {
                        Write-Status "Waiting for all nodes to be Ready..."
                    }
                } else {
                    Write-Warning "Cannot check node status yet - kubectl not connected"
                }
            } elseif ($nodeGroupStatus -eq "CREATING") {
                Write-Status "Node group v2 still creating..."
                
            } elseif ($nodeGroupStatus -eq "CREATE_FAILED" -or $nodeGroupStatus -eq "DEGRADED") {
                Write-Warning "Node group v2 status: $nodeGroupStatus"
                Write-Warning "Issue with node group v2 creation."
                break
            } else {
                Write-Status "Node group v2 status: $nodeGroupStatus"
            }
        } else {
            Write-Warning "Cannot check node group v2 status - checking if it exists..."
        }
        
    } catch {
        Write-Warning "Error checking status: $_"
    }
    
    # Provide periodic updates
    if ($checkCount % 3 -eq 0) {
        Write-Status "Progress: Optimized configuration should be faster and more reliable" "Magenta"
        Write-Status "Ready to deploy 8 Phase 1 domains once nodes are ready" "Cyan"
    }
    
    Start-Sleep $CheckInterval
    
} while ($elapsedMinutes -lt 25) # Maximum 25 minutes wait

if ($elapsedMinutes -ge 25) {
    Write-Warning "Timeout reached (25 minutes). Check manually."
}

Write-Status "Monitoring script completed." "Green"
