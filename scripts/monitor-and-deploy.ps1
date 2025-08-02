# Node Group Monitoring and Auto-Deploy Script
# This script monitors the node group creation and automatically starts deployment when ready

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
Write-Status "Starting node group monitoring..." "Green"
Write-Status "Cluster: codai-cluster-v2"
Write-Status "Node Group: codai-workers"
Write-Status "Region: eu-west-1"
Write-Status "Check Interval: $CheckInterval seconds"

$checkCount = 0
do {
    $checkCount++
    $elapsedMinutes = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    
    Write-Status "Check #$checkCount (Elapsed: $elapsedMinutes minutes)"
    
    try {
        # Check node group status
        $nodeGroupStatus = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-nodegroup --cluster-name codai-cluster-v2 --nodegroup-name codai-workers --region eu-west-1 --query 'nodegroup.status' --output text 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Node Group Status: $nodeGroupStatus"
            
            if ($nodeGroupStatus -eq "ACTIVE") {
                Write-Success "Node group is ACTIVE!"
                
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
                        
                        if ($AutoDeploy) {
                            Write-Success "🚀 Starting automated Phase 1 deployment!"
                            Write-Status "Executing: .\scripts\deploy-phase-1-automated.ps1"
                            
                            # Execute the deployment script
                            try {
                                & ".\scripts\deploy-phase-1-automated.ps1"
                                Write-Success "Deployment script completed!"
                            } catch {
                                Write-Warning "Deployment script encountered issues: $_"
                                Write-Status "You can manually run: .\scripts\deploy-phase-1-automated.ps1"
                            }
                        } else {
                            Write-Success "Nodes are ready! You can now run: .\scripts\deploy-phase-1-automated.ps1"
                        }
                        
                        break
                    } else {
                        Write-Status "Waiting for all nodes to be Ready..."
                    }
                } else {
                    Write-Warning "Cannot check node status yet - kubectl not connected"
                }
            } elseif ($nodeGroupStatus -eq "CREATING") {
                Write-Status "Node group still creating..."
                
                # Check CloudFormation progress
                try {
                    $cfEvents = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" cloudformation describe-stack-events --stack-name eksctl-codai-cluster-v2-nodegroup-codai-workers --region eu-west-1 --max-items 3 --query 'StackEvents[*].[ResourceType,ResourceStatus,LogicalResourceId]' --output text 2>$null
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Status "Recent CloudFormation activity:"
                        $cfEvents | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
                    }
                } catch {
                    # Ignore CloudFormation query errors
                }
                
            } elseif ($nodeGroupStatus -eq "CREATE_FAILED" -or $nodeGroupStatus -eq "DEGRADED") {
                Write-Warning "Node group status: $nodeGroupStatus"
                Write-Warning "There may be an issue with node group creation."
                Write-Status "You can check the AWS console for more details."
                break
            } else {
                Write-Status "Node group status: $nodeGroupStatus"
            }
        } else {
            Write-Warning "Cannot check node group status - AWS CLI error"
        }
        
    } catch {
        Write-Warning "Error checking status: $_"
    }
    
    # Provide periodic updates
    if ($checkCount % 5 -eq 0) {
        Write-Status "Still waiting... Node groups typically take 15-25 minutes total" "Yellow"
        Write-Status "Estimated remaining time: $([math]::Max(0, 25 - $elapsedMinutes)) minutes" "Yellow"
    }
    
    Start-Sleep $CheckInterval
    
} while ($elapsedMinutes -lt 30) # Maximum 30 minutes wait

if ($elapsedMinutes -ge 30) {
    Write-Warning "Timeout reached (30 minutes). Node group may need manual intervention."
    Write-Status "Check AWS console or run: aws eks describe-nodegroup --cluster-name codai-cluster-v2 --nodegroup-name codai-workers --region eu-west-1"
}

Write-Status "Monitoring script completed." "Green"
