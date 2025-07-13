# ROMAI Ultimate MCP Server - Disaster Recovery Script
# Automated backup, monitoring, and recovery procedures

# Configuration
$NAMESPACE = "romai-production"
$APP_NAME = "romai-mcp"
$BACKUP_STORAGE = "romai-backup-storage"
$MONITORING_INTERVAL = 30
$RECOVERY_TIMEOUT = 600
$HEALTH_CHECK_RETRIES = 5

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"
$Magenta = "Magenta"

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to console
    $color = switch ($Level) {
        "ERROR" { $Red }
        "WARN" { $Yellow }
        "INFO" { $White }
        "SUCCESS" { $Green }
        "DEBUG" { $Cyan }
        default { $White }
    }
    Write-Host $logEntry -ForegroundColor $color
    
    # Write to log file
    $logEntry | Out-File -FilePath "disaster-recovery.log" -Append -Encoding UTF8
}

function Test-SystemHealth {
    Write-Log "🏥 Performing comprehensive system health check..." "INFO"
    
    $healthStatus = @{
        kubernetes = $false
        application = $false
        database = $false
        storage = $false
        network = $false
        overall = $false
    }
    
    try {
        # Test Kubernetes cluster
        Write-Log "🔧 Testing Kubernetes cluster connectivity..." "DEBUG"
        $nodes = kubectl get nodes --no-headers 2>$null
        if ($LASTEXITCODE -eq 0 -and $nodes) {
            $healthStatus.kubernetes = $true
            Write-Log "✅ Kubernetes cluster is healthy" "SUCCESS"
        } else {
            Write-Log "❌ Kubernetes cluster connection failed" "ERROR"
        }
        
        # Test application pods
        Write-Log "🚀 Testing application pod health..." "DEBUG"
        $pods = kubectl get pods -n $NAMESPACE -l app=$APP_NAME --field-selector=status.phase=Running --no-headers 2>$null
        if ($LASTEXITCODE -eq 0 -and $pods) {
            $runningPods = ($pods | Measure-Object).Count
            if ($runningPods -gt 0) {
                $healthStatus.application = $true
                Write-Log "✅ Application pods are running ($runningPods pods)" "SUCCESS"
            } else {
                Write-Log "❌ No application pods are running" "ERROR"
            }
        } else {
            Write-Log "❌ Cannot retrieve application pod status" "ERROR"
        }
        
        # Test application endpoints
        if ($healthStatus.application) {
            Write-Log "🌐 Testing application endpoints..." "DEBUG"
            try {
                $portForwardJob = Start-Job -ScriptBlock {
                    param($Namespace, $AppName)
                    kubectl port-forward -n $Namespace service/$AppName-service 8090:80
                } -ArgumentList $NAMESPACE, $APP_NAME
                
                Start-Sleep -Seconds 5
                
                $healthResponse = Invoke-RestMethod -Uri "http://localhost:8090/health" -Method Get -TimeoutSec 10
                if ($healthResponse.status -eq "ok") {
                    Write-Log "✅ Application endpoints are responding" "SUCCESS"
                } else {
                    $healthStatus.application = $false
                    Write-Log "❌ Application endpoints are not healthy" "ERROR"
                }
                
                Stop-Job -Job $portForwardJob -PassThru | Remove-Job
            } catch {
                $healthStatus.application = $false
                Write-Log "❌ Application endpoint test failed: $($_.Exception.Message)" "ERROR"
                try { Stop-Job -Job $portForwardJob -PassThru | Remove-Job } catch {}
            }
        }
        
        # Test persistent storage
        Write-Log "💾 Testing persistent storage..." "DEBUG"
        $pvcs = kubectl get pvc -n $NAMESPACE --no-headers 2>$null
        if ($LASTEXITCODE -eq 0) {
            $healthStatus.storage = $true
            Write-Log "✅ Persistent storage is accessible" "SUCCESS"
        } else {
            Write-Log "⚠️  No persistent storage found (may be normal)" "WARN"
            $healthStatus.storage = $true  # Not critical for stateless app
        }
        
        # Test network connectivity
        Write-Log "🌐 Testing network connectivity..." "DEBUG"
        $services = kubectl get services -n $NAMESPACE --no-headers 2>$null
        if ($LASTEXITCODE -eq 0 -and $services) {
            $healthStatus.network = $true
            Write-Log "✅ Network services are accessible" "SUCCESS"
        } else {
            Write-Log "❌ Network connectivity issues detected" "ERROR"
        }
        
        # Overall health assessment
        $healthStatus.overall = $healthStatus.kubernetes -and $healthStatus.application -and $healthStatus.network
        
        if ($healthStatus.overall) {
            Write-Log "🎉 Overall system health: HEALTHY" "SUCCESS"
        } else {
            Write-Log "🚨 Overall system health: UNHEALTHY" "ERROR"
        }
        
        return $healthStatus
    } catch {
        Write-Log "❌ Health check failed: $($_.Exception.Message)" "ERROR"
        return $healthStatus
    }
}

function Backup-ApplicationState {
    Write-Log "💾 Creating application state backup..." "INFO"
    
    try {
        $backupTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupDir = "backup-$backupTimestamp"
        
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Backup Kubernetes manifests
        Write-Log "📋 Backing up Kubernetes manifests..." "DEBUG"
        kubectl get deployment $APP_NAME-blue -n $NAMESPACE -o yaml > "$backupDir/deployment-blue.yaml" 2>$null
        kubectl get deployment $APP_NAME-green -n $NAMESPACE -o yaml > "$backupDir/deployment-green.yaml" 2>$null
        kubectl get service $APP_NAME-service -n $NAMESPACE -o yaml > "$backupDir/service-main.yaml" 2>$null
        kubectl get configmap -n $NAMESPACE -o yaml > "$backupDir/configmaps.yaml" 2>$null
        kubectl get secret -n $NAMESPACE -o yaml > "$backupDir/secrets.yaml" 2>$null
        
        # Backup application logs
        Write-Log "📝 Backing up application logs..." "DEBUG"
        $pods = kubectl get pods -n $NAMESPACE -l app=$APP_NAME --no-headers -o custom-columns=":metadata.name" 2>$null
        if ($pods) {
            $podArray = $pods -split "`n" | Where-Object { $_ -ne "" }
            foreach ($pod in $podArray) {
                kubectl logs $pod -n $NAMESPACE > "$backupDir/logs-$pod.log" 2>$null
            }
        }
        
        # Backup configuration files
        Write-Log "⚙️ Backing up configuration files..." "DEBUG"
        if (Test-Path "package.json") { Copy-Item "package.json" "$backupDir/" }
        if (Test-Path "tsconfig.json") { Copy-Item "tsconfig.json" "$backupDir/" }
        if (Test-Path ".env") { Copy-Item ".env" "$backupDir/" }
        
        # Create backup metadata
        $backupMetadata = @{
            timestamp = $backupTimestamp
            namespace = $NAMESPACE
            appName = $APP_NAME
            backupType = "disaster-recovery"
            files = Get-ChildItem $backupDir | Select-Object Name, Length
        }
        
        $backupMetadata | ConvertTo-Json -Depth 3 | Out-File "$backupDir/backup-metadata.json" -Encoding UTF8
        
        # Compress backup
        Write-Log "🗜️ Compressing backup archive..." "DEBUG"
        $archiveName = "romai-backup-$backupTimestamp.zip"
        Compress-Archive -Path $backupDir -DestinationPath $archiveName -Force
        
        # Cleanup temporary directory
        Remove-Item -Path $backupDir -Recurse -Force
        
        Write-Log "✅ Backup created successfully: $archiveName" "SUCCESS"
        return $archiveName
    } catch {
        Write-Log "❌ Backup creation failed: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Restore-FromBackup {
    param([string]$BackupFile)
    
    Write-Log "🔄 Restoring from backup: $BackupFile..." "INFO"
    
    try {
        if (-not (Test-Path $BackupFile)) {
            throw "Backup file not found: $BackupFile"
        }
        
        # Extract backup
        $restoreDir = "restore-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Expand-Archive -Path $BackupFile -DestinationPath $restoreDir -Force
        
        # Read backup metadata
        $metadataPath = "$restoreDir/backup-metadata.json"
        if (Test-Path $metadataPath) {
            $metadata = Get-Content $metadataPath | ConvertFrom-Json
            Write-Log "📋 Restoring backup from: $($metadata.timestamp)" "INFO"
        }
        
        # Restore Kubernetes resources
        Write-Log "🔧 Restoring Kubernetes resources..." "DEBUG"
        $manifestFiles = Get-ChildItem "$restoreDir/*.yaml"
        foreach ($manifest in $manifestFiles) {
            Write-Log "Applying manifest: $($manifest.Name)" "DEBUG"
            kubectl apply -f $manifest.FullName 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✅ Applied: $($manifest.Name)" "SUCCESS"
            } else {
                Write-Log "⚠️  Failed to apply: $($manifest.Name)" "WARN"
            }
        }
        
        # Wait for restoration to complete
        Write-Log "⏳ Waiting for restoration to complete..." "INFO"
        Start-Sleep -Seconds 30
        
        # Verify restoration
        $healthStatus = Test-SystemHealth
        if ($healthStatus.overall) {
            Write-Log "✅ Restoration completed successfully" "SUCCESS"
            return $true
        } else {
            Write-Log "⚠️  Restoration completed but system health check failed" "WARN"
            return $false
        }
        
    } catch {
        Write-Log "❌ Restoration failed: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        # Cleanup restore directory
        if (Test-Path $restoreDir) {
            Remove-Item -Path $restoreDir -Recurse -Force
        }
    }
}

function Recover-Application {
    param([string]$Strategy = "auto")
    
    Write-Log "🚨 Starting application recovery procedure..." "INFO"
    Write-Log "🔧 Recovery strategy: $Strategy" "INFO"
    
    try {
        # Create pre-recovery backup
        Write-Log "💾 Creating pre-recovery backup..." "INFO"
        $preRecoveryBackup = Backup-ApplicationState
        
        switch ($Strategy.ToLower()) {
            "restart" {
                Write-Log "🔄 Executing restart recovery..." "INFO"
                
                # Restart all pods
                kubectl rollout restart deployment -n $NAMESPACE 2>$null
                
                # Wait for rollout
                Write-Log "⏳ Waiting for deployment restart..." "INFO"
                kubectl rollout status deployment -n $NAMESPACE --timeout=${RECOVERY_TIMEOUT}s 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "✅ Restart recovery completed" "SUCCESS"
                    return $true
                } else {
                    Write-Log "❌ Restart recovery failed" "ERROR"
                    return $false
                }
            }
            
            "redeploy" {
                Write-Log "🚀 Executing redeployment recovery..." "INFO"
                
                # Get current image tag
                $currentImage = kubectl get deployment $APP_NAME-blue -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}' 2>$null
                if (-not $currentImage) {
                    $currentImage = kubectl get deployment $APP_NAME-green -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}' 2>$null
                }
                
                if ($currentImage) {
                    $imageTag = $currentImage.Split(':')[-1]
                    Write-Log "🏷️ Redeploying with image tag: $imageTag" "INFO"
                    
                    # Execute blue-green deployment
                    $deployScript = ".\blue-green-deploy.ps1"
                    if (Test-Path $deployScript) {
                        & $deployScript $imageTag
                        return $LASTEXITCODE -eq 0
                    } else {
                        Write-Log "❌ Blue-green deployment script not found" "ERROR"
                        return $false
                    }
                } else {
                    Write-Log "❌ Cannot determine current image tag" "ERROR"
                    return $false
                }
            }
            
            "rollback" {
                Write-Log "⏪ Executing rollback recovery..." "INFO"
                
                # Find available backups
                $backups = Get-ChildItem "romai-backup-*.zip" | Sort-Object LastWriteTime -Descending
                if ($backups.Count -gt 0) {
                    $latestBackup = $backups[0].Name
                    Write-Log "📦 Rolling back to: $latestBackup" "INFO"
                    return Restore-FromBackup -BackupFile $latestBackup
                } else {
                    Write-Log "❌ No backup files found for rollback" "ERROR"
                    return $false
                }
            }
            
            "auto" {
                Write-Log "🤖 Executing automatic recovery..." "INFO"
                
                # Try restart first
                Write-Log "🔄 Attempting restart recovery..." "INFO"
                if (Recover-Application -Strategy "restart") {
                    return $true
                }
                
                # If restart fails, try redeployment
                Write-Log "🚀 Restart failed, attempting redeployment..." "WARN"
                if (Recover-Application -Strategy "redeploy") {
                    return $true
                }
                
                # If redeployment fails, try rollback
                Write-Log "⏪ Redeployment failed, attempting rollback..." "WARN"
                return Recover-Application -Strategy "rollback"
            }
            
            default {
                Write-Log "❌ Unknown recovery strategy: $Strategy" "ERROR"
                return $false
            }
        }
    } catch {
        Write-Log "❌ Recovery procedure failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Start-HealthMonitoring {
    param([int]$Duration = 3600)  # Default 1 hour
    
    Write-Log "👁️ Starting health monitoring for $Duration seconds..." "INFO"
    
    $startTime = Get-Date
    $endTime = $startTime.AddSeconds($Duration)
    $healthHistory = @()
    
    try {
        while ((Get-Date) -lt $endTime) {
            $healthStatus = Test-SystemHealth
            $healthHistory += @{
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                status = $healthStatus
            }
            
            if (-not $healthStatus.overall) {
                Write-Log "🚨 Health check failed! Initiating recovery..." "ERROR"
                
                if (Recover-Application -Strategy "auto") {
                    Write-Log "✅ Automatic recovery successful" "SUCCESS"
                } else {
                    Write-Log "❌ Automatic recovery failed" "ERROR"
                    
                    # Send alert (placeholder for notification system)
                    Write-Log "📢 ALERT: System recovery failed - manual intervention required" "ERROR"
                }
            }
            
            Write-Log "😴 Waiting $MONITORING_INTERVAL seconds before next check..." "DEBUG"
            Start-Sleep -Seconds $MONITORING_INTERVAL
        }
        
        Write-Log "✅ Health monitoring completed" "SUCCESS"
        
        # Generate monitoring report
        $report = @{
            monitoringPeriod = @{
                start = $startTime.ToString("yyyy-MM-dd HH:mm:ss")
                end = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                duration = $Duration
            }
            healthChecks = $healthHistory.Count
            failedChecks = ($healthHistory | Where-Object { -not $_.status.overall }).Count
            successRate = [math]::Round((($healthHistory.Count - ($healthHistory | Where-Object { -not $_.status.overall }).Count) / $healthHistory.Count) * 100, 2)
            healthHistory = $healthHistory
        }
        
        $reportJson = $report | ConvertTo-Json -Depth 4
        $reportPath = "health-monitoring-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        $reportJson | Out-File -FilePath $reportPath -Encoding UTF8
        
        Write-Log "📊 Monitoring report saved to: $reportPath" "INFO"
        Write-Log "📈 Success rate: $($report.successRate)%" "INFO"
        
    } catch {
        Write-Log "❌ Health monitoring failed: $($_.Exception.Message)" "ERROR"
    }
}

function Show-DisasterRecoveryMenu {
    Write-Host ""
    Write-Host "🚨 ROMAI Ultimate MCP Server - Disaster Recovery Console" -ForegroundColor $Cyan
    Write-Host "========================================================" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "1. System Health Check" -ForegroundColor $Green
    Write-Host "2. Create Backup" -ForegroundColor $Blue
    Write-Host "3. Restore from Backup" -ForegroundColor $Yellow
    Write-Host "4. Automatic Recovery" -ForegroundColor $Magenta
    Write-Host "5. Manual Recovery (Restart)" -ForegroundColor $Yellow
    Write-Host "6. Manual Recovery (Redeploy)" -ForegroundColor $Yellow
    Write-Host "7. Manual Recovery (Rollback)" -ForegroundColor $Yellow
    Write-Host "8. Start Health Monitoring" -ForegroundColor $Cyan
    Write-Host "9. Exit" -ForegroundColor $Red
    Write-Host ""
}

function Start-DisasterRecoveryConsole {
    Write-Log "🚨 ROMAI Disaster Recovery Console Started" "INFO"
    
    while ($true) {
        Show-DisasterRecoveryMenu
        $choice = Read-Host "Select an option (1-9)"
        
        switch ($choice) {
            "1" {
                Write-Host ""
                Test-SystemHealth | Out-Null
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "2" {
                Write-Host ""
                $backup = Backup-ApplicationState
                if ($backup) {
                    Write-Host "Backup created: $backup" -ForegroundColor $Green
                }
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "3" {
                Write-Host ""
                $backupFile = Read-Host "Enter backup file name"
                if ($backupFile) {
                    Restore-FromBackup -BackupFile $backupFile | Out-Null
                }
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "4" {
                Write-Host ""
                Recover-Application -Strategy "auto" | Out-Null
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "5" {
                Write-Host ""
                Recover-Application -Strategy "restart" | Out-Null
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "6" {
                Write-Host ""
                Recover-Application -Strategy "redeploy" | Out-Null
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "7" {
                Write-Host ""
                Recover-Application -Strategy "rollback" | Out-Null
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "8" {
                Write-Host ""
                $duration = Read-Host "Enter monitoring duration in seconds (default: 3600)"
                if (-not $duration) { $duration = 3600 }
                Start-HealthMonitoring -Duration ([int]$duration)
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            
            "9" {
                Write-Log "👋 Disaster Recovery Console Exited" "INFO"
                exit 0
            }
            
            default {
                Write-Host "Invalid option. Please select 1-9." -ForegroundColor $Red
                Start-Sleep -Seconds 1
            }
        }
    }
}

# Script execution based on parameters
if ($args.Count -eq 0) {
    # Interactive mode
    Start-DisasterRecoveryConsole
} elseif ($args[0] -eq "health") {
    # Health check mode
    $healthStatus = Test-SystemHealth
    exit $(if ($healthStatus.overall) { 0 } else { 1 })
} elseif ($args[0] -eq "backup") {
    # Backup mode
    $backup = Backup-ApplicationState
    if ($backup) {
        Write-Host $backup
        exit 0
    } else {
        exit 1
    }
} elseif ($args[0] -eq "recover" -and $args[1]) {
    # Recovery mode
    $success = Recover-Application -Strategy $args[1]
    exit $(if ($success) { 0 } else { 1 })
} elseif ($args[0] -eq "monitor" -and $args[1]) {
    # Monitoring mode
    Start-HealthMonitoring -Duration ([int]$args[1])
    exit 0
} else {
    Write-Host "Usage:" -ForegroundColor $Yellow
    Write-Host "  .\disaster-recovery.ps1                    # Interactive console" -ForegroundColor $White
    Write-Host "  .\disaster-recovery.ps1 health            # Health check only" -ForegroundColor $White
    Write-Host "  .\disaster-recovery.ps1 backup            # Create backup only" -ForegroundColor $White
    Write-Host "  .\disaster-recovery.ps1 recover <strategy> # Recovery (auto/restart/redeploy/rollback)" -ForegroundColor $White
    Write-Host "  .\disaster-recovery.ps1 monitor <seconds> # Health monitoring" -ForegroundColor $White
    exit 1
}
